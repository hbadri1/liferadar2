package com.atharsense.lr.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "kid_objective_progress")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class KidObjectiveProgress implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @Column(name = "progress_value", precision = 21, scale = 2, nullable = false)
    private BigDecimal value;

    @Size(max = 1000)
    @Column(name = "notes", length = 1000)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "objective", "progressEntries" }, allowSetters = true)
    private KidObjectiveItemDefinition itemDefinition;

    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public KidObjectiveProgress id(Long id) {
        this.setId(id);
        return this;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public KidObjectiveProgress createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public BigDecimal getValue() {
        return this.value;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }

    public KidObjectiveProgress value(BigDecimal value) {
        this.setValue(value);
        return this;
    }

    public String getNotes() {
        return this.notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public KidObjectiveProgress notes(String notes) {
        this.setNotes(notes);
        return this;
    }

    public KidObjectiveItemDefinition getItemDefinition() {
        return this.itemDefinition;
    }

    public void setItemDefinition(KidObjectiveItemDefinition itemDefinition) {
        this.itemDefinition = itemDefinition;
    }

    public KidObjectiveProgress itemDefinition(KidObjectiveItemDefinition itemDefinition) {
        this.setItemDefinition(itemDefinition);
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof KidObjectiveProgress)) {
            return false;
        }
        return getId() != null && getId().equals(((KidObjectiveProgress) o).getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
