// Kept apart from motion.ts so the server layout can import it (motion.ts uses React hooks).

export const MOTION_KEY = "motion-paused";

/** Inline <head> snippet: the Pause button is gone, so drop any pause an earlier visit saved. */
export const MOTION_JS = `try{localStorage.removeItem('${MOTION_KEY}')}catch(e){}`;
