import React from 'react';
import { Heart } from 'lucide-react';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="fic-footer">
      <div className="fic-footer__left">
        <span>© 2026 <strong>Forge India Connect</strong>. All rights reserved.</span>
        <span className="fic-footer__version">v2.4.0 (Production Build)</span>
      </div>
      <div className="fic-footer__right">
        <div className="fic-footer__status">
          <span className="fic-footer__status-dot" />
          <span>All Systems Operational</span>
        </div>
        <span className="fic-footer__divider">•</span>
        <a href="#privacy" className="fic-footer__link">
          Privacy Policy
        </a>
        <span className="fic-footer__divider">•</span>
        <a href="#terms" className="fic-footer__link">
          Partner Terms
        </a>
        <span className="fic-footer__divider">•</span>
        <span className="fic-footer__built">
          Made with <Heart size={12} color="#EF4444" fill="#EF4444" /> for Indian Restaurateurs
        </span>
      </div>
    </footer>
  );
};
