import React, { useState, useRef, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DraggableWindow } from "./DraggableWindow";
import { ClassBrowser } from "./ClassBrowser";
import { ClassInspector } from "./ClassInspector";
import { ClassMessageWindow } from "./ClassMessageWindow";
import { InstanceBrowser } from "./InstanceBrowser";
import { WindowPlayground } from "./WindowPlayground";
import { NewUIInstance } from "./NewUIInstance";
import { ButtonMorph } from "./morphs/ButtonMorph";
import { FieldMorph } from "./morphs/FieldMorph";
import { ListMorph } from "./morphs/ListMorph";
import { GroupMorph } from "./morphs/GroupMorph";
import { BoxMorph } from "./morphs/BoxMorph";
import { DatabaseMorph } from "./DatabaseMorph";
import { Halo } from "./Halo";
import { Inspector } from "./Inspector";
import { WindowMessage } from "./WindowMessage";
import { useObjaxStore } from "../stores/objaxStore";
import { parseObjaxWithClasses } from "../engine/objaxEngine";
import { presetUIClasses } from "../engine/presetClasses";
import { executeEventAction } from "../utils/executeEventAction";

interface CanvasViewProps {
  pageName: string;
}

interface WindowState {
  id: string;
  type:
    | "class-browser"
    | "class-inspector"
    | "class-message"
    | "playground"
    | "instance-browser"
    | "new-ui-instance"
    | "inspector"
    | "message";
  position: { x: number; y: number };
  instanceId?: string; // Inspector/Message用のインスタンスID
  instanceName?: string; // Message用のインスタンス名
  className?: string; // ClassInspector/ClassMessage用のクラス名
}

interface SortableCanvasObjectProps {
  instance: any;
  children: React.ReactNode;
  onObjectClick: (e: React.MouseEvent, instance: any) => void;
  isDndDisabled: boolean;
}

function SortableCanvasObject({
  instance,
  children,
  onObjectClick,
  isDndDisabled,
}: SortableCanvasObjectProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: instance.id,
    disabled: isDndDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isDndDisabled ? {} : listeners)}
      className={`canvas-object ${isDragging ? "dragging" : ""}`}
      onClick={(e) => onObjectClick(e, instance)}
    >
      {children}
    </div>
  );
}

