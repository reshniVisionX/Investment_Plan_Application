// src/Pages/InvestorSignup.tsx
import { useState } from "react";
import { type SignUpRequest } from "../Types/SignUpRequest";
import PersonalInfoForm from "../Pages/SignUpPages/PersonalInfoForm";
import KycCaptureForm from "../Pages/SignUpPages/KycCaptureForm";
import ReviewAndSubmitForm from "../Pages/SignUpPages/ReviewAndSubmitForm";
import FinalVerification from "../Pages/SignUpPages/FinalVerification";

const Signup = () => {
  const [form, setForm] = useState<SignUpRequest>({
    investorName: "",
    email: "",
    password: "",
    mobile: "",
    aadhaarNo: "",
    panNo: "",
    age: 0,
    investorImage: null,
    signature: null,
    incomeProof: null,
    bankName: "",
    fund: 0,
    nomineeName: "",
    nomineeEmail: "",
    nomineeRelation: "",
    signedDocument: null,
  });

  const [step, setStep] = useState(1);

  return (
    <div className="signUp">
      {step === 1 && (
        <PersonalInfoForm form={form} setForm={setForm} nextStep={() => setStep(2)} />
      )}
      {step === 2 && (
        <KycCaptureForm
          form={form}
          setForm={setForm}
          prevStep={() => setStep(1)}
          nextStep={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <ReviewAndSubmitForm
          form={form}
          setForm={setForm}
          prevStep={() => setStep(2)}
          nextStep={() => setStep(4)}
        />
      )}
     {step === 4 && (
      <FinalVerification
       form={form}
       setForm={setForm}
       
      />
    )}

    </div>
  );
};

export default Signup;
