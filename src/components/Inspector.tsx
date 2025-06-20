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

  const handleNameChange = (newName: string) => {
    // Check for name uniqueness within the same page
    const existingInstance = instances.find(
      (inst) =>
        inst.name === newName &&
        inst.page === instance.page &&
        inst.id !== instance.id
    );

    // If name already exists, ignore the change silently
    if (existingInstance) {
      return;
    }

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
          value={instance.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="inspector-input"
        />
      </div>

      <div className="inspector-field">
        <label className="inspector-label">クラス</label>
        <div className="inspector-value">{instance.className}</div>
      </div>

      <div className="inspector-field">
        <label className="inspector-label">ページ</label>
        <div className="inspector-value">{instance.page}</div>
      </div>

      {/* Editable Properties */}
      <div className="inspector-properties">
        <h3 className="inspector-properties-title">プロパティ</h3>

        {/* Common properties for UI morphs */}
        {(instance.className === "ButtonMorph" ||
          instance.className === "FieldMorph" ||
          instance.className === "ListMorph" ||
          instance.className === "GroupMorph" ||
          instance.className === "DatabaseMorph") && (
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

            {instance.className === "ButtonMorph" && (
              <div className="inspector-field">
                <label className="inspector-label">OnClick (Objaxコード)</label>
                <textarea
                  value={String(instance.onClick || "")}
                  onChange={(e) =>
                    onUpdate?.(instance.id, { onClick: e.target.value })
                  }
                  className="inspector-textarea"
                  placeholder='例: call "add" on myTasks with "New Task"'
                  rows={3}
                />
              </div>
            )}

            {instance.className === "FieldMorph" && (
              <div className="inspector-field">
                <label className="inspector-label">値</label>
                <input
                  type="text"
                  value={String(instance.value || "")}
                  onChange={(e) =>
                    onUpdate?.(instance.id, { value: e.target.value })
                  }
                  className="inspector-input"
                />
              </div>
            )}

            {instance.className === "ListMorph" && (
              <div className="inspector-field">
                <label className="inspector-label">
                  アイテム (カンマ区切り)
                </label>
                <textarea
                  value={(instance.items || []).join(", ")}
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
          </div>
        )}
      </div>
    </div>
  );
}
