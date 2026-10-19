// Kept apart from motion.ts so the server layout can import it (motion.ts uses React hooks).

export const MOTION_KEY = "motion-paused";

/** Inline <head> snippet: restores a saved pause before first paint, so nothing moves for a frame. */
export const MOTION_JS = `try{if(localStorage.getItem('${MOTION_KEY}')==='1')document.documentElement.dataset.motion='paused'}catch(e){}`;
