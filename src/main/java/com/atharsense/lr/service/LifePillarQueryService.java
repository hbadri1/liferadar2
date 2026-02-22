package com.atharsense.lr.service;

import com.atharsense.lr.domain.*; // for static metamodels
import com.atharsense.lr.domain.LifePillar;
import com.atharsense.lr.repository.LifePillarRepository;
import com.atharsense.lr.service.criteria.LifePillarCriteria;
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
 * Service for executing complex queries for {@link LifePillar} entities in the database.
 * The main input is a {@link LifePillarCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link LifePillar} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class LifePillarQueryService extends QueryService<LifePillar> {

    private static final Logger LOG = LoggerFactory.getLogger(LifePillarQueryService.class);

    private final LifePillarRepository lifePillarRepository;

    public LifePillarQueryService(LifePillarRepository lifePillarRepository) {
        this.lifePillarRepository = lifePillarRepository;
    }

    /**
     * Return a {@link Page} of {@link LifePillar} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<LifePillar> findByCriteria(LifePillarCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<LifePillar> specification = createSpecification(criteria);
        return lifePillarRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(LifePillarCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<LifePillar> specification = createSpecification(criteria);
        return lifePillarRepository.count(specification);
    }

    /**
     * Function to convert {@link LifePillarCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<LifePillar> createSpecification(LifePillarCriteria criteria) {
        Specification<LifePillar> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : null,
                buildRangeSpecification(criteria.getId(), LifePillar_.id),
                buildStringSpecification(criteria.getCode(), LifePillar_.code),
                buildSpecification(criteria.getIsActive(), LifePillar_.isActive),
                buildSpecification(criteria.getTranslationsId(), root ->
                    root.join(LifePillar_.translations, JoinType.LEFT).get(LifePillarTranslation_.id)
                ),
                buildSpecification(criteria.getOwnerId(), root -> root.join(LifePillar_.owner, JoinType.LEFT).get(ExtendedUser_.id))
            );
        }
        return specification;
    }
}
