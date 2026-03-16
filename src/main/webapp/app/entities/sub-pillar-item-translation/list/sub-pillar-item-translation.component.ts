import { Component, NgZone, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, filter, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { FormsModule } from '@angular/forms';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { ISubPillarItemTranslation } from '../sub-pillar-item-translation.model';
import { EntityArrayResponseType, SubPillarItemTranslationService } from '../service/sub-pillar-item-translation.service';
import { SubPillarItemTranslationDeleteDialogComponent } from '../delete/sub-pillar-item-translation-delete-dialog.component';

@Component({
  selector: 'jhi-sub-pillar-item-translation',
  templateUrl: './sub-pillar-item-translation.component.html',
  imports: [RouterModule, FormsModule, SharedModule, SortDirective, SortByDirective],
})
export class SubPillarItemTranslationComponent implements OnInit {
  subscription: Subscription | null = null;
  subPillarItemTranslations = signal<ISubPillarItemTranslation[]>([]);
  isLoading = false;

  sortState = sortStateSignal({});

  public readonly router = inject(Router);
  protected readonly subPillarItemTranslationService = inject(SubPillarItemTranslationService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);

  trackId = (item: ISubPillarItemTranslation): number =>
    this.subPillarItemTranslationService.getSubPillarItemTranslationIdentifier(item);

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => {
          if (this.subPillarItemTranslations().length === 0) {
            this.load();
          } else {
            this.subPillarItemTranslations.set(this.refineData(this.subPillarItemTranslations()));
          }
        }),
      )
      .subscribe();
  }

  delete(subPillarItemTranslation: ISubPillarItemTranslation): void {
    const modalRef = this.modalService.open(SubPillarItemTranslationDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.subPillarItemTranslation = subPillarItemTranslation;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        tap(() => this.load()),
      )
      .subscribe();
  }

  load(): void {
    this.queryBackend().subscribe({
      next: (res: EntityArrayResponseType) => {
        this.onResponseSuccess(res);
      },
    });
  }

  navigateToWithComponentValues(event: SortState): void {
    this.handleNavigation(event);
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.subPillarItemTranslations.set(this.refineData(dataFromBody));
  }

  protected refineData(data: ISubPillarItemTranslation[]): ISubPillarItemTranslation[] {
    const { predicate, order } = this.sortState();
    return predicate && order ? data.sort(this.sortService.startSort({ predicate, order })) : data;
  }

  protected fillComponentAttributesFromResponseBody(data: ISubPillarItemTranslation[] | null): ISubPillarItemTranslation[] {
    return data ?? [];
  }

  protected queryBackend(): Observable<EntityArrayResponseType> {
    this.isLoading = true;
    const queryObject: any = {
      sort: this.sortService.buildSortParam(this.sortState()),
    };
    return this.subPillarItemTranslationService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

  protected handleNavigation(sortState: SortState): void {
    const queryParamsObj = {
      sort: this.sortService.buildSortParam(sortState),
    };

    this.ngZone.run(() => {
      this.router.navigate(['./'], {
        relativeTo: this.activatedRoute,
        queryParams: queryParamsObj,
      });
    });
  }
}
