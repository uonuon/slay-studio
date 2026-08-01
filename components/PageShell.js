// Server component — shared chrome for the side pages (/about, /prices,
// /faq): top nav with logo + book CTA, content, then the site footer.
import SiteFooter from "./SiteFooter";

export default function PageShell({ data, children }) {
  return (
    <div className="site">
      <div className="shell guide">
        <header className="gnav">
          <a className="gnav-brand" href="/"><img src="/logo-s.png" alt="Slay Studio logo" />Slay Studio</a>
          <a className="findus-btn" href="/">Book online · احجزي ←</a>
        </header>
        {children}
        <SiteFooter {...data} />
      </div>
    </div>
  );
}
