package com.atharsense.lr.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.atharsense.lr.domain.ExtendedUser;
import com.atharsense.lr.domain.TripPlan;
import com.atharsense.lr.domain.TripPlanStep;
import com.atharsense.lr.domain.User;
import com.atharsense.lr.domain.enumeration.TripType;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.repository.TripPlanRepository;
import com.atharsense.lr.repository.UserRepository;
import com.atharsense.lr.security.AuthoritiesConstants;
import com.atharsense.lr.security.SecurityUtils;
import com.atharsense.lr.web.rest.errors.BadRequestAlertException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.atharsense.lr.domain.TripPlan}.
 */
@Service
@Transactional
public class TripPlanService {

    private static final Logger LOG = LoggerFactory.getLogger(TripPlanService.class);
    private static final int MAX_ACTIONS_PER_LIST = 30;
    private static final int MAX_ACTION_TEXT_LENGTH = 200;

    private final TripPlanRepository tripPlanRepository;
    private final ExtendedUserRepository extendedUserRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public TripPlanService(
        TripPlanRepository tripPlanRepository,
        ExtendedUserRepository extendedUserRepository,
        UserRepository userRepository,
        ObjectMapper objectMapper
    ) {
        this.tripPlanRepository = tripPlanRepository;
        this.extendedUserRepository = extendedUserRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    /** Save a tripPlan and bind it to the current authenticated user's ExtendedUser owner. */
    public TripPlan save(TripPlan tripPlan) {
        LOG.debug("Request to save TripPlan : {}", tripPlan);
        String login = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new IllegalStateException("User not authenticated"));
        ExtendedUser owner = userRepository.findOneByLogin(login)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .orElseThrow(() -> new IllegalStateException("No ExtendedUser found for login: " + login));
        tripPlan.setOwner(owner);

        if (tripPlan.getIsActive() == null) {
            tripPlan.setIsActive(true);
        }
        if (tripPlan.getTripType() == null) {
            tripPlan.setTripType(TripType.PERSONAL);
        }
        validateTripTypePermissions(tripPlan.getTripType(), null);
        validateTripActionsJson(tripPlan.getActionsJson());
        return tripPlanRepository.save(tripPlan);
    }

    public TripPlan update(TripPlan tripPlan) {
        LOG.debug("Request to update TripPlan : {}", tripPlan);
        TripPlan existing = tripPlanRepository
            .findById(tripPlan.getId())
            .orElseThrow(() -> new IllegalArgumentException("Trip not found: " + tripPlan.getId()));

        LocalDateTime updatedStartDate = tripPlan.getStartDate() != null ? tripPlan.getStartDate() : existing.getStartDate();
        LocalDateTime updatedEndDate = tripPlan.getEndDate() != null ? tripPlan.getEndDate() : existing.getEndDate();

        validateTripDates(updatedStartDate, updatedEndDate);
        validateExistingStepsWithinTripDates(existing, updatedStartDate, updatedEndDate);
        TripType updatedTripType = tripPlan.getTripType() != null ? tripPlan.getTripType() : existing.getTripType();
        validateTripTypePermissions(updatedTripType, existing.getTripType());
        validateTripActionsJson(tripPlan.getActionsJson());

        existing.setTitle(tripPlan.getTitle());
        existing.setDescription(tripPlan.getDescription());
        existing.setStartDate(updatedStartDate);
        existing.setEndDate(updatedEndDate);
        existing.setTripType(updatedTripType);
        existing.setActionsJson(tripPlan.getActionsJson());
        if (tripPlan.getIsActive() != null) {
            existing.setIsActive(tripPlan.getIsActive());
        }

        return tripPlanRepository.save(existing);
    }

    public Optional<TripPlan> partialUpdate(TripPlan tripPlan) {
        LOG.debug("Request to partially update TripPlan : {}", tripPlan);
        return tripPlanRepository
            .findById(tripPlan.getId())
            .map(existing -> {
                LocalDateTime updatedStartDate = tripPlan.getStartDate() != null ? tripPlan.getStartDate() : existing.getStartDate();
                LocalDateTime updatedEndDate = tripPlan.getEndDate() != null ? tripPlan.getEndDate() : existing.getEndDate();

                validateTripDates(updatedStartDate, updatedEndDate);
                validateExistingStepsWithinTripDates(existing, updatedStartDate, updatedEndDate);
                TripType updatedTripType = tripPlan.getTripType() != null ? tripPlan.getTripType() : existing.getTripType();
                validateTripTypePermissions(updatedTripType, existing.getTripType());
                if (tripPlan.getActionsJson() != null) {
                    validateTripActionsJson(tripPlan.getActionsJson());
                }

                if (tripPlan.getTitle() != null) existing.setTitle(tripPlan.getTitle());
                if (tripPlan.getDescription() != null) existing.setDescription(tripPlan.getDescription());
                if (tripPlan.getStartDate() != null) existing.setStartDate(updatedStartDate);
                if (tripPlan.getEndDate() != null) existing.setEndDate(updatedEndDate);
                if (tripPlan.getTripType() != null) existing.setTripType(updatedTripType);
                if (tripPlan.getActionsJson() != null) existing.setActionsJson(tripPlan.getActionsJson());
                if (tripPlan.getIsActive() != null) existing.setIsActive(tripPlan.getIsActive());
                return existing;
            })
            .map(tripPlanRepository::save);
    }

