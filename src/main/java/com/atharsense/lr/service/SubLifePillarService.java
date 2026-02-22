package com.atharsense.lr.service;

import com.atharsense.lr.domain.SubLifePillar;
import com.atharsense.lr.repository.SubLifePillarRepository;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.atharsense.lr.domain.SubLifePillar}.
 */
@Service
@Transactional
public class SubLifePillarService {

    private static final Logger LOG = LoggerFactory.getLogger(SubLifePillarService.class);

    private final SubLifePillarRepository subLifePillarRepository;

    public SubLifePillarService(SubLifePillarRepository subLifePillarRepository) {
        this.subLifePillarRepository = subLifePillarRepository;
    }

    /**
     * Save a subLifePillar.
     *
     * @param subLifePillar the entity to save.
     * @return the persisted entity.
     */
    public SubLifePillar save(SubLifePillar subLifePillar) {
        LOG.debug("Request to save SubLifePillar : {}", subLifePillar);
        return subLifePillarRepository.save(subLifePillar);
    }

    /**
     * Update a subLifePillar.
     *
     * @param subLifePillar the entity to save.
     * @return the persisted entity.
     */
    public SubLifePillar update(SubLifePillar subLifePillar) {
        LOG.debug("Request to update SubLifePillar : {}", subLifePillar);
        return subLifePillarRepository.save(subLifePillar);
    }

    /**
     * Partially update a subLifePillar.
     *
     * @param subLifePillar the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<SubLifePillar> partialUpdate(SubLifePillar subLifePillar) {
        LOG.debug("Request to partially update SubLifePillar : {}", subLifePillar);

        return subLifePillarRepository
            .findById(subLifePillar.getId())
            .map(existingSubLifePillar -> {
                if (subLifePillar.getCode() != null) {
                    existingSubLifePillar.setCode(subLifePillar.getCode());
                }
                if (subLifePillar.getIsActive() != null) {
                    existingSubLifePillar.setIsActive(subLifePillar.getIsActive());
                }

                return existingSubLifePillar;
            })
            .map(subLifePillarRepository::save);
    }

    /**
     * Get one subLifePillar by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<SubLifePillar> findOne(Long id) {
        LOG.debug("Request to get SubLifePillar : {}", id);
        return subLifePillarRepository.findById(id);
    }

    /**
     * Delete the subLifePillar by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete SubLifePillar : {}", id);
        subLifePillarRepository.deleteById(id);
    }
}
