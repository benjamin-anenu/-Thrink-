
import React from 'react';
import { Brain } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer w-full py-16 px-6 md:px-12 border-t border-border bg-background/80 backdrop-blur-xl" style={{fontFamily: 'Inter, sans-serif'}}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand & Newsletter */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-8 w-8 text-primary drop-shadow-lg" />
              <span className="text-3xl font-extrabold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent tracking-tight" style={{fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.04em'}}>Thrink</span>
            </div>
            <p className="text-muted-foreground max-w-xs">
              Enterprise-grade, AI-powered project management for leaders. Engineered to Think. Designed to Lead.
            </p>
            <form className="flex items-center gap-2 mt-4" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                className="newsletter-input px-4 py-2 rounded-lg bg-background border border-primary/30 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition w-full max-w-[220px]"
                placeholder="Your email for updates"
                aria-label="Email address"
              />
              <button type="submit" className="btn-primary px-5 py-2 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition" style={{fontFamily: 'Poppins, sans-serif'}}>Subscribe</button>
            </form>
            <div className="flex items-center gap-4 mt-4">
              <a href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-primary hover:bg-primary/10 transition-colors" aria-label="Twitter">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M23 3.01s-2.018 1.192-3.14 1.53a4.48 4.48 0 00-7.86 3v1a10.66 10.66 0 01-9-4.53s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5 0-.278-.028-.556-.08-.83C21.94 5.674 23 3.01 23 3.01z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-primary hover:bg-primary/10 transition-colors" aria-label="LinkedIn">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 9h4v12H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-primary hover:bg-primary/10 transition-colors" aria-label="GitHub">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </div>
          </div>
          {/* Product */}
          <div className="space-y-4">
            <h4 className="footer-section-title font-semibold text-lg text-foreground mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>Product</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="footer-link text-muted-foreground hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="footer-link text-muted-foreground hover:text-primary transition-colors">Integrations</a></li>
              <li><a href="#pricing" className="footer-link text-muted-foreground hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="footer-link text-muted-foreground hover:text-primary transition-colors">Updates</a></li>
              <li><a href="#" className="footer-link text-muted-foreground hover:text-primary transition-colors">Roadmap</a></li>
            </ul>
          </div>
          {/* Company */}
          <div className="space-y-4">
            <h4 className="footer-section-title font-semibold text-lg text-foreground mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="footer-link text-muted-foreground hover:text-primary transition-colors">About</a></li>
              <li><a href="#" className="footer-link text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="footer-link text-muted-foreground hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="footer-link text-muted-foreground hover:text-primary transition-colors">Press</a></li>
              <li><a href="#" className="footer-link text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
          {/* Resources */}
          <div className="space-y-4">
            <h4 className="footer-section-title font-semibold text-lg text-foreground mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="footer-link text-muted-foreground hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="footer-link text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="footer-link text-muted-foreground hover:text-primary transition-colors">Guides & Tutorials</a></li>
              <li><a href="#" className="footer-link text-muted-foreground hover:text-primary transition-colors">API Reference</a></li>
              <li><a href="#" className="footer-link text-muted-foreground hover:text-primary transition-colors">Community</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-muted-foreground text-sm">
          <div>© {new Date().getFullYear()} Thrink. All rights reserved.</div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="footer-link hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="footer-link hover:text-primary transition-colors">Terms</a>
            <a href="#" className="footer-link hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
