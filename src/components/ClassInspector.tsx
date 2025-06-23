import React, { useState } from "react";
import type { ObjaxClass } from "../types";

interface ClassInspectorProps {
  className: string;
  classes: ObjaxClass[];
}

export function ClassInspector({ className, classes }: ClassInspectorProps) {
  const [activeTab, setActiveTab] = useState<"fields" | "methods">("fields");

  const classData = classes.find((cls) => cls.name === className);

  if (!classData) {
    return (
      <div className="class-inspector">
        <div className="class-inspector-header">
          <h3 className="class-inspector-title">クラスが見つかりません</h3>
        </div>
        <div className="class-inspector-content">
          <p>クラス "{className}" が見つかりません。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="class-inspector">
      <div className="class-inspector-tabs">
        <button
          className={`class-inspector-tab ${
            activeTab === "fields" ? "active" : ""
          }`}
          onClick={() => setActiveTab("fields")}
        >
          フィールド ({classData.fields.length})
        </button>
        <button
          className={`class-inspector-tab ${
            activeTab === "methods" ? "active" : ""
          }`}
          onClick={() => setActiveTab("methods")}
        >
          メソッド ({classData.methods.length})
        </button>
      </div>

      <div className="class-inspector-content">
        {activeTab === "fields" ? (
          <div className="class-inspector-fields">
            {classData.fields.length === 0 ? (
              <p className="class-inspector-empty">
                フィールドが定義されていません
              </p>
            ) : (
              <div className="class-inspector-field-list">
                {classData.fields.map((field) => (
                  <div key={field.name} className="class-inspector-field">
                    <div className="class-inspector-field-header">
                      <span className="class-inspector-field-name">
                        {field.name}
                      </span>
                      <span className="class-inspector-field-type">
                        {typeof field.default === "string"
                          ? "String"
                          : typeof field.default === "number"
                          ? "Number"
                          : typeof field.default === "boolean"
                          ? "Boolean"
                          : Array.isArray(field.default)
                          ? "Array"
                          : field.default === null
                          ? "null"
                          : field.default === undefined
                          ? "undefined"
                          : "Object"}
                      </span>
                    </div>
                    {field.default !== undefined && (
                      <div className="class-inspector-field-default">
                        デフォルト値: {JSON.stringify(field.default)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="class-inspector-methods">
            {classData.methods.length === 0 ? (
              <p className="class-inspector-empty">
                メソッドが定義されていません
              </p>
            ) : (
              <div className="class-inspector-method-list">
                {classData.methods.map((method) => (
                  <div key={method.name} className="class-inspector-method">
                    <div className="class-inspector-method-header">
                      <span className="class-inspector-method-name">
                        {method.name}()
                      </span>
                    </div>
                    {method.body && (
                      <div className="class-inspector-method-body">
                        <code>{method.body}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
