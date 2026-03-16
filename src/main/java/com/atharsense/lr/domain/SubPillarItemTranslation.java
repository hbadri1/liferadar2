package com.atharsense.lr.domain;

import com.atharsense.lr.domain.enumeration.LangCode;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * A SubPillarItemTranslation.
 */
@Entity
@Table(name = "sub_pillar_item_translation")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class SubPillarItemTranslation implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "lang", nullable = false)
    private LangCode lang;

    @NotNull
    @Size(max = 160)
    @Column(name = "name", length = 160, nullable = false)
    private String name;

    @Size(max = 700)
    @Column(name = "description", length = 700)
    private String description;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "translations", "owner" }, allowSetters = true)
    private SubPillarItem subPillarItem;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public SubPillarItemTranslation id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LangCode getLang() {
        return this.lang;
    }

    public SubPillarItemTranslation lang(LangCode lang) {
        this.setLang(lang);
        return this;
    }

    public void setLang(LangCode lang) {
        this.lang = lang;
    }

    public String getName() {
        return this.name;
    }

    public SubPillarItemTranslation name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public SubPillarItemTranslation description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public SubPillarItem getSubPillarItem() {
        return this.subPillarItem;
    }

    public void setSubPillarItem(SubPillarItem subPillarItem) {
        this.subPillarItem = subPillarItem;
    }

    public SubPillarItemTranslation subPillarItem(SubPillarItem subPillarItem) {
        this.setSubPillarItem(subPillarItem);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SubPillarItemTranslation)) {
            return false;
        }
        return getId() != null && getId().equals(((SubPillarItemTranslation) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "SubPillarItemTranslation{" +
            "id=" + getId() +
            ", lang='" + getLang() + "'" +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
