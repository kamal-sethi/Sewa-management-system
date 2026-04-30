export default function NominalRollPage() {
  return (
    <div className="card p-10 text-center">
      <p className="mb-3 text-4xl">📄</p>
      <h1
        className="mb-2 text-2xl font-bold text-stone-800"
        style={{ fontFamily: "'Baloo 2', cursive" }}
      >
        Nominal Rolls
      </h1>
      <p className="mx-auto max-w-lg text-sm text-stone-500">
        Nominal rolls will be listed here on their own page. We can wire the
        fetch and actions next.
      </p>
    </div>
  );
}
