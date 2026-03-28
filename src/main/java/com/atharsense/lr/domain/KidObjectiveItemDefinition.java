package com.atharsense.lr.domain;

import com.atharsense.lr.domain.enumeration.ObjectiveUnit;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "kid_objective_item_definition")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class KidObjectiveItemDefinition implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 255)
    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Size(max = 1000)
    @Column(name = "description", length = 1000)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "unit", nullable = false)
    private ObjectiveUnit unit;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "kid", "itemDefinitions" }, allowSetters = true)
    private KidObjective objective;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "itemDefinition", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = { "itemDefinition" }, allowSetters = true)
    private Set<KidObjectiveProgress> progressEntries = new HashSet<>();

    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public KidObjectiveItemDefinition id(Long id) {
        this.setId(id);
        return this;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public KidObjectiveItemDefinition name(String name) {
        this.setName(name);
        return this;
    }

    public String getDescription() {
        return this.description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public KidObjectiveItemDefinition description(String description) {
        this.setDescription(description);
        return this;
    }

    public ObjectiveUnit getUnit() {
        return this.unit;
    }

    public void setUnit(ObjectiveUnit unit) {
        this.unit = unit;
    }

    public KidObjectiveItemDefinition unit(ObjectiveUnit unit) {
        this.setUnit(unit);
        return this;
    }

    public KidObjective getObjective() {
        return this.objective;
    }

    public void setObjective(KidObjective objective) {
        this.objective = objective;
    }

    public KidObjectiveItemDefinition objective(KidObjective objective) {
        this.setObjective(objective);
        return this;
    }

    public Set<KidObjectiveProgress> getProgressEntries() {
        return this.progressEntries;
    }

    public void setProgressEntries(Set<KidObjectiveProgress> progressEntries) {
        if (this.progressEntries != null) {
            this.progressEntries.forEach(entry -> entry.setItemDefinition(null));
        }
        if (progressEntries != null) {
            progressEntries.forEach(entry -> entry.setItemDefinition(this));
        }
        this.progressEntries = progressEntries;
    }

    public KidObjectiveItemDefinition progressEntries(Set<KidObjectiveProgress> progressEntries) {
        this.setProgressEntries(progressEntries);
        return this;
    }

    public KidObjectiveItemDefinition addProgressEntries(KidObjectiveProgress progressEntry) {
        this.progressEntries.add(progressEntry);
        progressEntry.setItemDefinition(this);
        return this;
    }

    public KidObjectiveItemDefinition removeProgressEntries(KidObjectiveProgress progressEntry) {
        this.progressEntries.remove(progressEntry);
        progressEntry.setItemDefinition(null);
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof KidObjectiveItemDefinition)) {
            return false;
        }
        return getId() != null && getId().equals(((KidObjectiveItemDefinition) o).getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}

