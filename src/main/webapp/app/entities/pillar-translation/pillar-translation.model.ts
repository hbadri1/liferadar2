import { IPillar } from 'app/entities/pillar/pillar.model';
import { LangCode } from 'app/entities/enumerations/lang-code.model';

export interface IPillarTranslation {
  id: number;
  lang?: keyof typeof LangCode | null;
  name?: string | null;
  description?: string | null;
  pillar?: IPillar | null;
}

export type NewPillarTranslation = Omit<IPillarTranslation, 'id'> & { id: null };
