import { useState } from 'react';
import { useObjaxStore } from '../stores/objaxStore';
import { ButtonMorph } from './morphs/ButtonMorph';
import { FieldMorph } from './morphs/FieldMorph';
import { ListMorph } from './morphs/ListMorph';
import { GroupMorph } from './morphs/GroupMorph';
import { DatabaseMorph } from './DatabaseMorph';
import { Inspector } from './Inspector';
import { executeEventAction } from '../utils/executeEventAction';
import type { ObjaxInstance } from '../types';

interface ObjectPreviewProps {
  pageName: string;
}

export function ObjectPreview({ pageName }: ObjectPreviewProps) {
  const store = useObjaxStore();
  const { instances, classes, updateInstance } = store;
  const [inspectorInstance, setInspectorInstance] = useState<ObjaxInstance | null>(null);
  
  // Filter instances for this page
  const pageInstances = instances.filter(instance => instance.page === pageName);

  const handleObjectClick = (event: React.MouseEvent, instance: ObjaxInstance) => {
    if (event.metaKey || event.ctrlKey) {
      setInspectorInstance(instance);
    }
  };

  const handleButtonClick = (instance: ObjaxInstance) => {
    // Check for event listeners
    if (instance.eventListeners) {
      const clickListeners = instance.eventListeners.filter(
        (listener: any) => listener.eventType === 'click'
      );
      
      clickListeners.forEach((listener: any) => {
        executeEventAction(listener.action, instance.name, store);
      });
    } else {
      // Fallback to console log
      console.log(`${instance.name} clicked!`);
    }
  };

  return (
    <div className="page-editor-panel">
      <h2 className="page-editor-panel-title">Page Objects</h2>
      
      {pageInstances.length === 0 ? (
        <p className="object-preview-empty">No objects created yet. Run some Objax code to create objects.</p>
      ) : (
        <div className="object-preview-items">
          {pageInstances.map((instance) => {
            const instanceClass = classes.find(cls => cls.name === instance.className);
            
            return (
              <div 
                key={instance.id} 
                className="object-preview-item"
                onClick={(event) => handleObjectClick(event, instance)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && (e.metaKey || e.ctrlKey)) {
                    setInspectorInstance(instance);
                  }
                }}
                role="button"
                tabIndex={0}
                title="Cmd/Ctrl+Click to inspect"
              >
                <div className="object-preview-item-header">
                  <h3 className="object-preview-item-title">{instance.name}</h3>
                  <span className="object-preview-item-type">({instance.className})</span>
                </div>
                
                {/* Render UI based on class name */}
                {instance.className === 'ButtonMorph' && (
                  <div className="object-preview-morph">
                    <ButtonMorph 
                      label={instance.name} 
                      onClick={() => handleButtonClick(instance)}
                    />
                  </div>
                )}
                
                {instance.className === 'FieldMorph' && (
                  <div className="object-preview-morph">
                    <FieldMorph 
                      label={instance.name}
                      value={instance.value || ''}
                      onChange={(value) => updateInstance(instance.id, { value })}
                      type="text"
                    />
                  </div>
                )}
                
                {instance.className === 'ListMorph' && (
                  <div className="object-preview-morph">
                    <ListMorph 
                      label={instance.name}
                      items={instance.items || ['Sample Item 1', 'Sample Item 2']}
                      onItemClick={(item) => console.log(`Clicked: ${item}`)}
                    />
                  </div>
                )}
                
                {instance.className === 'GroupMorph' && (
                  <div className="object-preview-morph">
                    <GroupMorph label={instance.name}>
                      <div className="text-sm text-gray-600">
                        Group container - children would be rendered here
                      </div>
                    </GroupMorph>
                  </div>
                )}
                
                {instance.className === 'DatabaseMorph' && (
                  <div className="object-preview-morph">
                    <DatabaseMorph 
                      instance={instance}
                      dataInstances={instances}
                      onInspect={setInspectorInstance}
                    />
                  </div>
                )}
                
                {instanceClass && (
                  <div className="object-preview-class-info">
                    <p className="mb-1">Fields:</p>
                    <ul className="object-preview-field-list">
                      {instanceClass.fields.map((field) => (
                        <li key={field.name} className="object-preview-field-item">
                          <span className="object-preview-field-name">{field.name}</span>
                          {field.default !== undefined && (
                            <span className="object-preview-field-default"> = {String(field.default)}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                    
                    {instanceClass.methods.length > 0 && (
                      <>
                        <p className="mb-1 mt-2">Methods:</p>
                        <ul className="object-preview-method-list">
                          {instanceClass.methods.map((method) => (
                            <li key={method.name} className="object-preview-method-item">
                              <span className="object-preview-method-name">{method.name}()</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {inspectorInstance && (
        <Inspector 
          instance={inspectorInstance} 
          onClose={() => setInspectorInstance(null)}
          onUpdate={updateInstance}
        />
      )}
    </div>
  );
}