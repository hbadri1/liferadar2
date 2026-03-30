package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.TripPlan;
import com.atharsense.lr.repository.TripPlanRepository;
import com.atharsense.lr.service.TripPlanQueryService;
import com.atharsense.lr.service.TripPlanService;
import com.atharsense.lr.service.criteria.TripPlanCriteria;
import com.atharsense.lr.service.dto.CreateTripPlanRequest;
import com.atharsense.lr.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDate;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.atharsense.lr.domain.TripPlan}.
 */
@RestController
@RequestMapping("/api/trip-plans")
public class TripPlanResource {

    private static final Logger LOG = LoggerFactory.getLogger(TripPlanResource.class);
    private static final String ENTITY_NAME = "tripPlan";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TripPlanService tripPlanService;
    private final TripPlanRepository tripPlanRepository;
    private final TripPlanQueryService tripPlanQueryService;

    public TripPlanResource(
        TripPlanService tripPlanService,
        TripPlanRepository tripPlanRepository,
        TripPlanQueryService tripPlanQueryService
    ) {
        this.tripPlanService = tripPlanService;
        this.tripPlanRepository = tripPlanRepository;
        this.tripPlanQueryService = tripPlanQueryService;
    }

    /** GET /api/trip-plans/my – returns trips owned by the current user. */
    @GetMapping("/my")
    public ResponseEntity<List<TripPlan>> getMyTripPlans() {
        LOG.debug("REST request to get TripPlans for current user");
        return ResponseEntity.ok(tripPlanService.findByCurrentUser());
    }

    /**
     * {@code POST  /trip-plans} : Create a new tripPlan.
     *
     * @param request the create payload for tripPlan.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new tripPlan.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_FAMILY_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<TripPlan> createTripPlan(@Valid @RequestBody CreateTripPlanRequest request) throws URISyntaxException {
        // Validate trip dates
        validateTripDates(request.startDate(), request.endDate());

        TripPlan tripPlan = new TripPlan();
        tripPlan.setTitle(request.title());
        tripPlan.setDescription(request.description());
        tripPlan.setStartDate(request.startDate());
        tripPlan.setEndDate(request.endDate());
        tripPlan.setIsActive(request.isActive());

        LOG.debug("REST request to save TripPlan : {}", tripPlan);
        tripPlan = tripPlanService.save(tripPlan);
        return ResponseEntity.created(new URI("/api/trip-plans/" + tripPlan.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, tripPlan.getId().toString()))
            .body(tripPlan);
    }

    /**
     * {@code PUT  /trip-plans/:id} : Updates an existing tripPlan.
     *
     * @param id the id of the tripPlan to save.
     * @param tripPlan the tripPlan to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated tripPlan,
     * or with status {@code 400 (Bad Request)} if the tripPlan is not valid,
     * or with status {@code 500 (Internal Server Error)} if the tripPlan couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_FAMILY_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<TripPlan> updateTripPlan(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody TripPlan tripPlan
    ) throws URISyntaxException {
        LOG.debug("REST request to update TripPlan : {}, {}", id, tripPlan);
        if (tripPlan.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, tripPlan.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!tripPlanRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        // Validate trip dates
        validateTripDates(tripPlan.getStartDate(), tripPlan.getEndDate());

        tripPlan = tripPlanService.update(tripPlan);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, tripPlan.getId().toString()))
            .body(tripPlan);
    }

    /**
     * {@code PATCH  /trip-plans/:id} : Partial updates given fields of an existing tripPlan, field will ignore if it is null
     *
     * @param id the id of the tripPlan to save.
     * @param tripPlan the tripPlan to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated tripPlan,
     * or with status {@code 400 (Bad Request)} if the tripPlan is not valid,
     * or with status {@code 404 (Not Found)} if the tripPlan is not found,
     * or with status {@code 500 (Internal Server Error)} if the tripPlan couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_FAMILY_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<TripPlan> partialUpdateTripPlan(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody TripPlan tripPlan
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update TripPlan partially : {}, {}", id, tripPlan);
        if (tripPlan.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, tripPlan.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!tripPlanRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<TripPlan> result = tripPlanService.partialUpdate(tripPlan);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, tripPlan.getId().toString())
        );
    }

    /**
     * {@code GET  /trip-plans} : get all the tripPlans.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of tripPlans in body.
     */
    @GetMapping("")
    public ResponseEntity<List<TripPlan>> getAllTripPlans(
        TripPlanCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get TripPlans by criteria: {}", criteria);

        Page<TripPlan> page = tripPlanQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /trip-plans/count} : count all the tripPlans.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countTripPlans(TripPlanCriteria criteria) {
        LOG.debug("REST request to count TripPlans by criteria: {}", criteria);
        return ResponseEntity.ok().body(tripPlanQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /trip-plans/:id} : get the "id" tripPlan.
     *
     * @param id the id of the tripPlan to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the tripPlan, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TripPlan> getTripPlan(@PathVariable("id") Long id) {
        LOG.debug("REST request to get TripPlan : {}", id);
        Optional<TripPlan> tripPlan = tripPlanService.findOne(id);
        return ResponseUtil.wrapOrNotFound(tripPlan);
    }

    /**
     * {@code DELETE  /trip-plans/:id} : delete the "id" tripPlan.
     *
     * @param id the id of the tripPlan to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_FAMILY_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<Void> deleteTripPlan(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete TripPlan : {}", id);
        tripPlanService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * Validates trip dates:
     * 1. Both dates must not be in the past (must be today or future)
     * 2. Start date must be before end date
     *
     * @param startDate the trip start date
     * @param endDate the trip end date
     * @throws BadRequestAlertException if validation fails
     */
    private void validateTripDates(LocalDate startDate, LocalDate endDate) {
        LocalDate today = LocalDate.now();

        if (startDate.isBefore(today)) {
            throw new BadRequestAlertException("trips.errors.startDateInPast", ENTITY_NAME, "startDateInPast");
        }

        if (endDate.isBefore(today)) {
            throw new BadRequestAlertException("trips.errors.endDateInPast", ENTITY_NAME, "endDateInPast");
        }

        if (startDate.isAfter(endDate)) {
            throw new BadRequestAlertException("trips.errors.startDateAfterEndDate", ENTITY_NAME, "startDateAfterEndDate");
        }
    }
}
