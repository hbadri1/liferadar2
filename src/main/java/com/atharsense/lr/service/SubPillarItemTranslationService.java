package com.atharsense.lr.service;

import com.atharsense.lr.domain.SubPillarItemTranslation;
import com.atharsense.lr.repository.SubPillarItemTranslationRepository;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.atharsense.lr.domain.SubPillarItemTranslation}.
 */
@Service
@Transactional
public class SubPillarItemTranslationService {

    private static final Logger LOG = LoggerFactory.getLogger(SubPillarItemTranslationService.class);

    private final SubPillarItemTranslationRepository subPillarItemTranslationRepository;

    public SubPillarItemTranslationService(SubPillarItemTranslationRepository subPillarItemTranslationRepository) {
        this.subPillarItemTranslationRepository = subPillarItemTranslationRepository;
    }

    /**
     * Save a subPillarItemTranslation.
     *
     * @param subPillarItemTranslation the entity to save.
     * @return the persisted entity.
     */
    public SubPillarItemTranslation save(SubPillarItemTranslation subPillarItemTranslation) {
        LOG.debug("Request to save SubPillarItemTranslation : {}", subPillarItemTranslation);
        return subPillarItemTranslationRepository.save(subPillarItemTranslation);
    }

    /**
     * Update a subPillarItemTranslation.
     *
     * @param subPillarItemTranslation the entity to save.
     * @return the persisted entity.
     */
    public SubPillarItemTranslation update(SubPillarItemTranslation subPillarItemTranslation) {
        LOG.debug("Request to update SubPillarItemTranslation : {}", subPillarItemTranslation);
        return subPillarItemTranslationRepository.save(subPillarItemTranslation);
    }

    /**
     * Partially update a subPillarItemTranslation.
     *
     * @param subPillarItemTranslation the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<SubPillarItemTranslation> partialUpdate(SubPillarItemTranslation subPillarItemTranslation) {
        LOG.debug("Request to partially update SubPillarItemTranslation : {}", subPillarItemTranslation);

        return subPillarItemTranslationRepository
            .findById(subPillarItemTranslation.getId())
            .map(existingSubPillarItemTranslation -> {
                if (subPillarItemTranslation.getLang() != null) {
                    existingSubPillarItemTranslation.setLang(subPillarItemTranslation.getLang());
                }
                if (subPillarItemTranslation.getName() != null) {
                    existingSubPillarItemTranslation.setName(subPillarItemTranslation.getName());
                }
                if (subPillarItemTranslation.getDescription() != null) {
                    existingSubPillarItemTranslation.setDescription(subPillarItemTranslation.getDescription());
                }

                return existingSubPillarItemTranslation;
            })
            .map(subPillarItemTranslationRepository::save);
    }

    /**
     * Get all the subPillarItemTranslations.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<SubPillarItemTranslation> findAll() {
        LOG.debug("Request to get all SubPillarItemTranslations");
        return subPillarItemTranslationRepository.findAll();
    }

    /**
     * Get one subPillarItemTranslation by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<SubPillarItemTranslation> findOne(Long id) {
        LOG.debug("Request to get SubPillarItemTranslation : {}", id);
        return subPillarItemTranslationRepository.findById(id);
    }

    /**
     * Delete the subPillarItemTranslation by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete SubPillarItemTranslation : {}", id);
        subPillarItemTranslationRepository.deleteById(id);
    }
}
