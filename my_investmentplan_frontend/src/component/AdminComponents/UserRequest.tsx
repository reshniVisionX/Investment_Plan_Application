import React, { useEffect, useState } from "react";
import "../../Styles/Admin/AdminVerification.css";
import {
  getAllUnverifiedInvestors,
  updateInvestorStatus,
  sendInvestorMessage,
} from "../../api/Service/admin.api";
import type { UnverifiedInvestor } from "../../Types/AdminDTO/UnverifiedInvestor";
import Toast, { type ToastType } from "../../utils/Toast";
import { formatDateTime } from "../../utils/FormatDate";

const UserRequest: React.FC = () => {
  const [investors, setInvestors] = useState<UnverifiedInvestor[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType | null }>({
    message: "",
    type: null,
  });

  const [showModal, setShowModal] = useState(false);
  const [currentInvestorId, setCurrentInvestorId] = useState<string>("");
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    const fetchInvestors = async () => {
      setLoading(true);
      try {
        const data = await getAllUnverifiedInvestors();
        setInvestors(data);
      } catch (error) {
        setToast({ message: (error as Error).message, type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchInvestors();
  }, []);

  const getImageSrc = (binaryString: string | null | undefined) => {
    if (!binaryString) return "/default-avatar.png";
    if (binaryString.startsWith("data:image")) return binaryString;
    return `data:image/jpeg;base64,${binaryString}`;
  };

  const handleStatusChange = async (guid: string, status: number) => {
    try {
      const res = await updateInvestorStatus(guid, status);
      setToast({ message: res.message, type: res.success ? "success" : "error" });

      setInvestors((prev) => prev.filter((i) => i.publicInvestorId !== guid));
    } catch (err) {
      setToast({ message: (err as Error).message, type: "error" });
    }
  };

  const openLocalFile = (path: string) => {
    if (!path) return;

    const cleanedPath = path.replace(
      /^[A-Z]:\\Dotnet Projects\\InvestmentPlanAPI\\InvestmentPlanAPI/i,
      ""
    );

    const fileUrlPart = cleanedPath.replace(/\\/g, "/");
    const fileUrl = `https://localhost:7285${fileUrlPart}`;

    window.open(fileUrl, "_blank");
  };

  const openMessageModal = (investorId: string) => {
    setCurrentInvestorId(investorId);
    setMessageText("");
    setShowModal(true);
  };

  const sendMessage = async () => {
    if (!messageText.trim()) {
      setToast({ message: "Message cannot be empty.", type: "error" });
      return;
    }

    try {
      const res = await sendInvestorMessage(currentInvestorId, messageText);
     setToast({
  message: res.message ?? "Message sent successfully",
  type: res.success ? "success" : "error",
});

      setShowModal(false);
    } catch (err) {
      setToast({ message: (err as Error).message, type: "error" });
    }
  };

  return (
    <div className="admin-request-container">
      <h2>👥 User Requests</h2>
      <p>Approve or reject new investor registrations.</p>

      {loading ? (
        <p>Loading unverified investors...</p>
      ) : investors.length === 0 ? (
        <p>No pending investor approvals.</p>
      ) : (
        <div className="card-grid">
          {investors.map((inv) => (
            <div key={inv.publicInvestorId} className="card">
              <div className="card-header">
                <img
                  src={getImageSrc(inv.investorDetail?.investorImage)}
                  alt={inv.investorName}
                  className="investor-image"
                />
                <h3>{inv.investorName}</h3>
                <p className="email">{inv.email}</p>
              </div>

              <div className="card-details">
                <p><strong>Mobile:</strong> {inv.investorDetail.mobile}</p>
                <p><strong>Bank:</strong> {inv.investorDetail.bankName}</p>
                <p><strong>Nominee:</strong> {inv.investorDetail.nomineeName}</p>
                <p><strong>Created:</strong> {formatDateTime(inv.createdAt)}</p>
              </div>

              <div className="document-links">
                <button
                  className="view-btn"
                  onClick={() => openLocalFile(inv.investorDetail.incomeProof)}
                >
                  📄 View Income Proof
                </button>
                <button
                  className="view-btn"
                  onClick={() => openLocalFile(inv.investorDetail.signedDocument)}
                >
                  🖊️ View Signed Doc
                </button>
              </div>

              <div className="action-buttons">
                <button
                  className="approve-btn"
                  onClick={() => handleStatusChange(inv.publicInvestorId, 2)}
                >
                  ✅ Approve
                </button>

                <button
                  className="reject-btn"
                  onClick={() => handleStatusChange(inv.publicInvestorId, 3)}
                >
                  ❌ Reject
                </button>

                <button
                  className="message-btn"
                  onClick={() => openMessageModal(inv.publicInvestorId)}
                >
                  💬 Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modalbox">
            <h3>Send Message</h3>
            <textarea className="model-textarea"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Enter your message..."
              rows={5}
            />

            <div className="modal-actions">
              <button className="approve-btn" onClick={sendMessage}>
                📩 Send
              </button>
              <button className="reject-btn" onClick={() => setShowModal(false)}>
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.message && toast.type && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: null })}
        />
      )}
    </div>
  );
};

export default UserRequest;
