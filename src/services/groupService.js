// ============================================
// GROUP SERVICE - GESTION DES GROUPES
// ============================================
// Ce fichier contient toutes les fonctions pour:
// - Récupérer les groupes de Supabase
// - Créer un nouveau groupe
// - Supprimer un groupe
// - Retourner à localStorage si Supabase est inaccessible

import { supabaseClient } from '../supabaseConfig';

const LOCAL_STORAGE_KEY = 'bertcollab_groups';

const getLocalGroups = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Erreur lecture localStorage groupes :', err);
    return [];
  }
};

const saveLocalGroups = (groups) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(groups));
  } catch (err) {
    console.error('Erreur écriture localStorage groupes :', err);
  }
};

// ============================================
// FONCTION 1: RÉCUPÉRER TOUS LES GROUPES
// ============================================
export const fetchGroupsFromSupabaseOnly = async () => {
  const { data, error } = await supabaseClient
    .from('groups')
    .select('*');

  if (error) throw error;
  return data ?? [];
};

// Gardé pour compatibilité (utilise Supabase-only pour éviter la divergence onglets)
export const fetchGroups = async () => {
  return fetchGroupsFromSupabaseOnly();
};

// ============================================
// FONCTION 2: CRÉER UN NOUVEAU GROUPE
// ============================================
export const createGroup = async (groupData) => {
  try {
    const { data, error } = await supabaseClient
      .from('groups')
      .insert([groupData])
      .select();

    if (error) {
      console.warn('Supabase createGroup failed, fallback to localStorage', error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('Aucun groupe créé par Supabase');
    }

    const createdGroup = data[0];
    const savedGroups = [...getLocalGroups(), createdGroup];
    saveLocalGroups(savedGroups);
    return createdGroup;
  } catch (err) {
    const fallbackGroup = {
      ...groupData,
      id: Date.now().toString(),
      members: groupData.members ?? 1,
      documents: groupData.documents ?? 0,
      created_at: new Date().toISOString(),
    };
    const savedGroups = [...getLocalGroups(), fallbackGroup];
    saveLocalGroups(savedGroups);
    return fallbackGroup;
  }
};

// ============================================
// FONCTION 3: SUPPRIMER UN GROUPE
// ============================================
export const deleteGroup = async (groupId) => {
  try {
    const { error } = await supabaseClient
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      console.warn('Supabase deleteGroup failed, fallback to localStorage', error);
      throw error;
    }

    const groups = getLocalGroups().filter((group) => group.id !== groupId);
    saveLocalGroups(groups);
    return true;
  } catch (err) {
    console.warn('Erreur deleteGroup, fallback to localStorage :', err);
    const groups = getLocalGroups().filter((group) => group.id !== groupId);
    saveLocalGroups(groups);
    return true;
  }
};
