package com.atharsense.lr.service;

import com.atharsense.lr.domain.ExtendedUser;
import com.atharsense.lr.repository.ExtendedUserRepository;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.atharsense.lr.domain.ExtendedUser}.
 */
@Service
@Transactional
public class ExtendedUserService {

    private static final Logger LOG = LoggerFactory.getLogger(ExtendedUserService.class);

    private final ExtendedUserRepository extendedUserRepository;

    public ExtendedUserService(ExtendedUserRepository extendedUserRepository) {
        this.extendedUserRepository = extendedUserRepository;
    }

    /**
     * Save a extendedUser.
     *
     * @param extendedUser the entity to save.
     * @return the persisted entity.
     */
    public ExtendedUser save(ExtendedUser extendedUser) {
        LOG.debug("Request to save ExtendedUser : {}", extendedUser);
        return extendedUserRepository.save(extendedUser);
    }

    /**
     * Update a extendedUser.
     *
     * @param extendedUser the entity to save.
     * @return the persisted entity.
     */
    public ExtendedUser update(ExtendedUser extendedUser) {
        LOG.debug("Request to update ExtendedUser : {}", extendedUser);
        return extendedUserRepository.save(extendedUser);
    }

    /**
     * Partially update a extendedUser.
     *
     * @param extendedUser the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ExtendedUser> partialUpdate(ExtendedUser extendedUser) {
        LOG.debug("Request to partially update ExtendedUser : {}", extendedUser);

        return extendedUserRepository
            .findById(extendedUser.getId())
            .map(existingExtendedUser -> {
                if (extendedUser.getFullName() != null) {
                    existingExtendedUser.setFullName(extendedUser.getFullName());
                }
                if (extendedUser.getMobile() != null) {
                    existingExtendedUser.setMobile(extendedUser.getMobile());
                }
                if (extendedUser.getAvatar() != null) {
                    existingExtendedUser.setAvatar(extendedUser.getAvatar());
                }
                if (extendedUser.getActive() != null) {
                    existingExtendedUser.setActive(extendedUser.getActive());
                }

                return existingExtendedUser;
            })
            .map(extendedUserRepository::save);
    }

    /**
     * Get all the extendedUsers.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<ExtendedUser> findAll() {
        LOG.debug("Request to get all ExtendedUsers");
        return extendedUserRepository.findAll();
    }

    /**
     * Get one extendedUser by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ExtendedUser> findOne(Long id) {
        LOG.debug("Request to get ExtendedUser : {}", id);
        return extendedUserRepository.findById(id);
    }

    /**
     * Delete the extendedUser by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete ExtendedUser : {}", id);
        extendedUserRepository.deleteById(id);
    }
}
