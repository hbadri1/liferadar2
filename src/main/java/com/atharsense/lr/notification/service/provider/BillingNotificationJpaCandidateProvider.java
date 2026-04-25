package com.atharsense.lr.notification.service.provider;

import com.atharsense.lr.domain.SaaSSubscription.RenewalReminderOption;
import com.atharsense.lr.domain.SaaSSubscription.SubscriptionStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
@Transactional(Transactional.TxType.SUPPORTS)
public class BillingNotificationJpaCandidateProvider implements BillingNotificationCandidateProvider {

    private static final String BILLS_SUBSCRIPTIONS_URL = "/expenses";

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<SubscriptionDueCandidate> findSubscriptionsDueForBilling(LocalDate businessDate) {
        List<Object[]> rows = entityManager
            .createQuery(
                """
                select u.id, u.login, u.email, s.id, s.serviceName, s.monthlyCost, coalesce(s.currency, o.currency), s.renewalDate
                from SaaSSubscription s
                join s.owner o
                join o.user u
                where o.active = true
                  and s.renewalDate = :businessDate
                  and s.status = :activeStatus
                  and (s.autoRenewal = false or s.autoRenewal is null)
                """,
                Object[].class
            )
            .setParameter("businessDate", businessDate)
            .setParameter("activeStatus", SubscriptionStatus.ACTIVE)
            .getResultList();

        return rows.stream().map(this::toSubscriptionDueCandidate).toList();
    }

    @Override
    public List<BillDueCandidate> findBillsDueToday(LocalDate businessDate) {
        List<Object[]> rows = entityManager
            .createQuery(
                """
                select u.id, u.login, u.email, s.id, s.serviceName, s.monthlyCost, coalesce(s.currency, o.currency), s.dueDate
                from SaaSSubscription s
                join s.owner o
                join o.user u
                where o.active = true
                  and s.dueDate = :businessDate
                  and s.status not in (:paidStatus, :cancelledStatus)
                """,
                Object[].class
            )
            .setParameter("businessDate", businessDate)
            .setParameter("paidStatus", SubscriptionStatus.PAID)
            .setParameter("cancelledStatus", SubscriptionStatus.CANCELLED)
            .getResultList();

        return rows.stream().map(this::toBillDueCandidate).toList();
    }

    @Override
    public List<BillOverdueCandidate> findOverdueBills(LocalDate businessDate) {
        List<Object[]> rows = entityManager
            .createQuery(
                """
                select u.id, u.login, u.email, s.id, s.serviceName, s.monthlyCost, coalesce(s.currency, o.currency), s.dueDate
                from SaaSSubscription s
                join s.owner o
                join o.user u
                where o.active = true
                  and s.dueDate is not null
                  and s.dueDate < :businessDate
                  and s.status not in (:paidStatus, :cancelledStatus)
                """,
                Object[].class
            )
            .setParameter("businessDate", businessDate)
            .setParameter("paidStatus", SubscriptionStatus.PAID)
            .setParameter("cancelledStatus", SubscriptionStatus.CANCELLED)
            .getResultList();

        return rows.stream().map(row -> toBillOverdueCandidate(row, businessDate)).toList();
    }

    @Override
    public List<UpcomingRenewalCandidate> findUpcomingRenewals(LocalDate fromDate, LocalDate toDate) {
        List<Object[]> rows = entityManager
            .createQuery(
                """
                select u.id, u.login, u.email, s.id, s.serviceName, s.monthlyCost, coalesce(s.currency, o.currency), s.renewalDate
                from SaaSSubscription s
                join s.owner o
                join o.user u
                where o.active = true
                  and s.renewalDate is not null
                  and s.renewalDate > :fromDate
                  and s.renewalDate <= :toDate
                  and s.status = :activeStatus
                """,
                Object[].class
            )
            .setParameter("fromDate", fromDate)
            .setParameter("toDate", toDate)
            .setParameter("activeStatus", SubscriptionStatus.ACTIVE)
            .getResultList();

        return rows.stream().map(this::toUpcomingRenewalCandidate).toList();
    }

    @Override
    public List<UpcomingRenewalCandidate> findUpcomingRenewalsForReminder(LocalDate renewalDate, RenewalReminderOption reminderOption) {
        List<Object[]> rows = entityManager
            .createQuery(
                """
                select u.id, u.login, u.email, s.id, s.serviceName, s.monthlyCost, coalesce(s.currency, o.currency), s.renewalDate
                from SaaSSubscription s
                join s.owner o
                join o.user u
                where o.active = true
                  and (s.autoRenewal = true or s.manualRenewal = true)
                  and s.renewalReminder = :reminderOption
                  and s.renewalDate = :renewalDate
                  and s.status = :activeStatus
                """,
                Object[].class
            )
            .setParameter("renewalDate", renewalDate)
            .setParameter("reminderOption", reminderOption)
            .setParameter("activeStatus", SubscriptionStatus.ACTIVE)
            .getResultList();

        return rows.stream().map(this::toUpcomingRenewalCandidate).toList();
    }

    private SubscriptionDueCandidate toSubscriptionDueCandidate(Object[] row) {
        return new SubscriptionDueCandidate(
            toLong(row[0]),
            toStringValue(row[1]),
            toStringValue(row[2]),
            toIdString(row[3]),
            toStringValue(row[4]),
            toBigDecimal(row[5]),
            toCurrency(row[6]),
            (LocalDate) row[7],
            BILLS_SUBSCRIPTIONS_URL
        );
    }

    private BillDueCandidate toBillDueCandidate(Object[] row) {
        return new BillDueCandidate(
            toLong(row[0]),
            toStringValue(row[1]),
            toStringValue(row[2]),
            toIdString(row[3]),
            toStringValue(row[4]),
            toBigDecimal(row[5]),
            toCurrency(row[6]),
            (LocalDate) row[7],
            BILLS_SUBSCRIPTIONS_URL
        );
    }

    private BillOverdueCandidate toBillOverdueCandidate(Object[] row, LocalDate businessDate) {
        LocalDate dueDate = (LocalDate) row[7];
        long overdueDays = dueDate != null ? ChronoUnit.DAYS.between(dueDate, businessDate) : 0;
        return new BillOverdueCandidate(
            toLong(row[0]),
            toStringValue(row[1]),
            toStringValue(row[2]),
            toIdString(row[3]),
            toStringValue(row[4]),
            toBigDecimal(row[5]),
            toCurrency(row[6]),
            dueDate,
            Math.max(overdueDays, 0),
            BILLS_SUBSCRIPTIONS_URL
        );
    }

    private UpcomingRenewalCandidate toUpcomingRenewalCandidate(Object[] row) {
        return new UpcomingRenewalCandidate(
            toLong(row[0]),
            toStringValue(row[1]),
            toStringValue(row[2]),
            toIdString(row[3]),
            toStringValue(row[4]),
            toBigDecimal(row[5]),
            toCurrency(row[6]),
            (LocalDate) row[7],
            BILLS_SUBSCRIPTIONS_URL
        );
    }

    private Long toLong(Object value) {
        return value instanceof Long longValue ? longValue : null;
    }

    private String toStringValue(Object value) {
        return value != null ? value.toString() : null;
    }

    private String toIdString(Object value) {
        return value != null ? value.toString() : "";
    }

    private BigDecimal toBigDecimal(Object value) {
        return value instanceof BigDecimal bigDecimal ? bigDecimal : null;
    }

    private String toCurrency(Object value) {
        return value != null ? value.toString() : "USD";
    }
}


