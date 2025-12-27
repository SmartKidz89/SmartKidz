"use client";

export default function WaitlistForm() {
  function handleSubmit(e) {
    // If you haven't configured a waitlist endpoint, prevent submission
    // and instead open an email draft. Replace with your preferred service later.
    e.preventDefault();
    const email = (e.currentTarget.elements.namedItem("email")?.value || "").toString();
    const subject = encodeURIComponent("SmartKidz waitlist");
    const body = encodeURIComponent(`Please add me to the SmartKidz waitlist.\n\nEmail: ${email}\n`);
    window.location.href = `mailto:smartkidzapp1@gmail.com?subject=${subject}&body=${body}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row"
      action="https://formsubmit.co/"
      method="post"
    >
      <input
        name="email"
        type="email"
        required
        placeholder="you@example.com"
        className="w-full flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-slate-400"
      />
      <button
        type="submit"
        className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
      >
        Join waitlist
      </button>
    </form>
  );
}
