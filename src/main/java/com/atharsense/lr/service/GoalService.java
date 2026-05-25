package com.atharsense.lr.service;

import com.atharsense.lr.domain.Goal;
import com.atharsense.lr.domain.GoalMilestone;
import com.atharsense.lr.domain.GoalShare;
import com.atharsense.lr.domain.GoalUpdate;
import com.atharsense.lr.domain.ExtendedUser;
import com.atharsense.lr.domain.Pillar;
import com.atharsense.lr.domain.User;
import com.atharsense.lr.domain.enumeration.*;
import com.atharsense.lr.repository.*;
import com.atharsense.lr.security.SecurityUtils;
import com.atharsense.lr.service.dto.*;
import com.atharsense.lr.web.rest.errors.BadRequestAlertException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing Goals & Projects.
 */
@Service
@Transactional
public class GoalService {

    private static final Logger LOG = LoggerFactory.getLogger(GoalService.class);

    private final GoalRepository goalRepository;
    private final GoalMilestoneRepository milestoneRepository;
    private final GoalUpdateRepository goalUpdateRepository;
    private final ExtendedUserRepository extendedUserRepository;
    private final UserRepository userRepository;
    private final PillarRepository pillarRepository;
    private final GoalShareRepository goalShareRepository;

    public GoalService(
        GoalRepository goalRepository,
        GoalMilestoneRepository milestoneRepository,
        GoalUpdateRepository goalUpdateRepository,
        ExtendedUserRepository extendedUserRepository,
        UserRepository userRepository,
        PillarRepository pillarRepository,
        GoalShareRepository goalShareRepository
    ) {
        this.goalRepository = goalRepository;
        this.milestoneRepository = milestoneRepository;
        this.goalUpdateRepository = goalUpdateRepository;
        this.extendedUserRepository = extendedUserRepository;
        this.userRepository = userRepository;
        this.pillarRepository = pillarRepository;
        this.goalShareRepository = goalShareRepository;
    }

    // ── Goal CRUD ────────────────────────────────────────────────────────────

    public Goal createGoal(CreateGoalRequest req) {
        LOG.debug("Creating Goal: {}", req.title());
        ExtendedUser owner = resolveCurrentOwner();
        Goal goal = new Goal();
        applyGoalRequest(goal, req, owner);

        // Force FAMILY_SHARED for children (they cannot create private goals)
        if (isCurrentUserChild()) {
            goal.setVisibility(GoalVisibility.FAMILY_SHARED);
            LOG.debug("Child user creating goal — forcing visibility to FAMILY_SHARED");
        }

        Goal saved = goalRepository.save(goal);
        syncFamilyShares(saved);
        return saved;
    }

    public Goal updateGoal(Long id, CreateGoalRequest req) {
        LOG.debug("Updating Goal id={}", id);
        Goal goal = requireGoalWriteAccess(id);
        // Keep the original owner — don't change ownership when editing
        ExtendedUser owner = goal.getOwner();
        if (owner == null) {
            owner = resolveCurrentOwner();
        }
        applyGoalRequest(goal, req, owner);

        // Force FAMILY_SHARED for children (they cannot change visibility)
        if (isCurrentUserChild()) {
            goal.setVisibility(GoalVisibility.FAMILY_SHARED);
            LOG.debug("Child user updating goal {} — enforcing visibility to FAMILY_SHARED", id);
        }

        Goal saved = goalRepository.save(goal);
        syncFamilyShares(saved);
        return saved;
    }

