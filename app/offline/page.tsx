export const metadata = { title: "Offline — Heinrich Co. Operations" };

// Shown by the service worker when a page is requested with no network.
export default function OfflinePage() {
  return (
    <div className="login-shell">
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div
          className="glyph"
          style={{ margin: "0 auto 20px", width: 34, height: 34, border: "2px solid var(--green)", position: "relative" }}
        >
          <span style={{ position: "absolute", inset: 8, background: "var(--green)", display: "block" }} />
        </div>
        <div className="w-mark">HEINRICH CO.</div>
        <div style={{ fontSize: 24, fontWeight: 600, color: "var(--offwhite)", marginTop: 12 }}>
          You&apos;re offline
        </div>
        <div style={{ color: "var(--beige)", fontSize: 14, marginTop: 10, lineHeight: 1.6 }}>
          No connection right now. Recently viewed screens still work — reconnect to
          load the latest data.
        </div>
      </div>
    </div>
  );
}
