import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Connection,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ConceptNode from './components/ConceptNode';
import ConceptEdge from './components/ConceptEdge';
import Toolbar from './components/Toolbar';
import MapManager from './components/MapManager';
import HelpDialog from './components/HelpDialog';
import { useStore } from './store';
import './App.css';

const nodeTypes = {
  concept: ConceptNode,
};

const edgeTypes = {
  concept: ConceptEdge,
};

function FlowCanvas() {
  const { nodes: storeNodes, edges: storeEdges, setNodes, setEdges } = useStore();
  const [nodes, , onNodesChange] = useNodesState(storeNodes);
  const [edges, , onEdgesChange] = useEdgesState(storeEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showMapManager, setShowMapManager] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const { undo, redo, canUndo, canRedo, updateNode, deleteNode } = useStore();

  // Sync local state with store
  useEffect(() => {
    onNodesChange(
      storeNodes.map((node) => ({
        item: node,
        type: 'reset',
        id: node.id,
      }))
    );
  }, [storeNodes, onNodesChange]);

  useEffect(() => {
    onEdgesChange(
      storeEdges.map((edge) => ({
        item: edge,
        type: 'reset',
        id: edge.id,
      }))
    );
  }, [storeEdges, onEdgesChange]);

  // Update store when nodes/edges change
  useEffect(() => {
    if (JSON.stringify(nodes) !== JSON.stringify(storeNodes)) {
      setNodes(nodes);
    }
  }, [nodes, storeNodes, setNodes]);

  useEffect(() => {
    if (JSON.stringify(edges) !== JSON.stringify(storeEdges)) {
      setEdges(edges);
    }
  }, [edges, storeEdges, setEdges]);

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
      onEdgesChange([{ item: newEdge, type: 'add' }]);
    },
    [onEdgesChange]
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
        const currentNode = storeNodes.find((n) => n.id === selectedNodeId);
        if (!currentNode) return;

        const childrenCount = storeNodes.filter(
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

        const hasChildren = storeNodes.some(
          (node) => node.data.parentId === selectedNodeId
        );
        if (hasChildren) {
          const confirmed = window.confirm(
            'Questo nodo ha dei figli. Eliminandolo verranno eliminati anche tutti i nodi figli. Continuare?'
          );
          if (!confirmed) return;
        }

        deleteNode(selectedNodeId);
        setSelectedNodeId(null);
      }

      // Esc - Deselect
      if (e.key === 'Escape') {
        setSelectedNodeId(null);
        // Cancel all editing
        storeNodes.forEach((node) => {
          if (node.data.isEditing) {
            updateNode(node.id, { isEditing: false });
          }
        });
        storeEdges.forEach((edge) => {
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
    storeNodes,
    storeEdges,
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
