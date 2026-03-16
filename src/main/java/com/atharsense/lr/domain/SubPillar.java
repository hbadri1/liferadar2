package com.atharsense.lr.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * A SubPillar.
 */
@Entity
@Table(name = "sub_pillar")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class SubPillar implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 60)
    @Column(name = "code", length = 60, nullable = false)
    private String code;

    @NotNull
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "subPillar", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = { "subPillar" }, allowSetters = true)
    private Set<SubPillarTranslation> translations = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "subPillar", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = { "translations", "evaluations", "subPillar", "owner" }, allowSetters = true)
    private Set<SubPillarItem> items = new HashSet<>();

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "translations", "owner", "subPillars" }, allowSetters = true)
    private Pillar pillar;

    @ManyToOne(optional = true)
    @JsonIgnoreProperties(value = { "user" }, allowSetters = true)
    private ExtendedUser owner;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public SubPillar id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return this.code;
    }

    public SubPillar code(String code) {
        this.setCode(code);
        return this;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Boolean getIsActive() {
        return this.isActive;
    }

    public SubPillar isActive(Boolean isActive) {
        this.setIsActive(isActive);
        return this;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Set<SubPillarTranslation> getTranslations() {
        return this.translations;
    }

    public void setTranslations(Set<SubPillarTranslation> subPillarTranslations) {
        if (this.translations != null) {
            this.translations.forEach(i -> i.setSubPillar(null));
        }
        if (subPillarTranslations != null) {
            subPillarTranslations.forEach(i -> i.setSubPillar(this));
        }
        this.translations = subPillarTranslations;
    }

    public SubPillar translations(Set<SubPillarTranslation> subPillarTranslations) {
        this.setTranslations(subPillarTranslations);
        return this;
    }

    public SubPillar addTranslations(SubPillarTranslation subPillarTranslation) {
        this.translations.add(subPillarTranslation);
        subPillarTranslation.setSubPillar(this);
        return this;
    }

    public SubPillar removeTranslations(SubPillarTranslation subPillarTranslation) {
        this.translations.remove(subPillarTranslation);
        subPillarTranslation.setSubPillar(null);
        return this;
    }

    public Set<SubPillarItem> getItems() {
        return this.items;
    }

    public void setItems(Set<SubPillarItem> subPillarItems) {
        if (this.items != null) {
            this.items.forEach(i -> i.setSubPillar(null));
        }
        if (subPillarItems != null) {
            subPillarItems.forEach(i -> i.setSubPillar(this));
        }
        this.items = subPillarItems;
    }

    public SubPillar items(Set<SubPillarItem> subPillarItems) {
        this.setItems(subPillarItems);
        return this;
    }

    public SubPillar addItems(SubPillarItem subPillarItem) {
        this.items.add(subPillarItem);
        subPillarItem.setSubPillar(this);
        return this;
    }

    public SubPillar removeItems(SubPillarItem subPillarItem) {
        this.items.remove(subPillarItem);
        subPillarItem.setSubPillar(null);
        return this;
    }

    public Pillar getPillar() {
        return this.pillar;
    }

    public void setPillar(Pillar pillar) {
        this.pillar = pillar;
    }

    public SubPillar pillar(Pillar pillar) {
        this.setPillar(pillar);
        return this;
    }

    public ExtendedUser getOwner() {
        return this.owner;
    }

    public void setOwner(ExtendedUser extendedUser) {
        this.owner = extendedUser;
    }

    public SubPillar owner(ExtendedUser extendedUser) {
        this.setOwner(extendedUser);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SubPillar)) {
            return false;
        }
        return getId() != null && getId().equals(((SubPillar) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "SubPillar{" +
            "id=" + getId() +
            ", code='" + getCode() + "'" +
            ", isActive='" + getIsActive() + "'" +
            "}";
    }
}
