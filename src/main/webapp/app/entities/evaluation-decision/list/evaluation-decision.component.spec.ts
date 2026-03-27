import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { HttpHeaders, HttpResponse, provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs/esm';

import { sampleWithRequiredData } from '../evaluation-decision.test-samples';
import { EvaluationDecisionService } from '../service/evaluation-decision.service';
import { AlertService } from 'app/core/util/alert.service';

import { EvaluationDecisionComponent } from './evaluation-decision.component';
type SpyInstance<T = unknown> = jest.SpyInstance<T>;

describe('EvaluationDecision Management Component', () => {
  let comp: EvaluationDecisionComponent;
  let fixture: ComponentFixture<EvaluationDecisionComponent>;
  let service: EvaluationDecisionService;
  let routerNavigateSpy: SpyInstance<Promise<boolean>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EvaluationDecisionComponent],
      providers: [
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              defaultSort: 'id,asc',
            }),
            queryParamMap: of(
              jest.requireActual('@angular/router').convertToParamMap({
                page: '1',
                size: '1',
                sort: 'id,desc',
                'filter[someId.in]': 'dc4279ea-cfb9-11ec-9d64-0242ac120002',
              }),
            ),
            snapshot: {
              queryParams: {},
              queryParamMap: jest.requireActual('@angular/router').convertToParamMap({
                page: '1',
                size: '1',
                sort: 'id,desc',
                'filter[someId.in]': 'dc4279ea-cfb9-11ec-9d64-0242ac120002',
              }),
            },
          },
        },
      ],
    })
      .overrideTemplate(EvaluationDecisionComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(EvaluationDecisionComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(EvaluationDecisionService);
    routerNavigateSpy = jest.spyOn(comp.router, 'navigate');

    jest
      .spyOn(service, 'query')
      .mockReturnValueOnce(
        of(
          new HttpResponse({
            body: [{ id: 25936 }],
            headers: new HttpHeaders({
              link: '<http://localhost/api/foo?page=1&size=20>; rel="next"',
            }),
          }),
        ),
      )
      .mockReturnValueOnce(
        of(
          new HttpResponse({
            body: [{ id: 11812 }],
            headers: new HttpHeaders({
              link: '<http://localhost/api/foo?page=0&size=20>; rel="prev",<http://localhost/api/foo?page=2&size=20>; rel="next"',
            }),
          }),
        ),
      );
  });

  it('should call load all on init', () => {
    // WHEN
    comp.ngOnInit();

    // THEN
    expect(service.query).toHaveBeenCalled();
    expect(comp.evaluationDecisions()[0]).toEqual(expect.objectContaining({ id: 25936 }));
  });

  describe('trackId', () => {
    it('should forward to evaluationDecisionService', () => {
      const entity = { id: 25936 };
      jest.spyOn(service, 'getEvaluationDecisionIdentifier');
      const id = comp.trackId(entity);
      expect(service.getEvaluationDecisionIdentifier).toHaveBeenCalledWith(entity);
      expect(id).toBe(entity.id);
    });
  });

  it('should calculate the sort attribute for a non-id attribute', () => {
    // WHEN
    comp.navigateToWithComponentValues({ predicate: 'non-existing-column', order: 'asc' });

    // THEN
    expect(routerNavigateSpy).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        queryParams: expect.objectContaining({
          sort: ['non-existing-column,asc'],
        }),
      }),
    );
  });

  it('should calculate the sort attribute for an id', () => {
    // WHEN
    comp.ngOnInit();

    // THEN
    expect(service.query).toHaveBeenLastCalledWith(expect.objectContaining({ sort: ['id,desc'] }));
  });

  describe('pushToIntegration', () => {
    let ngbModal: NgbModal;
    let alertService: AlertService;

    beforeEach(() => {
      ngbModal = (comp as any).modalService;
      jest.spyOn(ngbModal, 'open').mockReturnValue({ componentInstance: {} } as any);
      alertService = TestBed.inject(AlertService);
    });

    it.each(['microsoft-todo', 'todoist'])('should show coming-soon popup for %s and not push integration', provider => {
      const executeSpy = jest.spyOn<any, any>(comp as any, 'executeIntegrationPush');

      comp.pushToIntegration(sampleWithRequiredData, provider);

      expect(ngbModal.open).toHaveBeenCalled();
      expect(executeSpy).not.toHaveBeenCalled();
    });

    it('should not push when due date is in the past', () => {
      const openTickTickModalSpy = jest.spyOn<any, any>(comp as any, 'openTickTickProjectModal');
      const overdueDecision = {
        ...sampleWithRequiredData,
        date: dayjs().subtract(1, 'day'),
      };

      comp.pushToIntegration(overdueDecision, 'ticktick');

      expect(openTickTickModalSpy).not.toHaveBeenCalled();
    });

    it('should show integration error translation key when projects loading fails', () => {
      const alertSpy = jest.spyOn(alertService, 'addAlert');
      jest.spyOn(service, 'getTickTickProjects').mockReturnValue(
        throwError(() => ({ error: { message: 'error.integrationerror', title: 'TickTick is not connected to your account.' } })),
      );

      comp.pushToIntegration(sampleWithRequiredData, 'ticktick');

      expect(alertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'danger',
          translationKey: 'error.integrationerror',
        }),
      );
    });

    it('should use integration error translation key when push fails before provider authorization', () => {
      const alertSpy = jest.spyOn(alertService, 'addAlert');
      jest.spyOn(service, 'pushToTodoApp').mockReturnValue(
        throwError(() => ({
          error: {
            message: 'error.integrationerror',
            detail: 'This provider (ticktick) is not connected to your account. Please authorize the provider first.',
          },
        })),
      );

      (comp as any).executeIntegrationPush(sampleWithRequiredData, 'ticktick');

      expect(alertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'danger',
          translationKey: 'error.integrationerror',
        }),
      );
    });
  });

  describe('integration disabled state', () => {
    it('should disable integration when due date is in the past', () => {
      const overdueDecision = { ...sampleWithRequiredData, date: dayjs().subtract(1, 'minute') };

      expect(comp.isIntegrationDisabled(overdueDecision, 'ticktick')).toBe(true);
    });

    it('should keep integration enabled when due date is in the future', () => {
      const upcomingDecision = { ...sampleWithRequiredData, date: dayjs().add(1, 'day') };

      expect(comp.isIntegrationDisabled(upcomingDecision, 'ticktick')).toBe(false);
    });
  });

  describe('delete', () => {
    let ngbModal: NgbModal;
    let deleteModalMock: any;

    beforeEach(() => {
      deleteModalMock = { componentInstance: {}, closed: new Subject() };
      // NgbModal is not a singleton using TestBed.inject.
      // ngbModal = TestBed.inject(NgbModal);
      ngbModal = (comp as any).modalService;
      jest.spyOn(ngbModal, 'open').mockReturnValue(deleteModalMock);
    });

    it('on confirm should call load', inject(
      [],
      fakeAsync(() => {
        // GIVEN
        jest.spyOn(comp, 'load');

        // WHEN
        comp.delete(sampleWithRequiredData);
        deleteModalMock.closed.next('deleted');
        tick();

        // THEN
        expect(ngbModal.open).toHaveBeenCalled();
        expect(comp.load).toHaveBeenCalled();
      }),
    ));

    it('on dismiss should call load', inject(
      [],
      fakeAsync(() => {
        // GIVEN
        jest.spyOn(comp, 'load');

        // WHEN
        comp.delete(sampleWithRequiredData);
        deleteModalMock.closed.next();
        tick();

        // THEN
        expect(ngbModal.open).toHaveBeenCalled();
        expect(comp.load).not.toHaveBeenCalled();
      }),
    ));
  });
});
