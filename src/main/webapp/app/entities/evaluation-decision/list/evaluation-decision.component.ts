import { HttpHeaders } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, NgZone, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, combineLatest, filter, finalize, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs/esm';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { FormsModule } from '@angular/forms';
import { TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'app/core/util/alert.service';
import { IEvaluationDecision } from '../evaluation-decision.model';
import { ISubPillarItemTranslation } from 'app/entities/sub-pillar-item-translation/sub-pillar-item-translation.model';
import { ISubPillarTranslation } from 'app/entities/sub-pillar-translation/sub-pillar-translation.model';
import { EntityArrayResponseType, EvaluationDecisionService, ITodoAppUserConfig } from '../service/evaluation-decision.service';
import { EvaluationDecisionDeleteDialogComponent } from '../delete/evaluation-decision-delete-dialog.component';
import { ConfirmationModalComponent } from 'app/home/confirmation-modal.component';
import { ITickTickProjectModalResult, TickTickProjectModalComponent } from './ticktick-project-modal.component';
import { EvaluationDecisionCreateModalComponent } from 'app/home/evaluation-decision-create-modal.component';

type DecisionListViewMode = 'cards' | 'table';

interface DecisionSortOption {
  predicate: string;
  labelKey: string;
}

@Component({
  selector: 'jhi-evaluation-decision',
  templateUrl: './evaluation-decision.component.html',
  styleUrl: './evaluation-decision.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, FormsModule, SharedModule, SortDirective, SortByDirective, FormatMediumDatetimePipe],
})
export class EvaluationDecisionComponent implements OnInit {
  evaluationDecisions = signal<IEvaluationDecision[]>([]);
  isLoading = signal(false);
  isActionItemsPage = false;
  totalItems = signal(0);
  page = 1;
  viewMode = signal<DecisionListViewMode>(this.restoreViewMode());
  readonly riyadhTimeZone = 'Asia/Riyadh';
  itemsPerPage = 10;
  readonly integrationProviders = [
    { code: 'ticktick', labelKey: 'liferadarApp.evaluationDecision.integrations.ticktick', style: 'btn-outline-primary' },
    { code: 'microsoft-todo', labelKey: 'liferadarApp.evaluationDecision.integrations.microsoftTodo', style: 'btn-outline-info' },
    { code: 'todoist', labelKey: 'liferadarApp.evaluationDecision.integrations.todoist', style: 'btn-outline-secondary' },
  ];
  enabledIntegrationProviders = signal(this.integrationProviders);
  readonly actionItemsWindowDays = 7;
  readonly loadedCount = computed(() => this.evaluationDecisions().length);
  readonly isTotalCountKnown = signal(false);
  readonly lastFetchedCount = signal(0);
  readonly effectiveTotal = computed(() => Math.max(this.totalItems(), this.loadedCount()));
  readonly hasMore = computed(() =>
    this.isTotalCountKnown() ? this.loadedCount() < this.totalItems() : this.lastFetchedCount() >= this.itemsPerPage,
  );
  readonly actionItemSortOptions: readonly DecisionSortOption[] = [
    { predicate: 'decision', labelKey: 'liferadarApp.evaluationDecision.decision' },
    { predicate: 'date', labelKey: 'liferadarApp.evaluationDecision.date' },
    { predicate: 'lifeEvaluation.evaluationDate', labelKey: 'liferadarApp.evaluationDecision.creationDate' },
  ];
  readonly evaluationDecisionSortOptions: readonly DecisionSortOption[] = [
    { predicate: 'decision', labelKey: 'liferadarApp.evaluationDecision.decision' },
    { predicate: 'date', labelKey: 'liferadarApp.evaluationDecision.date' },
    { predicate: 'lifeEvaluation.id', labelKey: 'liferadarApp.evaluationDecision.lifeEvaluation' },
  ];

  private integrationPushingKeys = new Set<string>();
  private readonly viewStorageKey = 'liferadar.evaluation-decision.view-mode';
  private readonly destroyRef = inject(DestroyRef);

  sortState = sortStateSignal({});

  public readonly router = inject(Router);
  protected readonly evaluationDecisionService = inject(EvaluationDecisionService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected readonly translateService = inject(TranslateService);
  protected readonly alertService = inject(AlertService);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);

  trackId = (item: IEvaluationDecision): number => this.evaluationDecisionService.getEvaluationDecisionIdentifier(item);

  ngOnInit(): void {
    this.isActionItemsPage = this.activatedRoute.snapshot.data['actionItems'] === true;

    if (this.isActionItemsPage) {
      this.loadEnabledIntegrations();
    }

    combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.loadFromRoute()),
      )
      .subscribe();
  }

  private loadEnabledIntegrations(): void {
    this.evaluationDecisionService
      .getTodoAppConfigs()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const configs: ITodoAppUserConfig[] = response.body ?? [];
          const enabledCodes = new Set(configs.filter(config => config.enabled).map(config => config.provider));
          this.enabledIntegrationProviders.set(this.integrationProviders.filter(provider => enabledCodes.has(provider.code)));
        },
        error: () => {
          this.enabledIntegrationProviders.set([]);
        },
      });
  }

  delete(evaluationDecision: IEvaluationDecision): void {
    const modalRef = this.modalService.open(EvaluationDecisionDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.evaluationDecision = evaluationDecision;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(reason => reason === ITEM_DELETED_EVENT),
        tap(() => this.refresh()),
      )
      .subscribe();
  }

  refresh(): void {
    this.page = 1;
    this.loadFromRoute();
  }

  navigateToWithComponentValues(event: SortState): void {
    this.handleNavigation(1, event);
  }

  loadMore(): void {
    if (!this.hasMore() || this.isLoading()) {
      return;
    }

    this.fetchPage(this.page + 1, true);
  }

  sortOptions(): readonly DecisionSortOption[] {
    return this.isActionItemsPage ? this.actionItemSortOptions : this.evaluationDecisionSortOptions;
  }

  changeSort(predicate: string): void {
    const current = this.sortState();
    const nextState: SortState = {
      predicate,
      order: current.predicate === predicate && current.order === 'asc' ? 'desc' : 'asc',
    };

    this.handleNavigation(1, nextState);
  }

  isCurrentSort(predicate: string): boolean {
    return this.sortState().predicate === predicate;
  }

  currentSortIcon(predicate: string): 'sort' | 'sort-up' | 'sort-down' {
    if (!this.isCurrentSort(predicate)) {
      return 'sort';
    }

    return this.sortState().order === 'desc' ? 'sort-down' : 'sort-up';
  }

  setViewMode(mode: DecisionListViewMode): void {
    this.viewMode.set(mode);
    this.persistViewMode(mode);
  }

  getDecisionTitle(evaluationDecision: IEvaluationDecision): string {
    return evaluationDecision.decision?.trim() || `#${evaluationDecision.id}`;
  }

  getCurrentSortLabelKey(): string {
    return (
      this.sortOptions().find(option => option.predicate === this.sortState().predicate)?.labelKey ??
      'liferadarApp.evaluationDecision.decision'
    );
  }

  currentSortDirectionLabelKey(): string {
    return this.sortState().order === 'desc'
      ? 'liferadarApp.evaluationDecision.home.sortDescending'
      : 'liferadarApp.evaluationDecision.home.sortAscending';
  }

  load(): void {
    this.loadFromRoute();
  }

  private fetchPage(pageToLoad: number, append: boolean): void {
    this.isLoading.set(true);
    this.queryBackend(pageToLoad)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: response => {
          const incoming = this.fillComponentAttributesFromResponseBody(response.body);
          this.lastFetchedCount.set(incoming.length);
          this.fillComponentAttributesFromResponseHeader(response.headers, append ? this.loadedCount() + incoming.length : incoming.length);

          if (append) {
            this.evaluationDecisions.update(existing => this.refineData(this.mergeEvaluationDecisions(existing, incoming)));
          } else {
            this.evaluationDecisions.set(this.refineData(incoming));
          }

          this.page = pageToLoad;
        },
      });
  }

  exportToExcel(): void {
    const headerDecision = this.translateService.instant('liferadarApp.evaluationDecision.decision');
    const headerLifeEvaluation = this.translateService.instant('liferadarApp.evaluationDecision.lifeEvaluation');
    const headerSubPillar = this.translateService.instant('liferadarApp.evaluationDecision.subPillar');
    const rows = this.evaluationDecisions().map(evaluationDecision => [
      this.escapeHtml(evaluationDecision.decision ?? ''),
      this.escapeHtml(this.getLifeEvaluationDisplayName(evaluationDecision)),
      this.escapeHtml(this.getSubPillarDisplayName(evaluationDecision)),
    ]);

    const htmlTable = [
      '<table>',
      '<thead><tr>',
      `<th>${this.escapeHtml(headerDecision)}</th>`,
      `<th>${this.escapeHtml(headerLifeEvaluation)}</th>`,
      `<th>${this.escapeHtml(headerSubPillar)}</th>`,
      '</tr></thead>',
      '<tbody>',
      ...rows.map(row => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td></tr>`),
      '</tbody>',
      '</table>',
    ].join('');

    const blob = new Blob([`\ufeff${htmlTable}`], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = this.isActionItemsPage ? 'decisions.xls' : 'evaluation-decisions.xls';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  pushToIntegration(evaluationDecision: IEvaluationDecision, provider: string): void {
    if (!evaluationDecision.id) {
      return;
    }

    if (this.isDueDatePast(evaluationDecision)) {
      return;
    }

    if (provider === 'ticktick') {
      this.openTickTickProjectModal(evaluationDecision);
      return;
    }

    if (provider === 'microsoft-todo' || provider === 'todoist') {
      this.openComingSoonModal(provider);
      return;
    }

    const providerLabel = this.translateService.instant(this.getIntegrationProviderLabelKey(provider));
    const modalRef = this.modalService.open(ConfirmationModalComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.title = this.translateService.instant('liferadarApp.evaluationDecision.integrations.confirmTitle', {
      provider: providerLabel,
    });
    modalRef.componentInstance.message = this.translateService.instant('liferadarApp.evaluationDecision.integrations.confirmMessage', {
      provider: providerLabel,
      actionItem: evaluationDecision.decision ?? '-',
    });
    modalRef.componentInstance.confirmButtonText = this.translateService.instant(
      'liferadarApp.evaluationDecision.integrations.confirmButton',
      {
        provider: providerLabel,
      },
    );
    modalRef.componentInstance.cancelButtonText = this.translateService.instant('entity.action.cancel');
    modalRef.componentInstance.confirmButtonClass = 'btn-primary';

    modalRef.closed
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(reason => reason === 'confirmed'),
        tap(() => this.executeIntegrationPush(evaluationDecision, provider)),
      )
      .subscribe();
  }

  private openComingSoonModal(provider: string): void {
    const providerLabel = this.translateService.instant(this.getIntegrationProviderLabelKey(provider));
    const modalRef = this.modalService.open(ConfirmationModalComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.title = this.translateService.instant('liferadarApp.evaluationDecision.integrations.comingSoonTitle', {
      provider: providerLabel,
    });
    modalRef.componentInstance.message = this.translateService.instant('liferadarApp.evaluationDecision.integrations.comingSoonMessage');
    modalRef.componentInstance.confirmButtonText = this.translateService.instant(
      'liferadarApp.evaluationDecision.integrations.comingSoonButton',
    );
    modalRef.componentInstance.cancelButtonText = this.translateService.instant('entity.action.cancel');
    modalRef.componentInstance.confirmButtonClass = 'btn-primary';
  }

  private openTickTickProjectModal(evaluationDecision: IEvaluationDecision): void {
    if (!evaluationDecision.id) {
      return;
    }

    const provider = 'ticktick';
    const key = `${evaluationDecision.id}:${provider}`;
    this.integrationPushingKeys.add(key);

    this.evaluationDecisionService
      .getTickTickProjects()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.integrationPushingKeys.delete(key);
          const projectsResponse = res.body;
          const projects = projectsResponse?.projects ?? [];
          const defaultProjectName = (projectsResponse?.defaultProjectName ?? 'Liferadar').trim() || 'Liferadar';

          const modalRef = this.modalService.open(TickTickProjectModalComponent, { size: 'lg', backdrop: 'static' });
          modalRef.componentInstance.projects = projects;
          modalRef.componentInstance.initialTitle = (evaluationDecision.decision ?? '').trim();
          modalRef.componentInstance.defaultProjectName = defaultProjectName;

          modalRef.closed
            .pipe(
              takeUntilDestroyed(this.destroyRef),
              filter((value): value is ITickTickProjectModalResult => typeof value === 'object' && value !== null && 'title' in value),
              tap(value =>
                this.executeIntegrationPush(evaluationDecision, provider, {
                  projectId: value.projectId,
                  title: value.title,
                }),
              ),
            )
            .subscribe();
        },
        error: () => {
          this.integrationPushingKeys.delete(key);
          // The global ErrorHandlerInterceptor broadcasts the HTTP error, which AlertErrorComponent handles.
        },
      });
  }

  private executeIntegrationPush(
    evaluationDecision: IEvaluationDecision,
    provider: string,
    overrides?: { projectId?: string; title?: string },
  ): void {
    if (!evaluationDecision.id) {
      return;
    }

    const key = `${evaluationDecision.id}:${provider}`;
    this.integrationPushingKeys.add(key);

    this.evaluationDecisionService
      .pushToTodoApp({
        decisionId: evaluationDecision.id,
        provider,
        projectId: overrides?.projectId,
        title: overrides?.title,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.integrationPushingKeys.delete(key);
          this.alertService.addAlert({
            type: 'success',
            message: res.body?.message ?? this.translateService.instant('liferadarApp.evaluationDecision.integrations.pushSuccess'),
          });
        },
        error: () => {
          this.integrationPushingKeys.delete(key);
          // The global ErrorHandlerInterceptor broadcasts the HTTP error, which AlertErrorComponent handles.
        },
      });
  }

  private getIntegrationProviderLabelKey(provider: string): string {
    return this.integrationProviders.find(item => item.code === provider)?.labelKey ?? 'liferadarApp.evaluationDecision.integrations.title';
  }

  isIntegrationPushing(evaluationDecision: IEvaluationDecision, provider: string): boolean {
    if (!evaluationDecision.id) {
      return false;
    }
    return this.integrationPushingKeys.has(`${evaluationDecision.id}:${provider}`);
  }

  isDueDatePast(evaluationDecision: IEvaluationDecision): boolean {
    const dueDate = evaluationDecision.date;
    return !!dueDate && dueDate.isBefore(dayjs());
  }

  isIntegrationDisabled(evaluationDecision: IEvaluationDecision, provider: string): boolean {
    return this.isIntegrationPushing(evaluationDecision, provider) || this.isDueDatePast(evaluationDecision);
  }

  getLifeEvaluationDisplayName(evaluationDecision: IEvaluationDecision): string {
    const subPillarItem = evaluationDecision.lifeEvaluation?.subPillarItem;
    const translationName = this.getSubPillarItemTranslationName(subPillarItem?.translations ?? null);
    return translationName ?? subPillarItem?.code ?? String(evaluationDecision.lifeEvaluation?.id ?? '');
  }

  getSubPillarDisplayName(evaluationDecision: IEvaluationDecision): string {
    const subPillar = evaluationDecision.lifeEvaluation?.subPillarItem?.subPillar;
    const translationName = this.getSubPillarTranslationName(subPillar?.translations ?? null);
    return translationName ?? subPillar?.code ?? '';
  }

  getExpenseDisplayName(evaluationDecision: IEvaluationDecision): string {
    if (!evaluationDecision.expense) {
      return '-';
    }
    return evaluationDecision.expense.serviceName?.trim() || `#${evaluationDecision.expense.id}`;
  }

  getLifeEvaluationCreationDate(evaluationDecision: IEvaluationDecision): Date | null {
    const rawValue = evaluationDecision.lifeEvaluation?.evaluationDate as unknown;

    if (!rawValue) {
      return null;
    }

    if (dayjs.isDayjs(rawValue)) {
      return rawValue.toDate();
    }

    if (rawValue instanceof Date) {
      return rawValue;
    }

    if (typeof rawValue === 'string' || typeof rawValue === 'number') {
      const parsedDate = new Date(rawValue);
      return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    }

    if (typeof rawValue === 'object' && rawValue !== null && 'toDate' in rawValue) {
      const candidate = (rawValue as { toDate?: () => Date }).toDate;
      if (typeof candidate === 'function') {
        return candidate.call(rawValue);
      }
    }

    return null;
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    this.page = 1;
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  protected fillComponentAttributesFromResponseBody(data: IEvaluationDecision[] | null): IEvaluationDecision[] {
    return data ?? [];
  }

  protected fillComponentAttributesFromResponseHeader(headers: HttpHeaders, fallbackCount = 0): void {
    const totalItemsHeader = headers.get(TOTAL_COUNT_RESPONSE_HEADER);
    const totalItems = Number(totalItemsHeader);

    if (totalItemsHeader !== null && Number.isFinite(totalItems) && totalItems >= 0) {
      this.isTotalCountKnown.set(true);
      this.totalItems.set(totalItems);
      return;
    }

    this.isTotalCountKnown.set(false);
    this.totalItems.set(fallbackCount);
  }

  protected queryBackend(pageToLoad: number): Observable<EntityArrayResponseType> {
    const queryObject: any = {
      page: pageToLoad - 1,
      size: this.itemsPerPage,
      sort: this.sortService.buildSortParam(this.sortState(), 'id'),
    };

    if (this.isActionItemsPage) {
      queryObject['date.greaterThanOrEqual'] = this.getActionItemsStartDate();
    }

    return this.evaluationDecisionService.query(queryObject);
  }

  protected refineData(data: IEvaluationDecision[]): IEvaluationDecision[] {
    const { predicate, order } = this.sortState();
    if (!predicate || !order) {
      return data;
    }

    return [...data].sort(this.sortService.startSort({ predicate, order }, { predicate: 'id', order: 'asc' }));
  }

  private getActionItemsStartDate(): string {
    return dayjs().subtract(this.actionItemsWindowDays, 'day').startOf('day').toISOString();
  }

  protected handleNavigation(_: number, sortState: SortState): void {
    const queryParamsObj = {
      sort: this.sortService.buildSortParam(sortState),
    };

    this.ngZone.run(() => {
      this.router.navigate(['./'], {
        relativeTo: this.activatedRoute,
        queryParams: queryParamsObj,
      });
    });
  }

  private getSubPillarItemTranslationName(translations: ISubPillarItemTranslation[] | null): string | null {
    if (!translations || translations.length === 0) {
      return null;
    }

    const translation =
      this.findBestLanguageMatch(translations, t => t.lang) ??
      translations.find(t => t.lang?.toLowerCase() === 'en') ??
      translations[0] ??
      null;

    return translation?.name ?? null;
  }

  private getSubPillarTranslationName(translations: ISubPillarTranslation[] | null): string | null {
    if (!translations || translations.length === 0) {
      return null;
    }

    const translation =
      this.findBestLanguageMatch(translations, t => t.lang) ??
      translations.find(t => t.lang?.toLowerCase() === 'en') ??
      translations[0] ??
      null;

    return translation?.name ?? null;
  }

  private escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  private loadFromRoute(): void {
    this.fetchPage(1, false);
  }

  private mergeEvaluationDecisions(existing: IEvaluationDecision[], incoming: IEvaluationDecision[]): IEvaluationDecision[] {
    const seen = new Set(existing.map(item => item.id));
    const merged = [...existing];

    for (const item of incoming) {
      if (!seen.has(item.id)) {
        merged.push(item);
        seen.add(item.id);
      }
    }

    return merged;
  }

  private restoreViewMode(): DecisionListViewMode {
    if (typeof window === 'undefined') {
      return 'cards';
    }

    try {
      return window.localStorage.getItem(this.viewStorageKey) === 'table' ? 'table' : 'cards';
    } catch {
      return 'cards';
    }
  }

  private persistViewMode(mode: DecisionListViewMode): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(this.viewStorageKey, mode);
    } catch {
      // Ignore storage access issues and keep the in-memory preference.
    }
  }

  private findBestLanguageMatch<T>(items: T[], getLang: (item: T) => string | undefined | null): T | null {
    const current = (this.translateService.currentLang ?? 'en').toLowerCase();
    const candidates = new Set<string>([
      current,
      current.replace('_', '-'),
      current.replace('-', '_'),
      current.split('-')[0],
      current.split('_')[0],
    ]);

    for (const candidate of candidates) {
      if (!candidate) {
        continue;
      }

      const exact = items.find(item => getLang(item)?.toLowerCase() === candidate);
      if (exact) {
        return exact;
      }
    }

    return null;
  }

  openActionItemCreateModal(): void {
    const modalRef = this.modalService.open(EvaluationDecisionCreateModalComponent, {
      size: 'lg',
      backdrop: 'static',
      windowClass: 'compact-entity-modal',
    });
    modalRef.closed
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(reason => reason === 'saved'),
        tap(() => this.refresh()),
      )
      .subscribe();
  }

  openEditModal(evaluationDecision: IEvaluationDecision): void {
    const modalRef = this.modalService.open(EvaluationDecisionCreateModalComponent, {
      size: 'lg',
      backdrop: 'static',
      windowClass: 'compact-entity-modal',
    });
    modalRef.componentInstance.evaluationDecision = evaluationDecision;
    modalRef.componentInstance.modalTitle = this.translateService.instant('liferadarApp.evaluationDecision.home.createOrEditLabel');
    modalRef.closed
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(reason => reason === 'saved'),
        tap(() => this.refresh()),
      )
      .subscribe();
  }
}
