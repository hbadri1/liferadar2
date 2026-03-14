package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.LifePillar;
import com.atharsense.lr.domain.ExtendedUser;
import com.atharsense.lr.domain.User;
import com.atharsense.lr.repository.LifePillarRepository;
import com.atharsense.lr.repository.UserRepository;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.security.SecurityUtils;
import com.atharsense.lr.service.LifePillarQueryService;
import com.atharsense.lr.service.LifePillarService;
import com.atharsense.lr.service.SuggestedLifePillarImportService;
import com.atharsense.lr.service.criteria.LifePillarCriteria;
import com.atharsense.lr.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
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
 * REST controller for managing {@link com.atharsense.lr.domain.LifePillar}.
 */
@RestController
@RequestMapping("/api/life-pillars")
public class LifePillarResource {

    private static final Logger LOG = LoggerFactory.getLogger(LifePillarResource.class);

    private static final String ENTITY_NAME = "lifePillar";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final LifePillarService lifePillarService;

    private final LifePillarRepository lifePillarRepository;

    private final LifePillarQueryService lifePillarQueryService;

    private final SuggestedLifePillarImportService suggestedLifePillarImportService;

    private final UserRepository userRepository;

    private final ExtendedUserRepository extendedUserRepository;

    public LifePillarResource(
        LifePillarService lifePillarService,
        LifePillarRepository lifePillarRepository,
        LifePillarQueryService lifePillarQueryService,
        SuggestedLifePillarImportService suggestedLifePillarImportService,
        UserRepository userRepository,
        ExtendedUserRepository extendedUserRepository
    ) {
        this.lifePillarService = lifePillarService;
        this.lifePillarRepository = lifePillarRepository;
        this.lifePillarQueryService = lifePillarQueryService;
        this.suggestedLifePillarImportService = suggestedLifePillarImportService;
        this.userRepository = userRepository;
        this.extendedUserRepository = extendedUserRepository;
    }

    /**
     * {@code POST  /life-pillars} : Create a new lifePillar.
     *
     * @param lifePillar the lifePillar to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new lifePillar, or with status {@code 400 (Bad Request)} if the lifePillar has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<LifePillar> createLifePillar(@Valid @RequestBody LifePillar lifePillar) throws URISyntaxException {
        LOG.debug("REST request to save LifePillar : {}", lifePillar);
        if (lifePillar.getId() != null) {
            throw new BadRequestAlertException("A new lifePillar cannot already have an ID", ENTITY_NAME, "idexists");
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
        lifePillar.setOwner(extendedUser);

        lifePillar = lifePillarService.save(lifePillar);
        return ResponseEntity.created(new URI("/api/life-pillars/" + lifePillar.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, lifePillar.getId().toString()))
            .body(lifePillar);
    }

    /**
     * {@code PUT  /life-pillars/:id} : Updates an existing lifePillar.
     *
     * @param id the id of the lifePillar to save.
     * @param lifePillar the lifePillar to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated lifePillar,
     * or with status {@code 400 (Bad Request)} if the lifePillar is not valid,
     * or with status {@code 500 (Internal Server Error)} if the lifePillar couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<LifePillar> updateLifePillar(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody LifePillar lifePillar
    ) {
        LOG.debug("REST request to update LifePillar : {}, {}", id, lifePillar);
        if (lifePillar.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, lifePillar.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!lifePillarRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        // Preserve the owner, translations, and subLifePillars if not provided in the request
        if (lifePillar.getOwner() == null || lifePillar.getTranslations() == null || lifePillar.getTranslations().isEmpty()) {
            LifePillar existingPillar = lifePillarService.findOneWithTranslations(id)
                .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));

            if (lifePillar.getOwner() == null) {
                lifePillar.setOwner(existingPillar.getOwner());
            }

            if (lifePillar.getTranslations() == null || lifePillar.getTranslations().isEmpty()) {
                lifePillar.setTranslations(existingPillar.getTranslations());
            }

            // Preserve subLifePillars to prevent orphan removal
            if (lifePillar.getSubLifePillars() == null || lifePillar.getSubLifePillars().isEmpty()) {
                lifePillar.setSubLifePillars(existingPillar.getSubLifePillars());
            }
        }

        lifePillar = lifePillarService.update(lifePillar);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, lifePillar.getId().toString()))
            .body(lifePillar);
    }

    /**
     * {@code PATCH  /life-pillars/:id} : Partial updates given fields of an existing lifePillar, field will ignore if it is null
     *
     * @param id the id of the lifePillar to save.
     * @param lifePillar the lifePillar to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated lifePillar,
     * or with status {@code 400 (Bad Request)} if the lifePillar is not valid,
     * or with status {@code 404 (Not Found)} if the lifePillar is not found,
     * or with status {@code 500 (Internal Server Error)} if the lifePillar couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<LifePillar> partialUpdateLifePillar(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody LifePillar lifePillar
    ) {
        LOG.debug("REST request to partial update LifePillar partially : {}, {}", id, lifePillar);
        if (lifePillar.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, lifePillar.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!lifePillarRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<LifePillar> result = lifePillarService.partialUpdate(lifePillar);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, lifePillar.getId().toString())
        );
    }

    /**
     * {@code GET  /life-pillars} : get all the lifePillars.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of lifePillars in body.
     */
    @GetMapping("")
    public ResponseEntity<List<LifePillar>> getAllLifePillars(
        LifePillarCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get LifePillars by criteria: {}", criteria);

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

        Page<LifePillar> page = lifePillarQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    private String buildFullName(User user) {
        String firstName = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String lastName = user.getLastName() != null ? user.getLastName().trim() : "";
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isEmpty() ? user.getLogin() : fullName;
    }

    /**
     * {@code GET  /life-pillars/count} : count all the lifePillars.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countLifePillars(LifePillarCriteria criteria) {
        LOG.debug("REST request to count LifePillars by criteria: {}", criteria);
        return ResponseEntity.ok().body(lifePillarQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /life-pillars/:id} : get the "id" lifePillar.
     *
     * @param id the id of the lifePillar to retrieve.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the lifePillar, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<LifePillar> getLifePillar(
        @PathVariable("id") Long id,
        @RequestParam(value = "eagerload", required = false, defaultValue = "false") boolean eagerload
    ) {
        LOG.debug("REST request to get LifePillar : {}", id);
        Optional<LifePillar> lifePillar = eagerload
            ? lifePillarService.findOneWithTranslations(id)
            : lifePillarService.findOne(id);
        return ResponseUtil.wrapOrNotFound(lifePillar);
    }

    /**
     * {@code DELETE  /life-pillars/:id} : delete the "id" lifePillar.
     *
     * @param id the id of the lifePillar to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLifePillar(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete LifePillar : {}", id);
        lifePillarService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    @PostMapping("/load-suggested")
    public ResponseEntity<SuggestedLifePillarImportService.SuggestedLifePillarImportResult> loadSuggestedLifePillars() {
        LOG.debug("REST request to import suggested life pillars");
        SuggestedLifePillarImportService.SuggestedLifePillarImportResult result = suggestedLifePillarImportService.importSuggestedLifePillars();
        return ResponseEntity.ok(result);
    }
}
