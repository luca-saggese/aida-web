import { useRef, useState } from 'react';
import { MoreHorizontal, Upload, FolderOpen, Save, Trash2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import type { Question } from '../../types';
import { usePlaygroundStore } from '../../stores/playgroundStore';

const STORAGE_KEY = 'aida_saved_questions';

type SavedEntry = { name: string; questions: Record<string, Question>; savedAt: string };

function loadSaved(): SavedEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistSaved(entries: SavedEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function QuestionsMenu() {
  const questionsValue = usePlaygroundStore((s) => s.questionsValue);
  const replaceQuestions = usePlaygroundStore((s) => s.replaceQuestions);

  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saved, setSaved] = useState<SavedEntry[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshSaved = () => setSaved(loadSaved());

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          setNotice('Invalid file: expected a JSON object of questions.');
          return;
        }
        replaceQuestions(parsed as Record<string, Question>);
        setNotice('Questions loaded from file.');
      } catch {
        setNotice('Invalid JSON file.');
      }
    };
    reader.onerror = () => setNotice('Could not read the file.');
    reader.readAsText(file);
  };

  const handleSave = () => {
    const name = saveName.trim();
    if (!name) return;
    const entries = loadSaved().filter((e) => e.name !== name);
    entries.push({ name, questions: questionsValue, savedAt: new Date().toISOString() });
    persistSaved(entries);
    setSaveName('');
    setSaveOpen(false);
    setNotice(`Saved "${name}".`);
  };

  const handleLoad = (entry: SavedEntry) => {
    replaceQuestions(entry.questions);
    setLoadOpen(false);
    setNotice(`Loaded "${entry.name}".`);
  };

  const handleDelete = (name: string) => {
    persistSaved(loadSaved().filter((e) => e.name !== name));
    refreshSaved();
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="questions-menu-btn" aria-label="Questions menu">
            <MoreHorizontal size={18} strokeWidth={1.7} />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="questions-menu-content" align="end" sideOffset={6}>
            <DropdownMenu.Item
              className="questions-menu-item"
              onSelect={() => fileInputRef.current?.click()}
            >
              <Upload size={15} strokeWidth={1.7} />
              Upload JSON
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="questions-menu-item"
              onSelect={() => {
                refreshSaved();
                setLoadOpen(true);
              }}
            >
              <FolderOpen size={15} strokeWidth={1.7} />
              Load
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="questions-menu-item"
              onSelect={() => setSaveOpen(true)}
            >
              <Save size={15} strokeWidth={1.7} />
              Save
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="questions-menu-sep" />
            <DropdownMenu.Item
              className="questions-menu-item danger"
              onSelect={() => {
                replaceQuestions({});
                setNotice('Questions cleared.');
              }}
            >
              <Trash2 size={15} strokeWidth={1.7} />
              Clear
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = '';
        }}
      />

      {notice && (
        <div className="questions-notice" role="status">
          {notice}
          <button className="questions-notice-close" onClick={() => setNotice(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <Dialog.Root open={saveOpen} onOpenChange={setSaveOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content">
            <Dialog.Title>Save questions</Dialog.Title>
            <Dialog.Description className="dialog-desc">
              Give this set of questions a name to save it for later.
            </Dialog.Description>
            <input
              className="dialog-input"
              placeholder="e.g. Product QA"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
            <div className="dialog-actions">
              <button type="button" className="dialog-cancel" onClick={() => setSaveOpen(false)}>
                Cancel
              </button>
              <button type="button" className="dialog-submit" disabled={!saveName.trim()} onClick={handleSave}>
                Save
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={loadOpen} onOpenChange={setLoadOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content">
            <Dialog.Title>Load questions</Dialog.Title>
            <Dialog.Description className="dialog-desc">
              Pick a saved set of questions to load into the editor.
            </Dialog.Description>
            {saved.length === 0 ? (
              <p className="dialog-empty">No saved questions yet. Use Save to store a set.</p>
            ) : (
              <ul className="saved-list">
                {saved.map((entry) => (
                  <li key={entry.name} className="saved-item">
                    <button className="saved-item-load" onClick={() => handleLoad(entry)}>
                      {entry.name}
                    </button>
                    <button
                      className="saved-item-delete"
                      onClick={() => handleDelete(entry.name)}
                      aria-label={`Delete ${entry.name}`}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="dialog-actions">
              <button type="button" className="dialog-cancel" onClick={() => setLoadOpen(false)}>
                Close
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}