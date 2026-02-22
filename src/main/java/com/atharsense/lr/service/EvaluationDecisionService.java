package com.atharsense.lr.service;

import com.atharsense.lr.domain.EvaluationDecision;
import com.atharsense.lr.repository.EvaluationDecisionRepository;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.atharsense.lr.domain.EvaluationDecision}.
 */
@Service
@Transactional
public class EvaluationDecisionService {

    private static final Logger LOG = LoggerFactory.getLogger(EvaluationDecisionService.class);

    private final EvaluationDecisionRepository evaluationDecisionRepository;

    public EvaluationDecisionService(EvaluationDecisionRepository evaluationDecisionRepository) {
        this.evaluationDecisionRepository = evaluationDecisionRepository;
    }

    /**
     * Save a evaluationDecision.
     *
     * @param evaluationDecision the entity to save.
     * @return the persisted entity.
     */
    public EvaluationDecision save(EvaluationDecision evaluationDecision) {
        LOG.debug("Request to save EvaluationDecision : {}", evaluationDecision);
        return evaluationDecisionRepository.save(evaluationDecision);
    }

    /**
     * Update a evaluationDecision.
     *
     * @param evaluationDecision the entity to save.
     * @return the persisted entity.
     */
    public EvaluationDecision update(EvaluationDecision evaluationDecision) {
        LOG.debug("Request to update EvaluationDecision : {}", evaluationDecision);
        return evaluationDecisionRepository.save(evaluationDecision);
    }

    /**
     * Partially update a evaluationDecision.
     *
     * @param evaluationDecision the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<EvaluationDecision> partialUpdate(EvaluationDecision evaluationDecision) {
        LOG.debug("Request to partially update EvaluationDecision : {}", evaluationDecision);

        return evaluationDecisionRepository
            .findById(evaluationDecision.getId())
            .map(existingEvaluationDecision -> {
                if (evaluationDecision.getDecision() != null) {
                    existingEvaluationDecision.setDecision(evaluationDecision.getDecision());
                }
                if (evaluationDecision.getDate() != null) {
                    existingEvaluationDecision.setDate(evaluationDecision.getDate());
                }

                return existingEvaluationDecision;
            })
            .map(evaluationDecisionRepository::save);
    }

    /**
     * Get one evaluationDecision by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<EvaluationDecision> findOne(Long id) {
        LOG.debug("Request to get EvaluationDecision : {}", id);
        return evaluationDecisionRepository.findById(id);
    }

    /**
     * Delete the evaluationDecision by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete EvaluationDecision : {}", id);
        evaluationDecisionRepository.deleteById(id);
    }
}
