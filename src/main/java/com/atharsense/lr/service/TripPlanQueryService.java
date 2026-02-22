package com.atharsense.lr.service;

import com.atharsense.lr.domain.*; // for static metamodels
import com.atharsense.lr.domain.TripPlan;
import com.atharsense.lr.repository.TripPlanRepository;
import com.atharsense.lr.service.criteria.TripPlanCriteria;
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
 * Service for executing complex queries for {@link TripPlan} entities in the database.
 * The main input is a {@link TripPlanCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link TripPlan} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class TripPlanQueryService extends QueryService<TripPlan> {

    private static final Logger LOG = LoggerFactory.getLogger(TripPlanQueryService.class);

    private final TripPlanRepository tripPlanRepository;

    public TripPlanQueryService(TripPlanRepository tripPlanRepository) {
        this.tripPlanRepository = tripPlanRepository;
    }

    /**
     * Return a {@link Page} of {@link TripPlan} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<TripPlan> findByCriteria(TripPlanCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<TripPlan> specification = createSpecification(criteria);
        return tripPlanRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(TripPlanCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<TripPlan> specification = createSpecification(criteria);
        return tripPlanRepository.count(specification);
    }

    /**
     * Function to convert {@link TripPlanCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<TripPlan> createSpecification(TripPlanCriteria criteria) {
        Specification<TripPlan> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : null,
                buildRangeSpecification(criteria.getId(), TripPlan_.id),
                buildStringSpecification(criteria.getTitle(), TripPlan_.title),
                buildStringSpecification(criteria.getDescription(), TripPlan_.description),
                buildRangeSpecification(criteria.getStartDate(), TripPlan_.startDate),
                buildRangeSpecification(criteria.getEndDate(), TripPlan_.endDate),
                buildSpecification(criteria.getOwnerId(), root -> root.join(TripPlan_.owner, JoinType.LEFT).get(ExtendedUser_.id))
            );
        }
        return specification;
    }
}
