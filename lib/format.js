export function money(n) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "AUD" }).format(n);
  } catch {
    return `$${n}`;
  }
}
