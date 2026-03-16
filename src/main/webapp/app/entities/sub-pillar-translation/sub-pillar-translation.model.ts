import { ISubPillar } from 'app/entities/sub-pillar/sub-pillar.model';
import { LangCode } from 'app/entities/enumerations/lang-code.model';

export interface ISubPillarTranslation {
  id: number;
  lang?: keyof typeof LangCode | null;
  name?: string | null;
  description?: string | null;
  subPillar?: ISubPillar | null;
}

export type NewSubPillarTranslation = Omit<ISubPillarTranslation, 'id'> & { id: null };
