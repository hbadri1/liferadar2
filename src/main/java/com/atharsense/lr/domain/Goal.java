package com.atharsense.lr.domain;

import com.atharsense.lr.domain.enumeration.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

/**
 * Goal entity for Goals & Projects module.
 */
@Entity
@Table(name = "goal")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Goal extends AbstractAuditingEntity<Long> implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(min = 2, max = 150)
    @Column(name = "title", length = 150, nullable = false)
    private String title;

    @Size(max = 2000)
    @Column(name = "description", length = 2000)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "goal_type", nullable = false, length = 30)
    private GoalType goalType;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 40)
    private GoalCategory category;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private GoalStatus status = GoalStatus.DRAFT;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private GoalPriority priority = GoalPriority.MEDIUM;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false, length = 20)
    private GoalVisibility visibility = GoalVisibility.PRIVATE;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "progress_mode", nullable = false, length = 30)
    private GoalProgressMode progressMode = GoalProgressMode.MANUAL_PERCENTAGE;

    @Min(0)
    @Max(100)
    @Column(name = "progress_percentage")
    private Integer progressPercentage = 0;

    @Column(name = "target_value", precision = 15, scale = 2)
    private BigDecimal targetValue;

    @Column(name = "current_value", precision = 15, scale = 2)
    private BigDecimal currentValue;

    @Column(name = "baseline_value", precision = 15, scale = 2)
    private BigDecimal baselineValue;

    @Size(max = 50)
    @Column(name = "unit", length = 50)
    private String unit;

    @Enumerated(EnumType.STRING)
    @Column(name = "confidence_level", length = 20)
    private GoalPriority confidenceLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level", length = 20)
    private GoalPriority difficultyLevel;

    @Size(max = 2000)
    @Column(name = "motivation", length = 2000)
    private String motivation;

    @Size(max = 2000)
    @Column(name = "success_criteria", length = 2000)
    private String successCriteria;

    @Size(max = 1000)
    @Column(name = "risk_notes", length = 1000)
    private String riskNotes;

    @Size(max = 1000)
    @Column(name = "blocker_notes", length = 1000)
    private String blockerNotes;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_frequency", length = 20)
    private GoalReviewFrequency reviewFrequency;

    @Column(name = "last_review_date")
    private LocalDate lastReviewDate;

    @Column(name = "next_review_date")
    private LocalDate nextReviewDate;

    @NotNull
    @Column(name = "is_archived", nullable = false)
    private Boolean isArchived = false;

    @OneToMany(mappedBy = "goal", cascade = CascadeType.REMOVE, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "goal" }, allowSetters = true)
    private Set<GoalMilestone> milestones = new HashSet<>();

    @OneToMany(mappedBy = "goal", cascade = CascadeType.REMOVE, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "goal" }, allowSetters = true)
    private Set<GoalUpdate> updates = new HashSet<>();

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "user" }, allowSetters = true)
    private ExtendedUser owner;

    @ManyToOne(optional = true)
    @JsonIgnoreProperties(value = { "translations", "subPillars", "owner" }, allowSetters = true)
    private Pillar pillar;

    /**
     * Transient flag populated by GoalService when the goal is retrieved via a share record
     * (i.e. the requesting user is NOT the owner, but has FAMILY_SHARED access).
     */
    @Transient
    private Boolean sharedWithMe = false;

    /** Transient flag: true when the sharing record grants edit rights. */
    @Transient
    private Boolean canEditShared = false;

    @Override
    public Long getId() {
        return this.id;
    }

    public Goal id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public GoalType getGoalType() { return goalType; }
    public void setGoalType(GoalType goalType) { this.goalType = goalType; }

    public GoalCategory getCategory() { return category; }
    public void setCategory(GoalCategory category) { this.category = category; }

    public GoalStatus getStatus() { return status; }
    public void setStatus(GoalStatus status) { this.status = status; }

    public GoalPriority getPriority() { return priority; }
    public void setPriority(GoalPriority priority) { this.priority = priority; }

    public GoalVisibility getVisibility() { return visibility; }
    public void setVisibility(GoalVisibility visibility) { this.visibility = visibility; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }

    public LocalDate getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDate completedDate) { this.completedDate = completedDate; }

    public GoalProgressMode getProgressMode() { return progressMode; }
    public void setProgressMode(GoalProgressMode progressMode) { this.progressMode = progressMode; }

    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }

    public BigDecimal getTargetValue() { return targetValue; }
    public void setTargetValue(BigDecimal targetValue) { this.targetValue = targetValue; }

    public BigDecimal getCurrentValue() { return currentValue; }
    public void setCurrentValue(BigDecimal currentValue) { this.currentValue = currentValue; }

    public BigDecimal getBaselineValue() { return baselineValue; }
    public void setBaselineValue(BigDecimal baselineValue) { this.baselineValue = baselineValue; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public GoalPriority getConfidenceLevel() { return confidenceLevel; }
    public void setConfidenceLevel(GoalPriority confidenceLevel) { this.confidenceLevel = confidenceLevel; }

    public GoalPriority getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(GoalPriority difficultyLevel) { this.difficultyLevel = difficultyLevel; }

    public String getMotivation() { return motivation; }
    public void setMotivation(String motivation) { this.motivation = motivation; }

    public String getSuccessCriteria() { return successCriteria; }
    public void setSuccessCriteria(String successCriteria) { this.successCriteria = successCriteria; }

    public String getRiskNotes() { return riskNotes; }
    public void setRiskNotes(String riskNotes) { this.riskNotes = riskNotes; }

    public String getBlockerNotes() { return blockerNotes; }
    public void setBlockerNotes(String blockerNotes) { this.blockerNotes = blockerNotes; }

    public GoalReviewFrequency getReviewFrequency() { return reviewFrequency; }
    public void setReviewFrequency(GoalReviewFrequency reviewFrequency) { this.reviewFrequency = reviewFrequency; }

    public LocalDate getLastReviewDate() { return lastReviewDate; }
    public void setLastReviewDate(LocalDate lastReviewDate) { this.lastReviewDate = lastReviewDate; }

    public LocalDate getNextReviewDate() { return nextReviewDate; }
    public void setNextReviewDate(LocalDate nextReviewDate) { this.nextReviewDate = nextReviewDate; }

    public Boolean getIsArchived() { return isArchived; }
    public void setIsArchived(Boolean isArchived) { this.isArchived = isArchived; }

    public Set<GoalMilestone> getMilestones() { return milestones; }
    public void setMilestones(Set<GoalMilestone> milestones) { this.milestones = milestones; }

    public Set<GoalUpdate> getUpdates() { return updates; }
    public void setUpdates(Set<GoalUpdate> updates) { this.updates = updates; }

    public ExtendedUser getOwner() { return owner; }
    public void setOwner(ExtendedUser owner) { this.owner = owner; }

    public Pillar getPillar() { return pillar; }
    public void setPillar(Pillar pillar) { this.pillar = pillar; }

    public Boolean getSharedWithMe() { return sharedWithMe; }
    public void setSharedWithMe(Boolean sharedWithMe) { this.sharedWithMe = sharedWithMe; }

    public Boolean getCanEditShared() { return canEditShared; }
    public void setCanEditShared(Boolean canEditShared) { this.canEditShared = canEditShared; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Goal)) return false;
        return getId() != null && getId().equals(((Goal) o).getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Goal{id=" + getId() + ", title='" + getTitle() + "', status=" + getStatus() + "}";
    }
}

