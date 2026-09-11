import { ExternalLink, Github } from 'lucide-react';
import type { Page } from '../../types';
import telosLogo from '../../assets/telos-logo.jpeg';

export function SiteFooter({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <footer className="telos-site-footer">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <div className="footer-logo-row">
            <img src={telosLogo} alt="TeLos Logo" className="footer-logo-img" />
            <span className="footer-brand-title">TeLos</span>
          </div>
          <p className="footer-tagline">
            High-signal technical interview calibration studio built for college students, new grads, and software engineers aiming for breakthrough careers in tech.
          </p>
        </div>

        <div className="footer-links-col">
          <span className="footer-col-head">STUDIO TRACKS</span>
          <button type="button" onClick={() => onNavigate('studio')}>01 / Live Mock Interview</button>
          <button type="button" onClick={() => onNavigate('prep')}>02 / Company Prep Playbooks</button>
          <button type="button" onClick={() => onNavigate('bank')}>03 / System &amp; DSA Drills</button>
          <button type="button" onClick={() => onNavigate('analytics')}>04 / Cadence &amp; Analytics</button>
          <button type="button" onClick={() => onNavigate('community')}>05 / Discuss &amp; Community</button>
        </div>

        <div className="footer-links-col">
          <span className="footer-col-head">OPEN SOURCE REPO</span>
          <a
            href="https://github.com/piyush23-eng/TeLos"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-github-card"
          >
            <Github size={20} />
            <div>
              <b>piyush23-eng / TeLos</b>
              <small>View source code &amp; star on GitHub <ExternalLink size={11} style={{ display: 'inline', marginLeft: 2 }} /></small>
            </div>
          </a>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <span>© {new Date().getFullYear()} TELOS • REAL SYSTEMS. DEEP TRADEOFFS. ZERO CANNED TRIVIA.</span>
        <a
          href="https://github.com/piyush23-eng/TeLos"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-bottom-gh-link"
        >
          <Github size={14} /> github.com/piyush23-eng/TeLos
        </a>
      </div>
    </footer>
  );
}
