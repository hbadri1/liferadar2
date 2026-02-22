package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.SubLifePillar;
import com.atharsense.lr.repository.SubLifePillarRepository;
import com.atharsense.lr.service.SubLifePillarQueryService;
import com.atharsense.lr.service.SubLifePillarService;
import com.atharsense.lr.service.criteria.SubLifePillarCriteria;
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
 * REST controller for managing {@link com.atharsense.lr.domain.SubLifePillar}.
 */
@RestController
@RequestMapping("/api/sub-life-pillars")
public class SubLifePillarResource {

    private static final Logger LOG = LoggerFactory.getLogger(SubLifePillarResource.class);

    private static final String ENTITY_NAME = "subLifePillar";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final SubLifePillarService subLifePillarService;

    private final SubLifePillarRepository subLifePillarRepository;

    private final SubLifePillarQueryService subLifePillarQueryService;

    public SubLifePillarResource(
        SubLifePillarService subLifePillarService,
        SubLifePillarRepository subLifePillarRepository,
        SubLifePillarQueryService subLifePillarQueryService
    ) {
        this.subLifePillarService = subLifePillarService;
        this.subLifePillarRepository = subLifePillarRepository;
        this.subLifePillarQueryService = subLifePillarQueryService;
    }

    /**
     * {@code POST  /sub-life-pillars} : Create a new subLifePillar.
     *
     * @param subLifePillar the subLifePillar to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new subLifePillar, or with status {@code 400 (Bad Request)} if the subLifePillar has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<SubLifePillar> createSubLifePillar(@Valid @RequestBody SubLifePillar subLifePillar) throws URISyntaxException {
        LOG.debug("REST request to save SubLifePillar : {}", subLifePillar);
        if (subLifePillar.getId() != null) {
            throw new BadRequestAlertException("A new subLifePillar cannot already have an ID", ENTITY_NAME, "idexists");
        }
        subLifePillar = subLifePillarService.save(subLifePillar);
        return ResponseEntity.created(new URI("/api/sub-life-pillars/" + subLifePillar.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, subLifePillar.getId().toString()))
            .body(subLifePillar);
    }

    /**
     * {@code PUT  /sub-life-pillars/:id} : Updates an existing subLifePillar.
     *
     * @param id the id of the subLifePillar to save.
     * @param subLifePillar the subLifePillar to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated subLifePillar,
     * or with status {@code 400 (Bad Request)} if the subLifePillar is not valid,
     * or with status {@code 500 (Internal Server Error)} if the subLifePillar couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SubLifePillar> updateSubLifePillar(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody SubLifePillar subLifePillar
    ) throws URISyntaxException {
        LOG.debug("REST request to update SubLifePillar : {}, {}", id, subLifePillar);
        if (subLifePillar.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, subLifePillar.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!subLifePillarRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        subLifePillar = subLifePillarService.update(subLifePillar);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, subLifePillar.getId().toString()))
            .body(subLifePillar);
    }

    /**
     * {@code PATCH  /sub-life-pillars/:id} : Partial updates given fields of an existing subLifePillar, field will ignore if it is null
     *
     * @param id the id of the subLifePillar to save.
     * @param subLifePillar the subLifePillar to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated subLifePillar,
     * or with status {@code 400 (Bad Request)} if the subLifePillar is not valid,
     * or with status {@code 404 (Not Found)} if the subLifePillar is not found,
     * or with status {@code 500 (Internal Server Error)} if the subLifePillar couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<SubLifePillar> partialUpdateSubLifePillar(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody SubLifePillar subLifePillar
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update SubLifePillar partially : {}, {}", id, subLifePillar);
        if (subLifePillar.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, subLifePillar.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!subLifePillarRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<SubLifePillar> result = subLifePillarService.partialUpdate(subLifePillar);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, subLifePillar.getId().toString())
        );
    }

    /**
     * {@code GET  /sub-life-pillars} : get all the subLifePillars.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of subLifePillars in body.
     */
    @GetMapping("")
    public ResponseEntity<List<SubLifePillar>> getAllSubLifePillars(
        SubLifePillarCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get SubLifePillars by criteria: {}", criteria);

        Page<SubLifePillar> page = subLifePillarQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /sub-life-pillars/count} : count all the subLifePillars.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countSubLifePillars(SubLifePillarCriteria criteria) {
        LOG.debug("REST request to count SubLifePillars by criteria: {}", criteria);
        return ResponseEntity.ok().body(subLifePillarQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /sub-life-pillars/:id} : get the "id" subLifePillar.
     *
     * @param id the id of the subLifePillar to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the subLifePillar, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubLifePillar> getSubLifePillar(@PathVariable("id") Long id) {
        LOG.debug("REST request to get SubLifePillar : {}", id);
        Optional<SubLifePillar> subLifePillar = subLifePillarService.findOne(id);
        return ResponseUtil.wrapOrNotFound(subLifePillar);
    }

    /**
     * {@code DELETE  /sub-life-pillars/:id} : delete the "id" subLifePillar.
     *
     * @param id the id of the subLifePillar to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubLifePillar(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete SubLifePillar : {}", id);
        subLifePillarService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
