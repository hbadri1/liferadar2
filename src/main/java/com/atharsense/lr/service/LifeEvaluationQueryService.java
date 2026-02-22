package com.atharsense.lr.service;

import com.atharsense.lr.domain.*; // for static metamodels
import com.atharsense.lr.domain.LifeEvaluation;
import com.atharsense.lr.repository.LifeEvaluationRepository;
import com.atharsense.lr.service.criteria.LifeEvaluationCriteria;
import jakarta.persistence.criteria.JoinType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link LifeEvaluation} entities in the database.
 * The main input is a {@link LifeEvaluationCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link LifeEvaluation} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class LifeEvaluationQueryService extends QueryService<LifeEvaluation> {

    private static final Logger LOG = LoggerFactory.getLogger(LifeEvaluationQueryService.class);

    private final LifeEvaluationRepository lifeEvaluationRepository;

    public LifeEvaluationQueryService(LifeEvaluationRepository lifeEvaluationRepository) {
        this.lifeEvaluationRepository = lifeEvaluationRepository;
    }

    /**
     * Return a {@link Page} of {@link LifeEvaluation} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<LifeEvaluation> findByCriteria(LifeEvaluationCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<LifeEvaluation> specification = createSpecification(criteria);
        return lifeEvaluationRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(LifeEvaluationCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<LifeEvaluation> specification = createSpecification(criteria);
        return lifeEvaluationRepository.count(specification);
    }

    /**
     * Function to convert {@link LifeEvaluationCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<LifeEvaluation> createSpecification(LifeEvaluationCriteria criteria) {
        Specification<LifeEvaluation> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : null,
                buildRangeSpecification(criteria.getId(), LifeEvaluation_.id),
                buildRangeSpecification(criteria.getEvaluationDate(), LifeEvaluation_.evaluationDate),
                buildSpecification(criteria.getReminderEnabled(), LifeEvaluation_.reminderEnabled),
                buildRangeSpecification(criteria.getReminderAt(), LifeEvaluation_.reminderAt),
                buildRangeSpecification(criteria.getScore(), LifeEvaluation_.score),
                buildStringSpecification(criteria.getNotes(), LifeEvaluation_.notes),
                buildSpecification(criteria.getDecisionsId(), root ->
                    root.join(LifeEvaluation_.decisions, JoinType.LEFT).get(EvaluationDecision_.id)
                ),
                buildSpecification(criteria.getOwnerId(), root -> root.join(LifeEvaluation_.owner, JoinType.LEFT).get(ExtendedUser_.id)),
                buildSpecification(criteria.getSubLifePillarItemId(), root ->
                    root.join(LifeEvaluation_.subLifePillarItem, JoinType.LEFT).get(SubLifePillarItem_.id)
                )
            );
        }
        return specification;
    }
}
