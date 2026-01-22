import { create } from 'zustand';
import { AppState, ConceptNode, ConceptEdge, MapData, HistoryState } from './types';

const MAX_HISTORY = 50;

const initialNode: ConceptNode = {
  id: 'root',
  type: 'concept',
  position: { x: 250, y: 250 },
  data: { label: 'Nodo Principale', isEditing: false },
};

const createHistoryState = (nodes: ConceptNode[], edges: ConceptEdge[]): HistoryState => ({
  nodes: JSON.parse(JSON.stringify(nodes)),
  edges: JSON.parse(JSON.stringify(edges)),
});

export const useStore = create<AppState>((set, get) => ({
  nodes: [initialNode],
  edges: [],
  currentMapId: null,
  currentMapName: 'Nuova Mappa',
  isDirty: false,
  history: [createHistoryState([initialNode], [])],
  historyIndex: 0,

  setNodes: (nodes) => set({ nodes, isDirty: true }),

  setEdges: (edges) => set({ edges, isDirty: true }),

  addNode: (node) => {
    const { nodes } = get();
    set({ nodes: [...nodes, node], isDirty: true });
    get().pushHistory();
  },

  updateNode: (id, data) => {
    const { nodes } = get();
    set({
      nodes: nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
      isDirty: true,
    });
  },

  deleteNode: (id) => {
    const { nodes, edges } = get();

    // Find all descendant nodes
    const nodesToDelete = new Set([id]);
    const findDescendants = (parentId: string) => {
      edges.forEach((edge) => {
        if (edge.source === parentId && !nodesToDelete.has(edge.target)) {
          nodesToDelete.add(edge.target);
          findDescendants(edge.target);
        }
      });
    };
    findDescendants(id);

    // Remove nodes and related edges
    set({
      nodes: nodes.filter((node) => !nodesToDelete.has(node.id)),
      edges: edges.filter(
        (edge) => !nodesToDelete.has(edge.source) && !nodesToDelete.has(edge.target)
      ),
      isDirty: true,
    });
    get().pushHistory();
  },

  addEdge: (edge) => {
    const { edges } = get();
    set({ edges: [...edges, edge], isDirty: true });
    get().pushHistory();
  },

  updateEdge: (id, data) => {
    const { edges } = get();
    set({
      edges: edges.map((edge) =>
        edge.id === id
          ? {
              ...edge,
              data: {
                label: edge.data?.label ?? '',
                isEditing: edge.data?.isEditing ?? false,
                ...data,
              },
            }
          : edge
      ),
      isDirty: true,
    });
  },

  deleteEdge: (id) => {
    const { edges } = get();
    set({ edges: edges.filter((edge) => edge.id !== id), isDirty: true });
    get().pushHistory();
  },

  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(createHistoryState(nodes, edges));

    // Limit history size
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      set({
        nodes: JSON.parse(JSON.stringify(prevState.nodes)),
        edges: JSON.parse(JSON.stringify(prevState.edges)),
        historyIndex: historyIndex - 1,
        isDirty: true,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      set({
        nodes: JSON.parse(JSON.stringify(nextState.nodes)),
        edges: JSON.parse(JSON.stringify(nextState.edges)),
        historyIndex: historyIndex + 1,
        isDirty: true,
      });
    }
  },

  canUndo: () => {
    const { historyIndex } = get();
    return historyIndex > 0;
  },

  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },

  newMap: () => {
    set({
      nodes: [initialNode],
      edges: [],
      currentMapId: null,
      currentMapName: 'Nuova Mappa',
      isDirty: false,
      history: [createHistoryState([initialNode], [])],
      historyIndex: 0,
    });
  },

  loadMap: (map) => {
    set({
      nodes: map.nodes,
      edges: map.edges,
      currentMapId: map.id,
      currentMapName: map.name,
      isDirty: false,
      history: [createHistoryState(map.nodes, map.edges)],
      historyIndex: 0,
    });
  },

  saveMap: (name) => {
    const { nodes, edges, currentMapId, currentMapName } = get();
    const mapName = name || currentMapName;
    const mapId = currentMapId || `map_${Date.now()}`;

    const mapData: MapData = {
      id: mapId,
      name: mapName,
      nodes,
      edges,
      createdAt: currentMapId ? JSON.parse(localStorage.getItem(`map_${mapId}`) || '{}').createdAt || Date.now() : Date.now(),
      updatedAt: Date.now(),
    };

    // Save to localStorage
    localStorage.setItem(`map_${mapId}`, JSON.stringify(mapData));

    // Update map list
    const mapList = JSON.parse(localStorage.getItem('mapList') || '[]');
    if (!mapList.find((m: { id: string }) => m.id === mapId)) {
      mapList.push({ id: mapId, name: mapName });
      localStorage.setItem('mapList', JSON.stringify(mapList));
    } else {
      const updatedList = mapList.map((m: { id: string; name: string }) =>
        m.id === mapId ? { id: mapId, name: mapName } : m
      );
      localStorage.setItem('mapList', JSON.stringify(updatedList));
    }

    set({
      currentMapId: mapId,
      currentMapName: mapName,
      isDirty: false,
    });
  },

  setCurrentMapName: (name) => set({ currentMapName: name }),

  setDirty: (dirty) => set({ isDirty: dirty }),
}));
