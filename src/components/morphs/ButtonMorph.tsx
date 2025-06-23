interface ButtonMorphProps {
  label: string;
  onClick?: () => void;
}

export function ButtonMorph({ label, onClick }: ButtonMorphProps) {
  return (
    <button 
      type="button"
      onClick={onClick}
      className="button-morph"
    >
      {label}
    </button>
  );
}