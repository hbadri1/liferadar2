package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.Goal;
import com.atharsense.lr.domain.GoalMilestone;
import com.atharsense.lr.domain.GoalUpdate;
import com.atharsense.lr.service.GoalService;
import com.atharsense.lr.service.dto.*;
import com.atharsense.lr.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing Goals & Projects.
 */
@RestController
@RequestMapping("/api/goals")
public class GoalResource {

    private static final Logger LOG = LoggerFactory.getLogger(GoalResource.class);
    private static final String ENTITY_NAME = "goal";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final GoalService goalService;

    public GoalResource(GoalService goalService) {
        this.goalService = goalService;
    }

    // ── Goals ────────────────────────────────────────────────────────────────

    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_PARENT','ROLE_ADMIN','ROLE_CHILD')")
    public ResponseEntity<List<Goal>> getMyGoals(@RequestParam(defaultValue = "false") boolean includeArchived) {
        LOG.debug("REST request to get Goals for current user");
        return ResponseEntity.ok(goalService.findByCurrentUser(includeArchived));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_PARENT','ROLE_ADMIN','ROLE_CHILD')")
    public ResponseEntity<GoalDashboardSummaryDTO> getDashboardSummary() {
        LOG.debug("REST request to get Goal dashboard summary");
        return ResponseEntity.ok(goalService.getDashboardSummary());
    }

    @PostMapping("")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_PARENT','ROLE_ADMIN','ROLE_CHILD')")
    public ResponseEntity<Goal> createGoal(@Valid @RequestBody CreateGoalRequest request) throws URISyntaxException {
        LOG.debug("REST request to create Goal: {}", request.title());
        Goal result = goalService.createGoal(request);
        return ResponseEntity
            .created(new URI("/api/goals/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_PARENT','ROLE_ADMIN','ROLE_CHILD')")
    public ResponseEntity<Goal> updateGoal(@PathVariable Long id, @Valid @RequestBody CreateGoalRequest request) {
        LOG.debug("REST request to update Goal id={}", id);
        Goal result = goalService.updateGoal(id, request);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .body(result);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_PARENT','ROLE_ADMIN','ROLE_CHILD')")
    public ResponseEntity<Goal> getGoal(@PathVariable Long id) {
        LOG.debug("REST request to get Goal id={}", id);
        Optional<Goal> goal = goalService.findOne(id);
        return ResponseUtil.wrapOrNotFound(goal);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_PARENT','ROLE_ADMIN')")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        LOG.debug("REST request to delete Goal id={}", id);
        goalService.deleteGoal(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    @PatchMapping("/{id}/archive")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_PARENT','ROLE_ADMIN')")
    public ResponseEntity<Goal> archiveGoal(@PathVariable Long id) {
        LOG.debug("REST request to archive Goal id={}", id);
        return ResponseEntity.ok(goalService.archiveGoal(id));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_PARENT','ROLE_ADMIN')")
    public ResponseEntity<Goal> markComplete(@PathVariable Long id) {
        LOG.debug("REST request to mark Goal id={} as complete", id);
        return ResponseEntity.ok(goalService.markComplete(id));
    }

    // ── Milestones ───────────────────────────────────────────────────────────

    @GetMapping("/{goalId}/milestones")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_PARENT','ROLE_ADMIN','ROLE_CHILD')")
    public ResponseEntity<List<GoalMilestone>> getMilestones(@PathVariable Long goalId) {
        return ResponseEntity.ok(goalService.getMilestones(goalId));
    }

    @PostMapping("/{goalId}/milestones")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_PARENT','ROLE_ADMIN')")
    public ResponseEntity<GoalMilestone> createMilestone(
        @PathVariable Long goalId,
        @Valid @RequestBody CreateGoalMilestoneRequest request
    ) throws URISyntaxException {
        GoalMilestone result = goalService.createMilestone(goalId, request);
        return ResponseEntity
            .created(new URI("/api/goals/" + goalId + "/milestones/" + result.getId()))
            .body(result);
    }

    @PutMapping("/{goalId}/milestones/{milestoneId}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_PARENT','ROLE_ADMIN')")
    public ResponseEntity<GoalMilestone> updateMilestone(
        @PathVariable Long goalId,
        @PathVariable Long milestoneId,
        @Valid @RequestBody CreateGoalMilestoneRequest request
    ) {
        GoalMilestone result = goalService.updateMilestone(goalId, milestoneId, request);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{goalId}/milestones/{milestoneId}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_PARENT','ROLE_ADMIN')")
    public ResponseEntity<Void> deleteMilestone(@PathVariable Long goalId, @PathVariable Long milestoneId) {
        goalService.deleteMilestone(goalId, milestoneId);
        return ResponseEntity.noContent().build();
    }

    // ── Goal Updates / Reviews ───────────────────────────────────────────────

    @GetMapping("/{goalId}/updates")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_PARENT','ROLE_ADMIN','ROLE_CHILD')")
    public ResponseEntity<List<GoalUpdate>> getGoalUpdates(@PathVariable Long goalId) {
        return ResponseEntity.ok(goalService.getGoalUpdates(goalId));
    }

    @PostMapping("/{goalId}/updates")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_PARENT','ROLE_ADMIN','ROLE_CHILD')")
    public ResponseEntity<GoalUpdate> createGoalUpdate(
        @PathVariable Long goalId,
        @Valid @RequestBody CreateGoalUpdateRequest request
    ) throws URISyntaxException {
        GoalUpdate result = goalService.createGoalUpdate(goalId, request);
        return ResponseEntity
            .created(new URI("/api/goals/" + goalId + "/updates/" + result.getId()))
            .body(result);
    }
}

