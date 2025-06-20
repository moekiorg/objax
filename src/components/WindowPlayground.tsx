import { useState } from "react";
import { parseObjaxWithClasses } from "../engine/objaxEngine";
import { useObjaxStore } from "../stores/objaxStore";
import { presetUIClasses } from "../engine/presetClasses";

interface WindowPlaygroundProps {
  pageName: string;
}

export function WindowPlayground({ pageName }: WindowPlaygroundProps) {
  const { addInstance, addClass, updateInstance, classes, instances } =
    useObjaxStore();
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleRunCode = () => {
    try {
      // Get all instances for the current page (this allows referencing existing instances)
      const pageInstances = instances.filter(
        (instance) => instance.page === pageName
      );
      // Combine user-defined classes with preset UI classes
      const allClasses = [...presetUIClasses, ...classes];
      const result = parseObjaxWithClasses(code, allClasses, pageInstances);

      // Add only new classes to store (skip existing ones)
      const newClasses = result.classes.slice(classes.length);
      newClasses.forEach((cls) => {
        // Convert ObjaxClassDefinition to ObjaxClass format
        const objaxClass = {
          name: cls.name,
          code: "", // Not used in new format
          fields: cls.fields.map((field) => ({
            name: field.name,
            default: field.defaultValue,
          })),
          methods: cls.methods.map((method) => {
            const methodCode = method.body || "";
            return {
              name: method.name,
              code: methodCode,
            };
          }),
        };

        addClass(objaxClass);
      });

      // Handle instances: add new ones and update existing ones
      console.log('Result instances:', result.instances);
      console.log('Result method calls:', result.methodCalls);
      console.log('Result errors:', result.errors);

      result.instances.forEach((resultInstance) => {
        // Find existing instance by name (not by index)
        const existingInstance = pageInstances.find(
          (pi) => pi.name === resultInstance.name
        );

        if (existingInstance) {
          // Update existing instance with new properties
          const updateData = {
            ...resultInstance.properties,
            // Ensure we preserve the instance structure
            className: resultInstance.className,
            name: resultInstance.name,
          };
          console.log('Updating existing instance:', resultInstance.name, updateData);
          console.log('Existing instance before update:', existingInstance);

          updateInstance(existingInstance.id, updateData);
        } else {
          // Add new instance only if it doesn't exist
          const newInstance = {
            id: `${pageName}-${resultInstance.name}-${Date.now()}`,
            name: resultInstance.name,
            className: resultInstance.className,
            type: resultInstance.className as any, // Set type to match className for UI morphs
            page: pageName,
            order: Date.now(), // Use timestamp for initial order
            // Include all properties from the parsed instance
            ...resultInstance.properties,
          };
          console.log('Adding new instance:', newInstance);
          addInstance(newInstance);
        }
      });

      const newInstancesCount = result.instances.length - pageInstances.length;
      const updatedInstancesCount = Math.min(
        result.instances.length,
        pageInstances.length
      );

      let outputMessage = `成功! \n- 追加: ${
        newClasses.length
      }個の新しいクラス, ${Math.max(
        0,
        newInstancesCount
      )}個の新しいインスタンス\n- 更新: ${updatedInstancesCount}個の既存インスタンス\n\nアクセス可能な合計:\n- ${
        result.classes.length
      }個のクラス\n- ${result.instances.length}個のインスタンス`;

      // Add print statement outputs
      if (result.printStatements && result.printStatements.length > 0) {
        outputMessage += "\n\n出力結果:\n";
        result.printStatements.forEach((print) => {
          outputMessage += `• ${print.message}\n`;
        });
      }

      setOutput(outputMessage);
      setError("");
      setCode(""); // Clear code after successful execution
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setOutput("");
    }
  };

  const addSampleInstances = () => {
    const samples = [
      {
        id: `${pageName}-button-${Date.now()}`,
        name: "sampleButton",
        className: "ButtonMorph",
        page: pageName,
        label: "クリックして！",
        order: Date.now(),
      },
      {
        id: `${pageName}-field-${Date.now() + 1}`,
        name: "sampleField",
        className: "FieldMorph",
        page: pageName,
        label: "入力フィールド",
        value: "こんにちは世界",
        type: "text",
        order: Date.now() + 1,
      },
      {
        id: `${pageName}-group-${Date.now() + 2}`,
        name: "sampleGroup",
        className: "GroupMorph",
        page: pageName,
        label: "ドロップゾーン (他のアイテムをここにドラッグ)",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "16px",
        padding: "20px",
        children: [],
        order: Date.now() + 2,
      },
      {
        id: `${pageName}-list-${Date.now() + 3}`,
        name: "sampleList",
        className: "ListMorph",
        page: pageName,
        label: "サンプルリスト",
        items: ["アイテム1", "アイテム2", "アイテム3"],
        order: Date.now() + 3,
      },
    ];

    samples.forEach((sample) => addInstance(sample));
    setOutput(
      `ドラッグ&ドロップテスト用のGroupMorphを含む${samples.length}個のサンプルインスタンスを追加しました！`
    );
    setError("");
  };

  return (
    <div className="window-playground">
      <div className="window-playground-editor">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="window-playground-textarea"
        />
        <button
          type="button"
          onClick={handleRunCode}
          className="btn-success"
          disabled={!code.trim()}
        >
          コードを実行
        </button>

        <div className="window-playground-output">
          {error && (
            <div className="playground-error">
              <pre>{error}</pre>
            </div>
          )}
          {output && (
            <div className="playground-success">
              <pre>{output}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
