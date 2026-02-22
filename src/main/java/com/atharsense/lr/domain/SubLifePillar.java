package com.atharsense.lr.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * A SubLifePillar.
 */
@Entity
@Table(name = "sub_life_pillar")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class SubLifePillar implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 60)
    @Column(name = "code", length = 60, nullable = false)
    private String code;

    @NotNull
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "subLifePillar")
    @JsonIgnoreProperties(value = { "subLifePillar" }, allowSetters = true)
    private Set<SubLifePillarTranslation> translations = new HashSet<>();

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "user" }, allowSetters = true)
    private ExtendedUser owner;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public SubLifePillar id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return this.code;
    }

    public SubLifePillar code(String code) {
        this.setCode(code);
        return this;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Boolean getIsActive() {
        return this.isActive;
    }

    public SubLifePillar isActive(Boolean isActive) {
        this.setIsActive(isActive);
        return this;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Set<SubLifePillarTranslation> getTranslations() {
        return this.translations;
    }

    public void setTranslations(Set<SubLifePillarTranslation> subLifePillarTranslations) {
        if (this.translations != null) {
            this.translations.forEach(i -> i.setSubLifePillar(null));
        }
        if (subLifePillarTranslations != null) {
            subLifePillarTranslations.forEach(i -> i.setSubLifePillar(this));
        }
        this.translations = subLifePillarTranslations;
    }

    public SubLifePillar translations(Set<SubLifePillarTranslation> subLifePillarTranslations) {
        this.setTranslations(subLifePillarTranslations);
        return this;
    }

    public SubLifePillar addTranslations(SubLifePillarTranslation subLifePillarTranslation) {
        this.translations.add(subLifePillarTranslation);
        subLifePillarTranslation.setSubLifePillar(this);
        return this;
    }

    public SubLifePillar removeTranslations(SubLifePillarTranslation subLifePillarTranslation) {
        this.translations.remove(subLifePillarTranslation);
        subLifePillarTranslation.setSubLifePillar(null);
        return this;
    }

    public ExtendedUser getOwner() {
        return this.owner;
    }

    public void setOwner(ExtendedUser extendedUser) {
        this.owner = extendedUser;
    }

    public SubLifePillar owner(ExtendedUser extendedUser) {
        this.setOwner(extendedUser);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SubLifePillar)) {
            return false;
        }
        return getId() != null && getId().equals(((SubLifePillar) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "SubLifePillar{" +
            "id=" + getId() +
            ", code='" + getCode() + "'" +
            ", isActive='" + getIsActive() + "'" +
            "}";
    }
}
