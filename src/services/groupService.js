// ============================================
// GROUP SERVICE - GESTION DES GROUPES
// ============================================
// Ce fichier contient toutes les fonctions pour:
// - Récupérer les groupes de Supabase
// - Créer un nouveau groupe
// - Supprimer un groupe
// - Modifier un groupe

// On importe le client Supabase qu'on a configuré
import { supabaseClient } from '../supabaseConfig';

// ============================================
// FONCTION 1: RÉCUPÉRER TOUS LES GROUPES
// ============================================
// Cette fonction va chercher tous les groupes dans la base de données
export const fetchGroups = async () => {
  try {
    // On demande à Supabase: "Donne-moi tous les groupes"
    // .from('groups') = on va chercher dans la table "groups"
    // .select('*') = on veut tous les champs
    const { data, error } = await supabaseClient
      .from('groups')
      .select('*');

    // Si y a une erreur, on la lance
    if (error) {
      console.error('Erreur lors de la récupération des groupes:', error);
      throw error;
    }

    // Sinon on retourne les données (la liste des groupes)
    return data;
  } catch (err) {
    console.error('Erreur:', err);
    return [];
  }
};

// ============================================
// FONCTION 2: CRÉER UN NOUVEAU GROUPE
// ============================================
// Cette fonction crée un groupe et le sauvegarde dans Supabase
export const createGroup = async (groupData) => {
  try {
    // groupData doit avoir:
    // - name: nom du groupe
    // - type: 'public' ou 'private'
    // - creator_id: ID de celui qui crée (optionnel pour l'instant)

    // On envoie les données à Supabase
    // .insert() = ajouter une nouvelle ligne dans la table
    const { data, error } = await supabaseClient
      .from('groups')
      .insert([groupData])
      .select(); // .select() retourne les données créées

    if (error) {
      console.error('Erreur lors de la création du groupe:', error);
      throw error;
    }

    // On retourne le groupe créé
    return data[0];
  } catch (err) {
    console.error('Erreur:', err);
    return null;
  }
};

// ============================================
// FONCTION 3: SUPPRIMER UN GROUPE
// ============================================
// Cette fonction supprime un groupe de la base de données
export const deleteGroup = async (groupId) => {
  try {
    // On dit à Supabase: "Supprime le groupe avec cet ID"
    // .delete() = supprimer
    // .eq('id', groupId) = où l'ID égale groupId
    const { error } = await supabaseClient
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      console.error('Erreur lors de la suppression du groupe:', error);
      throw error;
    }

    // Si pas d'erreur, on retourne true (succès)
    return true;
  } catch (err) {
    console.error('Erreur:', err);
    return false;
  }
};

// ============================================
// FONCTION 4: MODIFIER UN GROUPE
// ============================================
// Cette fonction modifie les infos d'un groupe
export const updateGroup = async (groupId, updatedData) => {
  try {
    // On dit à Supabase: "Mets à jour ce groupe"
    // .update() = modifier
    // .eq('id', groupId) = le groupe avec cet ID
    const { data, error } = await supabaseClient
      .from('groups')
      .update(updatedData)
      .eq('id', groupId)
      .select();

    if (error) {
      console.error('Erreur lors de la modification du groupe:', error);
      throw error;
    }

    return data[0];
  } catch (err) {
    console.error('Erreur:', err);
    return null;
  }
};

// ============================================
// RÉSUMÉ:
// ============================================
// Ces fonctions sont comme des "ponts" entre React et Supabase
//
// Dans Dashboard.jsx, au lieu de stocker les groupes en dur avec useState,
// on va utiliser:
// - fetchGroups() pour charger les groupes au démarrage
// - createGroup() quand on crée un nouveau groupe
// - deleteGroup() quand on supprime
// - updateGroup() quand on modifie
//
// Comme ça, tout est sauvegardé dans la vraie base de données!