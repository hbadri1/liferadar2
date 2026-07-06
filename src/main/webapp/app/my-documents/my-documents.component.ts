import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs/esm';

import SharedModule from 'app/shared/shared.module';
import { ConfirmationModalComponent } from 'app/home/confirmation-modal.component';
import { ItemCountComponent } from 'app/shared/pagination';
import { TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { DocumentStatus, IMyDocument, IMyDocumentSummary, NewMyDocument, RenewalReminderOption } from './my-document.model';
import { MyDocumentService } from './my-document.service';

@Component({
  selector: 'jhi-my-documents',
  templateUrl: './my-documents.component.html',
  styleUrl: './my-documents.component.scss',
  imports: [SharedModule, ReactiveFormsModule, ItemCountComponent],
})
export default class MyDocumentsComponent implements OnInit {
  private readonly myDocumentService = inject(MyDocumentService);
  private readonly modalService = inject(NgbModal);
  private readonly translateService = inject(TranslateService);

  @ViewChild('documentModal') documentModal?: TemplateRef<unknown>;

  readonly statusOptions = Object.values(DocumentStatus);
  readonly renewalReminderOptions = Object.values(RenewalReminderOption);

  documents: IMyDocument[] = [];
  isLoading = false;
  isSaving = false;
  page = 1;
  readonly itemsPerPage = 10;
  totalItems = 0;
  sortField: 'renewalDate' | 'name' | 'status' = 'renewalDate';
  sortDirection: 'asc' | 'desc' = 'asc';
  editingDocumentId: number | null = null;
  summary: IMyDocumentSummary = { totalDocuments: 0, upcomingRenewals: 0, expiredDocuments: 0 };

  private modalRef: NgbModalRef | null = null;

  readonly documentForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(200)] }),
    documentType: new FormControl<string | null>(null, [Validators.maxLength(120)]),
    issuer: new FormControl<string | null>(null, [Validators.maxLength(200)]),
    issueDate: new FormControl<string | null>(null),
    renewalDate: new FormControl(dayjs().format('YYYY-MM-DD'), { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl(DocumentStatus.ACTIVE, { nonNullable: true, validators: [Validators.required] }),
    renewalReminder: new FormControl<RenewalReminderOption | null>(null),
    notes: new FormControl<string | null>(null, [Validators.maxLength(1000)]),
  });

  ngOnInit(): void {
    this.loadDocuments();
    this.loadSummary();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.myDocumentService
      .query({
        page: this.page - 1,
        size: this.itemsPerPage,
        sort: [`${this.sortField},${this.sortDirection}`, 'id,desc'],
      })
      .subscribe({
        next: response => {
          this.documents = response.body ?? [];
          this.totalItems = this.extractTotalItems(response.headers);
          this.isLoading = false;
        },
        error: () => {
          this.documents = [];
          this.totalItems = 0;
          this.isLoading = false;
        },
      });
  }

  loadSummary(): void {
    this.myDocumentService.getSummary().subscribe({
      next: response => {
        this.summary = response.body ?? this.summary;
      },
      error: () => {
        this.summary = { totalDocuments: 0, upcomingRenewals: 0, expiredDocuments: 0 };
      },
    });
  }

  onPageChange(nextPage: number): void {
    this.page = nextPage;
    this.loadDocuments();
  }

  sortBy(field: 'renewalDate' | 'name' | 'status'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = field === 'renewalDate' ? 'asc' : 'desc';
    }
    this.page = 1;
    this.loadDocuments();
  }

  openCreateModal(): void {
    this.editingDocumentId = null;
    this.documentForm.reset({
      name: '',
      documentType: null,
      issuer: null,
      issueDate: null,
      renewalDate: dayjs().format('YYYY-MM-DD'),
      status: DocumentStatus.ACTIVE,
      renewalReminder: null,
      notes: null,
    });
    this.openDocumentModal();
  }

  openEditModal(document: IMyDocument): void {
    this.editingDocumentId = document.id ?? null;
    this.documentForm.reset({
      name: document.name,
      documentType: document.documentType ?? null,
      issuer: document.issuer ?? null,
      issueDate: document.issueDate?.format('YYYY-MM-DD') ?? null,
      renewalDate: document.renewalDate.format('YYYY-MM-DD'),
      status: document.status,
      renewalReminder: document.renewalReminder ?? null,
      notes: document.notes ?? null,
    });
    this.openDocumentModal();
  }

  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.dismiss();
      this.modalRef = null;
    }
    this.editingDocumentId = null;
  }

  saveDocument(): void {
    if (this.documentForm.invalid) {
      this.documentForm.markAllAsTouched();
      return;
    }

    const value = this.documentForm.getRawValue();
    const payload: NewMyDocument = {
      name: value.name.trim(),
      documentType: value.documentType?.trim() || null,
      issuer: value.issuer?.trim() || null,
      issueDate: value.issueDate ? dayjs(value.issueDate) : null,
      renewalDate: dayjs(value.renewalDate),
      status: value.status,
      renewalReminder: value.renewalReminder,
      notes: value.notes?.trim() || null,
    };

    this.isSaving = true;
    const request$ = this.editingDocumentId
      ? this.myDocumentService.update({ ...payload, id: this.editingDocumentId })
      : this.myDocumentService.create(payload);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        if (this.modalRef) {
          this.modalRef.close();
          this.modalRef = null;
        }
        this.editingDocumentId = null;
        this.page = 1;
        this.loadDocuments();
        this.loadSummary();
      },
      error: () => {
        this.isSaving = false;
      },
    });
  }

  deleteDocument(document: IMyDocument): void {
    if (!document.id) {
      return;
    }
    const modalRef = this.modalService.open(ConfirmationModalComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.title = this.translateService.instant('myDocuments.deleteTitle');
    modalRef.componentInstance.message = this.translateService.instant('myDocuments.deleteMessage', { name: document.name });
    modalRef.componentInstance.confirmButtonText = this.translateService.instant('entity.action.delete');
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.closed.subscribe(result => {
      if (result !== 'confirmed') {
        return;
      }
      this.myDocumentService.delete(document.id!).subscribe({
        next: () => {
          if (this.documents.length === 1 && this.page > 1) {
            this.page -= 1;
          }
          this.loadDocuments();
          this.loadSummary();
        },
      });
    });
  }

  trackById(_index: number, document: IMyDocument): number | undefined {
    return document.id;
  }

  getStatusBadgeClass(status: DocumentStatus): string {
    switch (status) {
      case DocumentStatus.ACTIVE:
        return 'bg-success-subtle text-success-emphasis';
      case DocumentStatus.RENEWED:
        return 'bg-primary-subtle text-primary-emphasis';
      case DocumentStatus.EXPIRED:
        return 'bg-danger-subtle text-danger-emphasis';
      default:
        return 'bg-secondary-subtle text-secondary-emphasis';
    }
  }

  getDaysLeft(document: IMyDocument): number {
    return document.renewalDate.startOf('day').diff(dayjs().startOf('day'), 'day');
  }

  formatDate(value?: dayjs.Dayjs | null): string {
    return value ? value.format('YYYY-MM-DD') : '—';
  }

  protected sortIcon(field: 'renewalDate' | 'name' | 'status'): 'sort' | 'sort-up' | 'sort-down' {
    if (this.sortField !== field) {
      return 'sort';
    }
    return this.sortDirection === 'asc' ? 'sort-up' : 'sort-down';
  }

  private openDocumentModal(): void {
    if (!this.documentModal) {
      return;
    }
    this.modalRef = this.modalService.open(this.documentModal, { size: 'lg', backdrop: 'static', scrollable: true });
  }

  private extractTotalItems(headers: HttpHeaders): number {
    return Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER) ?? 0);
  }
}
