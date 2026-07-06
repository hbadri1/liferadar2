import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import dayjs from 'dayjs/esm';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IMyDocument, IMyDocumentSummary, NewMyDocument } from './my-document.model';

export type PartialUpdateMyDocument = Partial<IMyDocument> & Pick<IMyDocument, 'id'>;

type RestOf<T extends IMyDocument | NewMyDocument | PartialUpdateMyDocument> = Omit<
  T,
  'issueDate' | 'renewalDate' | 'createdDate' | 'lastModifiedDate'
> & {
  issueDate?: string | null;
  renewalDate?: string | null;
  createdDate?: string | null;
  lastModifiedDate?: string | null;
};

export type RestMyDocument = RestOf<IMyDocument>;
export type NewRestMyDocument = RestOf<NewMyDocument>;
export type PartialUpdateRestMyDocument = RestOf<PartialUpdateMyDocument>;

export type EntityResponseType = HttpResponse<IMyDocument>;
export type EntityArrayResponseType = HttpResponse<IMyDocument[]>;

@Injectable({ providedIn: 'root' })
export class MyDocumentService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/my-documents');

  create(document: NewMyDocument): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(document);
    return this.http
      .post<RestMyDocument>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(document: IMyDocument): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(document);
    return this.http
      .put<RestMyDocument>(`${this.resourceUrl}/${document.id}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(document: PartialUpdateMyDocument): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(document);
    return this.http
      .patch<RestMyDocument>(`${this.resourceUrl}/${document.id}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: Record<string, unknown>): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req ?? {});
    return this.http
      .get<RestMyDocument[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestMyDocument>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getSummary(): Observable<HttpResponse<IMyDocumentSummary>> {
    return this.http.get<IMyDocumentSummary>(`${this.resourceUrl}/summary`, { observe: 'response' });
  }

  private convertDateFromClient<T extends IMyDocument | NewMyDocument | PartialUpdateMyDocument>(document: T): RestOf<T> {
    const value = document as Partial<IMyDocument>;
    return {
      ...document,
      issueDate: value.issueDate ? value.issueDate.format(DATE_FORMAT) : null,
      renewalDate: value.renewalDate ? value.renewalDate.format(DATE_FORMAT) : null,
      createdDate: value.createdDate ? value.createdDate.toISOString() : null,
      lastModifiedDate: value.lastModifiedDate ? value.lastModifiedDate.toISOString() : null,
    };
  }

  private convertDateFromServer(rest: RestMyDocument): IMyDocument {
    return {
      ...rest,
      issueDate: rest.issueDate ? dayjs(rest.issueDate) : undefined,
      renewalDate: dayjs(rest.renewalDate),
      createdDate: rest.createdDate ? dayjs(rest.createdDate) : undefined,
      lastModifiedDate: rest.lastModifiedDate ? dayjs(rest.lastModifiedDate) : undefined,
    };
  }

  private convertResponseFromServer(res: HttpResponse<RestMyDocument>): HttpResponse<IMyDocument> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  private convertResponseArrayFromServer(res: HttpResponse<RestMyDocument[]>): HttpResponse<IMyDocument[]> {
    return res.clone({
      body: res.body ? res.body.map(document => this.convertDateFromServer(document)) : null,
    });
  }
}

