import './HelpDialog.css';

interface HelpDialogProps {
  onClose: () => void;
}

export default function HelpDialog({ onClose }: HelpDialogProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal help-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Guida e Scorciatoie</h3>

        <div className="help-content">
          <section>
            <h4>Gestione Nodi</h4>
            <ul>
              <li>
                <strong>Doppio click su nodo:</strong> Modifica testo
              </li>
              <li>
                <strong>Pulsante +:</strong> Aggiungi nodo figlio
              </li>
              <li>
                <strong>Pulsante ×:</strong> Elimina nodo
              </li>
              <li>
                <strong>Drag & drop:</strong> Sposta nodo
              </li>
              <li>
                <strong>Tab (su nodo selezionato):</strong> Crea nodo figlio
              </li>
              <li>
                <strong>Delete/Backspace:</strong> Elimina nodo selezionato
              </li>
            </ul>
          </section>

          <section>
            <h4>Gestione Rami</h4>
            <ul>
              <li>
                <strong>Click su etichetta ramo:</strong> Modifica testo
              </li>
              <li>
                <strong>Enter:</strong> Conferma modifica
              </li>
              <li>
                <strong>Esc:</strong> Annulla modifica
              </li>
            </ul>
          </section>

          <section>
            <h4>Navigazione Canvas</h4>
            <ul>
              <li>
                <strong>Click e trascina sfondo:</strong> Pan (sposta vista)
              </li>
              <li>
                <strong>Rotella mouse:</strong> Zoom avanti/indietro
              </li>
              <li>
                <strong>Pinch gesture:</strong> Zoom (touchpad/touch)
              </li>
            </ul>
          </section>

          <section>
            <h4>Scorciatoie Tastiera</h4>
            <ul>
              <li>
                <strong>Ctrl+N:</strong> Nuova mappa
              </li>
              <li>
                <strong>Ctrl+S:</strong> Salva mappa
              </li>
              <li>
                <strong>Ctrl+Z:</strong> Annulla ultima azione
              </li>
              <li>
                <strong>Ctrl+Y:</strong> Ripristina azione
              </li>
              <li>
                <strong>Enter:</strong> Conferma editing
              </li>
              <li>
                <strong>Esc:</strong> Annulla editing / Deseleziona
              </li>
            </ul>
          </section>

          <section>
            <h4>Limitazioni</h4>
            <ul>
              <li>Max lunghezza testo nodo: 500 caratteri</li>
              <li>Max lunghezza etichetta ramo: 100 caratteri</li>
              <li>Cronologia undo/redo: 50 operazioni</li>
            </ul>
          </section>
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>Chiudi</button>
        </div>
      </div>
    </div>
  );
}
