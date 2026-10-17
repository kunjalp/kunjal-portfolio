"use client";

import { useSyncExternalStore } from "react";

export type DockItem = { id: string; title: string; restore: () => void };

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

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const empty: DockItem[] = [];

export function useDock() {
  return useSyncExternalStore(subscribe, () => items, () => empty);
}
