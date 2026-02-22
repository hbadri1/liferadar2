package com.atharsense.lr.service;

import com.atharsense.lr.domain.TripPlan;
import com.atharsense.lr.repository.TripPlanRepository;
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

    public TripPlanService(TripPlanRepository tripPlanRepository) {
        this.tripPlanRepository = tripPlanRepository;
    }

    /**
     * Save a tripPlan.
     *
     * @param tripPlan the entity to save.
     * @return the persisted entity.
     */
    public TripPlan save(TripPlan tripPlan) {
        LOG.debug("Request to save TripPlan : {}", tripPlan);
        return tripPlanRepository.save(tripPlan);
    }

    /**
     * Update a tripPlan.
     *
     * @param tripPlan the entity to save.
     * @return the persisted entity.
     */
    public TripPlan update(TripPlan tripPlan) {
        LOG.debug("Request to update TripPlan : {}", tripPlan);
        return tripPlanRepository.save(tripPlan);
    }

    /**
     * Partially update a tripPlan.
     *
     * @param tripPlan the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<TripPlan> partialUpdate(TripPlan tripPlan) {
        LOG.debug("Request to partially update TripPlan : {}", tripPlan);

        return tripPlanRepository
            .findById(tripPlan.getId())
            .map(existingTripPlan -> {
                if (tripPlan.getTitle() != null) {
                    existingTripPlan.setTitle(tripPlan.getTitle());
                }
                if (tripPlan.getDescription() != null) {
                    existingTripPlan.setDescription(tripPlan.getDescription());
                }
                if (tripPlan.getStartDate() != null) {
                    existingTripPlan.setStartDate(tripPlan.getStartDate());
                }
                if (tripPlan.getEndDate() != null) {
                    existingTripPlan.setEndDate(tripPlan.getEndDate());
                }

                return existingTripPlan;
            })
            .map(tripPlanRepository::save);
    }

    /**
     * Get one tripPlan by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<TripPlan> findOne(Long id) {
        LOG.debug("Request to get TripPlan : {}", id);
        return tripPlanRepository.findById(id);
    }

    /**
     * Delete the tripPlan by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete TripPlan : {}", id);
        tripPlanRepository.deleteById(id);
    }
}
