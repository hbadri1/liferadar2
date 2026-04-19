package com.atharsense.lr.service;

import com.atharsense.lr.domain.Bill;
import com.atharsense.lr.domain.Bill.BillStatus;
import com.atharsense.lr.repository.BillRepository;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.security.SecurityUtils;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Bill}.
 */
@Service
@Transactional
public class BillService {

    private static final Logger LOG = LoggerFactory.getLogger(BillService.class);

    private final BillRepository billRepository;
    private final UserService userService;
    private final ExtendedUserRepository extendedUserRepository;

    public BillService(BillRepository billRepository, UserService userService, ExtendedUserRepository extendedUserRepository) {
        this.billRepository = billRepository;
        this.userService = userService;
        this.extendedUserRepository = extendedUserRepository;
    }

    /**
     * Save a bill.
     *
     * @param bill the bill to save.
     * @return the persisted bill.
     */
    public Bill save(Bill bill) {
        LOG.debug("Request to save Bill : {}", bill);
        return billRepository.save(bill);
    }

    /**
     * Update a bill.
     *
     * @param bill the bill to update.
     * @return the updated bill.
     */
    public Bill update(Bill bill) {
        LOG.debug("Request to update Bill : {}", bill);
        return billRepository.save(bill);
    }

    /**
     * Partially update a bill.
     *
     * @param bill the bill to partially update.
     * @return the partially updated bill.
     */
    public Optional<Bill> partialUpdate(Bill bill) {
        LOG.debug("Request to partially update Bill : {}", bill);

        return billRepository
            .findById(bill.getId())
            .map(existingBill -> {
                if (bill.getDescription() != null) {
                    existingBill.setDescription(bill.getDescription());
                }
                if (bill.getAmount() != null) {
                    existingBill.setAmount(bill.getAmount());
                }
                if (bill.getBillDate() != null) {
                    existingBill.setBillDate(bill.getBillDate());
                }
                if (bill.getDueDate() != null) {
                    existingBill.setDueDate(bill.getDueDate());
                }
                if (bill.getPaidDate() != null) {
                    existingBill.setPaidDate(bill.getPaidDate());
                }
                if (bill.getStatus() != null) {
                    existingBill.setStatus(bill.getStatus());
                }
                if (bill.getReceiptUrl() != null) {
                    existingBill.setReceiptUrl(bill.getReceiptUrl());
                }
                if (bill.getNotes() != null) {
                    existingBill.setNotes(bill.getNotes());
                }
                if (bill.getPaymentMethod() != null) {
                    existingBill.setPaymentMethod(bill.getPaymentMethod());
                }
                if (bill.getIsRecurring() != null) {
                    existingBill.setIsRecurring(bill.getIsRecurring());
                }
                if (bill.getSubscription() != null) {
                    existingBill.setSubscription(bill.getSubscription());
                }
                return existingBill;
            })
            .map(billRepository::save);
    }

    /**
     * Get all bills.
     *
     * @param pageable the pagination information.
     * @return the page of bills.
     */
    @Transactional(readOnly = true)
    public Page<Bill> findAll(Pageable pageable) {
        LOG.debug("Request to get all Bills");
        return billRepository.findAll(pageable);
    }

    /**
     * Get all bills for the current user.
     *
     * @param pageable the pagination information.
     * @return the page of bills.
     */
    @Transactional(readOnly = true)
    public Page<Bill> findByCurrentUser(Pageable pageable) {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .map(owner -> billRepository.findByOwnerIdOrderByBillDateDesc(owner.getId(), pageable))
            .orElseGet(Page::empty);
    }

    /**
     * Get all bills for the current user without pagination.
     *
     * @return the list of bills.
     */
    @Transactional(readOnly = true)
    public List<Bill> findByCurrentUser() {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .map(owner -> billRepository.findByOwnerId(owner.getId()))
            .orElseGet(List::of);
    }

    /**
     * Get one bill by id.
     *
     * @param id the id of the bill.
     * @return the bill.
     */
    @Transactional(readOnly = true)
    public Optional<Bill> findOne(Long id) {
        LOG.debug("Request to get Bill : {}", id);
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .flatMap(owner -> billRepository.findByIdAndOwnerId(id, owner.getId()));
    }

    /**
     * Delete the bill by id.
     *
     * @param id the id of the bill.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Bill : {}", id);
        SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .flatMap(owner -> billRepository.findByIdAndOwnerId(id, owner.getId()))
            .ifPresent(billRepository::delete);
    }

    /**
     * Get pending bills for the current user.
     *
     * @return the list of pending bills.
     */
    @Transactional(readOnly = true)
    public List<Bill> getPendingBills() {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .map(owner -> billRepository.findByOwnerIdAndStatus(owner.getId(), BillStatus.PENDING))
            .orElseGet(List::of);
    }

    /**
     * Get overdue bills for the current user.
     *
     * @return the list of overdue bills.
     */
    @Transactional(readOnly = true)
    public List<Bill> getOverdueBills() {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .map(owner -> billRepository.findOverdueBills(owner.getId(), LocalDate.now()))
            .orElseGet(List::of);
    }

    /**
     * Get paid bills for the current user.
     *
     * @return the list of paid bills.
     */
    @Transactional(readOnly = true)
    public List<Bill> getPaidBills() {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .map(owner -> billRepository.findByOwnerIdAndStatus(owner.getId(), BillStatus.PAID))
            .orElseGet(List::of);
    }

    /**
     * Get bills for a specific subscription.
     *
     * @param subscriptionId the subscription id.
     * @return the list of bills.
     */
    @Transactional(readOnly = true)
    public List<Bill> getBillsBySubscription(Long subscriptionId) {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .map(owner -> billRepository.findByOwnerIdAndSubscriptionId(owner.getId(), subscriptionId))
            .orElseGet(List::of);
    }

    /**
     * Get bills for a date range.
     *
     * @param startDate the start date.
     * @param endDate   the end date.
     * @return the list of bills.
     */
    @Transactional(readOnly = true)
    public List<Bill> getBillsByDateRange(LocalDate startDate, LocalDate endDate) {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .map(owner -> billRepository.findBillsByDateRange(owner.getId(), startDate, endDate))
            .orElseGet(List::of);
    }

    /**
     * Mark a bill as paid.
     *
     * @param id the bill id.
     * @return the updated bill.
     */
    public Optional<Bill> markAsPaid(Long id) {
        return findOne(id)
            .map(bill -> {
                bill.setStatus(BillStatus.PAID);
                bill.setPaidDate(LocalDate.now());
                return update(bill);
            });
    }

    /**
     * Calculate total pending amount for the current user.
     *
     * @return the total pending amount.
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateTotalPendingAmount() {
        return getPendingBills()
            .stream()
            .map(Bill::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculate total paid amount for the current user.
     *
     * @return the total paid amount.
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateTotalPaidAmount() {
        return getPaidBills()
            .stream()
            .map(Bill::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}