    public void deleteGoal(Long id) {
        LOG.debug("Deleting Goal id={}", id);
        requireGoalWriteAccess(id);
        goalShareRepository.deleteByGoalId(id);
        goalRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Goal> findOne(Long id) {
        return goalRepository.findById(id);
    }

    /**
     * Returns goals owned by the current user PLUS goals shared with them.
     *
     * Uses two complementary mechanisms so that goals are visible regardless
     * of whether they were created before or after the child joined the family:
     *  1. GoalShare table — per-member share records (created by syncFamilyShares / backdate)
     *  2. Direct family query — finds FAMILY_SHARED goals for the user's family (fallback)
     */
    @Transactional(readOnly = true)
    public List<Goal> findByCurrentUser(boolean includeArchived) {
        String login = currentLogin();
        boolean currentUserIsChild = isCurrentUserChild();

        // 1. Own goals ────────────────────────────────────────────────────
        List<Goal> owned = includeArchived
            ? goalRepository.findByOwnerUserLoginOrderByCreatedDateDesc(login)
            : goalRepository.findByOwnerUserLoginAndIsArchivedFalseOrderByCreatedDateDesc(login);
        Set<Long> ownedIds = owned.stream().map(Goal::getId).collect(Collectors.toSet());

        List<Goal> combined = new ArrayList<>(owned);
        Set<Long> combinedIds = new java.util.HashSet<>(ownedIds);

        // 2. Goals shared via GoalShare records ───────────────────────────
        List<GoalShare> shares = goalShareRepository.findBySharedWithUserLogin(login);
        for (GoalShare share : shares) {
            Goal g = share.getGoal();
            if (combinedIds.contains(g.getId())) continue;
            if (!includeArchived && Boolean.TRUE.equals(g.getIsArchived())) continue;
            if (currentUserIsChild && !isVisibleToChild(g)) continue;
            g.setSharedWithMe(true);
            g.setCanEditShared(!currentUserIsChild && Boolean.TRUE.equals(share.getCanEdit()));
            combined.add(g);
            combinedIds.add(g.getId());
        }

        // 3. Direct family query (belt-and-suspenders for new members / missed shares) ──
        Long familyId = resolveCurrentUserFamilyId(login);
        if (familyId != null) {
            List<Goal> familyGoals = goalRepository
                .findByOwnerUserFamilyIdAndVisibilityAndIsArchivedFalseOrderByCreatedDateDesc(
                    familyId, GoalVisibility.FAMILY_SHARED);
            for (Goal g : familyGoals) {
                if (combinedIds.contains(g.getId())) continue;
                if (currentUserIsChild && !isVisibleToChild(g)) continue;
                g.setSharedWithMe(true);
                g.setCanEditShared(!currentUserIsChild);
                combined.add(g);
                combinedIds.add(g.getId());
            }
        }

        return combined;
    }

    public Goal archiveGoal(Long id) {
        Goal goal = requireGoalWriteAccess(id);
        goal.setIsArchived(true);
        goal.setStatus(GoalStatus.ARCHIVED);
        return goalRepository.save(goal);
    }

    public Goal markComplete(Long id) {
        Goal goal = requireGoalWriteAccess(id);
        goal.setStatus(GoalStatus.COMPLETED);
        goal.setProgressPercentage(100);
        if (goal.getCompletedDate() == null) {
            goal.setCompletedDate(LocalDate.now());
        }
        return goalRepository.save(goal);
    }

    // ── Milestones ───────────────────────────────────────────────────────────

    public GoalMilestone createMilestone(Long goalId, CreateGoalMilestoneRequest req) {
        Goal goal = requireGoalWriteAccess(goalId);
        GoalMilestone milestone = new GoalMilestone();
        milestone.setGoal(goal);
        milestone.setTitle(req.title());
        milestone.setDescription(req.description());
        milestone.setStatus(req.status() != null ? req.status() : GoalMilestoneStatus.NOT_STARTED);
        milestone.setDueDate(req.dueDate());
        milestone.setSortOrder(req.sortOrder());
        milestone.setProgressWeight(req.progressWeight());
        GoalMilestone saved = milestoneRepository.save(milestone);
        recalculateProgress(goal);
        return saved;
    }

    public GoalMilestone updateMilestone(Long goalId, Long milestoneId, CreateGoalMilestoneRequest req) {
        requireGoalWriteAccess(goalId);
        GoalMilestone milestone = milestoneRepository.findById(milestoneId)
            .orElseThrow(() -> new BadRequestAlertException("Milestone not found", "goalMilestone", "idnotfound"));
        milestone.setTitle(req.title());
        milestone.setDescription(req.description());
        if (req.status() != null) {
            milestone.setStatus(req.status());
            if (req.status() == GoalMilestoneStatus.COMPLETED && milestone.getCompletedDate() == null) {
                milestone.setCompletedDate(LocalDate.now());
            }
        }
        milestone.setDueDate(req.dueDate());
        if (req.sortOrder() != null) milestone.setSortOrder(req.sortOrder());
        if (req.progressWeight() != null) milestone.setProgressWeight(req.progressWeight());
        GoalMilestone saved = milestoneRepository.save(milestone);
        recalculateProgress(goalRepository.findById(goalId).orElseThrow());
        return saved;
    }

    public void deleteMilestone(Long goalId, Long milestoneId) {
        requireGoalWriteAccess(goalId);
        milestoneRepository.deleteById(milestoneId);
        recalculateProgress(goalRepository.findById(goalId).orElseThrow());
    }

    @Transactional(readOnly = true)
    public List<GoalMilestone> getMilestones(Long goalId) {
        requireGoalReadAccess(goalId);
        return milestoneRepository.findByGoalIdOrderBySortOrderAscIdAsc(goalId);
    }

    // ── Goal Updates / Reviews ───────────────────────────────────────────────

    public GoalUpdate createGoalUpdate(Long goalId, CreateGoalUpdateRequest req) {
        Goal goal = requireGoalWriteAccess(goalId);
        String login = currentLogin();

        GoalUpdate update = new GoalUpdate();
        update.setGoal(goal);
        update.setUpdateDate(req.updateDate());
        update.setSummary(req.summary());
        update.setProgressPercentage(req.progressPercentage());
        update.setCurrentValue(req.currentValue());
        update.setConfidenceLevel(req.confidenceLevel());
        update.setStatus(req.status());
        update.setMood(req.mood());
        update.setBlockers(req.blockers());
        update.setNextStep(req.nextStep());
        update.setCreatedByLogin(login);
        GoalUpdate saved = goalUpdateRepository.save(update);

        goal.setLastReviewDate(req.updateDate());
        goal.setNextReviewDate(calculateNextReviewDate(req.updateDate(), goal.getReviewFrequency()));

        if (req.status() != null) goal.setStatus(req.status());
        if (req.confidenceLevel() != null) goal.setConfidenceLevel(req.confidenceLevel());
        if (req.blockers() != null) goal.setBlockerNotes(req.blockers());

        if (goal.getProgressMode() == GoalProgressMode.MANUAL_PERCENTAGE || goal.getProgressMode() == GoalProgressMode.HYBRID) {
            if (req.progressPercentage() != null) goal.setProgressPercentage(req.progressPercentage());
        }
        if (req.currentValue() != null) goal.setCurrentValue(req.currentValue());

        recalculateProgress(goal);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<GoalUpdate> getGoalUpdates(Long goalId) {
        requireGoalReadAccess(goalId);
        return goalUpdateRepository.findByGoalIdOrderByUpdateDateDesc(goalId);
    }

    // ── Dashboard Summary ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public GoalDashboardSummaryDTO getDashboardSummary() {
        List<Goal> all = findByCurrentUser(false);
        LocalDate today = LocalDate.now();
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        long activeCount = all.stream()
            .filter(g -> g.getStatus() == GoalStatus.IN_PROGRESS || g.getStatus() == GoalStatus.NOT_STARTED || g.getStatus() == GoalStatus.AT_RISK)
            .count();
        long completed = all.stream().filter(g -> g.getStatus() == GoalStatus.COMPLETED).count();
        long atRisk = all.stream().filter(g -> isAtRisk(g, today)).count();
        long blocked = all.stream().filter(g -> g.getStatus() == GoalStatus.BLOCKED).count();
        long dueThisMonth = all.stream()
            .filter(g -> g.getTargetDate() != null && !g.getTargetDate().isBefore(today) && !g.getTargetDate().isAfter(endOfMonth))
            .count();
        long needingReview = all.stream()
            .filter(g -> g.getNextReviewDate() != null && !g.getNextReviewDate().isAfter(today))
            .count();

        double avgProgress = all.stream()
            .filter(g -> g.getStatus() == GoalStatus.IN_PROGRESS || g.getStatus() == GoalStatus.NOT_STARTED)
            .mapToInt(g -> g.getProgressPercentage() != null ? g.getProgressPercentage() : 0)
            .average()
            .orElse(0.0);

        LocalDate recentThreshold = today.minusDays(30);
        long recentlyCompleted = all.stream()
            .filter(g -> g.getStatus() == GoalStatus.COMPLETED && g.getCompletedDate() != null && !g.getCompletedDate().isBefore(recentThreshold))
            .count();

        return new GoalDashboardSummaryDTO(activeCount, completed, atRisk, blocked, dueThisMonth, needingReview, avgProgress, recentlyCompleted);
    }

    // ── Progress Calculation ─────────────────────────────────────────────────

    public void recalculateProgress(Goal goal) {
        int progress = calculateProgress(goal);
        goal.setProgressPercentage(progress);

        if (progress >= 100 && goal.getStatus() != GoalStatus.CANCELLED && goal.getStatus() != GoalStatus.ARCHIVED) {
            goal.setStatus(GoalStatus.COMPLETED);
            if (goal.getCompletedDate() == null) goal.setCompletedDate(LocalDate.now());
        }

        goalRepository.save(goal);
    }

    private int calculateProgress(Goal goal) {
        GoalProgressMode mode = goal.getProgressMode();
        if (mode == null || mode == GoalProgressMode.MANUAL_PERCENTAGE || mode == GoalProgressMode.HYBRID) {
            return clamp(goal.getProgressPercentage() != null ? goal.getProgressPercentage() : 0);
        }
        if (mode == GoalProgressMode.NUMERIC_TARGET) return clamp(calculateNumericProgress(goal));
        if (mode == GoalProgressMode.MILESTONE_BASED) return clamp(calculateMilestoneProgress(goal));
        if (mode == GoalProgressMode.ACTION_ITEM_BASED) {
            return clamp(goal.getProgressPercentage() != null ? goal.getProgressPercentage() : 0);
        }
        return 0;
    }

    private int calculateNumericProgress(Goal goal) {
        BigDecimal target = goal.getTargetValue();
        BigDecimal current = goal.getCurrentValue();
        if (target == null || current == null || target.compareTo(BigDecimal.ZERO) == 0) return 0;

        BigDecimal baseline = goal.getBaselineValue();
        if (baseline == null) {
            return current.multiply(BigDecimal.valueOf(100)).divide(target, 0, RoundingMode.HALF_UP).intValue();
        }

        BigDecimal totalDistance = target.subtract(baseline);
        if (totalDistance.compareTo(BigDecimal.ZERO) == 0) return 0;
        BigDecimal moved = current.subtract(baseline);
        return moved.multiply(BigDecimal.valueOf(100)).divide(totalDistance, 0, RoundingMode.HALF_UP).intValue();
    }

    private int calculateMilestoneProgress(Goal goal) {
        long total = milestoneRepository.countByGoalId(goal.getId());
        if (total == 0) return 0;
        long completed = milestoneRepository.countByGoalIdAndStatusIn(goal.getId(), List.of(GoalMilestoneStatus.COMPLETED));
        return (int) (completed * 100 / total);
    }

    private int clamp(int value) {
        return Math.max(0, Math.min(100, value));
    }

    // ── At-Risk Logic ────────────────────────────────────────────────────────

    public boolean isAtRisk(Goal goal, LocalDate today) {
        if (goal.getStatus() == GoalStatus.COMPLETED || goal.getStatus() == GoalStatus.CANCELLED || goal.getStatus() == GoalStatus.ARCHIVED) {
            return false;
        }
        if (goal.getStatus() == GoalStatus.BLOCKED) return true;
        if (goal.getTargetDate() != null && goal.getTargetDate().isBefore(today)) return true;
        if (goal.getTargetDate() != null && !goal.getTargetDate().isBefore(today)) {
            long daysUntilTarget = today.until(goal.getTargetDate(), java.time.temporal.ChronoUnit.DAYS);
            int progress = goal.getProgressPercentage() != null ? goal.getProgressPercentage() : 0;
            if (daysUntilTarget <= 7 && progress < 80) return true;
        }
        return goal.getConfidenceLevel() == GoalPriority.LOW && goal.getStatus() == GoalStatus.IN_PROGRESS;
    }

    // ── Review Date Calculation ──────────────────────────────────────────────

    private LocalDate calculateNextReviewDate(LocalDate lastReviewDate, GoalReviewFrequency freq) {
        if (freq == null || freq == GoalReviewFrequency.NONE) return null;
        return switch (freq) {
            case DAILY -> lastReviewDate.plusDays(1);
            case WEEKLY -> lastReviewDate.plusWeeks(1);
            case BI_WEEKLY -> lastReviewDate.plusWeeks(2);
            case MONTHLY -> lastReviewDate.plusMonths(1);
            case QUARTERLY -> lastReviewDate.plusMonths(3);
            default -> null;
        };
    }

    // ── Family Share Sync ────────────────────────────────────────────────────

    /**
     * When a goal's visibility is FAMILY_SHARED, create GoalShare records for every
     * family member (except the owner). When visibility changes away from FAMILY_SHARED,
     * removes all existing share records.
     *
     * NOTE: The owner is re-fetched from the DB to ensure the LAZY family relationship
     * is properly loaded and not null.
     */
    private void syncFamilyShares(Goal goal) {
        if (goal.getVisibility() == GoalVisibility.FAMILY_SHARED) {
            // Re-fetch the owner with a fresh query so the LAZY family FK is loaded
            ExtendedUser owner = extendedUserRepository.findById(goal.getOwner().getId()).orElse(null);
            if (owner == null) {
                LOG.warn("Cannot sync shares: owner not found for goal id={}", goal.getId());
                return;
            }

            // Resolve family from ExtendedUser, or fall back to User.family
            com.atharsense.lr.domain.Family family = owner.getFamily();
            if (family == null && owner.getUser() != null) {
                family = owner.getUser().getFamily();
            }
            if (family == null) {
                LOG.warn("Cannot sync shares: owner {} has no family for goal id={}", owner.getId(), goal.getId());
                return;
            }

            Long familyId = family.getId();
            List<ExtendedUser> familyMembers = extendedUserRepository.findByFamilyId(familyId);

            // Also include children whose ExtendedUser.family might not be set yet
            // but whose User.family_id IS set (newly-fixed child creation path)
            // This is handled by User.family via GoalRepository.findByOwnerUserFamilyId

            List<GoalShare> existing = goalShareRepository.findByGoalId(goal.getId());
            Set<Long> existingMemberIds = existing.stream()
                .map(s -> s.getSharedWith().getId())
                .collect(Collectors.toSet());

            Set<Long> currentFamilyMemberIds = familyMembers.stream()
                .map(ExtendedUser::getId)
                .collect(Collectors.toSet());

            for (ExtendedUser member : familyMembers) {
                if (member.getId().equals(owner.getId())) continue; // Skip owner
                if (existingMemberIds.contains(member.getId())) continue; // Skip already shared

                GoalShare share = new GoalShare();
                share.setGoal(goal);
                share.setSharedWith(member);
                share.setCanEdit(true);
                goalShareRepository.save(share);
                LOG.debug("Created GoalShare: goal={} -> member={}", goal.getId(), member.getId());
            }

            // Remove shares for members who left the family
            existing.stream()
                .filter(s -> !currentFamilyMemberIds.contains(s.getSharedWith().getId()))
                .forEach(goalShareRepository::delete);

        } else {
            List<GoalShare> shares = goalShareRepository.findByGoalId(goal.getId());
            if (!shares.isEmpty()) {
                goalShareRepository.deleteByGoalId(goal.getId());
                LOG.debug("Removed {} GoalShare records for goal={} (visibility={})",
                    shares.size(), goal.getId(), goal.getVisibility());
            }
        }
    }

    /**
     * Called when a new family member is added (e.g. child created).
     * Creates GoalShare records for all existing FAMILY_SHARED goals in the family
     * so the new member can immediately see them — even goals created before they joined.
     *
     * @param newMemberUserId the jhi_user.id of the new member
     * @param familyId        the family they joined
     */
    public void backdateSharesForNewMember(Long newMemberUserId, Long familyId) {
        ExtendedUser newMember = extendedUserRepository.findOneByUserId(newMemberUserId).orElse(null);
        if (newMember == null) {
            LOG.warn("backdateShares: no ExtendedUser for userId={}", newMemberUserId);
            return;
        }

        List<Goal> familyGoals = goalRepository
            .findByOwnerUserFamilyIdAndVisibilityAndIsArchivedFalseOrderByCreatedDateDesc(
                familyId, GoalVisibility.FAMILY_SHARED);

        for (Goal goal : familyGoals) {
            // Skip if the new member is actually the owner
            if (newMember.getId().equals(goal.getOwner().getId())) continue;

            // Skip if a share record already exists
            boolean alreadyShared = goalShareRepository
                .findByGoalIdAndSharedWithUserLogin(goal.getId(), newMember.getUser().getLogin())
                .isPresent();
            if (alreadyShared) continue;

            GoalShare share = new GoalShare();
            share.setGoal(goal);
            share.setSharedWith(newMember);
            share.setCanEdit(true);
            goalShareRepository.save(share);
            LOG.debug("Backdated GoalShare: goal={} -> newMember={}", goal.getId(), newMember.getId());
        }

        LOG.info("Backdated shares for newMember={} in family={}: {} goals processed",
            newMember.getId(), familyId, familyGoals.size());
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void applyGoalRequest(Goal goal, CreateGoalRequest req, ExtendedUser owner) {
        goal.setTitle(req.title());
        goal.setDescription(req.description());
        goal.setGoalType(req.goalType());
        goal.setCategory(req.category());
        goal.setStatus(req.status() != null ? req.status() : GoalStatus.DRAFT);
        goal.setPriority(req.priority() != null ? req.priority() : GoalPriority.MEDIUM);
        goal.setVisibility(req.visibility() != null ? req.visibility() : GoalVisibility.PRIVATE);
        goal.setStartDate(req.startDate());
        goal.setTargetDate(req.targetDate());
        goal.setProgressMode(req.progressMode() != null ? req.progressMode() : GoalProgressMode.MANUAL_PERCENTAGE);
        goal.setProgressPercentage(req.progressPercentage() != null ? req.progressPercentage() : 0);
        goal.setTargetValue(req.targetValue());
        goal.setCurrentValue(req.currentValue());
        goal.setBaselineValue(req.baselineValue());
        goal.setUnit(req.unit());
        goal.setConfidenceLevel(req.confidenceLevel());
        goal.setDifficultyLevel(req.difficultyLevel());
        goal.setMotivation(req.motivation());
        goal.setSuccessCriteria(req.successCriteria());
        goal.setRiskNotes(req.riskNotes());
        goal.setBlockerNotes(req.blockerNotes());
        goal.setReviewFrequency(req.reviewFrequency());
        goal.setOwner(owner);
        if (req.pillarId() != null) {
            Pillar pillar = pillarRepository.findById(req.pillarId()).orElse(null);
            goal.setPillar(pillar);
        } else {
            goal.setPillar(null);
        }
        if (goal.getIsArchived() == null) goal.setIsArchived(false);
    }

    /** Strict ownership check — only the owner. Used for delete / archive / visibility change. */
    private Goal requireGoalOwnership(Long goalId) {
        String login = currentLogin();
        return goalRepository.findById(goalId)
            .filter(g -> g.getOwner() != null &&
                login.equals(g.getOwner().getUser() != null ? g.getOwner().getUser().getLogin() : null))
            .orElseThrow(() -> new BadRequestAlertException("Goal not found or access denied", "goal", "idnotfound"));
    }

    /** Write access: owner OR shared member with canEdit=true (children can only edit their own goals). */
    private Goal requireGoalWriteAccess(Long goalId) {
        String login = currentLogin();
        Goal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new BadRequestAlertException("Goal not found", "goal", "idnotfound"));

        // Check ownership first
        boolean isOwner = goal.getOwner() != null &&
            login.equals(goal.getOwner().getUser() != null ? goal.getOwner().getUser().getLogin() : null);
        if (isOwner) {
            return goal;
        }

        // Children are not allowed to edit non-owned goals, even if shared with canEdit=true
        if (isCurrentUserChild()) {
            throw new BadRequestAlertException("Goal not found or edit access denied", "goal", "idnotfound");
        }

        // For non-children: check if shared with canEdit=true
        Optional<GoalShare> share = goalShareRepository.findByGoalIdAndSharedWithUserLogin(goalId, login);
        if (Boolean.TRUE.equals(share.map(GoalShare::getCanEdit).orElse(false))) {
            return goal;
        }

        // Also check via family (belt-and-suspenders if share record is missing)
        Long familyId = resolveCurrentUserFamilyId(login);
        if (familyId != null && goal.getVisibility() == GoalVisibility.FAMILY_SHARED) {
            Long ownerFamilyId = goal.getOwner() != null && goal.getOwner().getUser() != null
                ? (goal.getOwner().getUser().getFamily() != null ? goal.getOwner().getUser().getFamily().getId() : null)
                : null;
            if (familyId.equals(ownerFamilyId)) {
                return goal;
            }
        }

        throw new BadRequestAlertException("Goal not found or edit access denied", "goal", "idnotfound");
    }

    /** Read access: owner OR any share record OR same family for FAMILY_SHARED goals. */
    private void requireGoalReadAccess(Long goalId) {
        String login = currentLogin();
        Goal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new BadRequestAlertException("Goal not found", "goal", "idnotfound"));

        if (goal.getOwner() != null &&
            login.equals(goal.getOwner().getUser() != null ? goal.getOwner().getUser().getLogin() : null)) {
            return;
        }

        // Children can only read parent-owned FAMILY_SHARED goals (plus their own handled above)
        if (isCurrentUserChild()) {
            if (isVisibleToChild(goal)) {
                return;
            }
            throw new BadRequestAlertException("Goal not found or access denied", "goal", "idnotfound");
        }

        if (goalShareRepository.findByGoalIdAndSharedWithUserLogin(goalId, login).isPresent()) {
            return;
        }

        // Belt-and-suspenders: check family membership directly
        if (goal.getVisibility() == GoalVisibility.FAMILY_SHARED) {
            Long familyId = resolveCurrentUserFamilyId(login);
            Long ownerFamilyId = goal.getOwner() != null && goal.getOwner().getUser() != null
                ? (goal.getOwner().getUser().getFamily() != null ? goal.getOwner().getUser().getFamily().getId() : null)
                : null;
            if (familyId != null && familyId.equals(ownerFamilyId)) {
                return;
            }
        }

        throw new BadRequestAlertException("Goal not found or access denied", "goal", "idnotfound");
    }

