package com.atharsense.lr.notification.service.provider;

import com.atharsense.lr.domain.SaaSSubscription.RenewalReminderOption;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BillingNotificationCandidateProviderConfiguration {

    @Bean
    @ConditionalOnMissingBean(BillingNotificationCandidateProvider.class)
    BillingNotificationCandidateProvider billingNotificationCandidateProvider() {
        return new BillingNotificationCandidateProvider() {
            @Override
            public List<SubscriptionDueCandidate> findSubscriptionsDueForBilling(LocalDate businessDate) {
                return List.of();
            }

            @Override
            public List<BillDueCandidate> findBillsDueToday(LocalDate businessDate) {
                return List.of();
            }

            @Override
            public List<BillOverdueCandidate> findOverdueBills(LocalDate businessDate) {
                return List.of();
            }

            @Override
            public List<UpcomingRenewalCandidate> findUpcomingRenewals(LocalDate fromDate, LocalDate toDate) {
                return List.of();
            }

            @Override
            public List<UpcomingRenewalCandidate> findUpcomingRenewalsForReminder(
                LocalDate renewalDate,
                RenewalReminderOption reminderOption
            ) {
                return List.of();
            }
        };
    }
}

