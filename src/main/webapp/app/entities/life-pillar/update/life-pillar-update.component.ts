import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ILifePillar } from '../life-pillar.model';
import { LifePillarService } from '../service/life-pillar.service';
import { LifePillarFormGroup, LifePillarFormService } from './life-pillar-form.service';

@Component({
  selector: 'jhi-life-pillar-update',
  templateUrl: './life-pillar-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class LifePillarUpdateComponent implements OnInit {
  isSaving = false;
  lifePillar: ILifePillar | null = null;

  protected lifePillarService = inject(LifePillarService);
  protected lifePillarFormService = inject(LifePillarFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: LifePillarFormGroup = this.lifePillarFormService.createLifePillarFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ lifePillar }) => {
      this.lifePillar = lifePillar;
      if (lifePillar) {
        this.updateForm(lifePillar);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const lifePillar = this.lifePillarFormService.getLifePillar(this.editForm);
    if (lifePillar.id !== null) {
      this.subscribeToSaveResponse(this.lifePillarService.update(lifePillar));
    } else {
      this.subscribeToSaveResponse(this.lifePillarService.create(lifePillar));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ILifePillar>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(lifePillar: ILifePillar): void {
    this.lifePillar = lifePillar;
    this.lifePillarFormService.resetForm(this.editForm, lifePillar);
  }
}
