package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.LifePillarTranslation;
import com.atharsense.lr.repository.LifePillarTranslationRepository;
import com.atharsense.lr.service.LifePillarTranslationService;
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
 * REST controller for managing {@link com.atharsense.lr.domain.LifePillarTranslation}.
 */
@RestController
@RequestMapping("/api/life-pillar-translations")
public class LifePillarTranslationResource {

    private static final Logger LOG = LoggerFactory.getLogger(LifePillarTranslationResource.class);

    private static final String ENTITY_NAME = "lifePillarTranslation";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final LifePillarTranslationService lifePillarTranslationService;

    private final LifePillarTranslationRepository lifePillarTranslationRepository;

    public LifePillarTranslationResource(
        LifePillarTranslationService lifePillarTranslationService,
        LifePillarTranslationRepository lifePillarTranslationRepository
    ) {
        this.lifePillarTranslationService = lifePillarTranslationService;
        this.lifePillarTranslationRepository = lifePillarTranslationRepository;
    }

    /**
     * {@code POST  /life-pillar-translations} : Create a new lifePillarTranslation.
     *
     * @param lifePillarTranslation the lifePillarTranslation to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new lifePillarTranslation, or with status {@code 400 (Bad Request)} if the lifePillarTranslation has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<LifePillarTranslation> createLifePillarTranslation(
        @Valid @RequestBody LifePillarTranslation lifePillarTranslation
    ) throws URISyntaxException {
        LOG.debug("REST request to save LifePillarTranslation : {}", lifePillarTranslation);
        if (lifePillarTranslation.getId() != null) {
            throw new BadRequestAlertException("A new lifePillarTranslation cannot already have an ID", ENTITY_NAME, "idexists");
        }
        lifePillarTranslation = lifePillarTranslationService.save(lifePillarTranslation);
        return ResponseEntity.created(new URI("/api/life-pillar-translations/" + lifePillarTranslation.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, lifePillarTranslation.getId().toString()))
            .body(lifePillarTranslation);
    }

    /**
     * {@code PUT  /life-pillar-translations/:id} : Updates an existing lifePillarTranslation.
     *
     * @param id the id of the lifePillarTranslation to save.
     * @param lifePillarTranslation the lifePillarTranslation to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated lifePillarTranslation,
     * or with status {@code 400 (Bad Request)} if the lifePillarTranslation is not valid,
     * or with status {@code 500 (Internal Server Error)} if the lifePillarTranslation couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<LifePillarTranslation> updateLifePillarTranslation(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody LifePillarTranslation lifePillarTranslation
    ) throws URISyntaxException {
        LOG.debug("REST request to update LifePillarTranslation : {}, {}", id, lifePillarTranslation);
        if (lifePillarTranslation.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, lifePillarTranslation.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!lifePillarTranslationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        lifePillarTranslation = lifePillarTranslationService.update(lifePillarTranslation);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, lifePillarTranslation.getId().toString()))
            .body(lifePillarTranslation);
    }

    /**
     * {@code PATCH  /life-pillar-translations/:id} : Partial updates given fields of an existing lifePillarTranslation, field will ignore if it is null
     *
     * @param id the id of the lifePillarTranslation to save.
     * @param lifePillarTranslation the lifePillarTranslation to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated lifePillarTranslation,
     * or with status {@code 400 (Bad Request)} if the lifePillarTranslation is not valid,
     * or with status {@code 404 (Not Found)} if the lifePillarTranslation is not found,
     * or with status {@code 500 (Internal Server Error)} if the lifePillarTranslation couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<LifePillarTranslation> partialUpdateLifePillarTranslation(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody LifePillarTranslation lifePillarTranslation
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update LifePillarTranslation partially : {}, {}", id, lifePillarTranslation);
        if (lifePillarTranslation.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, lifePillarTranslation.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!lifePillarTranslationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<LifePillarTranslation> result = lifePillarTranslationService.partialUpdate(lifePillarTranslation);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, lifePillarTranslation.getId().toString())
        );
    }

    /**
     * {@code GET  /life-pillar-translations} : get all the lifePillarTranslations.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of lifePillarTranslations in body.
     */
    @GetMapping("")
    public List<LifePillarTranslation> getAllLifePillarTranslations() {
        LOG.debug("REST request to get all LifePillarTranslations");
        return lifePillarTranslationService.findAll();
    }

    /**
     * {@code GET  /life-pillar-translations/:id} : get the "id" lifePillarTranslation.
     *
     * @param id the id of the lifePillarTranslation to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the lifePillarTranslation, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<LifePillarTranslation> getLifePillarTranslation(@PathVariable("id") Long id) {
        LOG.debug("REST request to get LifePillarTranslation : {}", id);
        Optional<LifePillarTranslation> lifePillarTranslation = lifePillarTranslationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(lifePillarTranslation);
    }

    /**
     * {@code DELETE  /life-pillar-translations/:id} : delete the "id" lifePillarTranslation.
     *
     * @param id the id of the lifePillarTranslation to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLifePillarTranslation(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete LifePillarTranslation : {}", id);
        lifePillarTranslationService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
