import React, { forwardRef } from 'react';
import './Footer.css';
import { ArrowUp, ExternalLink, Sparkles } from 'lucide-react';

export interface FooterLinkItem {
  id?: string;
  label: string;
  href?: string;
  badge?: string;
  external?: boolean;
  onClick?: () => void;
}

export interface FooterColumnItem {
  id?: string;
  title: string;
  links: FooterLinkItem[];
}

export interface FooterStatus {
  label: string;
  state?: 'operational' | 'degraded' | 'maintenance';
}

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  /** Brand logo or title element */
  brand?: React.ReactNode;
  /** Contemplative motto, manifesto quote, or short bio */
  quote?: string;
  /** Multi-column link sets */
  columns?: FooterColumnItem[];
  /** Bottom copyright line */
  copyright?: string;
  /** Legal links at bottom */
  legalLinks?: FooterLinkItem[];
  /** Operational system status */
  status?: FooterStatus;
  /** Whether to show 'Back to top' button */
  showBackToTop?: boolean;
  /** Callback fired when 'Back to top' is pressed */
  onBackToTop?: () => void;
  /** Optional newsletter or subscription widget slot */
  newsletterSlot?: React.ReactNode;
  /** Trailing bottom slot for locale/theme selectors */
  bottomExtra?: React.ReactNode;
  /** Click listener on any footer link */
  onLinkClick?: (link: FooterLinkItem) => void;
  children?: React.ReactNode;
}

/**
 * ThoughtStream Footer Component
 *
 * Contemplative, distraction-free architectural footer with
 * 0px geometry, hairline dividers, multi-column taxonomies,
 * and system telemetry indicators.
 */
export const Footer = forwardRef<HTMLElement, FooterProps>(
  (
    {
      brand,
      quote = 'In quiet thought, clarity emerges.',
      columns = [],
      copyright = `© ${new Date().getFullYear()} ThoughtStream. Distraction-free design.`,
      legalLinks = [
        { label: 'Privacy Treatise', href: '#privacy' },
        { label: 'Terms of Contemplation', href: '#terms' },
        { label: 'Zen Manifesto', href: '#manifesto' },
      ],
      status,
      showBackToTop = true,
      onBackToTop,
      newsletterSlot,
      bottomExtra,
      onLinkClick,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const handleBackToTop = () => {
      if (onBackToTop) {
        onBackToTop();
      } else if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const handleLinkClick = (e: React.MouseEvent, link: FooterLinkItem) => {
      if (link.onClick) {
        e.preventDefault();
        link.onClick();
      }
      onLinkClick?.(link);
    };

    return (
      <footer
        ref={ref}
        className={`ts-footer ${className}`.trim()}
        role="contentinfo"
        {...props}
      >
        <div className="ts-footer__container">
          {/* Main Grid: Brand + Columns + Newsletter */}
          <div className="ts-footer__main-grid">
            {/* Brand & Manifesto Statement */}
            <div className="ts-footer__brand-col">
              {brand ? (
                <div className="ts-footer__brand">{brand}</div>
              ) : (
                <div className="ts-footer__brand">
                  <Sparkles size={18} />
                  <span>ThoughtStream</span>
                </div>
              )}

              {quote && <blockquote className="ts-footer__quote">"{quote}"</blockquote>}

              {status && (
                <div className="ts-footer__status-badge">
                  <span
                    className={[
                      'ts-footer__status-dot',
                      `ts-footer__status-dot--${status.state || 'operational'}`,
                    ].join(' ')}
                    aria-hidden="true"
                  />
                  <span className="ts-footer__status-label">{status.label}</span>
                </div>
              )}
            </div>

            {/* Link Columns */}
            {columns.length > 0 && (
              <div className="ts-footer__columns">
                {columns.map((col, idx) => (
                  <div key={col.id || idx} className="ts-footer__col">
                    <h4 className="ts-footer__col-title">{col.title}</h4>
                    <ul className="ts-footer__col-list">
                      {col.links.map((link, lIdx) => (
                        <li key={link.id || lIdx} className="ts-footer__col-item">
                          <a
                            href={link.href || '#'}
                            className="ts-footer__link"
                            onClick={(e) => handleLinkClick(e, link)}
                            target={link.external ? '_blank' : undefined}
                            rel={link.external ? 'noopener noreferrer' : undefined}
                          >
                            <span>{link.label}</span>
                            {link.badge && (
                              <span className="ts-footer__link-badge">{link.badge}</span>
                            )}
                            {link.external && (
                              <ExternalLink size={12} className="ts-footer__external-icon" />
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Newsletter / Custom Widget Slot */}
            {newsletterSlot && (
              <div className="ts-footer__newsletter-col">{newsletterSlot}</div>
            )}
          </div>

          {/* Children slot for customized layout */}
          {children}

          {/* Hairline Separator */}
          <div className="ts-footer__divider" aria-hidden="true" />

          {/* Bottom Bar: Copyright, Legal, Back to top */}
          <div className="ts-footer__bottom-bar">
            <div className="ts-footer__bottom-left">
              <span className="ts-footer__copyright">{copyright}</span>

              {legalLinks && legalLinks.length > 0 && (
                <nav className="ts-footer__legal-nav" aria-label="Legal navigation">
                  {legalLinks.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <a
                        href={item.href || '#'}
                        className="ts-footer__legal-link"
                        onClick={(e) => handleLinkClick(e, item)}
                      >
                        {item.label}
                      </a>
                      {idx < legalLinks.length - 1 && (
                        <span className="ts-footer__legal-sep" aria-hidden="true">
                          •
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              )}
            </div>

            <div className="ts-footer__bottom-right">
              {bottomExtra}

              {showBackToTop && (
                <button
                  type="button"
                  className="ts-footer__back-to-top"
                  onClick={handleBackToTop}
                  aria-label="Back to top"
                >
                  <span>Return to Top</span>
                  <ArrowUp size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    );
  }
);
Footer.displayName = 'Footer';
