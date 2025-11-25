import type {FundResponse} from './FundResponse';

export interface GetAllFundsResponse {
  success: boolean;
  data: FundResponse[];
}
