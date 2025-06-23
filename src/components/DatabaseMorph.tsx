import type React from "react";
import type { ObjaxInstance } from "../types";

interface DatabaseMorphProps {
  instance: ObjaxInstance;
  dataInstances: ObjaxInstance[];
  onUpdate?: (id: string, updates: Partial<ObjaxInstance>) => void;
  onInspect?: (instance: ObjaxInstance) => void;
}

export const DatabaseMorph: React.FC<DatabaseMorphProps> = ({
  instance,
  dataInstances,
  onUpdate,
  onInspect: _onInspect,
}) => {
  // Only search for data source in the same page as this DatabaseMorph
  const dataSource: ObjaxInstance | undefined = dataInstances.find(
    (inst) => inst.name === instance.dataSource && inst.page === instance.page
  );
  const viewMode = instance.viewMode || "table";

  // Extract data from the connected instance
  const getData = () => {
    if (!dataSource) {
      return [];
    }

    // Handle TaskList and other custom classes that have an "items" field
    if (dataSource?.items && Array.isArray(dataSource.items)) {
      return dataSource.items.map((item: any, index: number) => {
        // Handle different item formats
        if (typeof item === "string") {
          return { id: index, value: item, title: item };
        } else if (item && typeof item === "object") {
          // Handle Task-like objects with properties
          if ((item as any).properties?.title) {
            return {
              id: index,
              value: (item as any).properties.title,
              title: (item as any).properties.title,
              className: (item as any).className,
              fullItem: item,
            };
          } else if ((item as any).title) {
            return {
              id: index,
              value: (item as any).title,
              title: (item as any).title,
              fullItem: item,
            };
          } else if ((item as any).name) {
            return {
              id: index,
              value: (item as any).name,
              title: (item as any).name,
              fullItem: item,
            };
          } else {
            // Fallback for complex objects
            return {
              id: index,
              value: JSON.stringify(item),
              title: JSON.stringify(item),
              fullItem: item,
            };
          }
        } else {
          return {
            id: index,
            value: String(item),
            title: String(item),
          };
        }
      });
    }

    // Handle ListMorph specifically
    if (dataSource?.type === "ListMorph" && dataSource.items) {
      return dataSource.items.map((item: any, index: number) => ({
        id: index,
        value: item,
      }));
    }

    // For other types, return the instance itself as data
    if (dataSource?.value !== undefined) {
      return [
        {
          id: 0,
          value: dataSource?.value,
          label: dataSource?.label,
          name: dataSource?.name,
        },
      ];
    }

    return [];
  };

  const data = getData();
  // Use fields or columns property to determine what to display
  // No default columns - only show explicitly configured fields
  const displayFields = instance.fields || instance.columns || [];
  const columns = displayFields;

  const renderTableView = () => {
    if (columns.length === 0) {
      return null;
    }

    return (
      <div className="border rounded-lg overflow-hidden bg-white">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, rowIndex: number) => (
              <tr key={row.id || rowIndex} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-4 py-2 text-sm text-gray-900 border-b"
                  >
                    {row[column as keyof typeof row] || ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="p-4 text-center text-gray-500 text-sm">
            表示するデータがありません
          </div>
        )}
      </div>
    );
  };

  const renderGridView = () => {
    if (columns.length === 0) {
      return null;
    }

    return (
      <div className="grid grid-cols-2 gap-2 p-2 bg-white border rounded-lg">
        {data.map((item: any, index: number) => (
          <div
            key={item.id || index}
            className="p-3 border rounded bg-gray-50 hover:bg-gray-100"
          >
            {columns.map((column) => (
              <div key={column} className="text-sm">
                <span className="font-medium text-gray-700">{column}:</span>{" "}
                <span className="text-gray-900">
                  {item[column as keyof typeof item] || ""}
                </span>
              </div>
            ))}
          </div>
        ))}
        {data.length === 0 && (
          <div className="col-span-2 p-4 text-center text-gray-500 text-sm">
            表示するデータがありません
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="hover:outline hover:outline-2 hover:outline-blue-400 cursor-pointer"
      style={{
        width: instance.width || "300px",
        minHeight: "150px",
      }}
    >
      <div className="mb-2">
        <div className="flex gap-1 mt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate?.(instance.id, { viewMode: "table" });
            }}
            className={`text-xs px-2 py-1 rounded ${
              viewMode === "table"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            テーブル
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate?.(instance.id, { viewMode: "grid" });
            }}
            className={`text-xs px-2 py-1 rounded ${
              viewMode === "grid"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            グリッド
          </button>
        </div>
      </div>

      {viewMode === "table" ? renderTableView() : renderGridView()}
    </div>
  );
};
