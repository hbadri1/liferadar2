import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs/esm';
import SharedModule from 'app/shared/shared.module';
import { TodoActionsModule } from 'app/shared/todo-actions/todo-actions.module';
import { AccountService } from 'app/core/auth/account.service';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { ConfirmationModalComponent } from 'app/home/confirmation-modal.component';
import { TripPlanService } from 'app/entities/trip-plan/service/trip-plan.service';
import { TripFormModalComponent } from './trip-form-modal.component';
import { StepFormModalComponent } from './step-form-modal.component';
import { ITripPlan } from 'app/entities/trip-plan/trip-plan.model';
import { ITripPlanStep } from 'app/entities/trip-plan-step/trip-plan-step.model';

type TimelineEntry =
  | { kind: 'today'; sortDate: dayjs.Dayjs }
  | { kind: 'step'; sortDate: dayjs.Dayjs; step: ITripPlanStep };

type TripViewMode = 'timeline' | 'calendar' | 'gantt' | 'vertical';

type CalendarCell = {
  date: dayjs.Dayjs;
  inCurrentMonth: boolean;
  inTripRange: boolean;
  isToday: boolean;
  steps: ITripPlanStep[];
};

type GanttRow = {
  step: ITripPlanStep;
  offsetPct: number;
  widthPct: number;
};

type VerticalFlowEntry =
  | {
      kind: 'step';
      step: ITripPlanStep;
      start: dayjs.Dayjs;
      end: dayjs.Dayjs;
      durationLabel: string;
    }
  | {
      kind: 'gap';
      start: dayjs.Dayjs;
      end: dayjs.Dayjs;
      durationLabel: string;
    };


@Component({
  selector: 'jhi-trips',
  templateUrl: './trips.component.html',
  styleUrl: './trips.component.scss',
  imports: [SharedModule, TodoActionsModule],
})
export default class TripsComponent implements OnInit {
  trips = signal<ITripPlan[]>([]);
  selectedTrip = signal<ITripPlan | null>(null);
  steps = signal<ITripPlanStep[]>([]);
  isLoadingTrips = signal(false);
  isLoadingSteps = signal(false);
  errorMsg = signal<string | null>(null);
  viewMode = signal<TripViewMode>('timeline');
  calendarMonth = signal(dayjs().startOf('month'));
  isUpdatingActions = signal(false);

  account = inject(AccountService).trackCurrentAccount();

  canEdit = computed(() => {
    const authorities = (this.account()?.authorities ?? [])
      .map(a => (a ?? '').toString().trim().toUpperCase());
    return (
      authorities.includes('ROLE_USER') || authorities.includes('USER') ||

      authorities.includes('ROLE_PARENT') || authorities.includes('PARENT') ||
      authorities.includes('ROLE_ADMIN') || authorities.includes('ADMIN')
    );
  });

  selectedTripReadOnly = computed(() => this.isTripFinished(this.selectedTrip()));

  private http = inject(HttpClient);
  private modalService = inject(NgbModal);
  private appConfig = inject(ApplicationConfigService);
  private translateService = inject(TranslateService);
  private tripPlanEntityService = inject(TripPlanService);

