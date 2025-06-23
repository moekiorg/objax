interface ListMorphProps {
  label: string;
  items: string[];
  onItemClick?: (item: string, index: number) => void;
}

export function ListMorph({ label: _label, items, onItemClick }: ListMorphProps) {
  return (
    <div className="list-morph-container">
      <ul className="list-morph-list">
        {items.length === 0 ? (
          <li className="list-morph-empty">No items</li>
        ) : (
          items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              onClick={() => onItemClick?.(item, index)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && onItemClick) {
                  onItemClick(item, index);
                }
              }}
              role={onItemClick ? "button" : undefined}
              tabIndex={onItemClick ? 0 : undefined}
              className={`list-morph-item ${onItemClick ? "clickable" : ""}`}
            >
              {item}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
