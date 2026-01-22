# Mappa Concettuale

Applicazione web standalone per la creazione e gestione di mappe concettuali interattive.

## Caratteristiche

- **Interfaccia intuitiva**: Crea e modifica mappe concettuali con facilità
- **Editing inline**: Modifica testo di nodi e rami direttamente sulla canvas
- **Gestione gerarchica**: Struttura ad albero con profondità illimitata
- **Persistenza locale**: Salvataggio automatico nel browser (localStorage)
- **Esportazione**: Esporta le tue mappe in PNG, JSON o SVG
- **Undo/Redo**: Cronologia completa delle modifiche (fino a 50 operazioni)
- **Keyboard shortcuts**: Scorciatoie da tastiera per un lavoro più veloce
- **Design Gestalt**: UI pulita basata sui principi di design Gestalt

## Installazione

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev

# Build per produzione
npm run build

# Anteprima build di produzione
npm run preview
```

## Utilizzo

### Gestione Nodi

- **Doppio click su nodo**: Modifica il testo del nodo
- **Pulsante +**: Aggiungi un nodo figlio
- **Pulsante ×**: Elimina il nodo (con conferma se ha figli)
- **Drag & drop**: Sposta i nodi sulla canvas
- **Tab** (su nodo selezionato): Crea rapidamente un nodo figlio
- **Delete/Backspace**: Elimina il nodo selezionato

### Gestione Rami

- **Click su etichetta ramo**: Modifica il testo dell'etichetta
- **Enter**: Conferma la modifica
- **Esc**: Annulla la modifica

### Navigazione Canvas

- **Click e trascina sfondo**: Pan (sposta la vista)
- **Rotella mouse**: Zoom avanti/indietro
- **Pinch gesture**: Zoom (su touchpad/touch)
- **Pulsanti vista nella toolbar**: Zoom in/out, Adatta, Reset

### Scorciatoie Tastiera

- `Ctrl+N`: Nuova mappa
- `Ctrl+S`: Salva mappa
- `Ctrl+Z`: Annulla ultima azione
- `Ctrl+Y`: Ripristina azione
- `Tab`: Crea nodo figlio dal nodo selezionato
- `Delete/Backspace`: Elimina nodo selezionato
- `Enter`: Conferma editing
- `Esc`: Annulla editing / Deseleziona

### Salvataggio e Caricamento

1. **Salva**: Usa il pulsante "Salva" nella toolbar (Ctrl+S)
2. **Salva come**: Scegli un nuovo nome per la mappa
3. **Apri**: Visualizza e carica mappe salvate
4. **Duplica**: Crea una copia di una mappa esistente
5. **Elimina**: Rimuovi mappe non più necessarie

### Esportazione

- **PNG**: Esporta come immagine raster
- **JSON**: Esporta i dati per backup o condivisione
- **SVG**: Esporta come vettoriale (alta qualità)

## Limitazioni Tecniche

- **Lunghezza testo nodo**: Max 500 caratteri
- **Lunghezza etichetta ramo**: Max 100 caratteri
- **Cronologia**: Max 50 operazioni undo/redo
- **Storage**: Dipende dal limite localStorage del browser (~5-10MB)

## Tecnologie Utilizzate

- **React 18**: Framework UI
- **TypeScript**: Type safety
- **Vite**: Build tool veloce
- **React Flow**: Libreria per grafici interattivi
- **Zustand**: State management leggero
- **html-to-image**: Esportazione PNG

## Struttura Progetto

```
src/
├── components/
│   ├── ConceptNode.tsx       # Componente nodo personalizzato
│   ├── ConceptNode.css
│   ├── ConceptEdge.tsx       # Componente ramo personalizzato
│   ├── ConceptEdge.css
│   ├── Toolbar.tsx           # Toolbar principale
│   ├── Toolbar.css
│   ├── MapManager.tsx        # Gestione mappe salvate
│   ├── MapManager.css
│   ├── HelpDialog.tsx        # Dialogo aiuto
│   └── HelpDialog.css
├── types.ts                  # Definizioni TypeScript
├── store.ts                  # State management (Zustand)
├── App.tsx                   # Componente principale
├── App.css
├── main.tsx                  # Entry point
└── index.css
```

## Principi di Design

L'applicazione segue i **principi Gestalt** per una UX ottimale:

- **Prossimità**: Elementi correlati sono visivamente vicini
- **Continuità**: Curve fluide guidano l'occhio lungo i rami
- **Figura-sfondo**: Nodi in primo piano su canvas neutro
- **Somiglianza**: Stile coerente per elementi dello stesso tipo

## Browser Supportati

- Chrome/Edge (consigliato)
- Firefox
- Safari
- Opera

## Licenza

MIT

## Autore

Creato con Claude Code
