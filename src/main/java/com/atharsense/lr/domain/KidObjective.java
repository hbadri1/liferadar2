package com.atharsense.lr.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * A KidObjective.
 */
@Entity
@Table(name = "kid_objective")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class KidObjective implements Serializable {

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
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "objective", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = { "objective", "progressEntries" }, allowSetters = true)
    private Set<KidObjectiveItemDefinition> itemDefinitions = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "user" }, allowSetters = true)
    private ExtendedUser kid;

    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public KidObjective id(Long id) {
        this.setId(id);
        return this;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public KidObjective name(String name) {
        this.setName(name);
        return this;
    }

    public String getDescription() {
        return this.description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public KidObjective description(String description) {
        this.setDescription(description);
        return this;
    }

    public Boolean getIsActive() {
        return this.isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public KidObjective isActive(Boolean isActive) {
        this.setIsActive(isActive);
        return this;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public KidObjective createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public ExtendedUser getKid() {
        return this.kid;
    }

    public void setKid(ExtendedUser kid) {
        this.kid = kid;
    }

    public KidObjective kid(ExtendedUser kid) {
        this.setKid(kid);
        return this;
    }

    public Set<KidObjectiveItemDefinition> getItemDefinitions() {
        return this.itemDefinitions;
    }

    public void setItemDefinitions(Set<KidObjectiveItemDefinition> itemDefinitions) {
        if (this.itemDefinitions != null) {
            this.itemDefinitions.forEach(item -> item.setObjective(null));
        }
        if (itemDefinitions != null) {
            itemDefinitions.forEach(item -> item.setObjective(this));
        }
        this.itemDefinitions = itemDefinitions;
    }

    public KidObjective itemDefinitions(Set<KidObjectiveItemDefinition> itemDefinitions) {
        this.setItemDefinitions(itemDefinitions);
        return this;
    }

    public KidObjective addItemDefinitions(KidObjectiveItemDefinition itemDefinition) {
        this.itemDefinitions.add(itemDefinition);
        itemDefinition.setObjective(this);
        return this;
    }

    public KidObjective removeItemDefinitions(KidObjectiveItemDefinition itemDefinition) {
        this.itemDefinitions.remove(itemDefinition);
        itemDefinition.setObjective(null);
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof KidObjective)) {
            return false;
        }
        return getId() != null && getId().equals(((KidObjective) o).getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "KidObjective{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", isActive='" + getIsActive() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            "}";
    }
}

