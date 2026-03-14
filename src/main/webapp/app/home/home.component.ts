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
import { ILifePillar } from 'app/entities/life-pillar/life-pillar.model';
import { LifePillarService } from 'app/entities/life-pillar/service/life-pillar.service';
import { ILifePillarTranslation } from 'app/entities/life-pillar-translation/life-pillar-translation.model';
import { ISubLifePillar } from 'app/entities/sub-life-pillar/sub-life-pillar.model';
import { SubLifePillarService } from 'app/entities/sub-life-pillar/service/sub-life-pillar.service';
import { ISubLifePillarTranslation } from 'app/entities/sub-life-pillar-translation/sub-life-pillar-translation.model';
import { ISubLifePillarItem } from 'app/entities/sub-life-pillar-item/sub-life-pillar-item.model';
import { SubLifePillarItemService } from 'app/entities/sub-life-pillar-item/service/sub-life-pillar-item.service';
import { ISubLifePillarItemTranslation } from 'app/entities/sub-life-pillar-item-translation/sub-life-pillar-item-translation.model';
import { LifePillarCreateModalComponent } from './life-pillar-create-modal.component';
import { SubLifePillarCreateModalComponent } from './sub-life-pillar-create-modal.component';
import { SubLifePillarItemCreateModalComponent } from './sub-life-pillar-item-create-modal.component';
import { LifePillarEditModalComponent } from './life-pillar-edit-modal.component';
import { SubLifePillarEditModalComponent } from './sub-life-pillar-edit-modal.component';
import { SubLifePillarItemEditModalComponent } from './sub-life-pillar-item-edit-modal.component';
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
  pillars = signal<ILifePillar[]>([]);
  subPillarsMap = signal<Map<number, ISubLifePillar[]>>(new Map());
  loadingSubPillars = signal<Set<number>>(new Set());
  subPillarItemsMap = signal<Map<number, ISubLifePillarItem[]>>(new Map());
  loadingSubPillarItems = signal<Set<number>>(new Set());
  isLoading = signal<boolean>(false);
  lifeEvaluations = signal<ILifeEvaluation[]>([]);
  evaluationDecisionsMap = signal<Map<number, IEvaluationDecision[]>>(new Map());
  isLoadingEvaluations = signal<boolean>(false);
  readonly riyadhTimeZone = 'Asia/Riyadh';

  private readonly destroy$ = new Subject<void>();

  private readonly accountService = inject(AccountService);
  private readonly lifePillarService = inject(LifePillarService);
  private readonly subLifePillarService = inject(SubLifePillarService);
  private readonly subLifePillarItemService = inject(SubLifePillarItemService);
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
    this.lifePillarService
      .query({ size: 100, eagerload: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: HttpResponse<ILifePillar[]>) => {
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

  getTranslation(pillar: ILifePillar): ILifePillarTranslation | null {
    if (!pillar.translations || pillar.translations.length === 0) {
      return null;
    }

    const currentLang = this.translateService.currentLang ?? 'en';

    // Try to find translation for current language
    let translation: ILifePillarTranslation | null =
      pillar.translations.find(t => t.lang?.toLowerCase() === currentLang.toLowerCase()) ?? null;

    // Fallback to English if current language not found
    translation ??= pillar.translations.find(t => t.lang?.toLowerCase() === 'en') ?? null;

    // Fallback to first available translation
    translation ??= pillar.translations[0] ?? null;

    return translation;
  }

  createNewPillar(): void {
    const modalRef = this.modalService.open(LifePillarCreateModalComponent, {
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
    const modalRef = this.modalService.open(ConfirmationModalComponent, { centered: true, backdrop: 'static' });
    modalRef.componentInstance.title = 'Load Suggested LifePillars';
    modalRef.componentInstance.message =
      'This will load the suggested LifePillars, SubLifePillars, items, and translations into your account. Continue?';
    modalRef.componentInstance.confirmButtonText = 'Load';
    modalRef.componentInstance.confirmButtonClass = 'btn-info';

    modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result !== 'confirmed') {
        return;
      }

      this.isLoading.set(true);
      this.lifePillarService.loadSuggested().pipe(takeUntil(this.destroy$)).subscribe({
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
    const modalRef = this.modalService.open(SubLifePillarCreateModalComponent, {
      size: 'lg',
      backdrop: 'static',
      windowClass: 'compact-entity-modal',
    });
    modalRef.componentInstance.lifePillarId = pillarId;
    modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result === 'saved') {
        this.viewSubPillars(pillarId);
      }
    });
  }

  createSubPillarItem(subPillarId: number): void {
    const modalRef = this.modalService.open(SubLifePillarItemCreateModalComponent, {
      size: 'lg',
      backdrop: 'static',
      windowClass: 'compact-entity-modal',
    });
    modalRef.componentInstance.subLifePillarId = subPillarId;
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

    this.subLifePillarItemService
      .query({ 'subLifePillarId.equals': subPillarId, eagerload: true, size: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: HttpResponse<ISubLifePillarItem[]>) => {
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

  getSubPillarItems(subPillarId: number): ISubLifePillarItem[] {
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
    this.lifePillarService
      .find(pillarId, { eagerload: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: HttpResponse<ILifePillar>) => {
          const pillarWithTranslations = res.body;
          if (pillarWithTranslations) {
            const modalRef = this.modalService.open(LifePillarEditModalComponent, {
              size: 'lg',
              backdrop: 'static',
              windowClass: 'compact-entity-modal',
            });
            modalRef.componentInstance.lifePillar = pillarWithTranslations;
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

  editSubPillar(subPillar: ISubLifePillar): void {
    if (!subPillar.id) {
      return;
    }

    // Fetch the sub-pillar with translations eagerly loaded
    this.subLifePillarService
      .find(subPillar.id, { eagerload: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: HttpResponse<ISubLifePillar>) => {
          const subPillarWithTranslations = res.body;
          if (subPillarWithTranslations) {
            const modalRef = this.modalService.open(SubLifePillarEditModalComponent, {
              size: 'lg',
              backdrop: 'static',
              windowClass: 'compact-entity-modal',
            });
            modalRef.componentInstance.subLifePillar = subPillarWithTranslations;
            modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
              if (result === 'saved' && subPillarWithTranslations.lifePillar?.id) {
                this.viewSubPillars(subPillarWithTranslations.lifePillar.id);
              }
            });
          }
        },
        error: () => {
          console.error('Failed to load sub-pillar with translations');
        },
      });
  }

  editSubPillarItem(item: ISubLifePillarItem): void {
    if (!item.id) {
      return;
    }

    // Fetch the item with translations eagerly loaded
    this.subLifePillarItemService
      .find(item.id, { eagerload: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: HttpResponse<ISubLifePillarItem>) => {
          const itemWithTranslations = res.body;
          if (itemWithTranslations) {
            const modalRef = this.modalService.open(SubLifePillarItemEditModalComponent, {
              size: 'lg',
              backdrop: 'static',
              windowClass: 'compact-entity-modal',
            });
            modalRef.componentInstance.subLifePillarItem = itemWithTranslations;
            modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
              if (result === 'saved' && itemWithTranslations.subLifePillar?.id) {
                this.viewSubPillarItems(itemWithTranslations.subLifePillar.id);
              }
            });
          }
        },
        error: () => {
          console.error('Failed to load item with translations');
        },
      });
  }

  createLifeEvaluation(item: ISubLifePillarItem): void {
    const modalRef = this.modalService.open(LifeEvaluationCreateModalComponent, {
      size: 'md',
      backdrop: 'static',
      windowClass: 'compact-evaluation-modal',
    });
    modalRef.componentInstance.subLifePillarItem = item;
    modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result === 'saved' && item.subLifePillar?.id) {
        this.viewSubPillarItems(item.subLifePillar.id);
      }
    });
  }

  deleteSubPillarItem(item: ISubLifePillarItem): void {
    const itemName = this.getSubPillarItemTranslation(item) || item.code || 'this item';

    const modalRef = this.modalService.open(ConfirmationModalComponent, { centered: true });
    modalRef.componentInstance.title = 'Delete Item';
    modalRef.componentInstance.message = `Are you sure you want to delete "${itemName}"? This will also delete all associated evaluations and decisions.`;
    modalRef.componentInstance.confirmButtonText = 'Delete';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result === 'confirmed') {
        this.subLifePillarItemService.delete(item.id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            console.log('Item deleted successfully');
            // Reload items for the parent sub-pillar
            if (item.subLifePillar?.id) {
              this.viewSubPillarItems(item.subLifePillar.id);
            }
          },
          error: (error) => {
            console.error('Error deleting item:', error);
          },
        });
      }
    });
  }

  deletePillar(pillar: ILifePillar): void {
    const translation = this.getTranslation(pillar);
    const pillarName = translation?.name || pillar.code || 'this pillar';

    const modalRef = this.modalService.open(ConfirmationModalComponent, { centered: true });
    modalRef.componentInstance.title = 'Delete Life Pillar';
    modalRef.componentInstance.message = `Are you sure you want to delete "${pillarName}"? This will also delete all associated sub-pillars, items, evaluations, and decisions.`;
    modalRef.componentInstance.confirmButtonText = 'Delete';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result === 'confirmed') {
        this.lifePillarService.delete(pillar.id).pipe(takeUntil(this.destroy$)).subscribe({
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

  deleteSubPillar(subPillar: ISubLifePillar): void {
    const translation = this.getSubPillarTranslation(subPillar);
    const subPillarName = translation?.name || subPillar.code || 'this sub-pillar';

    const modalRef = this.modalService.open(ConfirmationModalComponent, { centered: true });
    modalRef.componentInstance.title = 'Delete Sub-Pillar';
    modalRef.componentInstance.message = `Are you sure you want to delete "${subPillarName}"? This will also delete all associated items, evaluations, and decisions.`;
    modalRef.componentInstance.confirmButtonText = 'Delete';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.closed.pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result === 'confirmed') {
        this.subLifePillarService.delete(subPillar.id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            console.log('SubPillar deleted successfully');
            // Reload sub-pillars for the parent pillar
            if (subPillar.lifePillar?.id) {
              this.viewSubPillars(subPillar.lifePillar.id);
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

      this.subLifePillarService
        .query({ 'lifePillarId.equals': pillarId, size: 100 })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: HttpResponse<ISubLifePillar[]>) => {
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

  getSubPillars(pillarId: number): ISubLifePillar[] {
    return this.subPillarsMap().get(pillarId) ?? [];
  }

  isLoadingSubPillars(pillarId: number): boolean {
    return this.loadingSubPillars().has(pillarId);
  }

  hasSubPillars(pillarId: number): boolean {
    return this.subPillarsMap().has(pillarId);
  }

  getSubPillarTranslation(subPillar: ISubLifePillar): ISubLifePillarTranslation | null {
    if (!subPillar.translations || subPillar.translations.length === 0) {
      return null;
    }

    const currentLang = this.translateService.currentLang ?? 'en';

    // Try to find translation for current language
    let translation: ISubLifePillarTranslation | null =
      subPillar.translations.find(t => t.lang?.toLowerCase() === currentLang.toLowerCase()) ?? null;

    // Fallback to English if current language not found
    translation ??= subPillar.translations.find(t => t.lang?.toLowerCase() === 'en') ?? null;

    // Fallback to first available translation
    translation ??= subPillar.translations[0] ?? null;

    return translation;
  }

  getSubPillarItemTranslation(item: ISubLifePillarItem): string | null {
    if (!item.translations || item.translations.length === 0) {
      return null;
    }

    const currentLang = this.translateService.currentLang ?? 'en';

    // Try to find translation for current language
    let translation: ISubLifePillarItemTranslation | null =
      item.translations.find(t => t.lang?.toLowerCase() === currentLang.toLowerCase()) ?? null;

    // Fallback to English if current language not found
    translation ??= item.translations.find(t => t.lang?.toLowerCase() === 'en') ?? null;

    // Fallback to first available translation
    translation ??= item.translations[0] ?? null;

    return translation?.name ?? null;
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
                .map(evaluation => evaluation.subLifePillarItem?.id)
                .filter((id): id is number => id !== undefined && id !== null),
            ),
          ];

          if (itemIds.length === 0) {
            this.lifeEvaluations.set(evaluations);
            this.loadEvaluationDecisionsForEvaluations(evaluations);
            this.isLoadingEvaluations.set(false);
            return;
          }

          this.subLifePillarItemService
            .query({ 'id.in': itemIds.join(','), eagerload: true, size: itemIds.length })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (itemsRes: HttpResponse<ISubLifePillarItem[]>) => {
                const detailedItems = itemsRes.body ?? [];
                const itemsById = new Map(detailedItems.map(item => [item.id, item]));

                const enrichedEvaluations = evaluations.map(evaluation => {
                  const itemId = evaluation.subLifePillarItem?.id;
                  if (!itemId) {
                    return evaluation;
                  }

                  return {
                    ...evaluation,
                    subLifePillarItem: itemsById.get(itemId) ?? evaluation.subLifePillarItem,
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
    const item = evaluation.subLifePillarItem;
    if (!item) {
      return 'N/A';
    }

    return this.getSubPillarItemTranslation(item) ?? item.code ?? 'N/A';
  }

  getGroupedLifeEvaluations(): Array<{ itemId: string; itemName: string; evaluations: ILifeEvaluation[] }> {
    const grouped = new Map<string, { itemId: string; itemName: string; evaluations: ILifeEvaluation[] }>();

    this.lifeEvaluations().forEach(evaluation => {
      const key = evaluation.subLifePillarItem?.id ? `${evaluation.subLifePillarItem.id}` : `unknown-${evaluation.id}`;
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
