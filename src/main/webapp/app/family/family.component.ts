import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { forkJoin } from 'rxjs';
import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { ConfirmationModalComponent } from 'app/home/confirmation-modal.component';
import { FamilyObjectiveModalComponent } from './family-objective-modal.component';
import { FamilyProgressModalComponent } from './family-progress-modal.component';
import {
  ChildUser,
  ParentUser,
  FamilyObjective,
  FamilyObjectiveGroup,
  FamilyObjectiveItemDefinition,
  FamilyObjectiveProgress,
  ObjectiveUnit,
} from './family.models';

interface ProgressCalendarCell {
  key: string;
  progress: FamilyObjectiveProgress | null;
}

interface ObjectiveCalendarDay {
  key: string;
  date: Date;
  dayNumber: number;
  weekdayLabel: string;
  monthLabel: string;
  title: string;
  isToday: boolean;
}

interface ObjectiveCalendarRow {
  itemDefinition: FamilyObjectiveItemDefinition;
  cells: ProgressCalendarCell[];
  latestProgress: FamilyObjectiveProgress | null;
}

interface ObjectiveTrendSeries {
  itemDefinition: FamilyObjectiveItemDefinition;
  latestProgress: FamilyObjectiveProgress | null;
  labels: string[];
  values: number[];
  chartData: ChartConfiguration<'bar'>['data'];
  chartOptions: ChartOptions<'bar'>;
  minValue: number;
  maxValue: number;
  startLabel: string;
  endLabel: string;
}

interface ManagementObjectiveGroup {
  key: string;
  representative: FamilyObjective;
  objectiveIds: number[];
  kidNames: string[];
  assignments: Array<{ objectiveId: number; kidLogin: string }>;
}

@Component({
  selector: 'jhi-family',
  templateUrl: './family.component.html',
  styleUrl: './family.component.scss',
  imports: [SharedModule, ReactiveFormsModule, BaseChartDirective],
})
export default class FamilyComponent implements OnInit {
  readonly objectiveRecentEntriesCount = 7;
  readonly objectiveHistoryDays = 7;
  readonly objectiveTrendMonths = 3;
  readonly objectiveTrendDays = 90;

  children = signal<ChildUser[]>([]);
  parents = signal<ParentUser[]>([]);
  objectives = signal<FamilyObjective[]>([]);
  isLoading = signal(false);
  isLoadingObjectives = signal(false);
  isSaving = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  showAddForm = signal(false);
  showAddParentForm = signal(false);
  activeTab = signal<string>('management');

  account = inject(AccountService).trackCurrentAccount();

  /** True when the logged-in user only has ROLE_CHILD */
  isChild = computed(() => {
    const acc = this.account();
    if (!acc) return false;
    const authorities: string[] = acc.authorities ?? [];
    return authorities.includes('ROLE_CHILD') &&
      !authorities.includes('ROLE_PARENT') &&
      !authorities.includes('ROLE_ADMIN');
  });

  /** Family management tab is only visible for parents (ROLE_PARENT). */
  canManageFamily = computed(() => {
    const authorities: string[] = this.account()?.authorities ?? [];
    return authorities.includes('ROLE_PARENT');
  });

  /** Can add parents only if ROLE_PARENT and ROLE_ADMIN */
  canManageParents = computed(() => {
    const authorities: string[] = this.account()?.authorities ?? [];
    return authorities.includes('ROLE_PARENT') && authorities.includes('ROLE_ADMIN');
  });

  /** True when the logged-in user has ROLE_PARENT and can view kids' objectives */
  isParent = computed(() => {
    const acc = this.account();
    if (!acc) return false;
    const authorities: string[] = acc.authorities ?? [];
    return authorities.includes('ROLE_PARENT') &&
      !authorities.includes('ROLE_CHILD') &&
      !authorities.includes('ROLE_ADMIN');
  });

  headerSubtitleKey = computed(() => (this.isChild() ? 'family.childSubtitle' : 'family.subtitle'));

