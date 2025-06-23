import type React from "react";

interface UIClassItem {
  name: string;
  icon: string;
  defaultProps: Record<string, any>;
}

const UI_CLASSES: UIClassItem[] = [
  {
    name: "ButtonMorph",
    icon: "🔘",
    defaultProps: {
      label: "新しいボタン",
    },
  },
  {
    name: "FieldMorph",
    icon: "📝",
    defaultProps: {
      label: "新しいフィールド",
      value: "",
      type: "text",
    },
  },
  {
    name: "ListMorph",
    icon: "📋",
    defaultProps: {
      label: "新しいリスト",
      items: ["アイテム1", "アイテム2"],
    },
  },
  {
    name: "GroupMorph",
    icon: "📦",
    defaultProps: {
      label: "新しいグループ",
      flexDirection: "column",
      alignItems: "stretch",
      justifyContent: "flex-start",
      gap: "8px",
      padding: "12px",
      children: [],
    },
  },
  {
    name: "DatabaseMorph",
    icon: "🗄",
    defaultProps: {
      label: "新しいデータベース",
      viewMode: "table",
      columns: ["value"],
      dataSource: "",
      width: "400px",
    },
  },
  {
    name: "BoxMorph",
    icon: "📦",
    defaultProps: {
      label: "新しいボックス",
      width: 100,
      height: 50,
      backgroundColor: "#ffffff",
      borderColor: "#cccccc",
      borderWidth: "1px",
      borderRadius: "4px",
      padding: "12px",
      margin: "0px",
      textColor: "#000000",
      fontSize: "14px",
      fontWeight: "normal",
      textAlign: "left",
      display: "block",
      position: "static",
      opacity: "1",
      boxShadow: "none",
    },
  },
];

export function NewUIInstance() {
  const handleDragStart = (e: React.DragEvent, uiClass: UIClassItem) => {
    // Store the UI class data in drag event
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "new-ui-instance",
        className: uiClass.name,
        defaultProps: uiClass.defaultProps,
      })
    );

    // Visual feedback
    const dragPreview = document.createElement("div");
    dragPreview.textContent = `${uiClass.icon} ${uiClass.name}`;
    dragPreview.style.position = "absolute";
    dragPreview.style.left = "-1000px";
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, 0, 0);
    setTimeout(() => document.body.removeChild(dragPreview), 0);
  };

  return (
    <div className="new-ui-instance">
      <div className="new-ui-instance-list">
        {UI_CLASSES.map((uiClass) => (
          <div
            key={uiClass.name}
            className="new-ui-instance-item"
            draggable
            onDragStart={(e) => handleDragStart(e, uiClass)}
            data-testid={`ui-morph-${uiClass.name}`}
          >
              <div className="new-ui-instance-item-name">{uiClass.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
