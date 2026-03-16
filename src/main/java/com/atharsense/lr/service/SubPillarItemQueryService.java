package com.atharsense.lr.service;

import com.atharsense.lr.domain.*; // for static metamodels
import com.atharsense.lr.domain.SubPillarItem;
import com.atharsense.lr.repository.SubPillarItemRepository;
import com.atharsense.lr.service.criteria.SubPillarItemCriteria;
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
 * Service for executing complex queries for {@link SubPillarItem} entities in the database.
 * The main input is a {@link SubPillarItemCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link SubPillarItem} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class SubPillarItemQueryService extends QueryService<SubPillarItem> {

    private static final Logger LOG = LoggerFactory.getLogger(SubPillarItemQueryService.class);

    private final SubPillarItemRepository subPillarItemRepository;

    public SubPillarItemQueryService(SubPillarItemRepository subPillarItemRepository) {
        this.subPillarItemRepository = subPillarItemRepository;
    }

    /**
     * Return a {@link Page} of {@link SubPillarItem} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<SubPillarItem> findByCriteria(SubPillarItemCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<SubPillarItem> specification = createSpecification(criteria);
        return subPillarItemRepository.findAll(specification, page);
    }



    /**
     * Return a {@link Page} of {@link SubPillarItem} with eager loaded relationships which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities with eager loaded relationships.
     */
    @Transactional(readOnly = true)
    public Page<SubPillarItem> findByCriteriaWithEagerRelationships(SubPillarItemCriteria criteria, Pageable page) {
        LOG.debug("find by criteria with eager relationships : {}, page: {}", criteria, page);
        final Specification<SubPillarItem> specification = createSpecification(criteria);
        Page<SubPillarItem> result = subPillarItemRepository.findAll(specification, page);

        // Initialize lazy collections within transaction
        result.getContent().forEach(item -> {
            if (item.getTranslations() != null) {
                item.getTranslations().size();
            }
        });

        return result;
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(SubPillarItemCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<SubPillarItem> specification = createSpecification(criteria);
        return subPillarItemRepository.count(specification);
    }

    /**
     * Function to convert {@link SubPillarItemCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<SubPillarItem> createSpecification(SubPillarItemCriteria criteria) {
        Specification<SubPillarItem> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : null,
                buildRangeSpecification(criteria.getId(), SubPillarItem_.id),
                buildStringSpecification(criteria.getCode(), SubPillarItem_.code),
                buildRangeSpecification(criteria.getSortOrder(), SubPillarItem_.sortOrder),
                buildSpecification(criteria.getIsActive(), SubPillarItem_.isActive),
                buildSpecification(criteria.getTranslationsId(), root ->
                    root.join(SubPillarItem_.translations, JoinType.LEFT).get(SubPillarItemTranslation_.id)
                ),
                buildSpecification(criteria.getOwnerId(), root -> root.join(SubPillarItem_.owner, JoinType.LEFT).get(ExtendedUser_.id)),
                buildSpecification(criteria.getSubPillarId(), root -> root.join(SubPillarItem_.subPillar, JoinType.LEFT).get(SubPillar_.id))
            );
        }
        return specification;
    }
}
