package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.Pillar;
import com.atharsense.lr.domain.ExtendedUser;
import com.atharsense.lr.domain.User;
import com.atharsense.lr.repository.PillarRepository;
import com.atharsense.lr.repository.UserRepository;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.security.SecurityUtils;
import com.atharsense.lr.service.PillarQueryService;
import com.atharsense.lr.service.PillarService;
import com.atharsense.lr.service.SuggestedPillarImportService;
import com.atharsense.lr.service.criteria.PillarCriteria;
import com.atharsense.lr.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;
import tech.jhipster.service.filter.LongFilter;

/**
 * REST controller for managing {@link com.atharsense.lr.domain.Pillar}.
 */
@RestController
@RequestMapping("/api/pillars")
public class PillarResource {

    private static final Logger LOG = LoggerFactory.getLogger(PillarResource.class);

    private static final String ENTITY_NAME = "pillar";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final PillarService pillarService;

    private final PillarRepository pillarRepository;

    private final PillarQueryService pillarQueryService;

    private final SuggestedPillarImportService suggestedPillarImportService;

    private final UserRepository userRepository;

    private final ExtendedUserRepository extendedUserRepository;

    public PillarResource(
        PillarService pillarService,
        PillarRepository pillarRepository,
        PillarQueryService pillarQueryService,
        SuggestedPillarImportService suggestedPillarImportService,
        UserRepository userRepository,
        ExtendedUserRepository extendedUserRepository
    ) {
        this.pillarService = pillarService;
        this.pillarRepository = pillarRepository;
        this.pillarQueryService = pillarQueryService;
        this.suggestedPillarImportService = suggestedPillarImportService;
        this.userRepository = userRepository;
        this.extendedUserRepository = extendedUserRepository;
    }

    /**
     * {@code POST  /pillars} : Create a new pillar.
     *
     * @param pillar the pillar to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new pillar, or with status {@code 400 (Bad Request)} if the pillar has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Pillar> createPillar(@Valid @RequestBody Pillar pillar) throws URISyntaxException {
        LOG.debug("REST request to save Pillar : {}", pillar);
        if (pillar.getId() != null) {
            throw new BadRequestAlertException("A new pillar cannot already have an ID", ENTITY_NAME, "idexists");
        }

        // Automatically set the current user as owner
        String currentLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new BadRequestAlertException("User not authenticated", ENTITY_NAME, "notauthenticated"));
        User currentUser = userRepository.findOneByLogin(currentLogin)
            .orElseThrow(() -> new BadRequestAlertException("User not found", ENTITY_NAME, "usernotfound"));

        // Get or create ExtendedUser if it doesn't exist
        ExtendedUser extendedUser = extendedUserRepository.findOneByUser(currentUser)
            .orElseGet(() -> {
                ExtendedUser newExtendedUser = new ExtendedUser();
                newExtendedUser.setUser(currentUser);
                newExtendedUser.setFullName(buildFullName(currentUser));
                newExtendedUser.setActive(currentUser.isActivated());
                return extendedUserRepository.save(newExtendedUser);
            });
        pillar.setOwner(extendedUser);
        validateDuplicateCode(extendedUser.getId(), pillar.getCode(), null);

        pillar = pillarService.save(pillar);
        return ResponseEntity.created(new URI("/api/pillars/" + pillar.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, pillar.getId().toString()))
            .body(pillar);
    }

    /**
     * {@code PUT  /pillars/:id} : Updates an existing pillar.
     *
     * @param id the id of the pillar to save.
     * @param pillar the pillar to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated pillar,
     * or with status {@code 400 (Bad Request)} if the pillar is not valid,
     * or with status {@code 500 (Internal Server Error)} if the pillar couldn't be updated.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Pillar> updatePillar(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Pillar pillar
    ) {
        LOG.debug("REST request to update Pillar : {}, {}", id, pillar);
        if (pillar.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, pillar.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!pillarRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        // Preserve the owner, translations, and subPillars if not provided in the request
        if (pillar.getOwner() == null || pillar.getTranslations() == null || pillar.getTranslations().isEmpty()) {
            Pillar existingPillar = pillarService.findOneWithTranslations(id)
                .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));

            if (pillar.getOwner() == null) {
                pillar.setOwner(existingPillar.getOwner());
            }

            if (pillar.getTranslations() == null || pillar.getTranslations().isEmpty()) {
                pillar.setTranslations(existingPillar.getTranslations());
            }

            // Preserve subPillars to prevent orphan removal
            if (pillar.getSubPillars() == null || pillar.getSubPillars().isEmpty()) {
                pillar.setSubPillars(existingPillar.getSubPillars());
            }
        }

        if (pillar.getOwner() != null) {
            validateDuplicateCode(pillar.getOwner().getId(), pillar.getCode(), pillar.getId());
        }

        pillar = pillarService.update(pillar);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, pillar.getId().toString()))
            .body(pillar);
    }

    /**
     * {@code PATCH  /pillars/:id} : Partial updates given fields of an existing pillar, field will ignore if it is null
     *
     * @param id the id of the pillar to save.
     * @param pillar the pillar to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated pillar,
     * or with status {@code 400 (Bad Request)} if the pillar is not valid,
     * or with status {@code 404 (Not Found)} if the pillar is not found,
     * or with status {@code 500 (Internal Server Error)} if the pillar couldn't be updated.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Pillar> partialUpdatePillar(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Pillar pillar
    ) {
        LOG.debug("REST request to partial update Pillar partially : {}, {}", id, pillar);
        if (pillar.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, pillar.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!pillarRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Pillar> result = pillarService.partialUpdate(pillar);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, pillar.getId().toString())
        );
    }

    /**
     * {@code GET  /pillars} : get all the pillars.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of pillars in body.
     */
    @GetMapping("")
    public ResponseEntity<List<Pillar>> getAllPillars(
        PillarCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get Pillars by criteria: {}", criteria);

        // Filter by current user automatically
        String currentLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new BadRequestAlertException("User not authenticated", ENTITY_NAME, "notauthenticated"));

