export function TrustedBySection() {
  return (
    <section className="border-y border-surface-200 bg-white py-6 sm:py-8" aria-label="Hiring partners">
      <div className="container-xl">
        <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-6">
          <p className="text-sm font-semibold text-surface-700">Career connections through</p>
          <div className="home-partner-pill flex items-center gap-3 rounded-full px-5 py-2.5">
            <span className="home-partner-mark flex h-8 w-8 items-center justify-center rounded-full shadow-sm" aria-hidden="true">
              <span className="text-sm font-bold">50+</span>
            </span>
            <span className="font-display text-lg font-bold text-surface-900">Hiring Partners</span>
          </div>
        </div>
      </div>
    </section>
  );
}
