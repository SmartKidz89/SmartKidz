export function getNextLesson(currentId) {
  return Number(currentId) + 1;
}

export function consumeEnergy(current = 8) {
  return Math.max(current - 1, 0);
}
