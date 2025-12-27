/**
 * SmartKidz Signature Motion System
 * Keep motion consistent across the app (premium feel).
 */
export const easeOutExpo = [0.16, 1, 0.3, 1];
export const easeInOut = [0.4, 0, 0.2, 1];

// Heavier, smoother spring for page transitions
export const transitions = {
  page: { type: "spring", stiffness: 280, damping: 28, mass: 1 },
  card: { type: "spring", stiffness: 350, damping: 25 },
  micro: { type: "spring", stiffness: 500, damping: 30 },
  pop: { type: "spring", stiffness: 400, damping: 15 },
};

export const variants = {
  pageIn: {
    initial: { opacity: 0, y: 15, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1, transition: transitions.page },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } },
  },
  cardIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: transitions.card },
  },
  tap: {
    whileTap: { scale: 0.96 },
    whileHover: { y: -2 },
  },
};