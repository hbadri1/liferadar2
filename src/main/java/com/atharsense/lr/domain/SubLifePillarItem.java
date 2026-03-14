package com.atharsense.lr.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * A SubLifePillarItem.
 */
@Entity
@Table(name = "sub_life_pillar_item")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class SubLifePillarItem implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 80)
    @Column(name = "code", length = 80, nullable = false)
    private String code;

    @Min(value = 1)
    @Column(name = "sort_order")
    private Integer sortOrder;

    @NotNull
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "subLifePillarItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = { "subLifePillarItem" }, allowSetters = true)
    private Set<SubLifePillarItemTranslation> translations = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "subLifePillarItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = { "owner", "subLifePillarItem" }, allowSetters = true)
    private Set<LifeEvaluation> evaluations = new HashSet<>();

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "translations", "lifePillar", "owner", "items" }, allowSetters = true)
    private SubLifePillar subLifePillar;

    @ManyToOne(optional = true)
    @JsonIgnoreProperties(value = { "user" }, allowSetters = true)
    private ExtendedUser owner;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public SubLifePillarItem id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return this.code;
    }

    public SubLifePillarItem code(String code) {
        this.setCode(code);
        return this;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Integer getSortOrder() {
        return this.sortOrder;
    }

    public SubLifePillarItem sortOrder(Integer sortOrder) {
        this.setSortOrder(sortOrder);
        return this;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Boolean getIsActive() {
        return this.isActive;
    }

    public SubLifePillarItem isActive(Boolean isActive) {
        this.setIsActive(isActive);
        return this;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Set<SubLifePillarItemTranslation> getTranslations() {
        return this.translations;
    }

    public void setTranslations(Set<SubLifePillarItemTranslation> subLifePillarItemTranslations) {
        if (this.translations != null) {
            this.translations.forEach(i -> i.setSubLifePillarItem(null));
        }
        if (subLifePillarItemTranslations != null) {
            subLifePillarItemTranslations.forEach(i -> i.setSubLifePillarItem(this));
        }
        this.translations = subLifePillarItemTranslations;
    }

    public SubLifePillarItem translations(Set<SubLifePillarItemTranslation> subLifePillarItemTranslations) {
        this.setTranslations(subLifePillarItemTranslations);
        return this;
    }

    public SubLifePillarItem addTranslations(SubLifePillarItemTranslation subLifePillarItemTranslation) {
        this.translations.add(subLifePillarItemTranslation);
        subLifePillarItemTranslation.setSubLifePillarItem(this);
        return this;
    }

    public SubLifePillarItem removeTranslations(SubLifePillarItemTranslation subLifePillarItemTranslation) {
        this.translations.remove(subLifePillarItemTranslation);
        subLifePillarItemTranslation.setSubLifePillarItem(null);
        return this;
    }

    public Set<LifeEvaluation> getEvaluations() {
        return this.evaluations;
    }

    public void setEvaluations(Set<LifeEvaluation> lifeEvaluations) {
        if (this.evaluations != null) {
            this.evaluations.forEach(i -> i.setSubLifePillarItem(null));
        }
        if (lifeEvaluations != null) {
            lifeEvaluations.forEach(i -> i.setSubLifePillarItem(this));
        }
        this.evaluations = lifeEvaluations;
    }

    public SubLifePillarItem evaluations(Set<LifeEvaluation> lifeEvaluations) {
        this.setEvaluations(lifeEvaluations);
        return this;
    }

    public SubLifePillarItem addEvaluations(LifeEvaluation lifeEvaluation) {
        this.evaluations.add(lifeEvaluation);
        lifeEvaluation.setSubLifePillarItem(this);
        return this;
    }

    public SubLifePillarItem removeEvaluations(LifeEvaluation lifeEvaluation) {
        this.evaluations.remove(lifeEvaluation);
        lifeEvaluation.setSubLifePillarItem(null);
        return this;
    }

    public SubLifePillar getSubLifePillar() {
        return this.subLifePillar;
    }

    public void setSubLifePillar(SubLifePillar subLifePillar) {
        this.subLifePillar = subLifePillar;
    }

    public SubLifePillarItem subLifePillar(SubLifePillar subLifePillar) {
        this.setSubLifePillar(subLifePillar);
        return this;
    }

    public ExtendedUser getOwner() {
        return this.owner;
    }

    public void setOwner(ExtendedUser extendedUser) {
        this.owner = extendedUser;
    }

    public SubLifePillarItem owner(ExtendedUser extendedUser) {
        this.setOwner(extendedUser);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SubLifePillarItem)) {
            return false;
        }
        return getId() != null && getId().equals(((SubLifePillarItem) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "SubLifePillarItem{" +
            "id=" + getId() +
            ", code='" + getCode() + "'" +
            ", sortOrder=" + getSortOrder() +
            ", isActive='" + getIsActive() + "'" +
            "}";
    }
}
