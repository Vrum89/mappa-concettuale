import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Connection,
  BackgroundVariant,
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ConceptNode from './components/ConceptNode';
import ConceptEdge from './components/ConceptEdge';
import Toolbar from './components/Toolbar';
import MapManager from './components/MapManager';
import HelpDialog from './components/HelpDialog';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import { useStore } from './store';
import './App.css';

const nodeTypes = {
  concept: ConceptNode,
};

const edgeTypes = {
  concept: ConceptEdge,
};

function FlowCanvas() {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    addEdge,
    undo,
    redo,
    canUndo,
    canRedo,
    updateNode,
    deleteNode,
  } = useStore();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showMapManager, setShowMapManager] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    nodeId: string;
    nodeLabel: string;
    childCount: number;
  } | null>(null);

  // Handle node changes from React Flow (drag, position, etc.)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes(applyNodeChanges(changes, nodes));
    },
    [nodes, setNodes]
  );

  // Handle edge changes from React Flow
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges(applyEdgeChanges(changes, edges));
    },
    [edges, setEdges]
  );

  // Handle new edge connections
  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      const newEdge = {
        id: `edge_${Date.now()}`,
        source: params.source,
        target: params.target,
        type: 'concept',
        data: { label: '', isEditing: false },
      };
      addEdge(newEdge);
    },
    [addEdge]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: { id: string }) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if editing
      if (
        (e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'TEXTAREA'
      ) {
        return;
      }

      // Ctrl+Z - Undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) undo();
      }

      // Ctrl+Y - Redo
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        if (canRedo()) redo();
      }

      // Ctrl+S - Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        useStore.getState().saveMap();
      }

      // Ctrl+N - New map
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        const isDirty = useStore.getState().isDirty;
        if (isDirty) {
          const confirmed = window.confirm(
            'Ci sono modifiche non salvate. Vuoi creare una nuova mappa?'
          );
          if (!confirmed) return;
        }
        useStore.getState().newMap();
      }

      // Tab - Create child node
      if (e.key === 'Tab' && selectedNodeId) {
        e.preventDefault();
        const newId = `node_${Date.now()}`;
        const currentNode = nodes.find((n) => n.id === selectedNodeId);
        if (!currentNode) return;

        const childrenCount = nodes.filter(
          (n) => n.data.parentId === selectedNodeId
        ).length;
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
            isEditing: true,
            parentId: selectedNodeId,
          },
        };

        const newEdge = {
          id: `edge_${Date.now()}`,
          source: selectedNodeId,
          target: newId,
          type: 'concept',
          data: {
            label: '',
            isEditing: false,
          },
        };

        useStore.getState().addNode(newNode);
        useStore.getState().addEdge(newEdge);
        setSelectedNodeId(newId);
      }

      // Delete/Backspace - Delete selected node
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        e.preventDefault();
        if (selectedNodeId === 'root') {
          alert('Non puoi eliminare il nodo principale!');
          return;
        }

        // Count children using edges
        const childrenCount = edges.filter(
          (edge) => edge.source === selectedNodeId
        ).length;

        if (childrenCount > 0) {
          // Has children - show dialog
          const node = nodes.find((n) => n.id === selectedNodeId);
          setDeleteConfirmState({
            nodeId: selectedNodeId,
            nodeLabel: node?.data.label || 'Senza nome',
            childCount: childrenCount,
          });
        } else {
          // No children - delete directly
          deleteNode(selectedNodeId);
          setSelectedNodeId(null);
        }
      }

      // Esc - Deselect
      if (e.key === 'Escape') {
        setSelectedNodeId(null);
        // Cancel all editing
        nodes.forEach((node) => {
          if (node.data.isEditing) {
            updateNode(node.id, { isEditing: false });
          }
        });
        edges.forEach((edge) => {
          if (edge.data?.isEditing) {
            useStore.getState().updateEdge(edge.id, { isEditing: false });
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedNodeId,
    nodes,
    edges,
    undo,
    redo,
    canUndo,
    canRedo,
    deleteNode,
    updateNode,
  ]);

  return (
    <div className="app">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'concept',
          animated: false,
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e0e0e0" />
        <Controls />
        <MiniMap
          nodeColor="#2196F3"
          maskColor="rgba(0, 0, 0, 0.1)"
          style={{ background: '#f5f5f5' }}
        />
        <Toolbar
          onShowHelp={() => setShowHelp(true)}
          onShowMaps={() => setShowMapManager(true)}
        />
      </ReactFlow>

      {showMapManager && <MapManager onClose={() => setShowMapManager(false)} />}
      {showHelp && <HelpDialog onClose={() => setShowHelp(false)} />}
      {deleteConfirmState && (
        <DeleteConfirmDialog
          nodeLabel={deleteConfirmState.nodeLabel}
          childCount={deleteConfirmState.childCount}
          onCancel={() => {
            setDeleteConfirmState(null);
          }}
          onConfirmDeleteOnly={() => {
            useStore.getState().deleteNodeOnly(deleteConfirmState.nodeId);
            setDeleteConfirmState(null);
            setSelectedNodeId(null);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
