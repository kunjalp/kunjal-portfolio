"use client";

import { useSyncExternalStore } from "react";

/** Page section a window belongs to. Minimized windows are grouped into one desk stack per section. */
export type Section = "home" | "projects" | "journey" | "about" | "skills" | "contact" | "other";

export const SECTIONS: { id: Section; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "journey", label: "Journey" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
  { id: "other", label: "Desktop" },
];

export type DockItem = {
  id: string;
  title: string;
  section: Section;
  node: HTMLElement | null;
  /** `from` is where the window grows back from (a fanned card, or the stack itself). */
  restore: (from?: DOMRect | null) => void;
};

let items: DockItem[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function dockAdd(item: DockItem) {
  items = [...items.filter((i) => i.id !== item.id), item];
  emit();
}
export function dockRemove(id: string) {
  if (!items.some((i) => i.id === id)) return;
  items = items.filter((i) => i.id !== id);
  emit();
}
export const dockItems = () => items;

/** Restores a minimized window given its .win element. Returns false if it wasn't minimized. */
export function restoreNode(node: HTMLElement) {
  const it = items.find((i) => i.node === node);
  if (!it) return false;
  it.restore();
  return true;
}

/* A maximized (green button) window hides the desk stacks. */
let expanded = 0;
export function setWindowExpanded(on: boolean) {
  expanded = Math.max(0, expanded + (on ? 1 : -1));
  emit();
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const empty: DockItem[] = [];

export function useDock() {
  return useSyncExternalStore(subscribe, () => items, () => empty);
}
export function useAnyExpanded() {
  return useSyncExternalStore(subscribe, () => expanded > 0, () => false);
}
