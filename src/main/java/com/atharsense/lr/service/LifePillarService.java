package com.atharsense.lr.service;

import com.atharsense.lr.domain.LifePillar;
import com.atharsense.lr.repository.LifePillarRepository;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.atharsense.lr.domain.LifePillar}.
 */
@Service
@Transactional
public class LifePillarService {

    private static final Logger LOG = LoggerFactory.getLogger(LifePillarService.class);

    private final LifePillarRepository lifePillarRepository;

    public LifePillarService(LifePillarRepository lifePillarRepository) {
        this.lifePillarRepository = lifePillarRepository;
    }

    /**
     * Save a lifePillar.
     *
     * @param lifePillar the entity to save.
     * @return the persisted entity.
     */
    public LifePillar save(LifePillar lifePillar) {
        LOG.debug("Request to save LifePillar : {}", lifePillar);
        return lifePillarRepository.save(lifePillar);
    }

    /**
     * Update a lifePillar.
     *
     * @param lifePillar the entity to save.
     * @return the persisted entity.
     */
    public LifePillar update(LifePillar lifePillar) {
        LOG.debug("Request to update LifePillar : {}", lifePillar);
        return lifePillarRepository.save(lifePillar);
    }

    /**
     * Partially update a lifePillar.
     *
     * @param lifePillar the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<LifePillar> partialUpdate(LifePillar lifePillar) {
        LOG.debug("Request to partially update LifePillar : {}", lifePillar);

        return lifePillarRepository
            .findById(lifePillar.getId())
            .map(existingLifePillar -> {
                if (lifePillar.getCode() != null) {
                    existingLifePillar.setCode(lifePillar.getCode());
                }
                if (lifePillar.getIsActive() != null) {
                    existingLifePillar.setIsActive(lifePillar.getIsActive());
                }

                return existingLifePillar;
            })
            .map(lifePillarRepository::save);
    }

    /**
     * Get one lifePillar by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<LifePillar> findOne(Long id) {
        LOG.debug("Request to get LifePillar : {}", id);
        return lifePillarRepository.findById(id);
    }

    /**
     * Delete the lifePillar by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete LifePillar : {}", id);
        lifePillarRepository.deleteById(id);
    }
}
