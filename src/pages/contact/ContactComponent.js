import React, { useState, useRef } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";
import SocialMedia from "../../components/socialMedia/SocialMedia";
import { Fade } from "react-reveal";
import "./ContactComponent.css";
import { greeting, contactPageData } from "../../portfolio.js";
import axios from "axios";

const ContactData = contactPageData.contactSection;
const addressSection = contactPageData.addressSection;

function Contact(props) {
  const theme = props.theme;

  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [alert, setAlert] = useState(null);
  const [formErrors, setFormErrors] = useState({
    username: "",
    email: "",
    phone: "",
    message: "",
    messageTitle: "",
  });

  function isValidEmail(val) {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(val);
  }

  function isValidPhoneNumber(val) {
    return /^\d{10}$/.test(val);
  }

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const userData = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      username,
      email,
      phone,
      messageTitle,
      message,
    };

    const apiUrl =
      process.env.REACT_APP_API_URL ||
      "https://bprdz8u9nd.execute-api.us-east-1.amazonaws.com/v1/portfolio";

    axios
      .post(apiUrl, userData, { headers: { Accept: "application/json" } })
      .then(() => {
        setAlert({ type: "success", text: "Message sent successfully!" });
        setUserName("");
        setEmail("");
        setPhone("");
        setMessageTitle("");
        setMessage("");
      })
      .catch(() => {
        setAlert({
          type: "error",
          text: "Something went wrong. Please try again.",
        });
      });
  };

  return (
    <div className="contact-main">
      <Header theme={theme} />

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
                src={require(`../../assests/images/${ContactData["profile_image_path"]}`)}
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
                href="mailto:amrit.bhattarai990@gmail.com"
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
                  ✉
                </div>
                <div>
                  <p
                    className="contact-info-label"
                    style={{ color: theme.secondaryText }}
                  >
                    Email
                  </p>
                  <p className="contact-info-value">
                    amrit.bhattarai990@gmail.com
                  </p>
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
                  📍
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
              <div className="contact-form-row">
                <div className="contact-input-group">
                  <input
                    type="text"
                    placeholder="Your Name *"
                    value={username}
                    onChange={(e) => {
                      setUserName(e.target.value);
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

              <button
                type="submit"
                className="contact-submit-btn"
                style={{
                  background: theme.imageHighlight,
                  color: "#fff",
                }}
              >
                Send Message
                <span className="contact-submit-icon">→</span>
              </button>
            </form>
          </div>
        </Fade>
      </div>

      <Footer theme={props.theme} onToggle={props.onToggle} />
      <TopButton theme={props.theme} />
    </div>
  );
}

export default Contact;
