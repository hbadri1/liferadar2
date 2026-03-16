import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { IPillar } from 'app/entities/pillar/pillar.model';
import { PillarService } from 'app/entities/pillar/service/pillar.service';
import { IPillarTranslation } from 'app/entities/pillar-translation/pillar-translation.model';
import { ISubPillar } from 'app/entities/sub-pillar/sub-pillar.model';
import { SubPillarService } from 'app/entities/sub-pillar/service/sub-pillar.service';
import { ISubPillarTranslation } from 'app/entities/sub-pillar-translation/sub-pillar-translation.model';
import { ISubPillarItem } from 'app/entities/sub-pillar-item/sub-pillar-item.model';
import { SubPillarItemService } from 'app/entities/sub-pillar-item/service/sub-pillar-item.service';
import { ISubPillarItemTranslation } from 'app/entities/sub-pillar-item-translation/sub-pillar-item-translation.model';
import { PillarCreateModalComponent } from './pillar-create-modal.component';
import { SubPillarCreateModalComponent } from './sub-pillar-create-modal.component';
import { SubPillarItemCreateModalComponent } from './sub-pillar-item-create-modal.component';
import { PillarEditModalComponent } from './pillar-edit-modal.component';
import { SubPillarEditModalComponent } from './sub-pillar-edit-modal.component';
import { SubPillarItemEditModalComponent } from './sub-pillar-item-edit-modal.component';
import { LifeEvaluationCreateModalComponent } from './life-evaluation-create-modal.component';
import { ILifeEvaluation } from 'app/entities/life-evaluation/life-evaluation.model';
import { LifeEvaluationService } from 'app/entities/life-evaluation/service/life-evaluation.service';
import { IEvaluationDecision } from 'app/entities/evaluation-decision/evaluation-decision.model';
import { EvaluationDecisionService } from 'app/entities/evaluation-decision/service/evaluation-decision.service';
import { EvaluationDecisionCreateModalComponent } from './evaluation-decision-create-modal.component';
import { ConfirmationModalComponent } from './confirmation-modal.component';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [SharedModule, RouterModule],
})
export default class HomeComponent implements OnInit, OnDestroy {
  account = signal<Account | null>(null);
  pillars = signal<IPillar[]>([]);
  subPillarsMap = signal<Map<number, ISubPillar[]>>(new Map());
  loadingSubPillars = signal<Set<number>>(new Set());
  subPillarItemsMap = signal<Map<number, ISubPillarItem[]>>(new Map());
  loadingSubPillarItems = signal<Set<number>>(new Set());
  isLoading = signal<boolean>(false);
  lifeEvaluations = signal<ILifeEvaluation[]>([]);
  evaluationDecisionsMap = signal<Map<number, IEvaluationDecision[]>>(new Map());
  isLoadingEvaluations = signal<boolean>(false);
  readonly riyadhTimeZone = 'Asia/Riyadh';

  private readonly destroy$ = new Subject<void>();

  private readonly accountService = inject(AccountService);
  private readonly pillarService = inject(PillarService);
  private readonly subPillarService = inject(SubPillarService);
  private readonly subPillarItemService = inject(SubPillarItemService);
  private readonly lifeEvaluationService = inject(LifeEvaluationService);
  private readonly evaluationDecisionService = inject(EvaluationDecisionService);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly modalService = inject(NgbModal);

  ngOnInit(): void {
    console.log('Home component initialized');
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => {
        console.log('Account loaded:', account);
        this.account.set(account);
        if (account) {
          console.log('Loading pillars for authenticated user');
          this.loadPillars();
          this.loadLifeEvaluations();
        } else {
          console.log('No account found - user not authenticated');
        }
      });

