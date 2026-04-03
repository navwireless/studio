// src/lib/project-storage.ts
// Phase 12A — localStorage CRUD for map project items

import type { MapProject, ProjectItem } from '@/types/map-project';
import { createEmptyProject } from '@/types/map-project';

const STORAGE_KEY = 'findlos_map_project';

// ─── Read / Write ───────────────────────────────────────────────────

/** Load the current project from localStorage */
export function loadProject(): MapProject {
    if (typeof window === 'undefined') return createEmptyProject();

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return createEmptyProject();

        const parsed = JSON.parse(raw) as MapProject;

        // Validate structure
        if (!parsed.id || !Array.isArray(parsed.items)) {
            return createEmptyProject();
        }

        return parsed;
    } catch {
        return createEmptyProject();
    }
}

/** Save the entire project to localStorage */
export function saveProject(project: MapProject): void {
    if (typeof window === 'undefined') return;

    try {
        const updated: MapProject = {
            ...project,
            updatedAt: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
        console.warn('[project-storage] Save failed:', e);
    }
}

// ─── Item CRUD ──────────────────────────────────────────────────────

/** Add an item to the project */
export function addProjectItem(item: ProjectItem): MapProject {
    const project = loadProject();
    project.items.push(item);
    project.updatedAt = Date.now();
    saveProject(project);
    return project;
}

/** Update an existing item by ID */
export function updateProjectItem(
    itemId: string,
    updates: Partial<ProjectItem>
): MapProject {
    const project = loadProject();
    const index = project.items.findIndex((i) => i.id === itemId);

    if (index !== -1) {
        project.items[index] = {
            ...project.items[index],
            ...updates,
            updatedAt: Date.now(),
        };
        project.updatedAt = Date.now();
        saveProject(project);
    }

    return project;
}

/** Delete an item by ID */
export function deleteProjectItem(itemId: string): MapProject {
    const project = loadProject();
    project.items = project.items.filter((i) => i.id !== itemId);
    project.updatedAt = Date.now();
    saveProject(project);
    return project;
}

/** Delete multiple items by IDs */
export function deleteProjectItems(itemIds: string[]): MapProject {
    const idSet = new Set(itemIds);
    const project = loadProject();
    project.items = project.items.filter((i) => !idSet.has(i.id));
    project.updatedAt = Date.now();
    saveProject(project);
    return project;
}

/** Toggle visibility of an item */
export function toggleItemVisibility(itemId: string): MapProject {
    const project = loadProject();
    const item = project.items.find((i) => i.id === itemId);

    if (item) {
        item.visible = !item.visible;
        item.updatedAt = Date.now();
        project.updatedAt = Date.now();
        saveProject(project);
    }

    return project;
}

/** Set visibility for all items */
export function setAllItemsVisibility(visible: boolean): MapProject {
    const project = loadProject();
    const now = Date.now();

    project.items.forEach((item) => {
        item.visible = visible;
        item.updatedAt = now;
    });

    project.updatedAt = now;
    saveProject(project);
    return project;
}

/** Clear all items from project */
export function clearProject(): MapProject {
    const project = loadProject();
    project.items = [];
    project.updatedAt = Date.now();
    saveProject(project);
    return project;
}

/** Rename project */
export function renameProject(name: string): MapProject {
    const project = loadProject();
    project.name = name;
    project.updatedAt = Date.now();
    saveProject(project);
    return project;
}

// ─── Reordering ─────────────────────────────────────────────────────

/** Move an item to a new index position */
export function reorderProjectItem(
    itemId: string,
    newIndex: number
): MapProject {
    const project = loadProject();
    const currentIndex = project.items.findIndex((i) => i.id === itemId);

    if (currentIndex === -1) return project;

    const [item] = project.items.splice(currentIndex, 1);
    const clampedIndex = Math.max(0, Math.min(newIndex, project.items.length));
    project.items.splice(clampedIndex, 0, item);

    project.updatedAt = Date.now();
    saveProject(project);
    return project;
}

// ─── Import ─────────────────────────────────────────────────────────

/** Merge imported items into the current project */
export function importItems(items: ProjectItem[]): MapProject {
    const project = loadProject();
    const now = Date.now();

    // Assign fresh IDs to avoid conflicts
    const imported = items.map((item) => ({
        ...item,
        id: `pi_${now}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: now,
        updatedAt: now,
    }));

    project.items.push(...imported);
    project.updatedAt = now;
    saveProject(project);
    return project;
}

// ─── Query Helpers ──────────────────────────────────────────────────

/** Get all visible items */
export function getVisibleItems(): ProjectItem[] {
    return loadProject().items.filter((i) => i.visible);
}

/** Get item count */
export function getItemCount(): number {
    return loadProject().items.length;
}

/** Check if project has any items */
export function hasItems(): boolean {
    return loadProject().items.length > 0;
}
