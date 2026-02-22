import dayjs from 'dayjs/esm';
import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ILifeEvaluation } from 'app/entities/life-evaluation/life-evaluation.model';

export interface IEvaluationDecision {
  id: number;
  decision?: string | null;
  date?: dayjs.Dayjs | null;
  owner?: IExtendedUser | null;
  lifeEvaluation?: ILifeEvaluation | null;
}

export type NewEvaluationDecision = Omit<IEvaluationDecision, 'id'> & { id: null };
