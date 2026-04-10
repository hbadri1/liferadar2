import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs/esm';
import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { ConfirmationModalComponent } from 'app/home/confirmation-modal.component';
import { TripFormModalComponent } from './trip-form-modal.component';
import { StepFormModalComponent } from './step-form-modal.component';
import { ITripPlan } from 'app/entities/trip-plan/trip-plan.model';
import { ITripPlanStep } from 'app/entities/trip-plan-step/trip-plan-step.model';

type TimelineEntry =
  | { kind: 'today'; sortDate: dayjs.Dayjs }
  | { kind: 'step'; sortDate: dayjs.Dayjs; step: ITripPlanStep };

type TripViewMode = 'timeline' | 'calendar';

type CalendarCell = {
  date: dayjs.Dayjs;
  inCurrentMonth: boolean;
  inTripRange: boolean;
  isToday: boolean;
  steps: ITripPlanStep[];
};

@Component({
  selector: 'jhi-trips',
  templateUrl: './trips.component.html',
  styleUrl: './trips.component.scss',
  imports: [SharedModule],
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

  account = inject(AccountService).trackCurrentAccount();

  canEdit = computed(() => {
    const authorities = (this.account()?.authorities ?? [])
      .map(a => (a ?? '').toString().trim().toUpperCase());
    return (
      authorities.includes('ROLE_USER') || authorities.includes('USER') ||
      authorities.includes('ROLE_FAMILY_ADMIN') || authorities.includes('FAMILY_ADMIN') ||
      authorities.includes('ROLE_ADMIN') || authorities.includes('ADMIN')
    );
  });

  private http = inject(HttpClient);
  private modalService = inject(NgbModal);
  private appConfig = inject(ApplicationConfigService);
  private translateService = inject(TranslateService);

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

  openAddStep(): void {
    const trip = this.selectedTrip();
    if (!trip || !trip.id) return;

    // Calculate next sequence based on max existing sequence
    const maxSequence = this.steps().length > 0
      ? Math.max(...this.steps().map(s => s.sequence ?? 0))
      : 0;

    const ref = this.modalService.open(StepFormModalComponent, { size: 'lg', centered: true });
    ref.componentInstance.trip = trip;
    ref.componentInstance.nextSequence = maxSequence + 1;
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

  openEditStep(step: ITripPlanStep): void {
    const trip = this.selectedTrip();
    if (!trip || !trip.id) return;
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
    return parsed ? parsed.format('DD MMM YYYY') : '';
  }

  tripDuration(trip: ITripPlan): number {
    const startDate = this.toDayjsDate(trip.startDate);
    const endDate = this.toDayjsDate(trip.endDate);
    if (!startDate || !endDate) return 0;
    return endDate.diff(startDate, 'day') + 1;
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
      return startDate.format('DD MMM');
    }
    return `${startDate.format('DD MMM')} - ${endDate.format('DD MMM')}`;
  }

  hasStepsInDisplayedMonth(): boolean {
    return this.calendarWeeks().some(week => week.some(cell => cell.inCurrentMonth && cell.steps.length > 0));
  }

  trackCalendarCell(_index: number, cell: CalendarCell): string {
    return cell.date.format('YYYY-MM-DD');
  }

  private toDayjsDate(value?: unknown): dayjs.Dayjs | null {
    if (!value) return null;
    if (dayjs.isDayjs(value)) return value;
    const parsed = dayjs(value as string | Date);
    return parsed.isValid() ? parsed : null;
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
}

