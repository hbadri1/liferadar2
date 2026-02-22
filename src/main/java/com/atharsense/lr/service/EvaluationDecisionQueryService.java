package com.atharsense.lr.service;

import com.atharsense.lr.domain.*; // for static metamodels
import com.atharsense.lr.domain.EvaluationDecision;
import com.atharsense.lr.repository.EvaluationDecisionRepository;
import com.atharsense.lr.service.criteria.EvaluationDecisionCriteria;
import jakarta.persistence.criteria.JoinType;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link EvaluationDecision} entities in the database.
 * The main input is a {@link EvaluationDecisionCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link EvaluationDecision} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class EvaluationDecisionQueryService extends QueryService<EvaluationDecision> {

    private static final Logger LOG = LoggerFactory.getLogger(EvaluationDecisionQueryService.class);

    private final EvaluationDecisionRepository evaluationDecisionRepository;

    public EvaluationDecisionQueryService(EvaluationDecisionRepository evaluationDecisionRepository) {
        this.evaluationDecisionRepository = evaluationDecisionRepository;
    }

    /**
     * Return a {@link List} of {@link EvaluationDecision} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<EvaluationDecision> findByCriteria(EvaluationDecisionCriteria criteria) {
        LOG.debug("find by criteria : {}", criteria);
        final Specification<EvaluationDecision> specification = createSpecification(criteria);
        return evaluationDecisionRepository.findAll(specification);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(EvaluationDecisionCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<EvaluationDecision> specification = createSpecification(criteria);
        return evaluationDecisionRepository.count(specification);
    }

    /**
     * Function to convert {@link EvaluationDecisionCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<EvaluationDecision> createSpecification(EvaluationDecisionCriteria criteria) {
        Specification<EvaluationDecision> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : null,
                buildRangeSpecification(criteria.getId(), EvaluationDecision_.id),
                buildStringSpecification(criteria.getDecision(), EvaluationDecision_.decision),
                buildRangeSpecification(criteria.getDate(), EvaluationDecision_.date),
                buildSpecification(criteria.getOwnerId(), root -> root.join(EvaluationDecision_.owner, JoinType.LEFT).get(ExtendedUser_.id)
                ),
                buildSpecification(criteria.getLifeEvaluationId(), root ->
                    root.join(EvaluationDecision_.lifeEvaluation, JoinType.LEFT).get(LifeEvaluation_.id)
                )
            );
        }
        return specification;
    }
}
