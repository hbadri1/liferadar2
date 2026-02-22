package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.SubLifePillarTranslation;
import com.atharsense.lr.repository.SubLifePillarTranslationRepository;
import com.atharsense.lr.service.SubLifePillarTranslationService;
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
 * REST controller for managing {@link com.atharsense.lr.domain.SubLifePillarTranslation}.
 */
@RestController
@RequestMapping("/api/sub-life-pillar-translations")
public class SubLifePillarTranslationResource {

    private static final Logger LOG = LoggerFactory.getLogger(SubLifePillarTranslationResource.class);

    private static final String ENTITY_NAME = "subLifePillarTranslation";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final SubLifePillarTranslationService subLifePillarTranslationService;

    private final SubLifePillarTranslationRepository subLifePillarTranslationRepository;

    public SubLifePillarTranslationResource(
        SubLifePillarTranslationService subLifePillarTranslationService,
        SubLifePillarTranslationRepository subLifePillarTranslationRepository
    ) {
        this.subLifePillarTranslationService = subLifePillarTranslationService;
        this.subLifePillarTranslationRepository = subLifePillarTranslationRepository;
    }

    /**
     * {@code POST  /sub-life-pillar-translations} : Create a new subLifePillarTranslation.
     *
     * @param subLifePillarTranslation the subLifePillarTranslation to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new subLifePillarTranslation, or with status {@code 400 (Bad Request)} if the subLifePillarTranslation has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<SubLifePillarTranslation> createSubLifePillarTranslation(
        @Valid @RequestBody SubLifePillarTranslation subLifePillarTranslation
    ) throws URISyntaxException {
        LOG.debug("REST request to save SubLifePillarTranslation : {}", subLifePillarTranslation);
        if (subLifePillarTranslation.getId() != null) {
            throw new BadRequestAlertException("A new subLifePillarTranslation cannot already have an ID", ENTITY_NAME, "idexists");
        }
        subLifePillarTranslation = subLifePillarTranslationService.save(subLifePillarTranslation);
        return ResponseEntity.created(new URI("/api/sub-life-pillar-translations/" + subLifePillarTranslation.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, subLifePillarTranslation.getId().toString()))
            .body(subLifePillarTranslation);
    }

    /**
     * {@code PUT  /sub-life-pillar-translations/:id} : Updates an existing subLifePillarTranslation.
     *
     * @param id the id of the subLifePillarTranslation to save.
     * @param subLifePillarTranslation the subLifePillarTranslation to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated subLifePillarTranslation,
     * or with status {@code 400 (Bad Request)} if the subLifePillarTranslation is not valid,
     * or with status {@code 500 (Internal Server Error)} if the subLifePillarTranslation couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SubLifePillarTranslation> updateSubLifePillarTranslation(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody SubLifePillarTranslation subLifePillarTranslation
    ) throws URISyntaxException {
        LOG.debug("REST request to update SubLifePillarTranslation : {}, {}", id, subLifePillarTranslation);
        if (subLifePillarTranslation.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, subLifePillarTranslation.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!subLifePillarTranslationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        subLifePillarTranslation = subLifePillarTranslationService.update(subLifePillarTranslation);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, subLifePillarTranslation.getId().toString()))
            .body(subLifePillarTranslation);
    }

    /**
     * {@code PATCH  /sub-life-pillar-translations/:id} : Partial updates given fields of an existing subLifePillarTranslation, field will ignore if it is null
     *
     * @param id the id of the subLifePillarTranslation to save.
     * @param subLifePillarTranslation the subLifePillarTranslation to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated subLifePillarTranslation,
     * or with status {@code 400 (Bad Request)} if the subLifePillarTranslation is not valid,
     * or with status {@code 404 (Not Found)} if the subLifePillarTranslation is not found,
     * or with status {@code 500 (Internal Server Error)} if the subLifePillarTranslation couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<SubLifePillarTranslation> partialUpdateSubLifePillarTranslation(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody SubLifePillarTranslation subLifePillarTranslation
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update SubLifePillarTranslation partially : {}, {}", id, subLifePillarTranslation);
        if (subLifePillarTranslation.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, subLifePillarTranslation.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!subLifePillarTranslationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<SubLifePillarTranslation> result = subLifePillarTranslationService.partialUpdate(subLifePillarTranslation);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, subLifePillarTranslation.getId().toString())
        );
    }

    /**
     * {@code GET  /sub-life-pillar-translations} : get all the subLifePillarTranslations.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of subLifePillarTranslations in body.
     */
    @GetMapping("")
    public List<SubLifePillarTranslation> getAllSubLifePillarTranslations() {
        LOG.debug("REST request to get all SubLifePillarTranslations");
        return subLifePillarTranslationService.findAll();
    }

    /**
     * {@code GET  /sub-life-pillar-translations/:id} : get the "id" subLifePillarTranslation.
     *
     * @param id the id of the subLifePillarTranslation to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the subLifePillarTranslation, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubLifePillarTranslation> getSubLifePillarTranslation(@PathVariable("id") Long id) {
        LOG.debug("REST request to get SubLifePillarTranslation : {}", id);
        Optional<SubLifePillarTranslation> subLifePillarTranslation = subLifePillarTranslationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(subLifePillarTranslation);
    }

    /**
     * {@code DELETE  /sub-life-pillar-translations/:id} : delete the "id" subLifePillarTranslation.
     *
     * @param id the id of the subLifePillarTranslation to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubLifePillarTranslation(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete SubLifePillarTranslation : {}", id);
        subLifePillarTranslationService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
