import React from 'react';
import type { ObjaxInstance } from '../../types';

interface DataMorphProps {
  instance: ObjaxInstance;
  dataInstances?: ObjaxInstance[];
  onUpdate?: (updates: Partial<ObjaxInstance>) => void;
  onClick?: () => void;
}

export function DataMorph({ instance, dataInstances, onUpdate, onClick }: DataMorphProps) {
  // Get data from referenced instance or direct record
  let record = instance.record || {};
  let referencedInstance: ObjaxInstance | undefined;
  
  console.log('DataMorph rendering:', {
    instanceName: instance.name,
    dataSource: instance.dataSource,
    record: instance.record,
    displayFields: instance.displayFields
  });
  
  if (instance.dataSource && dataInstances) {
    referencedInstance = dataInstances.find(
      (inst) => inst.name === instance.dataSource
    );
    
    if (referencedInstance) {
      // Use the referenced instance's properties as the record
      record = {
        name: referencedInstance.name,
        className: referencedInstance.className,
        ...referencedInstance.properties,
        // Include common field values
        ...(referencedInstance.value !== undefined && { value: referencedInstance.value }),
        ...(referencedInstance.label !== undefined && { label: referencedInstance.label }),
        ...(referencedInstance.items !== undefined && { items: referencedInstance.items }),
      };
    }
  }
  
  const displayFields = (instance.displayFields && instance.displayFields.length > 0) 
    ? instance.displayFields 
    : Object.keys(record);
  
  // Only read-only if we have a dataSource AND found the referenced instance
  const isReadOnly = !!(instance.dataSource && dataInstances && referencedInstance);
  
  console.log('DataMorph processed:', {
    record,
    displayFields,
    isReadOnly,
    referencedInstanceFound: !!referencedInstance
  });
  
  const handleFieldEdit = (fieldName: string, value: any) => {
    if (!onUpdate || isReadOnly) return;
    
    const updatedRecord = {
      ...record,
      [fieldName]: value
    };
    
    onUpdate({
      record: updatedRecord
    });
  };

  const renderFieldValue = (fieldName: string, value: any) => {
    const baseClasses = "border border-gray-300 rounded px-2 py-1 text-sm w-full";
    const readOnlyClasses = isReadOnly ? "bg-gray-100 cursor-not-allowed" : "";
    
    console.log('DataMorph renderFieldValue:', { fieldName, value, valueType: typeof value });
    
    // For boolean values
    if (typeof value === 'boolean') {
      return (
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => handleFieldEdit(fieldName, e.target.checked)}
          disabled={isReadOnly}
          className={`w-4 h-4 ${readOnlyClasses}`}
        />
      );
    }
    
    // For string/number values
    return (
      <input
        type={typeof value === 'number' ? 'number' : 'text'}
        value={value?.toString() || ''}
        onChange={(e) => {
          const newValue = typeof value === 'number' 
            ? parseFloat(e.target.value) || 0
            : e.target.value;
          handleFieldEdit(fieldName, newValue);
        }}
        readOnly={isReadOnly}
        className={`${baseClasses} ${readOnlyClasses}`}
      />
    );
  };

  return (
    <div
      className="bg-white border border-gray-300 rounded p-3 shadow-sm hover:border-blue-300 transition-colors"
      style={{
        width: instance.width || '200px',
        height: instance.height || 'auto'
      }}
      onClick={onClick}
    >
      <div className="text-xs font-medium text-gray-600 mb-2">
        {instance.label || instance.name}
        {instance.dataSource && (
          <div className="text-xs text-blue-600 mt-1">
            → {instance.dataSource}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        {displayFields.map((fieldName) => (
          <div key={fieldName} className="flex items-center gap-2">
            <label className="text-xs text-gray-500 min-w-0 flex-shrink-0">
              {fieldName}:
            </label>
            <div className="flex-1 min-w-0">
              {renderFieldValue(fieldName, record[fieldName])}
            </div>
          </div>
        ))}
      </div>
      
      {displayFields.length === 0 && (
        <div className="text-xs text-gray-400 italic">
          No fields to display
        </div>
      )}
    </div>
  );
}