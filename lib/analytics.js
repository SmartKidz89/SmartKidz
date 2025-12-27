export function calculateAnalytics(attempts = []) {
  const completed = attempts.length;
  const accuracy =
    attempts.length === 0
      ? 0
      : Math.round(
          (attempts.filter(a => a.correct).length / attempts.length) * 100
        );

  return {
    completed,
    total: completed,
    accuracy,
  };
}
