import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { MapData } from '../types';
import './MapManager.css';

interface MapManagerProps {
  onClose: () => void;
}

export default function MapManager({ onClose }: MapManagerProps) {
  const [maps, setMaps] = useState<{ id: string; name: string }[]>([]);
  const loadMap = useStore((state) => state.loadMap);
  const isDirty = useStore((state) => state.isDirty);

  useEffect(() => {
    loadMapList();
  }, []);

  const loadMapList = () => {
    const mapList = JSON.parse(localStorage.getItem('mapList') || '[]');
    setMaps(mapList);
  };

  const handleLoadMap = (mapId: string) => {
    if (isDirty) {
      const confirmed = window.confirm(
        'Ci sono modifiche non salvate. Vuoi caricare un\'altra mappa?'
      );
      if (!confirmed) return;
    }

    const mapData = localStorage.getItem(`map_${mapId}`);
    if (mapData) {
      const map: MapData = JSON.parse(mapData);
      loadMap(map);
      onClose();
    }
  };

  const handleDuplicate = (mapId: string) => {
    const mapData = localStorage.getItem(`map_${mapId}`);
    if (mapData) {
      const map: MapData = JSON.parse(mapData);
      const newId = `map_${Date.now()}`;
      const newName = `${map.name} (copia)`;

      const newMap: MapData = {
        ...map,
        id: newId,
        name: newName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      localStorage.setItem(`map_${newId}`, JSON.stringify(newMap));

      const mapList = JSON.parse(localStorage.getItem('mapList') || '[]');
      mapList.push({ id: newId, name: newName });
      localStorage.setItem('mapList', JSON.stringify(mapList));

      loadMapList();
    }
  };

  const handleDelete = (mapId: string, mapName: string) => {
    const confirmed = window.confirm(
      `Sei sicuro di voler eliminare la mappa "${mapName}"?`
    );
    if (!confirmed) return;

    localStorage.removeItem(`map_${mapId}`);

    const mapList = JSON.parse(localStorage.getItem('mapList') || '[]');
    const updatedList = mapList.filter((m: { id: string }) => m.id !== mapId);
    localStorage.setItem('mapList', JSON.stringify(updatedList));

    loadMapList();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal map-manager" onClick={(e) => e.stopPropagation()}>
        <h3>Mappe Salvate</h3>

        {maps.length === 0 ? (
          <div className="no-maps">Nessuna mappa salvata</div>
        ) : (
          <div className="maps-list">
            {maps.map((map) => (
              <div key={map.id} className="map-item">
                <div className="map-info">
                  <div className="map-name">{map.name}</div>
                </div>
                <div className="map-actions">
                  <button onClick={() => handleLoadMap(map.id)}>Apri</button>
                  <button onClick={() => handleDuplicate(map.id)}>
                    Duplica
                  </button>
                  <button
                    className="delete"
                    onClick={() => handleDelete(map.id, map.name)}
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onClose}>Chiudi</button>
        </div>
      </div>
    </div>
  );
}
