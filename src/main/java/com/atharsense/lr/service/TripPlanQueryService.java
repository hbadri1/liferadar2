package com.atharsense.lr.service;

import com.atharsense.lr.domain.ExtendedUser;
import com.atharsense.lr.domain.TripPlan;
import com.atharsense.lr.repository.TripPlanRepository;
import com.atharsense.lr.service.criteria.TripPlanCriteria;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Join;
import java.time.LocalDate;
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
        return tripPlanRepository.findAll(createSpecification(criteria), page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(TripPlanCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        return tripPlanRepository.count(createSpecification(criteria));
    }

    /**
     * Function to convert {@link TripPlanCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<TripPlan> createSpecification(TripPlanCriteria criteria) {
        Specification<TripPlan> spec = Specification.where(null);
        if (criteria == null) return spec;

        if (criteria.getId() != null) {
            spec = spec.and((root, query, cb) -> {
                var filter = criteria.getId();
                if (filter.getEquals() != null) return cb.equal(root.get("id"), filter.getEquals());
                if (filter.getGreaterThan() != null) return cb.greaterThan(root.get("id"), filter.getGreaterThan());
                if (filter.getLessThan() != null) return cb.lessThan(root.get("id"), filter.getLessThan());
                return null;
            });
        }
        if (criteria.getTitle() != null) {
            spec = spec.and((root, query, cb) -> {
                var filter = criteria.getTitle();
                if (filter.getEquals() != null) return cb.equal(root.get("title"), filter.getEquals());
                if (filter.getContains() != null) return cb.like(cb.lower(root.get("title")), "%" + filter.getContains().toLowerCase() + "%");
                return null;
            });
        }
        if (criteria.getDescription() != null) {
            spec = spec.and((root, query, cb) -> {
                var filter = criteria.getDescription();
                if (filter.getEquals() != null) return cb.equal(root.get("description"), filter.getEquals());
                if (filter.getContains() != null) return cb.like(cb.lower(root.get("description")), "%" + filter.getContains().toLowerCase() + "%");
                return null;
            });
        }
        if (criteria.getStartDate() != null) {
            spec = spec.and((root, query, cb) -> {
                var filter = criteria.getStartDate();
                if (filter.getEquals() != null) return cb.equal(root.<LocalDate>get("startDate"), filter.getEquals());
                if (filter.getGreaterThanOrEqual() != null) return cb.greaterThanOrEqualTo(root.get("startDate"), filter.getGreaterThanOrEqual());
                if (filter.getLessThanOrEqual() != null) return cb.lessThanOrEqualTo(root.get("startDate"), filter.getLessThanOrEqual());
                return null;
            });
        }
        if (criteria.getEndDate() != null) {
            spec = spec.and((root, query, cb) -> {
                var filter = criteria.getEndDate();
                if (filter.getEquals() != null) return cb.equal(root.<LocalDate>get("endDate"), filter.getEquals());
                if (filter.getGreaterThanOrEqual() != null) return cb.greaterThanOrEqualTo(root.get("endDate"), filter.getGreaterThanOrEqual());
                if (filter.getLessThanOrEqual() != null) return cb.lessThanOrEqualTo(root.get("endDate"), filter.getLessThanOrEqual());
                return null;
            });
        }
        if (criteria.getOwnerId() != null) {
            spec = spec.and((root, query, cb) -> {
                Join<TripPlan, ExtendedUser> ownerJoin = root.join("owner", JoinType.LEFT);
                var filter = criteria.getOwnerId();
                if (filter.getEquals() != null) return cb.equal(ownerJoin.get("id"), filter.getEquals());
                return null;
            });
        }
        return spec;
    }
}
