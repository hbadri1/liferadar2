package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.EvaluationDecision;
import com.atharsense.lr.repository.EvaluationDecisionRepository;
import com.atharsense.lr.service.EvaluationDecisionQueryService;
import com.atharsense.lr.service.EvaluationDecisionService;
import com.atharsense.lr.service.criteria.EvaluationDecisionCriteria;
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
 * REST controller for managing {@link com.atharsense.lr.domain.EvaluationDecision}.
 */
@RestController
@RequestMapping("/api/evaluation-decisions")
public class EvaluationDecisionResource {

    private static final Logger LOG = LoggerFactory.getLogger(EvaluationDecisionResource.class);

    private static final String ENTITY_NAME = "evaluationDecision";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final EvaluationDecisionService evaluationDecisionService;

    private final EvaluationDecisionRepository evaluationDecisionRepository;

    private final EvaluationDecisionQueryService evaluationDecisionQueryService;

    public EvaluationDecisionResource(
        EvaluationDecisionService evaluationDecisionService,
        EvaluationDecisionRepository evaluationDecisionRepository,
        EvaluationDecisionQueryService evaluationDecisionQueryService
    ) {
        this.evaluationDecisionService = evaluationDecisionService;
        this.evaluationDecisionRepository = evaluationDecisionRepository;
        this.evaluationDecisionQueryService = evaluationDecisionQueryService;
    }

    /**
     * {@code POST  /evaluation-decisions} : Create a new evaluationDecision.
     *
     * @param evaluationDecision the evaluationDecision to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new evaluationDecision, or with status {@code 400 (Bad Request)} if the evaluationDecision has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<EvaluationDecision> createEvaluationDecision(@Valid @RequestBody EvaluationDecision evaluationDecision)
        throws URISyntaxException {
        LOG.debug("REST request to save EvaluationDecision : {}", evaluationDecision);
        if (evaluationDecision.getId() != null) {
            throw new BadRequestAlertException("A new evaluationDecision cannot already have an ID", ENTITY_NAME, "idexists");
        }
        evaluationDecision = evaluationDecisionService.save(evaluationDecision);
        return ResponseEntity.created(new URI("/api/evaluation-decisions/" + evaluationDecision.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, evaluationDecision.getId().toString()))
            .body(evaluationDecision);
    }

    /**
     * {@code PUT  /evaluation-decisions/:id} : Updates an existing evaluationDecision.
     *
     * @param id the id of the evaluationDecision to save.
     * @param evaluationDecision the evaluationDecision to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated evaluationDecision,
     * or with status {@code 400 (Bad Request)} if the evaluationDecision is not valid,
     * or with status {@code 500 (Internal Server Error)} if the evaluationDecision couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<EvaluationDecision> updateEvaluationDecision(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody EvaluationDecision evaluationDecision
    ) throws URISyntaxException {
        LOG.debug("REST request to update EvaluationDecision : {}, {}", id, evaluationDecision);
        if (evaluationDecision.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, evaluationDecision.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!evaluationDecisionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        evaluationDecision = evaluationDecisionService.update(evaluationDecision);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, evaluationDecision.getId().toString()))
            .body(evaluationDecision);
    }

    /**
     * {@code PATCH  /evaluation-decisions/:id} : Partial updates given fields of an existing evaluationDecision, field will ignore if it is null
     *
     * @param id the id of the evaluationDecision to save.
     * @param evaluationDecision the evaluationDecision to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated evaluationDecision,
     * or with status {@code 400 (Bad Request)} if the evaluationDecision is not valid,
     * or with status {@code 404 (Not Found)} if the evaluationDecision is not found,
     * or with status {@code 500 (Internal Server Error)} if the evaluationDecision couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<EvaluationDecision> partialUpdateEvaluationDecision(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody EvaluationDecision evaluationDecision
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update EvaluationDecision partially : {}, {}", id, evaluationDecision);
        if (evaluationDecision.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, evaluationDecision.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!evaluationDecisionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<EvaluationDecision> result = evaluationDecisionService.partialUpdate(evaluationDecision);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, evaluationDecision.getId().toString())
        );
    }

    /**
     * {@code GET  /evaluation-decisions} : get all the evaluationDecisions.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of evaluationDecisions in body.
     */
    @GetMapping("")
    public ResponseEntity<List<EvaluationDecision>> getAllEvaluationDecisions(EvaluationDecisionCriteria criteria) {
        LOG.debug("REST request to get EvaluationDecisions by criteria: {}", criteria);

        List<EvaluationDecision> entityList = evaluationDecisionQueryService.findByCriteria(criteria);
        return ResponseEntity.ok().body(entityList);
    }

    /**
     * {@code GET  /evaluation-decisions/count} : count all the evaluationDecisions.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countEvaluationDecisions(EvaluationDecisionCriteria criteria) {
        LOG.debug("REST request to count EvaluationDecisions by criteria: {}", criteria);
        return ResponseEntity.ok().body(evaluationDecisionQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /evaluation-decisions/:id} : get the "id" evaluationDecision.
     *
     * @param id the id of the evaluationDecision to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the evaluationDecision, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<EvaluationDecision> getEvaluationDecision(@PathVariable("id") Long id) {
        LOG.debug("REST request to get EvaluationDecision : {}", id);
        Optional<EvaluationDecision> evaluationDecision = evaluationDecisionService.findOne(id);
        return ResponseUtil.wrapOrNotFound(evaluationDecision);
    }

    /**
     * {@code DELETE  /evaluation-decisions/:id} : delete the "id" evaluationDecision.
     *
     * @param id the id of the evaluationDecision to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvaluationDecision(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete EvaluationDecision : {}", id);
        evaluationDecisionService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
