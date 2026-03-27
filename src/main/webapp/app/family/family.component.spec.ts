jest.mock('app/core/auth/account.service');

import { signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';

import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';

import FamilyComponent from './family.component';

describe('FamilyComponent', () => {
  let comp: FamilyComponent;
  let mockAccountService: AccountService;
  let currentAccount: WritableSignal<Account | null>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FamilyComponent],
      providers: [
        AccountService,
        {
          provide: HttpClient,
          useValue: {
            get: jest.fn(() => of([])),
            post: jest.fn(() => of({})),
            delete: jest.fn(() => of({})),
          },
        },
      ],
    })
      .overrideTemplate(FamilyComponent, '')
      .compileComponents();
  }));

  beforeEach(() => {
    mockAccountService = TestBed.inject(AccountService);
    currentAccount = signal<Account | null>({
      activated: true,
      authorities: ['ROLE_CHILD'],
      email: '',
      firstName: null,
      langKey: 'en',
      lastName: null,
      login: 'kid',
      imageUrl: null,
    });
    mockAccountService.trackCurrentAccount = jest.fn(() => currentAccount);

    const fixture = TestBed.createComponent(FamilyComponent);
    comp = fixture.componentInstance;
  });

  it('defaults to kids objectives tab for non family admin', () => {
    comp.ngOnInit();

    expect(comp.canManageFamily()).toBe(false);
    expect(comp.activeTab()).toBe(comp.getChildTabId('kid'));
  });

  it('shows family management tab by default for family admin', () => {
    currentAccount.set({
      activated: true,
      authorities: ['ROLE_FAMILY_ADMIN'],
      email: '',
      firstName: null,
      langKey: 'en',
      lastName: null,
      login: 'parent',
      imageUrl: null,
    });

    const fixture = TestBed.createComponent(FamilyComponent);
    const adminComp = fixture.componentInstance;
    adminComp.ngOnInit();

    expect(adminComp.canManageFamily()).toBe(true);
    expect(adminComp.activeTab()).toBe('management');
  });

  it('prevents non family admin from switching to management tab', () => {
    comp.ngOnInit();
    comp.selectTab('management');

    expect(comp.activeTab()).toBe(comp.getChildTabId('kid'));
  });

  it('hides add form when switching away from management tab', () => {
    currentAccount.set({
      activated: true,
      authorities: ['ROLE_FAMILY_ADMIN'],
      email: '',
      firstName: null,
      langKey: 'en',
      lastName: null,
      login: 'parent',
      imageUrl: null,
    });

    const fixture = TestBed.createComponent(FamilyComponent);
    const adminComp = fixture.componentInstance;
    adminComp.ngOnInit();

    adminComp.showAddForm.set(true);
    adminComp.children.set([{ id: 1, login: 'kid', firstName: 'Kid', lastName: 'One', email: null, activated: true }]);
    adminComp.selectTab(adminComp.getChildTabId('kid'));

    expect(adminComp.activeTab()).toBe(adminComp.getChildTabId('kid'));
    expect(adminComp.showAddForm()).toBe(false);
  });

  it('shows only current child in objectives tabs for child users', () => {
    comp.children.set([
      { id: 1, login: 'kid', firstName: 'Kid', lastName: 'One', email: null, activated: true },
      { id: 2, login: 'kid2', firstName: 'Kid', lastName: 'Two', email: null, activated: true },
    ]);

    expect(comp.objectiveChildren().map(child => child.login)).toEqual(['kid']);
    expect(comp.activeObjectiveChild()?.login).toBe('kid');
  });

  it('shows all child tabs in objectives for family admin', () => {
    currentAccount.set({
      activated: true,
      authorities: ['ROLE_FAMILY_ADMIN'],
      email: '',
      firstName: null,
      langKey: 'en',
      lastName: null,
      login: 'parent',
      imageUrl: null,
    });

    const fixture = TestBed.createComponent(FamilyComponent);
    const adminComp = fixture.componentInstance;
    adminComp.children.set([
      { id: 1, login: 'kid', firstName: 'Kid', lastName: 'One', email: null, activated: true },
      { id: 2, login: 'kid2', firstName: 'Kid', lastName: 'Two', email: null, activated: true },
    ]);

    expect(adminComp.objectiveChildren().map(child => child.login)).toEqual(['kid', 'kid2']);
    expect(adminComp.activeTab()).toBe('management');
  });
});

