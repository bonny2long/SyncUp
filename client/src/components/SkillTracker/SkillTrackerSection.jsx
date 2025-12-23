export default function SkillTrackerSection({ title, subtitle, children }) {
  return (
    <section className="rounded-lg border bg-white p-4">
      <div className="mb-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
