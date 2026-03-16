package com.atharsense.lr.service;

import com.atharsense.lr.domain.*; // for static metamodels
import com.atharsense.lr.domain.Pillar;
import com.atharsense.lr.repository.PillarRepository;
import com.atharsense.lr.service.criteria.PillarCriteria;
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
 * Service for executing complex queries for {@link Pillar} entities in the database.
 * The main input is a {@link PillarCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link Pillar} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class PillarQueryService extends QueryService<Pillar> {

    private static final Logger LOG = LoggerFactory.getLogger(PillarQueryService.class);

    private final PillarRepository pillarRepository;

    public PillarQueryService(PillarRepository pillarRepository) {
        this.pillarRepository = pillarRepository;
    }

    /**
     * Return a {@link Page} of {@link Pillar} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<Pillar> findByCriteria(PillarCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Pillar> specification = createSpecification(criteria);
        Page<Pillar> result = pillarRepository.findAll(specification, page);

        // Eagerly load translations to avoid N+1 queries
        result.getContent().forEach(pillar -> pillar.getTranslations().size());

        return result;
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(PillarCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<Pillar> specification = createSpecification(criteria);
        return pillarRepository.count(specification);
    }

    /**
     * Function to convert {@link PillarCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Pillar> createSpecification(PillarCriteria criteria) {
        Specification<Pillar> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : null,
                buildRangeSpecification(criteria.getId(), Pillar_.id),
                buildStringSpecification(criteria.getCode(), Pillar_.code),
                buildSpecification(criteria.getIsActive(), Pillar_.isActive),
                buildSpecification(criteria.getTranslationsId(), root ->
                    root.join(Pillar_.translations, JoinType.LEFT).get(PillarTranslation_.id)
                ),
                buildSpecification(criteria.getOwnerId(), root -> root.join(Pillar_.owner, JoinType.LEFT).get(ExtendedUser_.id))
            );
        }
        return specification;
    }
}
