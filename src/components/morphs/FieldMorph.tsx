interface FieldMorphProps {
  label: string;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  type: "text" | "number" | "boolean" | "date";
}

export function FieldMorph({ label, value, onChange, type }: FieldMorphProps) {
  const fieldId = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "number") {
      onChange(parseFloat(e.target.value) || 0);
    } else if (type === "boolean") {
      onChange(e.target.checked);
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <div className="field-morph-container">
      {type === "boolean" ? (
        <input
          id={fieldId}
          type="checkbox"
          checked={value as boolean}
          onChange={handleChange}
        />
      ) : (
        <input
          id={fieldId}
          type={type}
          value={value as string | number}
          onChange={handleChange}
          className="field-morph-input"
        />
      )}
    </div>
  );
}
