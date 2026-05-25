package com.atharsense.lr.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.atharsense.lr.domain.*;
import com.atharsense.lr.domain.enumeration.*;
import com.atharsense.lr.repository.*;
import com.atharsense.lr.service.dto.CreateGoalRequest;
import com.atharsense.lr.web.rest.errors.BadRequestAlertException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Unit tests for Goal family sharing logic.
 *
 * Scenario under test:
 *   1. Parent creates a FAMILY_SHARED goal → syncFamilyShares() should create GoalShare for family members
 *   2. Child is added after the goal → backdateSharesForNewMember() should create the missing share
 *   3. findByCurrentUser() for a child should include FAMILY_SHARED goals (via shares OR direct family query)
 *   4. PRIVATE goal should NOT be visible to child
 */
@ExtendWith(MockitoExtension.class)
class GoalFamilySharingTest {

    // ── Repositories (mocked) ────────────────────────────────────────────────
    @Mock GoalRepository goalRepository;
    @Mock GoalMilestoneRepository milestoneRepository;
    @Mock GoalUpdateRepository goalUpdateRepository;
    @Mock ExtendedUserRepository extendedUserRepository;
    @Mock UserRepository userRepository;
    @Mock PillarRepository pillarRepository;
    @Mock GoalShareRepository goalShareRepository;

    // ── System under test ────────────────────────────────────────────────────
    GoalService goalService;

    // ── Fixture objects ──────────────────────────────────────────────────────
    Family family;
    User parentUser;
    ExtendedUser parentExtUser;
    User childUser;
    ExtendedUser childExtUser;
    Goal familySharedGoal;
    Goal privateGoal;

    @BeforeEach
    void setUp() {
        goalService = new GoalService(
            goalRepository, milestoneRepository, goalUpdateRepository,
            extendedUserRepository, userRepository, pillarRepository, goalShareRepository
        );

        // Family
        family = new Family();
        family.setId(1L);
        family.setName("Test Family");

        // Parent (ROLE_PARENT)
        parentUser = new User();
        parentUser.setId(10L);
        parentUser.setLogin("parent");
        parentUser.setFamily(family);

        parentExtUser = new ExtendedUser();
        parentExtUser.setId(100L);
        parentExtUser.setUser(parentUser);
        parentExtUser.setFamily(family);
        parentExtUser.setFullName("Parent User");
        parentExtUser.setActive(true);

        // Child (ROLE_CHILD) — belongs to same family
        childUser = new User();
        childUser.setId(20L);
        childUser.setLogin("child");
        childUser.setFamily(family);           // ← set AFTER the fix
        childUser.setCreatedBy("parent");       // ← set by JHipster auditing

        // Add ROLE_CHILD authority
        Authority childRole = new Authority();
        childRole.setName("ROLE_CHILD");
        childUser.setAuthorities(Collections.singleton(childRole));

        childExtUser = new ExtendedUser();
        childExtUser.setId(200L);
        childExtUser.setUser(childUser);
        childExtUser.setFamily(family);        // ← set AFTER the fix
        childExtUser.setFullName("Child User");
        childExtUser.setActive(true);

        // FAMILY_SHARED goal owned by parent
        familySharedGoal = new Goal();
        familySharedGoal.setId(1L);
        familySharedGoal.setTitle("Family Holiday Plan");
        familySharedGoal.setGoalType(GoalType.FAMILY);
        familySharedGoal.setStatus(GoalStatus.IN_PROGRESS);
        familySharedGoal.setPriority(GoalPriority.MEDIUM);
        familySharedGoal.setVisibility(GoalVisibility.FAMILY_SHARED);
        familySharedGoal.setProgressMode(GoalProgressMode.MANUAL_PERCENTAGE);
        familySharedGoal.setIsArchived(false);
        familySharedGoal.setOwner(parentExtUser);

        // PRIVATE goal owned by parent
        privateGoal = new Goal();
        privateGoal.setId(2L);
        privateGoal.setTitle("Parent Secret Goal");
        privateGoal.setGoalType(GoalType.PERSONAL);
        privateGoal.setStatus(GoalStatus.IN_PROGRESS);
        privateGoal.setPriority(GoalPriority.HIGH);
        privateGoal.setVisibility(GoalVisibility.PRIVATE);
        privateGoal.setProgressMode(GoalProgressMode.MANUAL_PERCENTAGE);
        privateGoal.setIsArchived(false);
        privateGoal.setOwner(parentExtUser);
    }

    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("syncFamilyShares — called when FAMILY_SHARED goal is created/updated")
    class SyncFamilySharesTests {

