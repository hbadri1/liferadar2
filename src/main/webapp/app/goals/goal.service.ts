import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import {
  IGoal, IGoalMilestone, IGoalUpdate, IGoalDashboardSummary,
  GoalStatus, GoalMilestoneStatus, GoalPriority
} from './goal.model';

@Injectable({ providedIn: 'root' })
export class GoalService {
  private http = inject(HttpClient);
  private appConfig = inject(ApplicationConfigService);

  private base = () => this.appConfig.getEndpointFor('api/goals');

  getMyGoals(includeArchived = false): Observable<IGoal[]> {
    return this.http.get<IGoal[]>(`${this.base()}/my`, { params: { includeArchived: String(includeArchived) } });
  }

  getDashboardSummary(): Observable<IGoalDashboardSummary> {
    return this.http.get<IGoalDashboardSummary>(`${this.base()}/summary`);
  }

  createGoal(data: Partial<IGoal> & { pillarId?: number | null }): Observable<IGoal> {
    return this.http.post<IGoal>(`${this.base()}`, data);
  }

  updateGoal(id: number, data: Partial<IGoal> & { pillarId?: number | null }): Observable<IGoal> {
    return this.http.put<IGoal>(`${this.base()}/${id}`, data);
  }

  getGoal(id: number): Observable<IGoal> {
    return this.http.get<IGoal>(`${this.base()}/${id}`);
  }

  deleteGoal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`);
  }

  archiveGoal(id: number): Observable<IGoal> {
    return this.http.patch<IGoal>(`${this.base()}/${id}/archive`, {});
  }

  markComplete(id: number): Observable<IGoal> {
    return this.http.patch<IGoal>(`${this.base()}/${id}/complete`, {});
  }

  // Milestones
  getMilestones(goalId: number): Observable<IGoalMilestone[]> {
    return this.http.get<IGoalMilestone[]>(`${this.base()}/${goalId}/milestones`);
  }

  createMilestone(goalId: number, data: Partial<IGoalMilestone>): Observable<IGoalMilestone> {
    return this.http.post<IGoalMilestone>(`${this.base()}/${goalId}/milestones`, data);
  }

  updateMilestone(goalId: number, milestoneId: number, data: Partial<IGoalMilestone>): Observable<IGoalMilestone> {
    return this.http.put<IGoalMilestone>(`${this.base()}/${goalId}/milestones/${milestoneId}`, data);
  }

  deleteMilestone(goalId: number, milestoneId: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${goalId}/milestones/${milestoneId}`);
  }

  // Goal Updates
  getGoalUpdates(goalId: number): Observable<IGoalUpdate[]> {
    return this.http.get<IGoalUpdate[]>(`${this.base()}/${goalId}/updates`);
  }

  createGoalUpdate(goalId: number, data: Partial<IGoalUpdate>): Observable<IGoalUpdate> {
    return this.http.post<IGoalUpdate>(`${this.base()}/${goalId}/updates`, data);
  }
}

