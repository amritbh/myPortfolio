// @ts-nocheck
import React, { useState, useEffect } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";
import { Fade } from "react-reveal";
import { QRCodeSVG } from "qrcode.react";
import {
  fetchAccountProfile,
  updateAccountProfile,
  setup2FA,
  verify2FA,
  deleteAccount,
  clearSession,
  getStoredUser,
} from "../../utils/apiClient";
import "./Account.css";
import { Theme } from "../../types";

interface AccountProps {
  theme: Theme;
  themeMode?: string;
  onThemeChange?: (mode: string) => void;
}

const Account: React.FC<AccountProps> = ({ theme, themeMode, onThemeChange }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState("");
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [totpUri, setTotpUri] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const result = await fetchAccountProfile();
    const storedUser = getStoredUser() || {};
    if (result.success && result.profile) {
      setUsername(result.profile.username || "");
      setEmail(result.profile.email || storedUser.email || storedUser.username || "");
      setName(result.profile.name || storedUser.name || "");
      setAddress(result.profile.address || "");
      setPhoneNumber(result.profile.phone_number || "");
      setMfaEnabled(result.profile.mfa_enabled || false);
      setLoading(false);
    } else {
      showMessage(result.error || "Failed to load profile", "error");
      setEmail(storedUser.email || storedUser.username || "");
      setName(storedUser.name || "");
      setLoading(false);
    }
  };

  const showMessage = (msg: string, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateAccountProfile(name, address, phoneNumber);

    if (result.success) {
      showMessage("Profile updated successfully!");
    } else {
      showMessage(result.error || "Failed to update profile", "error");
    }
    setSaving(false);
  };

  const handleSetup2FA = async () => {
    setIsVerifying2FA(true);
    const result = await setup2FA();
    if (result.success) {
      setShow2FAModal(true);
      setTotpUri(result.uri || "");
      setIsVerifying2FA(false);
    } else {
      showMessage(result.error || "Failed to setup 2FA", "error");
      setIsVerifying2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!totpCode) return;
    setIsVerifying2FA(true);
    const result = await verify2FA(totpCode);
    if (result.success) {
      setShow2FAModal(false);
      setMfaEnabled(true);
      setTotpCode("");
      setIsVerifying2FA(false);
      showMessage("2FA enabled successfully!");
    } else {
      showMessage(result.error || "Invalid verification code", "error");
      setIsVerifying2FA(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you absolutely sure you want to delete your account? This action cannot be undone."
      )
    ) {
      setIsDeleting(true);
      const result = await deleteAccount();
      if (result.success) {
        clearSession();
        window.location.href = "/";
      } else {
        showMessage(result.error || "Failed to delete account", "error");
        setIsDeleting(false);
      }
    }
  };

  return (
    <div style={{ backgroundColor: theme.body }}>
      <Header theme={theme} themeMode={themeMode || ""} onThemeChange={onThemeChange || (() => {})} />
      <div className="account-page">
        <Fade bottom duration={1000} distance="40px">
          <div
            className="account-container"
            style={{
              backgroundColor: `${theme.text}0d`,
              border: `1px solid ${theme.text}33`,
            }}
          >
            <div className="account-header">
              <h1 style={{ color: theme.text }}>Manage Account</h1>
              <p style={{ color: theme.secondaryText }}>
                Update your profile, secure your account, or manage your data.
              </p>
            </div>

            {message && (
              <div className={`message-box message-${messageType}`}>
                {message}
              </div>
            )}

            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: theme.text,
                }}
              >
                Loading...
              </div>
            ) : (
              <>
                <div
                  className="account-section"
                  style={{ borderBottomColor: `${theme.text}33` }}
                >
                  <h2 style={{ color: theme.text }}>Profile Information</h2>
                  <form onSubmit={handleSaveProfile}>
                    <div className="account-form-group">
                      <span style={{ color: theme.text, display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Email Address
                      </span>
                      <div
                        style={{
                          color: theme.secondaryText,
                          padding: "12px 15px",
                          backgroundColor: `${theme.text}05`,
                          borderRadius: "5px",
                          marginBottom: "15px",
                          fontSize: "1rem",
                        }}
                      >
                        {email}
                      </div>
                    </div>
                    <div className="account-form-group">
                      <label htmlFor="name" style={{ color: theme.text }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="account-input"
                        style={{
                          color: theme.text,
                          borderColor: `${theme.text}33`,
                          backgroundColor: theme.body,
                        }}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="account-form-group">
                      <label htmlFor="address" style={{ color: theme.text }}>
                        Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="account-input"
                        style={{
                          color: theme.text,
                          borderColor: `${theme.text}33`,
                          backgroundColor: theme.body,
                        }}
                        placeholder="Enter your address"
                      />
                    </div>
                    <div className="account-form-group">
                      <label
                        htmlFor="phoneNumber"
                        style={{ color: theme.text }}
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="account-input"
                        style={{
                          color: theme.text,
                          borderColor: `${theme.text}33`,
                          backgroundColor: theme.body,
                        }}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <button
                      type="submit"
                      className="account-btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                </div>

                <div
                  className="account-section"
                  style={{ borderBottomColor: `${theme.text}33` }}
                >
                  <h2 style={{ color: theme.text }}>Security Options</h2>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <h3 style={{ color: theme.text, margin: "0 0 8px 0" }}>
                        Two-Factor Authentication (2FA)
                      </h3>
                      <p style={{ color: theme.secondaryText, margin: 0 }}>
                        Add an extra layer of security to your account.
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`account-btn ${
                        mfaEnabled ? "btn-secondary" : "btn-primary"
                      }`}
                      onClick={handleSetup2FA}
                      disabled={isVerifying2FA || mfaEnabled}
                      style={
                        mfaEnabled
                          ? {
                              color: theme.text,
                              borderColor: `${theme.text}33`,
                            }
                          : {}
                      }
                    >
                      {mfaEnabled ? "2FA Enabled" : "Enable 2FA"}
                    </button>
                  </div>
                </div>

                <div
                  className="account-section"
                  style={{ borderBottom: "none" }}
                >
                  <h2 style={{ color: theme.text }}>Danger Zone</h2>
                  <p
                    style={{
                      color: theme.secondaryText,
                      marginBottom: "20px",
                    }}
                  >
                    Once you delete your account, there is no going back.
                    Please be certain.
                  </p>
                  <button
                    type="button"
                    className="account-btn btn-danger"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Account"}
                  </button>
                </div>
              </>
            )}
          </div>
        </Fade>
      </div>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="mfa-modal-overlay">
          <div
            className="mfa-modal-content"
            style={{ backgroundColor: theme.body }}
          >
            <h3 style={{ color: theme.text, marginTop: 0 }}>Setup 2FA</h3>
            <p style={{ color: theme.secondaryText }}>
              Scan this QR code with your authenticator app (like Google
              Authenticator or Authy).
            </p>
            {totpUri ? (
              <div className="mfa-qr-code">
                <QRCodeSVG value={totpUri} size={200} />
              </div>
            ) : (
              <p style={{ color: theme.text }}>Loading QR code...</p>
            )}
            <div style={{ marginTop: "20px" }}>
              <input
                type="text"
                placeholder="000000"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                maxLength={6}
                className="mfa-input"
                style={{
                  color: theme.text,
                  backgroundColor: theme.body,
                  borderColor: `${theme.text}33`,
                }}
              />
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShow2FAModal(false)}
                  className="account-btn btn-secondary"
                  style={{
                    color: theme.text,
                    borderColor: `${theme.text}33`,
                  }}
                  disabled={isVerifying2FA}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerify2FA}
                  className="account-btn btn-primary"
                  disabled={
                    !totpCode || totpCode.length < 6 || isVerifying2FA
                  }
                >
                  {isVerifying2FA ? "Verifying..." : "Verify & Enable"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer theme={theme} />
      <TopButton theme={theme} />
    </div>
  );
};

export default Account;