    @Transactional(readOnly = true)
    public Optional<TripPlan> findOne(Long id) {
        LOG.debug("Request to get TripPlan : {}", id);
        return tripPlanRepository.findById(id);
    }

    /** Returns all trips owned by the currently authenticated user. */
    @Transactional(readOnly = true)
    public List<TripPlan> findByCurrentUser() {
        String login = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new IllegalStateException("User not authenticated"));

        boolean isChildOnly = SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.CHILD)
            && SecurityUtils.hasCurrentUserNoneOfAuthorities(AuthoritiesConstants.PARENT, AuthoritiesConstants.ADMIN, AuthoritiesConstants.USER);

        if (isChildOnly) {
            User currentUser = userRepository.findOneByLogin(login)
                .orElseThrow(() -> new IllegalStateException("User not found for login: " + login));

            ExtendedUser me = extendedUserRepository.findOneByUserId(currentUser.getId()).orElse(null);

            Long familyId = null;
            if (currentUser.getFamily() != null && currentUser.getFamily().getId() != null) {
                familyId = currentUser.getFamily().getId();
            } else if (me != null && me.getFamily() != null && me.getFamily().getId() != null) {
                familyId = me.getFamily().getId();
            }

            Map<Long, TripPlan> visibleTrips = new LinkedHashMap<>();

            if (familyId != null) {
                List<TripPlan> byUserFamily = tripPlanRepository.findByTripTypeAndOwnerUserFamilyIdOrderByStartDateAsc(TripType.FAMILY, familyId);
                for (TripPlan trip : byUserFamily) {
                    if (trip.getId() != null) {
                        visibleTrips.put(trip.getId(), trip);
                    }
                }
            }

            String createdBy = currentUser.getCreatedBy();
            if (createdBy != null && !createdBy.isBlank()) {
                List<TripPlan> byCreatorParent = tripPlanRepository.findByTripTypeAndOwnerUserLoginOrderByStartDateAsc(TripType.FAMILY, createdBy);
                for (TripPlan trip : byCreatorParent) {
                    if (trip.getId() != null) {
                        visibleTrips.putIfAbsent(trip.getId(), trip);
                    }
                }
            }

            List<TripPlan> childVisibleTrips = new ArrayList<>(visibleTrips.values());
            childVisibleTrips.sort(Comparator.comparing(TripPlan::getStartDate, Comparator.nullsLast(Comparator.naturalOrder())));
            return childVisibleTrips;
        }

        List<TripPlan> ownTrips = tripPlanRepository.findByOwnerUserLoginOrderByStartDateAsc(login);

        if (SecurityUtils.hasCurrentUserAnyOfAuthorities(AuthoritiesConstants.PARENT, AuthoritiesConstants.ADMIN)) {
            ExtendedUser me = userRepository.findOneByLogin(login)
                .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
                .orElse(null);

            if (me != null && me.getFamily() != null && me.getFamily().getId() != null) {
                List<TripPlan> familyTrips = tripPlanRepository.findByTripTypeAndOwnerFamilyIdOrderByStartDateAsc(TripType.FAMILY, me.getFamily().getId());
                Map<Long, TripPlan> mergedById = new LinkedHashMap<>();
                for (TripPlan trip : ownTrips) {
                    if (trip.getId() != null) {
                        mergedById.put(trip.getId(), trip);
                    }
                }
                for (TripPlan trip : familyTrips) {
                    if (trip.getId() != null) {
                        mergedById.putIfAbsent(trip.getId(), trip);
                    }
                }

                List<TripPlan> merged = new ArrayList<>(mergedById.values());
                merged.sort(Comparator.comparing(TripPlan::getStartDate, Comparator.nullsLast(Comparator.naturalOrder())));
                return merged;
            }
        }

        return ownTrips;
    }

    /** Delete a trip and all its steps (cascade). */
    public void delete(Long id) {
        LOG.debug("Request to delete TripPlan : {}", id);
        tripPlanRepository.deleteById(id);
    }

    private void validateExistingStepsWithinTripDates(TripPlan tripPlan, LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null || endDate == null) {
            return;
        }

        for (TripPlanStep step : tripPlan.getSteps()) {
            if (step.getStartDate() != null && step.getStartDate().isBefore(startDate)) {
                throw new BadRequestAlertException(
                    "trips.errors.stepStartDateBeforeTripStart",
                    "tripPlan",
                    "stepStartDateBeforeTripStart"
                );
            }

            if (step.getEndDate() != null && step.getEndDate().isAfter(endDate)) {
                throw new BadRequestAlertException(
                    "trips.errors.stepEndDateAfterTripEnd",
                    "tripPlan",
                    "stepEndDateAfterTripEnd"
                );
            }
        }
    }

    private void validateTripDates(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null || endDate == null) {
            return;
        }


        if (startDate.isAfter(endDate)) {
            throw new BadRequestAlertException("trips.errors.startDateAfterEndDate", "tripPlan", "startDateAfterEndDate");
        }
    }

    private void validateTripTypePermissions(TripType updatedTripType, TripType existingTripType) {
        boolean touchesFamilyType = updatedTripType == TripType.FAMILY || existingTripType == TripType.FAMILY;
        if (!touchesFamilyType) {
            return;
        }

        boolean canManageFamilyTrips = SecurityUtils.hasCurrentUserAnyOfAuthorities(AuthoritiesConstants.PARENT, AuthoritiesConstants.ADMIN);
        if (!canManageFamilyTrips) {
            throw new BadRequestAlertException("trips.errors.familyTypeOnlyParents", "tripPlan", "familyTypeOnlyParents");
        }
    }

    private void validateTripActionsJson(String actionsJson) {
        if (actionsJson == null || actionsJson.isBlank()) {
            return;
        }

        try {
            JsonNode root = objectMapper.readTree(actionsJson);
            if (!root.isObject()) {
                throw new BadRequestAlertException("trips.errors.tripActionsInvalidJson", "tripPlan", "tripActionsInvalidJson");
            }

            validateActionsList(root.get("preparationActions"), "preparationActions");
            validateActionsList(root.get("duringTripActions"), "duringTripActions");
        } catch (BadRequestAlertException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadRequestAlertException("trips.errors.tripActionsInvalidJson", "tripPlan", "tripActionsInvalidJson");
        }
    }

    private void validateActionsList(JsonNode listNode, String listName) {
        if (listNode == null || listNode.isNull()) {
            return;
        }

        if (!listNode.isArray()) {
            throw new BadRequestAlertException("trips.errors.tripActionsInvalidJson", "tripPlan", "tripActionsInvalidJson");
        }

        if (listNode.size() > MAX_ACTIONS_PER_LIST) {
            throw new BadRequestAlertException("trips.errors.tripActionsListTooLarge", "tripPlan", listName + "TooLarge");
        }

        for (JsonNode item : listNode) {
            String text;
            if (item.isTextual()) {
                text = item.asText().trim();
            } else if (item.isObject()) {
                JsonNode textNode = item.get("actionText");
                if (textNode == null || !textNode.isTextual()) {
                    textNode = item.get("text");
                }

                if (textNode == null || !textNode.isTextual()) {
                    throw new BadRequestAlertException("trips.errors.tripActionsInvalidJson", "tripPlan", "tripActionsInvalidJson");
                }

                JsonNode statusNode = item.get("actionStatus");
                if (statusNode == null || statusNode.isNull()) {
                    statusNode = item.get("done");
                }

                if (statusNode != null && !statusNode.isNull() && !statusNode.isBoolean()) {
                    throw new BadRequestAlertException("trips.errors.tripActionsInvalidJson", "tripPlan", "tripActionsInvalidJson");
                }

                text = textNode.asText().trim();
            } else {
                throw new BadRequestAlertException("trips.errors.tripActionsInvalidJson", "tripPlan", "tripActionsInvalidJson");
            }

            if (text.isEmpty()) {
                throw new BadRequestAlertException("trips.errors.tripActionsInvalidJson", "tripPlan", "tripActionsInvalidJson");
            }

            if (text.length() > MAX_ACTION_TEXT_LENGTH) {
                throw new BadRequestAlertException("trips.errors.tripActionTextTooLong", "tripPlan", listName + "ActionTooLong");
            }
        }
    }
}