    private ExtendedUser resolveCurrentOwner() {
        String login = currentLogin();
        return userRepository.findOneByLogin(login)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .orElseThrow(() -> new IllegalStateException("No ExtendedUser for login: " + login));
    }

    /**
     * Resolves the family ID for the given login.
     * <ul>
     *   <li>For parents: {@code User.family_id} is set directly.</li>
     *   <li>For children: {@code User.family_id} is set at account creation (after the fix in
     *       FamilyResource.createChild); falls back to parent's family via {@code createdBy}.</li>
     * </ul>
     */
    Long resolveCurrentUserFamilyId(String login) {
        User user = userRepository.findOneByLogin(login).orElse(null);
        if (user == null) return null;

        // Primary: User has family_id set directly (parent or fixed-child path)
        if (user.getFamily() != null) {
            return user.getFamily().getId();
        }

        // Fallback for children created before the family-link fix:
        // child.createdBy = parent login → parent.User.family_id
        String createdBy = user.getCreatedBy();
        if (createdBy != null && !createdBy.equals(login)) {
            User parent = userRepository.findOneByLogin(createdBy).orElse(null);
            if (parent != null && parent.getFamily() != null) {
                return parent.getFamily().getId();
            }
        }

        // Last resort: check ExtendedUser.family
        return extendedUserRepository.findOneByUserId(user.getId())
            .map(eu -> eu.getFamily() != null ? eu.getFamily().getId() : null)
            .orElse(null);
    }

