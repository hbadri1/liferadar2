package com.atharsense.lr.service;

import com.atharsense.lr.domain.SaaSSubscription;
import com.atharsense.lr.repository.ExtendedUserRepository;
import com.atharsense.lr.repository.SaaSSubscriptionRepository;
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
 * Service Implementation for managing {@link SaaSSubscription}.
 */
@Service
@Transactional
public class SaaSSubscriptionService {

    private static final Logger LOG = LoggerFactory.getLogger(SaaSSubscriptionService.class);

    private final SaaSSubscriptionRepository subscriptionRepository;
    private final UserService userService;
    private final ExtendedUserRepository extendedUserRepository;

    public SaaSSubscriptionService(
        SaaSSubscriptionRepository subscriptionRepository,
        UserService userService,
        ExtendedUserRepository extendedUserRepository
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.userService = userService;
        this.extendedUserRepository = extendedUserRepository;
    }

    /**
     * Save a subscription.
     *
     * @param subscription the subscription to save.
     * @return the persisted subscription.
     */
    public SaaSSubscription save(SaaSSubscription subscription) {
        LOG.debug("Request to save SaaSSubscription : {}", subscription);
        normalizeRenewalSettings(subscription);
        return subscriptionRepository.save(subscription);
    }

    /**
     * Update a subscription.
     *
     * @param subscription the subscription to update.
     * @return the updated subscription.
     */
    public SaaSSubscription update(SaaSSubscription subscription) {
        LOG.debug("Request to update SaaSSubscription : {}", subscription);
        SaaSSubscription.SubscriptionStatus previousStatus = subscription.getId() != null
            ? subscriptionRepository.findById(subscription.getId()).map(SaaSSubscription::getStatus).orElse(null)
            : null;
        normalizeRenewalSettings(subscription);
        SaaSSubscription saved = subscriptionRepository.save(subscription);
        createNextCycleExpenseOnPaidTransition(previousStatus, saved);
        return saved;
    }

    /**
     * Partially update a subscription.
     *
     * @param subscription the subscription to partially update.
     * @return the partially updated subscription.
     */
    public Optional<SaaSSubscription> partialUpdate(SaaSSubscription subscription) {
        LOG.debug("Request to partially update SaaSSubscription : {}", subscription);

        return subscriptionRepository
            .findById(subscription.getId())
            .map(existingSubscription -> {
                SaaSSubscription.SubscriptionStatus previousStatus = existingSubscription.getStatus();
                if (subscription.getServiceName() != null) {
                    existingSubscription.setServiceName(subscription.getServiceName());
                }
                if (subscription.getDescription() != null) {
                    existingSubscription.setDescription(subscription.getDescription());
                }
                if (subscription.getMonthlyCost() != null) {
                    existingSubscription.setMonthlyCost(subscription.getMonthlyCost());
                }
                if (subscription.getCurrency() != null) {
                    existingSubscription.setCurrency(subscription.getCurrency());
                }
                if (subscription.getAnnualCost() != null) {
                    existingSubscription.setAnnualCost(subscription.getAnnualCost());
                }
                if (subscription.getBillDate() != null) {
                    existingSubscription.setBillDate(subscription.getBillDate());
                }
                if (subscription.getDueDate() != null) {
                    existingSubscription.setDueDate(subscription.getDueDate());
                }
                if (subscription.getPaidDate() != null) {
                    existingSubscription.setPaidDate(subscription.getPaidDate());
                }
                if (subscription.getSubscriptionDate() != null) {
                    existingSubscription.setSubscriptionDate(subscription.getSubscriptionDate());
                }
                if (subscription.getRenewalDate() != null) {
                    existingSubscription.setRenewalDate(subscription.getRenewalDate());
                }
                if (subscription.getBillingCycle() != null) {
                    existingSubscription.setBillingCycle(subscription.getBillingCycle());
                }
                if (subscription.getStatus() != null) {
                    existingSubscription.setStatus(subscription.getStatus());
                }
                if (subscription.getAutoRenewal() != null) {
                    existingSubscription.setAutoRenewal(subscription.getAutoRenewal());
                }
                if (subscription.getManualRenewal() != null) {
                    existingSubscription.setManualRenewal(subscription.getManualRenewal());
                }
                if (
                    subscription.getRenewalReminder() != null ||
                    (Boolean.FALSE.equals(subscription.getAutoRenewal()) && Boolean.FALSE.equals(subscription.getManualRenewal()))
                ) {
                    existingSubscription.setRenewalReminder(subscription.getRenewalReminder());
                }
                if (subscription.getReceiptUrl() != null) {
                    existingSubscription.setReceiptUrl(subscription.getReceiptUrl());
                }
                if (subscription.getPaymentMethod() != null) {
                    existingSubscription.setPaymentMethod(subscription.getPaymentMethod());
                }
                if (subscription.getProviderUrl() != null) {
                    existingSubscription.setProviderUrl(subscription.getProviderUrl());
                }
                if (subscription.getAccountEmail() != null) {
                    existingSubscription.setAccountEmail(subscription.getAccountEmail());
                }
                if (subscription.getAccountUsername() != null) {
                    existingSubscription.setAccountUsername(subscription.getAccountUsername());
                }
                if (subscription.getNotes() != null) {
                    existingSubscription.setNotes(subscription.getNotes());
                }
                if (subscription.getIsShared() != null) {
                    existingSubscription.setIsShared(subscription.getIsShared());
                }
                normalizeRenewalSettings(existingSubscription);
                return new PartialUpdateContext(previousStatus, existingSubscription);
            })
            .flatMap(context -> {
                SaaSSubscription saved = subscriptionRepository.save(context.subscription());
                createNextCycleExpenseOnPaidTransition(context.previousStatus(), saved);
                return Optional.of(saved);
            });
    }

