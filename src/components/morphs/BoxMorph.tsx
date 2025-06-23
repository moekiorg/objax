import type { ObjaxInstance } from '../../types';

interface BoxMorphProps {
  instance: ObjaxInstance;
}

export function BoxMorph({ instance }: BoxMorphProps) {
  // width/height に px を追加する関数
  const addPxUnit = (value: string | number | undefined, defaultValue: string): string => {
    if (!value) return defaultValue;
    if (typeof value === 'number') return `${value}px`;
    const strValue = String(value);
    return strValue.match(/^\d+$/) ? `${strValue}px` : strValue;
  };

  const style: React.CSSProperties = {
    width: addPxUnit(instance.width, '100px'),
    height: addPxUnit(instance.height, '50px'),
    backgroundColor: instance.backgroundColor || '#ffffff',
    borderColor: instance.borderColor || '#cccccc',
    borderWidth: instance.borderWidth || '1px',
    borderStyle: 'solid',
    borderRadius: instance.borderRadius || '4px',
    padding: instance.padding || '12px',
    margin: instance.margin || '0px',
    color: instance.textColor || '#000000',
    fontSize: instance.fontSize || '14px',
    fontWeight: instance.fontWeight as any || 'normal',
    textAlign: instance.textAlign as any || 'left',
    display: instance.display || 'block',
    position: instance.position as any || 'static',
    opacity: instance.opacity || '1',
    boxShadow: instance.boxShadow || 'none',
    minWidth: '50px',
    minHeight: '20px',
  };

  return (
    <div 
      className="box-morph"
      style={style}
    >
      {instance.label || instance.name}
    </div>
  );
}