import React, { useEffect, useState } from "react";
import { getInvestorProfileById, updateInvestorProfile } from "../../api/Service/investor.api";
import { tokenstore } from "../../auth/tokenstore";
import type { InvestorProfile } from "../../Types/InvestorProfile";
import Toast, { type ToastType } from "../../utils/Toast";
import "../../Styles/MyProfile.css";

const MyProfile: React.FC = () => {
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType | null }>({
    message: "",
    type: null,
  });
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState<number | "">("");
  const [upiPin, setUpiPin] = useState("");

  const hasInvestorDetails = !!profile?.investorDetail; 

  useEffect(() => {
    const fetchProfile = async () => {
      const investor = tokenstore.getInvestor();
      if (!investor) {
        setToast({ message: "Investor not found in session.", type: "error" });
        return;
      }

      try {
        const data = await getInvestorProfileById(investor.publicInvestorId);
        setProfile(data);
      } catch (error) {
        setToast({ message: (error as Error).message, type: "error" });
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile || !hasInvestorDetails) return;

    const updatedData = {
      email: profile.email,
      investorName: profile.investorName,
      mobile: profile.investorDetail.mobile,
      age: profile.investorDetail.age,
      fund: profile.investorDetail.fund,
      nomineeName: profile.investorDetail.nomineeName,
      nomineeEmail: profile.investorDetail.nomineeEmail,
      nomineeRelation: profile.investorDetail.nomineeRelation,
    };

    try {
      const msg = await updateInvestorProfile(profile.publicInvestorId, updatedData);
      setToast({ message: msg, type: "success" });
      setIsEditing(false);
    } catch (error) {
      setToast({ message: (error as Error).message, type: "error" });
    }
  };

  const handleAddFunds = async () => {
    if (!profile || !hasInvestorDetails) return;
    if (!fundAmount || fundAmount <= 0 || upiPin.trim().length < 4) {
      setToast({ message: "Enter a valid amount and UPI PIN.", type: "error" });
      return;
    }

    try {
      const newFund = profile.investorDetail.fund + Number(fundAmount);
      const msg = await updateInvestorProfile(profile.publicInvestorId, { fund: newFund });

      setProfile({
        ...profile,
        investorDetail: { ...profile.investorDetail, fund: newFund },
      });

      setToast({ message: msg || "Funds added successfully!", type: "success" });
      setShowFundModal(false);
      setFundAmount("");
      setUpiPin("");
    } catch (error) {
      setToast({ message: (error as Error).message, type: "error" });
    }
  };

  if (!profile)
    return <p className="loading-text">Loading Profile...</p>;

  return (
    <div className="profile-container">
      <h1>👤 My Profile</h1>

      <div className="profile-card">

        {hasInvestorDetails && (
          <div className="profile-left">
            <img
              src={`data:image/jpeg;base64,${profile.investorDetail.investorImage}`}
              alt="Investor"
              className="profile-photo"
            />

            <div className="fund-section">
              <label>Available Funds</label>
              <p className="fund-amount">
                ₹{profile.investorDetail.fund.toLocaleString()}
              </p>
              <button className="btn-fund" onClick={() => setShowFundModal(true)}>
                💰 Add Funds
              </button>
            </div>
          </div>
        )}

        <div className="profile-info">
          <label>Name</label>
          <input
            value={profile.investorName}
            disabled={!isEditing || !hasInvestorDetails}
            onChange={(e) =>
              setProfile({ ...profile, investorName: e.target.value })
            }
          />

          <label>Email</label>
          <input
            value={profile.email}
            disabled={!isEditing || !hasInvestorDetails}
            onChange={(e) =>
              setProfile({ ...profile, email: e.target.value })
            }
          />

          {hasInvestorDetails && (
            <>
              <label>Mobile</label>
              <input
                value={profile.investorDetail.mobile}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    investorDetail: {
                      ...profile.investorDetail,
                      mobile: e.target.value,
                    },
                  })
                }
              />

              <label>Age</label>
              <input
                type="number"
                value={profile.investorDetail.age}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    investorDetail: {
                      ...profile.investorDetail,
                      age: Number(e.target.value),
                    },
                  })
                }
              />

              <label>Bank Name</label>
              <input value={profile.investorDetail.bankName} disabled readOnly />

              <label>Nominee Name</label>
              <input
                value={profile.investorDetail.nomineeName}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    investorDetail: {
                      ...profile.investorDetail,
                      nomineeName: e.target.value,
                    },
                  })
                }
              />

              <label>Nominee Email</label>
              <input
                value={profile.investorDetail.nomineeEmail}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    investorDetail: {
                      ...profile.investorDetail,
                      nomineeEmail: e.target.value,
                    },
                  })
                }
              />

              <label>Nominee Relation</label>

              {!isEditing ? (
               
                <input
                  value={profile.investorDetail.nomineeRelation}
                  disabled
                  className="review-input"
                />
              ) : (
               
                <select
                  value={profile.investorDetail.nomineeRelation || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      investorDetail: {
                        ...profile.investorDetail,
                        nomineeRelation: e.target.value,
                      },
                    })
                  }
                  className="review-input"
                >
                  <option value="">Select Relation</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Husband">Husband</option>
                  <option value="Wife">Wife</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              )}

            </>
          )}

          <div className="profile-actions">
            {hasInvestorDetails ? (
              !isEditing ? (
                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                  ✏️ Edit Profile
                </button>
              ) : (
                <>
                  <button className="btn-save" onClick={handleSaveProfile}>
                    💾 Save
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => setIsEditing(false)}
                  >
                    ❌ Cancel
                  </button>
                </>
              )
            ) : (
              <p className="no-detail-msg">
                🔒 Limited access: Profile details not available for editing.
              </p>
            )}
          </div>
        </div>
      </div>

      {hasInvestorDetails && showFundModal && (
        <div className="modal-overlay" onClick={() => setShowFundModal(false)}>
          <div className="fund-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Funds</h2>

            <label>Amount to Add (₹)</label>
            <input
              type="number"
              min={1}
              value={fundAmount}
              onChange={(e) =>
                setFundAmount(e.target.value === "" ? "" : Number(e.target.value))
              }
            />

            <label>Enter UPI PIN</label>
            <input
              type="password"
              maxLength={6}
              value={upiPin}
              onChange={(e) => setUpiPin(e.target.value)}
            />

            <div className="modal-actions">
              <button className="btn-save" onClick={handleAddFunds}>
                Submit
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowFundModal(false)}
              >
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

export default MyProfile;