  objectiveChildren = computed(() => {
    const children = this.children();
    if (this.canManageFamily()) {
      return children;
    }

    if (!this.isChild()) {
      return [];
    }

    const login = this.account()?.login;
    if (!login) {
      return [];
    }

    const ownChild = children.find(child => child.login === login);
    if (ownChild) {
      return [ownChild];
    }

    return [
      {
        id: -1,
        login,
        firstName: this.account()?.firstName ?? null,
        lastName: this.account()?.lastName ?? null,
        email: this.account()?.email ?? null,
        activated: true,
      },
    ];
  });

  activeObjectiveChild = computed(() =>
    this.objectiveChildren().find(child => this.getChildTabId(child.login) === this.activeTab()) ?? null,
  );

  objectiveGroups = computed<FamilyObjectiveGroup[]>(() => {
    const childNameByLogin = new Map(this.children().map(child => [child.login, this.getChildDisplayName(child)]));
    const grouped = new Map<string, FamilyObjectiveGroup>();

    for (const objective of this.objectives()) {
      const kidLogin = objective.kidLogin;
      if (!kidLogin) {
        continue;
      }

      const existingGroup = grouped.get(kidLogin);
      if (existingGroup) {
        existingGroup.objectives.push(objective);
        continue;
      }

      grouped.set(kidLogin, {
        kidLogin,
        kidName: childNameByLogin.get(kidLogin) ?? objective.kidName ?? kidLogin,
        objectives: [objective],
      });
    }

    return Array.from(grouped.values())
      .map(group => ({ ...group, objectives: this.sortObjectives(group.objectives) }))
      .sort((left, right) => left.kidName.localeCompare(right.kidName));
  });

  managementObjectiveGroups = computed<ManagementObjectiveGroup[]>(() => {
    const grouped = new Map<string, ManagementObjectiveGroup>();

    for (const objective of this.objectives()) {
      const key = this.getManagementObjectiveGroupKey(objective);
      const existing = grouped.get(key);

      if (existing) {
        existing.objectiveIds.push(objective.id);
        if (objective.kidLogin) {
          existing.assignments.push({ objectiveId: objective.id, kidLogin: objective.kidLogin });
        }
        if (objective.kidName && !existing.kidNames.includes(objective.kidName)) {
          existing.kidNames.push(objective.kidName);
        }
        continue;
      }

      grouped.set(key, {
        key,
        representative: objective,
        objectiveIds: [objective.id],
        kidNames: objective.kidName ? [objective.kidName] : [],
        assignments: objective.kidLogin ? [{ objectiveId: objective.id, kidLogin: objective.kidLogin }] : [],
      });
    }

    return Array.from(grouped.values())
      .map(group => ({ ...group, kidNames: [...group.kidNames].sort((a, b) => a.localeCompare(b)) }))
      .sort((left, right) => {
        const leftTime = Date.parse(left.representative.createdAt ?? '') || 0;
        const rightTime = Date.parse(right.representative.createdAt ?? '') || 0;
        if (leftTime !== rightTime) {
          return rightTime - leftTime;
        }
        return right.representative.id - left.representative.id;
      });
  });

