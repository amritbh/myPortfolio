import React, { useEffect, Suspense } from "react";
import { useParams, Redirect, Link } from "react-router-dom";
import { Fade } from "react-reveal";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import PhotoGallery from "../../components/photoGallery/PhotoGallery";
import { travelData } from "../../portfolio";
import type { Theme, ThemeMode } from "../../types";
import "./DestinationDetail.css";

interface DestinationDetailProps {
  theme: Theme;
  themeMode?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "#2ea043",
  Moderate: "#d29922",
  Strenuous: "#da3633",
};

const DestinationDetail: React.FC<DestinationDetailProps> = ({
  theme,
  themeMode,
  onThemeChange,
}) => {
  const { countryId, destinationId } = useParams<{
    countryId: string;
    destinationId: string;
  }>();

  // Resolve from portfolio data
  const country = travelData.countries.find((c) => c.id === countryId);
  const dest = country?.destinations.find((d) => d.id === destinationId);

  // 404 — redirect back to travel hub
  if (!country || !dest) {
    return <Redirect to="/travel" />;
  }

  const isTrek = dest.type === "trek";
  const isHike = dest.type === "hike";
  const hasTrailStats = isTrek || isHike;

  // Related destinations: same country, same type, exclude self, max 4
  const relatedDests = country.destinations
    .filter((d) => d.id !== dest.id && d.type === dest.type)
    .slice(0, 4);

  // JSON-LD structured data injection
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const schema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "TouristAttraction",
      name: dest.name,
      description: dest.description,
      image: `https://amrit.cloud/media/travel/${dest.id}/gallery/cover.webp`,
      address: {
        "@type": "PostalAddress",
        addressCountry: country.name,
        addressRegion: dest.region,
      },
    };

    if (dest.coordinates) {
      schema["geo"] = {
        "@type": "GeoCoordinates",
        latitude: dest.coordinates[0],
        longitude: dest.coordinates[1],
      };
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "destination-ld-json";
    script.innerHTML = JSON.stringify(schema);
    document.head.appendChild(script);

    // Set page title
    const prevTitle = document.title;
    document.title = `${dest.name} — ${country.name} | amrit.cloud`;

    return () => {
      const el = document.getElementById("destination-ld-json");
      if (el) document.head.removeChild(el);
      document.title = prevTitle;
    };
  }, [dest, country]);

  return (
    <div
      className="dest-detail-page"
      style={{ backgroundColor: theme.body }}
      data-testid="dest-detail-page"
    >
      <Header theme={theme} themeMode={themeMode} onThemeChange={onThemeChange} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="dest-detail-hero"
        style={
          {
            "--dest-accent": country.accentColor,
            backgroundImage: `url(https://amrit.cloud/media/travel/${dest.id}/gallery/cover.webp)`,
          } as React.CSSProperties
        }
        data-testid="dest-detail-hero"
      >
        <div className="dest-detail-hero-overlay" />
        <div className="dest-detail-hero-content">
          <Fade bottom duration={600}>
            <Link to="/travel" className="dest-back-link">
              ← All Destinations
            </Link>
            <div className="dest-hero-meta">
              <span className="dest-hero-flag">{country.flag}</span>
              <span
                className="dest-hero-region"
                style={{ color: country.accentColor }}
              >
                {dest.region}
              </span>
            </div>
            <h1 className="dest-detail-title" data-testid="dest-detail-h1">
              {dest.name}
            </h1>
          </Fade>

          {/* Trail stats bar — trek & hike only */}
          {hasTrailStats && (
            <Fade bottom duration={700} delay={100}>
              <div className="dest-trail-stats-bar" data-testid="dest-trail-stats-bar">
                {dest.elevation && (
                  <div className="dest-trail-stat">
                    <span className="dest-trail-stat-icon">📍</span>
                    <span className="dest-trail-stat-value">{dest.elevation}</span>
                    <span className="dest-trail-stat-label">Elevation</span>
                  </div>
                )}
                {dest.duration && (
                  <div className="dest-trail-stat">
                    <span className="dest-trail-stat-icon">
                      {isTrek ? "🗓" : "⏱"}
                    </span>
                    <span className="dest-trail-stat-value">{dest.duration}</span>
                    <span className="dest-trail-stat-label">Duration</span>
                  </div>
                )}
                {dest.difficulty && (
                  <div className="dest-trail-stat">
                    <span className="dest-trail-stat-icon">💪</span>
                    <span
                      className="dest-trail-stat-value"
                      style={{ color: DIFFICULTY_COLOR[dest.difficulty] }}
                    >
                      {dest.difficulty}
                    </span>
                    <span className="dest-trail-stat-label">Difficulty</span>
                  </div>
                )}
                <div className="dest-trail-stat">
                  <span className="dest-trail-stat-icon">{dest.emoji}</span>
                  <span className="dest-trail-stat-value">
                    {dest.type.charAt(0).toUpperCase() + dest.type.slice(1)}
                  </span>
                  <span className="dest-trail-stat-label">Type</span>
                </div>
              </div>
            </Fade>
          )}
        </div>
      </section>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div
        className="dest-detail-content"
        style={{ backgroundColor: theme.body }}
      >
        {/* LEFT: main */}
        <main className="dest-detail-main">
          <Fade bottom duration={600}>
            <p
              className="dest-detail-description"
              style={{ color: theme.secondaryText }}
            >
              {dest.description}
            </p>
          </Fade>

          {dest.highlight && (
            <Fade bottom duration={700} delay={80}>
              <blockquote
                className="dest-detail-highlight"
                style={{
                  color: country.accentColor,
                  borderLeftColor: country.accentColor,
                }}
                data-testid="dest-highlight"
              >
                &ldquo;{dest.highlight}&rdquo;
              </blockquote>
            </Fade>
          )}

          {/* Photo Gallery */}
          {dest.hasGallery && (
            <Fade bottom duration={700} delay={120}>
              <section
                className="dest-gallery-section"
                aria-label="Photo gallery"
                data-testid="dest-gallery-section"
              >
                <h2
                  className="dest-section-heading"
                  style={{ color: theme.text }}
                >
                  Gallery
                </h2>
                <Suspense fallback={null}>
                  <PhotoGallery destinationId={dest.id} detailMode={true} />
                </Suspense>
              </section>
            </Fade>
          )}

          {/* Link to blog post */}
          {dest.blogSlug && (
            <Fade bottom duration={700} delay={160}>
              <div className="dest-blog-cta">
                <Link
                  to={`/blogs/${dest.blogSlug}`}
                  className="dest-read-story-btn"
                  style={{
                    backgroundColor: country.accentColor,
                    borderColor: country.accentColor,
                  }}
                  data-testid="dest-blog-link"
                >
                  ✍ Read the Full Story
                </Link>
              </div>
            </Fade>
          )}
        </main>

        {/* RIGHT: sidebar */}
        <aside
          className="dest-detail-sidebar"
          data-testid="dest-detail-sidebar"
        >
          {/* Quick stats card */}
          <Fade right duration={700} delay={200}>
            <div
              className="dest-stats-card"
              style={{
                backgroundColor: theme.headerColor,
                borderColor: country.accentColor + "33",
              }}
            >
              <h3
                className="dest-stats-card-title"
                style={{ color: theme.text }}
              >
                Quick Facts
              </h3>
              <ul className="dest-stats-list">
                <li
                  className="dest-stats-item"
                  style={{ color: theme.secondaryText }}
                >
                  <span className="dest-stats-label">Country</span>
                  <span className="dest-stats-value">
                    {country.flag} {country.name}
                  </span>
                </li>
                <li
                  className="dest-stats-item"
                  style={{ color: theme.secondaryText }}
                >
                  <span className="dest-stats-label">Region</span>
                  <span className="dest-stats-value">{dest.region}</span>
                </li>
                <li
                  className="dest-stats-item"
                  style={{ color: theme.secondaryText }}
                >
                  <span className="dest-stats-label">Type</span>
                  <span className="dest-stats-value">
                    {dest.emoji}{" "}
                    {dest.type.charAt(0).toUpperCase() + dest.type.slice(1)}
                  </span>
                </li>
                {dest.elevation && (
                  <li
                    className="dest-stats-item"
                    style={{ color: theme.secondaryText }}
                  >
                    <span className="dest-stats-label">Elevation</span>
                    <span className="dest-stats-value">{dest.elevation}</span>
                  </li>
                )}
                {dest.duration && (
                  <li
                    className="dest-stats-item"
                    style={{ color: theme.secondaryText }}
                  >
                    <span className="dest-stats-label">Duration</span>
                    <span className="dest-stats-value">{dest.duration}</span>
                  </li>
                )}
                {dest.difficulty && (
                  <li
                    className="dest-stats-item"
                    style={{ color: theme.secondaryText }}
                  >
                    <span className="dest-stats-label">Difficulty</span>
                    <span
                      className="dest-stats-value"
                      style={{ color: DIFFICULTY_COLOR[dest.difficulty] }}
                    >
                      {dest.difficulty}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </Fade>

          {/* Related destinations */}
          {relatedDests.length > 0 && (
            <Fade right duration={700} delay={300}>
              <div
                className="dest-related-card"
                style={{
                  backgroundColor: theme.headerColor,
                  borderColor: theme.highlight,
                }}
                data-testid="dest-related-card"
              >
                <h3
                  className="dest-stats-card-title"
                  style={{ color: theme.text }}
                >
                  Similar Destinations
                </h3>
                <ul className="dest-related-list">
                  {relatedDests.map((rd) => (
                    <li key={rd.id} className="dest-related-item">
                      <Link
                        to={`/travel/${country.id}/${rd.id}`}
                        className="dest-related-link"
                        style={{ color: country.accentColor }}
                        data-testid={`related-link-${rd.id}`}
                      >
                        <span className="dest-related-emoji">{rd.emoji}</span>
                        <span className="dest-related-name">{rd.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Fade>
          )}

          {/* Back link */}
          <Fade right duration={700} delay={400}>
            <Link
              to="/travel"
              className="dest-back-all-link"
              style={{ color: theme.secondaryText }}
            >
              ← Back to all destinations
            </Link>
          </Fade>
        </aside>
      </div>

      <Footer theme={theme} />
    </div>
  );
};

export default DestinationDetail;
