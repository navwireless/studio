"use client";

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full h-10 border-t border-border/40 bg-background/95 backdrop-blur-sm print:hidden">
      <div className="container mx-auto h-full flex items-center justify-between px-4 md:px-6">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Nav Wireless
        </p>
        <p className="text-xs text-muted-foreground">
          Developed by{' '}
          <Link
            href="https://www.linkedin.com/in/rajpatelofficial"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4 hover:text-foreground"
          >
            Raj Patel
          </Link>
        </p>
      </div>
    </footer>
  );
}
