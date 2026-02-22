package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.TripPlanStep;
import com.atharsense.lr.repository.TripPlanStepRepository;
import com.atharsense.lr.service.TripPlanStepService;
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
 * REST controller for managing {@link com.atharsense.lr.domain.TripPlanStep}.
 */
@RestController
@RequestMapping("/api/trip-plan-steps")
public class TripPlanStepResource {

    private static final Logger LOG = LoggerFactory.getLogger(TripPlanStepResource.class);

    private static final String ENTITY_NAME = "tripPlanStep";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TripPlanStepService tripPlanStepService;

    private final TripPlanStepRepository tripPlanStepRepository;

    public TripPlanStepResource(TripPlanStepService tripPlanStepService, TripPlanStepRepository tripPlanStepRepository) {
        this.tripPlanStepService = tripPlanStepService;
        this.tripPlanStepRepository = tripPlanStepRepository;
    }

    /**
     * {@code POST  /trip-plan-steps} : Create a new tripPlanStep.
     *
     * @param tripPlanStep the tripPlanStep to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new tripPlanStep, or with status {@code 400 (Bad Request)} if the tripPlanStep has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<TripPlanStep> createTripPlanStep(@Valid @RequestBody TripPlanStep tripPlanStep) throws URISyntaxException {
        LOG.debug("REST request to save TripPlanStep : {}", tripPlanStep);
        if (tripPlanStep.getId() != null) {
            throw new BadRequestAlertException("A new tripPlanStep cannot already have an ID", ENTITY_NAME, "idexists");
        }
        tripPlanStep = tripPlanStepService.save(tripPlanStep);
        return ResponseEntity.created(new URI("/api/trip-plan-steps/" + tripPlanStep.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, tripPlanStep.getId().toString()))
            .body(tripPlanStep);
    }

    /**
     * {@code PUT  /trip-plan-steps/:id} : Updates an existing tripPlanStep.
     *
     * @param id the id of the tripPlanStep to save.
     * @param tripPlanStep the tripPlanStep to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated tripPlanStep,
     * or with status {@code 400 (Bad Request)} if the tripPlanStep is not valid,
     * or with status {@code 500 (Internal Server Error)} if the tripPlanStep couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TripPlanStep> updateTripPlanStep(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody TripPlanStep tripPlanStep
    ) throws URISyntaxException {
        LOG.debug("REST request to update TripPlanStep : {}, {}", id, tripPlanStep);
        if (tripPlanStep.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, tripPlanStep.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!tripPlanStepRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        tripPlanStep = tripPlanStepService.update(tripPlanStep);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, tripPlanStep.getId().toString()))
            .body(tripPlanStep);
    }

    /**
     * {@code PATCH  /trip-plan-steps/:id} : Partial updates given fields of an existing tripPlanStep, field will ignore if it is null
     *
     * @param id the id of the tripPlanStep to save.
     * @param tripPlanStep the tripPlanStep to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated tripPlanStep,
     * or with status {@code 400 (Bad Request)} if the tripPlanStep is not valid,
     * or with status {@code 404 (Not Found)} if the tripPlanStep is not found,
     * or with status {@code 500 (Internal Server Error)} if the tripPlanStep couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<TripPlanStep> partialUpdateTripPlanStep(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody TripPlanStep tripPlanStep
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update TripPlanStep partially : {}, {}", id, tripPlanStep);
        if (tripPlanStep.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, tripPlanStep.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!tripPlanStepRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<TripPlanStep> result = tripPlanStepService.partialUpdate(tripPlanStep);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, tripPlanStep.getId().toString())
        );
    }

    /**
     * {@code GET  /trip-plan-steps} : get all the tripPlanSteps.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of tripPlanSteps in body.
     */
    @GetMapping("")
    public List<TripPlanStep> getAllTripPlanSteps() {
        LOG.debug("REST request to get all TripPlanSteps");
        return tripPlanStepService.findAll();
    }

    /**
     * {@code GET  /trip-plan-steps/:id} : get the "id" tripPlanStep.
     *
     * @param id the id of the tripPlanStep to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the tripPlanStep, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TripPlanStep> getTripPlanStep(@PathVariable("id") Long id) {
        LOG.debug("REST request to get TripPlanStep : {}", id);
        Optional<TripPlanStep> tripPlanStep = tripPlanStepService.findOne(id);
        return ResponseUtil.wrapOrNotFound(tripPlanStep);
    }

    /**
     * {@code DELETE  /trip-plan-steps/:id} : delete the "id" tripPlanStep.
     *
     * @param id the id of the tripPlanStep to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTripPlanStep(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete TripPlanStep : {}", id);
        tripPlanStepService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