  addForm = inject(FormBuilder).group({
    login: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$/)]],
    firstName: ['', [Validators.maxLength(50)]],
    lastName: ['', [Validators.maxLength(50)]],
    email: ['', [Validators.email, Validators.minLength(5), Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(100)]],
  });

  private readonly http = inject(HttpClient);
  private readonly modalService = inject(NgbModal);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.ensureActiveTabSelection();
    this.loadChildren();
    this.loadParents();
    this.loadObjectives();
  }

  selectTab(tabId: string): void {
    if (tabId === 'management' && !this.canManageFamily()) {
      return;
    }

    if (tabId !== 'management' && !this.objectiveChildren().some(child => this.getChildTabId(child.login) === tabId)) {
      return;
    }

    this.activeTab.set(tabId);
    if (tabId !== 'management') {
      this.showAddForm.set(false);
    }
  }

  getChildTabId(login: string): string {
    return `child:${login}`;
  }

  getChildDisplayName(child: ChildUser): string {
    const fullName = `${child.firstName ?? ''} ${child.lastName ?? ''}`.trim();
    return fullName || child.login;
  }

  getParentDisplayName(parent: ParentUser): string {
    const fullName = `${parent.firstName ?? ''} ${parent.lastName ?? ''}`.trim();
    return fullName || parent.login;
  }

  loadChildren(): void {
    this.isLoading.set(true);
    this.http.get<ChildUser[]>('/api/family/children').subscribe({
      next: children => {
        this.children.set(children);
        this.ensureActiveTabSelection();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  loadObjectives(): void {
    this.isLoadingObjectives.set(true);
    this.http.get<FamilyObjective[]>('/api/family/objectives').subscribe({
      next: objectives => {
        this.objectives.set(this.sortObjectives(objectives ?? []));
        this.isLoadingObjectives.set(false);
      },
      error: err => {
        this.isLoadingObjectives.set(false);
        this.errorMsg.set(err?.error?.detail ?? err?.error?.title ?? 'Unable to load objectives');
      },
    });
  }

  loadParents(): void {
    this.http.get<ParentUser[]>('/api/family/parents').subscribe({
      next: parents => {
        this.parents.set(parents);
      },
      error: () => {
        // Silently fail - parents endpoint may not be available
      },
    });
  }

  toggleAddForm(): void {
    this.showAddForm.update(v => !v);
    this.addForm.reset();
    this.errorMsg.set(null);
    this.successMsg.set(null);
  }

  save(): void {
    if (this.addForm.invalid) return;
    this.isSaving.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);
    const val = this.addForm.value;
    this.http.post<ChildUser>('/api/family/children', {
      login: val.login,
      firstName: val.firstName || null,
      lastName: val.lastName || null,
      email: val.email || null,
      password: val.password,
    }).subscribe({
      next: child => {
        this.children.update(list => [...list, child]);
        this.ensureActiveTabSelection();
        this.isSaving.set(false);
        this.successMsg.set('family.childAdded');
        this.addForm.reset();
        this.showAddForm.set(false);
      },
      error: err => {
        this.isSaving.set(false);
        this.errorMsg.set(err?.error?.detail ?? err?.error?.title ?? 'family.error.save');
      },
    });
  }

  deleteChild(login: string): void {
    if (!confirm('Are you sure you want to remove this child account?')) return;
    this.http.delete(`/api/family/children/${login}`).subscribe({
      next: () => {
        this.children.update(list => list.filter(c => c.login !== login));
        this.ensureActiveTabSelection();
        this.loadObjectives();
      },
      error: err => {
        this.errorMsg.set(err?.error?.detail ?? 'family.error.delete');
      },
    });
  }

  toggleAddParentForm(): void {
    this.showAddParentForm.update(v => !v);
    this.addForm.reset();
    this.errorMsg.set(null);
    this.successMsg.set(null);
  }

  saveParent(): void {
    if (this.addForm.invalid) return;
    this.isSaving.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);
    const val = this.addForm.value;
    this.http.post<ParentUser>('/api/family/parents', {
      login: val.login,
      firstName: val.firstName || null,
      lastName: val.lastName || null,
      email: val.email || null,
      password: val.password,
    }).subscribe({
      next: parent => {
        this.parents.update(list => [...list, parent]);
        this.isSaving.set(false);
        this.successMsg.set('family.parentAdded');
        this.addForm.reset();
        this.showAddParentForm.set(false);
      },
      error: err => {
        this.isSaving.set(false);
        this.errorMsg.set(err?.error?.detail ?? err?.error?.title ?? 'family.error.save');
      },
    });
  }

  deleteParent(login: string): void {
    if (!confirm('Are you sure you want to remove this parent account?')) return;
    this.http.delete(`/api/family/parents/${login}`).subscribe({
      next: () => {
        this.parents.update(list => list.filter(p => p.login !== login));
      },
      error: err => {
        this.errorMsg.set(err?.error?.detail ?? 'family.error.delete');
      },
    });
  }

  openObjectiveModal(): void {
    if (this.children().length === 0) {
      return;
    }

    const modalRef = this.modalService.open(FamilyObjectiveModalComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.children = this.children();
    modalRef.closed.subscribe(result => {
      if (result === 'saved') {
        this.successMsg.set('family.objectives.created');
        this.loadObjectives();
      }
    });
  }

  openEditObjectiveModal(
    objective: FamilyObjective,
    objectiveIds: number[] = [],
    assignments: Array<{ objectiveId: number; kidLogin: string }> = [],
  ): void {
    const modalRef = this.modalService.open(FamilyObjectiveModalComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.children = this.children();
    modalRef.componentInstance.objective = objective;
    modalRef.componentInstance.objectiveIds = objectiveIds;
    modalRef.componentInstance.objectiveAssignments = assignments;
    modalRef.closed.subscribe(result => {
      if (result === 'saved') {
        this.successMsg.set('family.objectives.updated');
        this.loadObjectives();
      }
    });
  }

  deactivateObjective(objective: FamilyObjective, objectiveIds: number[] = []): void {
    const ids = (objectiveIds.length > 0 ? objectiveIds : [objective.id]).filter(Boolean);
    if (ids.length === 0 || !objective.active) {
      return;
    }

    this.openObjectiveConfirmationModal('deactivate', objective).then(confirmed => {
      if (!confirmed) {
        return;
      }

      forkJoin(ids.map(id => this.http.patch(`/api/family/objectives/${id}/deactivate`, {}))).subscribe({
        next: () => {
          this.successMsg.set('family.objectives.deactivated');
          this.loadObjectives();
        },
        error: err => {
          this.errorMsg.set(err?.error?.detail ?? 'family.objectives.errors.deactivate');
        },
      });
    });
  }

  deleteObjective(objective: FamilyObjective, objectiveIds: number[] = []): void {
    const ids = (objectiveIds.length > 0 ? objectiveIds : [objective.id]).filter(Boolean);
    if (ids.length === 0) {
      return;
    }

    this.openObjectiveConfirmationModal('delete', objective).then(confirmed => {
      if (!confirmed) {
        return;
      }

      forkJoin(ids.map(id => this.http.delete(`/api/family/objectives/${id}`))).subscribe({
        next: () => {
          this.successMsg.set('family.objectives.deleted');
          this.loadObjectives();
        },
        error: err => {
          this.errorMsg.set(err?.error?.detail ?? 'family.objectives.errors.delete');
        },
      });
    });
  }

  openProgressModal(itemDefinition: FamilyObjectiveItemDefinition): void {
    const modalRef = this.modalService.open(FamilyProgressModalComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.itemDefinition = itemDefinition;
    modalRef.closed.subscribe(result => {
      if (result) {
        this.successMsg.set('family.objectives.progress.created');
        this.loadObjectives();
      }
    });
  }

  getObjectivesForChild(login: string): FamilyObjective[] {
    return this.sortObjectives(this.objectives().filter(objective => objective.kidLogin === login));
  }

  hasObjectivesForChild(login: string): boolean {
    return this.getObjectivesForChild(login).length > 0;
  }

  hasProgressHistory(itemDefinition: FamilyObjectiveItemDefinition): boolean {
    return (itemDefinition.progressHistory?.length ?? 0) > 0;
  }

  getObjectiveCalendarDays(): ObjectiveCalendarDay[] {
    const today = this.startOfDay(new Date());
    const start = new Date(today);
    start.setDate(today.getDate() - (this.objectiveHistoryDays - 1));

    const locale = this.translateService.currentLang || 'en';
    const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'short' });
    const titleFormatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });

    return Array.from({ length: this.objectiveHistoryDays }, (_, offset) => {
      const date = new Date(start);
      date.setDate(start.getDate() + offset);
      const key = this.toDateKey(date);
      return {
        key,
        date,
        dayNumber: date.getDate(),
        weekdayLabel: weekdayFormatter.format(date),
        monthLabel: monthFormatter.format(date),
        title: titleFormatter.format(date),
        isToday: key === this.toDateKey(today),
      };
    });
  }

  getObjectiveCalendarRows(objective: FamilyObjective): ObjectiveCalendarRow[] {
    const days = this.getObjectiveCalendarDays();
    return objective.itemDefinitions.map(itemDefinition => {
      const latestProgressByDay = this.getLatestProgressByDay(itemDefinition, days[0]?.date ?? new Date(), days[days.length - 1]?.date ?? new Date());
      return {
        itemDefinition,
        latestProgress: this.getLatestProgress(itemDefinition),
        cells: days.map(day => ({
          key: `${itemDefinition.id}-${day.key}`,
          progress: latestProgressByDay.get(day.key) ?? null,
        })),
      };
    });
  }

  getObjectiveCalendarCellTitle(
    itemDefinition: FamilyObjectiveItemDefinition,
    day: ObjectiveCalendarDay,
    progress: FamilyObjectiveProgress | null,
  ): string {
    if (!progress) {
      return `${day.title} • ${this.translateService.instant('family.objectives.progress.noEntryDay')}`;
    }

    const valueLabel = `${progress.value} ${this.getObjectiveUnitLabel(itemDefinition.unit)}`;
    const notesLabel = progress.notes?.trim() ? ` • ${progress.notes}` : '';
    return `${day.title} • ${valueLabel}${notesLabel}`;
  }

  hasObjectiveProgressInHistoryWindow(objective: FamilyObjective): boolean {
    return objective.itemDefinitions.some(itemDefinition =>
      (itemDefinition.progressHistory ?? []).some(progress => this.isWithinHistoryWindow(progress.createdAt)),
    );
  }

  hasObjectiveProgressInTrendWindow(objective: FamilyObjective): boolean {
    return objective.itemDefinitions.some(itemDefinition => (itemDefinition.progressHistory?.length ?? 0) > 0);
  }

  getObjectiveTrendSeries(objective: FamilyObjective): ObjectiveTrendSeries[] {
    return objective.itemDefinitions.map(itemDefinition => this.getObjectiveTrendSeriesForItem(itemDefinition));
  }


  getLatestProgress(itemDefinition: FamilyObjectiveItemDefinition): FamilyObjectiveProgress | null {
    return itemDefinition.progressHistory?.[0] ?? null;
  }

  getObjectiveUnitLabel(unit: ObjectiveUnit): string {
    switch (unit) {
      case ObjectiveUnit.REPS:
        return 'Reps';
      case ObjectiveUnit.SECONDS:
        return 'Seconds';
      default:
        return 'Number';
    }
  }

  exportKidProgress(kidLogin: string): void {
    const kid = this.objectiveChildren().find(child => child.login === kidLogin);
    if (!kid) {
      return;
    }

    const rows = this.buildKidProgressExportRows([kidLogin]);
    this.exportProgressRowsToExcel(rows, `kid-progress-${kidLogin}`);
  }

  exportAllKidsProgress(): void {
    const kidLogins = this.objectiveChildren().map(child => child.login);
    const rows = this.buildKidProgressExportRows(kidLogins);
    this.exportProgressRowsToExcel(rows, 'kids-progress');
  }

  private buildKidProgressExportRows(kidLogins: string[]): Array<Record<string, string>> {
    const kidLookup = new Map(this.objectiveChildren().map(child => [child.login, this.getChildDisplayName(child)]));
    const rows: Array<Record<string, string>> = [];

    for (const kidLogin of kidLogins) {
      const kidName = kidLookup.get(kidLogin) ?? kidLogin;
      const objectives = this.getObjectivesForChild(kidLogin);

      for (const objective of objectives) {
        for (const itemDefinition of objective.itemDefinitions) {
          const progressHistory = itemDefinition.progressHistory ?? [];

          if (progressHistory.length === 0) {
            rows.push({
              kidName,
              objectiveName: objective.name,
              objectiveStatus: this.translateService.instant(
                objective.active ? 'family.objectives.status.active' : 'family.objectives.status.inactive',
              ),
              itemName: itemDefinition.name,
              unit: this.getObjectiveUnitLabel(itemDefinition.unit),
              progressValue: '-',
              progressDate: '-',
              notes: this.translateService.instant('family.objectives.progress.empty'),
            });
            continue;
          }

          for (const progress of progressHistory) {
            rows.push({
              kidName,
              objectiveName: objective.name,
              objectiveStatus: this.translateService.instant(
                objective.active ? 'family.objectives.status.active' : 'family.objectives.status.inactive',
              ),
              itemName: itemDefinition.name,
              unit: this.getObjectiveUnitLabel(itemDefinition.unit),
              progressValue: `${progress.value ?? '-'}`,
              progressDate: progress.createdAt ? this.formatExportDate(progress.createdAt) : '-',
              notes: progress.notes?.trim() ? progress.notes : '-',
            });
          }
        }
      }
    }

    return rows;
  }

  private exportProgressRowsToExcel(rows: Array<Record<string, string>>, filePrefix: string): void {
    if (rows.length === 0) {
      this.errorMsg.set('family.objectives.export.noData');
      return;
    }

    const headers = {
      kidName: this.translateService.instant('family.objectives.export.columns.kidName'),
      objectiveName: this.translateService.instant('family.objectives.export.columns.objectiveName'),
      objectiveStatus: this.translateService.instant('family.objectives.export.columns.objectiveStatus'),
      itemName: this.translateService.instant('family.objectives.export.columns.itemName'),
      unit: this.translateService.instant('family.objectives.export.columns.unit'),
      progressValue: this.translateService.instant('family.objectives.export.columns.progressValue'),
      progressDate: this.translateService.instant('family.objectives.export.columns.progressDate'),
      notes: this.translateService.instant('family.objectives.export.columns.notes'),
    };

    const keys = Object.keys(headers) as Array<keyof typeof headers>;
    const htmlTable = [
      '<table>',
      '<thead><tr>',
      ...keys.map(key => `<th>${this.escapeHtml(headers[key])}</th>`),
      '</tr></thead>',
      '<tbody>',
      ...rows.map(
        row =>
          `<tr>${keys
            .map(key => `<td>${this.escapeHtml(row[key] ?? '-')}</td>`)
            .join('')}</tr>`,
      ),
      '</tbody>',
      '</table>',
    ].join('');

    const blob = new Blob([`\ufeff${htmlTable}`], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const now = new Date();
    const suffix = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}`;
    link.download = `${filePrefix}-${suffix}.xls`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  private formatExportDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    const locale = this.translateService.currentLang || 'en';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private sortObjectives(objectives: FamilyObjective[]): FamilyObjective[] {
    return [...objectives].sort((left, right) => {
      const leftTime = Date.parse(left.createdAt ?? '') || 0;
      const rightTime = Date.parse(right.createdAt ?? '') || 0;
      if (leftTime !== rightTime) {
        return rightTime - leftTime;
      }

      return right.id - left.id;
    });
  }

  private getManagementObjectiveGroupKey(objective: FamilyObjective): string {
    const normalizedItems = [...(objective.itemDefinitions ?? [])]
      .map(item => ({
        name: item.name ?? '',
        description: item.description ?? '',
        unit: item.unit,
      }))
      .sort((left, right) => left.name.localeCompare(right.name));

    return JSON.stringify({
      name: objective.name ?? '',
      description: objective.description ?? '',
      createdAt: objective.createdAt ?? '',
      active: objective.active ?? false,
      items: normalizedItems,
    });
  }

  private openObjectiveConfirmationModal(action: 'deactivate' | 'delete', objective: FamilyObjective): Promise<boolean> {
    const objectiveName = objective.name || '-';
    const modalRef = this.modalService.open(ConfirmationModalComponent, { size: 'md', backdrop: 'static' });

    modalRef.componentInstance.title = this.translateService.instant(`family.objectives.confirm.${action}.title`);
    modalRef.componentInstance.message = this.translateService.instant(`family.objectives.confirm.${action}.message`, { objective: objectiveName });
    modalRef.componentInstance.confirmButtonText = this.translateService.instant(`family.objectives.confirm.${action}.confirmButton`);
    modalRef.componentInstance.cancelButtonText = this.translateService.instant('entity.action.cancel');
    modalRef.componentInstance.confirmButtonClass = action === 'delete' ? 'btn-danger' : 'btn-warning';

    return modalRef.result
      .then(result => result === 'confirmed')
      .catch(() => false);
  }

  private ensureActiveTabSelection(): void {
    const children = this.objectiveChildren();
    const activeTab = this.activeTab();
    const hasActiveChildTab = children.some(child => this.getChildTabId(child.login) === activeTab);

    if (activeTab === 'management' && this.canManageFamily()) {
      return;
    }

    if (hasActiveChildTab) {
      return;
    }

    if (!this.canManageFamily() && children.length > 0) {
      this.activeTab.set(this.getChildTabId(children[0].login));
      return;
    }

    if (this.canManageFamily()) {
      this.activeTab.set('management');
      return;
    }

    if (children.length > 0) {
      this.activeTab.set(this.getChildTabId(children[0].login));
    }
  }

  private parseDate(value: string | null | undefined): Date | null {
    if (!value) {
      return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private getHistoryWindowStart(days: number): Date {
    const today = this.startOfDay(new Date());
    const start = new Date(today);
    start.setDate(today.getDate() - (days - 1));
    return start;
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getLatestProgressByDay(
    itemDefinition: FamilyObjectiveItemDefinition,
    startDate: Date,
    endDate: Date,
  ): Map<string, FamilyObjectiveProgress> {
    const latestProgressByDay = new Map<string, FamilyObjectiveProgress>();

    for (const progress of itemDefinition.progressHistory ?? []) {
      const progressDate = this.parseDate(progress.createdAt);
      if (!progressDate) {
        continue;
      }

      const normalized = this.startOfDay(progressDate);
      if (normalized < startDate || normalized > endDate) {
        continue;
      }

      const key = this.toDateKey(normalized);
      const current = latestProgressByDay.get(key);
      if (!current) {
        latestProgressByDay.set(key, progress);
        continue;
      }

      const currentDate = this.parseDate(current.createdAt);
      if (!currentDate || progressDate > currentDate) {
        latestProgressByDay.set(key, progress);
      }
    }

    return latestProgressByDay;
  }

  private getObjectiveTrendSeriesForItem(itemDefinition: FamilyObjectiveItemDefinition): ObjectiveTrendSeries {
    const locale = this.translateService.currentLang || 'en';
    const labelFormatter = new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
    });

    const entries = (itemDefinition.progressHistory ?? [])
      .map(progress => {
        const parsed = this.parseDate(progress.createdAt);
        return parsed
          ? {
              date: parsed,
              value: progress.value,
            }
          : null;
      })
      .filter((entry): entry is { date: Date; value: number } => entry !== null)
      .sort((left, right) => right.date.getTime() - left.date.getTime())
      .slice(0, this.objectiveRecentEntriesCount)
      .reverse()
      .map((entry, index) => ({
        key: `${index}-${entry.date.toISOString()}`,
        date: entry.date,
        label: labelFormatter.format(entry.date),
        value: entry.value,
      }));

    const startLabel = entries[0]?.label ?? '-';
    const endLabel = entries[entries.length - 1]?.label ?? '-';

    if (entries.length === 0) {
      return {
        itemDefinition,
        latestProgress: this.getLatestProgress(itemDefinition),
        labels: [],
        values: [],
        chartData: {
          labels: [],
          datasets: [{ data: [] }],
        },
        chartOptions: {},
        minValue: 0,
        maxValue: 0,
        startLabel,
        endLabel,
      };
    }

    let minValue = Math.min(...entries.map(entry => entry.value));
    let maxValue = Math.max(...entries.map(entry => entry.value));

    if (minValue === maxValue) {
      if (minValue === 0) {
        maxValue = 1;
      } else {
        minValue = Math.max(0, minValue - 1);
        maxValue = maxValue + 1;
      }
    }

    const range = Math.max(maxValue - minValue, 1);
    const labels = entries.map(entry => entry.label);
    const values = entries.map(entry => entry.value);
    const unitLabel = this.getObjectiveUnitLabel(itemDefinition.unit);

    return {
      itemDefinition,
      latestProgress: this.getLatestProgress(itemDefinition),
      labels,
      values,
      chartData: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: '#2563eb',
            borderColor: '#1d4ed8',
            borderWidth: 1,
            borderRadius: 6,
            hoverBackgroundColor: '#1e40af',
            maxBarThickness: 26,
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#64748b',
              maxRotation: 0,
              autoSkip: true,
            },
          },
          y: {
            beginAtZero: minValue >= 0,
            suggestedMin: minValue >= 0 ? 0 : minValue - range * 0.15,
            suggestedMax: maxValue + range * 0.15,
            ticks: {
              precision: 0,
              color: '#64748b',
            },
            grid: {
              color: '#e2e8f0',
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: context => `${context.parsed.y} ${unitLabel}`,
            },
          },
        },
      },
      minValue,
      maxValue,
      startLabel,
      endLabel,
    };
  }

  private isWithinHistoryWindow(value: string | null | undefined): boolean {
    const parsed = this.parseDate(value);
    if (!parsed) {
      return false;
    }

    const today = this.startOfDay(new Date());
    const start = this.getHistoryWindowStart(this.objectiveHistoryDays);
    const normalized = this.startOfDay(parsed);
    return normalized >= start && normalized <= today;
  }
}
