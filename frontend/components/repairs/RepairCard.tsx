type RepairCardProps = {
  name: string;
  productTypes?: string[];
};

export function RepairCard({ name, productTypes = [] }: RepairCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-slate-900">{name}</h3>

      {productTypes.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {productTypes.map((productType) => (
            <li
              key={productType}
              className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
            >
              {productType}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
