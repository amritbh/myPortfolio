import React, { useState } from "react";
import "./Footer.css";
import { greeting } from "../../portfolio";
import { Link } from "react-router-dom";
import type { Theme } from "../../types";
import { subscribeToNewsletter } from "../../utils/apiClient";

const SOCIAL_LINKS = [
  {
    name: "GitHub",
    href: "https://github.com/amritbh",
    ariaLabel: "GitHub profile",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/bamrit/",
    ariaLabel: "LinkedIn profile",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@amritbh",
    ariaLabel: "YouTube channel",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
      </svg>
    ),
  },
  {
    name: "Gmail",
    href: "mailto:bhattarai.amrit90@gmail.com",
    ariaLabel: "Send email",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
      </svg>
    ),
  },
];

const QUICK_LINKS = [
  { label: "Home", to: "/home" },
  { label: "Blog", to: "/blogs" },
  { label: "Travel", to: "/travel" },
  { label: "Contact", to: "/contact" },
];

interface FooterProps {
  theme?: Theme;
}

const NewsletterForm: React.FC<{ theme?: Theme }> = ({ theme }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setLoading(true);
    setError("");
    
    const result = await subscribeToNewsletter(email);
    
    if (result.success) {
      setSubmitted(true);
      setEmail("");
    } else {
      setError(result.error || "Something went wrong. Please try again.");
    }
    
    setLoading(false);
  };

  if (submitted) {
    return (
      <output className="footer-newsletter-confirm">
        <span role="img" aria-label="check">
          ✅
        </span>{" "}
        Thanks! You'll be notified when new posts go live.
      </output>
    );
  }

  return (
    <form
      className="footer-newsletter-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: '300px' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            id="footer-email-input"
            type="email"
            className="footer-email-input"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email address"
            disabled={loading}
            style={{
              backgroundColor: theme ? theme.compImgHighlight : undefined,
              color: theme ? theme.text : undefined,
              borderColor: theme ? theme.highlight : undefined,
            }}
          />
          <button
            type="submit"
            className="footer-subscribe-btn"
            disabled={loading}
            style={{
              backgroundColor: theme ? theme.jacketColor : "#388BFD",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '...' : 'Subscribe'}
          </button>
        </div>
        {error && (
          <span style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>
            {error}
          </span>
        )}
      </div>
    </form>
  );
};

const Footer: React.FC<FooterProps> = ({ theme }) => {
  return (
    <footer
      className="footer-root"
      id="footer-newsletter"
      style={{
        backgroundColor: theme ? theme.body : undefined,
        borderTop: theme
          ? `1px solid ${theme.highlight || "rgba(255,255,255,0.08)"}`
          : undefined,
      }}
    >
      {/* ── Row 1: Newsletter ────────────────────────────── */}
      <div className="footer-newsletter-row">
        <p
          className="footer-newsletter-heading"
          style={{ color: theme ? theme.text : undefined }}
        >
          Stay updated on new posts
        </p>
        <NewsletterForm theme={theme} />
      </div>

      {/* ── Row 2: Links + Socials ───────────────────────── */}
      <div
        className="footer-links-row"
        style={{
          borderTop: theme
            ? `1px solid ${theme.highlight || "rgba(255,255,255,0.06)"}`
            : undefined,
        }}
      >
        <nav className="footer-quick-links" aria-label="Footer navigation">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="footer-quick-link"
              style={{ color: theme ? theme.secondaryText : undefined }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="footer-social-icons">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-icon"
              aria-label={social.ariaLabel}
              style={{ color: theme ? theme.secondaryText : undefined }}
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>

      {/* ── Row 3: Copyright ─────────────────────────────── */}
      <div className="footer-copyright">
        <p
          className="footer-copyright-text"
          style={{ color: theme ? theme.secondaryText : undefined }}
        >
          Made with{" "}
          <span role="img" aria-label="love">
            ❤️
          </span>{" "}
          by {greeting.title} · © 2024–2026
        </p>
      </div>
    </footer>
  );
};

export default Footer;
