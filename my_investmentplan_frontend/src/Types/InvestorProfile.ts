export interface InvestorDetail {
  invId: number;
  investorImage: string;
  publicInvestorId: string;
  mobile: string;
  aadhaarNo: string;
  panNo: string;
  age: number;
  signature: string;
  incomeProof: string;
  bankName: string;
  fund: number;
  signedDocument: string;
  nomineeName: string;
  nomineeEmail: string;
  nomineeRelation: string;
}

export interface InvestorProfile {
  publicInvestorId: string;
  investorName: string;
  email: string;
  password: string;
  verificationStatus: number;
  status: number;
  roleId: number;
  createdAt: string;
  investorDetail: InvestorDetail;
}
