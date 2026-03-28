package com.atharsense.lr.service;

import com.atharsense.lr.domain.ExtendedUser;
import com.atharsense.lr.domain.KidObjective;
import com.atharsense.lr.domain.KidObjectiveItemDefinition;
import com.atharsense.lr.domain.KidObjectiveProgress;
import com.atharsense.lr.domain.User;
import com.atharsense.lr.domain.enumeration.ObjectiveUnit;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.repository.KidObjectiveItemDefinitionRepository;
import com.atharsense.lr.repository.KidObjectiveProgressRepository;
import com.atharsense.lr.repository.KidObjectiveRepository;
import com.atharsense.lr.repository.UserRepository;
import com.atharsense.lr.security.AuthoritiesConstants;
import com.atharsense.lr.security.SecurityUtils;
import com.atharsense.lr.service.dto.CreateFamilyObjectiveItemDefinitionRequest;
import com.atharsense.lr.service.dto.CreateFamilyObjectiveRequest;
import com.atharsense.lr.service.dto.CreateObjectiveProgressRequest;
import com.atharsense.lr.service.dto.FamilyObjectiveDTO;
import com.atharsense.lr.service.dto.FamilyObjectiveItemDefinitionDTO;
import com.atharsense.lr.service.dto.FamilyObjectiveProgressDTO;
import com.atharsense.lr.web.rest.errors.BadRequestAlertException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class FamilyObjectiveService {

    private static final Logger LOG = LoggerFactory.getLogger(FamilyObjectiveService.class);

    private final KidObjectiveRepository kidObjectiveRepository;
    private final KidObjectiveItemDefinitionRepository kidObjectiveItemDefinitionRepository;
    private final KidObjectiveProgressRepository kidObjectiveProgressRepository;
    private final UserRepository userRepository;
    private final ExtendedUserRepository extendedUserRepository;

    public FamilyObjectiveService(
        KidObjectiveRepository kidObjectiveRepository,
        KidObjectiveItemDefinitionRepository kidObjectiveItemDefinitionRepository,
        KidObjectiveProgressRepository kidObjectiveProgressRepository,
        UserRepository userRepository,
        ExtendedUserRepository extendedUserRepository
    ) {
        this.kidObjectiveRepository = kidObjectiveRepository;
        this.kidObjectiveItemDefinitionRepository = kidObjectiveItemDefinitionRepository;
        this.kidObjectiveProgressRepository = kidObjectiveProgressRepository;
        this.userRepository = userRepository;
        this.extendedUserRepository = extendedUserRepository;
    }

    @Transactional(readOnly = true)
    public List<FamilyObjectiveDTO> findObjectivesForCurrentScope() {
        User currentUser = getCurrentUserWithAuthorities();

        List<Long> kidExtendedUserIds;
        if (hasAnyAuthority(currentUser, AuthoritiesConstants.FAMILY_ADMIN, AuthoritiesConstants.ADMIN)) {
            kidExtendedUserIds = resolveManagedChildren(currentUser.getLogin()).values().stream().map(ExtendedUser::getId).toList();
        } else if (hasAuthority(currentUser, AuthoritiesConstants.CHILD)) {
            kidExtendedUserIds = extendedUserRepository.findOneByUserId(currentUser.getId()).map(ExtendedUser::getId).stream().toList();
        } else {
            return List.of();
        }

        if (kidExtendedUserIds.isEmpty()) {
            return List.of();
        }

        return kidObjectiveRepository.findAllByKidIdInWithDetails(kidExtendedUserIds).stream()
            .sorted(Comparator.comparing(KidObjective::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())).thenComparing(KidObjective::getId, Comparator.reverseOrder()))
            .map(this::toDto)
            .toList();
    }

    public List<FamilyObjectiveDTO> createObjectives(CreateFamilyObjectiveRequest request) {
        User currentUser = getCurrentUserWithAuthorities();
        if (!canManageObjectives(currentUser)) {
            throw new BadRequestAlertException("Only family admins can create objectives", "familyObjective", "forbidden");
        }

        Map<String, ExtendedUser> managedChildrenByLogin = resolveManagedChildren(currentUser.getLogin());
        if (managedChildrenByLogin.isEmpty()) {
            throw new BadRequestAlertException("No child accounts available", "familyObjective", "nokids");
        }

        Set<String> requestedLogins = request.kidLogins().stream()
            .map(String::trim)
            .filter(login -> !login.isEmpty())
            .collect(Collectors.toCollection(java.util.LinkedHashSet::new));

        if (requestedLogins.isEmpty()) {
            throw new BadRequestAlertException("At least one child must be selected", "familyObjective", "nokidsselected");
        }

        if (request.itemDefinitions() == null || request.itemDefinitions().isEmpty()) {
            throw new BadRequestAlertException("At least one item definition is required", "familyObjective", "noitemdefinitions");
        }

        List<KidObjective> objectivesToCreate = new ArrayList<>();
        String normalizedName = request.name().trim();
        String normalizedDescription = normalizeOptionalText(request.description());
        Instant createdAt = Instant.now();

        for (String login : requestedLogins) {
            ExtendedUser child = managedChildrenByLogin.get(login);
            if (child == null) {
                throw new BadRequestAlertException("Child not found in your family", "familyObjective", "invalidkid");
            }

            KidObjective objective = new KidObjective()
                .kid(child)
                .name(normalizedName)
                .description(normalizedDescription)
                .isActive(true)
                .createdAt(createdAt);

            for (CreateFamilyObjectiveItemDefinitionRequest itemRequest : request.itemDefinitions()) {
                objective.addItemDefinitions(new KidObjectiveItemDefinition()
                    .name(itemRequest.name().trim())
                    .description(normalizeOptionalText(itemRequest.description()))
                    .unit(itemRequest.unit()));
            }
            objectivesToCreate.add(objective);
        }

        LOG.debug("Creating {} family objectives for parent {}", objectivesToCreate.size(), currentUser.getLogin());
        return kidObjectiveRepository.saveAll(objectivesToCreate).stream().map(this::toDto).toList();
    }

    public FamilyObjectiveDTO deactivateObjective(Long objectiveId) {
        KidObjective objective = resolveAccessibleObjective(objectiveId, true);
        objective.setIsActive(false);
        return toDto(kidObjectiveRepository.save(objective));
    }

    public void deleteObjective(Long objectiveId) {
        KidObjective objective = resolveAccessibleObjective(objectiveId, true);
        kidObjectiveRepository.delete(objective);
    }

    public FamilyObjectiveDTO addProgress(Long itemDefinitionId, CreateObjectiveProgressRequest request) {
        KidObjectiveItemDefinition itemDefinition = resolveAccessibleItemDefinition(itemDefinitionId);
        if (!Boolean.TRUE.equals(itemDefinition.getObjective().getIsActive())) {
            throw new BadRequestAlertException("Cannot add progress to an inactive objective", "familyObjective", "inactiveobjective");
        }

        KidObjectiveProgress progress = new KidObjectiveProgress()
            .itemDefinition(itemDefinition)
            .createdAt(Instant.now())
            .value(request.value())
            .notes(normalizeOptionalText(request.notes()));
        kidObjectiveProgressRepository.save(progress);
        return toDto(resolveAccessibleObjective(itemDefinition.getObjective().getId(), false));
    }

    private Map<String, ExtendedUser> resolveManagedChildren(String parentLogin) {
        Map<String, ExtendedUser> childrenByLogin = new LinkedHashMap<>();
        for (User childUser : userRepository.findAll()) {
            if (!parentLogin.equals(childUser.getCreatedBy()) || !hasAuthority(childUser, AuthoritiesConstants.CHILD)) {
                continue;
            }

            ExtendedUser extendedUser = extendedUserRepository.findOneByUserId(childUser.getId()).orElseGet(() -> createExtendedUser(childUser));
            childrenByLogin.put(childUser.getLogin(), extendedUser);
        }
        return childrenByLogin;
    }

    private ExtendedUser createExtendedUser(User user) {
        ExtendedUser extendedUser = new ExtendedUser();
        extendedUser.setUser(user);
        extendedUser.setFullName(buildFullName(user));
        extendedUser.setActive(user.isActivated());
        return extendedUserRepository.save(extendedUser);
    }

    private User getCurrentUserWithAuthorities() {
        String currentLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new BadRequestAlertException("Not authenticated", "familyObjective", "notauthenticated"));
        return userRepository.findOneWithAuthoritiesByLogin(currentLogin)
            .orElseThrow(() -> new BadRequestAlertException("Current user not found", "familyObjective", "usernotfound"));
    }

    private KidObjective resolveAccessibleObjective(Long objectiveId, boolean requireManagerRole) {
        User currentUser = getCurrentUserWithAuthorities();
        KidObjective objective = kidObjectiveRepository.findByIdWithDetails(objectiveId)
            .orElseThrow(() -> new BadRequestAlertException("Objective not found", "familyObjective", "notfound"));

        if (canManageObjectives(currentUser)) {
            String kidCreatedBy = objective.getKid() != null && objective.getKid().getUser() != null ? objective.getKid().getUser().getCreatedBy() : null;
            if (!currentUser.getLogin().equals(kidCreatedBy) && !hasAuthority(currentUser, AuthoritiesConstants.ADMIN)) {
                throw new BadRequestAlertException("Objective not found in your family", "familyObjective", "forbidden");
            }
            return objective;
        }

        if (requireManagerRole) {
            throw new BadRequestAlertException("Only family admins can change objectives", "familyObjective", "forbidden");
        }

        if (!hasAuthority(currentUser, AuthoritiesConstants.CHILD)) {
            throw new BadRequestAlertException("Objective access denied", "familyObjective", "forbidden");
        }

        Long currentExtendedUserId = extendedUserRepository.findOneByUserId(currentUser.getId())
            .orElseThrow(() -> new BadRequestAlertException("Current child profile not found", "familyObjective", "usernotfound"))
            .getId();
        if (!currentExtendedUserId.equals(objective.getKid().getId())) {
            throw new BadRequestAlertException("Objective access denied", "familyObjective", "forbidden");
        }

        return objective;
    }

    private KidObjectiveItemDefinition resolveAccessibleItemDefinition(Long itemDefinitionId) {
        KidObjectiveItemDefinition itemDefinition = kidObjectiveItemDefinitionRepository.findByIdWithDetails(itemDefinitionId)
            .orElseThrow(() -> new BadRequestAlertException("Objective item definition not found", "familyObjective", "itemnotfound"));
        resolveAccessibleObjective(itemDefinition.getObjective().getId(), false);
        return itemDefinition;
    }

    private boolean canManageObjectives(User user) {
        return hasAnyAuthority(user, AuthoritiesConstants.FAMILY_ADMIN, AuthoritiesConstants.ADMIN);
    }

    private boolean hasAnyAuthority(User user, String... authorities) {
        for (String authority : authorities) {
            if (hasAuthority(user, authority)) {
                return true;
            }
        }
        return false;
    }

    private boolean hasAuthority(User user, String authority) {
        return user.getAuthorities().stream().anyMatch(item -> authority.equals(item.getName()));
    }

    private String buildFullName(User user) {
        String firstName = Optional.ofNullable(user.getFirstName()).orElse("").trim();
        String lastName = Optional.ofNullable(user.getLastName()).orElse("").trim();
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isEmpty() ? user.getLogin() : fullName;
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private FamilyObjectiveDTO toDto(KidObjective objective) {
        ExtendedUser kid = objective.getKid();
        User kidUser = kid != null ? kid.getUser() : null;
        return new FamilyObjectiveDTO(
            objective.getId(),
            kid != null ? kid.getId() : null,
            kidUser != null ? kidUser.getLogin() : null,
            kid != null ? kid.getFullName() : null,
            objective.getName(),
            objective.getDescription(),
            objective.getIsActive(),
            objective.getCreatedAt(),
            objective.getItemDefinitions().stream()
                .sorted(Comparator.comparing(KidObjectiveItemDefinition::getId))
                .map(this::toItemDefinitionDto)
                .toList()
        );
    }

    private FamilyObjectiveItemDefinitionDTO toItemDefinitionDto(KidObjectiveItemDefinition itemDefinition) {
        return new FamilyObjectiveItemDefinitionDTO(
            itemDefinition.getId(),
            itemDefinition.getName(),
            itemDefinition.getDescription(),
            Optional.ofNullable(itemDefinition.getUnit()).orElse(ObjectiveUnit.NUMBER),
            itemDefinition.getProgressEntries().stream()
                .sorted(Comparator.comparing(KidObjectiveProgress::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())).thenComparing(KidObjectiveProgress::getId, Comparator.reverseOrder()))
                .map(progress -> new FamilyObjectiveProgressDTO(progress.getId(), progress.getCreatedAt(), progress.getValue(), progress.getNotes()))
                .toList()
        );
    }
}

