import React, { Component } from "react";
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
} from "../../utils/apiClient";
import "./Account.css";

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address: "",
      phoneNumber: "",
      mfaEnabled: false,
      loading: true,
      saving: false,
      message: null,
      messageType: "",
      show2FAModal: false,
      totpUri: "",
      totpCode: "",
      isVerifying2FA: false,
      isDeleting: false,
    };
  }

  componentDidMount() {
    this.loadProfile();
  }

  loadProfile = async () => {
    this.setState({ loading: true });
    const result = await fetchAccountProfile();
    if (result.success && result.profile) {
      this.setState({
        address: result.profile.address || "",
        phoneNumber: result.profile.phone_number || "",
        mfaEnabled: result.profile.mfa_enabled || false,
        loading: false,
      });
    } else {
      this.showMessage(result.error || "Failed to load profile", "error");
      this.setState({ loading: false });
    }
  };

  showMessage = (msg, type = "success") => {
    this.setState({ message: msg, messageType: type });
    setTimeout(() => this.setState({ message: null }), 5000);
  };

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSaveProfile = async (e) => {
    e.preventDefault();
    this.setState({ saving: true });
    const { address, phoneNumber } = this.state;
    const result = await updateAccountProfile(address, phoneNumber);

    if (result.success) {
      this.showMessage("Profile updated successfully!");
    } else {
      this.showMessage(result.error || "Failed to update profile", "error");
    }
    this.setState({ saving: false });
  };

  handleSetup2FA = async () => {
    this.setState({ isVerifying2FA: true });
    const result = await setup2FA();
    if (result.success) {
      this.setState({
        show2FAModal: true,
        totpUri: result.uri,
        isVerifying2FA: false,
      });
    } else {
      this.showMessage(result.error || "Failed to setup 2FA", "error");
      this.setState({ isVerifying2FA: false });
    }
  };

  handleVerify2FA = async () => {
    if (!this.state.totpCode) return;
    this.setState({ isVerifying2FA: true });
    const result = await verify2FA(this.state.totpCode);
    if (result.success) {
      this.setState({
        show2FAModal: false,
        mfaEnabled: true,
        totpCode: "",
        isVerifying2FA: false,
      });
      this.showMessage("2FA enabled successfully!");
    } else {
      this.showMessage(result.error || "Invalid verification code", "error");
      this.setState({ isVerifying2FA: false });
    }
  };

  handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you absolutely sure you want to delete your account? This action cannot be undone."
      )
    ) {
      this.setState({ isDeleting: true });
      const result = await deleteAccount();
      if (result.success) {
        clearSession();
        window.location.href = "/";
      } else {
        this.showMessage(result.error || "Failed to delete account", "error");
        this.setState({ isDeleting: false });
      }
    }
  };

  render() {
    const { theme } = this.props;
    const {
      address,
      phoneNumber,
      mfaEnabled,
      loading,
      saving,
      message,
      messageType,
      show2FAModal,
      totpUri,
      totpCode,
      isVerifying2FA,
      isDeleting,
    } = this.state;

    return (
      <div style={{ backgroundColor: theme.body }}>
        <Header theme={theme} />
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
                    <form onSubmit={this.handleSaveProfile}>
                      <div className="account-form-group">
                        <label htmlFor="address" style={{ color: theme.text }}>
                          Address
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={address}
                          onChange={this.handleInputChange}
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
                          onChange={this.handleInputChange}
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
                        onClick={this.handleSetup2FA}
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
                      onClick={this.handleDeleteAccount}
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
                  onChange={(e) => this.setState({ totpCode: e.target.value })}
                  maxLength="6"
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
                    onClick={() => this.setState({ show2FAModal: false })}
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
                    onClick={this.handleVerify2FA}
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
  }
}

export default Account;
