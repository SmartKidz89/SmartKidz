export default function Section({ children, className = "" }) {
  return (
    <section className={`py-16 ${className}`}>
      <div className="container-pad">{children}</div>
    </section>
  );
}