    // Listen for language changes and refresh translations
    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('Language changed, refreshing all data with new translations');
        // Clear cached data and reload everything with new language
        this.subPillarsMap.set(new Map());
        this.subPillarItemsMap.set(new Map());
        this.evaluationDecisionsMap.set(new Map());
        // Reload all data with current language
        this.loadPillars();
        this.loadLifeEvaluations();
      });
  }

  loadPillars(): void {
    this.isLoading.set(true);
    console.log('Loading pillars for current user...');
    this.pillarService
      .query({ size: 100, eagerload: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: HttpResponse<IPillar[]>) => {
          console.log('Pillars loaded:', res.body);
          this.pillars.set(res.body ?? []);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading pillars:', error);
          this.isLoading.set(false);
        },
      });
  }

  togglePillarDetails(pillarId: number): void {
    // Method kept for backward compatibility but no longer used
  }

  isPillarExpanded(pillarId: number): boolean {
    // Method kept for backward compatibility but no longer used
    return false;
  }

  getTranslation(pillar: IPillar): IPillarTranslation | null {
    if (!pillar.translations || pillar.translations.length === 0) {
      return null;
    }

    const currentLang = this.getNormalizedLanguageKey();

    // Try to find translation for current language
    let translation: IPillarTranslation | null =
      pillar.translations.find(t => t.lang?.toLowerCase() === currentLang) ?? null;

    // Fallback to English if current language not found
    translation ??= pillar.translations.find(t => t.lang?.toLowerCase() === 'en') ?? null;

    // Fallback to first available translation
    translation ??= pillar.translations[0] ?? null;

    return translation;
  }

  createNewPillar(): void {
    const modalRef = this.modalService.open(PillarCreateModalComponent, {
      size: 'lg',
      backdrop: 'static',
      windowClass: 'compact-entity-modal',
    });
    modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result === 'saved') {
        this.loadPillars();
      }
    });
  }

  loadSuggestedPillars(): void {
    const i18nBase = 'liferadarApp.pillar.home.suggested';
    const modalRef = this.modalService.open(ConfirmationModalComponent, { centered: true, backdrop: 'static' });
    modalRef.componentInstance.title = this.translateService.instant(`${i18nBase}.title`);
    modalRef.componentInstance.message = this.translateService.instant(`${i18nBase}.message`);
    modalRef.componentInstance.confirmButtonText = this.translateService.instant(`${i18nBase}.confirmButton`);
    modalRef.componentInstance.confirmButtonClass = 'btn-info';

    modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result !== 'confirmed') {
        return;
      }

      this.isLoading.set(true);
      this.pillarService.loadSuggested().pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.loadPillars();
        },
        error: error => {
          console.error('Error loading suggested pillars:', error);
          this.isLoading.set(false);
        },
      });
    });
  }

  createSubPillar(pillarId: number): void {
    const modalRef = this.modalService.open(SubPillarCreateModalComponent, {
      size: 'lg',
      backdrop: 'static',
      windowClass: 'compact-entity-modal',
    });
    modalRef.componentInstance.pillarId = pillarId;
    modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result === 'saved') {
        this.viewSubPillars(pillarId);
      }
    });
  }

  createSubPillarItem(subPillarId: number): void {
    const modalRef = this.modalService.open(SubPillarItemCreateModalComponent, {
      size: 'lg',
      backdrop: 'static',
      windowClass: 'compact-entity-modal',
    });
    modalRef.componentInstance.subPillarId = subPillarId;
    modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result === 'saved') {
        this.viewSubPillarItems(subPillarId);
      }
    });
  }

  viewSubPillarItems(subPillarId: number): void {
    const currentMap = new Map(this.subPillarItemsMap());

    if (currentMap.has(subPillarId)) {
      currentMap.delete(subPillarId);
      this.subPillarItemsMap.set(currentMap);
      return;
    }

    const loadingItemsSet = new Set(this.loadingSubPillarItems());
    loadingItemsSet.add(subPillarId);
    this.loadingSubPillarItems.set(loadingItemsSet);

    this.subPillarItemService
      .query({ 'subPillarId.equals': subPillarId, eagerload: true, size: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: HttpResponse<ISubPillarItem[]>) => {
          const items = res.body ?? [];
          currentMap.set(subPillarId, items);
          this.subPillarItemsMap.set(currentMap);

          const updatedLoadingSet = new Set(this.loadingSubPillarItems());
          updatedLoadingSet.delete(subPillarId);
          this.loadingSubPillarItems.set(updatedLoadingSet);
        },
        error: () => {
          const updatedLoadingSet = new Set(this.loadingSubPillarItems());
          updatedLoadingSet.delete(subPillarId);
          this.loadingSubPillarItems.set(updatedLoadingSet);
        },
      });
  }

  getSubPillarItems(subPillarId: number): ISubPillarItem[] {
    return this.subPillarItemsMap().get(subPillarId) ?? [];
  }

  isLoadingSubPillarItems(subPillarId: number): boolean {
    return this.loadingSubPillarItems().has(subPillarId);
  }

  hasSubPillarItems(subPillarId: number): boolean {
    return this.subPillarItemsMap().has(subPillarId);
  }

  editPillar(pillarId: number): void {
    // Fetch the pillar with translations eagerly loaded
    this.pillarService
      .find(pillarId, { eagerload: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: HttpResponse<IPillar>) => {
          const pillarWithTranslations = res.body;
          if (pillarWithTranslations) {
            const modalRef = this.modalService.open(PillarEditModalComponent, {
              size: 'lg',
              backdrop: 'static',
              windowClass: 'compact-entity-modal',
            });
            modalRef.componentInstance.pillar = pillarWithTranslations;
            modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
              if (result === 'saved') {
                this.loadPillars();
              }
            });
          }
        },
        error: () => {
          console.error('Failed to load pillar with translations');
        },
      });
  }

  editSubPillar(subPillar: ISubPillar): void {
    if (!subPillar.id) {
      return;
    }

    // Fetch the sub-pillar with translations eagerly loaded
    this.subPillarService
      .find(subPillar.id, { eagerload: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: HttpResponse<ISubPillar>) => {
          const subPillarWithTranslations = res.body;
          if (subPillarWithTranslations) {
            const modalRef = this.modalService.open(SubPillarEditModalComponent, {
              size: 'lg',
              backdrop: 'static',
              windowClass: 'compact-entity-modal',
            });
            modalRef.componentInstance.subPillar = subPillarWithTranslations;
            modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
              if (result === 'saved' && subPillarWithTranslations.pillar?.id) {
                this.viewSubPillars(subPillarWithTranslations.pillar.id);
              }
            });
          }
        },
        error: () => {
          console.error('Failed to load sub-pillar with translations');
        },
      });
  }

  editSubPillarItem(item: ISubPillarItem): void {
    if (!item.id) {
      return;
    }

    // Fetch the item with translations eagerly loaded
    this.subPillarItemService
      .find(item.id, { eagerload: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: HttpResponse<ISubPillarItem>) => {
          const itemWithTranslations = res.body;
          if (itemWithTranslations) {
            const modalRef = this.modalService.open(SubPillarItemEditModalComponent, {
              size: 'lg',
              backdrop: 'static',
              windowClass: 'compact-entity-modal',
            });
            modalRef.componentInstance.subPillarItem = itemWithTranslations;
            modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
              if (result === 'saved' && itemWithTranslations.subPillar?.id) {
                this.viewSubPillarItems(itemWithTranslations.subPillar.id);
              }
            });
          }
        },
        error: () => {
          console.error('Failed to load item with translations');
        },
      });
  }

  createLifeEvaluation(item: ISubPillarItem): void {
    const modalRef = this.modalService.open(LifeEvaluationCreateModalComponent, {
      size: 'md',
      backdrop: 'static',
      windowClass: 'compact-evaluation-modal',
    });
    modalRef.componentInstance.subPillarItem = item;
    modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result === 'saved' && item.subPillar?.id) {
        this.viewSubPillarItems(item.subPillar.id);
      }
    });
  }

  deleteSubPillarItem(item: ISubPillarItem): void {
    const itemName = this.getSubPillarItemTranslation(item) || item.code || 'this item';

    const modalRef = this.modalService.open(ConfirmationModalComponent, { centered: true });
    modalRef.componentInstance.title = 'Delete Item';
    modalRef.componentInstance.message = `Are you sure you want to delete "${itemName}"? This will also delete all associated evaluations and decisions.`;
    modalRef.componentInstance.confirmButtonText = 'Delete';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result === 'confirmed') {
        this.subPillarItemService.delete(item.id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            console.log('Item deleted successfully');
            // Reload items for the parent sub-pillar
            if (item.subPillar?.id) {
              this.viewSubPillarItems(item.subPillar.id);
            }
          },
          error: (error) => {
            console.error('Error deleting item:', error);
          },
        });
      }
    });
  }

  deletePillar(pillar: IPillar): void {
    const translation = this.getTranslation(pillar);
    const pillarName = translation?.name || pillar.code || 'this pillar';

    const modalRef = this.modalService.open(ConfirmationModalComponent, { centered: true });
    modalRef.componentInstance.title = 'Delete Life Pillar';
    modalRef.componentInstance.message = `Are you sure you want to delete "${pillarName}"? This will also delete all associated sub-pillars, items, evaluations, and decisions.`;
    modalRef.componentInstance.confirmButtonText = 'Delete';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result === 'confirmed') {
        this.pillarService.delete(pillar.id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            console.log('Pillar deleted successfully');
            this.loadPillars();
          },
          error: (error) => {
            console.error('Error deleting pillar:', error);
          },
        });
      }
    });
  }

  deleteSubPillar(subPillar: ISubPillar): void {
    const translation = this.getSubPillarTranslation(subPillar);
    const subPillarName = translation?.name || subPillar.code || 'this sub-pillar';

    const modalRef = this.modalService.open(ConfirmationModalComponent, { centered: true });
    modalRef.componentInstance.title = 'Delete Sub-Pillar';
    modalRef.componentInstance.message = `Are you sure you want to delete "${subPillarName}"? This will also delete all associated items, evaluations, and decisions.`;
    modalRef.componentInstance.confirmButtonText = 'Delete';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result === 'confirmed') {
        this.subPillarService.delete(subPillar.id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            console.log('SubPillar deleted successfully');
            // Reload sub-pillars for the parent pillar
            if (subPillar.pillar?.id) {
              this.viewSubPillars(subPillar.pillar.id);
            }
          },
          error: (error) => {
            console.error('Error deleting sub-pillar:', error);
          },
        });
      }
    });
  }

  viewSubPillars(pillarId: number): void {
    // Toggle sub-pillars view
    const currentMap = new Map(this.subPillarsMap());

    if (currentMap.has(pillarId)) {
      // Already loaded, just remove to hide
      currentMap.delete(pillarId);
      this.subPillarsMap.set(currentMap);
    } else {
      // Load sub-pillars
      const loadingPillarsSet = new Set(this.loadingSubPillars());
      loadingPillarsSet.add(pillarId);
      this.loadingSubPillars.set(loadingPillarsSet);

      this.subPillarService
        .query({ 'pillarId.equals': pillarId, size: 100 })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: HttpResponse<ISubPillar[]>) => {
            const subPillars = res.body ?? [];
            currentMap.set(pillarId, subPillars);
            this.subPillarsMap.set(currentMap);

            const updatedLoadingSet = new Set(this.loadingSubPillars());
            updatedLoadingSet.delete(pillarId);
            this.loadingSubPillars.set(updatedLoadingSet);
          },
          error: () => {
            const updatedLoadingSet = new Set(this.loadingSubPillars());
            updatedLoadingSet.delete(pillarId);
            this.loadingSubPillars.set(updatedLoadingSet);
          },
        });
    }
  }

  getSubPillars(pillarId: number): ISubPillar[] {
    return this.subPillarsMap().get(pillarId) ?? [];
  }

  isLoadingSubPillars(pillarId: number): boolean {
    return this.loadingSubPillars().has(pillarId);
  }

  hasSubPillars(pillarId: number): boolean {
    return this.subPillarsMap().has(pillarId);
  }

  getSubPillarTranslation(subPillar: ISubPillar): ISubPillarTranslation | null {
    if (!subPillar.translations || subPillar.translations.length === 0) {
      return null;
    }

    const currentLang = this.getNormalizedLanguageKey();

    // Try to find translation for current language
    let translation: ISubPillarTranslation | null =
      subPillar.translations.find(t => t.lang?.toLowerCase() === currentLang) ?? null;

    // Fallback to English if current language not found
    translation ??= subPillar.translations.find(t => t.lang?.toLowerCase() === 'en') ?? null;

    // Fallback to first available translation
    translation ??= subPillar.translations[0] ?? null;

    return translation;
  }

  getSubPillarItemTranslation(item: ISubPillarItem): string | null {
    return this.getSubPillarItemResolvedTranslation(item)?.name ?? null;
  }

  getSubPillarItemDescription(item: ISubPillarItem): string | null {
    return this.getSubPillarItemResolvedTranslation(item)?.description ?? null;
  }

  private getSubPillarItemResolvedTranslation(item: ISubPillarItem): ISubPillarItemTranslation | null {
    if (!item.translations || item.translations.length === 0) {
      return null;
    }

    const currentLang = this.getNormalizedLanguageKey();

    // Try to find translation for current language
    let translation: ISubPillarItemTranslation | null =
      item.translations.find(t => t.lang?.toLowerCase() === currentLang) ?? null;

    // Fallback to English if current language not found
    translation ??= item.translations.find(t => t.lang?.toLowerCase() === 'en') ?? null;

    // Fallback to first available translation
    translation ??= item.translations[0] ?? null;

    return translation;
  }

  private getNormalizedLanguageKey(): string {
    const lang = (this.translateService.currentLang ?? 'en').toLowerCase();
    // Map locale variants like ar-ly / fr-ca to their base translation code.
    return lang.split('-')[0].split('_')[0] || 'en';
  }

  isArabicLang(): boolean {
    return this.getNormalizedLanguageKey() === 'ar';
  }

  loadLifeEvaluations(): void {
    this.isLoadingEvaluations.set(true);
    console.log('Loading life evaluations for current user...');
    this.lifeEvaluationService
      .query({ size: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: HttpResponse<ILifeEvaluation[]>) => {
          const evaluations = res.body ?? [];
          const itemIds = [
            ...new Set(
              evaluations
                .map(evaluation => evaluation.subPillarItem?.id)
                .filter((id): id is number => id !== undefined && id !== null),
            ),
          ];

          if (itemIds.length === 0) {
            this.lifeEvaluations.set(evaluations);
            this.loadEvaluationDecisionsForEvaluations(evaluations);
            this.isLoadingEvaluations.set(false);
            return;
          }

          this.subPillarItemService
            .query({ 'id.in': itemIds.join(','), eagerload: true, size: itemIds.length })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (itemsRes: HttpResponse<ISubPillarItem[]>) => {
                const detailedItems = itemsRes.body ?? [];
                const itemsById = new Map(detailedItems.map(item => [item.id, item]));

                const enrichedEvaluations = evaluations.map(evaluation => {
                  const itemId = evaluation.subPillarItem?.id;
                  if (!itemId) {
                    return evaluation;
                  }

                  return {
                    ...evaluation,
                    subPillarItem: itemsById.get(itemId) ?? evaluation.subPillarItem,
                  };
                });

                this.lifeEvaluations.set(enrichedEvaluations);
                this.loadEvaluationDecisionsForEvaluations(enrichedEvaluations);
                this.isLoadingEvaluations.set(false);
              },
              error: error => {
                console.error('Error loading evaluation item translations:', error);
                this.lifeEvaluations.set(evaluations);
                this.loadEvaluationDecisionsForEvaluations(evaluations);
                this.isLoadingEvaluations.set(false);
              },
            });
        },
        error: (error) => {
          console.error('Error loading life evaluations:', error);
          this.isLoadingEvaluations.set(false);
        },
      });
  }

  private loadEvaluationDecisionsForEvaluations(evaluations: ILifeEvaluation[]): void {
    const evaluationIds = [
      ...new Set(evaluations.map(evaluation => evaluation.id).filter((id): id is number => id !== undefined && id !== null)),
    ];

    if (evaluationIds.length === 0) {
      this.evaluationDecisionsMap.set(new Map());
      return;
    }

    this.evaluationDecisionService
      .query({ 'lifeEvaluationId.in': evaluationIds.join(','), size: 500, eagerload: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: HttpResponse<IEvaluationDecision[]>) => {
          const decisions = res.body ?? [];
          const grouped = new Map<number, IEvaluationDecision[]>();

          decisions.forEach(decision => {
            const evaluationId = decision.lifeEvaluation?.id;
            if (!evaluationId) {
              return;
            }

            if (!grouped.has(evaluationId)) {
              grouped.set(evaluationId, []);
            }

            grouped.get(evaluationId)?.push(decision);
          });

          grouped.forEach((list, evaluationId) => {
            list.sort((a, b) => {
              const aTime = a.date?.valueOf() ?? 0;
              const bTime = b.date?.valueOf() ?? 0;
              return bTime - aTime;
            });
            grouped.set(evaluationId, list);
          });

          this.evaluationDecisionsMap.set(grouped);
        },
        error: error => {
          console.error('Error loading evaluation decisions:', error);
          this.evaluationDecisionsMap.set(new Map());
        },
      });
  }

  getEvaluationDecisions(evaluationId?: number): IEvaluationDecision[] {
    if (!evaluationId) {
      return [];
    }

    return this.evaluationDecisionsMap().get(evaluationId) ?? [];
  }

  getEvaluationItemName(evaluation: ILifeEvaluation): string {
    const item = evaluation.subPillarItem;
    if (!item) {
      return 'N/A';
    }

    return this.getSubPillarItemTranslation(item) ?? item.code ?? 'N/A';
  }

  getGroupedLifeEvaluations(): Array<{ itemId: string; itemName: string; evaluations: ILifeEvaluation[] }> {
    const grouped = new Map<string, { itemId: string; itemName: string; evaluations: ILifeEvaluation[] }>();

    this.lifeEvaluations().forEach(evaluation => {
      const key = evaluation.subPillarItem?.id ? `${evaluation.subPillarItem.id}` : `unknown-${evaluation.id}`;
      const itemName = this.getEvaluationItemName(evaluation);

      if (!grouped.has(key)) {
        grouped.set(key, { itemId: key, itemName, evaluations: [] });
      }

      grouped.get(key)?.evaluations.push(evaluation);
    });

    const groups = Array.from(grouped.values());

    groups.forEach(group => {
      group.evaluations.sort((a, b) => {
        const aTime = a.evaluationDate?.valueOf() ?? 0;
        const bTime = b.evaluationDate?.valueOf() ?? 0;
        return bTime - aTime;
      });
    });

    return groups.sort((a, b) => a.itemName.localeCompare(b.itemName));
  }

  deleteLifeEvaluation(evaluation: ILifeEvaluation): void {
    if (!evaluation.id) {
      return;
    }

    const modalRef = this.modalService.open(ConfirmationModalComponent, { centered: true });
    modalRef.componentInstance.title = 'Delete Evaluation';
    modalRef.componentInstance.message = `Are you sure you want to delete this evaluation for "${this.getEvaluationItemName(evaluation)}"?`;
    modalRef.componentInstance.confirmButtonText = 'Delete';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result === 'confirmed') {
        this.lifeEvaluationService.delete(evaluation.id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => this.loadLifeEvaluations(),
          error: error => console.error('Error deleting life evaluation:', error),
        });
      }
    });
  }

  createEvaluationDecision(evaluation: ILifeEvaluation): void {
    const modalRef = this.modalService.open(EvaluationDecisionCreateModalComponent, {
      size: 'lg',
      backdrop: 'static',
      windowClass: 'compact-entity-modal',
    });
    modalRef.componentInstance.lifeEvaluation = evaluation;
    modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result === 'saved') {
        this.loadLifeEvaluations();
      }
    });
  }

  deleteEvaluationDecision(decision: IEvaluationDecision): void {
    if (!decision.id) {
      return;
    }

    const modalRef = this.modalService.open(ConfirmationModalComponent, { centered: true });
    modalRef.componentInstance.title = 'Delete Decision';
    modalRef.componentInstance.message = `Are you sure you want to delete this decision?`;
    modalRef.componentInstance.confirmButtonText = 'Delete';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result === 'confirmed') {
        this.evaluationDecisionService.delete(decision.id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => this.loadLifeEvaluations(),
          error: error => console.error('Error deleting evaluation decision:', error),
        });
      }
    });
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
