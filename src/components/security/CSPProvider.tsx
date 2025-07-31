
import React, { useEffect } from 'react';

interface CSPProviderProps {
  children: React.ReactNode;
}

export const CSPProvider: React.FC<CSPProviderProps> = ({ children }) => {
  useEffect(() => {
    // Create Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://hkitnfvgxkozfqfpjrcz.supabase.co",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' wss: https: https://hkitnfvgxkozfqfpjrcz.supabase.co https://openrouter.ai",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'",
      "media-src 'self'"
    ].join('; ');

    // Check if CSP meta tag already exists
    let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    
    if (!cspMeta) {
      cspMeta = document.createElement('meta');
      cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
      document.head.appendChild(cspMeta);
    }
    
    cspMeta.setAttribute('content', csp);

    // Add other security headers via meta tags
    const securityHeaders = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: 'DENY' },
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
    ];

    securityHeaders.forEach(header => {
      let meta = document.querySelector(`meta[name="${header.name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', header.name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', header.content);
    });

    console.log('[Security] Content Security Policy and security headers applied');
  }, []);

  return <>{children}</>;
};
