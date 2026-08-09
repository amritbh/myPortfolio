import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  loginAdmin,
  signupAdmin,
  getStoredToken,
  getStoredUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  setSession,
  login2FA,
} from "../../utils/apiClient";
import "./Login.css";

const Login: React.FC = () => {
  const history = useHistory();

  const [authMode, setAuthMode] = useState<
    "signin" | "signup" | "forgotPassword" | "resetPassword" | "login2FA"
  >("signin");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    handleUrlParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const executeRedirect = (userRole?: string) => {
    const redirectPath = localStorage.getItem("redirect_after_login");
    if (redirectPath) {
      localStorage.removeItem("redirect_after_login");
      history.push(redirectPath);
    } else {
      history.push(userRole === "admin" ? "/admin" : "/home");
    }
  };

  const handleCognitoHash = (hashFragment: string) => {
    const hashParams = new URLSearchParams(hashFragment);
    const idToken = hashParams.get("id_token");
    if (!idToken) return false;

    try {
      const payload = JSON.parse(atob(idToken.split(".")[1]));
      const user = {
        username: payload.email || payload["cognito:username"] || payload.sub,
        name:
          payload.name ||
          payload.given_name ||
          payload.email ||
          payload["cognito:username"] ||
          payload.sub,
        picture: payload.picture || null,
        type: "cognito",
        role: "user",
      };
      if (payload.email === "amrit.bhattarai990@gmail.com") {
        user.role = "admin";
      }
      setSession(idToken, user);
      
      executeRedirect(user.role);
      return true;
    } catch (e) {
      console.error("Failed to parse Cognito JWT", e);
      setAuthError("Social login failed. Please try again.");
      return true;
    }
  };

  const hasProcessedHash = React.useRef(false);

  const handleUrlParams = async () => {
    if (hasProcessedHash.current) return;

    // Handle Cognito Hash
    if (window.location.hash.includes("id_token")) {
      hasProcessedHash.current = true;
      const hashFragment = window.location.hash.substring(1);
      // Clear hash to prevent double execution in React Strict Mode
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      if (handleCognitoHash(hashFragment)) return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const verifyTokenParam = urlParams.get("verifyToken");
    const resetTokenParam = urlParams.get("resetToken");

    if (verifyTokenParam) {
      setVerificationStatus("loading");
      setVerificationMessage("Verifying your email...");
      const res = await verifyEmail(verifyTokenParam);
      setVerificationStatus(res.success ? "success" : "error");
      setVerificationMessage(
        res.success ? "Email verified! You can now sign in." : res.error || ""
      );
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (resetTokenParam) {
      setAuthMode("resetPassword");
      setResetToken(resetTokenParam);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = getStoredToken();
    const user = getStoredUser();
    if (token && user) {
      executeRedirect(user.role);
    }
  };

  const switchAuthMode = (mode: any) => {
    setAuthMode(mode);
    setShowEmailForm(false);
    setAuthError("");
    setStatusMessage("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleForgotPassword = async () => {
    if (!email?.includes("@")) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    setIsSubmitting(true);
    setAuthError("");
    setStatusMessage("");
    const response = await requestPasswordReset(email.trim());
    if (response.success) {
      setStatusMessage(response.message || "");
      setIsSubmitting(false);
      setEmail("");
    } else {
      setAuthError(response.error || "");
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password || password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    setAuthError("");
    setStatusMessage("");
    const response = await resetPassword(resetToken, password);
    if (response.success) {
      setAuthMode("signin");
      setStatusMessage("Password reset! Please sign in.");
      setIsSubmitting(false);
      setPassword("");
      setConfirmPassword("");
    } else {
      setAuthError(response.error || "");
      setIsSubmitting(false);
    }
  };

  const handleLogin2FA = async () => {
    if (!totpCode || totpCode.length < 6) {
      setAuthError("Code must be 6 digits.");
      return;
    }
    setIsSubmitting(true);
    setAuthError("");
    setStatusMessage("");
    const response = await login2FA(tempToken, totpCode);
    if (response.success && response.token && response.user) {
      setSession(response.token, response.user);
      history.push(response.user.role === "admin" ? "/admin" : "/home");
    } else {
      setAuthError(response.error || "Invalid 2FA code");
      setIsSubmitting(false);
    }
  };

  const handleSignup = async () => {
    if (!email?.includes("@")) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    setAuthError("");
    setStatusMessage("");
    const response = await signupAdmin(email.trim(), email.trim(), password);
    if (response.success) {
      setStatusMessage("Account created! Check your email to verify.");
      setIsSubmitting(false);
      setAuthMode("signin");
      setShowEmailForm(false);
      setPassword("");
      setConfirmPassword("");
    } else {
      setAuthError(response.error || "Authentication failed.");
      setIsSubmitting(false);
    }
  };

  const handleSignin = async () => {
    if (!email?.includes("@")) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    setIsSubmitting(true);
    setAuthError("");
    setStatusMessage("");
    const response = await loginAdmin(email.trim(), password);
    if (response.success) {
      if ((response as any).requires_2fa) {
        setAuthMode("login2FA");
        setTempToken((response as any).temp_token || "");
        setIsSubmitting(false);
        setStatusMessage("2-Step Verification required");
        return;
      }
      if (response.user) {
        executeRedirect(response.user.role);
      }
    } else {
      setAuthError(response.error || "Authentication failed.");
      setIsSubmitting(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    switch (authMode) {
      case "forgotPassword":
        return handleForgotPassword();
      case "resetPassword":
        return handleResetPassword();
      case "login2FA":
        return handleLogin2FA();
      case "signup":
        return handleSignup();
      case "signin":
        return handleSignin();
      default:
        return;
    }
  };

  const handleGoogleLogin = () => {
    const domain =
      import.meta.env.VITE_APP_COGNITO_DOMAIN ||
      "amrit-portfolio-auth-v2-prod.auth.us-east-1.amazoncognito.com";
    const clientId =
      import.meta.env.VITE_APP_COGNITO_CLIENT_ID || "63ct5e88sn10306cbh2rm5ur68";
    const redirectUri = window.location.origin + "/login";
    window.location.href = `https://${domain}/oauth2/authorize?client_id=${clientId}&response_type=token&scope=email+openid+profile&redirect_uri=${encodeURIComponent(
      redirectUri
    )}`;
  };

  const renderGoogleButton = (text: string) => {
    return (
      <button
        type="button"
        className="medium-auth-btn-social"
        onClick={handleGoogleLogin}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {text}
      </button>
    );
  };

  const renderBanners = () => {
    let bannerClass = "info";
    if (verificationStatus === "success") bannerClass = "success";
    if (verificationStatus === "error") bannerClass = "error";

    return (
      <div className="medium-auth-banners">
        {verificationMessage && (
          <div className={`medium-auth-banner ${bannerClass}`}>
            {verificationMessage}
          </div>
        )}
        {statusMessage && (
          <div className="medium-auth-banner success">{statusMessage}</div>
        )}
        {authError && (
          <div className="medium-auth-banner error" role="alert">
            {authError}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="medium-auth-root">
      <div className="medium-auth-overlay" />
      <div className="medium-auth-modal">
        <a href="/home" className="medium-auth-close-btn" aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>

        <div className="medium-auth-content">
          {renderBanners()}

          {/* ── Sign In ── */}
          {authMode === "signin" && !showEmailForm && (
            <div className="medium-auth-panel">
              <h2 className="medium-auth-title">Welcome back.</h2>
              <div className="medium-auth-button-group">
                {renderGoogleButton("Sign in with Google")}
                <button
                  type="button"
                  className="medium-auth-btn-social"
                  onClick={() => setShowEmailForm(true)}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Sign in with email
                </button>
              </div>
              <div className="medium-auth-footer">
                No account?{" "}
                <button
                  type="button"
                  onClick={() => switchAuthMode("signup")}
                  className="medium-auth-link"
                >
                  Create one
                </button>
              </div>
            </div>
          )}

          {/* ── Sign In (Email Form) ── */}
          {authMode === "signin" && showEmailForm && (
            <div className="medium-auth-panel">
              <h2 className="medium-auth-title">Sign in with email</h2>
              <p className="medium-auth-subtitle">
                Enter your email and password to sign in.
              </p>
              <form onSubmit={handleAuthSubmit} className="medium-auth-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="medium-auth-input"
                  required
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="medium-auth-input"
                  required
                />
                <button
                  type="submit"
                  id="login-submit-btn"
                  className="medium-auth-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Continue"}
                </button>
              </form>
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="medium-auth-link medium-auth-back-link"
              >
                &lt; All sign in options
              </button>
              <button
                type="button"
                onClick={() => switchAuthMode("forgotPassword")}
                className="medium-auth-link"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* ── Login 2FA ── */}
          {authMode === "login2FA" && (
            <div className="medium-auth-panel">
              <h2 className="medium-auth-title">2-Step Verification</h2>
              <p className="medium-auth-subtitle">
                Enter the 6-digit code from your authenticator app.
              </p>
              <form onSubmit={handleAuthSubmit} className="medium-auth-form">
                <input
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="6-digit code"
                  className="medium-auth-input"
                  maxLength={6}
                  required
                  style={{
                    textAlign: "center",
                    letterSpacing: "2px",
                    fontSize: "1.2rem",
                  }}
                />
                <button
                  type="submit"
                  className="medium-auth-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Verifying..." : "Verify & Sign In"}
                </button>
              </form>
              <button
                type="button"
                onClick={() => switchAuthMode("signin")}
                className="medium-auth-link medium-auth-back-link"
              >
                &lt; Back to sign in
              </button>
            </div>
          )}

          {/* ── Sign Up ── */}
          {authMode === "signup" && !showEmailForm && (
            <div className="medium-auth-panel">
              <h2 className="medium-auth-title">Join us.</h2>
              <div className="medium-auth-button-group">
                {renderGoogleButton("Sign up with Google")}
                <button
                  type="button"
                  className="medium-auth-btn-social"
                  onClick={() => setShowEmailForm(true)}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Sign up with email
                </button>
              </div>
              <div className="medium-auth-footer">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchAuthMode("signin")}
                  className="medium-auth-link"
                >
                  Sign in
                </button>
              </div>
            </div>
          )}

          {/* ── Sign Up (Email Form) ── */}
          {authMode === "signup" && showEmailForm && (
            <div className="medium-auth-panel">
              <h2 className="medium-auth-title">Sign up with email</h2>
              <p className="medium-auth-subtitle">
                Enter your details to create an account.
              </p>
              <form onSubmit={handleAuthSubmit} className="medium-auth-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="medium-auth-input"
                  required
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 chars)"
                  className="medium-auth-input"
                  required
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="medium-auth-input"
                  required
                />
                <button
                  type="submit"
                  id="login-submit-btn"
                  className="medium-auth-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Continue"}
                </button>
              </form>
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="medium-auth-link medium-auth-back-link"
              >
                &lt; All sign up options
              </button>
            </div>
          )}

          {/* ── Forgot Password ── */}
          {authMode === "forgotPassword" && (
            <div className="medium-auth-panel">
              <h2 className="medium-auth-title">Reset password</h2>
              <p className="medium-auth-subtitle">
                Enter your email and we'll send a reset link.
              </p>
              <form onSubmit={handleAuthSubmit} className="medium-auth-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="medium-auth-input"
                  required
                />
                <button
                  type="submit"
                  className="medium-auth-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
              <button
                type="button"
                onClick={() => switchAuthMode("signin")}
                className="medium-auth-link medium-auth-back-link"
              >
                &lt; Back to sign in
              </button>
            </div>
          )}

          {/* ── Reset Password ── */}
          {authMode === "resetPassword" && (
            <div className="medium-auth-panel">
              <h2 className="medium-auth-title">New password</h2>
              <p className="medium-auth-subtitle">
                Choose a new password for your account.
              </p>
              <form onSubmit={handleAuthSubmit} className="medium-auth-form">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  className="medium-auth-input"
                  required
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="medium-auth-input"
                  required
                />
                <button
                  type="submit"
                  className="medium-auth-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Set New Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
