import type React from 'react';

interface HaloProps {
  /** 対象オブジェクトの位置とサイズ */
  targetRect: DOMRect;
  /** 削除ハンドルのクリック */
  onDelete: () => void;
  /** 閉じるハンドルのクリック */
  onClose: () => void;
  /** Inspectorハンドルのクリック */
  onInspect: () => void;
  /** メッセージハンドルのクリック */
  onMessage: () => void;
  /** リサイズハンドルのマウスダウン */
  onResizeStart: (e: React.MouseEvent) => void;
}

export function Halo({ 
  targetRect, 
  onDelete, 
  onClose, 
  onInspect, 
  onMessage,
  onResizeStart 
}: HaloProps) {
  const handleRadius = 12;
  const haloOffset = 8;
  
  // ハンドルの位置を計算（オブジェクトを囲むように配置）
  const haloRect = {
    left: targetRect.left - haloOffset,
    top: targetRect.top - haloOffset,
    right: targetRect.right + haloOffset,
    bottom: targetRect.bottom + haloOffset,
    width: targetRect.width + haloOffset * 2,
    height: targetRect.height + haloOffset * 2,
  };

  // 5つのハンドルの位置
  const handles = [
    {
      id: 'delete',
      label: 'D',
      x: haloRect.left - handleRadius,
      y: haloRect.top - handleRadius,
      onClick: onDelete,
      className: 'halo-handle-delete',
      title: '削除'
    },
    {
      id: 'close',
      label: 'C',
      x: haloRect.right - handleRadius,
      y: haloRect.top - handleRadius,
      onClick: onClose,
      className: 'halo-handle-close',
      title: 'ハローを閉じる'
    },
    {
      id: 'inspect',
      label: 'I',
      x: haloRect.left - handleRadius,
      y: haloRect.bottom - handleRadius,
      onClick: onInspect,
      className: 'halo-handle-inspect',
      title: 'インスペクト'
    },
    {
      id: 'message',
      label: 'M',
      x: haloRect.left + haloRect.width / 2 - handleRadius,
      y: haloRect.bottom - handleRadius,
      onClick: onMessage,
      className: 'halo-handle-message',
      title: 'メッセージ'
    },
    {
      id: 'resize',
      label: '↗',
      x: haloRect.right - handleRadius,
      y: haloRect.bottom - handleRadius,
      onMouseDown: onResizeStart,
      className: 'halo-handle-resize',
      title: 'リサイズ',
      cursor: 'nw-resize'
    }
  ];

  return (
    <div 
      className="halo-overlay"
      data-testid="halo-overlay"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {/* Halo border */}
      <div
        className="halo-border"
        style={{
          position: 'absolute',
          left: haloRect.left,
          top: haloRect.top,
          width: haloRect.width,
          height: haloRect.height,
          border: '2px dashed #007ACC',
          borderRadius: '4px',
          pointerEvents: 'none',
        }}
      />
      
      {/* Handles */}
      {handles.map(handle => (
        <div
          key={handle.id}
          className={`halo-handle ${handle.className}`}
          style={{
            position: 'absolute',
            left: handle.x,
            top: handle.y,
            width: handleRadius * 2,
            height: handleRadius * 2,
            borderRadius: '50%',
            backgroundColor: '#007ACC',
            color: 'white',
            border: '2px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'bold',
            cursor: handle.cursor || 'pointer',
            pointerEvents: 'auto',
            userSelect: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
          title={handle.title}
          onClick={handle.onClick}
          onMouseDown={handle.onMouseDown}
        >
          {handle.label}
        </div>
      ))}
    </div>
  );
}