import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITickTickProject } from '../service/evaluation-decision.service';

export interface ITickTickProjectModalResult {
  projectId?: string;
  title: string;
}

@Component({
  selector: 'jhi-ticktick-project-modal',
  standalone: true,
  templateUrl: './ticktick-project-modal.component.html',
  imports: [SharedModule, FormsModule],
})
export class TickTickProjectModalComponent implements OnInit, OnChanges {
  @Input() projects: ITickTickProject[] = [];
  @Input() initialTitle = '';
  @Input() defaultProjectName = 'Liferadar';

  selectedProjectId = '';
  title = '';

  protected readonly activeModal = inject(NgbActiveModal);

  ngOnInit(): void {
    this.title = this.initialTitle;
    this.ensureProjectSelection();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projects']) {
      this.ensureProjectSelection();
    }
  }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }

  confirm(): void {
    if (!this.canConfirm()) {
      return;
    }

    this.activeModal.close({
      projectId: this.selectedProjectId || undefined,
      title: this.title.trim(),
    } as ITickTickProjectModalResult);
  }

  canConfirm(): boolean {
    const hasTitle = this.title.trim().length > 0;
    if (!hasTitle) {
      return false;
    }
    return this.projects.length === 0 || this.selectedProjectId.trim().length > 0;
  }

  private ensureProjectSelection(): void {
    if (this.projects.length === 0) {
      this.selectedProjectId = '';
      return;
    }

    const normalizedDefaultProjectName = this.defaultProjectName.trim().toLowerCase();
    const matchingDefaultProject = this.projects.find(project => project.name?.trim().toLowerCase() === normalizedDefaultProjectName);

    if (matchingDefaultProject) {
      this.selectedProjectId = matchingDefaultProject.id;
      return;
    }

    const currentExists = this.projects.some(project => project.id === this.selectedProjectId);
    if (!currentExists) {
      this.selectedProjectId = this.projects[0]?.id ?? '';
    }
  }
}
