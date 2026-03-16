package com.atharsense.lr.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * A SubPillarItem.
 */
@Entity
@Table(name = "sub_pillar_item")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class SubPillarItem implements Serializable {

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

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "subPillarItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = { "subPillarItem" }, allowSetters = true)
    private Set<SubPillarItemTranslation> translations = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "subPillarItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = { "owner", "subPillarItem" }, allowSetters = true)
    private Set<LifeEvaluation> evaluations = new HashSet<>();

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "pillar", "owner", "items" }, allowSetters = true)
    private SubPillar subPillar;

    @ManyToOne(optional = true)
    @JsonIgnoreProperties(value = { "user" }, allowSetters = true)
    private ExtendedUser owner;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public SubPillarItem id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return this.code;
    }

    public SubPillarItem code(String code) {
        this.setCode(code);
        return this;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Integer getSortOrder() {
        return this.sortOrder;
    }

    public SubPillarItem sortOrder(Integer sortOrder) {
        this.setSortOrder(sortOrder);
        return this;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Boolean getIsActive() {
        return this.isActive;
    }

    public SubPillarItem isActive(Boolean isActive) {
        this.setIsActive(isActive);
        return this;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Set<SubPillarItemTranslation> getTranslations() {
        return this.translations;
    }

    public void setTranslations(Set<SubPillarItemTranslation> subPillarItemTranslations) {
        if (this.translations != null) {
            this.translations.forEach(i -> i.setSubPillarItem(null));
        }
        if (subPillarItemTranslations != null) {
            subPillarItemTranslations.forEach(i -> i.setSubPillarItem(this));
        }
        this.translations = subPillarItemTranslations;
    }

    public SubPillarItem translations(Set<SubPillarItemTranslation> subPillarItemTranslations) {
        this.setTranslations(subPillarItemTranslations);
        return this;
    }

    public SubPillarItem addTranslations(SubPillarItemTranslation subPillarItemTranslation) {
        this.translations.add(subPillarItemTranslation);
        subPillarItemTranslation.setSubPillarItem(this);
        return this;
    }

    public SubPillarItem removeTranslations(SubPillarItemTranslation subPillarItemTranslation) {
        this.translations.remove(subPillarItemTranslation);
        subPillarItemTranslation.setSubPillarItem(null);
        return this;
    }

    public Set<LifeEvaluation> getEvaluations() {
        return this.evaluations;
    }

    public void setEvaluations(Set<LifeEvaluation> lifeEvaluations) {
        if (this.evaluations != null) {
            this.evaluations.forEach(i -> i.setSubPillarItem(null));
        }
        if (lifeEvaluations != null) {
            lifeEvaluations.forEach(i -> i.setSubPillarItem(this));
        }
        this.evaluations = lifeEvaluations;
    }

    public SubPillarItem evaluations(Set<LifeEvaluation> lifeEvaluations) {
        this.setEvaluations(lifeEvaluations);
        return this;
    }

    public SubPillarItem addEvaluations(LifeEvaluation lifeEvaluation) {
        this.evaluations.add(lifeEvaluation);
        lifeEvaluation.setSubPillarItem(this);
        return this;
    }

    public SubPillarItem removeEvaluations(LifeEvaluation lifeEvaluation) {
        this.evaluations.remove(lifeEvaluation);
        lifeEvaluation.setSubPillarItem(null);
        return this;
    }

    public SubPillar getSubPillar() {
        return this.subPillar;
    }

    public void setSubPillar(SubPillar subPillar) {
        this.subPillar = subPillar;
    }

    public SubPillarItem subPillar(SubPillar subPillar) {
        this.setSubPillar(subPillar);
        return this;
    }

    public ExtendedUser getOwner() {
        return this.owner;
    }

    public void setOwner(ExtendedUser extendedUser) {
        this.owner = extendedUser;
    }

    public SubPillarItem owner(ExtendedUser extendedUser) {
        this.setOwner(extendedUser);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SubPillarItem)) {
            return false;
        }
        return getId() != null && getId().equals(((SubPillarItem) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "SubPillarItem{" +
            "id=" + getId() +
            ", code='" + getCode() + "'" +
            ", sortOrder=" + getSortOrder() +
            ", isActive='" + getIsActive() + "'" +
            "}";
    }
}
