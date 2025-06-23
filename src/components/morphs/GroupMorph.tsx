import type { ReactNode, CSSProperties } from "react";
import { useState } from "react";

interface GroupMorphProps {
  label: string;
  children: ReactNode;
  // Layout properties
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  gap?: string;
  padding?: string;
  // Drop functionality
  onDrop?: (data: string | any) => void;
  acceptDrops?: boolean;
}

export function GroupMorph({
  label,
  children,
  flexDirection = "column",
  alignItems = "stretch",
  justifyContent = "flex-start",
  gap = "8px",
  padding = "12px",
  onDrop,
  acceptDrops = false,
}: GroupMorphProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const contentStyle: CSSProperties = {
    display: "flex",
    flexDirection,
    alignItems,
    justifyContent,
    gap,
    padding,
    backgroundColor: "#f5f5f5", // 灰色の背景
    borderRadius: "4px",
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (acceptDrops || onDrop) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (onDrop) {
      try {
        const data = JSON.parse(e.dataTransfer.getData("application/json"));
        if (data.type === "new-ui-instance") {
          // Handle dropping new UI instances into GroupMorph
          onDrop(data);
        }
      } catch (err) {
        console.error("Invalid drop data:", err);
      }
    }
  };

  return (
    <div className="group-morph-container">
      <div
        className={`group-morph-content ${isDragOver ? "drag-over" : ""}`}
        data-testid={
          acceptDrops || onDrop
            ? "group-morph-drop-zone"
            : "group-morph-content"
        }
        style={contentStyle}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {children}
      </div>
    </div>
  );
}
