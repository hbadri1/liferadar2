package com.atharsense.lr.service;

import com.atharsense.lr.domain.SubPillar;
import com.atharsense.lr.repository.SubPillarRepository;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.atharsense.lr.domain.SubPillar}.
 */
@Service
@Transactional
public class SubPillarService {

    private static final Logger LOG = LoggerFactory.getLogger(SubPillarService.class);

    private final SubPillarRepository subPillarRepository;

    public SubPillarService(SubPillarRepository subPillarRepository) {
        this.subPillarRepository = subPillarRepository;
    }

    /**
     * Save a subPillar.
     *
     * @param subPillar the entity to save.
     * @return the persisted entity.
     */
    public SubPillar save(SubPillar subPillar) {
        LOG.debug("Request to save SubPillar : {}", subPillar);
        return subPillarRepository.save(subPillar);
    }

    /**
     * Update a subPillar.
     *
     * @param subPillar the entity to save.
     * @return the persisted entity.
     */
    public SubPillar update(SubPillar subPillar) {
        LOG.debug("Request to update SubPillar : {}", subPillar);
        return subPillarRepository.save(subPillar);
    }

    /**
     * Find a subPillar with translations and items eagerly loaded.
     *
     * @param id the id of the entity.
     * @return the entity with relationships loaded.
     */
    @Transactional(readOnly = true)
    public Optional<SubPillar> findOneWithTranslations(Long id) {
        LOG.debug("Request to get SubPillar with relationships : {}", id);
        return subPillarRepository.findById(id).map(subPillar -> {
            // Initialize translations within transaction
            subPillar.getTranslations().size();
            // Initialize items within transaction
            subPillar.getItems().size();
            return subPillar;
        });
    }

    /**
     * Partially update a subPillar.
     *
     * @param subPillar the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<SubPillar> partialUpdate(SubPillar subPillar) {
        LOG.debug("Request to partially update SubPillar : {}", subPillar);

        return subPillarRepository
            .findById(subPillar.getId())
            .map(existingSubPillar -> {
                if (subPillar.getCode() != null) {
                    existingSubPillar.setCode(subPillar.getCode());
                }
                if (subPillar.getIsActive() != null) {
                    existingSubPillar.setIsActive(subPillar.getIsActive());
                }

                return existingSubPillar;
            })
            .map(subPillarRepository::save);
    }

    /**
     * Get one subPillar by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<SubPillar> findOne(Long id) {
        LOG.debug("Request to get SubPillar : {}", id);
        return subPillarRepository.findById(id);
    }

    /**
     * Delete the subPillar by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete SubPillar : {}", id);
        subPillarRepository.deleteById(id);
    }
}
