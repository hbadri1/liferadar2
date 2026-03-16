import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IPillar } from 'app/entities/pillar/pillar.model';
import { PillarService } from 'app/entities/pillar/service/pillar.service';
import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { ISubPillar } from '../sub-pillar.model';
import { SubPillarService } from '../service/sub-pillar.service';
import { SubPillarFormGroup, SubPillarFormService } from './sub-pillar-form.service';

@Component({
  selector: 'jhi-sub-pillar-update',
  templateUrl: './sub-pillar-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class SubPillarUpdateComponent implements OnInit {
  isSaving = false;
  subPillar: ISubPillar | null = null;

  pillarsSharedCollection: IPillar[] = [];

  protected subPillarService = inject(SubPillarService);
  protected subPillarFormService = inject(SubPillarFormService);
  protected pillarService = inject(PillarService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: SubPillarFormGroup = this.subPillarFormService.createSubPillarFormGroup();

  comparePillar = (o1: IPillar | null, o2: IPillar | null): boolean =>
    this.pillarService.comparePillar(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ subPillar }) => {
      this.subPillar = subPillar;
      if (subPillar) {
        this.updateForm(subPillar);
      }

      this.loadRelationshipsOptions();
      this.applyPillarFromQueryParam();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const subPillar = this.subPillarFormService.getSubPillar(this.editForm);
    if (subPillar.id !== null) {
      this.subscribeToSaveResponse(this.subPillarService.update(subPillar));
    } else {
      this.subscribeToSaveResponse(this.subPillarService.create(subPillar));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISubPillar>>): void {
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

  protected updateForm(subPillar: ISubPillar): void {
    this.subPillar = subPillar;
    this.subPillarFormService.resetForm(this.editForm, subPillar);

    this.pillarsSharedCollection = this.pillarService.addPillarToCollectionIfMissing<IPillar>(
      this.pillarsSharedCollection,
      subPillar.pillar,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.pillarService
      .query()
      .pipe(map((res: HttpResponse<IPillar[]>) => res.body ?? []))
      .pipe(
        map((pillars: IPillar[]) =>
          this.pillarService.addPillarToCollectionIfMissing<IPillar>(
            pillars,
            this.subPillar?.pillar,
          ),
        ),
      )
      .subscribe((pillars: IPillar[]) => (this.pillarsSharedCollection = pillars));
  }

  protected applyPillarFromQueryParam(): void {
    const pillarIdParam = this.activatedRoute.snapshot.queryParamMap.get('pillarId');
    if (!pillarIdParam || this.subPillar !== null) {
      return;
    }

    const pillarId = Number(pillarIdParam);
    if (Number.isNaN(pillarId)) {
      return;
    }

    this.pillarService.find(pillarId).subscribe(({ body }) => {
      if (!body) {
        return;
      }

      this.editForm.patchValue({ pillar: body });
      this.pillarsSharedCollection = this.pillarService.addPillarToCollectionIfMissing<IPillar>(
        this.pillarsSharedCollection,
        body,
      );
    });
  }
}
