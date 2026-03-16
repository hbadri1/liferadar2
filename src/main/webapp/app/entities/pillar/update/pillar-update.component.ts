import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IPillar } from '../pillar.model';
import { PillarService } from '../service/pillar.service';
import { PillarFormGroup, PillarFormService } from './pillar-form.service';

@Component({
  selector: 'jhi-pillar-update',
  templateUrl: './pillar-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class PillarUpdateComponent implements OnInit {
  isSaving = false;
  pillar: IPillar | null = null;

  protected pillarService = inject(PillarService);
  protected pillarFormService = inject(PillarFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: PillarFormGroup = this.pillarFormService.createPillarFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ pillar }) => {
      this.pillar = pillar;
      if (pillar) {
        this.updateForm(pillar);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const pillar = this.pillarFormService.getPillar(this.editForm);
    if (pillar.id !== null) {
      this.subscribeToSaveResponse(this.pillarService.update(pillar));
    } else {
      this.subscribeToSaveResponse(this.pillarService.create(pillar));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPillar>>): void {
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

  protected updateForm(pillar: IPillar): void {
    this.pillar = pillar;
    this.pillarFormService.resetForm(this.editForm, pillar);
  }
}
