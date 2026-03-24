import { Component, NgZone, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, filter, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs/esm';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { FormsModule } from '@angular/forms';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'app/core/util/alert.service';
import { IEvaluationDecision } from '../evaluation-decision.model';
import { ISubPillarItemTranslation } from 'app/entities/sub-pillar-item-translation/sub-pillar-item-translation.model';
import { ISubPillarTranslation } from 'app/entities/sub-pillar-translation/sub-pillar-translation.model';
import { EntityArrayResponseType, EvaluationDecisionService } from '../service/evaluation-decision.service';
import { EvaluationDecisionDeleteDialogComponent } from '../delete/evaluation-decision-delete-dialog.component';
import { ConfirmationModalComponent } from 'app/home/confirmation-modal.component';
import { ITickTickProjectModalResult, TickTickProjectModalComponent } from './ticktick-project-modal.component';

@Component({
  selector: 'jhi-evaluation-decision',
  templateUrl: './evaluation-decision.component.html',
  imports: [RouterModule, FormsModule, SharedModule, SortDirective, SortByDirective, FormatMediumDatetimePipe],
})
export class EvaluationDecisionComponent implements OnInit {
  subscription: Subscription | null = null;
  evaluationDecisions = signal<IEvaluationDecision[]>([]);
  isLoading = false;
  isActionItemsPage = false;
  readonly riyadhTimeZone = 'Asia/Riyadh';
  readonly integrationProviders = [
    { code: 'ticktick', labelKey: 'liferadarApp.evaluationDecision.integrations.ticktick', style: 'btn-outline-primary' },
    { code: 'microsoft-todo', labelKey: 'liferadarApp.evaluationDecision.integrations.microsoftTodo', style: 'btn-outline-info' },
    { code: 'todoist', labelKey: 'liferadarApp.evaluationDecision.integrations.todoist', style: 'btn-outline-secondary' },
  ];

  private integrationPushingKeys = new Set<string>();

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

    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.load()),
      )
      .subscribe();
  }

  delete(evaluationDecision: IEvaluationDecision): void {
    const modalRef = this.modalService.open(EvaluationDecisionDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.evaluationDecision = evaluationDecision;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        tap(() => this.load()),
      )
      .subscribe();
  }

  load(): void {
    this.queryBackend().subscribe({
      next: (res: EntityArrayResponseType) => {
        this.onResponseSuccess(res);
      },
    });
  }

  navigateToWithComponentValues(event: SortState): void {
    this.handleNavigation(event);
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
      ...rows.map(row => `<tr><td>${row[0]}</td><td>${row[1]}</td></tr>`),
      '</tbody>',
      '</table>',
    ].join('');

    const blob = new Blob([`\ufeff${htmlTable}`], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'action-items.xls';
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
    modalRef.componentInstance.confirmButtonText = this.translateService.instant('liferadarApp.evaluationDecision.integrations.comingSoonButton');
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

    this.evaluationDecisionService.getTickTickProjects().subscribe({
      next: res => {
        this.integrationPushingKeys.delete(key);
        const projects = res.body ?? [];

        const modalRef = this.modalService.open(TickTickProjectModalComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.projects = projects;
        modalRef.componentInstance.initialTitle = (evaluationDecision.decision ?? '').trim();

        modalRef.closed
          .pipe(
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
      error: (error: any) => {
        this.integrationPushingKeys.delete(key);
        // Display specific error message from backend if available
        const errorMessage = error?.error?.message || error?.message || 'Failed to load TickTick projects';
        this.alertService.addAlert({
          type: 'danger',
          message: errorMessage,
        });
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
      .subscribe({
      next: res => {
        this.integrationPushingKeys.delete(key);
        this.alertService.addAlert({
          type: 'success',
          message: res.body?.message ?? this.translateService.instant('liferadarApp.evaluationDecision.integrations.pushSuccess'),
        });
      },
      error: (error: any) => {
        this.integrationPushingKeys.delete(key);
        // Display specific error message from backend if available
        const errorMessage = error?.error?.message || error?.message || this.translateService.instant('liferadarApp.evaluationDecision.integrations.pushError');
        this.alertService.addAlert({
          type: 'danger',
          message: errorMessage,
        });
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

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.evaluationDecisions.set(this.refineData(dataFromBody));
  }

  protected refineData(data: IEvaluationDecision[]): IEvaluationDecision[] {
    const { predicate, order } = this.sortState();
    return predicate && order ? data.sort(this.sortService.startSort({ predicate, order })) : data;
  }

  protected fillComponentAttributesFromResponseBody(data: IEvaluationDecision[] | null): IEvaluationDecision[] {
    return data ?? [];
  }

  protected queryBackend(): Observable<EntityArrayResponseType> {
    this.isLoading = true;
    const queryObject: any = {
      sort: this.sortService.buildSortParam(this.sortState()),
    };
    return this.evaluationDecisionService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

  protected handleNavigation(sortState: SortState): void {
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

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

}
