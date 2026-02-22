package com.atharsense.lr.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

/**
 * A LifeEvaluation.
 */
@Entity
@Table(name = "life_evaluation")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class LifeEvaluation implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "evaluation_date", nullable = false)
    private LocalDate evaluationDate;

    @Column(name = "reminder_enabled")
    private Boolean reminderEnabled;

    @Column(name = "reminder_at")
    private Instant reminderAt;

    @NotNull
    @Min(value = 1)
    @Max(value = 10)
    @Column(name = "score", nullable = false)
    private Integer score;

    @Size(max = 800)
    @Column(name = "notes", length = 800)
    private String notes;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "lifeEvaluation")
    @JsonIgnoreProperties(value = { "owner", "lifeEvaluation" }, allowSetters = true)
    private Set<EvaluationDecision> decisions = new HashSet<>();

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "user" }, allowSetters = true)
    private ExtendedUser owner;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "translations", "owner" }, allowSetters = true)
    private SubLifePillarItem subLifePillarItem;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public LifeEvaluation id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getEvaluationDate() {
        return this.evaluationDate;
    }

    public LifeEvaluation evaluationDate(LocalDate evaluationDate) {
        this.setEvaluationDate(evaluationDate);
        return this;
    }

    public void setEvaluationDate(LocalDate evaluationDate) {
        this.evaluationDate = evaluationDate;
    }

    public Boolean getReminderEnabled() {
        return this.reminderEnabled;
    }

    public LifeEvaluation reminderEnabled(Boolean reminderEnabled) {
        this.setReminderEnabled(reminderEnabled);
        return this;
    }

    public void setReminderEnabled(Boolean reminderEnabled) {
        this.reminderEnabled = reminderEnabled;
    }

    public Instant getReminderAt() {
        return this.reminderAt;
    }

    public LifeEvaluation reminderAt(Instant reminderAt) {
        this.setReminderAt(reminderAt);
        return this;
    }

    public void setReminderAt(Instant reminderAt) {
        this.reminderAt = reminderAt;
    }

    public Integer getScore() {
        return this.score;
    }

    public LifeEvaluation score(Integer score) {
        this.setScore(score);
        return this;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getNotes() {
        return this.notes;
    }

    public LifeEvaluation notes(String notes) {
        this.setNotes(notes);
        return this;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Set<EvaluationDecision> getDecisions() {
        return this.decisions;
    }

    public void setDecisions(Set<EvaluationDecision> evaluationDecisions) {
        if (this.decisions != null) {
            this.decisions.forEach(i -> i.setLifeEvaluation(null));
        }
        if (evaluationDecisions != null) {
            evaluationDecisions.forEach(i -> i.setLifeEvaluation(this));
        }
        this.decisions = evaluationDecisions;
    }

    public LifeEvaluation decisions(Set<EvaluationDecision> evaluationDecisions) {
        this.setDecisions(evaluationDecisions);
        return this;
    }

    public LifeEvaluation addDecisions(EvaluationDecision evaluationDecision) {
        this.decisions.add(evaluationDecision);
        evaluationDecision.setLifeEvaluation(this);
        return this;
    }

    public LifeEvaluation removeDecisions(EvaluationDecision evaluationDecision) {
        this.decisions.remove(evaluationDecision);
        evaluationDecision.setLifeEvaluation(null);
        return this;
    }

    public ExtendedUser getOwner() {
        return this.owner;
    }

    public void setOwner(ExtendedUser extendedUser) {
        this.owner = extendedUser;
    }

    public LifeEvaluation owner(ExtendedUser extendedUser) {
        this.setOwner(extendedUser);
        return this;
    }

    public SubLifePillarItem getSubLifePillarItem() {
        return this.subLifePillarItem;
    }

    public void setSubLifePillarItem(SubLifePillarItem subLifePillarItem) {
        this.subLifePillarItem = subLifePillarItem;
    }

    public LifeEvaluation subLifePillarItem(SubLifePillarItem subLifePillarItem) {
        this.setSubLifePillarItem(subLifePillarItem);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof LifeEvaluation)) {
            return false;
        }
        return getId() != null && getId().equals(((LifeEvaluation) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "LifeEvaluation{" +
            "id=" + getId() +
            ", evaluationDate='" + getEvaluationDate() + "'" +
            ", reminderEnabled='" + getReminderEnabled() + "'" +
            ", reminderAt='" + getReminderAt() + "'" +
            ", score=" + getScore() +
            ", notes='" + getNotes() + "'" +
            "}";
    }
}
