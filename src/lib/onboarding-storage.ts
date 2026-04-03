// src/lib/onboarding-storage.ts
// Onboarding state persistence using localStorage.
// All reads and writes are synchronous and local to the device.
// Keys are namespaced per user to support multi-account on the same browser.

const STORAGE_PREFIX = 'findlos_onboarding';

export interface OnboardingState {
    /** Guided tour finished or skipped with "don't show again" */
    tourComplete: boolean;
    /** ISO date if tour was skipped */
    tourSkippedAt?: string;
    /** ISO date if tour was completed fully */
    tourCompletedAt?: string;
    /** Which micro-hints have been dismissed: { hintId: showCount } */
    hintsShown: Record<string, number>;
    /** Which page help panels have been opened */
    helpPanelSeen: Record<string, boolean>;
    /** IDs of "What's New" items that have been seen */
    whatsNewSeen: string[];
    /** Total analyses performed in this session (tracked client-side) */
    totalAnalyses: number;
    /** Features the user has interacted with */
    featuresUsed: Record<string, boolean>;
}

const DEFAULT_STATE: OnboardingState = {
    tourComplete: false,
    hintsShown: {},
    helpPanelSeen: {},
    whatsNewSeen: [],
    totalAnalyses: 0,
    featuresUsed: {},
};

function getKey(userId?: string): string {
    if (userId) return `${STORAGE_PREFIX}_${userId}`;
    return `${STORAGE_PREFIX}_anonymous`;
}

/** Read onboarding state from localStorage */
export function getOnboardingState(userId?: string): OnboardingState {
    if (typeof window === 'undefined') return { ...DEFAULT_STATE };

    try {
        const raw = localStorage.getItem(getKey(userId));
        if (!raw) return { ...DEFAULT_STATE };
        const parsed = JSON.parse(raw) as Partial<OnboardingState>;
        return { ...DEFAULT_STATE, ...parsed };
    } catch {
        return { ...DEFAULT_STATE };
    }
}

/** Write a partial onboarding state update to localStorage */
export function updateOnboardingState(
    partial: Partial<OnboardingState>,
    userId?: string
): void {
    if (typeof window === 'undefined') return;

    try {
        const current = getOnboardingState(userId);
        const updated = { ...current, ...partial };

        // Merge nested objects instead of replacing
        if (partial.hintsShown) {
            updated.hintsShown = { ...current.hintsShown, ...partial.hintsShown };
        }
        if (partial.helpPanelSeen) {
            updated.helpPanelSeen = {
                ...current.helpPanelSeen,
                ...partial.helpPanelSeen,
            };
        }
        if (partial.whatsNewSeen) {
            updated.whatsNewSeen = [
                ...new Set([...current.whatsNewSeen, ...partial.whatsNewSeen]),
            ];
        }
        if (partial.featuresUsed) {
            updated.featuresUsed = {
                ...current.featuresUsed,
                ...partial.featuresUsed,
            };
        }

        localStorage.setItem(getKey(userId), JSON.stringify(updated));
    } catch {
        // localStorage may be full or disabled — fail silently
    }
}

/** Completely reset onboarding state (for testing or settings page) */
export function resetOnboardingState(userId?: string): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(getKey(userId));
    } catch {
        // fail silently
    }
}