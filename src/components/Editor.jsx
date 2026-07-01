// ============================================
// NOUVEAU: Import du service de documents
// ============================================
import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  createDocument,
  getGroupDocuments,
  saveDocumentContent,
  deleteDocument,
} from '../services/documentService';
import './Editor.css';
import AppHeader from './AppHeader';


// ============================================
// NOUVEAU: Import Socket.io
// ============================================
import {
  connectSocket,
  joinRoom,
  leaveRoom,
  sendTextUpdate,
} from '../services/socketService';

import Sidebar from './Sidebar';

export default function Editor({ groupId, groupName, onBack, user }) {
  // Documents (sidebar)
  const [documents, setDocuments] = useState([]);
  const [activeDocumentId, setActiveDocumentId] = useState(null);

  // Contenu (fallback: localStorage, source principale: Supabase documents)
  const [documentId, setDocumentId] = useState(null);
  const [documentContent, setDocumentContent] = useState('');

  // Presence (placeholder pour la démo)
  // IMPORTANT: le nom affiché ne doit pas dépendre d'un état “changeant” après refresh.
  // On fixe le pseudo utilisateur via un identifiant stable (id) stocké en cache.
  const stableSelf = useMemo(() => {
    const userId = user?.id ?? user?.email ?? 'anonymous';
    const cacheKey = `bertcollab_user_display_${userId}`;

    try {
      const saved = localStorage.getItem(cacheKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }

    const displayName = user?.username || user?.email || 'Anonyme';
    const value = { id: userId, name: displayName };

    try {
      localStorage.setItem(cacheKey, JSON.stringify(value));
    } catch {
      // ignore
    }

    return value;
  }, [user]);

  const users = useMemo(() => {
    // Seed simple basé sur groupId pour que la liste soit cohérente par groupe
    const seed = String(groupId ?? '0');
    const colors = ['#4f46e5', '#06b6d4', '#22c55e', '#f97316', '#e11d48', '#a855f7'];

    const base = [
      { id: `u1_${seed}`, name: 'Alice' },
      { id: `u2_${seed}`, name: 'Yanis' },
      { id: `u3_${seed}`, name: 'Mina' },
      { id: `u4_${seed}`, name: 'Samir' },
    ];

    // On varie un peu selon le groupId (toujours déterministe)
    const offset = seed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % base.length;
    const rotated = [...base.slice(offset), ...base.slice(0, offset)];

    // On remplace un slot par l'utilisateur courant (nom stable)
    const list = rotated.slice(0, 3).map((u, idx) => ({
      ...u,
      color: colors[idx % colors.length],
    }));

    if (stableSelf?.name) {
      const idxToReplace = 0; // stable
      list[idxToReplace] = {
        id: stableSelf.id,
        name: stableSelf.name,
        color: list[idxToReplace]?.color ?? colors[0],
      };
    }

    return list;
  }, [groupId, stableSelf]);


  // Throttle
  const saveTimerRef = useRef(null);
  const lastSavedContentRef = useRef('');
  const lastSentContentRef = useRef('');

  const localKey = useMemo(() => `doc_${groupId}`, [groupId]);

  // Fallback immédiat
  useEffect(() => {
    const savedContent = localStorage.getItem(localKey);
    if (savedContent) setDocumentContent(savedContent);
  }, [localKey]);

  // Sync entre onglets (fallback)
  useEffect(() => {
    const handleStorageUpdate = (event) => {
      const expectedPrefix = `doc_sync_${groupId}_`;
      if (!event.key?.startsWith(expectedPrefix) || !event.newValue) return;

      try {
        const payload = JSON.parse(event.newValue);
        // Synchroniser seulement si on est sur le même document actif
        if (payload?.roomId === groupId && (payload?.documentId ?? null) === (activeDocumentId ?? null)) {
          setDocumentContent(payload.content ?? '');
        }
      } catch (err) {
        console.error('Erreur parse doc_sync payload:', err);
      }
    };

    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, [groupId, activeDocumentId]);

  // Charger la liste des documents du groupe
  useEffect(() => {
    let cancelled = false;

    const loadDocs = async () => {
      try {
        const docs = await getGroupDocuments(groupId);
        if (cancelled) return;

        setDocuments(docs ?? []);

        // Document actif: le premier, ou on le crée
        if ((docs ?? []).length === 0) {
          const created = await createDocument(groupId, 'Document principal');
          if (cancelled) return;
          const updatedDocs = await getGroupDocuments(groupId);
          setDocuments(updatedDocs ?? []);
          setActiveDocumentId(created?.id ?? null);
        } else {
          setActiveDocumentId((docs?.[0] ?? null)?.id ?? null);
        }
      } catch (err) {
        console.warn('Supabase documents load failed; fallback localStorage', err);
      }
    };

    loadDocs();

    return () => {
      cancelled = true;
    };
  }, [groupId]);

  // Charger le contenu du document actif
  useEffect(() => {
    if (!activeDocumentId) return;

    const loadActiveDoc = async () => {
      try {
        const docs = await getGroupDocuments(groupId);
        const active = (docs ?? []).find((d) => d.id === activeDocumentId) ?? null;

        if (!active) {
          // S’il n’existe plus (supprimé en parallèle), on bascule sur le premier
          const fallback = (docs ?? [])[0] ?? null;
          setActiveDocumentId(fallback?.id ?? null);
          return;
        }

        setDocumentId(active.id);
        const content = active.content ?? '';
        setDocumentContent(content);
        lastSavedContentRef.current = content;
        localStorage.setItem(localKey, content);
      } catch (err) {
        console.warn('Supabase load active document failed; fallback localStorage', err);
      }
    };

    loadActiveDoc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDocumentId, groupId, localKey]);

  // Socket: synchro texte seulement (on NE fait plus de présence/connected users côté UI)
  useEffect(() => {
    const socket = connectSocket();

    const handleTextUpdate = (data) => {
      if (data?.roomId !== groupId) return;
      const content = data?.content ?? '';
      setDocumentContent(content);
      localStorage.setItem(localKey, content);
      lastSavedContentRef.current = content;
    };

    socket?.on('text-update', handleTextUpdate);

    // On rejoint la salle pour recevoir les updates de texte.
    // On envoie aussi user (id + username) pour éviter le bug après refresh.
    joinRoom(groupId, user);

    return () => {
      socket?.off('text-update', handleTextUpdate);
      leaveRoom(groupId);
    };
  }, [groupId, localKey, user]);


  const refreshDocuments = async () => {
    const docs = await getGroupDocuments(groupId);
    setDocuments(docs ?? []);
    return docs ?? [];
  };

  const handleAddDocument = async () => {
    const title = window.prompt('Nom du document :', 'Nouveau document');
    if (!title || !title.trim()) return;

    const created = await createDocument(groupId, title.trim());
    const docs = await refreshDocuments();

    const newActiveId = created?.id ?? docs?.[0]?.id ?? null;
    setActiveDocumentId(newActiveId);
  };

  const handleDeleteDocument = async (docId) => {
    const ok = window.confirm('Supprimer ce document ?');
    if (!ok) return;

    const success = await deleteDocument(docId);
    if (!success) return;

    const docs = await refreshDocuments();

    if (activeDocumentId === docId) {
      const next = (docs ?? []).find((d) => d.id !== docId) ?? (docs ?? [])[0] ?? null;
      setActiveDocumentId(next?.id ?? null);
      if (!next) {
        const created = await createDocument(groupId, 'Document principal');
        await refreshDocuments();
        setActiveDocumentId(created?.id ?? null);
      }
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setDocumentContent(newContent);

    // cache + sync fallback (AJOUT: synchronisation onglets basée sur document)
    localStorage.setItem(localKey, newContent);
    const syncKey = `doc_sync_${groupId}_${activeDocumentId ?? 'none'}`;
    localStorage.setItem(
      syncKey,
      JSON.stringify({ roomId: groupId, documentId: activeDocumentId ?? null, content: newContent, timestamp: Date.now() })
    );

      // socket: throttle simple
      if (newContent !== lastSentContentRef.current) {
        lastSentContentRef.current = newContent;
        // IMPORTANT: garder la synchro “comme avant” côté socket.
        // On n'ajoute PAS documentId au protocole socket.
        // Le filtrage onglets se fait via le fallback localStorage.
        sendTextUpdate(groupId, newContent);
      }

    // Supabase save: throttle + si documentId OK
    if (!documentId) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      if (lastSavedContentRef.current === newContent) return;

      try {
        const res = await saveDocumentContent(documentId, newContent);
        lastSavedContentRef.current = res?.content ?? newContent;
      } catch (err) {
        console.warn('Supabase saveDocumentContent failed; keep local cache', err);
      }
    }, 800);
  };

  return (
    <div className="editor-container">
      <AppHeader user={user} />

      {/* HEADER */}
      <div className="editor-header">

        <div className="header-left">
          <button onClick={onBack} className="btn-back">
            ← Retour
          </button>
          <h1 className="editor-title">{groupName}</h1>
        </div>
        <div className="header-right">
          <div className="users-online">
            {users.map((user) => (
              <div
                key={user.id}
                className="user-avatar"
                style={{ backgroundColor: user.color }}
                title={user.name}
              >
                {user.name.charAt(0)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ZONE D'ÉDITION */}
      <div className="editor-main">
        <div className="editor-left-docs">
          <Sidebar
            documents={documents}
            activeDocumentId={activeDocumentId}
            onSelectDocument={(docId) => setActiveDocumentId(docId)}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        </div>

        <textarea
          className="editor-textarea"
          value={documentContent}
          onChange={handleContentChange}
          placeholder="Commencez à taper votre document ici..."
        />

        <div className="editor-sidebar">
          <h3 className="sidebar-title">Utilisateurs connectés</h3>
          <div className="users-bar" aria-label="Utilisateurs connectés">
            {users.length === 0 ? (
              <div className="users-bar-empty">Personne n’est connecté</div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="users-bar-item" title={user.name}>
                  <div className="users-bar-avatar" style={{ backgroundColor: user.color }}>
                    {user.name.charAt(0)}
                  </div>
                  <span className="users-bar-name">{user.name}</span>
                </div>
              ))
            )}
          </div>

          <h3 className="sidebar-title" style={{ marginTop: '2rem' }}>
            Infos du document
          </h3>
          <div className="document-stats">
            <div className="stat">
              <span className="stat-label">Mots:</span>
              <span className="stat-value">
                {documentContent.split(/\s+/).filter((w) => w.length > 0).length}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Caractères:</span>
              <span className="stat-value">{documentContent.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Lignes:</span>
              <span className="stat-value">{documentContent.split('\n').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="editor-footer">
        <span className="status">Sauvegarde automatique activée</span>
        <button
          className="btn-save"
          type="button"
          onClick={() => {
            // La sauvegarde est automatique via throttle Supabase.
            // Ce bouton reste présent pour l'UI.
          }}
        >
          💾 Sauvegarder
        </button>
      </div>
    </div>
  );
}
