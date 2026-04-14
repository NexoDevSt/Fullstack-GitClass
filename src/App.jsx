import React, { useState, useEffect } from 'react';
import CollaboratorCard from './components/CollaboratorCard';
import './index.css';

// Importa dinámicamente todos los archivos JSON en la carpeta colaboradores usando Vite
const jsonFiles = import.meta.glob('./collaborators/*.json', { eager: true });

function App() {
  const [collaborators, setCollaborators] = useState([]);
  const [filter, setFilter] = useState('Todas');

  useEffect(() => {
    // Almacena los colaboradores excluyendo la plantilla
    const loadedCollaborators = Object.keys(jsonFiles)
      .filter(path => !path.includes('_plantilla.json'))
      .map(path => jsonFiles[path].default || jsonFiles[path]);

    setCollaborators(loadedCollaborators);
  }, []);

  const uniqueSections = [...new Set(collaborators.map(c => c.Seccion).filter(Boolean))].sort();
  const availableSections = ['Todas', ...uniqueSections];

  const filteredCollaborators = filter === 'Todas'
    ? collaborators
    : collaborators.filter(c => c.Seccion === filter || c.Seccion === "Profesor");

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Nuestros Colaboradores - Duoc UC</h1>
        <div className="course-info">
          <h2>Desarrollo FullStack III</h2>
          <p className="course-subtitle">Clase: Estrategias de Branching y Gestión de Componentes</p>
        </div>
        <p className="institutional-motto">Integridad, Calidad, y Espíritu de Servicio.</p>
        <div className="quote-container">
          <p className="inspiration-quote">
            "El código brillante se escribe en equipo. Cada rama es una idea y cada merge, un logro compartido."
          </p>
        </div>
      </header>

      <main className="app-main">
        {collaborators.length > 0 && (
          <div className="filter-container">
            <span className="filter-label">Filtrar por Sección:</span>
            <div className="filter-buttons">
              {availableSections.map(sec => (
                <button
                  key={sec}
                  className={`filter-btn ${filter === sec ? 'active' : ''}`}
                  onClick={() => setFilter(sec)}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="collaborators-grid">
          {filteredCollaborators.length > 0 ? (
            filteredCollaborators.map((collab, index) => (
              <CollaboratorCard key={index} data={collab} />
            ))
          ) : (
            <div className="empty-message">
              <p>No hay colaboradores para mostrar.</p>
              <p>¡Añade tu tarjeta mediante un Pull Request!</p>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Duoc UC - Clase de Git y Branching</p>
      </footer>
    </div>
  );
}

export default App;
