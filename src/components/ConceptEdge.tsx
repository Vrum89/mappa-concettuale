import { memo, useRef, useEffect, useState } from 'react';
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from 'reactflow';
import { ConceptEdgeData } from '../types';
import { useStore } from '../store';
import './ConceptEdge.css';

function ConceptEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<ConceptEdgeData>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const updateEdge = useStore((state) => state.updateEdge);
  const deleteEdge = useStore((state) => state.deleteEdge);
  const pushHistory = useStore((state) => state.pushHistory);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Calculate label position with custom offset
  const offsetX = data?.labelOffset?.x || 0;
  const offsetY = data?.labelOffset?.y || 0;
  const hasCustomPosition = offsetX !== 0 || offsetY !== 0;

  useEffect(() => {
    if (data?.isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [data?.isEditing]);

  // Drag handlers
  const handleLabelMouseDown = (e: React.MouseEvent) => {
    if (data?.isEditing) return; // Don't drag during editing

    setIsDragging(true);
    setDragStart({
      x: e.clientX - offsetX,
      y: e.clientY - offsetY,
    });
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newOffset = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    };

    updateEdge(id, { labelOffset: newOffset });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      pushHistory(); // Save to history after drag
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, offsetX, offsetY]);

  // Edit handlers
  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return; // Don't edit if was dragging
    e.stopPropagation();
    updateEdge(id, { isEditing: true });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateEdge(id, { label: e.target.value });
  };

  const handleBlur = () => {
    updateEdge(id, { isEditing: false });
    pushHistory();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      updateEdge(id, { isEditing: false });
      pushHistory();
    } else if (e.key === 'Escape') {
      updateEdge(id, { isEditing: false });
    }
  };

  // Delete handler
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteEdge(id);
    pushHistory();
  };

  // Recenter handler
  const handleRecenter = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateEdge(id, { labelOffset: { x: 0, y: 0 } });
    pushHistory();
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX + offsetX}px,${labelY + offsetY}px)`,
            pointerEvents: 'all',
            cursor: isDragging ? 'grabbing' : (data?.isEditing ? 'text' : 'grab'),
          }}
          className="edge-label-container"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseDown={handleLabelMouseDown}
        >
          {data?.isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={data.label || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              maxLength={100}
              className="edge-input"
              placeholder="Etichetta..."
            />
          ) : (
            <>
              <div
                className={`edge-label ${data?.label ? 'has-label' : 'no-label'} ${hasCustomPosition ? 'custom-position' : ''}`}
                onClick={handleClick}
              >
                {data?.label || '+'}
              </div>

              {/* Delete button (visible on hover, not during editing) */}
              {isHovered && !data?.isEditing && (
                <button
                  className="edge-delete-btn"
                  onClick={handleDelete}
                  onMouseDown={(e) => e.stopPropagation()} // Prevent drag
                  title="Elimina collegamento"
                >
                  ×
                </button>
              )}

              {/* Recenter button (only if label has custom position) */}
              {isHovered && hasCustomPosition && !data?.isEditing && (
                <button
                  className="edge-recenter-btn"
                  onClick={handleRecenter}
                  onMouseDown={(e) => e.stopPropagation()} // Prevent drag
                  title="Ricentra etichetta"
                >
                  ⊙
                </button>
              )}
            </>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(ConceptEdge);
