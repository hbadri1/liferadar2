package com.atharsense.lr.service;

import com.atharsense.lr.domain.*; // for static metamodels
import com.atharsense.lr.domain.SubLifePillarItem;
import com.atharsense.lr.repository.SubLifePillarItemRepository;
import com.atharsense.lr.service.criteria.SubLifePillarItemCriteria;
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
 * Service for executing complex queries for {@link SubLifePillarItem} entities in the database.
 * The main input is a {@link SubLifePillarItemCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link SubLifePillarItem} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class SubLifePillarItemQueryService extends QueryService<SubLifePillarItem> {

    private static final Logger LOG = LoggerFactory.getLogger(SubLifePillarItemQueryService.class);

    private final SubLifePillarItemRepository subLifePillarItemRepository;

    public SubLifePillarItemQueryService(SubLifePillarItemRepository subLifePillarItemRepository) {
        this.subLifePillarItemRepository = subLifePillarItemRepository;
    }

    /**
     * Return a {@link Page} of {@link SubLifePillarItem} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<SubLifePillarItem> findByCriteria(SubLifePillarItemCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<SubLifePillarItem> specification = createSpecification(criteria);
        return subLifePillarItemRepository.findAll(specification, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(SubLifePillarItemCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<SubLifePillarItem> specification = createSpecification(criteria);
        return subLifePillarItemRepository.count(specification);
    }

    /**
     * Function to convert {@link SubLifePillarItemCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<SubLifePillarItem> createSpecification(SubLifePillarItemCriteria criteria) {
        Specification<SubLifePillarItem> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : null,
                buildRangeSpecification(criteria.getId(), SubLifePillarItem_.id),
                buildStringSpecification(criteria.getCode(), SubLifePillarItem_.code),
                buildRangeSpecification(criteria.getSortOrder(), SubLifePillarItem_.sortOrder),
                buildSpecification(criteria.getIsActive(), SubLifePillarItem_.isActive),
                buildSpecification(criteria.getTranslationsId(), root ->
                    root.join(SubLifePillarItem_.translations, JoinType.LEFT).get(SubLifePillarItemTranslation_.id)
                ),
                buildSpecification(criteria.getOwnerId(), root -> root.join(SubLifePillarItem_.owner, JoinType.LEFT).get(ExtendedUser_.id))
            );
        }
        return specification;
    }
}
