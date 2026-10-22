"use client";

import { SECTIONS, dockItems, type Section } from "./windowDock";

/**
 * Where the desk stacks (minimized windows) sit. On wide screens each stack floats
 * on its own along the right edge, like desktop icons, and can be dragged anywhere.
 * Under 1024px they live in a strip at the bottom instead.
 */

export const DESK_MIN = 1024;
export const NAV_H = 48;
export const STACK_W = 96;
export const STACK_H = 112;
const EDGE = 20;
const GAP = 16;
const KEY = "desk-stacks";

export type Pos = { x: number; y: number };

let saved: Partial<Record<Section, Pos>> | null = null;

function load() {
  if (saved) return saved;
  saved = {};
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) saved = JSON.parse(raw) ?? {};
  } catch {
    /* storage blocked or bad data: start from the default column */
  }
  return saved!;
}

export const isDesk = () => window.innerWidth >= DESK_MIN;

export function clampPos(p: Pos): Pos {
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  return {
    x: Math.round(Math.min(Math.max(p.x, 8), Math.max(8, vw - STACK_W - 8))),
    y: Math.round(Math.min(Math.max(p.y, NAV_H + 8), Math.max(NAV_H + 8, vh - STACK_H - 8))),
  };
}

export const savedPos = (s: Section) => load()[s];

export function savePos(s: Section, p: Pos) {
  const all = load();
  all[s] = p;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* remembered in memory for this page load only */
  }
}

/** Sections that currently have a stack, in page order. */
export function activeSections(extra?: Section) {
  const have = new Set(dockItems().map((i) => i.section));
  if (extra) have.add(extra);
  return SECTIONS.map((s) => s.id).filter((id) => have.has(id));
}

/** Default spot for a stack: next free place in the column along the right edge. */
export function slotPos(section: Section, active: Section[]): Pos {
  const free = active.filter((s) => s === section || !savedPos(s));
  const i = Math.max(0, free.indexOf(section));
  const vw = document.documentElement.clientWidth;
  const top = NAV_H + EDGE;
  const perCol = Math.max(1, Math.floor((window.innerHeight - top - 8 + GAP) / (STACK_H + GAP)));
  const col = Math.floor(i / perCol);
  const row = i % perCol;
  return { x: vw - EDGE - STACK_W - col * (STACK_W + GAP), y: top + row * (STACK_H + GAP) };
}

export function stackPos(section: Section, active: Section[]): Pos {
  const p = savedPos(section);
  return p ? clampPos(p) : slotPos(section, active);
}

/** Screen rect a window should shrink into (or grow back from) for this section. */
export function stackAnchor(section: Section): DOMRect {
  const el = document.querySelector<HTMLElement>(`[data-stack="${section}"] .dstk-pile`);
  if (el) return el.getBoundingClientRect();
  if (!isDesk()) {
    const vw = document.documentElement.clientWidth;
    return new DOMRect(vw / 2 - 24, window.innerHeight - 52, 48, 40);
  }
  const p = stackPos(section, activeSections(section));
  return new DOMRect(p.x + 16, p.y + 8, 64, 56);
}
