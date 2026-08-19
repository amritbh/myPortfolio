// @ts-nocheck
import React, { useState, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";
import SocialMedia from "../../components/socialMedia/SocialMedia";
import { Fade } from "react-reveal";
import "./ContactComponent.css";
import { greeting, contactPageData } from "../../portfolio";
import axios from "axios";
import amritPic from "../../assests/images/amrit-pp.jpg";

const ContactData = contactPageData.contactSection;
const addressSection = contactPageData.addressSection;

const HCAPTCHA_SITE_KEY =
  import.meta.env.VITE_HCAPTCHA_SITE_KEY ||
  "10000000-ffff-ffff-ffff-000000000001";

function isValidEmail(val: any) {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(val);
}

function isValidPhoneNumber(val: any) {
  return /^\d{10}$/.test(val);
}

function Contact(props: any) {
  const theme = props.theme;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [alert, setAlert] = useState<any>(null);
  const [formErrors, setFormErrors] = useState({
    username: "",
    email: "",
    phone: "",
    message: "",
    messageTitle: "",
  });

  // hCaptcha state
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState("");
  const captchaRef = useRef<HCaptcha>(null);

  // Honeypot field (hidden from real users, bots fill this)
  const [honeypot, setHoneypot] = useState("");

  // Time-gate: record when the form was mounted
  const formRenderedAt = useRef<number>(Date.now());

  const validateForm = () => {
    const errors = {
      username: "",
      email: "",
      phone: "",
      message: "",
      messageTitle: "",
    };
    let isValid = true;

    if (username.trim() === "") {
      errors.username = "Name is required";
      isValid = false;
    }
    if (email.trim() === "") {
      errors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(email)) {
      errors.email = "Invalid email address";
      isValid = false;
    }
    if (phone && !isValidPhoneNumber(phone)) {
      errors.phone = "Invalid phone number";
      isValid = false;
    }
    if (messageTitle.trim() === "") {
      errors.messageTitle = "Subject is required";
      isValid = false;
    }
    if (message.trim() === "") {
      errors.message = "Message is required";
      isValid = false;
    }
    setFormErrors(errors);
    return isValid;
  };

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPhone("");
    setMessageTitle("");
    setMessage("");
    setCaptchaToken(null);
    setCaptchaError("");
    captchaRef.current?.resetCaptcha();
    formRenderedAt.current = Date.now();
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    // --- Layer 1: Honeypot check ---
    // Real users never see or fill this field. Bots do.
    if (honeypot) {
      // Silently fake success to not reveal to bots that they were caught
      setAlert({ type: "success", text: "Message sent successfully!" });
      resetForm();
      return;
    }

    // --- Layer 2: Time-gate check ---
    // Bots submit instantly. Require at least 3 seconds.
    const elapsed = Date.now() - formRenderedAt.current;
    if (elapsed < 3000) {
      setAlert({ type: "success", text: "Message sent successfully!" });
      resetForm();
      return;
    }

    // --- Layer 3: Field validation (run before captcha so errors show) ---
    if (!validateForm()) return;

    // --- Layer 4: hCaptcha token required ---
    if (!captchaToken) {
      setCaptchaError("Please complete the CAPTCHA challenge.");
      return;
    }

    const randomArray = new Uint32Array(1);
    if (typeof window !== "undefined" && window.crypto) {
      window.crypto.getRandomValues(randomArray);
    } else {
      randomArray[0] = Date.now();
    }

    const userData = {
      id: `${Date.now()}-${randomArray[0]}`,
      username,
      email,
      phone,
      messageTitle,
      message,
      captchaToken,
    };

    const baseApiUrl =
      import.meta.env.VITE_CUSTOM_API_URL ||
      "";
    const apiUrl = `${baseApiUrl}/portfolio`;

    axios
      .post(apiUrl, userData, { headers: { Accept: "application/json" } })
      .then(() => {
        setAlert({ type: "success", text: "Message sent successfully!" });
        resetForm();
      })
      .catch(() => {
        setAlert({
          type: "error",
          text: "Something went wrong. Please try again.",
        });
        // Reset captcha on error so user can try again
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
      });
  };

  return (
    <div className="contact-main">
      <Header
        theme={theme}
        themeMode={props.themeMode}
        onThemeChange={props.onThemeChange}
      />

      {/* Hero */}
      <Fade bottom duration={800} distance="20px">
        <div className="contact-hero">
          <h1 className="contact-hero-title" style={{ color: theme.text }}>
            Let's Connect
          </h1>
          <p
            className="contact-hero-subtitle"
            style={{ color: theme.secondaryText }}
          >
            Have a project in mind, a question, or just want to say hello? I'd
            love to hear from you.
          </p>
        </div>
      </Fade>

      {/* Two-column Grid */}
      <div className="contact-grid">
        {/* Left — Info Card */}
        <Fade bottom duration={1000} distance="30px">
          <div
            className="contact-info-card"
            style={{
              background: theme.highlight + "44",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            }}
          >
            {/* Profile Row */}
            <div className="contact-profile-row">
              <img
                className="contact-avatar"
                src={amritPic}
                alt="Amrit Bhattarai"
                style={{ borderColor: theme.imageHighlight }}
              />
              <div>
                <p
                  className="contact-profile-name"
                  style={{ color: theme.text }}
                >
                  {greeting.title}
                </p>
                <p
                  className="contact-profile-role"
                  style={{ color: theme.secondaryText }}
                >
                  DevOps & Cloud Engineer
                </p>
              </div>
            </div>

            <hr
              className="contact-divider"
              style={{ background: theme.text }}
            />

            {/* Info Items */}
            <div className="contact-info-items">
              <a
                href="mailto:amrit@amrit.cloud"
                className="contact-info-item"
                style={{ color: theme.text }}
              >
                <div
                  className="contact-info-icon"
                  style={{
                    background: theme.imageHighlight + "22",
                    color: theme.imageHighlight,
                  }}
                >
                  <span role="img" aria-label="email">
                    ✉
                  </span>
                </div>
                <div>
                  <p
                    className="contact-info-label"
                    style={{ color: theme.secondaryText }}
                  >
                    Email
                  </p>
                  <p className="contact-info-value">amrit@amrit.cloud</p>
                </div>
              </a>

              <a
                href={addressSection.location_map_link}
                target="_blank"
                rel="noreferrer noopener"
                className="contact-info-item"
                style={{ color: theme.text }}
              >
                <div
                  className="contact-info-icon"
                  style={{
                    background: theme.imageHighlight + "22",
                    color: theme.imageHighlight,
                  }}
                >
                  <span role="img" aria-label="location">
                    📍
                  </span>
                </div>
                <div>
                  <p
                    className="contact-info-label"
                    style={{ color: theme.secondaryText }}
                  >
                    Location
                  </p>
                  <p className="contact-info-value">
                    {addressSection.subtitle}
                  </p>
                </div>
              </a>
            </div>

            {/* Social Media */}
            <hr
              className="contact-divider"
              style={{ background: theme.text }}
            />
            <div className="contact-social-row">
              <SocialMedia theme={theme} />
            </div>
          </div>
        </Fade>

        {/* Right — Contact Form */}
        <Fade bottom duration={1000} distance="30px" delay={200}>
          <div
            className="contact-form-card"
            style={{
              background: theme.highlight + "44",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            }}
          >
            <div className="contact-form-header">
              <h2 className="contact-form-title" style={{ color: theme.text }}>
                Send a Message
              </h2>
              <p
                className="contact-form-desc"
                style={{ color: theme.secondaryText }}
              >
                Fill out the form and I'll get back to you within 24 hours.
              </p>
            </div>

            {alert && (
              <div
                className={`contact-alert ${
                  alert.type === "success"
                    ? "contact-alert-success"
                    : "contact-alert-error"
                }`}
              >
                {alert.type === "success" ? "✓" : "✕"} {alert.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form-fields">
              {/*
                Honeypot field — hidden from real users via CSS.
                Bots that auto-fill all inputs will populate this,
                causing the submission to be silently dropped.
              */}
              <div className="contact-honeypot" aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  id="contact-website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="contact-form-row">
                <div className="contact-input-group">
                  <input
                    type="text"
                    placeholder="Your Name *"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setFormErrors({ ...formErrors, username: "" });
                    }}
                    style={{ color: theme.text }}
                  />
                  {formErrors.username && (
                    <div className="contact-input-error">
                      {formErrors.username}
                    </div>
                  )}
                </div>
                <div className="contact-input-group">
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFormErrors({ ...formErrors, email: "" });
                    }}
                    style={{ color: theme.text }}
                  />
                  {formErrors.email && (
                    <div className="contact-input-error">
                      {formErrors.email}
                    </div>
                  )}
                </div>
              </div>

              <div className="contact-form-row">
                <div className="contact-input-group">
                  <input
                    type="text"
                    placeholder="Phone (Optional)"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setFormErrors({ ...formErrors, phone: "" });
                    }}
                    style={{ color: theme.text }}
                  />
                  {formErrors.phone && (
                    <div className="contact-input-error">
                      {formErrors.phone}
                    </div>
                  )}
                </div>
                <div className="contact-input-group">
                  <input
                    type="text"
                    placeholder="Subject *"
                    value={messageTitle}
                    onChange={(e) => {
                      setMessageTitle(e.target.value);
                      setFormErrors({ ...formErrors, messageTitle: "" });
                    }}
                    style={{ color: theme.text }}
                  />
                  {formErrors.messageTitle && (
                    <div className="contact-input-error">
                      {formErrors.messageTitle}
                    </div>
                  )}
                </div>
              </div>

              <div className="contact-input-group">
                <textarea
                  placeholder="Your Message *"
                  rows="5"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setFormErrors({ ...formErrors, message: "" });
                  }}
                  style={{ color: theme.text }}
                />
                {formErrors.message && (
                  <div className="contact-input-error">
                    {formErrors.message}
                  </div>
                )}
              </div>

              {/* hCaptcha Widget */}
              <div className="contact-captcha-wrapper">
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
                  theme={props.themeMode === "dark" ? "dark" : "light"}
                />
                {captchaError && (
                  <div className="contact-input-error contact-captcha-error">
                    {captchaError}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="contact-submit-btn"
                style={{
                  background: theme.imageHighlight,
                  color: "#fff",
                }}
              >
                Send Message{" "}
                <span className="contact-submit-icon">→</span>
              </button>
            </form>
          </div>
        </Fade>
      </div>

      <Footer theme={theme} />
      <TopButton theme={props.theme} />
    </div>
  );
}

export default Contact;
