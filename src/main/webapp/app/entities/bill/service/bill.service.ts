import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IBill, NewBill, BillMetrics } from '../bill.model';

export type PartialUpdateBill = Partial<IBill> & Pick<IBill, 'id'>;

export interface ITodoAppPushRequest {
  billId: number;
  provider: string;
  projectId?: string;
  title?: string;
  dueAt?: string;
}

export interface ITodoAppPushResponse {
  provider: string;
  externalTaskId: string;
  message: string;
}

export interface ITickTickProject {
  id: string;
  name: string;
}

export interface ITickTickProjectsResponse {
  defaultProjectName?: string | null;
  projects: ITickTickProject[];
}

type RestOf<T extends IBill | NewBill | PartialUpdateBill> = Omit<T, 'billDate' | 'dueDate' | 'paidDate' | 'createdDate' | 'lastModifiedDate'> & {
  billDate?: string | null;
  dueDate?: string | null;
  paidDate?: string | null;
  createdDate?: string | null;
  lastModifiedDate?: string | null;
};

export type RestBill = RestOf<IBill>;
export type NewRestBill = RestOf<NewBill>;
export type PartialUpdateRestBill = RestOf<PartialUpdateBill>;

export type EntityResponseType = HttpResponse<IBill>;
export type EntityArrayResponseType = HttpResponse<IBill[]>;

@Injectable({ providedIn: 'root' })
export class BillService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/bills');
  protected todoAppsUrl = this.applicationConfigService.getEndpointFor('api/todoapps');

  create(bill: NewBill): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(bill);
    return this.http.post<RestBill>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(bill: IBill): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(bill);
    return this.http
      .put<RestBill>(`${this.resourceUrl}/${this.getBillIdentifier(bill)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(bill: PartialUpdateBill): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(bill);
    return this.http
      .patch<RestBill>(`${this.resourceUrl}/${this.getBillIdentifier(bill)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestBill>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestBill[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  queryMy(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestBill[]>(`${this.resourceUrl}/my`, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  markAsPaid(id: number): Observable<EntityResponseType> {
    return this.http
      .post<RestBill>(`${this.resourceUrl}/${id}/mark-paid`, {}, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  getMetrics(): Observable<HttpResponse<BillMetrics>> {
    return this.http.get<BillMetrics>(`${this.resourceUrl}/metrics/dashboard`, { observe: 'response' });
  }

  getPendingBills(): Observable<EntityArrayResponseType> {
    return this.http
      .get<RestBill[]>(`${this.resourceUrl}/status/pending`, { observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  getOverdueBills(): Observable<EntityArrayResponseType> {
    return this.http
      .get<RestBill[]>(`${this.resourceUrl}/status/overdue`, { observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  getBillsBySubscription(subscriptionId: number): Observable<EntityArrayResponseType> {
    return this.http
      .get<RestBill[]>(`${this.resourceUrl}/subscription/${subscriptionId}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  getBillsByDateRange(startDate: dayjs.Dayjs, endDate: dayjs.Dayjs): Observable<EntityArrayResponseType> {
    const params = {
      startDate: startDate.format(DATE_FORMAT),
      endDate: endDate.format(DATE_FORMAT),
    };
    return this.http
      .get<RestBill[]>(`${this.resourceUrl}/date-range`, { params, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  pushToTodoApp(request: ITodoAppPushRequest): Observable<HttpResponse<ITodoAppPushResponse>> {
    return this.http.post<ITodoAppPushResponse>(`${this.todoAppsUrl}/push`, request, { observe: 'response' });
  }

  getTickTickProjects(): Observable<HttpResponse<ITickTickProjectsResponse>> {
    return this.http.get<ITickTickProjectsResponse>(`${this.todoAppsUrl}/ticktick/projects`, { observe: 'response' });
  }

  getBillIdentifier(bill: Pick<IBill, 'id'>): number {
    return bill.id!;
  }

  compareBill(o1: Pick<IBill, 'id'> | null, o2: Pick<IBill, 'id'> | null): boolean {
    return o1 && o2 ? this.getBillIdentifier(o1) === this.getBillIdentifier(o2) : o1 === o2;
  }

  addBillToCollectionIfMissing<Type extends Pick<IBill, 'id'>>(
    billCollection: Type[],
    ...billsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const bills: Type[] = billsToCheck.filter(isPresent);
    if (bills.length > 0) {
      const billCollectionIdentifiers = billCollection.map(billItem => this.getBillIdentifier(billItem));
      const billsToAdd = bills.filter(billItem => {
        const billIdentifier = this.getBillIdentifier(billItem);
        if (billCollectionIdentifiers.includes(billIdentifier)) {
          return false;
        }
        billCollectionIdentifiers.push(billIdentifier);
        return true;
      });
      return [...billsToAdd, ...billCollection];
    }
    return billCollection;
  }

  protected convertDateFromClient<T extends IBill | NewBill | PartialUpdateBill>(bill: T): RestOf<T> {
    return {
      ...bill,
      billDate: bill.billDate?.format(DATE_FORMAT) ?? null,
      dueDate: bill.dueDate?.format(DATE_FORMAT) ?? null,
      paidDate: bill.paidDate?.format(DATE_FORMAT) ?? null,
      createdDate: bill.createdDate?.toISOString() ?? null,
      lastModifiedDate: bill.lastModifiedDate?.toISOString() ?? null,
    };
  }

  protected convertDateFromServer(restBill: RestBill): IBill {
    return {
      ...restBill,
      billDate: dayjs(restBill.billDate),
      dueDate: restBill.dueDate ? dayjs(restBill.dueDate) : undefined,
      paidDate: restBill.paidDate ? dayjs(restBill.paidDate) : undefined,
      createdDate: restBill.createdDate ? dayjs(restBill.createdDate) : undefined,
      lastModifiedDate: restBill.lastModifiedDate ? dayjs(restBill.lastModifiedDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestBill>): HttpResponse<IBill> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestBill[]>): HttpResponse<IBill[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}

