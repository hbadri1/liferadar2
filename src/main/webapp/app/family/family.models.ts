export interface ChildUser {
  id: number;
  login: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  activated: boolean;
}

export enum ObjectiveUnit {
  REPS = 'REPS',
  NUMBER = 'NUMBER',
  SECONDS = 'SECONDS',
}

export interface FamilyObjectiveProgress {
  id: number;
  createdAt: string;
  value: number;
  notes: string | null;
}

export interface FamilyObjectiveItemDefinition {
  id: number;
  name: string;
  description: string | null;
  unit: ObjectiveUnit;
  progressHistory: FamilyObjectiveProgress[];
}

export interface FamilyObjective {
  id: number;
  kidId: number | null;
  kidLogin: string | null;
  kidName: string | null;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  itemDefinitions: FamilyObjectiveItemDefinition[];
}

export interface FamilyObjectiveGroup {
  kidLogin: string;
  kidName: string;
  objectives: FamilyObjective[];
}

