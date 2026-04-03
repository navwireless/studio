// src/components/layout/footer.tsx
// Backward-compatible re-export of the new branded footer (Phase 8D).
// Any page that previously imported { Footer } from this file will
// now receive the full branded AppFooter component instead.

export { AppFooter as Footer } from '@/components/layout/app-footer';
export { AppFooter } from '@/components/layout/app-footer';
export { AppFooter as default } from '@/components/layout/app-footer';