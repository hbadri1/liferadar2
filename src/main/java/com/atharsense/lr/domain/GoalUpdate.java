package com.atharsense.lr.domain;

import com.atharsense.lr.domain.enumeration.GoalPriority;
import com.atharsense.lr.domain.enumeration.GoalStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * GoalUpdate entity - a review/history entry for a goal.
 */
@Entity
@Table(name = "goal_update")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class GoalUpdate implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "update_date", nullable = false)
    private LocalDate updateDate;

    @Size(max = 2000)
    @Column(name = "summary", length = 2000)
    private String summary;

    @Min(0)
    @Max(100)
    @Column(name = "progress_percentage")
    private Integer progressPercentage;

    @Column(name = "current_value", precision = 15, scale = 2)
    private BigDecimal currentValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "confidence_level", length = 20)
    private GoalPriority confidenceLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private GoalStatus status;

    @Size(max = 50)
    @Column(name = "mood", length = 50)
    private String mood;

    @Size(max = 1000)
    @Column(name = "blockers", length = 1000)
    private String blockers;

    @Size(max = 1000)
    @Column(name = "next_step", length = 1000)
    private String nextStep;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Size(max = 50)
    @Column(name = "created_by_login", length = 50)
    private String createdByLogin;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "milestones", "updates", "owner", "pillar" }, allowSetters = true)
    private Goal goal;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getUpdateDate() { return updateDate; }
    public void setUpdateDate(LocalDate updateDate) { this.updateDate = updateDate; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }

    public BigDecimal getCurrentValue() { return currentValue; }
    public void setCurrentValue(BigDecimal currentValue) { this.currentValue = currentValue; }

    public GoalPriority getConfidenceLevel() { return confidenceLevel; }
    public void setConfidenceLevel(GoalPriority confidenceLevel) { this.confidenceLevel = confidenceLevel; }

    public GoalStatus getStatus() { return status; }
    public void setStatus(GoalStatus status) { this.status = status; }

    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }

    public String getBlockers() { return blockers; }
    public void setBlockers(String blockers) { this.blockers = blockers; }

    public String getNextStep() { return nextStep; }
    public void setNextStep(String nextStep) { this.nextStep = nextStep; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getCreatedByLogin() { return createdByLogin; }
    public void setCreatedByLogin(String createdByLogin) { this.createdByLogin = createdByLogin; }

    public Goal getGoal() { return goal; }
    public void setGoal(Goal goal) { this.goal = goal; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof GoalUpdate)) return false;
        return getId() != null && getId().equals(((GoalUpdate) o).getId());
    }

    @Override
    public int hashCode() { return getClass().hashCode(); }

    @Override
    public String toString() {
        return "GoalUpdate{id=" + getId() + ", updateDate=" + getUpdateDate() + "}";
    }
}

