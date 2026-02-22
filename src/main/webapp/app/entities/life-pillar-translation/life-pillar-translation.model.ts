import { ILifePillar } from 'app/entities/life-pillar/life-pillar.model';
import { LangCode } from 'app/entities/enumerations/lang-code.model';

export interface ILifePillarTranslation {
  id: number;
  lang?: keyof typeof LangCode | null;
  name?: string | null;
  description?: string | null;
  lifePillar?: ILifePillar | null;
}

export type NewLifePillarTranslation = Omit<ILifePillarTranslation, 'id'> & { id: null };
