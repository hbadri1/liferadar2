package com.atharsense.lr.web.rest;

import com.atharsense.lr.domain.Bill;
import com.atharsense.lr.domain.Bill.BillStatus;
import com.atharsense.lr.repository.BillRepository;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.security.SecurityUtils;
import com.atharsense.lr.service.BillService;
import com.atharsense.lr.service.SaaSSubscriptionService;
import com.atharsense.lr.service.UserService;
import com.atharsense.lr.service.dto.BillMetricsDTO;
import com.atharsense.lr.service.dto.CreateBillRequest;
import com.atharsense.lr.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
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
 * REST controller for managing {@link com.atharsense.lr.domain.Bill}.
 */
@RestController
@RequestMapping("/api/bills")
public class BillResource {

    private static final Logger LOG = LoggerFactory.getLogger(BillResource.class);
    private static final String ENTITY_NAME = "bill";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final BillService billService;
    private final BillRepository billRepository;
    private final UserService userService;
    private final ExtendedUserRepository extendedUserRepository;
    private final SaaSSubscriptionService subscriptionService;

    public BillResource(
        BillService billService,
        BillRepository billRepository,
        UserService userService,
        ExtendedUserRepository extendedUserRepository,
        SaaSSubscriptionService subscriptionService
    ) {
        this.billService = billService;
        this.billRepository = billRepository;
        this.userService = userService;
        this.extendedUserRepository = extendedUserRepository;
        this.subscriptionService = subscriptionService;
    }

