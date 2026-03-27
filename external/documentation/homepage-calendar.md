# Homepage Calendar: DB -> API -> UI

## 1) Database model (source of truth)
Calendar data is built from `life_evaluation` (daily score) and `evaluation_decision` (actions linked to an evaluation).

```xml
<!-- 20260218143720_added_entity_LifeEvaluation.xml -->
<createTable tableName="life_evaluation">
  <column name="evaluation_date" type="date"><constraints nullable="false" /></column>
  <column name="score" type="integer"><constraints nullable="false" /></column>
  <column name="owner_id" type="bigint"/>
  <column name="sub_pillar_item_id" type="bigint"><constraints nullable="false" /></column>
</createTable>

<addForeignKeyConstraint baseTableName="life_evaluation" baseColumnNames="sub_pillar_item_id"
  referencedTableName="sub_pillar_item" referencedColumnNames="id" onDelete="CASCADE"/>
```

```xml
<!-- 20260218143721_added_entity_EvaluationDecision.xml -->
<createTable tableName="evaluation_decision">
  <column name="decision" type="varchar(500)"><constraints nullable="false" /></column>
  <column name="date" type="${datetimeType}"/>
  <column name="owner_id" type="bigint"/>
  <column name="life_evaluation_id" type="bigint"><constraints nullable="false" /></column>
</createTable>

<addForeignKeyConstraint baseTableName="evaluation_decision" baseColumnNames="life_evaluation_id"
  referencedTableName="life_evaluation" referencedColumnNames="id" onDelete="CASCADE"/>
```

## 2) Backend API ownership scoping
Both resources force owner scoping when `ownerId` is not passed (current user only).

```java
// LifeEvaluationResource / EvaluationDecisionResource
private void applyCurrentUserOwnerFilter(... criteria) {
  if (criteria.getOwnerId() != null) return;
  // resolve current user -> ExtendedUser
  LongFilter ownerFilter = new LongFilter();
  ownerFilter.setEquals(extendedUser.getId());
  criteria.setOwnerId(ownerFilter);
}
```

This guarantees homepage queries cannot leak other users' data.

## 3) Backend criteria translation to SQL
Criteria are converted to JPA `Specification`.

```java
// LifeEvaluationQueryService
specification = Specification.allOf(
  buildRangeSpecification(criteria.getEvaluationDate(), LifeEvaluation_.evaluationDate),
  buildSpecification(criteria.getOwnerId(), root -> root.join(LifeEvaluation_.owner, JoinType.LEFT).get(ExtendedUser_.id)),
  buildSpecification(criteria.getSubPillarItemId(), root -> root.join(LifeEvaluation_.subPillarItem, JoinType.LEFT).get(SubPillarItem_.id))
);
```

```java
// EvaluationDecisionQueryService
specification = Specification.allOf(
  buildRangeSpecification(criteria.getDate(), EvaluationDecision_.date),
  buildSpecification(criteria.getLifeEvaluationId(), root -> root.join(EvaluationDecision_.lifeEvaluation, JoinType.LEFT).get(LifeEvaluation_.id)),
  buildSpecification(criteria.getOwnerId(), root -> root.join(EvaluationDecision_.owner, JoinType.LEFT).get(ExtendedUser_.id))
);
```

## 4) Repository execution layer
`QueryService` builds a `Specification`, then repositories execute it (`findAll` / `count`) against DB.

```java
// LifeEvaluationQueryService
public Page<LifeEvaluation> findByCriteria(LifeEvaluationCriteria criteria, Pageable page) {
  final Specification<LifeEvaluation> specification = createSpecification(criteria);
  return lifeEvaluationRepository.findAll(specification, page);
}
```

```java
// EvaluationDecisionQueryService
public List<EvaluationDecision> findByCriteria(EvaluationDecisionCriteria criteria) {
  final Specification<EvaluationDecision> specification = createSpecification(criteria);
  List<EvaluationDecision> decisions = evaluationDecisionRepository.findAll(specification);
  decisions.forEach(this::initializeDisplayNameRelationships);
  return decisions;
}
```

Repository contract classes used by this flow:
- `src/main/java/com/atharsense/lr/repository/LifeEvaluationRepository.java`
- `src/main/java/com/atharsense/lr/repository/EvaluationDecisionRepository.java`

## 5) Frontend fetch window (last 30 days)
Homepage only requests recent evaluations, then loads related decisions.

```typescript
// home.component.ts
this.lifeEvaluationService.query({
  size: 100,
  sort: ['evaluationDate,desc', 'id,desc'],
  'evaluationDate.greaterThanOrEqual': this.getLast30DaysStartDate(),
});

this.evaluationDecisionService.query({
  'lifeEvaluationId.in': evaluationIds.join(','),
  size: 500,
  eagerload: true,
});
```

## 6) Date normalization + Riyadh day bucketing
API dates are converted to Dayjs in entity services, then grouped by `Asia/Riyadh` day key.

```typescript
// life-evaluation.service.ts
protected convertDateFromServer(rest: RestLifeEvaluation): ILifeEvaluation {
  return { ...rest, evaluationDate: rest.evaluationDate ? dayjs(rest.evaluationDate) : undefined };
}
```

```typescript
// home.component.ts
const dayKey = this.toRiyadhDateKey(evaluation.evaluationDate!.toDate());
bucket.sum += score;
bucket.count += 1;
```

`getEvaluationDailyAverageMatrix()` then emits 30 cells with `{ label, average, count }`.

## 7) UI rendering path
Calendar heatmap renders from `getEvaluationDailyAverageMatrix()`.

```html
<div class="score-matrix-grid" [attr.dir]="isArabicLang() ? 'rtl' : 'ltr'">
  @for (dayAverage of getEvaluationDailyAverageMatrix(); track dayAverage.dateKey) {
    <div class="score-matrix-cell" [ngClass]="getEvaluationMatrixCellClass(dayAverage.average)">
      <span class="score-matrix-date">{{ dayAverage.label }}</span>
      @if (dayAverage.average !== null) {
        <strong class="score-matrix-value">{{ dayAverage.average | number: '1.1-1' }}</strong>
      }
    </div>
  }
</div>
```

Evaluation cards + nested decisions render from `getGroupedLifeEvaluations()` + `getEvaluationDecisions(evaluation.id)` in the right column panel.

## 8) Performance evaluation (thousands of users)
- Current design scales reasonably because all homepage queries are owner-scoped (`ownerId = currentUserExtendedId`), so each request touches one tenant slice, not global data.
- Main risk is missing DB indexes for frequent predicates: `life_evaluation(owner_id, evaluation_date)` and `evaluation_decision(owner_id, life_evaluation_id, date)`.
- `lifeEvaluationId.in` can become heavy if a user has many evaluations; practical mitigation is batching IDs (e.g., chunks of 100-200) or loading decisions per page.
- Keep `size` bounded and prefer pageable decisions API if per-user datasets grow significantly.
- With proper indexes + bounded page sizes, this pattern remains stable for thousands of concurrent users; without indexes, latency will degrade quickly under peak reads.

