package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.SubPillarTranslation;
import com.atharsense.lr.repository.SubPillarTranslationRepository;
import com.atharsense.lr.service.SubPillarTranslationService;
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
 * REST controller for managing {@link com.atharsense.lr.domain.SubPillarTranslation}.
 */
@RestController
@RequestMapping("/api/sub-pillar-translations")
public class SubPillarTranslationResource {

    private static final Logger LOG = LoggerFactory.getLogger(SubPillarTranslationResource.class);

    private static final String ENTITY_NAME = "subPillarTranslation";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final SubPillarTranslationService subPillarTranslationService;

    private final SubPillarTranslationRepository subPillarTranslationRepository;

    public SubPillarTranslationResource(
        SubPillarTranslationService subPillarTranslationService,
        SubPillarTranslationRepository subPillarTranslationRepository
    ) {
        this.subPillarTranslationService = subPillarTranslationService;
        this.subPillarTranslationRepository = subPillarTranslationRepository;
    }

    /**
     * {@code POST  /sub-pillar-translations} : Create a new subPillarTranslation.
     *
     * @param subPillarTranslation the subPillarTranslation to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new subPillarTranslation, or with status {@code 400 (Bad Request)} if the subPillarTranslation has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<SubPillarTranslation> createSubPillarTranslation(
        @Valid @RequestBody SubPillarTranslation subPillarTranslation
    ) throws URISyntaxException {
        LOG.debug("REST request to save SubPillarTranslation : {}", subPillarTranslation);
        if (subPillarTranslation.getId() != null) {
            throw new BadRequestAlertException("A new subPillarTranslation cannot already have an ID", ENTITY_NAME, "idexists");
        }
        subPillarTranslation = subPillarTranslationService.save(subPillarTranslation);
        return ResponseEntity.created(new URI("/api/sub-pillar-translations/" + subPillarTranslation.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, subPillarTranslation.getId().toString()))
            .body(subPillarTranslation);
    }

    /**
     * {@code PUT  /sub-pillar-translations/:id} : Updates an existing subPillarTranslation.
     *
     * @param id the id of the subPillarTranslation to save.
     * @param subPillarTranslation the subPillarTranslation to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated subPillarTranslation,
     * or with status {@code 400 (Bad Request)} if the subPillarTranslation is not valid,
     * or with status {@code 500 (Internal Server Error)} if the subPillarTranslation couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SubPillarTranslation> updateSubPillarTranslation(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody SubPillarTranslation subPillarTranslation
    ) throws URISyntaxException {
        LOG.debug("REST request to update SubPillarTranslation : {}, {}", id, subPillarTranslation);
        if (subPillarTranslation.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, subPillarTranslation.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!subPillarTranslationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        subPillarTranslation = subPillarTranslationService.update(subPillarTranslation);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, subPillarTranslation.getId().toString()))
            .body(subPillarTranslation);
    }

    /**
     * {@code PATCH  /sub-pillar-translations/:id} : Partial updates given fields of an existing subPillarTranslation, field will ignore if it is null
     *
     * @param id the id of the subPillarTranslation to save.
     * @param subPillarTranslation the subPillarTranslation to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated subPillarTranslation,
     * or with status {@code 400 (Bad Request)} if the subPillarTranslation is not valid,
     * or with status {@code 404 (Not Found)} if the subPillarTranslation is not found,
     * or with status {@code 500 (Internal Server Error)} if the subPillarTranslation couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<SubPillarTranslation> partialUpdateSubPillarTranslation(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody SubPillarTranslation subPillarTranslation
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update SubPillarTranslation partially : {}, {}", id, subPillarTranslation);
        if (subPillarTranslation.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, subPillarTranslation.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!subPillarTranslationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<SubPillarTranslation> result = subPillarTranslationService.partialUpdate(subPillarTranslation);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, subPillarTranslation.getId().toString())
        );
    }

    /**
     * {@code GET  /sub-pillar-translations} : get all the subPillarTranslations.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of subPillarTranslations in body.
     */
    @GetMapping("")
    public List<SubPillarTranslation> getAllSubPillarTranslations() {
        LOG.debug("REST request to get all SubPillarTranslations");
        return subPillarTranslationService.findAll();
    }

    /**
     * {@code GET  /sub-pillar-translations/:id} : get the "id" subPillarTranslation.
     *
     * @param id the id of the subPillarTranslation to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the subPillarTranslation, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubPillarTranslation> getSubPillarTranslation(@PathVariable("id") Long id) {
        LOG.debug("REST request to get SubPillarTranslation : {}", id);
        Optional<SubPillarTranslation> subPillarTranslation = subPillarTranslationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(subPillarTranslation);
    }

    /**
     * {@code DELETE  /sub-pillar-translations/:id} : delete the "id" subPillarTranslation.
     *
     * @param id the id of the subPillarTranslation to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubPillarTranslation(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete SubPillarTranslation : {}", id);
        subPillarTranslationService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
