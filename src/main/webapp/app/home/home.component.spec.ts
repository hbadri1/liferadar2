jest.mock('app/core/auth/account.service');

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { LifePillarService } from 'app/entities/life-pillar/service/life-pillar.service';
import { SubLifePillarService } from 'app/entities/sub-life-pillar/service/sub-life-pillar.service';
import { SubLifePillarItemService } from 'app/entities/sub-life-pillar-item/service/sub-life-pillar-item.service';
import { LifeEvaluationService } from 'app/entities/life-evaluation/service/life-evaluation.service';
import { EvaluationDecisionService } from 'app/entities/evaluation-decision/service/evaluation-decision.service';

import HomeComponent from './home.component';

describe('Home Component', () => {
  let comp: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockAccountService: AccountService;
  let mockRouter: Router;
  let mockLifePillarService: LifePillarService;
  let mockModalService: NgbModal;
  const account: Account = {
    activated: true,
    authorities: [],
    email: '',
    firstName: null,
    langKey: '',
    lastName: null,
    login: 'login',
    imageUrl: null,
  };

  beforeEach(waitForAsync(() => {
    const modalServiceMock = { open: jest.fn() };
    const translateServiceMock = { currentLang: 'en', onLangChange: of({}) };

    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        AccountService,
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: LifePillarService, useValue: { query: jest.fn(() => of(new HttpResponse({ body: [] }))), loadSuggested: jest.fn() } },
        { provide: SubLifePillarService, useValue: { query: jest.fn(() => of(new HttpResponse({ body: [] }))), find: jest.fn() } },
        { provide: SubLifePillarItemService, useValue: { query: jest.fn(() => of(new HttpResponse({ body: [] }))), find: jest.fn() } },
        { provide: LifeEvaluationService, useValue: { query: jest.fn(() => of(new HttpResponse({ body: [] }))) } },
        { provide: EvaluationDecisionService, useValue: { query: jest.fn(() => of(new HttpResponse({ body: [] }))) } },
      ],
    })
      .overrideTemplate(HomeComponent, '')
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    comp = fixture.componentInstance;
    mockAccountService = TestBed.inject(AccountService);
    mockLifePillarService = TestBed.inject(LifePillarService);
    mockModalService = TestBed.inject(NgbModal);
    mockAccountService.identity = jest.fn(() => of(null));
    mockAccountService.getAuthenticationState = jest.fn(() => of(null));

    mockRouter = TestBed.inject(Router);
    jest.spyOn(mockRouter, 'navigate').mockImplementation(() => Promise.resolve(true));
  });

  describe('ngOnInit', () => {
    it('should synchronize account variable with current account', () => {
      // GIVEN
      const authenticationState = new Subject<Account | null>();
      mockAccountService.getAuthenticationState = jest.fn(() => authenticationState.asObservable());

      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.account()).toBeNull();

      // WHEN
      authenticationState.next(account);

      // THEN
      expect(comp.account()).toEqual(account);

      // WHEN
      authenticationState.next(null);

      // THEN
      expect(comp.account()).toBeNull();
    });
  });

  describe('login', () => {
    it('should navigate to /login on login', () => {
      // WHEN
      comp.login();

      // THEN
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('loadSuggestedPillars', () => {
    it('should import suggested pillars after confirmation and reload the list', () => {
      const modalRef = {
        componentInstance: {},
        closed: of('confirmed'),
      } as any;

      jest.spyOn(mockModalService, 'open').mockReturnValue(modalRef);
      jest.spyOn(mockLifePillarService, 'loadSuggested').mockReturnValue(
        of(
          new HttpResponse({
            body: {
              lifePillarsCreated: 4,
              subLifePillarsCreated: 19,
              subLifePillarItemsCreated: 54,
              translationsCreated: 231,
            },
          }),
        ),
      );
      const loadPillarsSpy = jest.spyOn(comp, 'loadPillars').mockImplementation(() => undefined);

      comp.loadSuggestedPillars();

      expect(mockModalService.open).toHaveBeenCalled();
      expect(mockLifePillarService.loadSuggested).toHaveBeenCalled();
      expect(loadPillarsSpy).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should destroy authentication state subscription on component destroy', () => {
      // GIVEN
      const authenticationState = new Subject<Account | null>();
      mockAccountService.getAuthenticationState = jest.fn(() => authenticationState.asObservable());

      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.account()).toBeNull();

      // WHEN
      authenticationState.next(account);

      // THEN
      expect(comp.account()).toEqual(account);

      // WHEN
      comp.ngOnDestroy();
      authenticationState.next(null);

      // THEN
      expect(comp.account()).toEqual(account);
    });
  });
});