export function CanvasView({ pageName }: CanvasViewProps) {
  const store = useObjaxStore();
  const {
    classes,
    instances,
    updateInstance,
    addInstance,
    removeInstance,
    setCurrentPageWithHistory,
    undo,
    canUndo,
    updateClass,
  } = store;
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Halo関連の状態
  const [selectedInstance, setSelectedInstance] = useState<any | null>(null);
  const [haloTargetRect, setHaloTargetRect] = useState<DOMRect | null>(null);

  const objectRefs = useRef<Map<string, HTMLElement>>(new Map());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleBackgroundClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Close halo when clicking background
    setSelectedInstance(null);
    setHaloTargetRect(null);

    // Check for Cmd/Ctrl + Click
    if (e.metaKey || e.ctrlKey) {
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
    }
  };

  const handleObjectClick = (e: React.MouseEvent, instance: any) => {
    e.stopPropagation();
    
    console.log('handleObjectClick called for:', instance.name, 'className:', instance.className, 'metaKey:', e.metaKey, 'ctrlKey:', e.ctrlKey);

    // Check for Cmd/Ctrl + Click for Halo
    if (e.metaKey || e.ctrlKey) {
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      setSelectedInstance(instance);
      setHaloTargetRect(rect);
      setShowContextMenu(false);
      console.log('Opening Halo for', instance.name);
    } else {
      // Handle normal click - execute event listeners for ButtonMorph
      console.log('Normal click detected for', instance.name);
      if (instance.className === "ButtonMorph") {
        console.log('Executing button click for ButtonMorph:', instance.name);
        executeButtonClick(instance);
      } else {
        console.log('Not a ButtonMorph, skipping execution');
      }
    }
  };

  const executeButtonClick = useCallback((instance: any) => {
    // Check for event listeners first (new system)
    if (instance.eventListeners && instance.eventListeners.length > 0) {
      const clickListener = instance.eventListeners.find(
        (listener: any) => listener.eventType === "click"
      );
      
      if (clickListener) {
        try {
          const errors = executeEventAction(clickListener.action, instance.name, store);
          if (errors && errors.length > 0) {
            console.error('Event execution errors:', errors);
            alert(`Event Error: ${errors.join(', ')}`);
          }
        } catch (error) {
          console.error('Failed to execute event action:', error);
          alert(`Event Error: ${error instanceof Error ? error.message : String(error)}`);
        }
        return; // Exit early if we found and executed an event listener
      }
    }
    
    // Fallback to old onClick property (for backwards compatibility)
    if (instance.onClick && instance.onClick.trim()) {
      executeOnClick(instance);
    }
  }, [store]);

  const executeOnClick = (instance: any) => {
    console.log('executeOnClick called for:', instance.name, 'with onClick:', instance.onClick);
    
    if (instance.onClick && instance.onClick.trim()) {
      try {
        // Store the onClick value before execution to restore it later
        const originalOnClick = instance.onClick;
        
        console.log('Executing onClick for', instance.name, ':', originalOnClick);
        
        // Use executeEventAction for execution
        const errors = executeEventAction(instance.onClick, instance.name, store);
        
        // Restore onClick property after execution to prevent it from being lost
        setTimeout(() => {
          const currentInstance = instances.find(i => i.id === instance.id);
          if (currentInstance && !currentInstance.onClick) {
            console.log(`Restoring onClick for ${instance.name}`);
            updateInstance(instance.id, { onClick: originalOnClick });
          }
        }, 10);
        
        if (errors && errors.length > 0) {
          console.error('OnClick execution errors:', errors);
          alert(`OnClick Error: ${errors.join(', ')}`);
        } else {
          console.log('OnClick executed successfully for', instance.name);
        }
      } catch (error) {
        // Show error message to user
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        console.error('OnClick execution error for', instance.name, ':', error);
        alert(`Objax Code Error: ${errorMessage}`);
      }
    } else {
      console.log('No onClick defined for', instance.name);
    }
  };

  const handlePageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Don't close context menu on page click anymore since we want global click handler to manage it
  };

  const openWindow = (type: WindowState["type"]) => {
    const newWindow: WindowState = {
      id: `${type}-${Date.now()}`,
      type,
      position: {
        x: contextMenuPosition.x + 20,
        y: contextMenuPosition.y + 20,
      },
    };
    setWindows((prev) => [...prev, newWindow]);
    setShowContextMenu(false);
  };

  const closeWindow = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  };

  // Haloハンドル機能
  const handleHaloDelete = () => {
    if (selectedInstance) {
      removeInstance(selectedInstance.id);
      setSelectedInstance(null);
      setHaloTargetRect(null);
    }
  };

  const handleHaloClose = () => {
    setSelectedInstance(null);
    setHaloTargetRect(null);
  };

  const handleHaloInspect = () => {
    if (selectedInstance) {
      // Inspectorウィンドウを開く
      const newWindow: WindowState = {
        id: `inspector-${selectedInstance.id}-${Date.now()}`,
        type: "inspector",
        position: {
          x: (haloTargetRect?.x || 200) + 50,
          y: (haloTargetRect?.y || 200) + 50,
        },
        instanceId: selectedInstance.id,
      };
      setWindows((prev) => [...prev, newWindow]);
    }
  };

  const handleHaloMessage = () => {
    if (selectedInstance) {
      // Open message window
      const newWindow: WindowState = {
        id: `message-${selectedInstance.id}-${Date.now()}`,
        type: "message",
        position: {
          x: (haloTargetRect?.x || 200) + 100,
          y: (haloTargetRect?.y || 200) + 50,
        },
        instanceId: selectedInstance.id,
        instanceName: selectedInstance.name,
      };
      setWindows((prev) => [...prev, newWindow]);
      setSelectedInstance(null);
      setHaloTargetRect(null);
    }
  };

  const handleSendMessage = (instanceName: string, code: string) => {
    try {
      // Build the message execution code
      const messageCode = `message to ${instanceName} "${code.replace(
        /"/g,
        '\\"'
      )}"`;

      // Execute the message
      const pageInstances = instances.filter((inst) => inst.page === pageName);
      const allClasses = [...presetUIClasses, ...classes];
      const result = parseObjaxWithClasses(
        messageCode,
        allClasses,
        pageInstances
      );

      // Apply any changes from the execution result
      if (result.instances && result.instances.length > 0) {
        result.instances.forEach((resultInstance) => {
          const existingInstance = pageInstances.find(
            (pi) => pi.name === resultInstance.name
          );

          if (existingInstance) {
            updateInstance(existingInstance.id, {
              ...resultInstance.properties,
              className: resultInstance.className,
              name: resultInstance.name,
            });
          }
        });
      }

      // Handle page navigation if any
      if (result.pageNavigations && result.pageNavigations.length > 0) {
        const lastNavigation =
          result.pageNavigations[result.pageNavigations.length - 1];
        setCurrentPageWithHistory(lastNavigation.pageName);
      }

      if (result.errors && result.errors.length > 0) {
        console.error("Message execution errors:", result.errors);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleSendClassMessage = (className: string, message: string) => {
    try {
      // Replace 'it' (case-insensitive) with the actual class name
      const processedMessage = message.replace(/\bit\b/gi, className);

      // Execute the class message directly
      const allClasses = [...presetUIClasses, ...classes];
      const pageInstances = instances.filter((inst) => inst.page === pageName);
      const result = parseObjaxWithClasses(
        processedMessage,
        allClasses,
        pageInstances
      );

      // Apply any class updates from the execution result
      if (result.classes && result.classes.length > 0) {
        result.classes.forEach((resultClass) => {
          const { methods, ...classUpdates } = resultClass;
          const convertedMethods = (methods || []).map((method) => ({
            name: method.name,
            code: method.body || "",
          }));
          updateClass(resultClass.name, {
            ...classUpdates,
            methods: convertedMethods,
          });
        });
      }

      // Apply any instance updates from the execution result
      if (result.instances && result.instances.length > 0) {
        result.instances.forEach((resultInstance) => {
          const existingInstance = pageInstances.find(
            (pi) => pi.name === resultInstance.name
          );

          if (existingInstance) {
            updateInstance(existingInstance.id, {
              ...resultInstance.properties,
              className: resultInstance.className,
              name: resultInstance.name,
            });
          } else {
            // Add new instance
            addInstance({
              id: `${pageName}-${resultInstance.name}-${Date.now()}`,
              name: resultInstance.name,
              className: resultInstance.className,
              type: resultInstance.className as any,
              page: pageName,
              order: instances.filter((i) => i.page === pageName).length,
              ...resultInstance.properties,
            });
          }
        });
      }

      if (result.errors && result.errors.length > 0) {
        console.error("Class message execution errors:", result.errors);
        throw new Error(result.errors.join(", "));
      }
    } catch (error) {
      console.error("Failed to send class message:", error);
      throw error;
    }
  };

  const handleHaloResizeStart = (e: React.MouseEvent) => {
    if (selectedInstance) {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      const element = objectRefs.current.get(selectedInstance.id);

      if (element) {
        const initialRect = element.getBoundingClientRect();
        const initialWidth = selectedInstance.width || initialRect.width;
        const initialHeight = selectedInstance.height || initialRect.height;

        const handleMouseMove = (e: MouseEvent) => {
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;

          // 新しいサイズを計算（最小サイズは50px）
          const newWidth = Math.max(50, initialWidth + deltaX);
          const newHeight = Math.max(50, initialHeight + deltaY);

          // 視覚的フィードバック
          element.style.width = `${newWidth}px`;
          element.style.height = `${newHeight}px`;

          // Haloも一緒にリサイズ
          if (haloTargetRect) {
            const newRect = new DOMRect(
              haloTargetRect.x,
              haloTargetRect.y,
              newWidth,
              newHeight
            );
            setHaloTargetRect(newRect);
          }
        };

        const handleMouseUp = () => {
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;

          // 最終的なサイズを計算して保存
          const finalWidth = Math.max(50, initialWidth + deltaX);
          const finalHeight = Math.max(50, initialHeight + deltaY);

          updateInstance(selectedInstance.id, {
            width: `${finalWidth}px`,
            height: `${finalHeight}px`,
          });

          // 視覚的なリセット
          element.style.width = "";
          element.style.height = "";

          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);

          // Haloの位置をリセット
          setTimeout(() => {
            if (selectedInstance) {
              const updatedElement = objectRefs.current.get(
                selectedInstance.id
              );
              if (updatedElement) {
                const rect = updatedElement.getBoundingClientRect();
                setHaloTargetRect(rect);
              }
            }
          }, 50);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      }
    }
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);

    // ドラッグ開始時にHaloを閉じる
    if (selectedInstance && selectedInstance.id === event.active.id) {
      setSelectedInstance(null);
      setHaloTargetRect(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over) {
      // Check if we're dropping on a GroupMorph
      const overInstance = instances.find((i) => i.id === String(over.id));
      if (overInstance && overInstance.className === "GroupMorph") {
        // Handle dropping on GroupMorph
        const droppedInstance = instances.find((i) => i.id === String(active.id));
        if (droppedInstance) {
          // Dropping on GroupMorph

          // Remove from previous parent if it has one
          if (droppedInstance.parentId) {
            const prevParent = instances.find(
              (i) => i.id === droppedInstance.parentId
            );
            if (prevParent) {
              const updatedChildren = (prevParent.children || []).filter(
                (id) => id !== String(active.id)
              );
              updateInstance(prevParent.id, { children: updatedChildren });
            }
          }

          // Update the dropped instance to be a child of this group
          updateInstance(String(active.id), {
            parentId: String(over.id),
            page: overInstance.page,
          });

          // Add the dropped instance to this group's children
          const currentChildren = overInstance.children || [];
          if (!currentChildren.includes(String(active.id))) {
            updateInstance(String(over.id), {
              children: [...currentChildren, String(active.id)],
            });
          }

          // Updated group children successfully
        }
      } else if (String(active.id) !== String(over?.id)) {
        // Handle normal reordering
        const pageInstances = instances
          .filter(
            (instance) => instance.page === pageName && !instance.parentId
          )
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        const oldIndex = pageInstances.findIndex(
          (instance) => instance.id === String(active.id)
        );
        const newIndex = pageInstances.findIndex(
          (instance) => instance.id === String(over?.id)
        );

        const reorderedInstances = arrayMove(pageInstances, oldIndex, newIndex);

        // Update order for all instances
        reorderedInstances.forEach((instance, index) => {
          updateInstance(instance.id, { order: index });
        });
      }
    }

    setActiveId(null);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    const isCanvasArea =
      target.classList.contains("canvas-page-content") ||
      target.classList.contains("canvas-page") ||
      target.closest(".canvas-page-content");

    // Handle drop if it's on canvas area and not handled by other components
    if (isCanvasArea) {
      e.preventDefault();
      // Canvas drop handler

      try {
        const data = JSON.parse(e.dataTransfer.getData("application/json"));
        // Process canvas drop data

        if (data.type === "new-ui-instance") {
          // Create new instance from dropped UI class
          const newInstance = {
            id: `${pageName}-${data.className.toLowerCase()}-${Date.now()}`,
            name: `${data.className.toLowerCase()}${Date.now()}`,
            className: data.className,
            page: pageName,
            order: instances.filter((i) => i.page === pageName && !i.parentId)
              .length,
            ...data.defaultProps,
          };

          // Creating new instance on canvas
          addInstance(newInstance);
        } else if (data.type === "canvas-object") {
          // Moving object back to canvas (remove from any group)
          const droppedInstance = instances.find(
            (i) => i.id === data.instanceId
          );
          if (droppedInstance && droppedInstance.parentId) {
            // Moving object back to canvas

            // Remove from parent group's children
            const parentInstance = instances.find(
              (i) => i.id === droppedInstance.parentId
            );
            if (parentInstance) {
              const updatedChildren = (parentInstance.children || []).filter(
                (id) => id !== data.instanceId
              );
              updateInstance(parentInstance.id, { children: updatedChildren });
            }

            // Remove parentId from the dropped instance
            updateInstance(data.instanceId, { parentId: undefined });
          }
        }
      } catch (err) {
        // Handle drop error
      }
    }
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    const isCanvasArea =
      target.classList.contains("canvas-page-content") ||
      target.classList.contains("canvas-page") ||
      target.closest(".canvas-page-content");

    if (isCanvasArea) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  };

  // Add global click listener when context menu or halo is open
  React.useEffect(() => {
    if (showContextMenu || selectedInstance) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;

        // Handle context menu clicks
        if (showContextMenu) {
          const contextMenu = document.querySelector(
            '[data-testid="context-menu"]'
          );
          if (contextMenu && !contextMenu.contains(target)) {
            setShowContextMenu(false);
          }
        }

        // Handle halo clicks
        if (selectedInstance) {
          const haloHandle = target.closest(".halo-handle");
          const haloOverlay = target.closest(".halo-overlay");

          // Close halo if click is not on a halo handle
          if (!haloHandle && haloOverlay) {
            setSelectedInstance(null);
            setHaloTargetRect(null);
          } else if (!haloOverlay) {
            // Close halo if click is completely outside the halo
            setSelectedInstance(null);
            setHaloTargetRect(null);
          }
        }
      };

      // Use capture phase and add delay to avoid catching the opening click
      const timer = setTimeout(() => {
        document.addEventListener("click", handleClickOutside, true);
      }, 10);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("click", handleClickOutside, true);
      };
    }
  }, [showContextMenu, selectedInstance]);

  // Add keyboard shortcut handler for Cmd+Z
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+Z (Mac) or Ctrl+Z (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, canUndo]);

  return (
    <div className="canvas-view">
      {/* Header with back to pages link */}
      <header className="canvas-header">
        <button
          className="back-to-pages-btn"
          onClick={() => setCurrentPageWithHistory(null)}
        >
          Home
        </button>
      </header>

      {/* Background area */}
      <div
        className="canvas-background"
        data-testid="canvas-background"
        onClick={handleBackgroundClick}
      >
        {/* Canvas Page in center */}
        <div
          className="canvas-page"
          data-testid="canvas-page"
          onClick={handlePageClick}
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
        >
          <div className="canvas-page-content">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={(() => {
                  const pageInstances = instances.filter(
                    (instance) =>
                      instance.page === pageName && !instance.parentId
                  );

                  const filteredInstances = pageInstances
                    .filter((instance) => {
                      const uiMorphs = [
                        "ButtonMorph",
                        "FieldMorph",
                        "ListMorph",
                        "GroupMorph",
                        "DatabaseMorph",
                      ];
                      if (uiMorphs.includes(instance.className)) {
                        // UI Morphs are shown by default, but can be hidden if isOpen is explicitly false
                        return instance.isOpen !== false;
                      }
                      return instance.isOpen === true;
                    })
                    .sort((a, b) => (a.order || 0) - (b.order || 0));

                  return filteredInstances.map((instance) => instance.id);
                })()}
                strategy={horizontalListSortingStrategy}
              >
                {(() => {
                  const pageInstances = instances.filter(
                    (instance) =>
                      instance.page === pageName && !instance.parentId
                  );

                  console.log(
                    "Page instances (after parentId filter):",
                    pageInstances
                  );

                  // Debug: Show all instances with their parentId
                  instances
                    .filter((i) => i.page === pageName)
                    .forEach((instance) => {
                      console.log(
                        `All instances debug - ${instance.name}: parentId=${instance.parentId}`
                      );
                    });

                  const filteredInstances = pageInstances
                    .filter((instance) => {
                      // Show instances that are either:
                      // 1. UI Morphs (ButtonMorph, FieldMorph, etc.) - shown by default, but can be hidden if isOpen is false
                      // 2. Custom classes with isOpen === true
                      const uiMorphs = [
                        "ButtonMorph",
                        "FieldMorph",
                        "ListMorph",
                        "GroupMorph",
                        "DatabaseMorph",
                        "BoxMorph",
                      ];
                      const isUIMorph = uiMorphs.includes(instance.className);
                      const isOpenCustomClass = instance.isOpen === true;

                      console.log(
                        `Instance ${instance.name} (${instance.className}): isUIMorph=${isUIMorph}, isOpen=${instance.isOpen}, parentId=${instance.parentId}`
                      );

                      if (isUIMorph) {
                        // UI Morphs are shown by default, but can be hidden if isOpen is explicitly false
                        return instance.isOpen !== false;
                      }
                      // For custom classes, only show if isOpen is true
                      return isOpenCustomClass;
                    })
                    .sort((a, b) => (a.order || 0) - (b.order || 0));

                  console.log("Canvas instances to render:", filteredInstances);
                  console.log(
                    "All instances for page:",
                    instances.filter((i) => i.page === pageName)
                  );
                  console.log("Page name:", pageName);

                  return filteredInstances.map((instance) => (
                    <SortableCanvasObject
                      key={instance.id}
                      instance={instance}
                      onObjectClick={handleObjectClick}
                      isDndDisabled={selectedInstance?.id !== instance.id}
                    >
                      {renderCanvasObject(instance)}
                    </SortableCanvasObject>
                  ));
                })()}
              </SortableContext>

              <DragOverlay>
                {activeId ? (
                  <div className="canvas-object-overlay">
                    {renderCanvasObject(
                      instances.find((instance) => instance.id === activeId)
                    )}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        {/* Context Menu */}
        {showContextMenu && (
          <div
            className="context-menu"
            data-testid="context-menu"
            style={{
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
            }}
          >
            <div
              className="context-menu-item"
              onClick={(e) => {
                e.stopPropagation();
                openWindow("playground");
              }}
            >
              プレイグラウンド
            </div>
            <div
              className="context-menu-item"
              onClick={(e) => {
                e.stopPropagation();
                openWindow("class-browser");
              }}
            >
              クラスブラウザ
            </div>
            <div
              className="context-menu-item"
              onClick={(e) => {
                e.stopPropagation();
                openWindow("instance-browser");
              }}
            >
              インスタンスブラウザ
            </div>
            <div
              className="context-menu-item"
              onClick={(e) => {
                e.stopPropagation();
                openWindow("new-ui-instance");
              }}
            >
              新しいUIインスタンス
            </div>
          </div>
        )}

        {/* Windows */}
        {windows.map((window) => (
          <DraggableWindow
            key={window.id}
            title={getWindowTitle(
              window.type,
              window.instanceId,
              window.instanceName,
              window.className
            )}
            onClose={() => closeWindow(window.id)}
            initialPosition={window.position}
          >
            {renderWindowContent(
              window.type,
              window.instanceId,
              window.instanceName,
              window.className
            )}
          </DraggableWindow>
        ))}

        {/* Halo */}
        {selectedInstance && haloTargetRect && (
          <Halo
            targetRect={haloTargetRect}
            onDelete={handleHaloDelete}
            onClose={handleHaloClose}
            onInspect={handleHaloInspect}
            onMessage={handleHaloMessage}
            onResizeStart={handleHaloResizeStart}
          />
        )}
      </div>
    </div>
  );

  function getWindowTitle(
    type: WindowState["type"],
    instanceId?: string,
    instanceName?: string,
    className?: string
  ): string {
    switch (type) {
      case "class-browser":
        return "クラスブラウザ";
      case "class-inspector":
        return `インスペクター - ${className || "不明"}`;
      case "class-message":
        return `メッセージ - ${className || "不明"}`;
      case "playground":
        return "プレイグラウンド";
      case "instance-browser":
        return "インスタンスブラウザ";
      case "new-ui-instance":
        return "新しいUIインスタンス";
      case "inspector": {
        const instance = instanceId
          ? instances.find((i) => i.id === instanceId)
          : null;
        return `インスペクター - ${instance?.name || "不明"}`;
      }
      case "message":
        return `メッセージ - ${instanceName || "不明"}`;
    }
  }

  function renderWindowContent(
    type: WindowState["type"],
    instanceId?: string,
    instanceName?: string,
    className?: string
  ): React.ReactNode {
    switch (type) {
      case "class-browser":
        return (
          <ClassBrowser
            classes={classes}
            onClassClick={(className) => {
              // Open class inspector window
              const newWindow: WindowState = {
                id: `class-inspector-${className}-${Date.now()}`,
                type: "class-inspector",
                position: {
                  x: 350,
                  y: 150,
                },
                className: className,
              };
              setWindows((prev) => [...prev, newWindow]);
            }}
          />
        );
      case "class-inspector":
        if (!className) return <div>クラス名が見つかりません</div>;
        return <ClassInspector className={className} classes={classes} />;
      case "class-message":
        if (!className) return <div>クラス名が見つかりません</div>;
        return (
          <ClassMessageWindow
            className={className}
            onSend={handleSendClassMessage}
          />
        );
      case "playground":
        return <WindowPlayground pageName={pageName} />;
      case "instance-browser":
        return (
          <InstanceBrowser
            pageName={pageName}
            instances={instances}
            onInspect={(instance) => {
              // Open inspector window for this instance
              const newWindow: WindowState = {
                id: `inspector-${instance.id}-${Date.now()}`,
                type: "inspector",
                position: {
                  x: 300,
                  y: 200,
                },
                instanceId: instance.id,
              };
              setWindows((prev) => [...prev, newWindow]);
            }}
            onMessage={(instance) => {
              // Open message window
              const newWindow: WindowState = {
                id: `message-${instance.id}-${Date.now()}`,
                type: "message",
                position: {
                  x: 400,
                  y: 200,
                },
                instanceId: instance.id,
                instanceName: instance.name,
              };
              setWindows((prev) => [...prev, newWindow]);
            }}
          />
        );
      case "new-ui-instance":
        return <NewUIInstance />;
      case "inspector": {
        const instance = instanceId
          ? instances.find((i) => i.id === instanceId)
          : null;
        if (!instance) return <div>インスタンスが見つかりません</div>;

        return (
          <Inspector
            instance={instance}
            onClose={() => {}} // ウィンドウのクローズボタンで閉じるため空
            onUpdate={(id, updates) => {
              updateInstance(id, updates);
            }}
            onDelete={(id) => {
              removeInstance(id);
              // Close the inspector window after deletion
              const inspectorWindow = windows.find(
                (w) => w.instanceId === id && w.type === "inspector"
              );
              if (inspectorWindow) {
                closeWindow(inspectorWindow.id);
              }
            }}
          />
        );
      }
      case "message": {
        if (!instanceName) return <div>インスタンス名が見つかりません</div>;

        return (
          <WindowMessage
            targetInstance={instanceName}
            onSend={(code) => handleSendMessage(instanceName, code)}
          />
        );
      }
    }
  }

  function renderCanvasObject(instance: any): React.ReactNode {
    const handleRef = (element: HTMLElement | null) => {
      if (element) {
        objectRefs.current.set(instance.id, element);
      } else {
        objectRefs.current.delete(instance.id);
      }
    };

    // リサイズ対応のスタイル
    const sizeStyle: React.CSSProperties = {};
    if (instance.width) sizeStyle.width = `${instance.width}px`;
    if (instance.height) sizeStyle.height = `${instance.height}px`;

    // Use className primarily, fallback to type if className is not set
    const objectType = instance.className || instance.type;

    switch (objectType) {
      case "ButtonMorph":
        return (
          <div ref={handleRef} style={sizeStyle}>
            <ButtonMorph
              label={instance.label || instance.name}
              // Don't override onClick - let handleObjectClick handle it
            />
          </div>
        );
      case "FieldMorph":
        console.log(
          "Rendering FieldMorph:",
          instance.name,
          "value:",
          instance.value,
          "label:",
          instance.label
        );
        return (
          <div ref={handleRef} style={sizeStyle}>
            <FieldMorph
              label={instance.label || instance.name}
              value={instance.value || ""}
              type={instance.type || "text"}
              onChange={(value) => {
                updateInstance(instance.id, { value });
              }}
            />
          </div>
        );
      case "ListMorph":
        return (
          <div ref={handleRef} style={sizeStyle}>
            <ListMorph
              label={instance.label || instance.name}
              items={instance.items || []}
              onItemClick={() => {
                // Handle list item clicks
              }}
            />
          </div>
        );
      case "GroupMorph": {
        // Get child instances
        const childInstances = instances
          .filter((child) => instance.children?.includes(child.id))
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        return (
          <div ref={handleRef} style={sizeStyle}>
            <GroupMorph
              label={instance.label || instance.name}
              flexDirection={instance.flexDirection || "column"}
              alignItems={instance.alignItems || "stretch"}
              justifyContent={instance.justifyContent || "flex-start"}
              gap={instance.gap || "8px"}
              padding={instance.padding || "12px"}
              acceptDrops={true}
              onDrop={(data) => {
                if (typeof data === "string") {
                  // Existing canvas object drop (from @dnd-kit)
                  // This is handled by @dnd-kit handleDragEnd
                } else if (data.type === "new-ui-instance") {
                  // New UI instance drop (from NewUIInstance)

                  const newInstance = {
                    id: `${pageName}-${data.className.toLowerCase()}-${Date.now()}`,
                    name: `${data.className.toLowerCase()}${Date.now()}`,
                    className: data.className,
                    page: pageName,
                    parentId: instance.id,
                    order: (instance.children || []).length,
                    ...data.defaultProps,
                  };

                  // Add the new instance
                  addInstance(newInstance);

                  // Add to group's children
                  const currentChildren = instance.children || [];
                  updateInstance(instance.id, {
                    children: [...currentChildren, newInstance.id],
                  });

                  // Instance added to group successfully
                }
              }}
            >
              {childInstances.map((childInstance) => (
                <div key={childInstance.id} style={{ display: "inline-block" }}>
                  {renderCanvasObject(childInstance)}
                </div>
              ))}
            </GroupMorph>
          </div>
        );
      }
      case "DatabaseMorph":
        return (
          <div ref={handleRef} style={sizeStyle}>
            <DatabaseMorph
              instance={instance}
              dataInstances={instances}
              onUpdate={updateInstance}
            />
          </div>
        );
      case "BoxMorph":
        return (
          <div ref={handleRef}>
            <BoxMorph instance={instance} />
          </div>
        );
      case "TaskList":
        // Handle custom classes like TaskList
        return (
          <div ref={handleRef} style={sizeStyle}>
            <div className="p-4 border rounded bg-gray-50">
              <h3 className="font-medium">{instance.name}</h3>
              <p className="text-sm text-gray-600">
                TaskList ({instance.className})
              </p>
              {instance.items && instance.items.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    Items: {instance.items.length}
                  </p>
                  <ul className="text-xs">
                    {instance.items.slice(0, 3).map((item: any, idx: number) => (
                      <li key={idx}>
                        •{" "}
                        {typeof item === "object" ? JSON.stringify(item) : item}
                      </li>
                    ))}
                    {instance.items.length > 3 && (
                      <li>... and {instance.items.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      default:
        // Unknown object type
        return (
          <div>
            不明なオブジェクトタイプ: {objectType} (className:{" "}
            {instance.className}, type: {instance.type})
          </div>
        );
    }
  }
}
