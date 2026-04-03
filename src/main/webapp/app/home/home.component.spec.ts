jest.mock('app/core/auth/account.service');

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs/esm';

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
  let mockLifeEvaluationService: LifeEvaluationService;
  let mockModalService: NgbModal;
  let mockTranslateService: TranslateService;
  const translations: Record<string, string> = {
    'home.subtitle': 'Your Life Pillars',
    'home.child.title': 'You are doing great!',
    'home.child.subtitle': 'Here are some encouraging messages for your day.',
    'home.child.imageAlt': 'A happy celebration with smiling faces cheering you on.',
    'home.child.imageCaption': 'Your cheer squad is celebrating you!',
    'home.child.message1': 'Every small step you take today matters.',
    'home.child.message2': 'Your effort is stronger than any challenge.',
    'home.child.message3': 'Keep going, you are building something amazing.',
    'home.child.quote1': '"Believe you can, and you are halfway there."',
    'home.child.quote2': '"Success is the sum of small efforts, repeated day in and day out."',
    'home.child.quote3': '"You are braver than you believe, and stronger than you seem."',
  };
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
    const translateServiceMock = {
      currentLang: 'en',
      onLangChange: of({}),
      onTranslationChange: of({}),
      instant: jest.fn((key: string) => translations[key] ?? key),
      get: jest.fn((key: string) => of(translations[key] ?? key)),
    };

    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
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
      .overrideTemplate(
        HomeComponent,
        `
          @if (account() !== null) {
            @if (!isChildOnly()) {
              <p class="home-subtitle">Your Life Pillars</p>
            }

            @if (isChildOnly()) {
              <div class="child-hero-illustration" role="img" aria-label="Child celebration illustration">
                @for (face of childCelebrationFaces; track face) {
                  <img [src]="face" alt="" aria-hidden="true" class="child-hero-face" />
                }
              </div>
              <p class="child-hero-caption">Your cheer squad is celebrating you!</p>
            }
          }
        `,
      )
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    comp = fixture.componentInstance;
    mockAccountService = TestBed.inject(AccountService);
    mockPillarService = TestBed.inject(PillarService);
    mockLifeEvaluationService = TestBed.inject(LifeEvaluationService);
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

    it('should not load pillars or evaluations for child-only account', () => {
      const authenticationState = new Subject<Account | null>();
      mockAccountService.getAuthenticationState = jest.fn(() => authenticationState.asObservable());
      const loadPillarsSpy = jest.spyOn(comp, 'loadPillars');
      const loadEvaluationsSpy = jest.spyOn(comp, 'loadLifeEvaluations');

      comp.ngOnInit();
      authenticationState.next({ ...account, authorities: ['ROLE_CHILD'] });

      expect(comp.isChildOnly()).toBe(true);
      expect(loadPillarsSpy).not.toHaveBeenCalled();
      expect(loadEvaluationsSpy).not.toHaveBeenCalled();
    });

    it('should load pillars and evaluations for non-child account', () => {
      const authenticationState = new Subject<Account | null>();
      mockAccountService.getAuthenticationState = jest.fn(() => authenticationState.asObservable());
      const loadPillarsSpy = jest.spyOn(comp, 'loadPillars').mockImplementation(() => undefined);
      const loadEvaluationsSpy = jest.spyOn(comp, 'loadLifeEvaluations').mockImplementation(() => undefined);

      comp.ngOnInit();
      authenticationState.next({ ...account, authorities: ['ROLE_USER'] });

      expect(comp.isChildOnly()).toBe(false);
      expect(loadPillarsSpy).toHaveBeenCalled();
      expect(loadEvaluationsSpy).toHaveBeenCalled();
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

  describe('template rendering', () => {
    it('should remove the welcome heading and keep the pillars subtitle for non-child users', () => {
      mockAccountService.getAuthenticationState = jest.fn(() => of({ ...account, firstName: 'Alex', authorities: ['ROLE_USER'] }));

      fixture.detectChanges();

      const element: HTMLElement = fixture.nativeElement;
      expect(element.textContent).not.toContain('Welcome');
      expect(element.textContent).toContain('Your Life Pillars');
      expect(element.querySelector('.child-hero-illustration')).toBeNull();
    });

    it('should hide the pillars subtitle and show the kid celebration illustration for child-only users', () => {
      mockAccountService.getAuthenticationState = jest.fn(() => of({ ...account, firstName: 'Milo', authorities: ['ROLE_CHILD'] }));

      fixture.detectChanges();

      const element: HTMLElement = fixture.nativeElement;
      expect(element.textContent).not.toContain('Welcome');
      expect(element.textContent).not.toContain('Your Life Pillars');
      expect(element.querySelector('.child-hero-illustration')).not.toBeNull();
      expect(element.querySelectorAll('.child-hero-face')).toHaveLength(comp.childCelebrationFaces.length);
      expect(element.textContent).toContain('Your cheer squad is celebrating you!');
    });
  });

  describe('life evaluations ordering', () => {
    it('should sort evaluations newest first within each item group and sort groups by newest evaluation date desc', () => {
      comp.lifeEvaluations.set([
        {
          id: 11,
          evaluationDate: dayjs('2026-03-18'),
          subPillarItem: { id: 2, code: 'ITEM-B', translations: [{ lang: 'EN', name: 'Item B' }] } as any,
        } as any,
        {
          id: 12,
          evaluationDate: dayjs('2026-03-20'),
          subPillarItem: { id: 1, code: 'ITEM-A', translations: [{ lang: 'EN', name: 'Item A' }] } as any,
        } as any,
        {
          id: 13,
          evaluationDate: dayjs('2026-03-22'),
          subPillarItem: { id: 2, code: 'ITEM-B', translations: [{ lang: 'EN', name: 'Item B' }] } as any,
        } as any,
      ]);

      const groupedEvaluations = comp.getGroupedLifeEvaluations();

      expect(groupedEvaluations.map(group => group.itemName)).toEqual(['Item B', 'Item A']);
      expect(groupedEvaluations[0].evaluations.map(evaluation => evaluation.id)).toEqual([13, 11]);
      expect(groupedEvaluations[1].evaluations.map(evaluation => evaluation.id)).toEqual([12]);
    });
  });

  describe('loadLifeEvaluations', () => {
    it('should request only recent evaluations (last 30 days) with newest-first sorting', () => {
      const querySpy = jest.spyOn(mockLifeEvaluationService, 'query');

      comp.loadLifeEvaluations();

      const queryParams = querySpy.mock.calls[0]?.[0] as Record<string, unknown>;
      expect(queryParams).toBeDefined();
      expect(queryParams.sort).toEqual(['evaluationDate,desc', 'id,desc']);

      const requestedDate = queryParams['evaluationDate.greaterThanOrEqual'];
      expect(typeof requestedDate).toBe('string');
      expect(requestedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });


  describe('loadSuggestedPillars', () => {
    it('should import suggested pillars after confirmation and reload the list', () => {
      const modalRef = {
        componentInstance: {},
        closed: of('confirmed'),
      } as any;

      const openSpy = jest.spyOn((comp as any).modalService, 'open').mockReturnValue(modalRef);
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

      expect(openSpy).toHaveBeenCalled();
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
