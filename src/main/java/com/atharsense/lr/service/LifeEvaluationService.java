package com.atharsense.lr.service;

import com.atharsense.lr.domain.LifeEvaluation;
import com.atharsense.lr.repository.LifeEvaluationRepository;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.atharsense.lr.domain.LifeEvaluation}.
 */
@Service
@Transactional
public class LifeEvaluationService {

    private static final Logger LOG = LoggerFactory.getLogger(LifeEvaluationService.class);

    private final LifeEvaluationRepository lifeEvaluationRepository;

    public LifeEvaluationService(LifeEvaluationRepository lifeEvaluationRepository) {
        this.lifeEvaluationRepository = lifeEvaluationRepository;
    }

    /**
     * Save a lifeEvaluation.
     *
     * @param lifeEvaluation the entity to save.
     * @return the persisted entity.
     */
    public LifeEvaluation save(LifeEvaluation lifeEvaluation) {
        LOG.debug("Request to save LifeEvaluation : {}", lifeEvaluation);
        return lifeEvaluationRepository.save(lifeEvaluation);
    }

    /**
     * Update a lifeEvaluation.
     *
     * @param lifeEvaluation the entity to save.
     * @return the persisted entity.
     */
    public LifeEvaluation update(LifeEvaluation lifeEvaluation) {
        LOG.debug("Request to update LifeEvaluation : {}", lifeEvaluation);
        return lifeEvaluationRepository.save(lifeEvaluation);
    }

    /**
     * Partially update a lifeEvaluation.
     *
     * @param lifeEvaluation the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<LifeEvaluation> partialUpdate(LifeEvaluation lifeEvaluation) {
        LOG.debug("Request to partially update LifeEvaluation : {}", lifeEvaluation);

        return lifeEvaluationRepository
            .findById(lifeEvaluation.getId())
            .map(existingLifeEvaluation -> {
                if (lifeEvaluation.getEvaluationDate() != null) {
                    existingLifeEvaluation.setEvaluationDate(lifeEvaluation.getEvaluationDate());
                }
                if (lifeEvaluation.getReminderEnabled() != null) {
                    existingLifeEvaluation.setReminderEnabled(lifeEvaluation.getReminderEnabled());
                }
                if (lifeEvaluation.getReminderAt() != null) {
                    existingLifeEvaluation.setReminderAt(lifeEvaluation.getReminderAt());
                }
                if (lifeEvaluation.getScore() != null) {
                    existingLifeEvaluation.setScore(lifeEvaluation.getScore());
                }
                if (lifeEvaluation.getNotes() != null) {
                    existingLifeEvaluation.setNotes(lifeEvaluation.getNotes());
                }

                return existingLifeEvaluation;
            })
            .map(lifeEvaluationRepository::save);
    }

    /**
     * Get one lifeEvaluation by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<LifeEvaluation> findOne(Long id) {
        LOG.debug("Request to get LifeEvaluation : {}", id);
        return lifeEvaluationRepository.findById(id);
    }

    /**
     * Delete the lifeEvaluation by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete LifeEvaluation : {}", id);
        lifeEvaluationRepository.deleteById(id);
    }
}
