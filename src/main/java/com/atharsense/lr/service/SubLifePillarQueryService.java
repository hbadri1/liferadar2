package com.atharsense.lr.service;

import com.atharsense.lr.domain.*; // for static metamodels
import com.atharsense.lr.domain.SubLifePillar;
import com.atharsense.lr.repository.SubLifePillarRepository;
import com.atharsense.lr.service.criteria.SubLifePillarCriteria;
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
 * Service for executing complex queries for {@link SubLifePillar} entities in the database.
 * The main input is a {@link SubLifePillarCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link SubLifePillar} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class SubLifePillarQueryService extends QueryService<SubLifePillar> {

    private static final Logger LOG = LoggerFactory.getLogger(SubLifePillarQueryService.class);

    private final SubLifePillarRepository subLifePillarRepository;

    public SubLifePillarQueryService(SubLifePillarRepository subLifePillarRepository) {
        this.subLifePillarRepository = subLifePillarRepository;
    }

    /**
     * Return a {@link Page} of {@link SubLifePillar} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<SubLifePillar> findByCriteria(SubLifePillarCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<SubLifePillar> specification = createSpecification(criteria);
        return subLifePillarRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(SubLifePillarCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<SubLifePillar> specification = createSpecification(criteria);
        return subLifePillarRepository.count(specification);
    }

    /**
     * Function to convert {@link SubLifePillarCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<SubLifePillar> createSpecification(SubLifePillarCriteria criteria) {
        Specification<SubLifePillar> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : null,
                buildRangeSpecification(criteria.getId(), SubLifePillar_.id),
                buildStringSpecification(criteria.getCode(), SubLifePillar_.code),
                buildSpecification(criteria.getIsActive(), SubLifePillar_.isActive),
                buildSpecification(criteria.getTranslationsId(), root ->
                    root.join(SubLifePillar_.translations, JoinType.LEFT).get(SubLifePillarTranslation_.id)
                ),
                buildSpecification(criteria.getOwnerId(), root -> root.join(SubLifePillar_.owner, JoinType.LEFT).get(ExtendedUser_.id))
            );
        }
        return specification;
    }
}
