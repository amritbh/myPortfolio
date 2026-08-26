import React, { useState } from "react";
import "./ConsultingPage.css";
import { consulting, greeting } from "../../portfolio";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";
import { Fade } from "react-reveal";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import type { Theme, ThemeMode } from "../../types";

const HCAPTCHA_SITE_KEY =
  import.meta.env.VITE_HCAPTCHA_SITE_KEY ||
  "10000000-ffff-ffff-ffff-000000000001";

interface ConsultingPageProps {
  theme: Theme;
  themeMode?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
}

const ConsultingPage: React.FC<ConsultingPageProps> = ({
  theme,
  themeMode,
  onThemeChange,
}) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [helpText, setHelpText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState("");
  const captchaRef = React.useRef<HCaptcha>(null);

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Please enter your name.");
      return;
    }
    if (!email.trim() || !emailRegex.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!captchaToken) {
      setCaptchaError("Please complete the CAPTCHA challenge.");
      return;
    }
    setFormError("");
    setCaptchaError("");

    const baseApiUrl = import.meta.env.VITE_CUSTOM_API_URL || "";
    fetch(`${baseApiUrl}/portfolio`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        id: `consulting-waitlist-${Date.now()}`,
        username: name,
        email,
        messageTitle: "[Consulting Waitlist]",
        message: helpText
          ? `Consulting waitlist signup. What they need help with: ${helpText}`
          : `Consulting waitlist signup from ${name} (${email}).`,
        formType: "consulting_waitlist",
        captchaToken,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        setSubmitted(true);
        setName("");
        setEmail("");
        setHelpText("");
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
      })
      .catch(() => {
        setFormError("Something went wrong. Please try again.");
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
      });
  };

  const personas = [
    {
      icon: "🏢",
      title: "Startup CTO",
      desc: "You're scaling fast and need a second opinion on your AWS architecture before your next funding round.",
    },
    {
      icon: "👔",
      title: "Engineering Manager",
      desc: "Your team is migrating to Terraform or IaC and you want an expert review before you go to production.",
    },
    {
      icon: "🎓",
      title: "Career Switcher",
      desc: "You're moving from software to cloud and want a clear roadmap, certification guidance, and honest advice.",
    },
  ];

  return (
    <div className="consulting-page" data-testid="consulting-page">
      <Header theme={theme} themeMode={themeMode} onThemeChange={onThemeChange} />

      {/* Hero */}
      <Fade bottom duration={800} distance="24px">
        <div className="consulting-hero">
          <span
            className="consulting-hero-badge"
            style={{ color: theme.imageHighlight, borderColor: theme.imageHighlight }}
          >
            Availability Opening Soon
          </span>
          <h1 className="consulting-hero-title" style={{ color: theme.text }}>
            {consulting.tagline}
          </h1>
          <p className="consulting-hero-subtitle" style={{ color: theme.secondaryText }}>
            {consulting.pitch}
          </p>
          <a href="#consulting-waitlist-form" className="consulting-hero-cta" style={{ background: theme.imageHighlight }}>
            Join the Waitlist →
          </a>
        </div>
      </Fade>

      {/* Services */}
      <Fade bottom duration={900} distance="28px" delay={80}>
        <section className="consulting-services-section">
          <h2 className="consulting-section-title" style={{ color: theme.text }}>
            What I Offer
          </h2>
          <p className="consulting-section-sub" style={{ color: theme.secondaryText }}>
            Three focused engagements, each built around a specific engineering need.
          </p>
          <div className="consulting-services-grid">
            {consulting.services.map((svc) => (
              <div
                key={svc.id}
                className="consulting-service-card"
                data-testid={`consulting-service-${svc.id}`}
                style={{
                  background: `${theme.highlight}1A`,
                  borderColor: `${theme.highlight}55`,
                }}
              >
                <div className="consulting-svc-icon">{svc.icon}</div>
                <span
                  className="consulting-svc-badge"
                  style={{ color: "#F0A500", borderColor: "#F0A50055" }}
                >
                  Coming Soon
                </span>
                <h3 className="consulting-svc-title" style={{ color: theme.text }}>
                  {svc.title}
                </h3>
                <p className="consulting-svc-desc" style={{ color: theme.secondaryText }}>
                  {svc.description}
                </p>
                <div className="consulting-svc-meta">
                  <span
                    className="consulting-meta-pill"
                    style={{ color: theme.imageHighlight, background: `${theme.imageHighlight}18` }}
                  >
                    ⏱ {svc.duration}
                  </span>
                </div>
                <p className="consulting-svc-best-for" style={{ color: theme.secondaryText }}>
                  <strong style={{ color: theme.text }}>Best for:</strong> {svc.bestFor}
                </p>
              </div>
            ))}
          </div>
        </section>
      </Fade>

      {/* Who this is for */}
      <Fade bottom duration={900} distance="28px" delay={80}>
        <section className="consulting-for-section">
          <h2 className="consulting-section-title" style={{ color: theme.text }}>
            Who This Is For
          </h2>
          <div className="consulting-personas-grid">
            {personas.map((p) => (
              <div
                key={p.title}
                className="consulting-persona-card"
                data-testid={`persona-${p.title.toLowerCase().replace(/\s/g, "-")}`}
                style={{
                  background: `${theme.highlight}14`,
                  borderColor: `${theme.highlight}44`,
                }}
              >
                <span className="consulting-persona-icon">{p.icon}</span>
                <h3 style={{ color: theme.text }}>{p.title}</h3>
                <p style={{ color: theme.secondaryText }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </Fade>

      {/* FAQ */}
      <Fade bottom duration={900} distance="28px" delay={80}>
        <section className="consulting-faq-section">
          <h2 className="consulting-section-title" style={{ color: theme.text }}>
            Frequently Asked Questions
          </h2>
          <div className="consulting-faq-list">
            {consulting.faq.map((item, i) => (
              <div
                key={i}
                className={`consulting-faq-item ${openFaq === i ? "open" : ""}`}
                style={{ borderColor: `${theme.highlight}55` }}
                data-testid={`faq-item-${i}`}
              >
                <button
                  id={`faq-toggle-${i}`}
                  className="consulting-faq-question"
                  style={{ color: theme.text }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  {item.q}
                  <span className="consulting-faq-chevron">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <p
                    className="consulting-faq-answer"
                    style={{ color: theme.secondaryText }}
                    data-testid={`faq-answer-${i}`}
                  >
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </Fade>

      {/* Waitlist Form */}
      <Fade bottom duration={900} distance="28px" delay={80}>
        <section
          id="consulting-waitlist-form"
          className="consulting-waitlist-section"
        >
          <div
            className="consulting-waitlist-card"
            style={{
              background: `${theme.highlight}18`,
              borderColor: `${theme.imageHighlight}33`,
            }}
          >
            {submitted ? (
              <div className="consulting-success" data-testid="consulting-success-message">
                <span className="consulting-success-icon">✓</span>
                <h3 style={{ color: theme.text }}>You're on the list!</h3>
                <p style={{ color: theme.secondaryText }}>
                  I'll reach out personally when consulting spots open. Looking forward to working with you.
                </p>
              </div>
            ) : (
              <>
                <h2 className="consulting-section-title" style={{ color: theme.text }}>
                  Join the Waitlist
                </h2>
                <p style={{ color: theme.secondaryText, marginBottom: "28px", textAlign: "center" }}>
                  {consulting.waitlistNote}
                </p>

                <form
                  className="consulting-waitlist-form"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <div className="consulting-form-row">
                    <div className="consulting-input-group">
                      <label
                        htmlFor="consulting-name"
                        style={{ color: theme.secondaryText }}
                      >
                        Your Name *
                      </label>
                      <input
                        id="consulting-name"
                        type="text"
                        placeholder={`e.g. ${greeting.title}`}
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setFormError("");
                        }}
                        style={{ color: theme.text, background: theme.body, borderColor: `${theme.highlight}88` }}
                      />
                    </div>
                    <div className="consulting-input-group">
                      <label
                        htmlFor="consulting-email"
                        style={{ color: theme.secondaryText }}
                      >
                        Email Address *
                      </label>
                      <input
                        id="consulting-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setFormError("");
                        }}
                        style={{ color: theme.text, background: theme.body, borderColor: `${theme.highlight}88` }}
                      />
                    </div>
                  </div>

                  <div className="consulting-input-group">
                    <label
                      htmlFor="consulting-help"
                      style={{ color: theme.secondaryText }}
                    >
                      What do you need help with? (Optional)
                    </label>
                    <textarea
                      id="consulting-help"
                      rows={4}
                      placeholder="Briefly describe your AWS setup, challenge, or goal..."
                      value={helpText}
                      onChange={(e) => setHelpText(e.target.value)}
                      style={{ color: theme.text, background: theme.body, borderColor: `${theme.highlight}88` }}
                    />
                  </div>

                  <div className="consulting-captcha-wrapper">
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
                      theme={themeMode === "dark" ? "dark" : "light"}
                    />
                  </div>

                  {formError && (
                    <p className="consulting-form-error" data-testid="consulting-form-error">
                      {formError}
                    </p>
                  )}
                  {captchaError && (
                    <p className="consulting-form-error" data-testid="consulting-captcha-error">
                      {captchaError}
                    </p>
                  )}

                  <button
                    id="consulting-submit-btn"
                    type="submit"
                    className="consulting-submit-btn"
                    style={{ background: theme.imageHighlight }}
                  >
                    Join Waitlist →
                  </button>
                  <p className="consulting-form-note" style={{ color: theme.secondaryText }}>
                    No spam. Just one message when I open spots.
                  </p>
                </form>
              </>
            )}
          </div>
        </section>
      </Fade>

      <Footer theme={theme} />
      <TopButton theme={theme} />
    </div>
  );
};

export default ConsultingPage;
