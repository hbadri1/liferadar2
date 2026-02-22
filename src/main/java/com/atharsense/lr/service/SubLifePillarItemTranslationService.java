package com.atharsense.lr.service;

import com.atharsense.lr.domain.SubLifePillarItemTranslation;
import com.atharsense.lr.repository.SubLifePillarItemTranslationRepository;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.atharsense.lr.domain.SubLifePillarItemTranslation}.
 */
@Service
@Transactional
public class SubLifePillarItemTranslationService {

    private static final Logger LOG = LoggerFactory.getLogger(SubLifePillarItemTranslationService.class);

    private final SubLifePillarItemTranslationRepository subLifePillarItemTranslationRepository;

    public SubLifePillarItemTranslationService(SubLifePillarItemTranslationRepository subLifePillarItemTranslationRepository) {
        this.subLifePillarItemTranslationRepository = subLifePillarItemTranslationRepository;
    }

    /**
     * Save a subLifePillarItemTranslation.
     *
     * @param subLifePillarItemTranslation the entity to save.
     * @return the persisted entity.
     */
    public SubLifePillarItemTranslation save(SubLifePillarItemTranslation subLifePillarItemTranslation) {
        LOG.debug("Request to save SubLifePillarItemTranslation : {}", subLifePillarItemTranslation);
        return subLifePillarItemTranslationRepository.save(subLifePillarItemTranslation);
    }

    /**
     * Update a subLifePillarItemTranslation.
     *
     * @param subLifePillarItemTranslation the entity to save.
     * @return the persisted entity.
     */
    public SubLifePillarItemTranslation update(SubLifePillarItemTranslation subLifePillarItemTranslation) {
        LOG.debug("Request to update SubLifePillarItemTranslation : {}", subLifePillarItemTranslation);
        return subLifePillarItemTranslationRepository.save(subLifePillarItemTranslation);
    }

    /**
     * Partially update a subLifePillarItemTranslation.
     *
     * @param subLifePillarItemTranslation the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<SubLifePillarItemTranslation> partialUpdate(SubLifePillarItemTranslation subLifePillarItemTranslation) {
        LOG.debug("Request to partially update SubLifePillarItemTranslation : {}", subLifePillarItemTranslation);

        return subLifePillarItemTranslationRepository
            .findById(subLifePillarItemTranslation.getId())
            .map(existingSubLifePillarItemTranslation -> {
                if (subLifePillarItemTranslation.getLang() != null) {
                    existingSubLifePillarItemTranslation.setLang(subLifePillarItemTranslation.getLang());
                }
                if (subLifePillarItemTranslation.getName() != null) {
                    existingSubLifePillarItemTranslation.setName(subLifePillarItemTranslation.getName());
                }
                if (subLifePillarItemTranslation.getDescription() != null) {
                    existingSubLifePillarItemTranslation.setDescription(subLifePillarItemTranslation.getDescription());
                }

                return existingSubLifePillarItemTranslation;
            })
            .map(subLifePillarItemTranslationRepository::save);
    }

    /**
     * Get all the subLifePillarItemTranslations.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<SubLifePillarItemTranslation> findAll() {
        LOG.debug("Request to get all SubLifePillarItemTranslations");
        return subLifePillarItemTranslationRepository.findAll();
    }

    /**
     * Get one subLifePillarItemTranslation by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<SubLifePillarItemTranslation> findOne(Long id) {
        LOG.debug("Request to get SubLifePillarItemTranslation : {}", id);
        return subLifePillarItemTranslationRepository.findById(id);
    }

    /**
     * Delete the subLifePillarItemTranslation by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete SubLifePillarItemTranslation : {}", id);
        subLifePillarItemTranslationRepository.deleteById(id);
    }
}
