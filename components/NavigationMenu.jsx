'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gauge, Settings2, Compass, Activity, ArrowDownUp, Disc, GitFork, Zap, Wind, SlidersHorizontal, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/tune', label: 'PRO TUNE', icon: Zap, isPro: true },
  { href: '/tires', label: 'Tekanan Ban', icon: Gauge },
  { href: '/gearing', label: 'Gearing', icon: Settings2 },
  { href: '/alignment', label: 'Alignment', icon: Compass },
  { href: '/arb', label: 'Anti-Roll', icon: SlidersHorizontal },
  { href: '/springs', label: 'Springs', icon: ArrowDownUp },
  { href: '/aero', label: 'Aero', icon: Wind },
  { href: '/damping', label: 'Damping', icon: Activity },
  { href: '/brake', label: 'Brake', icon: Disc },
  { href: '/differential', label: 'Differential', icon: GitFork },
];

export default function NavigationMenu() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (href) => {
    if (href === '/tune') return pathname === '/tune' || pathname === '/';
    return pathname === href;
  };

  return (
    <>
      <nav className="top-nav" role="navigation" aria-label="Menu utama">
        {/* Desktop nav — hidden on mobile */}
        <div className="nav-container nav-desktop">
          {NAV_ITEMS.map(({ href, label, icon: Icon, isPro }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${isActive(href) ? 'active' : ''}`}
              style={isPro ? { color: '#ffcc00', fontWeight: 'bold' } : undefined}
              aria-current={isActive(href) ? 'page' : undefined}
            >
              <Icon size={18} aria-hidden="true" /> {label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger button */}
        <div className="mobile-nav-header">
          <Link href="/tune" className="mobile-nav-brand" aria-label="Pro Tune Home">
            <Zap size={20} aria-hidden="true" />
            <span>FORZA TUNE</span>
          </Link>
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile overlay menu */}
      <div
        className={`mobile-menu-overlay ${mobileOpen ? 'mobile-menu-overlay--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
      >
        <div className="mobile-menu-inner">
          <div className="mobile-menu-close-row">
            <span className="mobile-menu-title">Menu</span>
            <button
              className="mobile-menu-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mobile-nav-grid" role="menu">
            {NAV_ITEMS.map(({ href, label, icon: Icon, isPro }) => (
              <Link
                key={href}
                href={href}
                className={`mobile-nav-item ${isActive(href) ? 'mobile-nav-item--active' : ''} ${isPro ? 'mobile-nav-item--pro' : ''}`}
                role="menuitem"
                aria-current={isActive(href) ? 'page' : undefined}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={isPro ? 28 : 22} aria-hidden="true" />
                <span className="mobile-nav-item-label">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Backdrop */}
        <div
          className="mobile-menu-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      </div>
    </>
  );
}
