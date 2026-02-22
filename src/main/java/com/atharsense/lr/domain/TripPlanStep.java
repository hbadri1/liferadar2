package com.atharsense.lr.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDate;

/**
 * A TripPlanStep.
 */
@Entity
@Table(name = "trip_plan_step")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class TripPlanStep implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @NotNull
    @Size(max = 200)
    @Column(name = "action_name", length = 200, nullable = false)
    private String actionName;

    @NotNull
    @Min(value = 1)
    @Column(name = "sequence", nullable = false)
    private Integer sequence;

    @Size(max = 800)
    @Column(name = "notes", length = 800)
    private String notes;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "owner" }, allowSetters = true)
    private TripPlan tripPlan;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public TripPlanStep id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getStartDate() {
        return this.startDate;
    }

    public TripPlanStep startDate(LocalDate startDate) {
        this.setStartDate(startDate);
        return this;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return this.endDate;
    }

    public TripPlanStep endDate(LocalDate endDate) {
        this.setEndDate(endDate);
        return this;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getActionName() {
        return this.actionName;
    }

    public TripPlanStep actionName(String actionName) {
        this.setActionName(actionName);
        return this;
    }

    public void setActionName(String actionName) {
        this.actionName = actionName;
    }

    public Integer getSequence() {
        return this.sequence;
    }

    public TripPlanStep sequence(Integer sequence) {
        this.setSequence(sequence);
        return this;
    }

    public void setSequence(Integer sequence) {
        this.sequence = sequence;
    }

    public String getNotes() {
        return this.notes;
    }

    public TripPlanStep notes(String notes) {
        this.setNotes(notes);
        return this;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public TripPlan getTripPlan() {
        return this.tripPlan;
    }

    public void setTripPlan(TripPlan tripPlan) {
        this.tripPlan = tripPlan;
    }

    public TripPlanStep tripPlan(TripPlan tripPlan) {
        this.setTripPlan(tripPlan);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof TripPlanStep)) {
            return false;
        }
        return getId() != null && getId().equals(((TripPlanStep) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TripPlanStep{" +
            "id=" + getId() +
            ", startDate='" + getStartDate() + "'" +
            ", endDate='" + getEndDate() + "'" +
            ", actionName='" + getActionName() + "'" +
            ", sequence=" + getSequence() +
            ", notes='" + getNotes() + "'" +
            "}";
    }
}
