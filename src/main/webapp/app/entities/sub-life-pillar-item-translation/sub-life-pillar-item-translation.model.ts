import { ISubLifePillarItem } from 'app/entities/sub-life-pillar-item/sub-life-pillar-item.model';
import { LangCode } from 'app/entities/enumerations/lang-code.model';

export interface ISubLifePillarItemTranslation {
  id: number;
  lang?: keyof typeof LangCode | null;
  name?: string | null;
  description?: string | null;
  subLifePillarItem?: ISubLifePillarItem | null;
}

export type NewSubLifePillarItemTranslation = Omit<ISubLifePillarItemTranslation, 'id'> & { id: null };
