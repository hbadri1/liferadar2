package com.atharsense.lr.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * A sub-step inside a trip step.
 */
@Entity
@Table(name = "trip_plan_sub_step")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class TripPlanSubStep implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 200)
    @Column(name = "action_name", length = 200, nullable = false)
    private String actionName;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "sequence")
    private Integer sequence;

    @Size(max = 800)
    @Column(name = "notes", length = 800)
    private String notes;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "tripPlan", "subSteps" }, allowSetters = true)
    private TripPlanStep step;

    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getActionName() {
        return this.actionName;
    }

    public void setActionName(String actionName) {
        this.actionName = actionName;
    }

    public LocalDateTime getStartDate() {
        return this.startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return this.endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public Integer getSequence() {
        return this.sequence;
    }

    public void setSequence(Integer sequence) {
        this.sequence = sequence;
    }

    public String getNotes() {
        return this.notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public TripPlanStep getStep() {
        return this.step;
    }

    public void setStep(TripPlanStep step) {
        this.step = step;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TripPlanSubStep)) return false;
        return getId() != null && getId().equals(((TripPlanSubStep) o).getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}