    /**
     * Get all subscriptions.
     *
     * @param pageable the pagination information.
     * @return the page of subscriptions.
     */
    @Transactional(readOnly = true)
    public Page<SaaSSubscription> findAll(Pageable pageable) {
        LOG.debug("Request to get all SaaSSubscriptions");
        return subscriptionRepository.findAll(pageable);
    }

    /**
     * Get all subscriptions for the current user.
     *
     * @param pageable the pagination information.
     * @return the page of subscriptions.
     */
    @Transactional(readOnly = true)
    public Page<SaaSSubscription> findByCurrentUser(Pageable pageable) {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .map(owner -> subscriptionRepository.findByOwnerId(owner.getId(), pageable))
            .orElseGet(Page::empty);
    }

    /**
     * Get all subscriptions for the current user without pagination.
     *
     * @return the list of subscriptions.
     */
    @Transactional(readOnly = true)
    public List<SaaSSubscription> findByCurrentUser() {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .map(owner -> subscriptionRepository.findByOwnerId(owner.getId()))
            .orElseGet(List::of);
    }

    /**
     * Get one subscription by id.
     *
     * @param id the id of the subscription.
     * @return the subscription.
     */
    @Transactional(readOnly = true)
    public Optional<SaaSSubscription> findOne(Long id) {
        LOG.debug("Request to get SaaSSubscription : {}", id);
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .flatMap(owner -> subscriptionRepository.findByIdAndOwnerId(id, owner.getId()));
    }

    /**
     * Delete the subscription by id.
     *
     * @param id the id of the subscription.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete SaaSSubscription : {}", id);
        SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .flatMap(owner -> subscriptionRepository.findByIdAndOwnerId(id, owner.getId()))
            .ifPresent(subscriptionRepository::delete);
    }

    /**
     * Get upcoming renewals for the current user.
     *
     * @param days the number of days to look ahead.
     * @return the list of upcoming renewals.
     */
    @Transactional(readOnly = true)
    public List<SaaSSubscription> getUpcomingRenewals(int days) {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .map(owner -> subscriptionRepository.findUpcomingRenewals(owner.getId(), LocalDate.now().plusDays(days)))
            .orElseGet(List::of);
    }

