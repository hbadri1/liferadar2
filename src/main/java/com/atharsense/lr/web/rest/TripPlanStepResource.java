package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.TripPlan;
import com.atharsense.lr.domain.TripPlanStep;
import com.atharsense.lr.repository.TripPlanRepository;
import com.atharsense.lr.repository.TripPlanStepRepository;
import com.atharsense.lr.service.TripPlanStepService;
import com.atharsense.lr.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDate;
import java.util.Optional;
import java.util.List;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    private final TripPlanRepository tripPlanRepository;

    public TripPlanStepResource(
        TripPlanStepService tripPlanStepService,
        TripPlanStepRepository tripPlanStepRepository,
        TripPlanRepository tripPlanRepository
    ) {
        this.tripPlanStepService = tripPlanStepService;
        this.tripPlanStepRepository = tripPlanStepRepository;
        this.tripPlanRepository = tripPlanRepository;
    }

    /** GET /api/trip-plan-steps/by-trip/{tripPlanId} – steps for a specific trip ordered by sequence. */
    @GetMapping("/by-trip/{tripPlanId}")
    public ResponseEntity<List<TripPlanStep>> getStepsByTrip(@PathVariable Long tripPlanId) {
        LOG.debug("REST request to get TripPlanSteps for TripPlan : {}", tripPlanId);
        return ResponseEntity.ok(tripPlanStepService.findByTripPlanId(tripPlanId));
    }

    /**
     * {@code POST  /trip-plan-steps} : Create a new tripPlanStep.
     *
     * @param tripPlanStep the tripPlanStep to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new tripPlanStep, or with status {@code 400 (Bad Request)} if the tripPlanStep has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_FAMILY_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<TripPlanStep> createTripPlanStep(@Valid @RequestBody TripPlanStep tripPlanStep) throws URISyntaxException {
        LOG.debug("REST request to save TripPlanStep : {}", tripPlanStep);
        if (tripPlanStep.getId() != null) {
            throw new BadRequestAlertException("A new tripPlanStep cannot already have an ID", ENTITY_NAME, "idexists");
        }

        // Validate step dates
        validateStepDates(tripPlanStep);

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
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_FAMILY_ADMIN','ROLE_ADMIN')")
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

        // Validate step dates
        validateStepDates(tripPlanStep);

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
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_FAMILY_ADMIN','ROLE_ADMIN')")
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
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_FAMILY_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<Void> deleteTripPlanStep(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete TripPlanStep : {}", id);
        tripPlanStepService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * Validates trip plan step dates:
     * 1. Step start date must be after or equal to trip start date
     * 2. Step end date must be before or equal to trip end date
     * 3. Step start date must be before or equal to step end date
     *
     * @param step the trip plan step to validate
     * @throws BadRequestAlertException if validation fails
     */
    private void validateStepDates(TripPlanStep step) {
        if (step.getTripPlan() == null || step.getTripPlan().getId() == null) {
            throw new BadRequestAlertException("Step must be associated with a trip", ENTITY_NAME, "stepMissingTrip");
        }

        TripPlan trip = tripPlanRepository
            .findById(step.getTripPlan().getId())
            .orElseThrow(() -> new BadRequestAlertException("Associated trip not found", ENTITY_NAME, "tripNotFound"));
        LocalDate tripStart = trip.getStartDate();
        LocalDate tripEnd = trip.getEndDate();
        LocalDate stepStart = step.getStartDate();
        LocalDate stepEnd = step.getEndDate();

        // Check if step start date is before trip start date
        if (stepStart.isBefore(tripStart)) {
            throw new BadRequestAlertException("trips.errors.stepStartDateBeforeTripStart", ENTITY_NAME, "stepStartDateBeforeTripStart");
        }

        // Check if step end date is after trip end date
        if (stepEnd.isAfter(tripEnd)) {
            throw new BadRequestAlertException("trips.errors.stepEndDateAfterTripEnd", ENTITY_NAME, "stepEndDateAfterTripEnd");
        }

        // Check if step start date is after step end date
        if (stepStart.isAfter(stepEnd)) {
            throw new BadRequestAlertException("trips.errors.stepStartDateAfterEndDate", ENTITY_NAME, "stepStartDateAfterEndDate");
        }
    }
}
