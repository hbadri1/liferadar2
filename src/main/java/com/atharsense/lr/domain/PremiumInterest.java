package com.atharsense.lr.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;

/**
 * Captures early-access / interest registrations for LifeRadar Premium.
 * Phase 0: no billing, no subscription – purely for intent tracking.
 */
@Entity
@Table(name = "premium_interest")
public class PremiumInterest implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Email
    @Size(max = 254)
    @Column(name = "email", nullable = false, length = 254)
    private String email;

    @Size(max = 2000)
    @Column(name = "feedback", length = 2000)
    private String feedback;

    @Size(max = 100)
    @Column(name = "source", length = 100)
    private String source;

    @Column(name = "created_date", nullable = false, updatable = false)
    private Instant createdDate;

    /** Login of the authenticated user who submitted, if any. */
    @Size(max = 50)
    @Column(name = "user_login", length = 50)
    private String userLogin;

    // -------------------------------------------------------------------------
    // Lifecycle
    // -------------------------------------------------------------------------

    @PrePersist
    protected void onCreate() {
        createdDate = Instant.now();
    }

    // -------------------------------------------------------------------------
    // Getters / Setters
    // -------------------------------------------------------------------------

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public String getUserLogin() {
        return userLogin;
    }

    public void setUserLogin(String userLogin) {
        this.userLogin = userLogin;
    }

    @Override
    public String toString() {
        return "PremiumInterest{id=" + id + ", email='" + email + "', source='" + source + "', createdDate=" + createdDate + '}';
    }
}