    private String currentLogin() {
        return SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new IllegalStateException("User not authenticated"));
    }

    /**
     * Checks if the current user has ROLE_CHILD authority.
     * Children can create and manage goals, but with visibility fixed to FAMILY_SHARED.
     */
    private boolean isCurrentUserChild() {
        User user = userRepository.findOneByLogin(currentLogin()).orElse(null);
        if (user == null) return false;
        return user.getAuthorities().stream()
            .anyMatch(auth -> "ROLE_CHILD".equals(auth.getName()));
    }

    /** Child visibility rule: only FAMILY_SHARED goals owned by a USER-role account (parent). */
    private boolean isVisibleToChild(Goal goal) {
        if (goal == null || goal.getVisibility() != GoalVisibility.FAMILY_SHARED) {
            return false;
        }
        String ownerLogin = goal.getOwner() != null && goal.getOwner().getUser() != null
            ? goal.getOwner().getUser().getLogin()
            : null;
        if (ownerLogin == null) {
            return false;
        }
        return userRepository.findOneByLogin(ownerLogin)
            .map(ownerUser -> ownerUser.getAuthorities().stream()
                .anyMatch(auth -> "ROLE_USER".equals(auth.getName()) || "USER".equals(auth.getName())))
            .orElse(false);
    }
}

