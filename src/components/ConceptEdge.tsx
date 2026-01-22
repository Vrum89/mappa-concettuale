import { memo, useRef, useEffect } from 'react';
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
  const updateEdge = useStore((state) => state.updateEdge);
  const pushHistory = useStore((state) => state.pushHistory);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  useEffect(() => {
    if (data?.isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [data?.isEditing]);

  const handleClick = (e: React.MouseEvent) => {
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

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="edge-label-container"
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
            <div
              className={`edge-label ${data?.label ? 'has-label' : 'no-label'}`}
              onClick={handleClick}
            >
              {data?.label || '+'}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(ConceptEdge);
