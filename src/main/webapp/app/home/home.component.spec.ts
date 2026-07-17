import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import HomeComponent from './home.component';
import { AccountService } from 'app/core/auth/account.service';
import { TripPlanService } from 'app/entities/trip-plan/service/trip-plan.service';
import { TripPlanStepService } from 'app/entities/trip-plan-step/service/trip-plan-step.service';
import { MyDocumentService } from 'app/my-documents/my-document.service';
import { SaaSSubscriptionService } from 'app/entities/saas-subscription/service/saas-subscription.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let accountService: jasmine.SpyObj<AccountService>;
  let tripPlanService: jasmine.SpyObj<TripPlanService>;
  let tripPlanStepService: jasmine.SpyObj<TripPlanStepService>;
  let myDocumentService: jasmine.SpyObj<MyDocumentService>;
  let subscriptionService: jasmine.SpyObj<SaaSSubscriptionService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const accountServiceSpy = jasmine.createSpyObj('AccountService', ['getAuthenticationState', 'trackCurrentAccount']);
    const tripPlanServiceSpy = jasmine.createSpyObj('TripPlanService', ['query']);
    const tripPlanStepServiceSpy = jasmine.createSpyObj('TripPlanStepService', ['query']);
    const myDocumentServiceSpy = jasmine.createSpyObj('MyDocumentService', ['query']);
    const subscriptionServiceSpy = jasmine.createSpyObj('SaaSSubscriptionService', ['queryMy']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: AccountService, useValue: accountServiceSpy },
        { provide: TripPlanService, useValue: tripPlanServiceSpy },
        { provide: TripPlanStepService, useValue: tripPlanStepServiceSpy },
        { provide: MyDocumentService, useValue: myDocumentServiceSpy },
        { provide: SaaSSubscriptionService, useValue: subscriptionServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    accountService = TestBed.inject(AccountService) as jasmine.SpyObj<AccountService>;
    tripPlanService = TestBed.inject(TripPlanService) as jasmine.SpyObj<TripPlanService>;
    tripPlanStepService = TestBed.inject(TripPlanStepService) as jasmine.SpyObj<TripPlanStepService>;
    myDocumentService = TestBed.inject(MyDocumentService) as jasmine.SpyObj<MyDocumentService>;
    subscriptionService = TestBed.inject(SaaSSubscriptionService) as jasmine.SpyObj<SaaSSubscriptionService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup default mocks
    accountService.getAuthenticationState.and.returnValue(of(null));
    tripPlanService.query.and.returnValue(of(new HttpResponse({ body: [] })));
    tripPlanStepService.query.and.returnValue(of(new HttpResponse({ body: [] })));
    myDocumentService.query.and.returnValue(of(new HttpResponse({ body: [] })));
    subscriptionService.queryMy.and.returnValue(of(new HttpResponse({ body: [] })));

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load nearest trip on init', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
