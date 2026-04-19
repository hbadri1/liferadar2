package com.atharsense.lr.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * A SaaS Subscription.
 */
@Entity
@Table(name = "saas_subscription")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class SaaSSubscription implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 200)
    @Column(name = "service_name", length = 200, nullable = false)
    private String serviceName;

    @Size(max = 800)
    @Column(name = "description", length = 800)
    private String description;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "monthly_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyCost;

    @Column(name = "annual_cost", precision = 10, scale = 2)
    private BigDecimal annualCost;

    @NotNull
    @Column(name = "subscription_date", nullable = false)
    private LocalDate subscriptionDate;

    @Column(name = "renewal_date")
    private LocalDate renewalDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", nullable = false)
    private BillingCycle billingCycle;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SubscriptionStatus status;

    @Size(max = 500)
    @Column(name = "provider_url", length = 500)
    private String providerUrl;

    @Size(max = 200)
    @Column(name = "account_email", length = 200)
    private String accountEmail;

    @Size(max = 200)
    @Column(name = "account_username", length = 200)
    private String accountUsername;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "is_shared")
    private Boolean isShared = false;

    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "last_modified_date")
    private LocalDateTime lastModifiedDate;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "user" }, allowSetters = true)
    private ExtendedUser owner;

    // Constructors
    public SaaSSubscription() {}

    public SaaSSubscription(String serviceName, BigDecimal monthlyCost) {
        this.serviceName = serviceName;
        this.monthlyCost = monthlyCost;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getMonthlyCost() {
        return monthlyCost;
    }

    public void setMonthlyCost(BigDecimal monthlyCost) {
        this.monthlyCost = monthlyCost;
    }

    public BigDecimal getAnnualCost() {
        return annualCost;
    }

    public void setAnnualCost(BigDecimal annualCost) {
        this.annualCost = annualCost;
    }

    public LocalDate getSubscriptionDate() {
        return subscriptionDate;
    }

    public void setSubscriptionDate(LocalDate subscriptionDate) {
        this.subscriptionDate = subscriptionDate;
    }

    public LocalDate getRenewalDate() {
        return renewalDate;
    }

    public void setRenewalDate(LocalDate renewalDate) {
        this.renewalDate = renewalDate;
    }

    public BillingCycle getBillingCycle() {
        return billingCycle;
    }

    public void setBillingCycle(BillingCycle billingCycle) {
        this.billingCycle = billingCycle;
    }

    public SubscriptionStatus getStatus() {
        return status;
    }

    public void setStatus(SubscriptionStatus status) {
        this.status = status;
    }

    public String getProviderUrl() {
        return providerUrl;
    }

    public void setProviderUrl(String providerUrl) {
        this.providerUrl = providerUrl;
    }

    public String getAccountEmail() {
        return accountEmail;
    }

    public void setAccountEmail(String accountEmail) {
        this.accountEmail = accountEmail;
    }

    public String getAccountUsername() {
        return accountUsername;
    }

    public void setAccountUsername(String accountUsername) {
        this.accountUsername = accountUsername;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean getIsShared() {
        return isShared;
    }

    public void setIsShared(Boolean isShared) {
        this.isShared = isShared;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(LocalDateTime lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    public ExtendedUser getOwner() {
        return owner;
    }

    public void setOwner(ExtendedUser owner) {
        this.owner = owner;
    }

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        lastModifiedDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastModifiedDate = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "SaaSSubscription{" +
            "id=" + id +
            ", serviceName='" + serviceName + '\'' +
            ", monthlyCost=" + monthlyCost +
            ", billingCycle=" + billingCycle +
            ", status=" + status +
            ", renewalDate=" + renewalDate +
            '}';
    }

    // Enums
    public enum BillingCycle {
        WEEKLY("Weekly"),
        MONTHLY("Monthly"),
        QUARTERLY("Quarterly"),
        SEMI_ANNUAL("Semi-Annual"),
        ANNUAL("Annual");

        private final String displayName;

        BillingCycle(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum SubscriptionStatus {
        ACTIVE("Active"),
        PAUSED("Paused"),
        CANCELLED("Cancelled"),
        PENDING("Pending"),
        EXPIRED("Expired");

        private final String displayName;

        SubscriptionStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}

