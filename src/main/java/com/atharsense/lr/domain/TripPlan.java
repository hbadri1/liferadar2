package com.atharsense.lr.domain;

import com.atharsense.lr.domain.enumeration.TripType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * A TripPlan.
 */
@Entity
@Table(name = "trip_plan")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class TripPlan implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 160)
    @Column(name = "title", length = 160, nullable = false)
    private String title;

    @Size(max = 800)
    @Column(name = "description", length = 800)
    private String description;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "trip_type", nullable = false, length = 20)
    private TripType tripType = TripType.PERSONAL;

    @Size(max = 4000)
    @Column(name = "actions_json", length = 4000)
    private String actionsJson;

    @OneToMany(mappedBy = "tripPlan", cascade = CascadeType.REMOVE, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "tripPlan" }, allowSetters = true)
    private Set<TripPlanStep> steps = new HashSet<>();

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "user" }, allowSetters = true)
    private ExtendedUser owner;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public TripPlan id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return this.title;
    }

    public TripPlan title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return this.description;
    }

    public TripPlan description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getStartDate() {
        return this.startDate;
    }

    public TripPlan startDate(LocalDateTime startDate) {
        this.setStartDate(startDate);
        return this;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return this.endDate;
    }

    public TripPlan endDate(LocalDateTime endDate) {
        this.setEndDate(endDate);
        return this;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public Boolean getIsActive() {
        return this.isActive;
    }

    public TripPlan isActive(Boolean isActive) {
        this.setIsActive(isActive);
        return this;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public TripType getTripType() {
        return this.tripType;
    }

    public TripPlan tripType(TripType tripType) {
        this.setTripType(tripType);
        return this;
    }

    public void setTripType(TripType tripType) {
        this.tripType = tripType;
    }

    public String getActionsJson() {
        return this.actionsJson;
    }

    public TripPlan actionsJson(String actionsJson) {
        this.setActionsJson(actionsJson);
        return this;
    }

    public void setActionsJson(String actionsJson) {
        this.actionsJson = actionsJson;
    }

    public Set<TripPlanStep> getSteps() {
        return this.steps;
    }

    public void setSteps(Set<TripPlanStep> steps) {
        this.steps = steps;
    }

    public ExtendedUser getOwner() {
        return this.owner;
    }

    public void setOwner(ExtendedUser extendedUser) {
        this.owner = extendedUser;
    }

    public TripPlan owner(ExtendedUser extendedUser) {
        this.setOwner(extendedUser);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof TripPlan)) {
            return false;
        }
        return getId() != null && getId().equals(((TripPlan) o).getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TripPlan{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", description='" + getDescription() + "'" +
            ", startDate='" + getStartDate() + "'" +
            ", endDate='" + getEndDate() + "'" +
            ", isActive=" + getIsActive() +
            ", tripType='" + getTripType() + "'" +
            ", actionsJson='" + getActionsJson() + "'" +
            "}";
    }
}
