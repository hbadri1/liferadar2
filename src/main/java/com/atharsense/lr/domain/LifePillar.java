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
@Table(name = "life_pillar")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class LifePillar implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 50)
    @Column(name = "code", length = 50, nullable = false)
    private String code;

    @NotNull
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "lifePillar")
    @JsonIgnoreProperties(value = { "lifePillar" }, allowSetters = true)
    private Set<LifePillarTranslation> translations = new HashSet<>();

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "user" }, allowSetters = true)
    private ExtendedUser owner;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public LifePillar id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return this.code;
    }

    public LifePillar code(String code) {
        this.setCode(code);
        return this;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Boolean getIsActive() {
        return this.isActive;
    }

    public LifePillar isActive(Boolean isActive) {
        this.setIsActive(isActive);
        return this;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Set<LifePillarTranslation> getTranslations() {
        return this.translations;
    }

    public void setTranslations(Set<LifePillarTranslation> lifePillarTranslations) {
        if (this.translations != null) {
            this.translations.forEach(i -> i.setLifePillar(null));
        }
        if (lifePillarTranslations != null) {
            lifePillarTranslations.forEach(i -> i.setLifePillar(this));
        }
        this.translations = lifePillarTranslations;
    }

    public LifePillar translations(Set<LifePillarTranslation> lifePillarTranslations) {
        this.setTranslations(lifePillarTranslations);
        return this;
    }

    public LifePillar addTranslations(LifePillarTranslation lifePillarTranslation) {
        this.translations.add(lifePillarTranslation);
        lifePillarTranslation.setLifePillar(this);
        return this;
    }

    public LifePillar removeTranslations(LifePillarTranslation lifePillarTranslation) {
        this.translations.remove(lifePillarTranslation);
        lifePillarTranslation.setLifePillar(null);
        return this;
    }

    public ExtendedUser getOwner() {
        return this.owner;
    }

    public void setOwner(ExtendedUser extendedUser) {
        this.owner = extendedUser;
    }

    public LifePillar owner(ExtendedUser extendedUser) {
        this.setOwner(extendedUser);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof LifePillar)) {
            return false;
        }
        return getId() != null && getId().equals(((LifePillar) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "LifePillar{" +
            "id=" + getId() +
            ", code='" + getCode() + "'" +
            ", isActive='" + getIsActive() + "'" +
            "}";
    }
}