        @Test
        @DisplayName("Creates GoalShare for every family member (excluding owner)")
        void createGoal_FamilyShared_shouldCreateShareForFamilyMembers() {
            // Arrange – authenticate as parent
            authenticateAs("parent");

            // extendedUserRepository returns parentExtUser when resolving current owner
            when(userRepository.findOneByLogin("parent")).thenReturn(Optional.of(parentUser));
            when(extendedUserRepository.findOneByUserId(10L)).thenReturn(Optional.of(parentExtUser));

            // goalRepository.save returns entity with ID
            when(goalRepository.save(any(Goal.class))).thenAnswer(inv -> {
                Goal g = inv.getArgument(0);
                g.setId(99L);
                return g;
            });

            // syncFamilyShares re-fetches owner
            when(extendedUserRepository.findById(100L)).thenReturn(Optional.of(parentExtUser));
            // Family members (excluding owner)
            when(extendedUserRepository.findByFamilyId(1L)).thenReturn(List.of(parentExtUser, childExtUser));
            // No existing shares yet
            when(goalShareRepository.findByGoalId(99L)).thenReturn(Collections.emptyList());
            when(goalShareRepository.save(any(GoalShare.class))).thenAnswer(inv -> inv.getArgument(0));

            CreateGoalRequest req = buildFamilySharedRequest();

            // Act
            Goal result = goalService.createGoal(req);

            // Assert — one GoalShare created for childExtUser (not owner)
            ArgumentCaptor<GoalShare> shareCaptor = ArgumentCaptor.forClass(GoalShare.class);
            verify(goalShareRepository, times(1)).save(shareCaptor.capture());
            GoalShare createdShare = shareCaptor.getValue();

            assertThat(createdShare.getSharedWith().getId()).isEqualTo(200L);
            assertThat(createdShare.getCanEdit()).isTrue();
        }

