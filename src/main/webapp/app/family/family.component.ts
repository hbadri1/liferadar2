import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { ConfirmationModalComponent } from 'app/home/confirmation-modal.component';
import { FamilyObjectiveModalComponent } from './family-objective-modal.component';
import { FamilyProgressModalComponent } from './family-progress-modal.component';
import {
  ChildUser,
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

@Component({
  selector: 'jhi-family',
  templateUrl: './family.component.html',
  styleUrl: './family.component.scss',
  imports: [SharedModule, ReactiveFormsModule],
})
export default class FamilyComponent implements OnInit {
  readonly objectiveHistoryDays = 10;

  children = signal<ChildUser[]>([]);
  objectives = signal<FamilyObjective[]>([]);
  isLoading = signal(false);
  isLoadingObjectives = signal(false);
  isSaving = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  showAddForm = signal(false);
  activeTab = signal<string>('management');

  account = inject(AccountService).trackCurrentAccount();

  /** True when the logged-in user only has ROLE_CHILD */
  isChild = computed(() => {
    const acc = this.account();
    if (!acc) return false;
    const authorities: string[] = acc.authorities ?? [];
    return authorities.includes('ROLE_CHILD') &&
      !authorities.includes('ROLE_FAMILY_ADMIN') &&
      !authorities.includes('ROLE_ADMIN');
  });

  /** Family management tab is only visible for family admins. */
  canManageFamily = computed(() => {
    const authorities: string[] = this.account()?.authorities ?? [];
    return authorities.includes('ROLE_FAMILY_ADMIN');
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

  deactivateObjective(objective: FamilyObjective): void {
    if (!objective.id || !objective.active) {
      return;
    }

    this.openObjectiveConfirmationModal('deactivate', objective).then(confirmed => {
      if (!confirmed) {
        return;
      }

      this.http.patch(`/api/family/objectives/${objective.id}/deactivate`, {}).subscribe({
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

  deleteObjective(objective: FamilyObjective): void {
    if (!objective.id) {
      return;
    }

    this.openObjectiveConfirmationModal('delete', objective).then(confirmed => {
      if (!confirmed) {
        return;
      }

      this.http.delete(`/api/family/objectives/${objective.id}`).subscribe({
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

  private isWithinHistoryWindow(value: string | null | undefined): boolean {
    const parsed = this.parseDate(value);
    if (!parsed) {
      return false;
    }

    const today = this.startOfDay(new Date());
    const start = new Date(today);
    start.setDate(today.getDate() - (this.objectiveHistoryDays - 1));
    const normalized = this.startOfDay(parsed);
    return normalized >= start && normalized <= today;
  }
}

