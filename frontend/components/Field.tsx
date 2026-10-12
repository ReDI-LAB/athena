
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
        className="block mb-1 font-medium"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full border rounded px-3 py-2"
        required={required}
      />
    </div>
  );
}
