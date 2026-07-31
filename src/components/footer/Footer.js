import React, { useState, useEffect } from "react";
import "./Footer.css";
import { Fade } from "react-reveal";
import { greeting } from "../../portfolio.js";
import {
  getStoredUser,
  clearSession,
  deleteAccount,
} from "../../utils/apiClient";
/* eslint-disable jsx-a11y/accessible-emoji */

export default function Footer(props) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete your account? This cannot be undone."
      )
    ) {
      const res = await deleteAccount();
      if (res.success) {
        clearSession();
        window.location.href = "/";
      } else {
        alert(res.error || "Failed to delete account");
      }
    }
  };

  return (
    <div className="footer-div">
      <Fade>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <p
            className="footer-text"
            style={{ color: props.theme.secondaryText }}
          >
            Made with <span role="img">❤️</span> by {greeting.title}
          </p>
          {user && (
            <button
              onClick={handleDeleteAccount}
              style={{
                background: "none",
                border: "none",
                color: "#d9534f",
                cursor: "pointer",
                marginTop: "10px",
                fontSize: "13px",
                textDecoration: "underline",
              }}
              title="Permanently delete your account"
            >
              Delete Account
            </button>
          )}
        </div>
      </Fade>
    </div>
  );
}
