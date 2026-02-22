package com.atharsense.lr.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;

/**
 * A EvaluationDecision.
 */
@Entity
@Table(name = "evaluation_decision")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class EvaluationDecision implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 500)
    @Column(name = "decision", length = 500, nullable = false)
    private String decision;

    @Column(name = "date")
    private Instant date;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "user" }, allowSetters = true)
    private ExtendedUser owner;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "decisions", "owner", "subLifePillarItem" }, allowSetters = true)
    private LifeEvaluation lifeEvaluation;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public EvaluationDecision id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDecision() {
        return this.decision;
    }

    public EvaluationDecision decision(String decision) {
        this.setDecision(decision);
        return this;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public Instant getDate() {
        return this.date;
    }

    public EvaluationDecision date(Instant date) {
        this.setDate(date);
        return this;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public ExtendedUser getOwner() {
        return this.owner;
    }

    public void setOwner(ExtendedUser extendedUser) {
        this.owner = extendedUser;
    }

    public EvaluationDecision owner(ExtendedUser extendedUser) {
        this.setOwner(extendedUser);
        return this;
    }

    public LifeEvaluation getLifeEvaluation() {
        return this.lifeEvaluation;
    }

    public void setLifeEvaluation(LifeEvaluation lifeEvaluation) {
        this.lifeEvaluation = lifeEvaluation;
    }

    public EvaluationDecision lifeEvaluation(LifeEvaluation lifeEvaluation) {
        this.setLifeEvaluation(lifeEvaluation);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof EvaluationDecision)) {
            return false;
        }
        return getId() != null && getId().equals(((EvaluationDecision) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "EvaluationDecision{" +
            "id=" + getId() +
            ", decision='" + getDecision() + "'" +
            ", date='" + getDate() + "'" +
            "}";
    }
}
