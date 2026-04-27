// ============================================
// DOCUMENT SERVICE - GESTION DES DOCUMENTS
// ============================================
// Ce fichier contient toutes les fonctions pour:
// - Créer un document
// - Récupérer un document
// - Sauvegarder le contenu d'un document
// - Supprimer un document

import { supabaseClient } from '../supabaseConfig';

// ============================================
// FONCTION 1: CRÉER UN DOCUMENT
// ============================================
// Crée un nouveau document vide dans un groupe
export const createDocument = async (groupId, title = 'Sans titre') => {
  try {
    // On envoie les données du nouveau document à Supabase
    const { data, error } = await supabaseClient
      .from('documents')
      .insert([
        {
          group_id: groupId,     // Le groupe auquel appartient ce doc
          title: title,          // Titre du document
          content: '',           // Au début, le contenu est vide
          last_edited_by: null,  // Personne ne l'a édité encore
        }
      ])
      .select();

    if (error) {
      console.error('Erreur lors de la création du document:', error);
      throw error;
    }

    return data[0];
  } catch (err) {
    console.error('Erreur:', err);
    return null;
  }
};

// ============================================
// FONCTION 2: RÉCUPÉRER LES DOCUMENTS D'UN GROUPE
// ============================================
// Va chercher tous les documents d'un groupe
export const getGroupDocuments = async (groupId) => {
  try {
    // On dit à Supabase: "Donne-moi tous les documents où group_id = groupId"
    const { data, error } = await supabaseClient
      .from('documents')
      .select('*')
      .eq('group_id', groupId);  // .eq = égal à

    if (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Erreur:', err);
    return [];
  }
};

// ============================================
// FONCTION 3: RÉCUPÉRER UN DOCUMENT
// ============================================
// Va chercher UN document spécifique
export const getDocument = async (documentId) => {
  try {
    const { data, error } = await supabaseClient
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();  // .single() = retourner un seul document, pas un array

    if (error) {
      console.error('Erreur lors de la récupération du document:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Erreur:', err);
    return null;
  }
};

// ============================================
// FONCTION 4: SAUVEGARDER LE CONTENU
// ============================================
// Sauvegarde le contenu du document
// C'est CETTE FONCTION qu'on va appeler quand l'utilisateur tape!
export const saveDocumentContent = async (documentId, content, userId = null) => {
  try {
    // On met à jour le document avec le nouveau contenu
    const { data, error } = await supabaseClient
      .from('documents')
      .update({
        content: content,           // Le nouveau contenu
        last_edited_by: userId,     // Qui a édité
        updated_at: new Date(),     // Quand c'est modifié
      })
      .eq('id', documentId)
      .select();

    if (error) {
      console.error('Erreur lors de la sauvegarde du document:', error);
      throw error;
    }

    return data[0];
  } catch (err) {
    console.error('Erreur:', err);
    return null;
  }
};

// ============================================
// FONCTION 5: SUPPRIMER UN DOCUMENT
// ============================================
// Supprime un document
export const deleteDocument = async (documentId) => {
  try {
    const { error } = await supabaseClient
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      console.error('Erreur lors de la suppression du document:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('Erreur:', err);
    return false;
  }
};

// ============================================
// RÉSUMÉ:
// ============================================
// Ces fonctions permettent de:
// 1. Créer des documents vides dans un groupe
// 2. Récupérer les documents d'un groupe
// 3. Récupérer UN document spécifique
// 4. Sauvegarder le contenu (LA PLUS IMPORTANTE!)
// 5. Supprimer un document
//
// Pour l'édition temps réel, on va appeler saveDocumentContent()
// chaque fois que l'utilisateur tape quelque chose!