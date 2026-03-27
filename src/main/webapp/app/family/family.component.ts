import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';

export interface ChildUser {
  id: number;
  login: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  activated: boolean;
}


@Component({
  selector: 'jhi-family',
  templateUrl: './family.component.html',
  styleUrl: './family.component.scss',
  imports: [SharedModule, ReactiveFormsModule],
})
export default class FamilyComponent implements OnInit {
  children = signal<ChildUser[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  showAddForm = signal(false);
  activeTab = signal<string>('management');

  account = inject(AccountService).trackCurrentAccount();

  /** True when the logged-in user only has ROLE_CHILD */
  isChild = computed(() => {
    const acc = this.account();
    if (!acc) return false;
    const authorities: string[] = acc.authorities ?? [];
    return authorities.includes('ROLE_CHILD') &&
      !authorities.includes('ROLE_FAMILY_ADMIN') &&
      !authorities.includes('ROLE_ADMIN');
  });

  /** Family management tab is only visible for family admins. */
  canManageFamily = computed(() => {
    const authorities: string[] = this.account()?.authorities ?? [];
    return authorities.includes('ROLE_FAMILY_ADMIN');
  });

  objectiveChildren = computed(() => {
    const children = this.children();
    if (this.canManageFamily()) {
      return children;
    }

    if (!this.isChild()) {
      return [];
    }

    const login = this.account()?.login;
    if (!login) {
      return [];
    }

    const ownChild = children.find(child => child.login === login);
    if (ownChild) {
      return [ownChild];
    }

    return [
      {
        id: -1,
        login,
        firstName: this.account()?.firstName ?? null,
        lastName: this.account()?.lastName ?? null,
        email: this.account()?.email ?? null,
        activated: true,
      },
    ];
  });

  activeObjectiveChild = computed(() =>
    this.objectiveChildren().find(child => this.getChildTabId(child.login) === this.activeTab()) ?? null,
  );

  addForm = inject(FormBuilder).group({
    login: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$/)]],
    firstName: ['', [Validators.maxLength(50)]],
    lastName: ['', [Validators.maxLength(50)]],
    email: ['', [Validators.email, Validators.minLength(5), Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(100)]],
  });

  private readonly http = inject(HttpClient);

  ngOnInit(): void {
    this.ensureActiveTabSelection();
    this.loadChildren();
  }

  selectTab(tabId: string): void {
    if (tabId === 'management' && !this.canManageFamily()) {
      return;
    }

    if (tabId !== 'management' && !this.objectiveChildren().some(child => this.getChildTabId(child.login) === tabId)) {
      return;
    }

    this.activeTab.set(tabId);
    if (tabId !== 'management') {
      this.showAddForm.set(false);
    }
  }

  getChildTabId(login: string): string {
    return `child:${login}`;
  }

  getChildDisplayName(child: ChildUser): string {
    const fullName = `${child.firstName ?? ''} ${child.lastName ?? ''}`.trim();
    return fullName || child.login;
  }

  loadChildren(): void {
    this.isLoading.set(true);
    this.http.get<ChildUser[]>('/api/family/children').subscribe({
      next: children => {
        this.children.set(children);
        this.ensureActiveTabSelection();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  toggleAddForm(): void {
    this.showAddForm.update(v => !v);
    this.addForm.reset();
    this.errorMsg.set(null);
    this.successMsg.set(null);
  }

  save(): void {
    if (this.addForm.invalid) return;
    this.isSaving.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);
    const val = this.addForm.value;
    this.http.post<ChildUser>('/api/family/children', {
      login: val.login,
      firstName: val.firstName || null,
      lastName: val.lastName || null,
      email: val.email || null,
      password: val.password,
    }).subscribe({
      next: child => {
        this.children.update(list => [...list, child]);
        this.ensureActiveTabSelection();
        this.isSaving.set(false);
        this.successMsg.set('family.childAdded');
        this.addForm.reset();
        this.showAddForm.set(false);
      },
      error: err => {
        this.isSaving.set(false);
        this.errorMsg.set(err?.error?.detail ?? err?.error?.title ?? 'family.error.save');
      },
    });
  }

  deleteChild(login: string): void {
    if (!confirm('Are you sure you want to remove this child account?')) return;
    this.http.delete(`/api/family/children/${login}`).subscribe({
      next: () => {
        this.children.update(list => list.filter(c => c.login !== login));
        this.ensureActiveTabSelection();
      },
      error: err => {
        this.errorMsg.set(err?.error?.detail ?? 'family.error.delete');
      },
    });
  }

  private ensureActiveTabSelection(): void {
    const children = this.objectiveChildren();
    const activeTab = this.activeTab();
    const hasActiveChildTab = children.some(child => this.getChildTabId(child.login) === activeTab);

    if (activeTab === 'management' && this.canManageFamily()) {
      return;
    }

    if (hasActiveChildTab) {
      return;
    }

    if (!this.canManageFamily() && children.length > 0) {
      this.activeTab.set(this.getChildTabId(children[0].login));
      return;
    }

    if (this.canManageFamily()) {
      this.activeTab.set('management');
      return;
    }

    if (children.length > 0) {
      this.activeTab.set(this.getChildTabId(children[0].login));
    }
  }
}

