import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import Toast, { type ToastType } from "../../utils/Toast";
import { type SignUpRequest } from "../../Types/SignUpRequest";
import '../../Styles/SignUp/KycCapture.css';;

interface Props {
  form: SignUpRequest;
  setForm: React.Dispatch<React.SetStateAction<SignUpRequest>>;
  prevStep: () => void;
  nextStep: () => void;
}

const KycCaptureForm: React.FC<Props> = ({ form, setForm, prevStep, nextStep }) => {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [verified, setVerified] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000000";
  }, []);

  const base64ToFile = (base64String: string, fileName: string): File => {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] ?? "image/png";
    const bstr = atob(arr[arr.length - 1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], fileName, { type: mime });
  };


  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const file = base64ToFile(imageSrc, "investor_photo.jpg");
      setForm((prev) => ({ ...prev, investorImage: file }));
      setCameraActive(false);
      setToast({ message: "Photo captured successfully!", type: "success" });
    } else {
      setToast({ message: "Failed to capture photo!", type: "error" });
    }
  };

  const retakePhoto = () => {
    setForm((prev) => ({ ...prev, investorImage: null }));
    setCameraActive(true);
    setToast({ message: "Please take a new photo", type: "info" });
  };

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (signatureSaved) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  }, [signatureSaved]);

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || signatureSaved) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
    },
    [isDrawing, signatureSaved]
  );

  const stopDrawing = useCallback(() => setIsDrawing(false), []);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setForm((prev) => ({ ...prev, signature: null }));
    setSignatureSaved(false);
    setToast({ message: "Signature cleared. You can draw again.", type: "info" });
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setToast({ message: "Signature canvas not found!", type: "error" });
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let isEmpty = true;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] > 0) {
        isEmpty = false;
        break;
      }
    }

    if (isEmpty) {
      setToast({ message: "Please draw your signature first!", type: "error" });
      return;
    }

    const base64 = canvas.toDataURL("image/png");
    const file = base64ToFile(base64, "signature.png");
    setForm((prev) => ({ ...prev, signature: file }));
    setSignatureSaved(true);
    setToast({ message: "Signature saved successfully!", type: "success" });
  };

  const handleVerify = () => {
    if (!form.investorImage || !form.signature) {
      setToast({
        message: "Please capture both photo and signature before verifying!",
        type: "error",
      });
      return;
    }
    setVerified(true);
    setToast({ message: "Verification successful!", type: "success" });
  };

 return (
  <div className="kyc-container">
    <h2 className="kyc-title">Step 2: KYC Capture</h2>

    <div className="kyc-flex">
 
      <div className="kyc-photo-section">
        <h4 className="kyc-subtitle">Capture Your Photo</h4>
        {cameraActive ? (
          <>
            <div className="kyc-camera-preview">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                height="auto"
                mirrored={true}
              />
            </div>
            <button onClick={capturePhoto} className="kyc-btn kyc-btn-capture">
              📸 Capture Image
            </button>
          </>
        ) : (
          <>
            <div className="kyc-photo-preview">
              <img
                src={form.investorImage ? URL.createObjectURL(form.investorImage) : ""}
                alt="Captured"
              />
            </div>
            <p className="kyc-photo-status">✓ Photo Captured</p>
            <button onClick={retakePhoto} className="kyc-btn kyc-btn-retake">
              🔄 Retake Picture
            </button>
          </>
        )}
      </div>

      <div className="kyc-sign-section">
        <h4 className="kyc-subtitle">Draw Your Signature</h4>
        <div className="kyc-canvas-container">
          <canvas
            ref={canvasRef}
            width={380}
            height={180}
            className="kyc-sign-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        <div className="kyc-sign-buttons" style={{ display: "flex", gap: "0.6rem", marginTop: "1rem" }}>
          {!signatureSaved ? (
            <>
              <button onClick={saveSignature} className="kyc-btn kyc-btn-save">💾 Save Signature</button>
              <button onClick={clearSignature} className="kyc-btn kyc-btn-clear">🧹 Clear</button>
            </>
          ) : (
            <button onClick={clearSignature} className="kyc-btn kyc-btn-danger">🗑️ Clear Signature</button>
          )}
        </div>

        {form.signature && (
          <div className="kyc-sign-info">
            ✓ Signature Saved {signatureSaved && "(Writing Disabled)"}
          </div>
        )}
      </div>
    </div>

    <div className="kyc-status-grid">
      <div className={`kyc-status-box ${form.investorImage ? "active" : "pending"}`}>
        <span className="font-medium">Photo: </span>
        {form.investorImage ? "✓ Captured" : "⏳ Pending"}
      </div>
      <div className={`kyc-status-box ${form.signature ? "active" : "pending"}`}>
        <span className="font-medium">Signature: </span>
        {form.signature ? "✓ Saved" : "⏳ Pending"}
      </div>
    </div>

    <div className="kyc-nav-container">
      <div className="kyc-nav-buttons">
        {!verified ? (
          <button
            onClick={handleVerify}
            disabled={!form.investorImage || !form.signature}
            className="kyc-nav-btn verify"
          >
             Verify & Continue
          </button>
        ) : (
          <button onClick={nextStep} className="kyc-nav-btn proceed">
            Proceed to Review →
          </button>
        )}
        <button onClick={prevStep} className="kyc-nav-btn back">← Go Back</button>
      </div>
      {(!form.investorImage || !form.signature) && (
        <p className="kyc-info-text">
          Complete both photo and signature capture to continue
        </p>
      )}
    </div>

    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
  </div>
);

};

export default KycCaptureForm;