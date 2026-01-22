import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ConceptNodeData } from '../types';
import { useStore } from '../store';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import './ConceptNode.css';

function ConceptNode({ id, data, selected }: NodeProps<ConceptNodeData>) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateNode = useStore((state) => state.updateNode);
  const deleteNode = useStore((state) => state.deleteNode);
  const deleteNodeOnly = useStore((state) => state.deleteNodeOnly);
  const addNode = useStore((state) => state.addNode);
  const addEdge = useStore((state) => state.addEdge);
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const pushHistory = useStore((state) => state.pushHistory);

  useEffect(() => {
    if (data.isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [data.isEditing]);

  const handleDoubleClick = () => {
    updateNode(id, { isEditing: true });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(id, { label: e.target.value });
  };

  const handleBlur = () => {
    updateNode(id, { isEditing: false });
    pushHistory();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      updateNode(id, { isEditing: false });
      pushHistory();
    } else if (e.key === 'Escape') {
      updateNode(id, { isEditing: false });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === 'root') {
      alert('Non puoi eliminare il nodo principale!');
      return;
    }

    // Count children using edges
    const childrenCount = edges.filter((edge) => edge.source === id).length;

    if (childrenCount > 0) {
      // Has children - show dialog
      setShowDeleteConfirm(true);
    } else {
      // No children - delete directly
      deleteNode(id);
    }
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newId = `node_${Date.now()}`;

    // Calculate new node position
    const currentNode = nodes.find((n) => n.id === id);
    if (!currentNode) return;

    const childrenCount = nodes.filter((n) => n.data.parentId === id).length;
    const offsetY = 150;
    const offsetX = childrenCount * 250 - (childrenCount > 0 ? 125 : 0);

    const newNode = {
      id: newId,
      type: 'concept',
      position: {
        x: currentNode.position.x + offsetX,
        y: currentNode.position.y + offsetY,
      },
      data: {
        label: 'Nuovo Nodo',
        isEditing: false,
        parentId: id,
      },
    };

    const newEdge = {
      id: `edge_${Date.now()}`,
      source: id,
      target: newId,
      type: 'concept',
      data: {
        label: '',
        isEditing: false,
      },
    };

    addNode(newNode);
    addEdge(newEdge);
  };

  return (
    <div
      className={`concept-node ${selected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Top} />

      <div className="node-content">
        {data.isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={data.label}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            maxLength={500}
            className="node-input"
          />
        ) : (
          <div className="node-label">{data.label}</div>
        )}
      </div>

      {(isHovered || selected) && (
        <div className="node-actions">
          <button
            className="action-btn add-btn"
            onClick={handleAddChild}
            title="Aggiungi nodo figlio"
          >
            +
          </button>
          {id !== 'root' && (
            <button
              className="action-btn delete-btn"
              onClick={handleDelete}
              title="Elimina nodo"
            >
              ×
            </button>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />

      {showDeleteConfirm && (
        <DeleteConfirmDialog
          nodeLabel={data.label}
          childCount={edges.filter((edge) => edge.source === id).length}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirmDeleteOnly={() => {
            deleteNodeOnly(id);
            setShowDeleteConfirm(false);
          }}
        />
      )}
    </div>
  );
}

export default memo(ConceptNode);
