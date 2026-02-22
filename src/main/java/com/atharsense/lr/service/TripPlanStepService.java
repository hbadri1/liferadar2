package com.atharsense.lr.service;

import com.atharsense.lr.domain.TripPlanStep;
import com.atharsense.lr.repository.TripPlanStepRepository;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.atharsense.lr.domain.TripPlanStep}.
 */
@Service
@Transactional
public class TripPlanStepService {

    private static final Logger LOG = LoggerFactory.getLogger(TripPlanStepService.class);

    private final TripPlanStepRepository tripPlanStepRepository;

    public TripPlanStepService(TripPlanStepRepository tripPlanStepRepository) {
        this.tripPlanStepRepository = tripPlanStepRepository;
    }

    /**
     * Save a tripPlanStep.
     *
     * @param tripPlanStep the entity to save.
     * @return the persisted entity.
     */
    public TripPlanStep save(TripPlanStep tripPlanStep) {
        LOG.debug("Request to save TripPlanStep : {}", tripPlanStep);
        return tripPlanStepRepository.save(tripPlanStep);
    }

    /**
     * Update a tripPlanStep.
     *
     * @param tripPlanStep the entity to save.
     * @return the persisted entity.
     */
    public TripPlanStep update(TripPlanStep tripPlanStep) {
        LOG.debug("Request to update TripPlanStep : {}", tripPlanStep);
        return tripPlanStepRepository.save(tripPlanStep);
    }

    /**
     * Partially update a tripPlanStep.
     *
     * @param tripPlanStep the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<TripPlanStep> partialUpdate(TripPlanStep tripPlanStep) {
        LOG.debug("Request to partially update TripPlanStep : {}", tripPlanStep);

        return tripPlanStepRepository
            .findById(tripPlanStep.getId())
            .map(existingTripPlanStep -> {
                if (tripPlanStep.getStartDate() != null) {
                    existingTripPlanStep.setStartDate(tripPlanStep.getStartDate());
                }
                if (tripPlanStep.getEndDate() != null) {
                    existingTripPlanStep.setEndDate(tripPlanStep.getEndDate());
                }
                if (tripPlanStep.getActionName() != null) {
                    existingTripPlanStep.setActionName(tripPlanStep.getActionName());
                }
                if (tripPlanStep.getSequence() != null) {
                    existingTripPlanStep.setSequence(tripPlanStep.getSequence());
                }
                if (tripPlanStep.getNotes() != null) {
                    existingTripPlanStep.setNotes(tripPlanStep.getNotes());
                }

                return existingTripPlanStep;
            })
            .map(tripPlanStepRepository::save);
    }

    /**
     * Get all the tripPlanSteps.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<TripPlanStep> findAll() {
        LOG.debug("Request to get all TripPlanSteps");
        return tripPlanStepRepository.findAll();
    }

    /**
     * Get one tripPlanStep by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<TripPlanStep> findOne(Long id) {
        LOG.debug("Request to get TripPlanStep : {}", id);
        return tripPlanStepRepository.findById(id);
    }

    /**
     * Delete the tripPlanStep by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete TripPlanStep : {}", id);
        tripPlanStepRepository.deleteById(id);
    }
}
