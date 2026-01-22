import { Node, Edge } from 'reactflow';

export interface ConceptNodeData {
  label: string;
  isEditing: boolean;
  parentId?: string;
}

export interface ConceptEdgeData {
  label?: string;
  isEditing: boolean;
}

export type ConceptNode = Node<ConceptNodeData>;
export type ConceptEdge = Edge<ConceptEdgeData>;

export interface MapData {
  id: string;
  name: string;
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  createdAt: number;
  updatedAt: number;
}

export interface HistoryState {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
}

export interface AppState {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  currentMapId: string | null;
  currentMapName: string;
  isDirty: boolean;
  history: HistoryState[];
  historyIndex: number;

  // Actions
  setNodes: (nodes: ConceptNode[]) => void;
  setEdges: (edges: ConceptEdge[]) => void;
  addNode: (node: ConceptNode) => void;
  updateNode: (id: string, data: Partial<ConceptNodeData>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: ConceptEdge) => void;
  updateEdge: (id: string, data: Partial<ConceptEdgeData>) => void;
  deleteEdge: (id: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  pushHistory: () => void;

  // Map management
  newMap: () => void;
  loadMap: (map: MapData) => void;
  saveMap: (name?: string) => void;
  setCurrentMapName: (name: string) => void;
  setDirty: (dirty: boolean) => void;
}
