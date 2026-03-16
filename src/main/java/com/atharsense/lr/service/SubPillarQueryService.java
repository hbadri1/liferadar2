package com.atharsense.lr.service;

import com.atharsense.lr.domain.*; // for static metamodels
import com.atharsense.lr.domain.SubPillar;
import com.atharsense.lr.repository.SubPillarRepository;
import com.atharsense.lr.service.criteria.SubPillarCriteria;
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
 * Service for executing complex queries for {@link SubPillar} entities in the database.
 * The main input is a {@link SubPillarCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link SubPillar} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class SubPillarQueryService extends QueryService<SubPillar> {

    private static final Logger LOG = LoggerFactory.getLogger(SubPillarQueryService.class);

    private final SubPillarRepository subPillarRepository;

    public SubPillarQueryService(SubPillarRepository subPillarRepository) {
        this.subPillarRepository = subPillarRepository;
    }

    /**
     * Return a {@link Page} of {@link SubPillar} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<SubPillar> findByCriteria(SubPillarCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<SubPillar> specification = createSpecification(criteria);
        Page<SubPillar> result = subPillarRepository.findAll(specification, page);

        // Eagerly load translations to avoid N+1 queries
        result.getContent().forEach(subPillar -> subPillar.getTranslations().size());

        return result;
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(SubPillarCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<SubPillar> specification = createSpecification(criteria);
        return subPillarRepository.count(specification);
    }

    /**
     * Function to convert {@link SubPillarCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<SubPillar> createSpecification(SubPillarCriteria criteria) {
        Specification<SubPillar> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : null,
                buildRangeSpecification(criteria.getId(), SubPillar_.id),
                buildStringSpecification(criteria.getCode(), SubPillar_.code),
                buildSpecification(criteria.getIsActive(), SubPillar_.isActive),
                buildSpecification(criteria.getTranslationsId(), root ->
                    root.join(SubPillar_.translations, JoinType.LEFT).get(SubPillarTranslation_.id)
                ),
                buildSpecification(criteria.getOwnerId(), root -> root.join(SubPillar_.owner, JoinType.LEFT).get(ExtendedUser_.id)),
                buildSpecification(criteria.getPillarId(), root -> root.join(SubPillar_.pillar, JoinType.LEFT).get(Pillar_.id))
            );
        }
        return specification;
    }
}
