import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs/esm';
import SharedModule from 'app/shared/shared.module';
import { TripPlanStepService } from 'app/entities/trip-plan-step/service/trip-plan-step.service';
import { ITripPlanStep, NewTripPlanStep } from 'app/entities/trip-plan-step/trip-plan-step.model';
import { ITripPlan } from 'app/entities/trip-plan/trip-plan.model';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IMapboxPlace, MapboxIntegrationService } from './mapbox-integration.service';

@Component({
  selector: 'jhi-step-form-modal',
  templateUrl: './step-form-modal.component.html',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, FormsModule],
})
export class StepFormModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() step: ITripPlanStep | null = null;
  @Input() trip!: ITripPlan;
  @Input() nextSequence = 1;
  @Input() existingSteps: ITripPlanStep[] = [];
  @ViewChild('mapCanvas') mapCanvas?: ElementRef<HTMLDivElement>;

  readonly hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

  isSaving = signal(false);
  errorMsg = signal<string | null>(null);
  warningMsg = signal<string | null>(null);
  mapEnabled = signal(false);
  mapLoading = signal(false);
  mapErrorMsg = signal<string | null>(null);
  searchResults = signal<IMapboxPlace[]>([]);
  isSearching = signal(false);
  searchTerm = '';

  protected activeModal = inject(NgbActiveModal);
  private fb = inject(FormBuilder);
  private stepService = inject(TripPlanStepService);
  private mapboxService = inject(MapboxIntegrationService);

  private map: any;
  private marker: any;
  private mapboxgl: any;

  editForm = this.fb.group({
    actionName: ['', [Validators.required, Validators.maxLength(200)]],
    locationName: ['', [Validators.maxLength(255)]],
    startDate: ['', [Validators.required]],
    startHour: ['00', [Validators.required]],
    endDate: ['', [Validators.required]],
    endHour: ['00', [Validators.required]],
    notes: ['', [Validators.maxLength(800)]],
    latitude: [null as number | null],
    longitude: [null as number | null],
  });

  get isEdit(): boolean {
    return this.step !== null;
  }

  ngOnInit(): void {
    if (this.step) {
      this.editForm.patchValue({
        actionName: this.step.actionName ?? '',
        locationName: this.step.locationName ?? '',
        startDate: this.step.startDate ? dayjs(this.step.startDate).format('YYYY-MM-DD') : '',
        startHour: this.step.startDate ? dayjs(this.step.startDate).format('HH') : '00',
        endDate: this.step.endDate ? dayjs(this.step.endDate).format('YYYY-MM-DD') : '',
        endHour: this.step.endDate ? dayjs(this.step.endDate).format('HH') : '00',
        notes: this.step.notes ?? '',
        latitude: this.step.latitude ?? null,
        longitude: this.step.longitude ?? null,
      });
    }
  }

  ngAfterViewInit(): void {
    void this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }

  save(): void {
    if (this.editForm.invalid) return;
    this.isSaving.set(true);
    this.errorMsg.set(null);
    this.warningMsg.set(null);

    const val = this.editForm.getRawValue();
    const startDate = dayjs(`${val.startDate!}T${val.startHour!}:00`, DATE_TIME_FORMAT);
    const endDate = dayjs(`${val.endDate!}T${val.endHour!}:00`, DATE_TIME_FORMAT);

    // Validate step dates
    if (!this.validateStepDates(startDate, endDate)) {
      this.isSaving.set(false);
      return;
    }

    if (this.step) {
      const updated: ITripPlanStep = {
        ...this.step,
        actionName: val.actionName!,
        locationName: val.locationName ?? null,
        startDate,
        endDate,
        notes: val.notes ?? null,
        latitude: val.latitude ?? null,
        longitude: val.longitude ?? null,
      };
      this.stepService.update(updated).subscribe({
        next: res => {
          this.isSaving.set(false);
          this.activeModal.close(res.body);
        },
        error: (err) => {
          console.error('Error updating step:', err);
          this.isSaving.set(false);
          this.errorMsg.set('trips.errors.saveFailed');
        },
      });
    } else {
      const newStep: NewTripPlanStep = {
        id: null,
        actionName: val.actionName!,
        locationName: val.locationName ?? null,
        startDate,
        endDate,
        notes: val.notes ?? null,
        latitude: val.latitude ?? null,
        longitude: val.longitude ?? null,
        sequence: this.nextSequence,
        tripPlan: { id: this.trip.id } as ITripPlan,
      };
      this.stepService.create(newStep).subscribe({
        next: res => {
          this.isSaving.set(false);
          this.activeModal.close(res.body);
        },
        error: (err) => {
          console.error('Error creating step:', err);
          this.isSaving.set(false);
          this.errorMsg.set('trips.errors.saveFailed');
        },
      });
    }
  }

  private validateStepDates(startDate: dayjs.Dayjs, endDate: dayjs.Dayjs): boolean {
    this.errorMsg.set(null);
    this.warningMsg.set(null);

    // Check if startDate is after endDate
    if (startDate.isAfter(endDate)) {
      this.errorMsg.set('trips.errors.stepStartDateAfterEndDate');
      return false;
    }

    // Check if step dates are within trip date range
    const tripStart = dayjs(this.trip.startDate);
    const tripEnd = dayjs(this.trip.endDate);

    if (startDate.isBefore(tripStart)) {
      this.errorMsg.set('trips.errors.stepStartDateBeforeTripStart');
      return false;
    }

    if (endDate.isAfter(tripEnd)) {
      this.errorMsg.set('trips.errors.stepEndDateAfterTripEnd');
      return false;
    }

    const overlapsExistingStep = this.existingSteps.some(existingStep => {
      if (this.step?.id != null && existingStep.id === this.step.id) {
        return false;
      }

      const existingStart = dayjs(existingStep.startDate);
      const existingEnd = dayjs(existingStep.endDate);

      return !startDate.isAfter(existingEnd) && !existingStart.isAfter(endDate);
    });

    if (overlapsExistingStep) {
      this.warningMsg.set('trips.warnings.stepDatesOverlap');
    }

    return true;
  }

  searchPlace(): void {
    const query = this.searchTerm.trim();
    if (!query || query.length < 2 || !this.mapEnabled()) {
      this.searchResults.set([]);
      return;
    }

    this.isSearching.set(true);
    this.mapboxService.search(query).subscribe({
      next: places => {
        this.searchResults.set(places);
        this.isSearching.set(false);
      },
      error: () => {
        this.searchResults.set([]);
        this.isSearching.set(false);
      },
    });
  }

  selectPlace(place: IMapboxPlace): void {
    this.editForm.patchValue({
      locationName: place.name,
      latitude: place.latitude,
      longitude: place.longitude,
    });
    this.searchResults.set([]);

    if (this.map) {
      this.map.flyTo({ center: [place.longitude, place.latitude], zoom: 12 });
      this.setMarker(place.longitude, place.latitude);
    }
  }

  clearPin(): void {
    this.editForm.patchValue({ latitude: null, longitude: null });
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }
  }

  hasPin(): boolean {
    const lat = this.editForm.get('latitude')?.value;
    const lon = this.editForm.get('longitude')?.value;
    return lat != null && lon != null;
  }

  pinLabel(): string {
    const lat = this.editForm.get('latitude')?.value;
    const lon = this.editForm.get('longitude')?.value;
    if (lat == null || lon == null) {
      return '';
    }
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }

  private async initMap(): Promise<void> {
    if (!this.mapCanvas) {
      return;
    }

    this.mapLoading.set(true);
    this.mapErrorMsg.set(null);

    this.mapboxService.getConfig().subscribe({
      next: async cfg => {
        if (!cfg.enabled || !cfg.publicToken) {
          this.mapEnabled.set(false);
          this.mapLoading.set(false);
          return;
        }

        try {
          this.mapboxgl = (await import('mapbox-gl')).default;
          this.mapboxgl.accessToken = cfg.publicToken;
          this.map = new this.mapboxgl.Map({
            container: this.mapCanvas!.nativeElement,
            style: cfg.styleUrl,
            center: [13.405, 52.52],
            zoom: 2.5,
          });

          this.map.on('click', (event: any) => {
            const lng = event.lngLat.lng as number;
            const lat = event.lngLat.lat as number;
            this.editForm.patchValue({ latitude: lat, longitude: lng });
            this.setMarker(lng, lat);
            this.mapboxService.reverse(lng, lat).subscribe({
              next: place => {
                if (place?.name) {
                  this.editForm.patchValue({ locationName: place.name });
                }
              },
            });
          });

          this.map.on('load', () => {
            const lat = this.editForm.get('latitude')?.value;
            const lon = this.editForm.get('longitude')?.value;
            if (lat != null && lon != null) {
              this.map.flyTo({ center: [lon, lat], zoom: 11 });
              this.setMarker(lon, lat);
            }
          });

          this.mapEnabled.set(true);
        } catch {
          this.mapEnabled.set(false);
          this.mapErrorMsg.set('trips.errors.mapUnavailable');
        } finally {
          this.mapLoading.set(false);
        }
      },
      error: () => {
        this.mapEnabled.set(false);
        this.mapLoading.set(false);
        this.mapErrorMsg.set('trips.errors.mapUnavailable');
      },
    });
  }

  private setMarker(longitude: number, latitude: number): void {
    if (!this.map || !this.mapboxgl) {
      return;
    }

    if (!this.marker) {
      this.marker = new this.mapboxgl.Marker({ color: '#0d6efd' }).setLngLat([longitude, latitude]).addTo(this.map);
      return;
    }

    this.marker.setLngLat([longitude, latitude]);
  }
}

