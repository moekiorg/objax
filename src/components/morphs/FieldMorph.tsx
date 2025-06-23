interface FieldMorphProps {
  label: string;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  type: "text" | "number" | "boolean" | "date";
  editable?: boolean;
}

export function FieldMorph({ label, value, onChange, type, editable = true }: FieldMorphProps) {
  const safeLabel = label || "field";
  const fieldId = `field-${safeLabel.toLowerCase().replace(/\s+/g, "-")}`;

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
      {editable ? (
        // 編集可能な場合：inputのみ表示
        type === "boolean" ? (
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
        )
      ) : (
        // 編集不可の場合：テキストのみ表示
        <div className="field-morph-display">
          {type === "boolean" ? (value ? "true" : "false") : String(value)}
        </div>
      )}
    </div>
  );
}
