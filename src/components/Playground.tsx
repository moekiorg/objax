import { useState } from 'react';
import { parseObjaxWithClasses } from '../engine/objaxEngine';
import { useObjaxStore } from '../stores/objaxStore';
import { presetUIClasses } from '../engine/presetClasses';

export function Playground() {
  const { togglePlayground, classes, addInstance } = useObjaxStore();
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleRunCode = () => {
    try {
      // Combine user-defined classes with preset UI classes
      const allClasses = [...presetUIClasses, ...classes];
      const result = parseObjaxWithClasses(code, allClasses);
      
      let output = `Executed successfully!\n`;
      output += `Available Classes: ${classes.length}\n`;
      output += `New Classes: ${result.classes.length - classes.length}\n`;
      output += `Instances: ${result.instances.length}\n`;
      output += `Method Calls: ${result.methodCalls.length}\n`;
      output += `List Operations: ${result.listOperations.length}\n`;
      output += `Page Navigations: ${result.pageNavigations.length}`;
      
      setOutput(output);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setOutput('');
    }
  };

  return (
    <div className="playground">
      <div className="playground-container">
        <div className="playground-header">
          <h1 className="playground-title">Objax Playground</h1>
          <button
            type="button"
            onClick={togglePlayground}
            className="btn-secondary"
          >
            Back to Pages
          </button>
        </div>
        
        <div className="playground-grid">
          <div className="playground-editor">
            <h2>Code Editor</h2>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter Objax code here...

Example:
define Task
Task has field &quot;title&quot;
Task has field &quot;done&quot; has default false
Task has method &quot;complete&quot; do set field &quot;done&quot; of myself to true
myTask is a new Task
call &quot;complete&quot; on myTask"
              className="playground-textarea"
            />
            <button
              type="button"
              onClick={handleRunCode}
              className="playground-button"
            >
              Run
            </button>
          </div>

          <div className="playground-output">
            <h2>Output</h2>
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
    </div>
  );
}