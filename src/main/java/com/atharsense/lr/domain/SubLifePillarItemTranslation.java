package com.atharsense.lr.domain;

import com.atharsense.lr.domain.enumeration.LangCode;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * A SubLifePillarItemTranslation.
 */
@Entity
@Table(name = "sub_life_pillar_item_translation")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class SubLifePillarItemTranslation implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
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
    private SubLifePillarItem subLifePillarItem;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public SubLifePillarItemTranslation id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LangCode getLang() {
        return this.lang;
    }

    public SubLifePillarItemTranslation lang(LangCode lang) {
        this.setLang(lang);
        return this;
    }

    public void setLang(LangCode lang) {
        this.lang = lang;
    }

    public String getName() {
        return this.name;
    }

    public SubLifePillarItemTranslation name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public SubLifePillarItemTranslation description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public SubLifePillarItem getSubLifePillarItem() {
        return this.subLifePillarItem;
    }

    public void setSubLifePillarItem(SubLifePillarItem subLifePillarItem) {
        this.subLifePillarItem = subLifePillarItem;
    }

    public SubLifePillarItemTranslation subLifePillarItem(SubLifePillarItem subLifePillarItem) {
        this.setSubLifePillarItem(subLifePillarItem);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SubLifePillarItemTranslation)) {
            return false;
        }
        return getId() != null && getId().equals(((SubLifePillarItemTranslation) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "SubLifePillarItemTranslation{" +
            "id=" + getId() +
            ", lang='" + getLang() + "'" +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
