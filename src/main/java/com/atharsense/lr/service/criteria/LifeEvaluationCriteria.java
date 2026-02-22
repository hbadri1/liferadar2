package com.atharsense.lr.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.atharsense.lr.domain.LifeEvaluation} entity. This class is used
 * in {@link com.atharsense.lr.web.rest.LifeEvaluationResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /life-evaluations?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class LifeEvaluationCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private LocalDateFilter evaluationDate;

    private BooleanFilter reminderEnabled;

    private InstantFilter reminderAt;

    private IntegerFilter score;

    private StringFilter notes;

    private LongFilter decisionsId;

    private LongFilter ownerId;

    private LongFilter subLifePillarItemId;

    private Boolean distinct;

    public LifeEvaluationCriteria() {}

    public LifeEvaluationCriteria(LifeEvaluationCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.evaluationDate = other.optionalEvaluationDate().map(LocalDateFilter::copy).orElse(null);
        this.reminderEnabled = other.optionalReminderEnabled().map(BooleanFilter::copy).orElse(null);
        this.reminderAt = other.optionalReminderAt().map(InstantFilter::copy).orElse(null);
        this.score = other.optionalScore().map(IntegerFilter::copy).orElse(null);
        this.notes = other.optionalNotes().map(StringFilter::copy).orElse(null);
        this.decisionsId = other.optionalDecisionsId().map(LongFilter::copy).orElse(null);
        this.ownerId = other.optionalOwnerId().map(LongFilter::copy).orElse(null);
        this.subLifePillarItemId = other.optionalSubLifePillarItemId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public LifeEvaluationCriteria copy() {
        return new LifeEvaluationCriteria(this);
    }

    public LongFilter getId() {
        return id;
    }

    public Optional<LongFilter> optionalId() {
        return Optional.ofNullable(id);
    }

    public LongFilter id() {
        if (id == null) {
            setId(new LongFilter());
        }
        return id;
    }

    public void setId(LongFilter id) {
        this.id = id;
    }

    public LocalDateFilter getEvaluationDate() {
        return evaluationDate;
    }

    public Optional<LocalDateFilter> optionalEvaluationDate() {
        return Optional.ofNullable(evaluationDate);
    }

    public LocalDateFilter evaluationDate() {
        if (evaluationDate == null) {
            setEvaluationDate(new LocalDateFilter());
        }
        return evaluationDate;
    }

    public void setEvaluationDate(LocalDateFilter evaluationDate) {
        this.evaluationDate = evaluationDate;
    }

    public BooleanFilter getReminderEnabled() {
        return reminderEnabled;
    }

    public Optional<BooleanFilter> optionalReminderEnabled() {
        return Optional.ofNullable(reminderEnabled);
    }

    public BooleanFilter reminderEnabled() {
        if (reminderEnabled == null) {
            setReminderEnabled(new BooleanFilter());
        }
        return reminderEnabled;
    }

    public void setReminderEnabled(BooleanFilter reminderEnabled) {
        this.reminderEnabled = reminderEnabled;
    }

    public InstantFilter getReminderAt() {
        return reminderAt;
    }

    public Optional<InstantFilter> optionalReminderAt() {
        return Optional.ofNullable(reminderAt);
    }

    public InstantFilter reminderAt() {
        if (reminderAt == null) {
            setReminderAt(new InstantFilter());
        }
        return reminderAt;
    }

    public void setReminderAt(InstantFilter reminderAt) {
        this.reminderAt = reminderAt;
    }

    public IntegerFilter getScore() {
        return score;
    }

    public Optional<IntegerFilter> optionalScore() {
        return Optional.ofNullable(score);
    }

    public IntegerFilter score() {
        if (score == null) {
            setScore(new IntegerFilter());
        }
        return score;
    }

    public void setScore(IntegerFilter score) {
        this.score = score;
    }

    public StringFilter getNotes() {
        return notes;
    }

    public Optional<StringFilter> optionalNotes() {
        return Optional.ofNullable(notes);
    }

    public StringFilter notes() {
        if (notes == null) {
            setNotes(new StringFilter());
        }
        return notes;
    }

    public void setNotes(StringFilter notes) {
        this.notes = notes;
    }

    public LongFilter getDecisionsId() {
        return decisionsId;
    }

    public Optional<LongFilter> optionalDecisionsId() {
        return Optional.ofNullable(decisionsId);
    }

    public LongFilter decisionsId() {
        if (decisionsId == null) {
            setDecisionsId(new LongFilter());
        }
        return decisionsId;
    }

    public void setDecisionsId(LongFilter decisionsId) {
        this.decisionsId = decisionsId;
    }

    public LongFilter getOwnerId() {
        return ownerId;
    }

    public Optional<LongFilter> optionalOwnerId() {
        return Optional.ofNullable(ownerId);
    }

    public LongFilter ownerId() {
        if (ownerId == null) {
            setOwnerId(new LongFilter());
        }
        return ownerId;
    }

    public void setOwnerId(LongFilter ownerId) {
        this.ownerId = ownerId;
    }

    public LongFilter getSubLifePillarItemId() {
        return subLifePillarItemId;
    }

    public Optional<LongFilter> optionalSubLifePillarItemId() {
        return Optional.ofNullable(subLifePillarItemId);
    }

    public LongFilter subLifePillarItemId() {
        if (subLifePillarItemId == null) {
            setSubLifePillarItemId(new LongFilter());
        }
        return subLifePillarItemId;
    }

    public void setSubLifePillarItemId(LongFilter subLifePillarItemId) {
        this.subLifePillarItemId = subLifePillarItemId;
    }

    public Boolean getDistinct() {
        return distinct;
    }

    public Optional<Boolean> optionalDistinct() {
        return Optional.ofNullable(distinct);
    }

    public Boolean distinct() {
        if (distinct == null) {
            setDistinct(true);
        }
        return distinct;
    }

    public void setDistinct(Boolean distinct) {
        this.distinct = distinct;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        final LifeEvaluationCriteria that = (LifeEvaluationCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(evaluationDate, that.evaluationDate) &&
            Objects.equals(reminderEnabled, that.reminderEnabled) &&
            Objects.equals(reminderAt, that.reminderAt) &&
            Objects.equals(score, that.score) &&
            Objects.equals(notes, that.notes) &&
            Objects.equals(decisionsId, that.decisionsId) &&
            Objects.equals(ownerId, that.ownerId) &&
            Objects.equals(subLifePillarItemId, that.subLifePillarItemId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(
            id,
            evaluationDate,
            reminderEnabled,
            reminderAt,
            score,
            notes,
            decisionsId,
            ownerId,
            subLifePillarItemId,
            distinct
        );
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "LifeEvaluationCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalEvaluationDate().map(f -> "evaluationDate=" + f + ", ").orElse("") +
            optionalReminderEnabled().map(f -> "reminderEnabled=" + f + ", ").orElse("") +
            optionalReminderAt().map(f -> "reminderAt=" + f + ", ").orElse("") +
            optionalScore().map(f -> "score=" + f + ", ").orElse("") +
            optionalNotes().map(f -> "notes=" + f + ", ").orElse("") +
            optionalDecisionsId().map(f -> "decisionsId=" + f + ", ").orElse("") +
            optionalOwnerId().map(f -> "ownerId=" + f + ", ").orElse("") +
            optionalSubLifePillarItemId().map(f -> "subLifePillarItemId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
