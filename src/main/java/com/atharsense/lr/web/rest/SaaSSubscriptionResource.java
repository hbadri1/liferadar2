package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.SaaSSubscription;
import com.atharsense.lr.domain.SaaSSubscription.SubscriptionStatus;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.security.SecurityUtils;
import com.atharsense.lr.service.SaaSSubscriptionService;
import com.atharsense.lr.service.UserService;
import com.atharsense.lr.service.dto.CreateSaaSSubscriptionRequest;
import com.atharsense.lr.service.dto.SubscriptionMetricsDTO;
import com.atharsense.lr.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing expenses stored in {@link com.atharsense.lr.domain.SaaSSubscription}.
 */
@RestController
@RequestMapping("/api/expenses")
public class SaaSSubscriptionResource {

    private static final Logger LOG = LoggerFactory.getLogger(SaaSSubscriptionResource.class);
    private static final String ENTITY_NAME = "expense";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final SaaSSubscriptionService subscriptionService;
    private final UserService userService;
    private final ExtendedUserRepository extendedUserRepository;

    public SaaSSubscriptionResource(
        SaaSSubscriptionService subscriptionService,
        UserService userService,
        ExtendedUserRepository extendedUserRepository
    ) {
        this.subscriptionService = subscriptionService;
        this.userService = userService;
        this.extendedUserRepository = extendedUserRepository;
    }

