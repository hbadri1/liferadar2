import { ISubLifePillar } from 'app/entities/sub-life-pillar/sub-life-pillar.model';
import { LangCode } from 'app/entities/enumerations/lang-code.model';

export interface ISubLifePillarTranslation {
  id: number;
  lang?: keyof typeof LangCode | null;
  name?: string | null;
  description?: string | null;
  subLifePillar?: ISubLifePillar | null;
}

export type NewSubLifePillarTranslation = Omit<ISubLifePillarTranslation, 'id'> & { id: null };