        @Test
        @DisplayName("Removes GoalShare records when visibility changes from FAMILY_SHARED to PRIVATE")
        void updateGoal_VisibilityChangedToPrivate_shouldRemoveAllShares() {
            // Arrange – authenticate as parent, goal 1 is FAMILY_SHARED → update to PRIVATE
            authenticateAs("parent");

            when(userRepository.findOneByLogin("parent")).thenReturn(Optional.of(parentUser));

            // requireGoalWriteAccess — goal exists and is owned by parent
            when(goalRepository.findById(1L)).thenReturn(Optional.of(familySharedGoal));
            when(goalRepository.save(any(Goal.class))).thenAnswer(inv -> inv.getArgument(0));

            // Simulate existing share for child (syncFamilyShares else-branch reads this)
            GoalShare existingShare = new GoalShare();
            existingShare.setId(5L);
            existingShare.setGoal(familySharedGoal);
            existingShare.setSharedWith(childExtUser);
            existingShare.setCanEdit(true);
            when(goalShareRepository.findByGoalId(1L)).thenReturn(List.of(existingShare));

            doNothing().when(goalShareRepository).deleteByGoalId(anyLong());

            CreateGoalRequest privateReq = buildPrivateRequest();

            // Act
            goalService.updateGoal(1L, privateReq);

            // Assert — deleteByGoalId called because visibility is now PRIVATE
            verify(goalShareRepository).deleteByGoalId(1L);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("backdateSharesForNewMember — called when a new child joins the family")
    class BackdateSharesTests {

        @Test
        @DisplayName("Creates GoalShare for the new child for all existing FAMILY_SHARED goals")
        void backdateShares_shouldCreateShareForExistingFamilyGoals() {
            // Arrange
            when(extendedUserRepository.findOneByUserId(20L)).thenReturn(Optional.of(childExtUser));
            when(goalRepository.findByOwnerUserFamilyIdAndVisibilityAndIsArchivedFalseOrderByCreatedDateDesc(
                1L, GoalVisibility.FAMILY_SHARED))
                .thenReturn(List.of(familySharedGoal));

            // No existing share for child yet
            when(goalShareRepository.findByGoalIdAndSharedWithUserLogin(1L, "child"))
                .thenReturn(Optional.empty());
            when(goalShareRepository.save(any(GoalShare.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            goalService.backdateSharesForNewMember(20L, 1L);

            // Assert — one share created for the child
            ArgumentCaptor<GoalShare> captor = ArgumentCaptor.forClass(GoalShare.class);
            verify(goalShareRepository, times(1)).save(captor.capture());
            GoalShare created = captor.getValue();

            assertThat(created.getSharedWith().getId()).isEqualTo(200L);
            assertThat(created.getGoal().getId()).isEqualTo(1L);
            assertThat(created.getCanEdit()).isTrue();
        }

        @Test
        @DisplayName("Does NOT create duplicate share if it already exists")
        void backdateShares_shouldNotDuplicateExistingShare() {
            // Arrange
            when(extendedUserRepository.findOneByUserId(20L)).thenReturn(Optional.of(childExtUser));
            when(goalRepository.findByOwnerUserFamilyIdAndVisibilityAndIsArchivedFalseOrderByCreatedDateDesc(
                1L, GoalVisibility.FAMILY_SHARED))
                .thenReturn(List.of(familySharedGoal));

            // Share already exists
            GoalShare existingShare = new GoalShare();
            existingShare.setId(9L);
            existingShare.setGoal(familySharedGoal);
            existingShare.setSharedWith(childExtUser);
            when(goalShareRepository.findByGoalIdAndSharedWithUserLogin(1L, "child"))
                .thenReturn(Optional.of(existingShare));

            // Act
            goalService.backdateSharesForNewMember(20L, 1L);

            // Assert — no save called because share already exists
            verify(goalShareRepository, never()).save(any());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("findByCurrentUser — child should see FAMILY_SHARED goals")
    class FindByCurrentUserTests {

        @Test
        @DisplayName("Child can see FAMILY_SHARED goal via GoalShare record")
        void child_canSeeGoal_viaShareRecord() {
            // Arrange – child has no own goals but has a GoalShare for parent's goal
            authenticateAs("child");

            when(userRepository.findOneByLogin("child")).thenReturn(Optional.of(childUser));
            when(goalRepository.findByOwnerUserLoginAndIsArchivedFalseOrderByCreatedDateDesc("child"))
                .thenReturn(Collections.emptyList());

            GoalShare share = new GoalShare();
            share.setId(10L);
            share.setGoal(familySharedGoal);
            share.setSharedWith(childExtUser);
            share.setCanEdit(true);
            when(goalShareRepository.findBySharedWithUserLogin("child")).thenReturn(List.of(share));

            // resolveCurrentUserFamilyId — child.User.family is set
            // (No extra invocations needed since userRepository.findOneByLogin already stubbed)

            // Act
            List<Goal> result = goalService.findByCurrentUser(false);

            // Assert
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getId()).isEqualTo(1L);
            assertThat(result.get(0).getSharedWithMe()).isTrue();
            assertThat(result.get(0).getCanEditShared()).isTrue();
        }

        @Test
        @DisplayName("Child can see FAMILY_SHARED goal via direct family query (no GoalShare record exists)")
        void child_canSeeGoal_viaDirectFamilyQuery_evenWithoutShareRecord() {
            // Arrange – simulate the broken state: no share record, but same family
            authenticateAs("child");

            when(userRepository.findOneByLogin("child")).thenReturn(Optional.of(childUser));
            when(goalRepository.findByOwnerUserLoginAndIsArchivedFalseOrderByCreatedDateDesc("child"))
                .thenReturn(Collections.emptyList());

            // No GoalShare records for child yet
            when(goalShareRepository.findBySharedWithUserLogin("child")).thenReturn(Collections.emptyList());

            // Direct family query returns the shared goal
            when(goalRepository.findByOwnerUserFamilyIdAndVisibilityAndIsArchivedFalseOrderByCreatedDateDesc(
                1L, GoalVisibility.FAMILY_SHARED))
                .thenReturn(List.of(familySharedGoal));

            // Act
            List<Goal> result = goalService.findByCurrentUser(false);

            // Assert — goal found via belt-and-suspenders family path
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getId()).isEqualTo(1L);
            assertThat(result.get(0).getSharedWithMe()).isTrue();
            assertThat(result.get(0).getCanEditShared()).isTrue();
        }

        @Test
        @DisplayName("Child CANNOT see PRIVATE goals that belong to the parent")
        void child_cannotSee_privateGoal() {
            // Arrange
            authenticateAs("child");

            when(userRepository.findOneByLogin("child")).thenReturn(Optional.of(childUser));
            when(goalRepository.findByOwnerUserLoginAndIsArchivedFalseOrderByCreatedDateDesc("child"))
                .thenReturn(Collections.emptyList());

            // No shares
            when(goalShareRepository.findBySharedWithUserLogin("child")).thenReturn(Collections.emptyList());

            // Direct family query — only FAMILY_SHARED goals returned (PRIVATE excluded by query)
            when(goalRepository.findByOwnerUserFamilyIdAndVisibilityAndIsArchivedFalseOrderByCreatedDateDesc(
                1L, GoalVisibility.FAMILY_SHARED))
                .thenReturn(Collections.emptyList()); // no FAMILY_SHARED goals

            // Act
            List<Goal> result = goalService.findByCurrentUser(false);

            // Assert
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Parent owns the goal — does NOT see it as shared (own goal only)")
        void parent_seesOwnGoal_notShared() {
            // Arrange
            authenticateAs("parent");

            when(userRepository.findOneByLogin("parent")).thenReturn(Optional.of(parentUser));
            when(goalRepository.findByOwnerUserLoginAndIsArchivedFalseOrderByCreatedDateDesc("parent"))
                .thenReturn(List.of(familySharedGoal, privateGoal));

            when(goalShareRepository.findBySharedWithUserLogin("parent")).thenReturn(Collections.emptyList());

            // Direct family query — parent owns these, they're already in 'owned'
            when(goalRepository.findByOwnerUserFamilyIdAndVisibilityAndIsArchivedFalseOrderByCreatedDateDesc(
                1L, GoalVisibility.FAMILY_SHARED))
                .thenReturn(List.of(familySharedGoal)); // already in combinedIds → deduped

            // Act
            List<Goal> result = goalService.findByCurrentUser(false);

            // Assert — 2 own goals, none marked as shared
            assertThat(result).hasSize(2);
            assertThat(result).allMatch(g -> !Boolean.TRUE.equals(g.getSharedWithMe()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("resolveCurrentUserFamilyId — family ID resolution for parent and child")
    class ResolveFamilyIdTests {

        @Test
        @DisplayName("Parent with User.family_id: returns family ID directly")
        void parent_resolvesFamilyId_viaUserFamily() {
            when(userRepository.findOneByLogin("parent")).thenReturn(Optional.of(parentUser));

            Long familyId = goalService.resolveCurrentUserFamilyId("parent");

            assertThat(familyId).isEqualTo(1L);
        }

        @Test
        @DisplayName("Child with User.family_id set: returns family ID directly")
        void child_resolvesFamilyId_viaOwnUserFamily() {
            // child.User.family is set (after the createChild fix)
            when(userRepository.findOneByLogin("child")).thenReturn(Optional.of(childUser));

            Long familyId = goalService.resolveCurrentUserFamilyId("child");

            assertThat(familyId).isEqualTo(1L);
        }

        @Test
        @DisplayName("Child without User.family_id: falls back to createdBy → parent family")
        void child_resolvesFamilyId_viaCreatedBy_fallback() {
            // Simulate old child without family_id set
            User childNoFamily = new User();
            childNoFamily.setId(30L);
            childNoFamily.setLogin("oldchild");
            childNoFamily.setCreatedBy("parent"); // parent created them
            // childNoFamily.family = null  ← the old broken state

            when(userRepository.findOneByLogin("oldchild")).thenReturn(Optional.of(childNoFamily));
            when(userRepository.findOneByLogin("parent")).thenReturn(Optional.of(parentUser));

            Long familyId = goalService.resolveCurrentUserFamilyId("oldchild");

            assertThat(familyId).isEqualTo(1L); // found via parent
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("Milestone restrictions for ROLE_CHILD")
    class MilestoneRestrictionTests {

        /**
         * Verifies that the @PreAuthorize annotations on GoalResource do NOT include
         * ROLE_CHILD for milestone write/delete endpoints, ensuring Spring Security
         * blocks child access at the HTTP layer before the service is even reached.
         */
        @Test
        @DisplayName("GoalResource.updateMilestone (check) has no ROLE_CHILD in @PreAuthorize")
        void updateMilestone_preAuthorize_excludesRoleChild() throws NoSuchMethodException {
            java.lang.reflect.Method method = com.atharsense.lr.web.rest.GoalResource.class
                .getMethod("updateMilestone", Long.class, Long.class,
                    com.atharsense.lr.service.dto.CreateGoalMilestoneRequest.class);

            org.springframework.security.access.prepost.PreAuthorize annotation =
                method.getAnnotation(org.springframework.security.access.prepost.PreAuthorize.class);

            assertThat(annotation).isNotNull();
            assertThat(annotation.value())
                .as("ROLE_CHILD must not be in @PreAuthorize on updateMilestone")
                .doesNotContain("ROLE_CHILD");
        }

        @Test
        @DisplayName("GoalResource.deleteMilestone has no ROLE_CHILD in @PreAuthorize")
        void deleteMilestone_preAuthorize_excludesRoleChild() throws NoSuchMethodException {
            java.lang.reflect.Method method = com.atharsense.lr.web.rest.GoalResource.class
                .getMethod("deleteMilestone", Long.class, Long.class);

            org.springframework.security.access.prepost.PreAuthorize annotation =
                method.getAnnotation(org.springframework.security.access.prepost.PreAuthorize.class);

            assertThat(annotation).isNotNull();
            assertThat(annotation.value())
                .as("ROLE_CHILD must not be in @PreAuthorize on deleteMilestone")
                .doesNotContain("ROLE_CHILD");
        }

        @Test
        @DisplayName("GoalResource.createMilestone has no ROLE_CHILD in @PreAuthorize")
        void createMilestone_preAuthorize_excludesRoleChild() throws NoSuchMethodException {
            java.lang.reflect.Method method = com.atharsense.lr.web.rest.GoalResource.class
                .getMethod("createMilestone", Long.class,
                    com.atharsense.lr.service.dto.CreateGoalMilestoneRequest.class);

            org.springframework.security.access.prepost.PreAuthorize annotation =
                method.getAnnotation(org.springframework.security.access.prepost.PreAuthorize.class);

            assertThat(annotation).isNotNull();
            assertThat(annotation.value())
                .as("ROLE_CHILD must not be in @PreAuthorize on createMilestone")
                .doesNotContain("ROLE_CHILD");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("Child goal creation and visibility enforcement")
    class ChildGoalCreationTests {

        @Test
        @DisplayName("Child can create a goal, visibility forced to FAMILY_SHARED despite request value PRIVATE")
        void child_createGoal_visibilityForcedToFamilyShared() {
            // Arrange – child authenticated, tries to create with PRIVATE visibility
            authenticateAs("child");

            when(userRepository.findOneByLogin("child")).thenReturn(Optional.of(childUser));
            when(extendedUserRepository.findOneByUserId(20L)).thenReturn(Optional.of(childExtUser));

            // goalRepository.save returns the goal with an ID
            when(goalRepository.save(any(Goal.class))).thenAnswer(inv -> {
                Goal g = inv.getArgument(0);
                g.setId(99L);
                return g;
            });

            // syncFamilyShares re-fetches owner
            when(extendedUserRepository.findById(200L)).thenReturn(Optional.of(childExtUser));
            when(extendedUserRepository.findByFamilyId(1L)).thenReturn(List.of(childExtUser, parentExtUser));
            when(goalShareRepository.findByGoalId(99L)).thenReturn(Collections.emptyList());
            when(goalShareRepository.save(any(GoalShare.class))).thenAnswer(inv -> inv.getArgument(0));

            // Child requests PRIVATE but backend should override to FAMILY_SHARED
            CreateGoalRequest req = new CreateGoalRequest(
                "Child's Personal Goal",
                null,
                GoalType.PERSONAL,
                null,
                GoalStatus.DRAFT,
                GoalPriority.MEDIUM,
                GoalVisibility.PRIVATE,  // ← child tries to set PRIVATE
                null, null,
                GoalProgressMode.MANUAL_PERCENTAGE,
                0, null, null, null, null,
                null, null, null, null, null, null,
                GoalReviewFrequency.NONE,
                null
            );

            // Act
            Goal result = goalService.createGoal(req);

            // Assert – visibility MUST be FAMILY_SHARED, not PRIVATE
            assertThat(result.getVisibility())
                .as("Child goal must have FAMILY_SHARED visibility")
                .isEqualTo(GoalVisibility.FAMILY_SHARED);
        }

        @Test
        @DisplayName("Child can update a goal, visibility enforced to FAMILY_SHARED")
        void child_updateGoal_visibilityEnforcedToFamilyShared() {
            // Arrange – child owns a goal, tries to change visibility to PRIVATE
            authenticateAs("child");

            when(userRepository.findOneByLogin("child")).thenReturn(Optional.of(childUser));

            // Goal is owned by child
            Goal childOwnedGoal = new Goal();
            childOwnedGoal.setId(50L);
            childOwnedGoal.setTitle("Child's Shared Goal");
            childOwnedGoal.setVisibility(GoalVisibility.FAMILY_SHARED);
            childOwnedGoal.setOwner(childExtUser);

            when(goalRepository.findById(50L)).thenReturn(Optional.of(childOwnedGoal));
            when(goalRepository.save(any(Goal.class))).thenAnswer(inv -> inv.getArgument(0));

            // syncFamilyShares
            when(extendedUserRepository.findById(200L)).thenReturn(Optional.of(childExtUser));
            when(extendedUserRepository.findByFamilyId(1L)).thenReturn(List.of(childExtUser, parentExtUser));
            when(goalShareRepository.findByGoalId(50L)).thenReturn(Collections.emptyList());

            CreateGoalRequest req = new CreateGoalRequest(
                "Updated Child Goal",
                null,
                GoalType.PERSONAL,
                null,
                GoalStatus.IN_PROGRESS,
                GoalPriority.MEDIUM,
                GoalVisibility.PRIVATE,  // ← child tries to change to PRIVATE
                null, null,
                GoalProgressMode.MANUAL_PERCENTAGE,
                0, null, null, null, null,
                null, null, null, null, null, null,
                GoalReviewFrequency.NONE,
                null
            );

            // Act
            Goal result = goalService.updateGoal(50L, req);

            // Assert
            assertThat(result.getVisibility())
                .as("Child's updated goal must stay FAMILY_SHARED")
                .isEqualTo(GoalVisibility.FAMILY_SHARED);
        }

        @Test
        @DisplayName("Parent can archive a child goal in the same family")
        void parent_canManage_childGoal() {
            authenticateAs("parent");
            when(userRepository.findOneByLogin("parent")).thenReturn(Optional.of(parentUser));

            Goal childOwnedGoal = new Goal();
            childOwnedGoal.setId(60L);
            childOwnedGoal.setTitle("Child Goal");
            childOwnedGoal.setVisibility(GoalVisibility.FAMILY_SHARED);
            childOwnedGoal.setIsArchived(false);
            childOwnedGoal.setOwner(childExtUser);

            when(goalRepository.findById(60L)).thenReturn(Optional.of(childOwnedGoal));
            when(goalRepository.save(any(Goal.class))).thenAnswer(inv -> inv.getArgument(0));

            Goal archived = goalService.archiveGoal(60L);

            assertThat(archived.getIsArchived()).isTrue();
            assertThat(archived.getStatus()).isEqualTo(GoalStatus.ARCHIVED);
        }

        @Test
        @DisplayName("Child cannot archive family goal owned by parent")
        void child_cannotManage_parentGoal() {
            authenticateAs("child");
            when(userRepository.findOneByLogin("child")).thenReturn(Optional.of(childUser));
            when(goalRepository.findById(1L)).thenReturn(Optional.of(familySharedGoal));

            assertThatThrownBy(() -> goalService.archiveGoal(1L))
                .isInstanceOf(BadRequestAlertException.class)
                .hasMessageContaining("edit access denied");
        }
    }

    private void authenticateAs(String login) {
        UsernamePasswordAuthenticationToken auth =
            new UsernamePasswordAuthenticationToken(login, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private CreateGoalRequest buildFamilySharedRequest() {
        return new CreateGoalRequest(
            "Family Holiday Plan",
            "Plan the best family holiday",
            GoalType.FAMILY,
            null,
            GoalStatus.IN_PROGRESS,
            GoalPriority.MEDIUM,
            GoalVisibility.FAMILY_SHARED,
            null, null,
            GoalProgressMode.MANUAL_PERCENTAGE,
            0, null, null, null, null,
            null, null, null, null, null, null,
            GoalReviewFrequency.WEEKLY,
            null
        );
    }

    private CreateGoalRequest buildPrivateRequest() {
        return new CreateGoalRequest(
            "Private Goal",
            null,
            GoalType.PERSONAL,
            null,
            GoalStatus.DRAFT,
            GoalPriority.LOW,
            GoalVisibility.PRIVATE,
            null, null,
            GoalProgressMode.MANUAL_PERCENTAGE,
            0, null, null, null, null,
            null, null, null, null, null, null,
            GoalReviewFrequency.NONE,
            null
        );
    }
}

