package com.atharsense.lr.service;

import com.atharsense.lr.domain.SubPillarTranslation;
import com.atharsense.lr.repository.SubPillarTranslationRepository;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.atharsense.lr.domain.SubPillarTranslation}.
 */
@Service
@Transactional
public class SubPillarTranslationService {

    private static final Logger LOG = LoggerFactory.getLogger(SubPillarTranslationService.class);

    private final SubPillarTranslationRepository subPillarTranslationRepository;

    public SubPillarTranslationService(SubPillarTranslationRepository subPillarTranslationRepository) {
        this.subPillarTranslationRepository = subPillarTranslationRepository;
    }

    /**
     * Save a subPillarTranslation.
     *
     * @param subPillarTranslation the entity to save.
     * @return the persisted entity.
     */
    public SubPillarTranslation save(SubPillarTranslation subPillarTranslation) {
        LOG.debug("Request to save SubPillarTranslation : {}", subPillarTranslation);
        return subPillarTranslationRepository.save(subPillarTranslation);
    }

    /**
     * Update a subPillarTranslation.
     *
     * @param subPillarTranslation the entity to save.
     * @return the persisted entity.
     */
    public SubPillarTranslation update(SubPillarTranslation subPillarTranslation) {
        LOG.debug("Request to update SubPillarTranslation : {}", subPillarTranslation);
        return subPillarTranslationRepository.save(subPillarTranslation);
    }

    /**
     * Partially update a subPillarTranslation.
     *
     * @param subPillarTranslation the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<SubPillarTranslation> partialUpdate(SubPillarTranslation subPillarTranslation) {
        LOG.debug("Request to partially update SubPillarTranslation : {}", subPillarTranslation);

        return subPillarTranslationRepository
            .findById(subPillarTranslation.getId())
            .map(existingSubPillarTranslation -> {
                if (subPillarTranslation.getLang() != null) {
                    existingSubPillarTranslation.setLang(subPillarTranslation.getLang());
                }
                if (subPillarTranslation.getName() != null) {
                    existingSubPillarTranslation.setName(subPillarTranslation.getName());
                }
                if (subPillarTranslation.getDescription() != null) {
                    existingSubPillarTranslation.setDescription(subPillarTranslation.getDescription());
                }

                return existingSubPillarTranslation;
            })
            .map(subPillarTranslationRepository::save);
    }

    /**
     * Get all the subPillarTranslations.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<SubPillarTranslation> findAll() {
        LOG.debug("Request to get all SubPillarTranslations");
        return subPillarTranslationRepository.findAll();
    }

    /**
     * Get one subPillarTranslation by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<SubPillarTranslation> findOne(Long id) {
        LOG.debug("Request to get SubPillarTranslation : {}", id);
        return subPillarTranslationRepository.findById(id);
    }

    /**
     * Delete the subPillarTranslation by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete SubPillarTranslation : {}", id);
        subPillarTranslationRepository.deleteById(id);
    }
}
