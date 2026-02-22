package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.SubLifePillarItem;
import com.atharsense.lr.repository.SubLifePillarItemRepository;
import com.atharsense.lr.service.SubLifePillarItemQueryService;
import com.atharsense.lr.service.SubLifePillarItemService;
import com.atharsense.lr.service.criteria.SubLifePillarItemCriteria;
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
 * REST controller for managing {@link com.atharsense.lr.domain.SubLifePillarItem}.
 */
@RestController
@RequestMapping("/api/sub-life-pillar-items")
public class SubLifePillarItemResource {

    private static final Logger LOG = LoggerFactory.getLogger(SubLifePillarItemResource.class);

    private static final String ENTITY_NAME = "subLifePillarItem";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final SubLifePillarItemService subLifePillarItemService;

    private final SubLifePillarItemRepository subLifePillarItemRepository;

    private final SubLifePillarItemQueryService subLifePillarItemQueryService;

    public SubLifePillarItemResource(
        SubLifePillarItemService subLifePillarItemService,
        SubLifePillarItemRepository subLifePillarItemRepository,
        SubLifePillarItemQueryService subLifePillarItemQueryService
    ) {
        this.subLifePillarItemService = subLifePillarItemService;
        this.subLifePillarItemRepository = subLifePillarItemRepository;
        this.subLifePillarItemQueryService = subLifePillarItemQueryService;
    }

    /**
     * {@code POST  /sub-life-pillar-items} : Create a new subLifePillarItem.
     *
     * @param subLifePillarItem the subLifePillarItem to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new subLifePillarItem, or with status {@code 400 (Bad Request)} if the subLifePillarItem has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<SubLifePillarItem> createSubLifePillarItem(@Valid @RequestBody SubLifePillarItem subLifePillarItem)
        throws URISyntaxException {
        LOG.debug("REST request to save SubLifePillarItem : {}", subLifePillarItem);
        if (subLifePillarItem.getId() != null) {
            throw new BadRequestAlertException("A new subLifePillarItem cannot already have an ID", ENTITY_NAME, "idexists");
        }
        subLifePillarItem = subLifePillarItemService.save(subLifePillarItem);
        return ResponseEntity.created(new URI("/api/sub-life-pillar-items/" + subLifePillarItem.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, subLifePillarItem.getId().toString()))
            .body(subLifePillarItem);
    }

    /**
     * {@code PUT  /sub-life-pillar-items/:id} : Updates an existing subLifePillarItem.
     *
     * @param id the id of the subLifePillarItem to save.
     * @param subLifePillarItem the subLifePillarItem to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated subLifePillarItem,
     * or with status {@code 400 (Bad Request)} if the subLifePillarItem is not valid,
     * or with status {@code 500 (Internal Server Error)} if the subLifePillarItem couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SubLifePillarItem> updateSubLifePillarItem(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody SubLifePillarItem subLifePillarItem
    ) throws URISyntaxException {
        LOG.debug("REST request to update SubLifePillarItem : {}, {}", id, subLifePillarItem);
        if (subLifePillarItem.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, subLifePillarItem.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!subLifePillarItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        subLifePillarItem = subLifePillarItemService.update(subLifePillarItem);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, subLifePillarItem.getId().toString()))
            .body(subLifePillarItem);
    }

    /**
     * {@code PATCH  /sub-life-pillar-items/:id} : Partial updates given fields of an existing subLifePillarItem, field will ignore if it is null
     *
     * @param id the id of the subLifePillarItem to save.
     * @param subLifePillarItem the subLifePillarItem to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated subLifePillarItem,
     * or with status {@code 400 (Bad Request)} if the subLifePillarItem is not valid,
     * or with status {@code 404 (Not Found)} if the subLifePillarItem is not found,
     * or with status {@code 500 (Internal Server Error)} if the subLifePillarItem couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<SubLifePillarItem> partialUpdateSubLifePillarItem(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody SubLifePillarItem subLifePillarItem
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update SubLifePillarItem partially : {}, {}", id, subLifePillarItem);
        if (subLifePillarItem.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, subLifePillarItem.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!subLifePillarItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<SubLifePillarItem> result = subLifePillarItemService.partialUpdate(subLifePillarItem);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, subLifePillarItem.getId().toString())
        );
    }

    /**
     * {@code GET  /sub-life-pillar-items} : get all the subLifePillarItems.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of subLifePillarItems in body.
     */
    @GetMapping("")
    public ResponseEntity<List<SubLifePillarItem>> getAllSubLifePillarItems(
        SubLifePillarItemCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get SubLifePillarItems by criteria: {}", criteria);

        Page<SubLifePillarItem> page = subLifePillarItemQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /sub-life-pillar-items/count} : count all the subLifePillarItems.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countSubLifePillarItems(SubLifePillarItemCriteria criteria) {
        LOG.debug("REST request to count SubLifePillarItems by criteria: {}", criteria);
        return ResponseEntity.ok().body(subLifePillarItemQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /sub-life-pillar-items/:id} : get the "id" subLifePillarItem.
     *
     * @param id the id of the subLifePillarItem to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the subLifePillarItem, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubLifePillarItem> getSubLifePillarItem(@PathVariable("id") Long id) {
        LOG.debug("REST request to get SubLifePillarItem : {}", id);
        Optional<SubLifePillarItem> subLifePillarItem = subLifePillarItemService.findOne(id);
        return ResponseUtil.wrapOrNotFound(subLifePillarItem);
    }

    /**
     * {@code DELETE  /sub-life-pillar-items/:id} : delete the "id" subLifePillarItem.
     *
     * @param id the id of the subLifePillarItem to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubLifePillarItem(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete SubLifePillarItem : {}", id);
        subLifePillarItemService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
