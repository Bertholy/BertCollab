 <nav className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/80">
        {/* Conteneur max-width pour limiter la largeur sur les grands écrans */}
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* LOGO + TITRE A GAUCHE */}
          <div className="flex items-center gap-3">
            {/* Carré avec dégradé cyan->bleu contenant la lettre "B" */}
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            {/* Le titre "BertCollab" */}
            <h1 className="text-2xl font-bold text-white">BertCollab</h1>
          </div>
          
          {/* BOUTON DÉCONNEXION A DROITE */}
          <button className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white transition">
            {/* L'icône de déconnexion */}
            <LogOut size={18} />
            {/* Le texte "Déconnexion" */}
            <span>Déconnexion</span>
          </button>
        </div>
      </nav>

      {/* ============================================
          CONTENU PRINCIPAL
          ============================================ */}
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* TITRE ET SOUS-TITRE */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-3">Mes Groupes de Collaboration</h2>
          <p className="text-slate-400">Gérez vos documents en temps réel avec votre équipe</p>
        </div>

        {/* ============================================
            BOUTON "CRÉER UN NOUVEAU GROUPE"
            ============================================ */}
        
        <button
          // Quand on clique, on fait l'inverse de showForm (si true -> false, si false -> true)
          onClick={() => setShowForm(!showForm)}
          className="mb-8 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition transform hover:scale-105"
        >
          {/* L'icône "+" */}
          <Plus size={20} />
          {/* Le texte du bouton */}
          Créer un nouveau groupe
        </button>

        {/* ============================================
            FORMULAIRE DE CRÉATION DE GROUPE
            ============================================ */}
        
        {/* Ce formulaire ne s'affiche QUE si showForm === true */}
        {showForm && (
          <div className="mb-8 p-6 bg-slate-800/50 border border-slate-700/50 rounded-lg backdrop-blur-sm">
            {/* Le formulaire */}
            <form onSubmit={handleCreateGroup} className="space-y-4">
              
              {/* ---- CHAMP NOM DU GROUPE ---- */}
              <div>
                {/* Le label (étiquette) */}
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nom du groupe
                </label>
                {/* L'input pour écrire le nom */}
                <input
                  type="text"
                  // La valeur de l'input = ce qu'on a dans formData.name
                  value={formData.name}
                  // Quand on tape, on met à jour formData.name
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Équipe Design..."
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
              
              {/* ---- CHOIX DU TYPE (PUBLIC/PRIVÉ) ---- */}
              <div>
                {/* Le label */}
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Type de groupe
                </label>
                {/* Les deux options (radio buttons) */}
                <div className="flex gap-4">
                  
                  {/* OPTION 1: PUBLIC */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="public"
                      // Vérifier si c'est sélectionné
                      checked={formData.type === 'public'}
                      // Quand on clique, mettre à jour le type
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-4 h-4"
                    />
                    {/* L'icône globe pour "public" */}
                    <Globe size={18} className="text-slate-400" />
                    {/* Le texte */}
                    <span className="text-slate-300">Public</span>
                  </label>
                  
                  {/* OPTION 2: PRIVÉ */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="private"
                      // Vérifier si c'est sélectionné
                      checked={formData.type === 'private'}
                      // Quand on clique, mettre à jour le type
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-4 h-4"
                    />
                    {/* L'icône cadenas pour "privé" */}
                    <Lock size={18} className="text-slate-400" />
                    {/* Le texte */}
                    <span className="text-slate-300">Privé</span>
                  </label>
                </div>
              </div>
              
              {/* ---- LES BOUTONS DU FORMULAIRE ---- */}
              <div className="flex gap-3">
                {/* Bouton "Créer" */}
                <button
                  type="submit"  // Quand on clique, ça appelle handleCreateGroup
                  className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition"
                >
                  Créer
                </button>
                {/* Bouton "Annuler" */}
                <button
                  type="button"  // Bouton normal (pas submit)
                  onClick={() => setShowForm(false)}  // Cacher le formulaire
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================
            GRILLE D'AFFICHAGE DES GROUPES
            ============================================ */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* .map() = pour chaque groupe, afficher une carte */}
          {groups.map((group) => (
            // Cette carte s'affiche pour chaque groupe
            <div
              key={group.id}  // La clé unique (important pour React)
              className="group p-6 bg-slate-800/40 border border-slate-700/50 rounded-lg hover:border-slate-600 hover:bg-slate-800/60 transition cursor-pointer backdrop-blur-sm"
            >
              {/* ---- HAUT DE LA CARTE: NOM + BOUTON DELETE ---- */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  {/* Le nom du groupe */}
                  <h3 className="text-xl font-bold text-white mb-2">{group.name}</h3>
                  {/* L'icône et le texte du type (PUBLIC ou PRIVÉ) */}
                  <div className="flex items-center gap-2">
                    {/* SI c'est public */}
                    {group.type === 'public' ? (
                      <>
                        <Globe size={16} className="text-cyan-400" />
                        <span className="text-sm text-cyan-400">Public</span>
                      </>
                    ) : (
                      // SINON c'est privé
                      <>
                        <Lock size={16} className="text-amber-400" />
                        <span className="text-sm text-amber-400">Privé</span>
                      </>
                    )}
                  </div>
                </div>
                {/* Bouton pour supprimer le groupe */}
                <button
                  // Quand on clique, supprimer le groupe avec cet ID
                  onClick={() => deleteGroup(group.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition"
                >
                  {/* L'icône poubelle */}
                  <Trash2 size={18} />
                </button>
              </div>

              {/* ---- INFOS DU GROUPE: MEMBRES ET DOCUMENTS ---- */}
              <div className="space-y-3 pt-4 border-t border-slate-700/50">
                {/* Info: nombre de membres */}
                <div className="flex items-center gap-2 text-slate-400">
                  <Users size={16} />
                  <span className="text-sm">
                    {group.members} membre{group.members > 1 ? 's' : ''}
                    {/* Si plus d'un membre, ajouter 's' à "membre" */}
                  </span>
                </div>
                {/* Info: nombre de documents */}
                <div className="text-slate-400 text-sm">
                  📄 {group.documents} document{group.documents !== 1 ? 's' : ''}
                  {/* Si pas 1 document, ajouter 's' à "document" */}
                </div>
              </div>

              {/* ---- BOUTON "OUVRIR LE GROUPE" ---- */}
              <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/40 hover:to-blue-500/40 text-cyan-400 font-semibold rounded-lg transition border border-cyan-500/50">
                Ouvrir le groupe
              </button>
            </div>
          ))}
        </div>

        {/* ============================================
            MESSAGE SI AUCUN GROUPE
            ============================================ */}
        
        {/* Afficher ce message seulement si groups est vide */}
        {groups.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">
              Aucun groupe pour le moment. Créez-en un pour commencer!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


