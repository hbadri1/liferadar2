jest.mock('app/core/auth/account.service');

import { signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { AccountService } from 'app/core/auth/account.service';

import FamilyComponent from './family.component';

describe('FamilyComponent', () => {
  let comp: FamilyComponent;
  let mockAccountService: AccountService;
  let currentAccount: any;
  let mockModalService: any;

  beforeEach(waitForAsync(() => {
    mockModalService = {
      open: jest.fn(() => ({ componentInstance: {}, closed: of('dismissed') })),
    };

    TestBed.configureTestingModule({
      imports: [FamilyComponent],
      providers: [
        AccountService,
        {
          provide: HttpClient,
          useValue: {
            get: jest.fn(() => of([])),
            post: jest.fn(() => of({})),
            patch: jest.fn(() => of({})),
            delete: jest.fn(() => of({})),
          },
        },
        {
          provide: NgbModal,
          useValue: mockModalService,
        },
        {
          provide: TranslateService,
          useValue: {
            currentLang: 'en',
            instant: jest.fn((key: string) => key),
          },
        },
      ],
    })
      .overrideTemplate(FamilyComponent, '')
      .compileComponents();
  }));

  beforeEach(() => {
    mockAccountService = TestBed.inject(AccountService);
    currentAccount = signal({
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

  it('uses the encouraging subtitle for child-only users', () => {
    expect(comp.isChild()).toBe(true);
    expect(comp.headerSubtitleKey()).toBe('family.childSubtitle');
  });

  it('keeps the management subtitle for family admins', () => {
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

    expect(adminComp.isChild()).toBe(false);
    expect(adminComp.headerSubtitleKey()).toBe('family.subtitle');
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
    comp.ngOnInit();
    comp.children.set([
      { id: 1, login: 'kid', firstName: 'Kid', lastName: 'One', email: null, activated: true },
      { id: 2, login: 'kid2', firstName: 'Kid', lastName: 'Two', email: null, activated: true },
    ]);

    expect(comp.objectiveChildren().map((child: any) => child.login)).toEqual(['kid']);
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

  it('filters objectives by child and sorts them newest first', () => {
    const objectives = [
      {
        id: 1,
        kidId: 1,
        kidLogin: 'kid',
        kidName: 'Kid One',
        name: 'Read 10 pages',
        description: null,
        active: true,
        createdAt: '2026-03-27T10:00:00Z',
        itemDefinitions: [],
      },
      {
        id: 2,
        kidId: 2,
        kidLogin: 'kid2',
        kidName: 'Kid Two',
        name: 'Run 1 km',
        description: null,
        active: true,
        createdAt: '2026-03-28T10:00:00Z',
        itemDefinitions: [],
      },
      {
        id: 3,
        kidId: 1,
        kidLogin: 'kid',
        kidName: 'Kid One',
        name: 'Practice piano',
        description: null,
        active: true,
        createdAt: '2026-03-28T11:00:00Z',
        itemDefinitions: [],
      },
    ];

    comp.objectives.set(objectives);

    expect(comp.getObjectivesForChild('kid').map((objective: any) => objective.id)).toEqual([3, 1]);
    expect(comp.getObjectivesForChild('kid2').map((objective: any) => objective.id)).toEqual([2]);
  });

  it('groups objectives by child for management view', () => {
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
    adminComp.objectives.set([
      {
        id: 1,
        kidId: 1,
        kidLogin: 'kid',
        kidName: 'Kid One',
        name: 'Read',
        description: null,
        active: true,
        createdAt: '2026-03-28T09:00:00Z',
        itemDefinitions: [],
      },
      {
        id: 2,
        kidId: 2,
        kidLogin: 'kid2',
        kidName: 'Kid Two',
        name: 'Run',
        description: null,
        active: true,
        createdAt: '2026-03-28T09:00:00Z',
        itemDefinitions: [],
      },
    ]);

    expect(adminComp.objectiveGroups().map(group => group.kidLogin)).toEqual(['kid', 'kid2']);
  });

  it('uses a 7-day objective progress window', () => {
    const days = comp.getObjectiveCalendarDays();

    expect(comp.objectiveHistoryDays).toBe(7);
    expect(days).toHaveLength(7);
  });

  it('builds a 3-month trend series from recent progress history only', () => {
    const toIsoDaysAgo = (daysAgo: number): string => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - daysAgo);
      return date.toISOString();
    };

    const objective: any = {
      id: 1,
      kidId: 1,
      kidLogin: 'kid',
      kidName: 'Kid One',
      name: 'Hydration',
      description: null,
      active: true,
      createdAt: toIsoDaysAgo(20),
      itemDefinitions: [
        {
          id: 11,
          name: 'Water cups',
          description: null,
          unit: 'NUMBER',
          progressHistory: [
            { id: 101, createdAt: toIsoDaysAgo(95), value: 2, notes: null },
            { id: 102, createdAt: toIsoDaysAgo(30), value: 4, notes: null },
            { id: 103, createdAt: toIsoDaysAgo(10), value: 6, notes: null },
            { id: 104, createdAt: toIsoDaysAgo(3), value: 5, notes: null },
          ],
        },
      ],
    };

    const [series] = comp.getObjectiveTrendSeries(objective);

    expect(series.points).toHaveLength(3);
    expect(series.points.map(point => point.value)).toEqual([4, 6, 5]);
    expect(series.path.startsWith('M ')).toBe(true);
    expect(series.areaPath.endsWith('Z')).toBe(true);
    expect(series.startLabel).toBeTruthy();
    expect(series.endLabel).toBeTruthy();
  });

  it('exposes trend visibility for both child and family-admin roles', () => {
    const toIsoDaysAgo = (daysAgo: number): string => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - daysAgo);
      return date.toISOString();
    };

    const objective: any = {
      id: 1,
      kidId: 1,
      kidLogin: 'kid',
      kidName: 'Kid One',
      name: 'Reading',
      description: null,
      active: true,
      createdAt: toIsoDaysAgo(15),
      itemDefinitions: [
        {
          id: 21,
          name: 'Pages',
          description: null,
          unit: 'NUMBER',
          progressHistory: [{ id: 201, createdAt: toIsoDaysAgo(4), value: 8, notes: null }],
        },
      ],
    };

    expect(comp.isChild()).toBe(true);
    expect(comp.hasObjectiveProgressInTrendWindow(objective)).toBe(true);

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

    expect(adminComp.canManageFamily()).toBe(true);
    expect(adminComp.hasObjectiveProgressInTrendWindow(objective)).toBe(true);
  });
});

