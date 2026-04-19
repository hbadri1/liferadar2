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
        return subscriptionRepository.save(subscription);
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
                if (subscription.getServiceName() != null) {
                    existingSubscription.setServiceName(subscription.getServiceName());
                }
                if (subscription.getDescription() != null) {
                    existingSubscription.setDescription(subscription.getDescription());
                }
                if (subscription.getMonthlyCost() != null) {
                    existingSubscription.setMonthlyCost(subscription.getMonthlyCost());
                }
                if (subscription.getAnnualCost() != null) {
                    existingSubscription.setAnnualCost(subscription.getAnnualCost());
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
                return existingSubscription;
            })
            .map(subscriptionRepository::save);
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
}

