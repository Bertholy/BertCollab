import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Globe, Lock, Trash2, Users } from 'lucide-react';
import { fetchGroups, createGroup, deleteGroup } from '../services/groupService.js';

export default function Donner() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'public' });
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const loadGroups = async () => {
      const data = await fetchGroups();
      setGroups(data);
    };

    loadGroups();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Le nom du groupe est requis.');
      return;
    }

    const newGroupData = {
      name: formData.name,
      type: formData.type,
      creator_id: null,
      members: 1,
      documents: 0,
    };

    const createdGroup = await createGroup(newGroupData);
    if (!createdGroup) {
      alert('Erreur lors de la création du groupe. Voir la console.');
      return;
    }

    setGroups((prevGroups) => [...prevGroups, createdGroup]);
    setFormData({ name: '', type: 'public' });
    setShowForm(false);
  };

  const handleDeleteGroup = async (id) => {
    const success = await deleteGroup(id);

    if (success) {
      setGroups((prevGroups) => prevGroups.filter((group) => group.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <h1 className="text-2xl font-bold text-white">BertCollab</h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white transition">
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-3">Mes Groupes de Collaboration</h2>
          <p className="text-slate-400">Gérez vos documents en temps réel avec votre équipe</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-8 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition transform hover:scale-105"
        >
          <Plus size={20} />
          Créer un nouveau groupe
        </button>

        {showForm && (
          <div className="mb-8 p-6 bg-slate-800/50 border border-slate-700/50 rounded-lg backdrop-blur-sm">
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nom du groupe</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Équipe Design..."
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Type de groupe</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="public"
                      checked={formData.type === 'public'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-4 h-4"
                    />
                    <Globe size={18} className="text-slate-400" />
                    <span className="text-slate-300">Public</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="private"
                      checked={formData.type === 'private'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-4 h-4"
                    />
                    <Lock size={18} className="text-slate-400" />
                    <span className="text-slate-300">Privé</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition">
                  Créer
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="group p-6 bg-slate-800/40 border border-slate-700/50 rounded-lg hover:border-slate-600 hover:bg-slate-800/60 transition backdrop-blur-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{group.name}</h3>
                  <div className="flex items-center gap-2">
                    {group.type === 'public' ? (
                      <>
                        <Globe size={16} className="text-cyan-400" />
                        <span className="text-sm text-cyan-400">Public</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} className="text-amber-400" />
                        <span className="text-sm text-amber-400">Privé</span>
                      </>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDeleteGroup(group.id)} className="opacity-0 group-hover:opacity-100 p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition">
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400">
                  <Users size={16} />
                  <span className="text-sm">{group.members} membre{group.members > 1 ? 's' : ''}</span>
                </div>
                <div className="text-slate-400 text-sm">📄 {group.documents} document{group.documents !== 1 ? 's' : ''}</div>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/40 hover:to-blue-500/40 text-cyan-400 font-semibold rounded-lg transition border border-cyan-500/50">
                Ouvrir le groupe
              </button>
            </div>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">Aucun groupe pour le moment. Créez-en un pour commencer!</p>
          </div>
        )}
      </div>
    </div>
  );
}
