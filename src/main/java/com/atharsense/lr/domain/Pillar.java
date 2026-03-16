package com.atharsense.lr.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * Core business aggregates (per-user schema)
 */
@Schema(description = "Core business aggregates (per-user schema)")
@Entity
@Table(name = "pillar")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Pillar implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 50)
    @Column(name = "code", length = 50, nullable = false)
    private String code;

    @NotNull
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "pillar", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = { "pillar" }, allowSetters = true)
    private Set<PillarTranslation> translations = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "pillar", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = { "translations", "owner", "pillar" }, allowSetters = true)
    private Set<SubPillar> subPillars = new HashSet<>();

    @ManyToOne(optional = true)
    @JsonIgnoreProperties(value = { "user" }, allowSetters = true)
    private ExtendedUser owner;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Pillar id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return this.code;
    }

    public Pillar code(String code) {
        this.setCode(code);
        return this;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Boolean getIsActive() {
        return this.isActive;
    }

    public Pillar isActive(Boolean isActive) {
        this.setIsActive(isActive);
        return this;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Set<PillarTranslation> getTranslations() {
        return this.translations;
    }

    public void setTranslations(Set<PillarTranslation> pillarTranslations) {
        if (this.translations != null) {
            this.translations.forEach(i -> i.setPillar(null));
        }
        if (pillarTranslations != null) {
            pillarTranslations.forEach(i -> i.setPillar(this));
        }
        this.translations = pillarTranslations;
    }

    public Pillar translations(Set<PillarTranslation> pillarTranslations) {
        this.setTranslations(pillarTranslations);
        return this;
    }

    public Pillar addTranslations(PillarTranslation pillarTranslation) {
        this.translations.add(pillarTranslation);
        pillarTranslation.setPillar(this);
        return this;
    }

    public Pillar removeTranslations(PillarTranslation pillarTranslation) {
        this.translations.remove(pillarTranslation);
        pillarTranslation.setPillar(null);
        return this;
    }

    public Set<SubPillar> getSubPillars() {
        return this.subPillars;
    }

    public void setSubPillars(Set<SubPillar> subPillars) {
        if (this.subPillars != null) {
            this.subPillars.forEach(i -> i.setPillar(null));
        }
        if (subPillars != null) {
            subPillars.forEach(i -> i.setPillar(this));
        }
        this.subPillars = subPillars;
    }

    public Pillar subPillars(Set<SubPillar> subPillars) {
        this.setSubPillars(subPillars);
        return this;
    }

    public Pillar addSubPillar(SubPillar subPillar) {
        this.subPillars.add(subPillar);
        subPillar.setPillar(this);
        return this;
    }

    public Pillar removeSubPillar(SubPillar subPillar) {
        this.subPillars.remove(subPillar);
        subPillar.setPillar(null);
        return this;
    }

    public ExtendedUser getOwner() {
        return this.owner;
    }

    public void setOwner(ExtendedUser extendedUser) {
        this.owner = extendedUser;
    }

    public Pillar owner(ExtendedUser extendedUser) {
        this.setOwner(extendedUser);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Pillar)) {
            return false;
        }
        return getId() != null && getId().equals(((Pillar) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Pillar{" +
            "id=" + getId() +
            ", code='" + getCode() + "'" +
            ", isActive='" + getIsActive() + "'" +
            "}";
    }
}
