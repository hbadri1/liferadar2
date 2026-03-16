package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.SubPillar;
import com.atharsense.lr.domain.ExtendedUser;
import com.atharsense.lr.domain.User;
import com.atharsense.lr.repository.SubPillarRepository;
import com.atharsense.lr.repository.UserRepository;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.security.SecurityUtils;
import com.atharsense.lr.service.SubPillarQueryService;
import com.atharsense.lr.service.SubPillarService;
import com.atharsense.lr.service.criteria.SubPillarCriteria;
import com.atharsense.lr.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import tech.jhipster.service.filter.LongFilter;
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

/**
 * REST controller for managing {@link com.atharsense.lr.domain.SubPillar}.
 */
@RestController
@RequestMapping("/api/sub-pillars")
public class SubPillarResource {

    private static final Logger LOG = LoggerFactory.getLogger(SubPillarResource.class);

    private static final String ENTITY_NAME = "subPillar";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final SubPillarService subPillarService;

    private final SubPillarRepository subPillarRepository;

    private final SubPillarQueryService subPillarQueryService;

    private final UserRepository userRepository;

    private final ExtendedUserRepository extendedUserRepository;

    public SubPillarResource(
        SubPillarService subPillarService,
        SubPillarRepository subPillarRepository,
        SubPillarQueryService subPillarQueryService,
        UserRepository userRepository,
        ExtendedUserRepository extendedUserRepository
    ) {
        this.subPillarService = subPillarService;
        this.subPillarRepository = subPillarRepository;
        this.subPillarQueryService = subPillarQueryService;
        this.userRepository = userRepository;
        this.extendedUserRepository = extendedUserRepository;
    }

    /**
     * {@code POST  /sub-pillars} : Create a new subPillar.
     *
     * @param subPillar the subPillar to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new subPillar, or with status {@code 400 (Bad Request)} if the subPillar has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<SubPillar> createSubPillar(@Valid @RequestBody SubPillar subPillar) throws URISyntaxException {
        LOG.debug("REST request to save SubPillar : {}", subPillar);
        if (subPillar.getId() != null) {
            throw new BadRequestAlertException("A new subPillar cannot already have an ID", ENTITY_NAME, "idexists");
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
        subPillar.setOwner(extendedUser);

        subPillar = subPillarService.save(subPillar);
        return ResponseEntity.created(new URI("/api/sub-pillars/" + subPillar.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, subPillar.getId().toString()))
            .body(subPillar);
    }

    private String buildFullName(User user) {
        String firstName = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String lastName = user.getLastName() != null ? user.getLastName().trim() : "";
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isEmpty() ? user.getLogin() : fullName;
    }

    /**
     * {@code PUT  /sub-pillars/:id} : Updates an existing subPillar.
     *
     * @param id the id of the subPillar to save.
     * @param subPillar the subPillar to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated subPillar,
     * or with status {@code 400 (Bad Request)} if the subPillar is not valid,
     * or with status {@code 500 (Internal Server Error)} if the subPillar couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SubPillar> updateSubPillar(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody SubPillar subPillar
    ) throws URISyntaxException {
        LOG.debug("REST request to update SubPillar : {}, {}", id, subPillar);
        if (subPillar.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, subPillar.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!subPillarRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        // Preserve the owner, translations, and items if not provided in the request
        if (subPillar.getOwner() == null || subPillar.getTranslations() == null || subPillar.getTranslations().isEmpty()) {
            SubPillar existingSubPillar = subPillarService.findOneWithTranslations(id)
                .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));

            if (subPillar.getOwner() == null) {
                subPillar.setOwner(existingSubPillar.getOwner());
            }

            if (subPillar.getTranslations() == null || subPillar.getTranslations().isEmpty()) {
                subPillar.setTranslations(existingSubPillar.getTranslations());
            }

            // Preserve items to prevent orphan removal
            if (subPillar.getItems() == null || subPillar.getItems().isEmpty()) {
                subPillar.setItems(existingSubPillar.getItems());
            }
        }

        subPillar = subPillarService.update(subPillar);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, subPillar.getId().toString()))
            .body(subPillar);
    }

    /**
     * {@code PATCH  /sub-pillars/:id} : Partial updates given fields of an existing subPillar, field will ignore if it is null
     *
     * @param id the id of the subPillar to save.
     * @param subPillar the subPillar to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated subPillar,
     * or with status {@code 400 (Bad Request)} if the subPillar is not valid,
     * or with status {@code 404 (Not Found)} if the subPillar is not found,
     * or with status {@code 500 (Internal Server Error)} if the subPillar couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<SubPillar> partialUpdateSubPillar(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody SubPillar subPillar
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update SubPillar partially : {}, {}", id, subPillar);
        if (subPillar.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, subPillar.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!subPillarRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<SubPillar> result = subPillarService.partialUpdate(subPillar);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, subPillar.getId().toString())
        );
    }

    /**
     * {@code GET  /sub-pillars} : get all the subPillars.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of subPillars in body.
     */
    @GetMapping("")
    public ResponseEntity<List<SubPillar>> getAllSubPillars(
        SubPillarCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get SubPillars by criteria: {}", criteria);

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

        Page<SubPillar> page = subPillarQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /sub-pillars/count} : count all the subPillars.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countSubPillars(SubPillarCriteria criteria) {
        LOG.debug("REST request to count SubPillars by criteria: {}", criteria);
        return ResponseEntity.ok().body(subPillarQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /sub-pillars/:id} : get the "id" subPillar.
     *
     * @param id the id of the subPillar to retrieve.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the subPillar, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubPillar> getSubPillar(
        @PathVariable("id") Long id,
        @RequestParam(value = "eagerload", required = false, defaultValue = "false") boolean eagerload
    ) {
        LOG.debug("REST request to get SubPillar : {}", id);
        Optional<SubPillar> subPillar = eagerload
            ? subPillarService.findOneWithTranslations(id)
            : subPillarService.findOne(id);
        return ResponseUtil.wrapOrNotFound(subPillar);
    }

    /**
     * {@code DELETE  /sub-pillars/:id} : delete the "id" subPillar.
     *
     * @param id the id of the subPillar to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubPillar(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete SubPillar : {}", id);
        subPillarService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
