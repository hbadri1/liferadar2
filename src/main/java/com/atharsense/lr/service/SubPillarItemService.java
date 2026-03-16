package com.atharsense.lr.service;

import com.atharsense.lr.domain.SubPillarItem;
import com.atharsense.lr.repository.SubPillarItemRepository;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.atharsense.lr.domain.SubPillarItem}.
 */
@Service
@Transactional
public class SubPillarItemService {

    private static final Logger LOG = LoggerFactory.getLogger(SubPillarItemService.class);

    private final SubPillarItemRepository subPillarItemRepository;

    public SubPillarItemService(SubPillarItemRepository subPillarItemRepository) {
        this.subPillarItemRepository = subPillarItemRepository;
    }

    /**
     * Save a subPillarItem.
     *
     * @param subPillarItem the entity to save.
     * @return the persisted entity.
     */
    public SubPillarItem save(SubPillarItem subPillarItem) {
        LOG.debug("Request to save SubPillarItem : {}", subPillarItem);
        return subPillarItemRepository.save(subPillarItem);
    }

    /**
     * Update a subPillarItem.
     *
     * @param subPillarItem the entity to save.
     * @return the persisted entity.
     */
    public SubPillarItem update(SubPillarItem subPillarItem) {
        LOG.debug("Request to update SubPillarItem : {}", subPillarItem);
        return subPillarItemRepository.save(subPillarItem);
    }

    /**
     * Find a subPillarItem with translations and evaluations eagerly loaded.
     *
     * @param id the id of the entity.
     * @return the entity with relationships loaded.
     */
    @Transactional(readOnly = true)
    public Optional<SubPillarItem> findOneWithTranslations(Long id) {
        LOG.debug("Request to get SubPillarItem with relationships : {}", id);
        return subPillarItemRepository.findById(id).map(item -> {
            // Initialize translations within transaction
            item.getTranslations().size();
            // Initialize evaluations within transaction
            item.getEvaluations().size();
            return item;
        });
    }

    /**
     * Partially update a subPillarItem.
     *
     * @param subPillarItem the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<SubPillarItem> partialUpdate(SubPillarItem subPillarItem) {
        LOG.debug("Request to partially update SubPillarItem : {}", subPillarItem);

        return subPillarItemRepository
            .findById(subPillarItem.getId())
            .map(existingSubPillarItem -> {
                if (subPillarItem.getCode() != null) {
                    existingSubPillarItem.setCode(subPillarItem.getCode());
                }
                if (subPillarItem.getSortOrder() != null) {
                    existingSubPillarItem.setSortOrder(subPillarItem.getSortOrder());
                }
                if (subPillarItem.getIsActive() != null) {
                    existingSubPillarItem.setIsActive(subPillarItem.getIsActive());
                }

                return existingSubPillarItem;
            })
            .map(subPillarItemRepository::save);
    }

    /**
     * Get one subPillarItem by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<SubPillarItem> findOne(Long id) {
        LOG.debug("Request to get SubPillarItem : {}", id);
        return subPillarItemRepository.findById(id);
    }

    /**
     * Delete the subPillarItem by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete SubPillarItem : {}", id);
        subPillarItemRepository.deleteById(id);
    }
}
