package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.ExtendedUser;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.service.ExtendedUserService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.atharsense.lr.domain.ExtendedUser}.
 */
@RestController
@RequestMapping("/api/extended-users")
public class ExtendedUserResource {

    private static final Logger LOG = LoggerFactory.getLogger(ExtendedUserResource.class);

    private static final String ENTITY_NAME = "extendedUser";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ExtendedUserService extendedUserService;

    private final ExtendedUserRepository extendedUserRepository;

    public ExtendedUserResource(ExtendedUserService extendedUserService, ExtendedUserRepository extendedUserRepository) {
        this.extendedUserService = extendedUserService;
        this.extendedUserRepository = extendedUserRepository;
    }

    /**
     * {@code POST  /extended-users} : Create a new extendedUser.
     *
     * @param extendedUser the extendedUser to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new extendedUser, or with status {@code 400 (Bad Request)} if the extendedUser has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<ExtendedUser> createExtendedUser(@Valid @RequestBody ExtendedUser extendedUser) throws URISyntaxException {
        LOG.debug("REST request to save ExtendedUser : {}", extendedUser);
        if (extendedUser.getId() != null) {
            throw new BadRequestAlertException("A new extendedUser cannot already have an ID", ENTITY_NAME, "idexists");
        }
        extendedUser = extendedUserService.save(extendedUser);
        return ResponseEntity.created(new URI("/api/extended-users/" + extendedUser.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, extendedUser.getId().toString()))
            .body(extendedUser);
    }

    /**
     * {@code PUT  /extended-users/:id} : Updates an existing extendedUser.
     *
     * @param id the id of the extendedUser to save.
     * @param extendedUser the extendedUser to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated extendedUser,
     * or with status {@code 400 (Bad Request)} if the extendedUser is not valid,
     * or with status {@code 500 (Internal Server Error)} if the extendedUser couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ExtendedUser> updateExtendedUser(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ExtendedUser extendedUser
    ) throws URISyntaxException {
        LOG.debug("REST request to update ExtendedUser : {}, {}", id, extendedUser);
        if (extendedUser.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, extendedUser.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!extendedUserRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        extendedUser = extendedUserService.update(extendedUser);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, extendedUser.getId().toString()))
            .body(extendedUser);
    }

    /**
     * {@code PATCH  /extended-users/:id} : Partial updates given fields of an existing extendedUser, field will ignore if it is null
     *
     * @param id the id of the extendedUser to save.
     * @param extendedUser the extendedUser to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated extendedUser,
     * or with status {@code 400 (Bad Request)} if the extendedUser is not valid,
     * or with status {@code 404 (Not Found)} if the extendedUser is not found,
     * or with status {@code 500 (Internal Server Error)} if the extendedUser couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ExtendedUser> partialUpdateExtendedUser(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ExtendedUser extendedUser
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update ExtendedUser partially : {}, {}", id, extendedUser);
        if (extendedUser.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, extendedUser.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!extendedUserRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ExtendedUser> result = extendedUserService.partialUpdate(extendedUser);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, extendedUser.getId().toString())
        );
    }

    /**
     * {@code GET  /extended-users} : get all the extendedUsers.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of extendedUsers in body.
     */
    @GetMapping("")
    public List<ExtendedUser> getAllExtendedUsers() {
        LOG.debug("REST request to get all ExtendedUsers");
        return extendedUserService.findAll();
    }

    /**
     * {@code GET  /extended-users/:id} : get the "id" extendedUser.
     *
     * @param id the id of the extendedUser to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the extendedUser, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ExtendedUser> getExtendedUser(@PathVariable("id") Long id) {
        LOG.debug("REST request to get ExtendedUser : {}", id);
        Optional<ExtendedUser> extendedUser = extendedUserService.findOne(id);
        return ResponseUtil.wrapOrNotFound(extendedUser);
    }

    /**
     * {@code DELETE  /extended-users/:id} : delete the "id" extendedUser.
     *
     * @param id the id of the extendedUser to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExtendedUser(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete ExtendedUser : {}", id);
        extendedUserService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
