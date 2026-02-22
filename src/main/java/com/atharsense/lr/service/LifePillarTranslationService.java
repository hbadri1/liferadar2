package com.atharsense.lr.service;

import com.atharsense.lr.domain.LifePillarTranslation;
import com.atharsense.lr.repository.LifePillarTranslationRepository;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.atharsense.lr.domain.LifePillarTranslation}.
 */
@Service
@Transactional
public class LifePillarTranslationService {

    private static final Logger LOG = LoggerFactory.getLogger(LifePillarTranslationService.class);

    private final LifePillarTranslationRepository lifePillarTranslationRepository;

    public LifePillarTranslationService(LifePillarTranslationRepository lifePillarTranslationRepository) {
        this.lifePillarTranslationRepository = lifePillarTranslationRepository;
    }

    /**
     * Save a lifePillarTranslation.
     *
     * @param lifePillarTranslation the entity to save.
     * @return the persisted entity.
     */
    public LifePillarTranslation save(LifePillarTranslation lifePillarTranslation) {
        LOG.debug("Request to save LifePillarTranslation : {}", lifePillarTranslation);
        return lifePillarTranslationRepository.save(lifePillarTranslation);
    }

    /**
     * Update a lifePillarTranslation.
     *
     * @param lifePillarTranslation the entity to save.
     * @return the persisted entity.
     */
    public LifePillarTranslation update(LifePillarTranslation lifePillarTranslation) {
        LOG.debug("Request to update LifePillarTranslation : {}", lifePillarTranslation);
        return lifePillarTranslationRepository.save(lifePillarTranslation);
    }

    /**
     * Partially update a lifePillarTranslation.
     *
     * @param lifePillarTranslation the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<LifePillarTranslation> partialUpdate(LifePillarTranslation lifePillarTranslation) {
        LOG.debug("Request to partially update LifePillarTranslation : {}", lifePillarTranslation);

        return lifePillarTranslationRepository
            .findById(lifePillarTranslation.getId())
            .map(existingLifePillarTranslation -> {
                if (lifePillarTranslation.getLang() != null) {
                    existingLifePillarTranslation.setLang(lifePillarTranslation.getLang());
                }
                if (lifePillarTranslation.getName() != null) {
                    existingLifePillarTranslation.setName(lifePillarTranslation.getName());
                }
                if (lifePillarTranslation.getDescription() != null) {
                    existingLifePillarTranslation.setDescription(lifePillarTranslation.getDescription());
                }

                return existingLifePillarTranslation;
            })
            .map(lifePillarTranslationRepository::save);
    }

    /**
     * Get all the lifePillarTranslations.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<LifePillarTranslation> findAll() {
        LOG.debug("Request to get all LifePillarTranslations");
        return lifePillarTranslationRepository.findAll();
    }

    /**
     * Get one lifePillarTranslation by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<LifePillarTranslation> findOne(Long id) {
        LOG.debug("Request to get LifePillarTranslation : {}", id);
        return lifePillarTranslationRepository.findById(id);
    }

    /**
     * Delete the lifePillarTranslation by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete LifePillarTranslation : {}", id);
        lifePillarTranslationRepository.deleteById(id);
    }
}
