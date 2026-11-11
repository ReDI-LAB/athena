export default function SearchPreview() {
  return (
    <main className="min-h-screen bg-brand-light px-4 py-12 text-brand-navy">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-3 text-center text-3xl font-bold">
          Athena – Search Preview
        </h1>

        <p className="mb-8 text-center text-brand-blue">
          Proposed search experience
        </p>

        <div className="space-y-5 rounded-xl bg-white p-6 shadow-md">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-widest">
              What needs fixing?
            </label>
            <input
              type="text"
              placeholder="e.g. My jeans zipper is broken"
              className="w-full rounded-lg bg-brand-light px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-widest">
              Where? (Optional)
            </label>
            <input
              type="text"
              placeholder="Enter district or postal code"
              className="w-full rounded-lg bg-brand-light px-4 py-3"
            />
          </div>

          <div className="space-y-3 border-t border-gray-200 pt-5">
            <h2 className="font-semibold">Detected repair details</h2>

            <div className="flex flex-wrap gap-2">
              {[
                { label: "Category", value: "Textiles" },
                { label: "Product", value: "Jeans" },
                { label: "Repair", value: "Zipper" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg bg-brand-light px-4 py-3"
                >
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm font-semibold text-brand-navy">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-sm text-brand-blue">✎ Edit details</p>
          </div>

          <button
            type="button"
            className="w-full rounded-lg bg-brand-orange px-4 py-3 font-semibold"
          >
            Find a repair option
          </button>
        </div>
      </div>
    </main>
  );
}