    /**
     * {@code POST  /bills} : Create a new bill.
     *
     * @param request the create payload for bill.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new bill.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_FAMILY_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<Bill> createBill(@Valid @RequestBody CreateBillRequest request)
        throws URISyntaxException {
        LOG.debug("REST request to save Bill : {}", request);

        Bill bill = new Bill();
        bill.setDescription(request.description());
        bill.setAmount(request.amount());
        bill.setBillDate(request.billDate());
        bill.setDueDate(request.dueDate());
        bill.setPaidDate(request.paidDate());
        bill.setStatus(request.status());
        bill.setReceiptUrl(request.receiptUrl());
        bill.setNotes(request.notes());
        bill.setPaymentMethod(request.paymentMethod());
        bill.setIsRecurring(request.isRecurring() != null ? request.isRecurring() : false);

        if (request.subscriptionId() != null) {
            subscriptionService.findOne(request.subscriptionId())
                .ifPresent(bill::setSubscription);
        }

        // Get current user
        Optional<Bill> result = SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .map(owner -> {
                bill.setOwner(owner);
                return billService.save(bill);
            });

        if (result.isEmpty()) {
            throw new BadRequestAlertException("Could not find current user", ENTITY_NAME, "userfound");
        }

        Bill savedBill = result.get();
        return ResponseEntity.created(new URI("/api/bills/" + savedBill.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, savedBill.getId().toString()))
            .body(savedBill);
    }

    /**
     * {@code PUT  /bills/:id} : Updates an existing bill.
     *
     * @param id the id of the bill to save.
     * @param bill the bill to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated bill,
     * or with status {@code 400 (Bad Request)} if the bill is not valid,
     * or with status {@code 500 (Internal Server Error)} if the bill couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_FAMILY_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<Bill> updateBill(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Bill bill
    ) throws URISyntaxException {
        LOG.debug("REST request to update Bill : {}, {}", id, bill);

        if (bill.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, bill.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!billService.findOne(id).isPresent()) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Bill result = billService.update(bill);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, bill.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /bills/:id} : Partial updates given fields of an existing bill, field will ignore if it is null
     *
     * @param id the id of the bill to save.
     * @param bill the bill to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated bill,
     * or with status {@code 400 (Bad Request)} if the bill is not valid,
     * or with status {@code 500 (Internal Server Error)} if the bill couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_FAMILY_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<Bill> partialUpdateBill(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Bill bill
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Bill partially : {}, {}", id, bill);

        if (bill.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, bill.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!billService.findOne(id).isPresent()) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Bill> result = billService.partialUpdate(bill);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString())
        );
    }

    /**
     * {@code GET  /bills} : get all the bills for current user.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of bills in body.
     */
    @GetMapping("")
    public ResponseEntity<List<Bill>> getAllBills(Pageable pageable
    ) {
        LOG.debug("REST request to get all Bills");
        Page<Bill> page = billService.findByCurrentUser(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(
            ServletUriComponentsBuilder.fromCurrentRequest(),
            page
        );
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /bills/my} : get all the bills for current user.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of bills in body.
     */
    @GetMapping("/my")
    public ResponseEntity<List<Bill>> getMyBills() {
        LOG.debug("REST request to get my Bills");
        List<Bill> bills = billService.findByCurrentUser();
        return ResponseEntity.ok(bills);
    }

    /**
     * {@code GET  /bills/:id} : get the "id" bill.
     *
     * @param id the id of the bill to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the bill, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Bill> getBill(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Bill : {}", id);
        Optional<Bill> bill = billService.findOne(id);
        return ResponseUtil.wrapOrNotFound(bill);
    }

    /**
     * {@code DELETE  /bills/:id} : delete the "id" bill.
     *
     * @param id the id of the bill to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (No Content)}.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_FAMILY_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<Void> deleteBill(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Bill : {}", id);
        billService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code POST  /bills/:id/mark-paid} : Mark a bill as paid.
     *
     * @param id the id of the bill to mark as paid.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated bill.
     */
    @PostMapping("/{id}/mark-paid")
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_FAMILY_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<Bill> markBillAsPaid(@PathVariable("id") Long id) {
        LOG.debug("REST request to mark Bill as paid : {}", id);
        Optional<Bill> result = billService.markAsPaid(id);
        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString())
        );
    }

    /**
     * {@code GET  /bills/metrics/dashboard} : get metrics for the dashboard.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the metrics in body.
     */
    @GetMapping("/metrics/dashboard")
    public ResponseEntity<BillMetricsDTO> getMetrics() {
        LOG.debug("REST request to get Bill metrics");
        List<Bill> allBills = billService.findByCurrentUser();

        int totalBills = allBills.size();
        int paidBills = (int) allBills.stream()
            .filter(b -> b.getStatus() == BillStatus.PAID)
            .count();
        int pendingBills = (int) allBills.stream()
            .filter(b -> b.getStatus() == BillStatus.PENDING)
            .count();
        int overdueBills = (int) allBills.stream()
            .filter(b -> b.getStatus() == BillStatus.OVERDUE)
            .count();
        int cancelledBills = (int) allBills.stream()
            .filter(b -> b.getStatus() == BillStatus.CANCELLED)
            .count();

        BigDecimal totalBillAmount = allBills.stream()
            .map(Bill::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal paidAmount = billService.calculateTotalPaidAmount();
        BigDecimal pendingAmount = billService.calculateTotalPendingAmount();

        BigDecimal overdueAmount = billService.getOverdueBills()
            .stream()
            .map(Bill::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageBillAmount = totalBills > 0 ?
            totalBillAmount.divide(BigDecimal.valueOf(totalBills)) :
            BigDecimal.ZERO;

        BillMetricsDTO metrics = new BillMetricsDTO(
            totalBills,
            paidBills,
            pendingBills,
            overdueBills,
            cancelledBills,
            totalBillAmount,
            paidAmount,
            pendingAmount,
            overdueAmount,
            averageBillAmount
        );

        return ResponseEntity.ok(metrics);
    }

    /**
     * {@code GET  /bills/pending} : get pending bills.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of pending bills in body.
     */
    @GetMapping("/status/pending")
    public ResponseEntity<List<Bill>> getPendingBills() {
        LOG.debug("REST request to get pending bills");
        List<Bill> pendingBills = billService.getPendingBills();
        return ResponseEntity.ok(pendingBills);
    }

    /**
     * {@code GET  /bills/overdue} : get overdue bills.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of overdue bills in body.
     */
    @GetMapping("/status/overdue")
    public ResponseEntity<List<Bill>> getOverdueBills() {
        LOG.debug("REST request to get overdue bills");
        List<Bill> overdueBills = billService.getOverdueBills();
        return ResponseEntity.ok(overdueBills);
    }

    /**
     * {@code GET  /bills/subscription/:subscriptionId} : get bills for a subscription.
     *
     * @param subscriptionId the subscription id.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of bills in body.
     */
    @GetMapping("/subscription/{subscriptionId}")
    public ResponseEntity<List<Bill>> getBillsBySubscription(@PathVariable("subscriptionId") Long subscriptionId) {
        LOG.debug("REST request to get bills by subscription : {}", subscriptionId);
        List<Bill> bills = billService.getBillsBySubscription(subscriptionId);
        return ResponseEntity.ok(bills);
    }

    /**
     * {@code GET  /bills/date-range} : get bills for a date range.
     *
     * @param startDate the start date.
     * @param endDate   the end date.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of bills in body.
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<Bill>> getBillsByDateRange(
        @RequestParam(name = "startDate") LocalDate startDate,
        @RequestParam(name = "endDate") LocalDate endDate
    ) {
        LOG.debug("REST request to get bills by date range : {} to {}", startDate, endDate);
        List<Bill> bills = billService.getBillsByDateRange(startDate, endDate);
        return ResponseEntity.ok(bills);
    }
}

