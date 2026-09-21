import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Plus, Search, MoreHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { api, maskKey } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import type { ApiKeyItem } from '../types';
import './ApiKeysPage.css';

type SortKey = 'name' | 'status' | 'createdAt' | 'createdBy';
type SortDir = 'asc' | 'desc';

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const months = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const query = useQuery({ queryKey: ['api-keys'], queryFn: api.listApiKeys });

  const createMutation = useMutation({
    mutationFn: api.createApiKey,
    onSuccess: (res) => {
      setCreatedSecret(res.secret);
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: api.revokeApiKey,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteApiKey,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });

  const keys = useMemo(() => {
    let list = [...(query.data?.keys ?? [])];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (k) =>
          k.name.toLowerCase().includes(q) ||
          `${k.prefix}...${k.last4}`.toLowerCase().includes(q),
      );
    }
    const dir = sortDir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === 'createdAt') return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortKey === 'status') return (a.status.localeCompare(b.status)) * dir;
      return a.name.localeCompare(b.name) * dir;
    });
    return list;
  }, [query.data, search, sortKey, sortDir]);

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreatedSecret(null);
    createMutation.mutate(newName.trim(), { onSuccess: () => setNewName('') });
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <span className="sort-dummy">⌄</span>;
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="api-keys-page">
      <div className="api-keys-header">
        <div className="api-keys-title">
          <KeyRound size={22} strokeWidth={1.7} />
          <span>API keys</span>
        </div>
        <Dialog.Root open={createdSecret ? true : createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) setCreatedSecret(null); }}>
          <Dialog.Trigger asChild>
            <button className="create-key-btn">
              <Plus size={18} strokeWidth={2} />
              Create key
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="dialog-overlay" />
            <Dialog.Content className="dialog-content">
              {createdSecret ? (
                <>
                  <Dialog.Title>API key created</Dialog.Title>
                  <Dialog.Description className="dialog-desc">
                    Copy this secret now. It won&apos;t be shown again.
                  </Dialog.Description>
                  <div className="secret-box">
                    <code>{createdSecret}</code>
                    <button
                      className="copy-btn"
                      onClick={() => navigator.clipboard.writeText(createdSecret)}
                      aria-label="Copy secret"
                    >
                      Copy
                    </button>
                  </div>
                  <button className="dialog-close-btn" onClick={() => setCreatedSecret(null)}>
                    Done
                  </button>
                </>
              ) : (
                <form onSubmit={submitCreate}>
                  <Dialog.Title>Create API key</Dialog.Title>
                  <Dialog.Description className="dialog-desc">Give your key a name.</Dialog.Description>
                  {createMutation.isError && <div className="api-error">Failed to create key.</div>}
                  <input
                    className="dialog-input"
                    placeholder="Production"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                  />
                  <div className="dialog-actions">
                    <button type="button" className="dialog-cancel" onClick={() => setCreateOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="dialog-submit" disabled={!newName.trim() || createMutation.isPending}>
                      Create
                    </button>
                  </div>
                </form>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <div className="api-search">
        <Search size={18} strokeWidth={1.7} />
        <input
          placeholder="Search keys..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="keys-grid">
        <div className="keys-header" role="row">
          <button className="keys-th" onClick={() => toggleSort('name')}>
            Name <SortIcon k="name" />
          </button>
          <button className="keys-th" onClick={() => toggleSort('status')}>
            Status <SortIcon k="status" />
          </button>
          <div className="keys-th-title">Secret key</div>
          <button className="keys-th" onClick={() => toggleSort('createdBy')}>
            Created by <SortIcon k="createdBy" />
          </button>
          <button className="keys-th" onClick={() => toggleSort('createdAt')}>
            Created <SortIcon k="createdAt" />
          </button>
          <div className="keys-th-spacer" aria-hidden />
        </div>

        {keys.map((key) => (
          <ApiKeyRow
            key={key.id}
            keyItem={key}
            menuOpen={menuFor === key.id}
            onMenuToggle={(open) => setMenuFor(open ? key.id : null)}
            onRevoke={() => {
              void revokeMutation.mutate(key.id);
              setMenuFor(null);
            }}
            onDelete={() => {
              void deleteMutation.mutate(key.id);
              setMenuFor(null);
            }}
          />
        ))}
        {keys.length === 0 && <div className="empty-row">No API keys yet.</div>}
      </div>

      <div className="api-keys-note">
        API keys are organization-scoped and remain active even after the creator is removed.
      </div>
    </div>
  );
}

function ApiKeyRow(props: {
  keyItem: ApiKeyItem;
  menuOpen: boolean;
  onMenuToggle: (open: boolean) => void;
  onRevoke: () => void;
  onDelete: () => void;
}) {
  const { keyItem: k, menuOpen, onMenuToggle, onRevoke, onDelete } = props;
  const user = useAuthStore((s) => s.user);
  const creatorName = user?.id === k.createdBy ? user.name : 'Unknown';
  const active = k.status === 'active';

  return (
    <div className="keys-row" role="row">
      <div className="keys-cell">
        <span className="key-name">{k.name}</span>
      </div>
      <div className="keys-cell">
        <span className={`status-pill ${active ? 'active' : 'revoked'}`}>{active ? 'Active' : 'Revoked'}</span>
      </div>
      <div className="keys-cell">
        <code className="secret-key">{maskKey(k.prefix, k.last4)}</code>
      </div>
      <div className="keys-cell">
        <span className="creator">{creatorName}</span>
      </div>
      <div className="keys-cell">
        <span className="created">{formatDate(k.createdAt)}</span>
      </div>
      <div className="keys-cell">
        <div className="row-menu">
          <button
            className="more-btn"
            onClick={(e) => {
              e.stopPropagation();
              onMenuToggle(!menuOpen);
            }}
            aria-label="Key actions"
          >
            <MoreHorizontal size={18} strokeWidth={1.7} />
          </button>
          {menuOpen && (
            <div className="key-menu">
              {active && (
                <button className="key-menu-item" onClick={onRevoke}>
                  Revoke key
                </button>
              )}
              <button className="key-menu-item danger" onClick={onDelete}>
                Delete key
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}