  private readonly tripsUrl = this.appConfig.getEndpointFor('api/trip-plans/my');
  private readonly stepsUrl = (id: number) => this.appConfig.getEndpointFor(`api/trip-plan-steps/by-trip/${id}`);
  private readonly deleteTrip = (id: number) => this.appConfig.getEndpointFor(`api/trip-plans/${id}`);
  private readonly deleteStep = (id: number) => this.appConfig.getEndpointFor(`api/trip-plan-steps/${id}`);

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.isLoadingTrips.set(true);
    this.errorMsg.set(null);
    this.http.get<ITripPlan[]>(this.tripsUrl).subscribe({
      next: data => {
        this.trips.set(data);
        this.isLoadingTrips.set(false);
      },
      error: () => {
        this.isLoadingTrips.set(false);
        this.errorMsg.set('trips.errors.loadFailed');
      },
    });
  }

  selectTrip(trip: ITripPlan): void {
    if (this.selectedTrip()?.id === trip.id) {
      this.selectedTrip.set(null);
      this.steps.set([]);
      return;
    }
    if (!trip.id) {
      this.steps.set([]);
      return;
    }
    this.selectedTrip.set(trip);
    this.calendarMonth.set((this.toDayjsDate(trip.startDate) ?? dayjs()).startOf('month'));
    this.loadSteps(trip.id);
  }

  setViewMode(mode: TripViewMode): void {
    this.viewMode.set(mode);
  }

  previousCalendarMonth(): void {
    this.calendarMonth.set(this.calendarMonth().subtract(1, 'month').startOf('month'));
  }

  nextCalendarMonth(): void {
    this.calendarMonth.set(this.calendarMonth().add(1, 'month').startOf('month'));
  }

  jumpToCurrentMonth(): void {
    this.calendarMonth.set(dayjs().startOf('month'));
  }

  loadSteps(tripId: number): void {
    this.isLoadingSteps.set(true);
    this.http.get<ITripPlanStep[]>(this.stepsUrl(tripId)).subscribe({
      next: data => {
        this.steps.set(this.sortSteps(data));
        this.isLoadingSteps.set(false);
      },
      error: err => {
        console.error('Error loading steps:', err);
        this.isLoadingSteps.set(false);
      },
    });
  }

  openCreateTrip(): void {
    const ref = this.modalService.open(TripFormModalComponent, { size: 'lg', centered: true });
    ref.result.then(
      (result: ITripPlan) => { if (result) this.loadTrips(); },
      () => {},
    );
  }

  openEditTrip(trip: ITripPlan, event: Event): void {
    event.stopPropagation();
    if (this.isTripFinished(trip)) {
      return;
    }
    const ref = this.modalService.open(TripFormModalComponent, { size: 'lg', centered: true });
    ref.componentInstance.trip = trip;
    ref.result.then(
      (result: ITripPlan) => {
        if (result) {
          this.loadTrips();
          if (this.selectedTrip()?.id === trip.id) {
            this.selectedTrip.set(result);
          }
        }
      },
      () => {},
    );
  }

  openDeleteTrip(trip: ITripPlan, event: Event): void {
    event.stopPropagation();
    if (this.isTripFinished(trip)) {
      return;
    }
    const ref = this.modalService.open(ConfirmationModalComponent, { centered: true });
    ref.componentInstance.title = 'trips.deleteTrip';
    ref.componentInstance.message = 'trips.confirmDeleteTrip';
    ref.componentInstance.confirmButtonClass = 'btn-danger';
    ref.result.then(
      result => {
        if (result === 'confirmed') {
          this.http.delete(this.deleteTrip(trip.id)).subscribe({
            next: () => {
              if (this.selectedTrip()?.id === trip.id) {
                this.selectedTrip.set(null);
                this.steps.set([]);
              }
              this.loadTrips();
            },
          });
        }
      },
      () => {},
    );
  }

  openAddStep(prefillDate?: dayjs.Dayjs): void {
    const trip = this.selectedTrip();
    if (!trip || !trip.id) return;
    if (this.isTripFinished(trip)) return;

    // Calculate next sequence based on max existing sequence
    const maxSequence = this.steps().length > 0
      ? Math.max(...this.steps().map(s => s.sequence ?? 0))
      : 0;

    const ref = this.modalService.open(StepFormModalComponent, { size: 'lg', centered: true });
    ref.componentInstance.trip = trip;
    ref.componentInstance.nextSequence = maxSequence + 1;
    ref.componentInstance.existingSteps = this.steps();
    if (prefillDate) {
      ref.componentInstance.initialDate = prefillDate.format('YYYY-MM-DD');
    }
    ref.result.then(
      (result: ITripPlanStep) => {
        if (result && trip.id) {
          this.loadSteps(trip.id);
        }
      },
      () => {},
    );
  }

  onCalendarCellClick(cell: CalendarCell): void {
    if (!cell.inTripRange || !this.canEdit() || this.selectedTripReadOnly()) {
      return;
    }
    this.openAddStep(cell.date);
  }

  openEditStep(step: ITripPlanStep): void {
    const trip = this.selectedTrip();
    if (!trip || !trip.id) return;
    if (this.isTripFinished(trip)) return;
    const ref = this.modalService.open(StepFormModalComponent, { size: 'lg', centered: true });
    ref.componentInstance.trip = trip;
    ref.componentInstance.step = step;
    ref.componentInstance.existingSteps = this.steps();
    ref.result.then(
      (result: ITripPlanStep) => {
        if (result && trip.id) {
          this.loadSteps(trip.id);
        }
      },
      () => {},
    );
  }

  openDeleteStep(step: ITripPlanStep): void {
    const trip = this.selectedTrip();
    if (!trip) return;
    if (this.isTripFinished(trip)) return;
    const ref = this.modalService.open(ConfirmationModalComponent, { centered: true });
    ref.componentInstance.title = this.translateService.instant('trips.deleteStep');
    ref.componentInstance.message = this.translateService.instant('trips.confirmDeleteStep');
    ref.componentInstance.confirmButtonClass = 'btn-danger';
    ref.result.then(
      result => {
        if (result === 'confirmed') {
          this.http.delete(this.deleteStep(step.id)).subscribe({
            next: () => this.loadSteps(trip.id),
          });
        }
      },
      () => {},
    );
  }

  formatDate(d?: any): string {
    const parsed = this.toDayjsDate(d);
    return parsed ? parsed.format('DD MMM YYYY HH:mm') : '';
  }

  tripDuration(trip: ITripPlan): string {
    const startDate = this.toDayjsDate(trip.startDate);
    const endDate = this.toDayjsDate(trip.endDate);
    return this.formatDurationDaysHours(startDate, endDate);
  }

  getTripTypeLabelKey(trip: ITripPlan | null | undefined): string {
    const type = trip?.tripType ?? 'PERSONAL';
    switch (type) {
      case 'FAMILY':
        return 'trips.tripType.family';
      case 'BUSINESS':
        return 'trips.tripType.business';
      default:
        return 'trips.tripType.personal';
    }
  }

  timelineEntries(): TimelineEntry[] {
    const stepEntries: TimelineEntry[] = this.steps()
      .map(step => {
        const sortDate = this.toDayjsDate(step.startDate) ?? this.toDayjsDate(step.endDate) ?? dayjs();
        return { kind: 'step' as const, sortDate, step };
      });

    const todayEntry: TimelineEntry = {
      kind: 'today',
      sortDate: dayjs().startOf('day'),
    };

    return [...stepEntries, todayEntry].sort((a, b) => {
      const dateDiff = a.sortDate.valueOf() - b.sortDate.valueOf();
      if (dateDiff !== 0) {
        return dateDiff;
      }

      if (a.kind === 'today' && b.kind !== 'today') {
        return -1;
      }
      if (a.kind !== 'today' && b.kind === 'today') {
        return 1;
      }
      if (a.kind === 'step' && b.kind === 'step') {
        const sequenceA = a.step.sequence ?? Number.MAX_SAFE_INTEGER;
        const sequenceB = b.step.sequence ?? Number.MAX_SAFE_INTEGER;
        if (sequenceA !== sequenceB) {
          return sequenceA - sequenceB;
        }
        return (a.step.id ?? Number.MAX_SAFE_INTEGER) - (b.step.id ?? Number.MAX_SAFE_INTEGER);
      }

      return 0;
    });
  }

  getCurrentDate(): dayjs.Dayjs {
    return dayjs();
  }

  getCalendarMonthLabel(): string {
    return this.calendarMonth().format('MMMM YYYY');
  }

  calendarWeekdayLabels(): string[] {
    const start = dayjs().startOf('week');
    return Array.from({ length: 7 }, (_, index) => start.add(index, 'day').format('dd'));
  }

  calendarWeeks(): CalendarCell[][] {
    const selectedMonth = this.calendarMonth();
    const monthStart = selectedMonth.startOf('month');
    const monthEnd = selectedMonth.endOf('month');
    const gridStart = monthStart.startOf('week');
    const gridEnd = monthEnd.endOf('week');

    const cells: CalendarCell[] = [];
    let cursor = gridStart;

    while (cursor.isBefore(gridEnd) || cursor.isSame(gridEnd, 'day')) {
      cells.push({
        date: cursor,
        inCurrentMonth: cursor.isSame(selectedMonth, 'month'),
        inTripRange: this.isDayInSelectedTripRange(cursor),
        isToday: cursor.isSame(dayjs(), 'day'),
        steps: this.stepsForDate(cursor),
      });
      cursor = cursor.add(1, 'day');
    }

    const weeks: CalendarCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }

  stepDateRangeLabel(step: ITripPlanStep): string {
    const startDate = this.toDayjsDate(step.startDate);
    const endDate = this.toDayjsDate(step.endDate);
    if (!startDate) {
      return '';
    }
    if (!endDate || startDate.isSame(endDate, 'day')) {
      return startDate.format('DD MMM HH:mm');
    }
    return `${startDate.format('DD MMM HH:mm')} - ${endDate.format('DD MMM HH:mm')}`;
  }

  stepDurationLabel(step: ITripPlanStep): string {
    const startDate = this.toDayjsDate(step.startDate);
    const endDate = this.toDayjsDate(step.endDate) ?? startDate;
    return this.formatDurationDaysHours(startDate, endDate);
  }

  onTripActionsChange(trip: ITripPlan, actionsJson: string | null): void {
    if (this.isTripFinished(trip)) {
      return;
    }
    this.updateTripActions(trip, actionsJson);
  }

  onTripActionsValidationError(errorKey: string | null): void {
    if (errorKey) {
      this.errorMsg.set(errorKey);
    }
  }

  hasStepsInDisplayedMonth(): boolean {
    return this.calendarWeeks().some(week => week.some(cell => cell.inCurrentMonth && cell.steps.length > 0));
  }

  ganttRows(): GanttRow[] {
    const range = this.getGanttRange();
    if (!range) {
      return [];
    }

    const rangeDuration = Math.max(1, range.end.valueOf() - range.start.valueOf());

    return this.steps().flatMap(step => {
      const stepStart = this.toDayjsDate(step.startDate) ?? this.toDayjsDate(step.endDate);
      const stepEnd = this.toDayjsDate(step.endDate) ?? stepStart;
      if (!stepStart || !stepEnd) {
        return [];
      }

      const clampedStart = stepStart.isBefore(range.start) ? range.start : stepStart;
      const clampedEnd = stepEnd.isAfter(range.end) ? range.end : stepEnd;
      const normalizedEnd = clampedEnd.isBefore(clampedStart) ? clampedStart : clampedEnd;

      const offsetPct = ((clampedStart.valueOf() - range.start.valueOf()) / rangeDuration) * 100;
      const rawWidthPct = ((normalizedEnd.valueOf() - clampedStart.valueOf()) / rangeDuration) * 100;

      return [{
        step,
        offsetPct: Math.max(0, Math.min(100, offsetPct)),
        widthPct: Math.max(1.2, Math.min(100, rawWidthPct)),
      }];
    });
  }


  ganttTodayMarkerPct(): number | null {
    const range = this.getGanttRange();
    if (!range) {
      return null;
    }

    const now = dayjs();
    if (now.isBefore(range.start) || now.isAfter(range.end)) {
      return null;
    }

    const rangeDuration = Math.max(1, range.end.valueOf() - range.start.valueOf());
    return ((now.valueOf() - range.start.valueOf()) / rangeDuration) * 100;
  }

  ganttRangeLabel(): string {
    const range = this.getGanttRange();
    if (!range) {
      return '';
    }

    return `${range.start.format('DD MMM YYYY HH:mm')} - ${range.end.format('DD MMM YYYY HH:mm')}`;
  }

  ganttTicks(): { pct: number; label: string }[] {
    const range = this.getGanttRange();
    if (!range) {
      return [];
    }

    const durationMs = range.end.valueOf() - range.start.valueOf();
    const durationDays = durationMs / (1000 * 60 * 60 * 24);

    // Choose tick count and format based on range duration
    let tickCount: number;
    let fmt: string;
    if (durationDays <= 1) {
      tickCount = 5;
      fmt = 'HH:mm';
    } else if (durationDays <= 7) {
      tickCount = 7;
      fmt = 'DD MMM HH:mm';
    } else if (durationDays <= 60) {
      tickCount = 6;
      fmt = 'DD MMM';
    } else if (durationDays <= 365) {
      tickCount = 7;
      fmt = 'DD MMM';
    } else {
      tickCount = 6;
      fmt = 'MMM YYYY';
    }

    const ticks: { pct: number; label: string }[] = [];
    for (let i = 0; i <= tickCount; i++) {
      const pct = (i / tickCount) * 100;
      const ts = range.start.valueOf() + (durationMs * i) / tickCount;
      ticks.push({ pct, label: dayjs(ts).format(fmt) });
    }
    return ticks;
  }

  ganttBarDateLabel(row: GanttRow): string {
    return this.stepDateRangeLabel(row.step);
  }

  verticalFlowEntries(): VerticalFlowEntry[] {
    const range = this.getGanttRange();
    if (!range) {
      return [];
    }

    const sortedSteps = this.sortSteps(this.steps())
      .map(step => {
        const start = this.toDayjsDate(step.startDate) ?? this.toDayjsDate(step.endDate);
        const end = this.toDayjsDate(step.endDate) ?? start;
        if (!start || !end) {
          return null;
        }

        const normalizedEnd = end.isBefore(start) ? start : end;
        return { step, start, end: normalizedEnd };
      })
      .filter((entry): entry is { step: ITripPlanStep; start: dayjs.Dayjs; end: dayjs.Dayjs } => !!entry);

    if (sortedSteps.length === 0) {
      return [];
    }

    const entries: VerticalFlowEntry[] = [];
    let cursor = range.start;

    for (const stepEntry of sortedSteps) {
      if (stepEntry.start.isAfter(cursor)) {
        entries.push({
          kind: 'gap',
          start: cursor,
          end: stepEntry.start,
          durationLabel: this.formatDurationDaysHours(cursor, stepEntry.start),
        });
      }

      entries.push({
        kind: 'step',
        step: stepEntry.step,
        start: stepEntry.start,
        end: stepEntry.end,
        durationLabel: this.formatDurationDaysHours(stepEntry.start, stepEntry.end),
      });

      if (stepEntry.end.isAfter(cursor)) {
        cursor = stepEntry.end;
      }
    }

    if (cursor.isBefore(range.end)) {
      entries.push({
        kind: 'gap',
        start: cursor,
        end: range.end,
        durationLabel: this.formatDurationDaysHours(cursor, range.end),
      });
    }

    return entries;
  }

  trackCalendarCell(_index: number, cell: CalendarCell): string {
    return cell.date.format('YYYY-MM-DD');
  }

  isTripFinished(trip: ITripPlan | null | undefined): boolean {
    if (!trip) {
      return false;
    }

    if (trip.isActive === false) {
      return true;
    }

    const endDate = this.toDayjsDate(trip.endDate);
    return !!endDate && endDate.isBefore(dayjs());
  }

  private toDayjsDate(value?: unknown): dayjs.Dayjs | null {
    if (!value) return null;
    if (dayjs.isDayjs(value)) return value;
    const parsed = dayjs(value as string | Date);
    return parsed.isValid() ? parsed : null;
  }

  private formatDurationDaysHours(startDate: dayjs.Dayjs | null, endDate: dayjs.Dayjs | null): string {
    if (!startDate || !endDate) {
      return '';
    }

    const totalHours = Math.max(0, endDate.diff(startDate, 'hour'));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return this.translateService.instant('trips.duration.daysHours', { days, hours });
  }

  private isDayInSelectedTripRange(date: dayjs.Dayjs): boolean {
    const trip = this.selectedTrip();
    if (!trip) {
      return false;
    }
    const tripStart = this.toDayjsDate(trip.startDate);
    const tripEnd = this.toDayjsDate(trip.endDate);
    if (!tripStart || !tripEnd) {
      return false;
    }
    return (date.isSame(tripStart, 'day') || date.isAfter(tripStart, 'day')) && (date.isSame(tripEnd, 'day') || date.isBefore(tripEnd, 'day'));
  }

  private stepsForDate(date: dayjs.Dayjs): ITripPlanStep[] {
    return this.steps().filter(step => {
      const startDate = this.toDayjsDate(step.startDate);
      const endDate = this.toDayjsDate(step.endDate) ?? startDate;
      if (!startDate || !endDate) {
        return false;
      }
      const startsBeforeOrOnDay = startDate.isSame(date, 'day') || startDate.isBefore(date, 'day');
      const endsAfterOrOnDay = endDate.isSame(date, 'day') || endDate.isAfter(date, 'day');
      return startsBeforeOrOnDay && endsAfterOrOnDay;
    });
  }

  private sortSteps(steps: ITripPlanStep[]): ITripPlanStep[] {
    return [...steps].sort((a, b) => {
      const startA = this.toDayjsDate(a.startDate)?.valueOf() ?? this.toDayjsDate(a.endDate)?.valueOf() ?? Number.MAX_SAFE_INTEGER;
      const startB = this.toDayjsDate(b.startDate)?.valueOf() ?? this.toDayjsDate(b.endDate)?.valueOf() ?? Number.MAX_SAFE_INTEGER;
      if (startA !== startB) {
        return startA - startB;
      }

      const endA = this.toDayjsDate(a.endDate)?.valueOf() ?? Number.MAX_SAFE_INTEGER;
      const endB = this.toDayjsDate(b.endDate)?.valueOf() ?? Number.MAX_SAFE_INTEGER;
      if (endA !== endB) {
        return endA - endB;
      }

      const sequenceA = a.sequence ?? Number.MAX_SAFE_INTEGER;
      const sequenceB = b.sequence ?? Number.MAX_SAFE_INTEGER;
      if (sequenceA !== sequenceB) {
        return sequenceA - sequenceB;
      }


      return (a.id ?? Number.MAX_SAFE_INTEGER) - (b.id ?? Number.MAX_SAFE_INTEGER);
    });
  }

  private updateTripActions(trip: ITripPlan, actionsJson: string | null): void {
    this.isUpdatingActions.set(true);
    this.errorMsg.set(null);

    const updatedTrip: ITripPlan = {
      ...trip,
      actionsJson,
    };

    this.tripPlanEntityService.update(updatedTrip).subscribe({
      next: response => {
        const savedTrip = response.body ?? updatedTrip;
        this.trips.update(current => current.map(item => (item.id === savedTrip.id ? savedTrip : item)));
        if (this.selectedTrip()?.id === savedTrip.id) {
          this.selectedTrip.set(savedTrip);
        }
        this.isUpdatingActions.set(false);
      },
      error: () => {
        this.isUpdatingActions.set(false);
        this.errorMsg.set('trips.errors.saveFailed');
      },
    });
  }

  private getGanttRange(): { start: dayjs.Dayjs; end: dayjs.Dayjs } | null {
    const selectedTrip = this.selectedTrip();
    const tripStart = this.toDayjsDate(selectedTrip?.startDate);
    const tripEnd = this.toDayjsDate(selectedTrip?.endDate);

    if (tripStart && tripEnd) {
      const normalizedEnd = tripEnd.isBefore(tripStart) ? tripStart : tripEnd;
      return { start: tripStart, end: normalizedEnd };
    }

    const stepsWithDates = this.steps()
      .map(step => ({
        start: this.toDayjsDate(step.startDate) ?? this.toDayjsDate(step.endDate),
        end: this.toDayjsDate(step.endDate) ?? this.toDayjsDate(step.startDate),
      }))
      .filter(stepRange => !!stepRange.start && !!stepRange.end) as Array<{ start: dayjs.Dayjs; end: dayjs.Dayjs }>;

    if (stepsWithDates.length === 0) {
      return null;
    }

    const start = stepsWithDates.reduce((min, current) => (current.start.isBefore(min) ? current.start : min), stepsWithDates[0].start);
    const end = stepsWithDates.reduce((max, current) => (current.end.isAfter(max) ? current.end : max), stepsWithDates[0].end);
    return { start, end };
  }
}

