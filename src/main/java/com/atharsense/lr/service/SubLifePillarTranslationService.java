package com.atharsense.lr.service;

import com.atharsense.lr.domain.SubLifePillarTranslation;
import com.atharsense.lr.repository.SubLifePillarTranslationRepository;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.atharsense.lr.domain.SubLifePillarTranslation}.
 */
@Service
@Transactional
public class SubLifePillarTranslationService {

    private static final Logger LOG = LoggerFactory.getLogger(SubLifePillarTranslationService.class);

    private final SubLifePillarTranslationRepository subLifePillarTranslationRepository;

    public SubLifePillarTranslationService(SubLifePillarTranslationRepository subLifePillarTranslationRepository) {
        this.subLifePillarTranslationRepository = subLifePillarTranslationRepository;
    }

    /**
     * Save a subLifePillarTranslation.
     *
     * @param subLifePillarTranslation the entity to save.
     * @return the persisted entity.
     */
    public SubLifePillarTranslation save(SubLifePillarTranslation subLifePillarTranslation) {
        LOG.debug("Request to save SubLifePillarTranslation : {}", subLifePillarTranslation);
        return subLifePillarTranslationRepository.save(subLifePillarTranslation);
    }

    /**
     * Update a subLifePillarTranslation.
     *
     * @param subLifePillarTranslation the entity to save.
     * @return the persisted entity.
     */
    public SubLifePillarTranslation update(SubLifePillarTranslation subLifePillarTranslation) {
        LOG.debug("Request to update SubLifePillarTranslation : {}", subLifePillarTranslation);
        return subLifePillarTranslationRepository.save(subLifePillarTranslation);
    }

    /**
     * Partially update a subLifePillarTranslation.
     *
     * @param subLifePillarTranslation the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<SubLifePillarTranslation> partialUpdate(SubLifePillarTranslation subLifePillarTranslation) {
        LOG.debug("Request to partially update SubLifePillarTranslation : {}", subLifePillarTranslation);

        return subLifePillarTranslationRepository
            .findById(subLifePillarTranslation.getId())
            .map(existingSubLifePillarTranslation -> {
                if (subLifePillarTranslation.getLang() != null) {
                    existingSubLifePillarTranslation.setLang(subLifePillarTranslation.getLang());
                }
                if (subLifePillarTranslation.getName() != null) {
                    existingSubLifePillarTranslation.setName(subLifePillarTranslation.getName());
                }
                if (subLifePillarTranslation.getDescription() != null) {
                    existingSubLifePillarTranslation.setDescription(subLifePillarTranslation.getDescription());
                }

                return existingSubLifePillarTranslation;
            })
            .map(subLifePillarTranslationRepository::save);
    }

    /**
     * Get all the subLifePillarTranslations.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<SubLifePillarTranslation> findAll() {
        LOG.debug("Request to get all SubLifePillarTranslations");
        return subLifePillarTranslationRepository.findAll();
    }

    /**
     * Get one subLifePillarTranslation by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<SubLifePillarTranslation> findOne(Long id) {
        LOG.debug("Request to get SubLifePillarTranslation : {}", id);
        return subLifePillarTranslationRepository.findById(id);
    }

    /**
     * Delete the subLifePillarTranslation by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete SubLifePillarTranslation : {}", id);
        subLifePillarTranslationRepository.deleteById(id);
    }
}
