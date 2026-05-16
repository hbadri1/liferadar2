package com.atharsense.lr.service;

import com.atharsense.lr.domain.ExtendedUser;
import com.atharsense.lr.domain.Family;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.repository.FamilyRepository;
import com.atharsense.lr.web.rest.errors.BadRequestAlertException;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service class for Family operations
 */
@Service
@Transactional
public class FamilyService {

    private static final String ENTITY_NAME = "family";

    private final FamilyRepository familyRepository;
    private final ExtendedUserRepository extendedUserRepository;

    public FamilyService(FamilyRepository familyRepository, ExtendedUserRepository extendedUserRepository) {
        this.familyRepository = familyRepository;
        this.extendedUserRepository = extendedUserRepository;
    }

    /**
     * Enable family management for a user.
     * This creates a new Family entity and links it to the user.
     * Once enabled, family management cannot be disabled.
     *
     * @param extendedUserId the ID of the extended user
     * @param userLastname the lastname of the user (used for family name)
     * @return the updated ExtendedUser
     */
    public ExtendedUser enableFamilyManagement(Long extendedUserId, String userLastname) {
        ExtendedUser extendedUser = extendedUserRepository.findById(extendedUserId)
            .orElseThrow(() -> new BadRequestAlertException("Extended user not found", ENTITY_NAME, "usernotfound"));

        // Check if family management is already enabled
        if (Boolean.TRUE.equals(extendedUser.getFamilyManagementEnabled())) {
            throw new BadRequestAlertException("Family management is already enabled for this user", ENTITY_NAME, "alreadyenabled");
        }

        // Create new family
        Family family = new Family();
        family.setName(userLastname != null && !userLastname.isBlank() ? userLastname + "'s Family" : "My Family");
        family.setCreatedAt(Instant.now());
        family.setModifiedAt(Instant.now());
        family = familyRepository.save(family);

        // Update extended user
        extendedUser.setFamilyManagementEnabled(true);
        extendedUser.setIsParent(true);
        extendedUser.setFamily(family);

        return extendedUserRepository.save(extendedUser);
    }

    /**
     * Get or create a family for a user
     *
     * @param extendedUserId the ID of the extended user
     * @return the Family associated with the user
     */
    public Family getOrCreateFamilyForUser(Long extendedUserId) {
        ExtendedUser extendedUser = extendedUserRepository.findById(extendedUserId)
            .orElseThrow(() -> new BadRequestAlertException("Extended user not found", ENTITY_NAME, "usernotfound"));

        if (extendedUser.getFamily() != null) {
            return extendedUser.getFamily();
        }

        // Create a new family if not exists
        Family family = new Family();
        family.setName("My Family");
        family.setCreatedAt(Instant.now());
        family.setModifiedAt(Instant.now());
        return familyRepository.save(family);
    }
}

