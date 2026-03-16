package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.SubPillarItem;
import com.atharsense.lr.domain.ExtendedUser;
import com.atharsense.lr.domain.User;
import com.atharsense.lr.repository.SubPillarItemRepository;
import com.atharsense.lr.repository.UserRepository;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.security.SecurityUtils;
import com.atharsense.lr.service.SubPillarItemQueryService;
import com.atharsense.lr.service.SubPillarItemService;
import com.atharsense.lr.service.criteria.SubPillarItemCriteria;
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

/**
 * REST controller for managing {@link com.atharsense.lr.domain.SubPillarItem}.
 */
@RestController
@RequestMapping("/api/sub-pillar-items")
public class SubPillarItemResource {

    private static final Logger LOG = LoggerFactory.getLogger(SubPillarItemResource.class);

    private static final String ENTITY_NAME = "subPillarItem";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final SubPillarItemService subPillarItemService;

    private final SubPillarItemRepository subPillarItemRepository;

    private final SubPillarItemQueryService subPillarItemQueryService;

    private final UserRepository userRepository;

    private final ExtendedUserRepository extendedUserRepository;

    public SubPillarItemResource(
        SubPillarItemService subPillarItemService,
        SubPillarItemRepository subPillarItemRepository,
        SubPillarItemQueryService subPillarItemQueryService,
        UserRepository userRepository,
        ExtendedUserRepository extendedUserRepository
    ) {
        this.subPillarItemService = subPillarItemService;
        this.subPillarItemRepository = subPillarItemRepository;
        this.subPillarItemQueryService = subPillarItemQueryService;
        this.userRepository = userRepository;
        this.extendedUserRepository = extendedUserRepository;
    }

    /**
     * {@code POST  /sub-pillar-items} : Create a new subPillarItem.
     *
     * @param subPillarItem the subPillarItem to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new subPillarItem, or with status {@code 400 (Bad Request)} if the subPillarItem has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<SubPillarItem> createSubPillarItem(@Valid @RequestBody SubPillarItem subPillarItem)
        throws URISyntaxException {
        LOG.debug("REST request to save SubPillarItem : {}", subPillarItem);
        if (subPillarItem.getId() != null) {
            throw new BadRequestAlertException("A new subPillarItem cannot already have an ID", ENTITY_NAME, "idexists");
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
        subPillarItem.setOwner(extendedUser);

        subPillarItem = subPillarItemService.save(subPillarItem);
        return ResponseEntity.created(new URI("/api/sub-pillar-items/" + subPillarItem.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, subPillarItem.getId().toString()))
            .body(subPillarItem);
    }

    private String buildFullName(User user) {
        String firstName = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String lastName = user.getLastName() != null ? user.getLastName().trim() : "";
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isEmpty() ? user.getLogin() : fullName;
    }

    /**
     * {@code PUT  /sub-pillar-items/:id} : Updates an existing subPillarItem.
     *
     * @param id the id of the subPillarItem to save.
     * @param subPillarItem the subPillarItem to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated subPillarItem,
     * or with status {@code 400 (Bad Request)} if the subPillarItem is not valid,
     * or with status {@code 500 (Internal Server Error)} if the subPillarItem couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SubPillarItem> updateSubPillarItem(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody SubPillarItem subPillarItem
    ) throws URISyntaxException {
        LOG.debug("REST request to update SubPillarItem : {}, {}", id, subPillarItem);
        if (subPillarItem.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, subPillarItem.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!subPillarItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        // Preserve the owner, translations, and evaluations if not provided in the request
        if (subPillarItem.getOwner() == null || subPillarItem.getTranslations() == null || subPillarItem.getTranslations().isEmpty()) {
            SubPillarItem existingItem = subPillarItemService.findOneWithTranslations(id)
                .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));

            if (subPillarItem.getOwner() == null) {
                subPillarItem.setOwner(existingItem.getOwner());
            }

            if (subPillarItem.getTranslations() == null || subPillarItem.getTranslations().isEmpty()) {
                subPillarItem.setTranslations(existingItem.getTranslations());
            }

            // Preserve evaluations to prevent orphan removal
            if (subPillarItem.getEvaluations() == null || subPillarItem.getEvaluations().isEmpty()) {
                subPillarItem.setEvaluations(existingItem.getEvaluations());
            }
        }

        subPillarItem = subPillarItemService.update(subPillarItem);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, subPillarItem.getId().toString()))
            .body(subPillarItem);
    }

    /**
     * {@code PATCH  /sub-pillar-items/:id} : Partial updates given fields of an existing subPillarItem, field will ignore if it is null
     *
     * @param id the id of the subPillarItem to save.
     * @param subPillarItem the subPillarItem to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated subPillarItem,
     * or with status {@code 400 (Bad Request)} if the subPillarItem is not valid,
     * or with status {@code 404 (Not Found)} if the subPillarItem is not found,
     * or with status {@code 500 (Internal Server Error)} if the subPillarItem couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<SubPillarItem> partialUpdateSubPillarItem(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody SubPillarItem subPillarItem
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update SubPillarItem partially : {}, {}", id, subPillarItem);
        if (subPillarItem.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, subPillarItem.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!subPillarItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<SubPillarItem> result = subPillarItemService.partialUpdate(subPillarItem);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, subPillarItem.getId().toString())
        );
    }

    /**
     * {@code GET  /sub-pillar-items} : get all the subPillarItems.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of subPillarItems in body.
     */
    @GetMapping("")
    public ResponseEntity<List<SubPillarItem>> getAllSubPillarItems(
        SubPillarItemCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(value = "eagerload", required = false, defaultValue = "false") boolean eagerload
    ) {
        LOG.debug("REST request to get SubPillarItems by criteria: {}", criteria);

        Page<SubPillarItem> page = eagerload
            ? subPillarItemQueryService.findByCriteriaWithEagerRelationships(criteria, pageable)
            : subPillarItemQueryService.findByCriteria(criteria, pageable);

        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /sub-pillar-items/count} : count all the subPillarItems.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countSubPillarItems(SubPillarItemCriteria criteria) {
        LOG.debug("REST request to count SubPillarItems by criteria: {}", criteria);
        return ResponseEntity.ok().body(subPillarItemQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /sub-pillar-items/:id} : get the "id" subPillarItem.
     *
     * @param id the id of the subPillarItem to retrieve.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the subPillarItem, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubPillarItem> getSubPillarItem(
        @PathVariable("id") Long id,
        @RequestParam(value = "eagerload", required = false, defaultValue = "false") boolean eagerload
    ) {
        LOG.debug("REST request to get SubPillarItem : {}", id);
        Optional<SubPillarItem> subPillarItem = eagerload
            ? subPillarItemService.findOneWithTranslations(id)
            : subPillarItemService.findOne(id);
        return ResponseUtil.wrapOrNotFound(subPillarItem);
    }

    /**
     * {@code DELETE  /sub-pillar-items/:id} : delete the "id" subPillarItem.
     *
     * @param id the id of the subPillarItem to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubPillarItem(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete SubPillarItem : {}", id);
        subPillarItemService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
