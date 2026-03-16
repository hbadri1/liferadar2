package com.atharsense.lr.domain;

import com.atharsense.lr.domain.enumeration.LangCode;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * A PillarTranslation.
 */
@Entity
@Table(name = "pillar_translation")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PillarTranslation implements Serializable {

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
    @Size(max = 120)
    @Column(name = "name", length = 120, nullable = false)
    private String name;

    @Size(max = 500)
    @Column(name = "description", length = 500)
    private String description;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "translations", "owner" }, allowSetters = true)
    private Pillar pillar;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public PillarTranslation id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LangCode getLang() {
        return this.lang;
    }

    public PillarTranslation lang(LangCode lang) {
        this.setLang(lang);
        return this;
    }

    public void setLang(LangCode lang) {
        this.lang = lang;
    }

    public String getName() {
        return this.name;
    }

    public PillarTranslation name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public PillarTranslation description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Pillar getPillar() {
        return this.pillar;
    }

    public void setPillar(Pillar pillar) {
        this.pillar = pillar;
    }

    public PillarTranslation pillar(Pillar pillar) {
        this.setPillar(pillar);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PillarTranslation)) {
            return false;
        }
        return getId() != null && getId().equals(((PillarTranslation) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PillarTranslation{" +
            "id=" + getId() +
            ", lang='" + getLang() + "'" +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
