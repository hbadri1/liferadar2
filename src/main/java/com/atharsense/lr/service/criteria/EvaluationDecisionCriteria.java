package com.atharsense.lr.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.atharsense.lr.domain.EvaluationDecision} entity. This class is used
 * in {@link com.atharsense.lr.web.rest.EvaluationDecisionResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /evaluation-decisions?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class EvaluationDecisionCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter decision;

    private InstantFilter date;

    private LongFilter ownerId;

    private LongFilter lifeEvaluationId;

    private Boolean distinct;

    public EvaluationDecisionCriteria() {}

    public EvaluationDecisionCriteria(EvaluationDecisionCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.decision = other.optionalDecision().map(StringFilter::copy).orElse(null);
        this.date = other.optionalDate().map(InstantFilter::copy).orElse(null);
        this.ownerId = other.optionalOwnerId().map(LongFilter::copy).orElse(null);
        this.lifeEvaluationId = other.optionalLifeEvaluationId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public EvaluationDecisionCriteria copy() {
        return new EvaluationDecisionCriteria(this);
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

    public StringFilter getDecision() {
        return decision;
    }

    public Optional<StringFilter> optionalDecision() {
        return Optional.ofNullable(decision);
    }

    public StringFilter decision() {
        if (decision == null) {
            setDecision(new StringFilter());
        }
        return decision;
    }

    public void setDecision(StringFilter decision) {
        this.decision = decision;
    }

    public InstantFilter getDate() {
        return date;
    }

    public Optional<InstantFilter> optionalDate() {
        return Optional.ofNullable(date);
    }

    public InstantFilter date() {
        if (date == null) {
            setDate(new InstantFilter());
        }
        return date;
    }

    public void setDate(InstantFilter date) {
        this.date = date;
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

    public LongFilter getLifeEvaluationId() {
        return lifeEvaluationId;
    }

    public Optional<LongFilter> optionalLifeEvaluationId() {
        return Optional.ofNullable(lifeEvaluationId);
    }

    public LongFilter lifeEvaluationId() {
        if (lifeEvaluationId == null) {
            setLifeEvaluationId(new LongFilter());
        }
        return lifeEvaluationId;
    }

    public void setLifeEvaluationId(LongFilter lifeEvaluationId) {
        this.lifeEvaluationId = lifeEvaluationId;
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
        final EvaluationDecisionCriteria that = (EvaluationDecisionCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(decision, that.decision) &&
            Objects.equals(date, that.date) &&
            Objects.equals(ownerId, that.ownerId) &&
            Objects.equals(lifeEvaluationId, that.lifeEvaluationId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, decision, date, ownerId, lifeEvaluationId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "EvaluationDecisionCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalDecision().map(f -> "decision=" + f + ", ").orElse("") +
            optionalDate().map(f -> "date=" + f + ", ").orElse("") +
            optionalOwnerId().map(f -> "ownerId=" + f + ", ").orElse("") +
            optionalLifeEvaluationId().map(f -> "lifeEvaluationId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
