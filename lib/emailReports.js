import { calculateAnalytics } from "./analytics";

export function buildWeeklyReportEmail({ childName, attempts = [] }) {
  const stats = calculateAnalytics(attempts);

  const subject = `SmartKidz Weekly Report — ${childName}`;

  const html = `
  <div style="font-family:Arial;padding:24px">
    <h2>Weekly Report for ${childName}</h2>
    <p>Lessons completed: <b>${stats.completed}</b></p>
    <p>Accuracy: <b>${stats.accuracy}%</b></p>
    <p>Keep up the great work!</p>
  </div>
  `;

  return { subject, html };
}
