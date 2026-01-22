import { useCallback, useState } from 'react';
import { useReactFlow } from 'reactflow';
import { toPng } from 'html-to-image';
import { useStore } from '../store';
import { MapData } from '../types';
import './Toolbar.css';

interface ToolbarProps {
  onShowHelp: () => void;
  onShowMaps: () => void;
}

export default function Toolbar({ onShowHelp, onShowMaps }: ToolbarProps) {
  const { fitView, getViewport, zoomTo, setViewport } = useReactFlow();
  const {
    nodes,
    edges,
    currentMapName,
    isDirty,
    newMap,
    saveMap,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useStore();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');

  const handleNew = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm(
        'Ci sono modifiche non salvate. Vuoi creare una nuova mappa?'
      );
      if (!confirmed) return;
    }
    newMap();
  }, [isDirty, newMap]);

  const handleSave = useCallback(() => {
    saveMap();
  }, [saveMap]);

  const handleSaveAs = useCallback(() => {
    setSaveName(currentMapName);
    setShowSaveDialog(true);
  }, [currentMapName]);

  const handleSaveDialogConfirm = useCallback(() => {
    if (saveName.trim()) {
      saveMap(saveName.trim());
      setShowSaveDialog(false);
    }
  }, [saveName, saveMap]);

  const handleExportPNG = useCallback(() => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (!element) return;

    toPng(element, {
      backgroundColor: '#f5f5f5',
      width: element.offsetWidth,
      height: element.offsetHeight,
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${currentMapName}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Errore durante l\'esportazione PNG:', err);
        alert('Errore durante l\'esportazione PNG');
      });
  }, [currentMapName]);

  const handleExportJSON = useCallback(() => {
    const mapData: MapData = {
      id: `export_${Date.now()}`,
      name: currentMapName,
      nodes,
      edges,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const dataStr = JSON.stringify(mapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = `${currentMapName}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [currentMapName, nodes, edges]);

  const handleExportSVG = useCallback(() => {
    const svgElement = document.querySelector('.react-flow__viewport') as SVGElement;
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.download = `${currentMapName}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [currentMapName]);

  const handleZoomIn = useCallback(() => {
    const { zoom } = getViewport();
    zoomTo(zoom * 1.2, { duration: 200 });
  }, [zoomTo, getViewport]);

  const handleZoomOut = useCallback(() => {
    const { zoom } = getViewport();
    zoomTo(zoom * 0.8, { duration: 200 });
  }, [zoomTo, getViewport]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 200 });
  }, [fitView]);

  const handleReset = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 200 });
  }, [setViewport]);

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-section">
          <span className="toolbar-label">File:</span>
          <button onClick={handleNew} title="Nuova mappa (Ctrl+N)">
            Nuovo
          </button>
          <button onClick={onShowMaps} title="Apri mappa esistente">
            Apri
          </button>
          <button onClick={handleSave} title="Salva (Ctrl+S)">
            Salva{isDirty ? '*' : ''}
          </button>
          <button onClick={handleSaveAs} title="Salva con nome">
            Salva come...
          </button>
        </div>

        <div className="toolbar-section">
          <span className="toolbar-label">Esporta:</span>
          <button onClick={handleExportPNG} title="Esporta come immagine PNG">
            PNG
          </button>
          <button onClick={handleExportJSON} title="Esporta dati JSON">
            JSON
          </button>
          <button onClick={handleExportSVG} title="Esporta vettoriale SVG">
            SVG
          </button>
        </div>

        <div className="toolbar-section">
          <span className="toolbar-label">Vista:</span>
          <button onClick={handleZoomIn} title="Zoom avanti">
            +
          </button>
          <button onClick={handleZoomOut} title="Zoom indietro">
            −
          </button>
          <button onClick={handleFitView} title="Adatta alla finestra">
            Adatta
          </button>
          <button onClick={handleReset} title="Reset vista">
            Reset
          </button>
        </div>

        <div className="toolbar-section">
          <span className="toolbar-label">Modifica:</span>
          <button
            onClick={undo}
            disabled={!canUndo()}
            title="Annulla (Ctrl+Z)"
          >
            ↶ Annulla
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            title="Ripristina (Ctrl+Y)"
          >
            ↷ Ripristina
          </button>
        </div>

        <div className="toolbar-section">
          <button onClick={onShowHelp} title="Mostra scorciatoie tastiera">
            ? Aiuto
          </button>
        </div>

        <div className="toolbar-section map-name">
          {currentMapName}
        </div>
      </div>

      {showSaveDialog && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Salva Mappa Come</h3>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveDialogConfirm();
                if (e.key === 'Escape') setShowSaveDialog(false);
              }}
              placeholder="Nome della mappa"
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={handleSaveDialogConfirm}>Salva</button>
              <button onClick={() => setShowSaveDialog(false)}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
