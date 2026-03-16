package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.SubPillarItemTranslation;
import com.atharsense.lr.repository.SubPillarItemTranslationRepository;
import com.atharsense.lr.service.SubPillarItemTranslationService;
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
 * REST controller for managing {@link com.atharsense.lr.domain.SubPillarItemTranslation}.
 */
@RestController
@RequestMapping("/api/sub-pillar-item-translations")
public class SubPillarItemTranslationResource {

    private static final Logger LOG = LoggerFactory.getLogger(SubPillarItemTranslationResource.class);

    private static final String ENTITY_NAME = "subPillarItemTranslation";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final SubPillarItemTranslationService subPillarItemTranslationService;

    private final SubPillarItemTranslationRepository subPillarItemTranslationRepository;

    public SubPillarItemTranslationResource(
        SubPillarItemTranslationService subPillarItemTranslationService,
        SubPillarItemTranslationRepository subPillarItemTranslationRepository
    ) {
        this.subPillarItemTranslationService = subPillarItemTranslationService;
        this.subPillarItemTranslationRepository = subPillarItemTranslationRepository;
    }

    /**
     * {@code POST  /sub-pillar-item-translations} : Create a new subPillarItemTranslation.
     *
     * @param subPillarItemTranslation the subPillarItemTranslation to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new subPillarItemTranslation, or with status {@code 400 (Bad Request)} if the subPillarItemTranslation has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<SubPillarItemTranslation> createSubPillarItemTranslation(
        @Valid @RequestBody SubPillarItemTranslation subPillarItemTranslation
    ) throws URISyntaxException {
        LOG.debug("REST request to save SubPillarItemTranslation : {}", subPillarItemTranslation);
        if (subPillarItemTranslation.getId() != null) {
            throw new BadRequestAlertException("A new subPillarItemTranslation cannot already have an ID", ENTITY_NAME, "idexists");
        }
        subPillarItemTranslation = subPillarItemTranslationService.save(subPillarItemTranslation);
        return ResponseEntity.created(new URI("/api/sub-pillar-item-translations/" + subPillarItemTranslation.getId()))
            .headers(
                HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, subPillarItemTranslation.getId().toString())
            )
            .body(subPillarItemTranslation);
    }

    /**
     * {@code PUT  /sub-pillar-item-translations/:id} : Updates an existing subPillarItemTranslation.
     *
     * @param id the id of the subPillarItemTranslation to save.
     * @param subPillarItemTranslation the subPillarItemTranslation to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated subPillarItemTranslation,
     * or with status {@code 400 (Bad Request)} if the subPillarItemTranslation is not valid,
     * or with status {@code 500 (Internal Server Error)} if the subPillarItemTranslation couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SubPillarItemTranslation> updateSubPillarItemTranslation(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody SubPillarItemTranslation subPillarItemTranslation
    ) throws URISyntaxException {
        LOG.debug("REST request to update SubPillarItemTranslation : {}, {}", id, subPillarItemTranslation);
        if (subPillarItemTranslation.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, subPillarItemTranslation.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!subPillarItemTranslationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        subPillarItemTranslation = subPillarItemTranslationService.update(subPillarItemTranslation);
        return ResponseEntity.ok()
            .headers(
                HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, subPillarItemTranslation.getId().toString())
            )
            .body(subPillarItemTranslation);
    }

    /**
     * {@code PATCH  /sub-pillar-item-translations/:id} : Partial updates given fields of an existing subPillarItemTranslation, field will ignore if it is null
     *
     * @param id the id of the subPillarItemTranslation to save.
     * @param subPillarItemTranslation the subPillarItemTranslation to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated subPillarItemTranslation,
     * or with status {@code 400 (Bad Request)} if the subPillarItemTranslation is not valid,
     * or with status {@code 404 (Not Found)} if the subPillarItemTranslation is not found,
     * or with status {@code 500 (Internal Server Error)} if the subPillarItemTranslation couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<SubPillarItemTranslation> partialUpdateSubPillarItemTranslation(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody SubPillarItemTranslation subPillarItemTranslation
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update SubPillarItemTranslation partially : {}, {}", id, subPillarItemTranslation);
        if (subPillarItemTranslation.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, subPillarItemTranslation.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!subPillarItemTranslationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<SubPillarItemTranslation> result = subPillarItemTranslationService.partialUpdate(subPillarItemTranslation);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, subPillarItemTranslation.getId().toString())
        );
    }

    /**
     * {@code GET  /sub-pillar-item-translations} : get all the subPillarItemTranslations.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of subPillarItemTranslations in body.
     */
    @GetMapping("")
    public List<SubPillarItemTranslation> getAllSubPillarItemTranslations() {
        LOG.debug("REST request to get all SubPillarItemTranslations");
        return subPillarItemTranslationService.findAll();
    }

    /**
     * {@code GET  /sub-pillar-item-translations/:id} : get the "id" subPillarItemTranslation.
     *
     * @param id the id of the subPillarItemTranslation to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the subPillarItemTranslation, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubPillarItemTranslation> getSubPillarItemTranslation(@PathVariable("id") Long id) {
        LOG.debug("REST request to get SubPillarItemTranslation : {}", id);
        Optional<SubPillarItemTranslation> subPillarItemTranslation = subPillarItemTranslationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(subPillarItemTranslation);
    }

    /**
     * {@code DELETE  /sub-pillar-item-translations/:id} : delete the "id" subPillarItemTranslation.
     *
     * @param id the id of the subPillarItemTranslation to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubPillarItemTranslation(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete SubPillarItemTranslation : {}", id);
        subPillarItemTranslationService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
