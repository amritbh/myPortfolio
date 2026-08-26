import React, { useState, useRef } from "react";
import "./WorkWithMe.css";
import { consulting } from "../../portfolio";
import { Link } from "react-router-dom";
import { Fade } from "react-reveal";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import type { Theme } from "../../types";

const HCAPTCHA_SITE_KEY =
  import.meta.env.VITE_HCAPTCHA_SITE_KEY ||
  "10000000-ffff-ffff-ffff-000000000001";

interface WorkWithMeProps {
  theme?: Theme;
}

const WorkWithMe: React.FC<WorkWithMeProps> = ({ theme }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState("");
  const captchaRef = useRef<HCaptcha>(null);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!captchaToken) {
      setCaptchaError("Please complete the CAPTCHA challenge.");
      return;
    }
    
    setError("");
    setCaptchaError("");
    // Send to existing contact Lambda tagged as waitlist signup
    const baseApiUrl = import.meta.env.VITE_CUSTOM_API_URL || "";
    fetch(`${baseApiUrl}/portfolio`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        id: `waitlist-${Date.now()}`,
        username: "Waitlist Signup",
        email,
        messageTitle: "[Consulting Waitlist]",
        message: `New consulting waitlist signup from: ${email}`,
        formType: "consulting_waitlist",
        captchaToken,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        setSubmitted(true);
        setEmail("");
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
      })
      .catch(() => {
        setError("Something went wrong. Please try again.");
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
      });
  };

  return (
    <section
      className="wwm-section"
      id="work-with-me"
      data-testid="work-with-me-section"
    >
      <Fade bottom duration={800} distance="30px">
        <div className="wwm-header">
          <span
            className="wwm-badge"
            style={{ color: theme?.imageHighlight, borderColor: theme?.imageHighlight }}
          >
            Coming Soon
          </span>
          <h2 className="wwm-title" style={{ color: theme?.text }}>
            Work With Me
          </h2>
          <p className="wwm-subtitle" style={{ color: theme?.secondaryText }}>
            {consulting.pitch}
          </p>
        </div>
      </Fade>

      <Fade bottom duration={900} distance="30px" delay={100}>
        <div className="wwm-cards-grid">
          {consulting.services.map((svc) => (
            <div
              key={svc.id}
              className="wwm-card"
              data-testid={`service-card-${svc.id}`}
              style={{
                background: theme ? `${theme.highlight}22` : undefined,
                borderColor: theme ? `${theme.highlight}55` : undefined,
              }}
            >
              <div className="wwm-card-icon">{svc.icon}</div>
              <span
                className="wwm-coming-soon-badge"
                style={{
                  background: theme ? `${theme.imageHighlight}18` : undefined,
                  color: "#F0A500",
                  borderColor: "#F0A50055",
                }}
              >
                Coming Soon
              </span>
              <h3 className="wwm-card-title" style={{ color: theme?.text }}>
                {svc.title}
              </h3>
              <p className="wwm-card-desc" style={{ color: theme?.secondaryText }}>
                {svc.description}
              </p>
              <p className="wwm-card-meta" style={{ color: theme?.secondaryText }}>
                <span className="wwm-meta-chip">⏱ {svc.duration}</span>
              </p>
              <p className="wwm-card-best-for" style={{ color: theme?.secondaryText }}>
                <strong style={{ color: theme?.text }}>Best for:</strong> {svc.bestFor}
              </p>
            </div>
          ))}
        </div>
      </Fade>

      <Fade bottom duration={900} distance="30px" delay={200}>
        <div
          className="wwm-waitlist-box"
          style={{
            background: theme ? `${theme.highlight}18` : undefined,
            borderColor: theme ? `${theme.imageHighlight}33` : undefined,
          }}
        >
          {submitted ? (
            <div className="wwm-success" data-testid="wwm-success-message">
              <span className="wwm-success-icon">✓</span>
              <p style={{ color: theme?.text }}>
                You're on the list! I'll reach out when spots open.
              </p>
            </div>
          ) : (
            <>
              <p className="wwm-waitlist-label" style={{ color: theme?.text }}>
                Be the first to know when spots open
              </p>
              <form
                className="wwm-waitlist-form"
                onSubmit={handleWaitlist}
                noValidate
              >
                <input
                  id="wwm-email-input"
                  type="email"
                  className="wwm-email-input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  aria-label="Email address for consulting waitlist"
                  style={{
                    background: theme ? `${theme.body}` : undefined,
                    color: theme?.text,
                    borderColor: error
                      ? "#d9534f"
                      : theme
                      ? `${theme.highlight}88`
                      : undefined,
                  }}
                />
                <button
                  id="wwm-join-waitlist-btn"
                  type="submit"
                  className="wwm-submit-btn"
                  style={{
                    background: theme?.imageHighlight,
                    color: "#fff",
                  }}
                >
                  Join Waitlist →
                </button>
              </form>
              
              <div className="wwm-captcha-wrapper">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={HCAPTCHA_SITE_KEY}
                  onVerify={(token) => {
                    setCaptchaToken(token);
                    setCaptchaError("");
                  }}
                  onExpire={() => {
                    setCaptchaToken(null);
                    setCaptchaError("CAPTCHA expired. Please verify again.");
                  }}
                  onError={() => {
                    setCaptchaToken(null);
                    setCaptchaError("CAPTCHA error. Please try again.");
                  }}
                  theme={theme ? "dark" : "light"}
                />
              </div>

              {error && (
                <p className="wwm-input-error" data-testid="wwm-email-error">
                  {error}
                </p>
              )}
              {captchaError && (
                <p className="wwm-input-error" data-testid="wwm-captcha-error">
                  {captchaError}
                </p>
              )}
              
              <p className="wwm-waitlist-note" style={{ color: theme?.secondaryText }}>
                No spam. Just a single message when I open spots.
              </p>
            </>
          )}
        </div>
      </Fade>

      <div className="wwm-footer">
        <Link
          to="/consulting"
          className="wwm-details-link"
          style={{ color: theme?.imageHighlight }}
        >
          View full details and FAQ →
        </Link>
      </div>
    </section>
  );
};

export default WorkWithMe;
