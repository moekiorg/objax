import { useState } from 'react';
import { useObjaxStore } from '../stores/objaxStore';
import { parseObjaxWithClasses } from '../engine/objaxEngine';
import { presetUIClasses } from '../engine/presetClasses';
import { ObjectPreview } from './ObjectPreview';
import { ClassBrowser } from './ClassBrowser';

interface PageEditorProps {
  pageName: string;
}

export function PageEditor({ pageName }: PageEditorProps) {
  const { setCurrentPage, addInstance, addClass, classes } = useObjaxStore();
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleRunCode = () => {
    try {
      // Combine user-defined classes with preset UI classes
      const allClasses = [...presetUIClasses, ...classes];
      const result = parseObjaxWithClasses(code, allClasses);
      
      // Add only new classes to store (skip preset UI classes)
      const newClasses = result.classes.slice(presetUIClasses.length + classes.length);
      newClasses.forEach(cls => {
        // Convert ObjaxClassDefinition to ObjaxClass format
        const objaxClass = {
          name: cls.name,
          code: '', // Not used in new format
          fields: cls.fields.map(field => ({
            name: field.name,
            default: field.defaultValue
          })),
          methods: cls.methods.map(method => {
            const methodCode = method.body || '';
            return {
              name: method.name,
              code: methodCode
            };
          })
        };
        
        addClass(objaxClass);
      });
      
      // Add parsed instances to store (assign to current page)
      result.instances.forEach(instance => {
        addInstance({
          id: `${pageName}-${instance.name}-${Date.now()}`,
          name: instance.name,
          className: instance.className,
          type: instance.className as any,
          page: pageName,
          order: Date.now(),
          // Include all properties from the parsed instance
          ...instance.properties
        });
      });

      // Handle page navigation
      if (result.pageNavigations.length > 0) {
        const navigation = result.pageNavigations[0]; // Use first navigation for now
        setCurrentPage(navigation.pageName);
        return; // Early return to avoid showing output
      }

      setOutput(`Executed successfully!\nClasses: ${result.classes.length}\nInstances: ${result.instances.length}\nMethod Calls: ${result.methodCalls.length}\nPage Navigations: ${result.pageNavigations.length}`);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setOutput('');
    }
  };

  return (
    <div className="page-editor">
      <div className="page-editor-container">
        {/* Header */}
        <div className="page-editor-header">
          <h1 className="page-editor-title">Page: {pageName}</h1>
          <button
            type="button"
            onClick={() => setCurrentPage(null)}
            className="page-editor-back-button"
          >
            Back to Pages
          </button>
        </div>

        {/* Code Editor and Preview */}
        <div className="page-editor-grid">
          <div className="page-editor-panel">
            <h2 className="page-editor-panel-title">Objax Code</h2>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter Objax code here...&#10;&#10;Example:&#10;define Task&#10;Task has field &quot;title&quot;&#10;Task has field &quot;done&quot; has default false&#10;Task has method &quot;complete&quot; do set field &quot;done&quot; of myself to true&#10;myTask is a new Task"
              className="page-editor-textarea"
            />
            <button
              type="button"
              onClick={handleRunCode}
              className="page-editor-button"
            >
              Run Code
            </button>
          </div>

          {/* Output */}
          <div className="page-editor-panel">
            <h2 className="page-editor-panel-title">Output</h2>
            {error && (
              <div className="output-error">
                <p className="output-error-text">{error}</p>
              </div>
            )}
            {output && (
              <div className="output-success">
                <pre className="output-success-text">{output}</pre>
              </div>
            )}
          </div>

          {/* Object Preview */}
          <ObjectPreview pageName={pageName} />
          
          {/* Class Browser */}
          <ClassBrowser classes={classes} />
        </div>
      </div>
    </div>
  );
}