package com.atharsense.lr.service;

import com.atharsense.lr.domain.ExtendedUser;
import com.atharsense.lr.domain.TripPlan;
import com.atharsense.lr.domain.TripPlanStep;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.repository.TripPlanRepository;
import com.atharsense.lr.repository.UserRepository;
import com.atharsense.lr.security.SecurityUtils;
import com.atharsense.lr.web.rest.errors.BadRequestAlertException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
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

    private final TripPlanRepository tripPlanRepository;
    private final ExtendedUserRepository extendedUserRepository;
    private final UserRepository userRepository;

    public TripPlanService(
        TripPlanRepository tripPlanRepository,
        ExtendedUserRepository extendedUserRepository,
        UserRepository userRepository
    ) {
        this.tripPlanRepository = tripPlanRepository;
        this.extendedUserRepository = extendedUserRepository;
        this.userRepository = userRepository;
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
        return tripPlanRepository.save(tripPlan);
    }

    public TripPlan update(TripPlan tripPlan) {
        LOG.debug("Request to update TripPlan : {}", tripPlan);
        TripPlan existing = tripPlanRepository
            .findById(tripPlan.getId())
            .orElseThrow(() -> new IllegalArgumentException("Trip not found: " + tripPlan.getId()));

        LocalDate updatedStartDate = tripPlan.getStartDate() != null ? tripPlan.getStartDate() : existing.getStartDate();
        LocalDate updatedEndDate = tripPlan.getEndDate() != null ? tripPlan.getEndDate() : existing.getEndDate();

        validateTripDates(updatedStartDate, updatedEndDate);
        validateExistingStepsWithinTripDates(existing, updatedStartDate, updatedEndDate);

        existing.setTitle(tripPlan.getTitle());
        existing.setDescription(tripPlan.getDescription());
        existing.setStartDate(updatedStartDate);
        existing.setEndDate(updatedEndDate);
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
                LocalDate updatedStartDate = tripPlan.getStartDate() != null ? tripPlan.getStartDate() : existing.getStartDate();
                LocalDate updatedEndDate = tripPlan.getEndDate() != null ? tripPlan.getEndDate() : existing.getEndDate();

                validateTripDates(updatedStartDate, updatedEndDate);
                validateExistingStepsWithinTripDates(existing, updatedStartDate, updatedEndDate);

                if (tripPlan.getTitle() != null) existing.setTitle(tripPlan.getTitle());
                if (tripPlan.getDescription() != null) existing.setDescription(tripPlan.getDescription());
                if (tripPlan.getStartDate() != null) existing.setStartDate(updatedStartDate);
                if (tripPlan.getEndDate() != null) existing.setEndDate(updatedEndDate);
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
        return tripPlanRepository.findByOwnerUserLoginOrderByStartDateAsc(login);
    }

    /** Delete a trip and all its steps (cascade). */
    public void delete(Long id) {
        LOG.debug("Request to delete TripPlan : {}", id);
        tripPlanRepository.deleteById(id);
    }

    private void validateExistingStepsWithinTripDates(TripPlan tripPlan, LocalDate startDate, LocalDate endDate) {
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

    private void validateTripDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            return;
        }

        LocalDate today = LocalDate.now();

        if (startDate.isBefore(today)) {
            throw new BadRequestAlertException("trips.errors.startDateInPast", "tripPlan", "startDateInPast");
        }

        if (endDate.isBefore(today)) {
            throw new BadRequestAlertException("trips.errors.endDateInPast", "tripPlan", "endDateInPast");
        }

        if (startDate.isAfter(endDate)) {
            throw new BadRequestAlertException("trips.errors.startDateAfterEndDate", "tripPlan", "startDateAfterEndDate");
        }
    }
}
