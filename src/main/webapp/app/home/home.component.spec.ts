jest.mock('app/core/auth/account.service');

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { PillarService } from 'app/entities/pillar/service/pillar.service';
import { SubPillarService } from 'app/entities/sub-pillar/service/sub-pillar.service';
import { SubPillarItemService } from 'app/entities/sub-pillar-item/service/sub-pillar-item.service';
import { LifeEvaluationService } from 'app/entities/life-evaluation/service/life-evaluation.service';
import { EvaluationDecisionService } from 'app/entities/evaluation-decision/service/evaluation-decision.service';

import HomeComponent from './home.component';

describe('Home Component', () => {
  let comp: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockAccountService: AccountService;
  let mockRouter: Router;
  let mockPillarService: PillarService;
  let mockModalService: NgbModal;
  let mockTranslateService: TranslateService;
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
    const translateServiceMock = { currentLang: 'en', onLangChange: of({}), instant: jest.fn((key: string) => key) };

    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        AccountService,
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: PillarService, useValue: { query: jest.fn(() => of(new HttpResponse({ body: [] }))), loadSuggested: jest.fn() } },
        { provide: SubPillarService, useValue: { query: jest.fn(() => of(new HttpResponse({ body: [] }))), find: jest.fn() } },
        { provide: SubPillarItemService, useValue: { query: jest.fn(() => of(new HttpResponse({ body: [] }))), find: jest.fn() } },
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
    mockPillarService = TestBed.inject(PillarService);
    mockModalService = TestBed.inject(NgbModal);
    mockTranslateService = TestBed.inject(TranslateService);
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

  describe('translation resolution', () => {
    it('should resolve AR pillar translation when current language is ar-ly', () => {
      (mockTranslateService as any).currentLang = 'ar-ly';
      const pillar: any = {
        translations: [
          { lang: 'EN', name: 'Health', description: 'desc en' },
          { lang: 'AR', name: 'الصحة', description: 'وصف عربي' },
        ],
      };

      const translation = comp.getTranslation(pillar);
      expect(translation?.lang).toBe('AR');
      expect(translation?.name).toBe('الصحة');
    });

    it('should resolve AR sub-pillar translation when current language is ar-ly', () => {
      (mockTranslateService as any).currentLang = 'ar-ly';
      const subPillar: any = {
        translations: [
          { lang: 'EN', name: 'Fitness', description: 'desc en' },
          { lang: 'AR', name: 'اللياقة', description: 'وصف عربي' },
        ],
      };

      const translation = comp.getSubPillarTranslation(subPillar);
      expect(translation?.lang).toBe('AR');
      expect(translation?.name).toBe('اللياقة');
    });

    it('should resolve AR item name and description when current language is ar-ly', () => {
      (mockTranslateService as any).currentLang = 'ar-ly';
      const item: any = {
        translations: [
          { lang: 'EN', name: 'Nutrition', description: 'desc en' },
          { lang: 'AR', name: 'التغذية', description: 'وصف عربي' },
        ],
      };

      expect(comp.getSubPillarItemTranslation(item)).toBe('التغذية');
      expect(comp.getSubPillarItemDescription(item)).toBe('وصف عربي');
    });
  });


  describe('loadSuggestedPillars', () => {
    it('should import suggested pillars after confirmation and reload the list', () => {
      const modalRef = {
        componentInstance: {},
        closed: of('confirmed'),
      } as any;

      jest.spyOn(mockModalService, 'open').mockReturnValue(modalRef);
      jest.spyOn(mockPillarService, 'loadSuggested').mockReturnValue(
        of(
          new HttpResponse({
            body: {
              pillarsCreated: 4,
              subPillarsCreated: 19,
              subPillarItemsCreated: 54,
              translationsCreated: 231,
            },
          }),
        ),
      );
      const loadPillarsSpy = jest.spyOn(comp, 'loadPillars').mockImplementation(() => undefined);

      comp.loadSuggestedPillars();

      expect(mockModalService.open).toHaveBeenCalled();
      expect(mockPillarService.loadSuggested).toHaveBeenCalled();
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
