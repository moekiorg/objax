import { useState, useEffect } from "react";
import type { ObjaxInstance } from "../types";
import { useObjaxStore } from "../stores/objaxStore";

interface InspectorProps {
  instance: ObjaxInstance;
  onClose: () => void;
  onUpdate?: (instanceId: string, updates: Partial<ObjaxInstance>) => void;
  onDelete?: (instanceId: string) => void;
}

export function Inspector({
  instance,
  onClose,
  onUpdate,
  onDelete,
}: InspectorProps) {
  const { instances } = useObjaxStore();
  const [nameValue, setNameValue] = useState(instance.name);
  const [nameError, setNameError] = useState(false);

  // Update local state when instance changes
  useEffect(() => {
    setNameValue(instance.name);
    setNameError(false);
  }, [instance.name]);

  const handleNameChange = (newName: string) => {
    // Always update the local state
    setNameValue(newName);

    // Check for name uniqueness within the same page
    const existingInstance = instances.find(
      (inst) =>
        inst.name === newName &&
        inst.page === instance.page &&
        inst.id !== instance.id
    );

    // If name already exists, show error but don't update
    if (existingInstance) {
      setNameError(true);
      return;
    }

    // Clear error and update
    setNameError(false);
    onUpdate?.(instance.id, { name: newName });
  };
  return (
    <div className="inspector-content">
      <div className="inspector-header">
        <div className="inspector-header-buttons">
          {onDelete && (
            <button
              onClick={() => {
                if (confirm(`「${instance.name}」を削除しますか？`)) {
                  onDelete(instance.id);
                  onClose();
                }
              }}
              className="inspector-delete"
              title="インスタンスを削除"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <div className="inspector-field">
        <label className="inspector-label">名前</label>
        <input
          type="text"
          value={nameValue}
          onChange={(e) => handleNameChange(e.target.value)}
          className={`inspector-input ${nameError ? 'inspector-input-error' : ''}`}
        />
        {nameError && (
          <div className="inspector-error-message">
            この名前は既に使用されています
          </div>
        )}
      </div>

      <div className="inspector-field">
        <label className="inspector-label">クラス</label>
        <div className="inspector-value">{instance.className}</div>
      </div>

      <div className="inspector-field">
        <label className="inspector-label">ページ</label>
        <div className="inspector-value">{instance.page}</div>
      </div>

      {/* Debug section - will be removed later */}
      <div className="inspector-field" style={{ backgroundColor: '#fffbf0', border: '1px solid #f0ad4e', padding: '8px', margin: '8px 0' }}>
        <label className="inspector-label" style={{ fontWeight: 'bold', color: '#8a6d3b' }}>🐛 Debug Info</label>
        <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          <div>Has properties: {instance.properties ? 'YES' : 'NO'}</div>
          <div>Properties keys: [{instance.properties ? Object.keys(instance.properties).join(', ') : 'none'}]</div>
          <div>Properties: {JSON.stringify(instance.properties || {}, null, 2)}</div>
        </div>
      </div>

      {/* Editable Properties */}
      <div className="inspector-properties">
        <h3 className="inspector-properties-title">プロパティ</h3>

        {/* Common properties for UI morphs */}
        {(instance.className === "ButtonMorph" ||
          instance.className === "FieldMorph" ||
          instance.className === "ListMorph" ||
          instance.className === "GroupMorph" ||
          instance.className === "DatabaseMorph" ||
          instance.className === "DataMorph") && (
          <div className="inspector-properties-content">
            <div className="inspector-field">
              <label className="inspector-label">ラベル</label>
              <input
                type="text"
                value={instance.label || ""}
                onChange={(e) =>
                  onUpdate?.(instance.id, { label: e.target.value })
                }
                className="inspector-input"
              />
            </div>

            {((instance as any).className === "ButtonMorph" || (instance as any).className === "BoxMorph") && (
              <div className="inspector-field">
                <label className="inspector-label">OnClick (Objaxコード)</label>
                <textarea
                  value={String(instance.onClick || "")}
                  onChange={(e) =>
                    onUpdate?.(instance.id, { onClick: e.target.value })
                  }
                  className="inspector-textarea"
                  placeholder='例: myTasks add with item "New Task"'
                  rows={3}
                />
              </div>
            )}

            {instance.className === "FieldMorph" && (
              <>
                <div className="inspector-field">
                  <label className="inspector-label">編集可能</label>
                  <input
                    type="checkbox"
                    checked={instance.editable !== false} // Default to true
                    onChange={(e) =>
                      onUpdate?.(instance.id, { editable: e.target.checked })
                    }
                    className="inspector-checkbox"
                  />
                </div>
              </>
            )}


            {instance.className === "DatabaseMorph" && (
              <>
                <div className="inspector-field">
                  <label className="inspector-label">表示モード</label>
                  <select
                    value={instance.viewMode || "table"}
                    onChange={(e) =>
                      onUpdate?.(instance.id, {
                        viewMode: e.target.value as "table" | "grid",
                      })
                    }
                    className="inspector-input"
                  >
                    <option value="table">テーブル</option>
                    <option value="grid">グリッド</option>
                  </select>
                </div>

                <div className="inspector-field">
                  <label className="inspector-label">データソース</label>
                  <input
                    type="text"
                    value={instance.dataSource || ""}
                    onChange={(e) =>
                      onUpdate?.(instance.id, { dataSource: e.target.value })
                    }
                    className="inspector-input"
                    placeholder="インスタンス名 (例: myTasks)"
                  />
                </div>

                <div className="inspector-field">
                  <label className="inspector-label">
                    フィールド (カンマ区切り)
                  </label>
                  <textarea
                    value={Array.isArray(instance.columns) 
                      ? instance.columns.join(", ") 
                      : String(instance.columns || "")}
                    onChange={(e) =>
                      onUpdate?.(instance.id, {
                        columns: e.target.value
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean),
                      })
                    }
                    className="inspector-textarea"
                    placeholder="例: title, completed, priority"
                    rows={3}
                  />
                </div>
              </>
            )}

            {instance.className === "GroupMorph" && (
              <>
                <div className="inspector-field">
                  <label className="inspector-label">Flex方向</label>
                  <select
                    value={instance.flexDirection || "column"}
                    onChange={(e) =>
                      onUpdate?.(instance.id, {
                        flexDirection: e.target.value as any,
                      })
                    }
                    className="inspector-input"
                  >
                    <option value="column">縦</option>
                    <option value="row">横</option>
                    <option value="column-reverse">縦逆向</option>
                    <option value="row-reverse">横逆向</option>
                  </select>
                </div>

                <div className="inspector-field">
                  <label className="inspector-label">アイテムの整列</label>
                  <select
                    value={instance.alignItems || "stretch"}
                    onChange={(e) =>
                      onUpdate?.(instance.id, {
                        alignItems: e.target.value as any,
                      })
                    }
                    className="inspector-input"
                  >
                    <option value="flex-start">開始</option>
                    <option value="flex-end">終了</option>
                    <option value="center">中央</option>
                    <option value="stretch">伸長</option>
                    <option value="baseline">ベースライン</option>
                  </select>
                </div>

                <div className="inspector-field">
                  <label className="inspector-label">コンテンツの配置</label>
                  <select
                    value={instance.justifyContent || "flex-start"}
                    onChange={(e) =>
                      onUpdate?.(instance.id, {
                        justifyContent: e.target.value as any,
                      })
                    }
                    className="inspector-input"
                  >
                    <option value="flex-start">開始</option>
                    <option value="flex-end">終了</option>
                    <option value="center">中央</option>
                    <option value="space-between">間を空ける</option>
                    <option value="space-around">周囲に間を空ける</option>
                    <option value="space-evenly">等間隔で配置</option>
                  </select>
                </div>

                <div className="inspector-field">
                  <label className="inspector-label">間隔</label>
                  <input
                    type="text"
                    value={instance.gap || "8px"}
                    onChange={(e) =>
                      onUpdate?.(instance.id, { gap: e.target.value })
                    }
                    className="inspector-input"
                    placeholder="e.g., 8px, 1rem"
                  />
                </div>

                <div className="inspector-field">
                  <label className="inspector-label">パディング</label>
                  <input
                    type="text"
                    value={instance.padding || "12px"}
                    onChange={(e) =>
                      onUpdate?.(instance.id, { padding: e.target.value })
                    }
                    className="inspector-input"
                    placeholder="e.g., 12px, 1rem"
                  />
                </div>
              </>
            )}

            {instance.className === "DataMorph" && (
              <>
                <div className="inspector-field">
                  <label className="inspector-label">データソース</label>
                  <input
                    type="text"
                    value={instance.dataSource || ""}
                    onChange={(e) =>
                      onUpdate?.(instance.id, { dataSource: e.target.value })
                    }
                    className="inspector-input"
                    placeholder="インスタンス名 (例: userData)"
                  />
                  <div className="inspector-field-help">
                    参照するインスタンスの名前を入力してください
                  </div>
                </div>

                <div className="inspector-field">
                  <label className="inspector-label">
                    表示フィールド (カンマ区切り)
                  </label>
                  <textarea
                    value={Array.isArray(instance.displayFields) 
                      ? instance.displayFields.join(", ") 
                      : String(instance.displayFields || "")}
                    onChange={(e) =>
                      onUpdate?.(instance.id, {
                        displayFields: e.target.value
                          .split(",")
                          .map((field) => field.trim())
                          .filter(Boolean),
                      })
                    }
                    className="inspector-textarea"
                    placeholder="例: name, age, active (空の場合は全フィールド表示)"
                    rows={2}
                  />
                  <div className="inspector-field-help">
                    空の場合はレコードの全フィールドが表示されます
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Instance Fields Section */}
        <div className="inspector-fields">
          <h3 className="inspector-properties-title">インスタンスフィールド</h3>
          <div className="inspector-properties-content">
            {/* Built-in fields */}
            {instance.value !== undefined && (
              <div className="inspector-field">
                <label className="inspector-label">値 (value)</label>
                <input
                  type="text"
                  value={String(instance.value ?? "")}
                  onChange={(e) => {
                    let newValue: any = e.target.value;
                    // Try to parse as number or boolean
                    if (!isNaN(Number(newValue)) && newValue !== "") {
                      newValue = Number(newValue);
                    } else if (newValue === "true") {
                      newValue = true;
                    } else if (newValue === "false") {
                      newValue = false;
                    }
                    onUpdate?.(instance.id, { value: newValue });
                  }}
                  className="inspector-input"
                />
              </div>
            )}

            {instance.items !== undefined && (
              <div className="inspector-field">
                <label className="inspector-label">アイテム (items)</label>
                <textarea
                  value={Array.isArray(instance.items) 
                    ? instance.items.join(", ") 
                    : String(instance.items || "")}
                  onChange={(e) =>
                    onUpdate?.(instance.id, {
                      items: e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                  className="inspector-textarea"
                  rows={3}
                />
              </div>
            )}

            {/* Custom properties */}
            {instance.properties && Object.keys(instance.properties).length > 0 && (
              <>
                <h4 className="inspector-properties-subtitle">カスタムプロパティ</h4>
                {Object.entries(instance.properties).map(([key, value]) => (
                  <div key={key} className="inspector-field">
                    <label className="inspector-label">{key}</label>
                    <input
                      type="text"
                      value={String(value ?? "")}
                      onChange={(e) => {
                        let newValue: any = e.target.value;
                        // Try to parse as number or boolean
                        if (!isNaN(Number(newValue)) && newValue !== "") {
                          newValue = Number(newValue);
                        } else if (newValue === "true") {
                          newValue = true;
                        } else if (newValue === "false") {
                          newValue = false;
                        }
                        
                        const updatedProperties = {
                          ...instance.properties,
                          [key]: newValue
                        };
                        onUpdate?.(instance.id, { properties: updatedProperties });
                      }}
                      className="inspector-input"
                    />
                  </div>
                ))}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
