/**
 * SmartKidz Signature Motion System
 * Keep motion consistent across the app (premium feel).
 */
export const easeOutExpo = [0.16, 1, 0.3, 1];
export const easeInOut = [0.4, 0, 0.2, 1];

export const transitions = {
  page: { type: "tween", duration: 0.45, ease: easeOutExpo },
  card: { type: "tween", duration: 0.28, ease: easeOutExpo },
  micro: { type: "tween", duration: 0.16, ease: easeOutExpo },
};

export const variants = {
  pageIn: {
    initial: { opacity: 0, y: 10, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: transitions.page },
    exit: { opacity: 0, y: -6, filter: "blur(6px)", transition: { ...transitions.page, duration: 0.32 } },
  },
  cardIn: {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: transitions.card },
  },
  tap: {
    whileTap: { scale: 0.98 },
    whileHover: { y: -2 },
  },
};
