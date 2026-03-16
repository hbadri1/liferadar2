package com.atharsense.lr.service;

import com.atharsense.lr.domain.Pillar;
import com.atharsense.lr.repository.PillarRepository;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.atharsense.lr.domain.Pillar}.
 */
@Service
@Transactional
public class PillarService {

    private static final Logger LOG = LoggerFactory.getLogger(PillarService.class);

    private final PillarRepository pillarRepository;

    public PillarService(PillarRepository pillarRepository) {
        this.pillarRepository = pillarRepository;
    }

    /**
     * Save a pillar.
     *
     * @param pillar the entity to save.
     * @return the persisted entity.
     */
    public Pillar save(Pillar pillar) {
        LOG.debug("Request to save Pillar : {}", pillar);
        return pillarRepository.save(pillar);
    }

    /**
     * Update a pillar.
     *
     * @param pillar the entity to save.
     * @return the persisted entity.
     */
    public Pillar update(Pillar pillar) {
        LOG.debug("Request to update Pillar : {}", pillar);
        return pillarRepository.save(pillar);
    }

    /**
     * Find a pillar with translations and subPillars eagerly loaded.
     *
     * @param id the id of the entity.
     * @return the entity with relationships loaded.
     */
    @Transactional(readOnly = true)
    public Optional<Pillar> findOneWithTranslations(Long id) {
        LOG.debug("Request to get Pillar with relationships : {}", id);
        return pillarRepository.findById(id).map(pillar -> {
            // Initialize translations within transaction
            pillar.getTranslations().size();
            // Initialize subPillars within transaction
            pillar.getSubPillars().size();
            return pillar;
        });
    }

    /**
     * Partially update a pillar.
     *
     * @param pillar the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Pillar> partialUpdate(Pillar pillar) {
        LOG.debug("Request to partially update Pillar : {}", pillar);

        return pillarRepository
            .findById(pillar.getId())
            .map(existingPillar -> {
                if (pillar.getCode() != null) {
                    existingPillar.setCode(pillar.getCode());
                }
                if (pillar.getIsActive() != null) {
                    existingPillar.setIsActive(pillar.getIsActive());
                }

                return existingPillar;
            })
            .map(pillarRepository::save);
    }

    /**
     * Get one pillar by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Pillar> findOne(Long id) {
        LOG.debug("Request to get Pillar : {}", id);
        return pillarRepository.findById(id);
    }

    /**
     * Delete the pillar by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Pillar : {}", id);
        pillarRepository.deleteById(id);
    }
}
