type FieldProps = {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: string) => void;
  required?: boolean;
};

export default function Field({
  name,
  label,
  value,
  onChange,
  required = false,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block mb-2 text-xs font-medium uppercase tracking-widest text-brand-blue"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full rounded-lg border border-transparent bg-brand-light px-4 py-3 text-brand-navy outline-none transition-colors focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
        required={required}
      />
    </div>
  );
}
