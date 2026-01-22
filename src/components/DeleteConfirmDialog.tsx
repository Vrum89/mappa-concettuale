import './DeleteConfirmDialog.css';

interface DeleteConfirmDialogProps {
  nodeLabel: string;
  childCount: number;
  onCancel: () => void;
  onConfirmDeleteOnly: () => void;
}

function DeleteConfirmDialog({
  nodeLabel,
  childCount,
  onCancel,
  onConfirmDeleteOnly,
}: DeleteConfirmDialogProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal delete-confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>⚠️ Elimina Nodo con Figli</h3>

        <div className="modal-content">
          <p>
            Stai per eliminare il nodo "<strong>{nodeLabel}</strong>" che ha{' '}
            <strong>{childCount}</strong> {childCount === 1 ? 'figlio' : 'figli'}.
          </p>
          <p className="info-text">
            I nodi figli diventeranno orfani e rimarranno nella mappa.
            Potrai ricollegarli ad altri nodi in seguito.
          </p>
        </div>

        <div className="modal-actions delete-actions">
          <button className="btn-cancel" onClick={onCancel}>
            <span className="icon">✕</span>
            Annulla
          </button>
          <button className="btn-delete" onClick={onConfirmDeleteOnly}>
            <span className="icon">🗑️</span>
            Elimina Solo Questo Nodo
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmDialog;
