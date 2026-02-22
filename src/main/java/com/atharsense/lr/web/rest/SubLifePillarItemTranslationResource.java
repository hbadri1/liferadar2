package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.SubLifePillarItemTranslation;
import com.atharsense.lr.repository.SubLifePillarItemTranslationRepository;
import com.atharsense.lr.service.SubLifePillarItemTranslationService;
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
 * REST controller for managing {@link com.atharsense.lr.domain.SubLifePillarItemTranslation}.
 */
@RestController
@RequestMapping("/api/sub-life-pillar-item-translations")
public class SubLifePillarItemTranslationResource {

    private static final Logger LOG = LoggerFactory.getLogger(SubLifePillarItemTranslationResource.class);

    private static final String ENTITY_NAME = "subLifePillarItemTranslation";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final SubLifePillarItemTranslationService subLifePillarItemTranslationService;

    private final SubLifePillarItemTranslationRepository subLifePillarItemTranslationRepository;

    public SubLifePillarItemTranslationResource(
        SubLifePillarItemTranslationService subLifePillarItemTranslationService,
        SubLifePillarItemTranslationRepository subLifePillarItemTranslationRepository
    ) {
        this.subLifePillarItemTranslationService = subLifePillarItemTranslationService;
        this.subLifePillarItemTranslationRepository = subLifePillarItemTranslationRepository;
    }

    /**
     * {@code POST  /sub-life-pillar-item-translations} : Create a new subLifePillarItemTranslation.
     *
     * @param subLifePillarItemTranslation the subLifePillarItemTranslation to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new subLifePillarItemTranslation, or with status {@code 400 (Bad Request)} if the subLifePillarItemTranslation has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<SubLifePillarItemTranslation> createSubLifePillarItemTranslation(
        @Valid @RequestBody SubLifePillarItemTranslation subLifePillarItemTranslation
    ) throws URISyntaxException {
        LOG.debug("REST request to save SubLifePillarItemTranslation : {}", subLifePillarItemTranslation);
        if (subLifePillarItemTranslation.getId() != null) {
            throw new BadRequestAlertException("A new subLifePillarItemTranslation cannot already have an ID", ENTITY_NAME, "idexists");
        }
        subLifePillarItemTranslation = subLifePillarItemTranslationService.save(subLifePillarItemTranslation);
        return ResponseEntity.created(new URI("/api/sub-life-pillar-item-translations/" + subLifePillarItemTranslation.getId()))
            .headers(
                HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, subLifePillarItemTranslation.getId().toString())
            )
            .body(subLifePillarItemTranslation);
    }

    /**
     * {@code PUT  /sub-life-pillar-item-translations/:id} : Updates an existing subLifePillarItemTranslation.
     *
     * @param id the id of the subLifePillarItemTranslation to save.
     * @param subLifePillarItemTranslation the subLifePillarItemTranslation to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated subLifePillarItemTranslation,
     * or with status {@code 400 (Bad Request)} if the subLifePillarItemTranslation is not valid,
     * or with status {@code 500 (Internal Server Error)} if the subLifePillarItemTranslation couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SubLifePillarItemTranslation> updateSubLifePillarItemTranslation(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody SubLifePillarItemTranslation subLifePillarItemTranslation
    ) throws URISyntaxException {
        LOG.debug("REST request to update SubLifePillarItemTranslation : {}, {}", id, subLifePillarItemTranslation);
        if (subLifePillarItemTranslation.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, subLifePillarItemTranslation.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!subLifePillarItemTranslationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        subLifePillarItemTranslation = subLifePillarItemTranslationService.update(subLifePillarItemTranslation);
        return ResponseEntity.ok()
            .headers(
                HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, subLifePillarItemTranslation.getId().toString())
            )
            .body(subLifePillarItemTranslation);
    }

    /**
     * {@code PATCH  /sub-life-pillar-item-translations/:id} : Partial updates given fields of an existing subLifePillarItemTranslation, field will ignore if it is null
     *
     * @param id the id of the subLifePillarItemTranslation to save.
     * @param subLifePillarItemTranslation the subLifePillarItemTranslation to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated subLifePillarItemTranslation,
     * or with status {@code 400 (Bad Request)} if the subLifePillarItemTranslation is not valid,
     * or with status {@code 404 (Not Found)} if the subLifePillarItemTranslation is not found,
     * or with status {@code 500 (Internal Server Error)} if the subLifePillarItemTranslation couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<SubLifePillarItemTranslation> partialUpdateSubLifePillarItemTranslation(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody SubLifePillarItemTranslation subLifePillarItemTranslation
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update SubLifePillarItemTranslation partially : {}, {}", id, subLifePillarItemTranslation);
        if (subLifePillarItemTranslation.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, subLifePillarItemTranslation.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!subLifePillarItemTranslationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<SubLifePillarItemTranslation> result = subLifePillarItemTranslationService.partialUpdate(subLifePillarItemTranslation);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, subLifePillarItemTranslation.getId().toString())
        );
    }

    /**
     * {@code GET  /sub-life-pillar-item-translations} : get all the subLifePillarItemTranslations.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of subLifePillarItemTranslations in body.
     */
    @GetMapping("")
    public List<SubLifePillarItemTranslation> getAllSubLifePillarItemTranslations() {
        LOG.debug("REST request to get all SubLifePillarItemTranslations");
        return subLifePillarItemTranslationService.findAll();
    }

    /**
     * {@code GET  /sub-life-pillar-item-translations/:id} : get the "id" subLifePillarItemTranslation.
     *
     * @param id the id of the subLifePillarItemTranslation to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the subLifePillarItemTranslation, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubLifePillarItemTranslation> getSubLifePillarItemTranslation(@PathVariable("id") Long id) {
        LOG.debug("REST request to get SubLifePillarItemTranslation : {}", id);
        Optional<SubLifePillarItemTranslation> subLifePillarItemTranslation = subLifePillarItemTranslationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(subLifePillarItemTranslation);
    }

    /**
     * {@code DELETE  /sub-life-pillar-item-translations/:id} : delete the "id" subLifePillarItemTranslation.
     *
     * @param id the id of the subLifePillarItemTranslation to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubLifePillarItemTranslation(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete SubLifePillarItemTranslation : {}", id);
        subLifePillarItemTranslationService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
