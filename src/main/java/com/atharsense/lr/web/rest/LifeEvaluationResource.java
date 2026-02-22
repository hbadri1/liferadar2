package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.LifeEvaluation;
import com.atharsense.lr.repository.LifeEvaluationRepository;
import com.atharsense.lr.service.LifeEvaluationQueryService;
import com.atharsense.lr.service.LifeEvaluationService;
import com.atharsense.lr.service.criteria.LifeEvaluationCriteria;
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
 * REST controller for managing {@link com.atharsense.lr.domain.LifeEvaluation}.
 */
@RestController
@RequestMapping("/api/life-evaluations")
public class LifeEvaluationResource {

    private static final Logger LOG = LoggerFactory.getLogger(LifeEvaluationResource.class);

    private static final String ENTITY_NAME = "lifeEvaluation";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final LifeEvaluationService lifeEvaluationService;

    private final LifeEvaluationRepository lifeEvaluationRepository;

    private final LifeEvaluationQueryService lifeEvaluationQueryService;

    public LifeEvaluationResource(
        LifeEvaluationService lifeEvaluationService,
        LifeEvaluationRepository lifeEvaluationRepository,
        LifeEvaluationQueryService lifeEvaluationQueryService
    ) {
        this.lifeEvaluationService = lifeEvaluationService;
        this.lifeEvaluationRepository = lifeEvaluationRepository;
        this.lifeEvaluationQueryService = lifeEvaluationQueryService;
    }

    /**
     * {@code POST  /life-evaluations} : Create a new lifeEvaluation.
     *
     * @param lifeEvaluation the lifeEvaluation to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new lifeEvaluation, or with status {@code 400 (Bad Request)} if the lifeEvaluation has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<LifeEvaluation> createLifeEvaluation(@Valid @RequestBody LifeEvaluation lifeEvaluation)
        throws URISyntaxException {
        LOG.debug("REST request to save LifeEvaluation : {}", lifeEvaluation);
        if (lifeEvaluation.getId() != null) {
            throw new BadRequestAlertException("A new lifeEvaluation cannot already have an ID", ENTITY_NAME, "idexists");
        }
        lifeEvaluation = lifeEvaluationService.save(lifeEvaluation);
        return ResponseEntity.created(new URI("/api/life-evaluations/" + lifeEvaluation.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, lifeEvaluation.getId().toString()))
            .body(lifeEvaluation);
    }

    /**
     * {@code PUT  /life-evaluations/:id} : Updates an existing lifeEvaluation.
     *
     * @param id the id of the lifeEvaluation to save.
     * @param lifeEvaluation the lifeEvaluation to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated lifeEvaluation,
     * or with status {@code 400 (Bad Request)} if the lifeEvaluation is not valid,
     * or with status {@code 500 (Internal Server Error)} if the lifeEvaluation couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<LifeEvaluation> updateLifeEvaluation(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody LifeEvaluation lifeEvaluation
    ) throws URISyntaxException {
        LOG.debug("REST request to update LifeEvaluation : {}, {}", id, lifeEvaluation);
        if (lifeEvaluation.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, lifeEvaluation.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!lifeEvaluationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        lifeEvaluation = lifeEvaluationService.update(lifeEvaluation);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, lifeEvaluation.getId().toString()))
            .body(lifeEvaluation);
    }

    /**
     * {@code PATCH  /life-evaluations/:id} : Partial updates given fields of an existing lifeEvaluation, field will ignore if it is null
     *
     * @param id the id of the lifeEvaluation to save.
     * @param lifeEvaluation the lifeEvaluation to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated lifeEvaluation,
     * or with status {@code 400 (Bad Request)} if the lifeEvaluation is not valid,
     * or with status {@code 404 (Not Found)} if the lifeEvaluation is not found,
     * or with status {@code 500 (Internal Server Error)} if the lifeEvaluation couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<LifeEvaluation> partialUpdateLifeEvaluation(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody LifeEvaluation lifeEvaluation
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update LifeEvaluation partially : {}, {}", id, lifeEvaluation);
        if (lifeEvaluation.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, lifeEvaluation.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!lifeEvaluationRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<LifeEvaluation> result = lifeEvaluationService.partialUpdate(lifeEvaluation);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, lifeEvaluation.getId().toString())
        );
    }

    /**
     * {@code GET  /life-evaluations} : get all the lifeEvaluations.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of lifeEvaluations in body.
     */
    @GetMapping("")
    public ResponseEntity<List<LifeEvaluation>> getAllLifeEvaluations(
        LifeEvaluationCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get LifeEvaluations by criteria: {}", criteria);

        Page<LifeEvaluation> page = lifeEvaluationQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /life-evaluations/count} : count all the lifeEvaluations.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countLifeEvaluations(LifeEvaluationCriteria criteria) {
        LOG.debug("REST request to count LifeEvaluations by criteria: {}", criteria);
        return ResponseEntity.ok().body(lifeEvaluationQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /life-evaluations/:id} : get the "id" lifeEvaluation.
     *
     * @param id the id of the lifeEvaluation to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the lifeEvaluation, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<LifeEvaluation> getLifeEvaluation(@PathVariable("id") Long id) {
        LOG.debug("REST request to get LifeEvaluation : {}", id);
        Optional<LifeEvaluation> lifeEvaluation = lifeEvaluationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(lifeEvaluation);
    }

    /**
     * {@code DELETE  /life-evaluations/:id} : delete the "id" lifeEvaluation.
     *
     * @param id the id of the lifeEvaluation to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLifeEvaluation(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete LifeEvaluation : {}", id);
        lifeEvaluationService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
