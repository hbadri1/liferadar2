import { ISubPillarItem } from 'app/entities/sub-pillar-item/sub-pillar-item.model';
import { LangCode } from 'app/entities/enumerations/lang-code.model';

export interface ISubPillarItemTranslation {
  id: number;
  lang?: keyof typeof LangCode | null;
  name?: string | null;
  description?: string | null;
  subPillarItem?: ISubPillarItem | null;
}

export type NewSubPillarItemTranslation = Omit<ISubPillarItemTranslation, 'id'> & { id: null };