    /**
     * {@code POST  /saas-subscriptions} : Create a new subscription.
     *
     * @param request the create payload for subscription.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new subscription.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_FAMILY_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<SaaSSubscription> createSubscription(@Valid @RequestBody CreateSaaSSubscriptionRequest request)
        throws URISyntaxException {
        LOG.debug("REST request to save Expense : {}", request);

        SaaSSubscription subscription = new SaaSSubscription();
        subscription.setServiceName(request.serviceName());
        subscription.setDescription(request.description());
        subscription.setMonthlyCost(request.monthlyCost());
        subscription.setCurrency(request.currency());
        subscription.setAnnualCost(request.annualCost());
        subscription.setBillDate(request.billDate());
        subscription.setDueDate(request.dueDate());
        subscription.setPaidDate(request.paidDate());
        subscription.setSubscriptionDate(request.subscriptionDate());
        subscription.setRenewalDate(request.renewalDate());
        subscription.setBillingCycle(request.billingCycle());
        subscription.setStatus(SubscriptionStatus.NEW);
        subscription.setAutoRenewal(request.autoRenewal() != null ? request.autoRenewal() : false);
        subscription.setManualRenewal(request.manualRenewal() != null ? request.manualRenewal() : false);
        subscription.setRenewalReminder(request.renewalReminder());
        subscription.setReceiptUrl(request.receiptUrl());
        subscription.setPaymentMethod(request.paymentMethod());
        subscription.setProviderUrl(request.providerUrl());
        subscription.setAccountEmail(request.accountEmail());
        subscription.setAccountUsername(request.accountUsername());
        subscription.setNotes(request.notes());
        subscription.setIsShared(request.isShared() != null ? request.isShared() : false);

        // Get current user
        Optional<SaaSSubscription> result = SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .map(owner -> {
                subscription.setOwner(owner);
                return subscriptionService.save(subscription);
            });

        if (result.isEmpty()) {
            throw new BadRequestAlertException("Could not find current user", ENTITY_NAME, "userfound");
        }

        SaaSSubscription savedSubscription = result.orElseThrow();
        return ResponseEntity.created(new URI("/api/expenses/" + savedSubscription.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, savedSubscription.getId().toString()))
            .body(savedSubscription);
    }

    /**
     * {@code PUT  /saas-subscriptions/:id} : Updates an existing subscription.
     *
     * @param id the id of the subscription to save.
     * @param subscription the subscription to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated subscription,
     * or with status {@code 400 (Bad Request)} if the subscription is not valid,
     * or with status {@code 500 (Internal Server Error)} if the subscription couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_FAMILY_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<SaaSSubscription> updateSubscription(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody SaaSSubscription subscription
    ) throws URISyntaxException {
        LOG.debug("REST request to update SaaSSubscription : {}, {}", id, subscription);

        if (subscription.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, subscription.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        SaaSSubscription existing = subscriptionService
            .findOne(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
        if (existing.getStatus() == SaaSSubscription.SubscriptionStatus.PAID) {
            throw new BadRequestAlertException("A paid expense cannot be edited", ENTITY_NAME, "paidexpense");
        }

        SaaSSubscription result = subscriptionService.update(subscription);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, subscription.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /saas-subscriptions/:id} : Partial updates given fields of an existing subscription, field will ignore if it is null
     *
     * @param id the id of the subscription to save.
     * @param subscription the subscription to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated subscription,
     * or with status {@code 400 (Bad Request)} if the subscription is not valid,
     * or with status {@code 500 (Internal Server Error)} if the subscription couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_FAMILY_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<SaaSSubscription> partialUpdateSubscription(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody SaaSSubscription subscription
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update SaaSSubscription partially : {}, {}", id, subscription);

        if (subscription.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, subscription.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        SaaSSubscription existingForPatch = subscriptionService
            .findOne(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
        if (existingForPatch.getStatus() == SaaSSubscription.SubscriptionStatus.PAID) {
            throw new BadRequestAlertException("A paid expense cannot be edited", ENTITY_NAME, "paidexpense");
        }

        Optional<SaaSSubscription> result = subscriptionService.partialUpdate(subscription);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString())
        );
    }

    /**
     * {@code GET  /saas-subscriptions} : get all the subscriptions for current user.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of subscriptions in body.
     */
    @GetMapping("")
    public ResponseEntity<List<SaaSSubscription>> getAllSubscriptions(Pageable pageable
    ) {
        LOG.debug("REST request to get all SaaSSubscriptions");
        Page<SaaSSubscription> page = subscriptionService.findByCurrentUser(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(
            ServletUriComponentsBuilder.fromCurrentRequest(),
            page
        );
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /saas-subscriptions/my} : get all the subscriptions for current user.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of subscriptions in body.
     */
    @GetMapping("/my")
    public ResponseEntity<List<SaaSSubscription>> getMySubscriptions() {
        LOG.debug("REST request to get my SaaSSubscriptions");
        List<SaaSSubscription> subscriptions = subscriptionService.findByCurrentUser();
        return ResponseEntity.ok(subscriptions);
    }

    /**
     * {@code GET  /saas-subscriptions/:id} : get the "id" subscription.
     *
     * @param id the id of the subscription to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the subscription, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SaaSSubscription> getSubscription(@PathVariable("id") Long id) {
        LOG.debug("REST request to get SaaSSubscription : {}", id);
        Optional<SaaSSubscription> subscription = subscriptionService.findOne(id);
        return ResponseUtil.wrapOrNotFound(subscription);
    }

    /**
     * {@code DELETE  /saas-subscriptions/:id} : delete the "id" subscription.
     *
     * @param id the id of the subscription to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (No Content)}.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_FAMILY_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<Void> deleteSubscription(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete SaaSSubscription : {}", id);
        subscriptionService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code GET  /saas-subscriptions/metrics/dashboard} : get metrics for the dashboard.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the metrics in body.
     */
    @GetMapping("/metrics/dashboard")
    public ResponseEntity<SubscriptionMetricsDTO> getMetrics() {
        LOG.debug("REST request to get SaaSSubscription metrics");
        List<SaaSSubscription> subscriptions = subscriptionService.findByCurrentUser();

        long totalSubscriptions = subscriptions.size();
        long activeSubscriptions = subscriptions.stream()
            .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE)
            .count();
        long pausedSubscriptions = subscriptions.stream()
            .filter(s -> s.getStatus() == SubscriptionStatus.PAUSED)
            .count();
        long cancelledSubscriptions = subscriptions.stream()
            .filter(s -> s.getStatus() == SubscriptionStatus.CANCELLED)
            .count();

        BigDecimal totalMonthlyCost = subscriptionService.calculateTotalMonthlyCost();
        BigDecimal totalAnnualCost = subscriptionService.calculateTotalAnnualCost();
        BigDecimal averageMonthlyCost = totalSubscriptions > 0 ?
            totalMonthlyCost.divide(BigDecimal.valueOf(totalSubscriptions)) :
            BigDecimal.ZERO;

        int upcomingRenewalsCount = subscriptionService.getUpcomingRenewals(30).size();

        SubscriptionMetricsDTO metrics = new SubscriptionMetricsDTO(
            (int) totalSubscriptions,
            (int) activeSubscriptions,
            (int) pausedSubscriptions,
            (int) cancelledSubscriptions,
            totalMonthlyCost,
            totalAnnualCost,
            averageMonthlyCost,
            upcomingRenewalsCount
        );

        return ResponseEntity.ok(metrics);
    }

    /**
     * {@code GET  /saas-subscriptions/upcoming/renewals} : get upcoming renewals.
     *
     * @param days the number of days to look ahead (default: 30).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of upcoming renewals in body.
     */
    @GetMapping("/upcoming/renewals")
    public ResponseEntity<List<SaaSSubscription>> getUpcomingRenewals(@RequestParam(defaultValue = "30") int days) {
        LOG.debug("REST request to get upcoming renewals for {} days", days);
        List<SaaSSubscription> upcomingRenewals = subscriptionService.getUpcomingRenewals(days);
        return ResponseEntity.ok(upcomingRenewals);
    }
}

