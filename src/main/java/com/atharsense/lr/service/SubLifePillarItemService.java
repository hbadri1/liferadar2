package com.atharsense.lr.service;

import com.atharsense.lr.domain.SubLifePillarItem;
import com.atharsense.lr.repository.SubLifePillarItemRepository;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.atharsense.lr.domain.SubLifePillarItem}.
 */
@Service
@Transactional
public class SubLifePillarItemService {

    private static final Logger LOG = LoggerFactory.getLogger(SubLifePillarItemService.class);

    private final SubLifePillarItemRepository subLifePillarItemRepository;

    public SubLifePillarItemService(SubLifePillarItemRepository subLifePillarItemRepository) {
        this.subLifePillarItemRepository = subLifePillarItemRepository;
    }

    /**
     * Save a subLifePillarItem.
     *
     * @param subLifePillarItem the entity to save.
     * @return the persisted entity.
     */
    public SubLifePillarItem save(SubLifePillarItem subLifePillarItem) {
        LOG.debug("Request to save SubLifePillarItem : {}", subLifePillarItem);
        return subLifePillarItemRepository.save(subLifePillarItem);
    }

    /**
     * Update a subLifePillarItem.
     *
     * @param subLifePillarItem the entity to save.
     * @return the persisted entity.
     */
    public SubLifePillarItem update(SubLifePillarItem subLifePillarItem) {
        LOG.debug("Request to update SubLifePillarItem : {}", subLifePillarItem);
        return subLifePillarItemRepository.save(subLifePillarItem);
    }

    /**
     * Partially update a subLifePillarItem.
     *
     * @param subLifePillarItem the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<SubLifePillarItem> partialUpdate(SubLifePillarItem subLifePillarItem) {
        LOG.debug("Request to partially update SubLifePillarItem : {}", subLifePillarItem);

        return subLifePillarItemRepository
            .findById(subLifePillarItem.getId())
            .map(existingSubLifePillarItem -> {
                if (subLifePillarItem.getCode() != null) {
                    existingSubLifePillarItem.setCode(subLifePillarItem.getCode());
                }
                if (subLifePillarItem.getSortOrder() != null) {
                    existingSubLifePillarItem.setSortOrder(subLifePillarItem.getSortOrder());
                }
                if (subLifePillarItem.getIsActive() != null) {
                    existingSubLifePillarItem.setIsActive(subLifePillarItem.getIsActive());
                }

                return existingSubLifePillarItem;
            })
            .map(subLifePillarItemRepository::save);
    }

    /**
     * Get one subLifePillarItem by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<SubLifePillarItem> findOne(Long id) {
        LOG.debug("Request to get SubLifePillarItem : {}", id);
        return subLifePillarItemRepository.findById(id);
    }

    /**
     * Delete the subLifePillarItem by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete SubLifePillarItem : {}", id);
        subLifePillarItemRepository.deleteById(id);
    }
}
