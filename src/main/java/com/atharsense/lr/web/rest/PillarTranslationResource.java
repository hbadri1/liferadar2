package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.PillarTranslation;
import com.atharsense.lr.repository.PillarTranslationRepository;
import com.atharsense.lr.service.PillarTranslationService;
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
 * REST controller for managing {@link com.atharsense.lr.domain.PillarTranslation}.
 */
@RestController
@RequestMapping("/api/pillar-translations")
public class PillarTranslationResource {

    private static final Logger LOG = LoggerFactory.getLogger(PillarTranslationResource.class);

    private static final String ENTITY_NAME = "pillarTranslation";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final PillarTranslationService pillarTranslationService;

    private final PillarTranslationRepository pillarTranslationRepository;

    public PillarTranslationResource(
        PillarTranslationService pillarTranslationService,
        PillarTranslationRepository pillarTranslationRepository
    ) {
        this.pillarTranslationService = pillarTranslationService;
        this.pillarTranslationRepository = pillarTranslationRepository;
    }

    /**
     * {@code POST  /pillar-translations} : Create a new pillarTranslation.
     *
     * @param pillarTranslation the pillarTranslation to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new pillarTranslation, or with status {@code 400 (Bad Request)} if the pillarTranslation has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<PillarTranslation> createPillarTranslation(
        @Valid @RequestBody PillarTranslation pillarTranslation
    ) throws URISyntaxException {
        LOG.debug("REST request to save PillarTranslation : {}", pillarTranslation);
        if (pillarTranslation.getId() != null) {
            throw new BadRequestAlertException("A new pillarTranslation cannot already have an ID", ENTITY_NAME, "idexists");
        }
        pillarTranslation = pillarTranslationService.save(pillarTranslation);
        return ResponseEntity.created(new URI("/api/pillar-translations/" + pillarTranslation.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, pillarTranslation.getId().toString()))
            .body(pillarTranslation);
    }

    /**
     * {@code PUT  /pillar-translations/:id} : Updates an existing pillarTranslation.
     *
     * @param id the id of the pillarTranslation to save.
     * @param pillarTranslation the pillarTranslation to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated pillarTranslation,
     * or with status {@code 400 (Bad Request)} if the pillarTranslation is not valid,
     * or with status {@code 500 (Internal Server Error)} if the pillarTranslation couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PillarTranslation> updatePillarTranslation(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody PillarTranslation pillarTranslation
    ) throws URISyntaxException {
        LOG.debug("REST request to update PillarTranslation : {}, {}", id, pillarTranslation);
        if (pillarTranslation.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, pillarTranslation.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!pillarTranslationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        pillarTranslation = pillarTranslationService.update(pillarTranslation);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, pillarTranslation.getId().toString()))
            .body(pillarTranslation);
    }

    /**
     * {@code PATCH  /pillar-translations/:id} : Partial updates given fields of an existing pillarTranslation, field will ignore if it is null
     *
     * @param id the id of the pillarTranslation to save.
     * @param pillarTranslation the pillarTranslation to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated pillarTranslation,
     * or with status {@code 400 (Bad Request)} if the pillarTranslation is not valid,
     * or with status {@code 404 (Not Found)} if the pillarTranslation is not found,
     * or with status {@code 500 (Internal Server Error)} if the pillarTranslation couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<PillarTranslation> partialUpdatePillarTranslation(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody PillarTranslation pillarTranslation
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update PillarTranslation partially : {}, {}", id, pillarTranslation);
        if (pillarTranslation.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, pillarTranslation.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!pillarTranslationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<PillarTranslation> result = pillarTranslationService.partialUpdate(pillarTranslation);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, pillarTranslation.getId().toString())
        );
    }

    /**
     * {@code GET  /pillar-translations} : get all the pillarTranslations.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of pillarTranslations in body.
     */
    @GetMapping("")
    public List<PillarTranslation> getAllPillarTranslations() {
        LOG.debug("REST request to get all PillarTranslations");
        return pillarTranslationService.findAll();
    }

    /**
     * {@code GET  /pillar-translations/:id} : get the "id" pillarTranslation.
     *
     * @param id the id of the pillarTranslation to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the pillarTranslation, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PillarTranslation> getPillarTranslation(@PathVariable("id") Long id) {
        LOG.debug("REST request to get PillarTranslation : {}", id);
        Optional<PillarTranslation> pillarTranslation = pillarTranslationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(pillarTranslation);
    }

    /**
     * {@code DELETE  /pillar-translations/:id} : delete the "id" pillarTranslation.
     *
     * @param id the id of the pillarTranslation to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePillarTranslation(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete PillarTranslation : {}", id);
        pillarTranslationService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