        User currentUser = userRepository.findOneByLogin(currentLogin)
            .orElseThrow(() -> new BadRequestAlertException("User not found", ENTITY_NAME, "usernotfound"));

        // Get or create ExtendedUser if it doesn't exist
        ExtendedUser extendedUser = extendedUserRepository.findOneByUser(currentUser)
            .orElseGet(() -> {
                ExtendedUser newExtendedUser = new ExtendedUser();
                newExtendedUser.setUser(currentUser);
                newExtendedUser.setFullName(buildFullName(currentUser));
                newExtendedUser.setActive(currentUser.isActivated());
                return extendedUserRepository.save(newExtendedUser);
            });

        // Set owner filter to current user
        if (criteria.getOwnerId() == null) {
            LongFilter ownerFilter = new LongFilter();
            ownerFilter.setEquals(extendedUser.getId());
            criteria.setOwnerId(ownerFilter);
        }

        Page<Pillar> page = pillarQueryService.findByCriteria(criteria, pageable);
        List<Pillar> deduplicatedContent = deduplicatePillars(page.getContent());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(deduplicatedContent);
    }

    private String buildFullName(User user) {
        String firstName = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String lastName = user.getLastName() != null ? user.getLastName().trim() : "";
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isEmpty() ? user.getLogin() : fullName;
    }

    private void validateDuplicateCode(Long ownerId, String code, Long currentPillarId) {
        if (ownerId == null || code == null || code.isBlank()) {
            return;
        }

        boolean duplicateExists = currentPillarId == null
            ? pillarRepository.existsByOwnerIdAndCodeIgnoreCase(ownerId, code)
            : pillarRepository.existsByOwnerIdAndCodeIgnoreCaseAndIdNot(ownerId, code, currentPillarId);

        if (duplicateExists) {
            throw new BadRequestAlertException("A pillar with this code already exists", ENTITY_NAME, "codeduplicate");
        }
    }

    private List<Pillar> deduplicatePillars(List<Pillar> pillars) {
        Map<String, Pillar> deduplicatedByKey = new LinkedHashMap<>();

        for (Pillar pillar : pillars) {
            String key = buildPillarDeduplicationKey(pillar);
            Pillar existing = deduplicatedByKey.get(key);

            if (existing == null) {
                deduplicatedByKey.put(key, pillar);
            } else {
                deduplicatedByKey.put(key, mergeDuplicatePillars(existing, pillar));
            }
        }

        return new ArrayList<>(deduplicatedByKey.values());
    }

    private String buildPillarDeduplicationKey(Pillar pillar) {
        Long ownerId = pillar.getOwner() != null ? pillar.getOwner().getId() : null;
        String code = pillar.getCode() != null ? pillar.getCode().trim().toLowerCase(Locale.ROOT) : null;

        if (ownerId != null && code != null && !code.isBlank()) {
            return ownerId + ":" + code;
        }

        return "id:" + pillar.getId();
    }

    private Pillar mergeDuplicatePillars(Pillar first, Pillar second) {
        Pillar preferred = choosePreferredPillar(first, second);
        Pillar other = preferred == first ? second : first;

        Map<String, com.atharsense.lr.domain.PillarTranslation> translationsByLang = new LinkedHashMap<>();
        preferred.getTranslations().forEach(translation -> translationsByLang.put(buildTranslationKey(translation), translation));
        other.getTranslations().forEach(translation -> translationsByLang.putIfAbsent(buildTranslationKey(translation), translation));

        preferred.setTranslations(new java.util.LinkedHashSet<>(translationsByLang.values()));
        return preferred;
    }

    private Pillar choosePreferredPillar(Pillar first, Pillar second) {
        int firstTranslationCount = first.getTranslations() != null ? first.getTranslations().size() : 0;
        int secondTranslationCount = second.getTranslations() != null ? second.getTranslations().size() : 0;

        if (firstTranslationCount != secondTranslationCount) {
            return firstTranslationCount > secondTranslationCount ? first : second;
        }

        if (first.getId() == null) {
            return second;
        }
        if (second.getId() == null) {
            return first;
        }

        return first.getId() <= second.getId() ? first : second;
    }

    private String buildTranslationKey(com.atharsense.lr.domain.PillarTranslation translation) {
        if (translation.getLang() != null) {
            return translation.getLang().name();
        }

        return "id:" + translation.getId();
    }

    /**
     * {@code GET  /pillars/count} : count all the pillars.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countPillars(PillarCriteria criteria) {
        LOG.debug("REST request to count Pillars by criteria: {}", criteria);
        return ResponseEntity.ok().body(pillarQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /pillars/:id} : get the "id" pillar.
     *
     * @param id the id of the pillar to retrieve.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the pillar, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Pillar> getPillar(
        @PathVariable("id") Long id,
        @RequestParam(value = "eagerload", required = false, defaultValue = "false") boolean eagerload
    ) {
        LOG.debug("REST request to get Pillar : {}", id);
        Optional<Pillar> pillar = eagerload
            ? pillarService.findOneWithTranslations(id)
            : pillarService.findOne(id);
        return ResponseUtil.wrapOrNotFound(pillar);
    }

    /**
     * {@code DELETE  /pillars/:id} : delete the "id" pillar.
     *
     * @param id the id of the pillar to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePillar(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Pillar : {}", id);
        pillarService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    @PostMapping("/load-suggested")
    public ResponseEntity<SuggestedPillarImportService.SuggestedPillarImportResult> loadSuggestedPillars() {
        LOG.debug("REST request to import suggested pillars");
        SuggestedPillarImportService.SuggestedPillarImportResult result = suggestedPillarImportService.importSuggestedPillars();
        return ResponseEntity.ok(result);
    }
}
