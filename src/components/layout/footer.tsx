
"use client";

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-900/50 text-slate-400 text-xs text-center p-3 border-t border-slate-700/60 print:hidden h-6 flex items-center justify-center">
      Made with ❤️ by{' '}
      <a
        href="https://www.linkedin.com/in/rajpatelofficial"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-primary/80 underline"
      >
        RK
      </a>
      .
    </footer>
  );
}
