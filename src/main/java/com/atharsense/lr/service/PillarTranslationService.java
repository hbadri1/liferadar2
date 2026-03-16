package com.atharsense.lr.service;

import com.atharsense.lr.domain.PillarTranslation;
import com.atharsense.lr.repository.PillarTranslationRepository;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.atharsense.lr.domain.PillarTranslation}.
 */
@Service
@Transactional
public class PillarTranslationService {

    private static final Logger LOG = LoggerFactory.getLogger(PillarTranslationService.class);

    private final PillarTranslationRepository pillarTranslationRepository;

    public PillarTranslationService(PillarTranslationRepository pillarTranslationRepository) {
        this.pillarTranslationRepository = pillarTranslationRepository;
    }

    /**
     * Save a pillarTranslation.
     *
     * @param pillarTranslation the entity to save.
     * @return the persisted entity.
     */
    public PillarTranslation save(PillarTranslation pillarTranslation) {
        LOG.debug("Request to save PillarTranslation : {}", pillarTranslation);
        return pillarTranslationRepository.save(pillarTranslation);
    }

    /**
     * Update a pillarTranslation.
     *
     * @param pillarTranslation the entity to save.
     * @return the persisted entity.
     */
    public PillarTranslation update(PillarTranslation pillarTranslation) {
        LOG.debug("Request to update PillarTranslation : {}", pillarTranslation);
        return pillarTranslationRepository.save(pillarTranslation);
    }

    /**
     * Partially update a pillarTranslation.
     *
     * @param pillarTranslation the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<PillarTranslation> partialUpdate(PillarTranslation pillarTranslation) {
        LOG.debug("Request to partially update PillarTranslation : {}", pillarTranslation);

        return pillarTranslationRepository
            .findById(pillarTranslation.getId())
            .map(existingPillarTranslation -> {
                if (pillarTranslation.getLang() != null) {
                    existingPillarTranslation.setLang(pillarTranslation.getLang());
                }
                if (pillarTranslation.getName() != null) {
                    existingPillarTranslation.setName(pillarTranslation.getName());
                }
                if (pillarTranslation.getDescription() != null) {
                    existingPillarTranslation.setDescription(pillarTranslation.getDescription());
                }

                return existingPillarTranslation;
            })
            .map(pillarTranslationRepository::save);
    }

    /**
     * Get all the pillarTranslations.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<PillarTranslation> findAll() {
        LOG.debug("Request to get all PillarTranslations");
        return pillarTranslationRepository.findAll();
    }

    /**
     * Get one pillarTranslation by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<PillarTranslation> findOne(Long id) {
        LOG.debug("Request to get PillarTranslation : {}", id);
        return pillarTranslationRepository.findById(id);
    }

    /**
     * Delete the pillarTranslation by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete PillarTranslation : {}", id);
        pillarTranslationRepository.deleteById(id);
    }
}
