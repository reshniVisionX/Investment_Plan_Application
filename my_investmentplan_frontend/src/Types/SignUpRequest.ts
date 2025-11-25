// src/Types/SignUpRequest.ts
export type SignUpRequest = {
  investorName: string;
  email: string;
  password: string;
  mobile: string;
  aadhaarNo: string;
  panNo: string;
  age: number;
  investorImage: File | null; 
  signature: File | null;     
  incomeProof: File | null;  
  bankName: string;
  fund: number;
  nomineeName?: string;
  nomineeEmail?: string;
  nomineeRelation?: string;
  signedDocument: File | null; 
};