    /**
     * Get active subscriptions for the current user.
     *
     * @return the list of active subscriptions.
     */
    @Transactional(readOnly = true)
    public List<SaaSSubscription> getActiveSubscriptions() {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userService::getUserWithAuthoritiesByLogin)
            .flatMap(user -> extendedUserRepository.findOneByUserId(user.getId()))
            .map(owner -> subscriptionRepository.findActiveSubscriptions(owner.getId()))
            .orElseGet(List::of);
    }

    /**
     * Calculate total monthly cost for the current user.
     *
     * @return the total monthly cost.
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateTotalMonthlyCost() {
        return getActiveSubscriptions()
            .stream()
            .map(SaaSSubscription::getMonthlyCost)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculate total annual cost for the current user.
     *
     * @return the total annual cost.
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateTotalAnnualCost() {
        return getActiveSubscriptions()
            .stream()
            .map(subscription -> {
                if (subscription.getAnnualCost() != null) {
                    return subscription.getAnnualCost();
                }
                return subscription.getMonthlyCost().multiply(BigDecimal.valueOf(12));
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public int processDueAutoRenewals(LocalDate businessDate) {
        List<SaaSSubscription> dueSubscriptions = subscriptionRepository.findAutoRenewSubscriptionsDueOnOrBefore(
            businessDate,
            SaaSSubscription.SubscriptionStatus.ACTIVE
        );

        int processed = 0;
        for (SaaSSubscription source : dueSubscriptions) {
            if (source.getRenewalDate() == null) {
                continue;
            }

            SaaSSubscription renewedSubscription = new SaaSSubscription();
            LocalDate nextSubscriptionDate = source.getRenewalDate();

            renewedSubscription.setServiceName(source.getServiceName());
            renewedSubscription.setDescription(source.getDescription());
            renewedSubscription.setMonthlyCost(source.getMonthlyCost());
            renewedSubscription.setCurrency(source.getCurrency());
            renewedSubscription.setAnnualCost(source.getAnnualCost());
            renewedSubscription.setSubscriptionDate(nextSubscriptionDate);
            renewedSubscription.setRenewalDate(calculateRenewalDate(nextSubscriptionDate, source.getBillingCycle()));
            renewedSubscription.setBillingCycle(source.getBillingCycle());
            renewedSubscription.setStatus(SaaSSubscription.SubscriptionStatus.NEW);
            renewedSubscription.setAutoRenewal(Boolean.TRUE.equals(source.getAutoRenewal()));
            renewedSubscription.setManualRenewal(Boolean.TRUE.equals(source.getManualRenewal()));
            renewedSubscription.setRenewalReminder(source.getRenewalReminder());
            renewedSubscription.setProviderUrl(source.getProviderUrl());
            renewedSubscription.setAccountEmail(source.getAccountEmail());
            renewedSubscription.setAccountUsername(source.getAccountUsername());
            renewedSubscription.setNotes(source.getNotes());
            renewedSubscription.setIsShared(source.getIsShared());
            renewedSubscription.setOwner(source.getOwner());

            source.setStatus(SaaSSubscription.SubscriptionStatus.EXPIRED);

            normalizeRenewalSettings(renewedSubscription);
            subscriptionRepository.save(renewedSubscription);
            subscriptionRepository.save(source);
            processed++;
        }

        return processed;
    }

    private void normalizeRenewalSettings(SaaSSubscription subscription) {
        if (subscription.getAutoRenewal() == null) {
            subscription.setAutoRenewal(false);
        }

        if (subscription.getManualRenewal() == null) {
            subscription.setManualRenewal(false);
        }

        if (!Boolean.TRUE.equals(subscription.getAutoRenewal()) && !Boolean.TRUE.equals(subscription.getManualRenewal())) {
            subscription.setRenewalReminder(null);
        }

        if (subscription.getCurrency() == null || subscription.getCurrency().isBlank()) {
            String ownerCurrency = subscription.getOwner() != null ? subscription.getOwner().getCurrency() : null;
            subscription.setCurrency(ownerCurrency != null && !ownerCurrency.isBlank() ? ownerCurrency : "USD");
        } else {
            subscription.setCurrency(subscription.getCurrency().trim().toUpperCase());
        }

        if (subscription.getSubscriptionDate() != null && subscription.getBillingCycle() != null) {
            subscription.setRenewalDate(calculateRenewalDate(subscription.getSubscriptionDate(), subscription.getBillingCycle()));
        }

        if (subscription.getSubscriptionDate() == null) {
            subscription.setSubscriptionDate(subscription.getBillDate() != null ? subscription.getBillDate() : LocalDate.now());
        }
        if (subscription.getBillingCycle() == null) {
            subscription.setBillingCycle(SaaSSubscription.BillingCycle.MONTHLY);
        }
        if (subscription.getStatus() == null) {
            subscription.setStatus(SaaSSubscription.SubscriptionStatus.ACTIVE);
        }
        if (subscription.getBillDate() == null) {
            subscription.setBillDate(subscription.getSubscriptionDate());
        }
        if (subscription.getMonthlyCost() == null && subscription.getAnnualCost() != null) {
            subscription.setMonthlyCost(subscription.getAnnualCost());
        }
        if (subscription.getAnnualCost() == null && subscription.getMonthlyCost() != null) {
            subscription.setAnnualCost(subscription.getMonthlyCost());
        }
        subscription.setManualRenewal(Boolean.TRUE.equals(subscription.getManualRenewal()));
    }

    private LocalDate calculateRenewalDate(LocalDate subscriptionDate, SaaSSubscription.BillingCycle billingCycle) {
        return switch (billingCycle) {
            case WEEKLY -> subscriptionDate.plusWeeks(1);
            case MONTHLY -> subscriptionDate.plusMonths(1);
            case QUARTERLY -> subscriptionDate.plusMonths(3);
            case SEMI_ANNUAL -> subscriptionDate.plusMonths(6);
            case ANNUAL -> subscriptionDate.plusYears(1);
        };
    }

    private void createNextCycleExpenseOnPaidTransition(SaaSSubscription.SubscriptionStatus previousStatus, SaaSSubscription paidExpense) {
        if (paidExpense == null) {
            return;
        }

        boolean transitionedToPaid =
            previousStatus != SaaSSubscription.SubscriptionStatus.PAID &&
            paidExpense.getStatus() == SaaSSubscription.SubscriptionStatus.PAID;
        boolean renewalEnabled = Boolean.TRUE.equals(paidExpense.getAutoRenewal()) || Boolean.TRUE.equals(paidExpense.getManualRenewal());

        if (!transitionedToPaid || !renewalEnabled || paidExpense.getBillingCycle() == null) {
            return;
        }

        LocalDate nextSubscriptionDate = paidExpense.getRenewalDate();
        if (nextSubscriptionDate == null && paidExpense.getSubscriptionDate() != null) {
            nextSubscriptionDate = calculateRenewalDate(paidExpense.getSubscriptionDate(), paidExpense.getBillingCycle());
        }
        if (nextSubscriptionDate == null || paidExpense.getOwner() == null || paidExpense.getOwner().getId() == null) {
            return;
        }

        boolean alreadyCreated = subscriptionRepository.existsByOwnerIdAndServiceNameAndSubscriptionDateAndStatus(
            paidExpense.getOwner().getId(),
            paidExpense.getServiceName(),
            nextSubscriptionDate,
            SaaSSubscription.SubscriptionStatus.NEW
        );
        if (alreadyCreated) {
            return;
        }

        SaaSSubscription nextExpense = new SaaSSubscription();
        nextExpense.setServiceName(paidExpense.getServiceName());
        nextExpense.setDescription(paidExpense.getDescription());
        nextExpense.setMonthlyCost(paidExpense.getMonthlyCost());
        nextExpense.setCurrency(paidExpense.getCurrency());
        nextExpense.setAnnualCost(paidExpense.getAnnualCost());
        nextExpense.setSubscriptionDate(nextSubscriptionDate);
        nextExpense.setBillingCycle(paidExpense.getBillingCycle());
        nextExpense.setStatus(SaaSSubscription.SubscriptionStatus.NEW);
        nextExpense.setAutoRenewal(Boolean.TRUE.equals(paidExpense.getAutoRenewal()));
        nextExpense.setManualRenewal(Boolean.TRUE.equals(paidExpense.getManualRenewal()));
        nextExpense.setRenewalReminder(paidExpense.getRenewalReminder());
        nextExpense.setBillDate(
            paidExpense.getBillDate() != null ? calculateRenewalDate(paidExpense.getBillDate(), paidExpense.getBillingCycle()) : nextSubscriptionDate
        );
        nextExpense.setDueDate(
            paidExpense.getDueDate() != null ? calculateRenewalDate(paidExpense.getDueDate(), paidExpense.getBillingCycle()) : null
        );
        nextExpense.setPaidDate(null);
        nextExpense.setReceiptUrl(null);
        nextExpense.setPaymentMethod(paidExpense.getPaymentMethod());
        nextExpense.setProviderUrl(paidExpense.getProviderUrl());
        nextExpense.setAccountEmail(paidExpense.getAccountEmail());
        nextExpense.setAccountUsername(paidExpense.getAccountUsername());
        nextExpense.setNotes(paidExpense.getNotes());
        nextExpense.setIsShared(paidExpense.getIsShared());
        nextExpense.setOwner(paidExpense.getOwner());

        normalizeRenewalSettings(nextExpense);
        subscriptionRepository.save(nextExpense);
    }

    private record PartialUpdateContext(SaaSSubscription.SubscriptionStatus previousStatus, SaaSSubscription subscription) {}
}

