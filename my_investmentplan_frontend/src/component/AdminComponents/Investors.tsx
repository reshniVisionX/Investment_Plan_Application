import React, { useEffect, useState } from "react";
import "../../Styles/Admin/Investors.css";
import {
  getAllInvestors,
  updateInvestorStatus,
  sendInvestorMessage,
} from "../../api/Service/admin.api";
import type { UnverifiedInvestor } from "../../Types/AdminDTO/UnverifiedInvestor";
import Toast, { type ToastType } from "../../utils/Toast";
import { formatDateTime } from "../../utils/FormatDate";

const Investors: React.FC = () => {
  const [investors, setInvestors] = useState<UnverifiedInvestor[]>([]);
  const [filteredInvestors, setFilteredInvestors] = useState<UnverifiedInvestor[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: "all", search: "" });
  const [statusSelections, setStatusSelections] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ message: string; type: ToastType | null }>({
    message: "",
    type: null,
  });


  const [showModal, setShowModal] = useState(false);
  const [currentInvestorId, setCurrentInvestorId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    const fetchInvestors = async () => {
      setLoading(true);
      try {
        const data = await getAllInvestors();

        const validInvestors = Array.isArray(data)
          ? data.filter(
              (inv) =>
                inv.investorName.toLowerCase() !== "super admin" &&
                inv.investorName.toLowerCase() !== "manager"
            )
          : [];

        setInvestors(validInvestors);
        setFilteredInvestors(validInvestors);
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

  const openLocalFile = (path: string) => {
    if (!path) return;
    const cleaned = path.replace(
      /^[A-Z]:\\Dotnet Projects\\InvestmentPlanAPI\\InvestmentPlanAPI/i,
      ""
    );
    const urlPart = cleaned.replace(/\\/g, "/");
    const finalUrl = `https://localhost:7285${urlPart}`;
    window.open(finalUrl, "_blank");
  };

  const handleStatusUpdate = async (guid: string) => {
    const selectedStatus = statusSelections[guid];
    if (!selectedStatus) {
      setToast({ message: "Please select a status first.", type: "error" });
      return;
    }

    try {
      const res = await updateInvestorStatus(guid, selectedStatus);
      setToast({ message: res.message, type: res.success ? "success" : "error" });

      setFilteredInvestors((prev) =>
        prev.map((i) =>
          i.publicInvestorId === guid
            ? { ...i, verificationStatus: selectedStatus }
            : i
        )
      );
    } catch (err) {
      setToast({ message: (err as Error).message, type: "error" });
    }
  };

  
  useEffect(() => {
    let filtered = [...investors];

    if (filters.status !== "all") {
      const statusValue =
        filters.status === "pending" ? 1 : filters.status === "verified" ? 2 : 3;
      filtered = filtered.filter((inv) => inv.verificationStatus === statusValue);
    }

    if (filters.search.trim() !== "") {
      filtered = filtered.filter((inv) =>
        inv.investorName.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredInvestors(filtered);
  }, [filters, investors]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectChange = (guid: string, value: number) => {
    setStatusSelections((prev) => ({ ...prev, [guid]: value }));
  };

 
  const openMessageModal = (guid: string) => {
    setCurrentInvestorId(guid);
    setMessageText("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setMessageText("");
    setCurrentInvestorId(null);
  };

  const handleSendMessage = async () => {
    if (!currentInvestorId) {
      setToast({ message: "Invalid investor ID!", type: "error" });
      return;
    }

    if (!messageText.trim()) {
      setToast({ message: "Message cannot be empty!", type: "error" });
      return;
    }

    try {
      const res = await sendInvestorMessage(currentInvestorId, messageText);

      setToast({
        message: res.message ?? "Message sent successfully",
        type: res.success ? "success" : "error",
      });

      closeModal();
    } catch (err) {
      setToast({
        message: (err as Error).message || "Error sending message",
        type: "error",
      });
    }
  };

 return (
  <div className="admin-investor-container">
    <h2 className="admin-investor-title">👥 All Investors</h2>
    <p className="admin-investor-subtitle">
      Manage investor details, view documents, update status, or send a message.
    </p>

    <div className="admin-investor-filterbar">
      <div className="admin-investor-filtergroup">
        <label>Status:</label>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="admin-investor-filtergroup">
        <label>Search by Name:</label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          placeholder="Enter investor name..."
        />
      </div>
    </div>

    {loading ? (
      <p>Loading investors...</p>
    ) : filteredInvestors.length === 0 ? (
      <p>No investors found.</p>
    ) : (
      <div className="admin-investor-cardgrid">
        {filteredInvestors.map((inv) => {
          const statusClass =
            inv.verificationStatus === 1
              ? "admin-status-pending"
              : inv.verificationStatus === 2
              ? "admin-status-verified"
              : "admin-status-rejected";

          const detail = inv.investorDetail ?? {
            mobile: "N/A",
            bankName: "N/A",
            nomineeName: "N/A",
            incomeProof: "",
            signedDocument: "",
          };

          return (
            <div key={inv.publicInvestorId} className="admin-investor-card">
          
              <div className="admin-investor-left">
                <div className="admin-investor-header">
                  <img
                    src={getImageSrc(detail.investorImage)}
                    alt={inv.investorName}
                    className="admin-investor-avatar"
                  />
                  <div>
                    <h3>{inv.investorName}</h3>
                    <p className="admin-investor-email">{inv.email}</p>
                  </div>
                </div>

                <div className="admin-investor-details">
                  <p><strong>Mobile:</strong> {detail.mobile}</p>
                  <p><strong>Bank:</strong> {detail.bankName}</p>
                  <p><strong>Nominee:</strong> {detail.nomineeName}</p>
                  <p><strong>Created:</strong> {formatDateTime(inv.createdAt)}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={statusClass}>
                      {inv.verificationStatus === 1
                        ? "Pending"
                        : inv.verificationStatus === 2
                        ? "Verified"
                        : "Rejected"}
                    </span>
                  </p>
                </div>
              </div>

             
              <div className="admin-investor-right">
                <button
                  className="admin-doc-btn"
                  onClick={() => openLocalFile(detail.incomeProof)}
                  disabled={!detail.incomeProof}
                >
                  📄 Income Proof
                </button>

                <button
                  className="admin-doc-btn"
                  onClick={() => openLocalFile(detail.signedDocument)}
                  disabled={!detail.signedDocument}
                >
                  🖊️ Signed Doc
                </button>

                <div className="admin-investor-actions">
                  <select
                    className="admin-status-dropdown"
                    onChange={(e) =>
                      handleSelectChange(inv.publicInvestorId, Number(e.target.value))
                    }
                    defaultValue=""
                  >
                    <option value="" disabled>Select Action</option>
                    <option value={2}>Approve</option>
                    <option value={3}>Reject</option>
                  </select>

                  <button
                    className="admin-status-btn"
                    onClick={() => handleStatusUpdate(inv.publicInvestorId)}
                  >
                    🔄 Update
                  </button>

                  <button
                    className="admin-message-btn"
                    onClick={() => openMessageModal(inv.publicInvestorId)}
                  >
                    💬 Message
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}

    {showModal && (
      <div className="admin-modal-overlay">
        <div className="admin-modal-box">
          <h3>Send Message to Investor</h3>

          <textarea
            className="admin-modal-textarea"
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />

          <div className="admin-modal-buttons">
            <button className="admin-modal-send" onClick={handleSendMessage}>
              Send
            </button>
            <button className="admin-modal-cancel" onClick={closeModal}>
              Cancel
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

export default Investors;
