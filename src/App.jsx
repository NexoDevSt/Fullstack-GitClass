import React, { useState, useEffect } from 'react';
import CollaboratorCard from './components/CollaboratorCard';
import './index.css';
import { useRef } from 'react';

// Importa dinámicamente todos los archivos JSON en la carpeta colaboradores usando Vite
const jsonFiles = import.meta.glob('./collaborators/*.json', { eager: true });

function App() {
  const canvasRef = useRef(null);
  const [collaborators, setCollaborators] = useState([]);
  const [filter, setFilter] = useState('Todas');
  const [visibleLogs, setVisibleLogs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showTerminal, setShowTerminal] = useState(true);


  useEffect(() => {
    // Extraemos los valores y nos aseguramos de que existan
    const loadedCollaborators = Object.keys(jsonFiles)
      .filter(path => !path.includes('_plantilla.json'))
      .map(path => jsonFiles[path].default || jsonFiles[path]);

    setCollaborators(loadedCollaborators);

    const sequence = ["> iniciando sistema...", "> cargando colaboradores..."];

    // Usamos encadenamiento opcional (?.) para evitar el error de 'undefined'
    loadedCollaborators.forEach((c) => {
      if (c?.nombre_completo) {
        sequence.push(`> cargando: ${c.nombre_completo} ✔`);
      }
    });

    sequence.push(
      "> validando commits...",
      "> sincronizando repositorio...",
      "✔ ACCESO CONCEDIDO",
      "> renderizando interfaz..."
    );

    setLogs(sequence);
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = canvas.parentElement.offsetHeight;

    const letters = "01";
    const fontSize = 12;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 40, 85, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#FFB81C";
      ctx.font = fontSize + "px monospace";

      drops.forEach((y, i) => {
        const text = letters[Math.floor(Math.random() * letters.length)];
        const x = i * fontSize;

        ctx.fillText(text, x, y * fontSize);

        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      });
    };

    const interval = setInterval(draw, 60);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logs.length === 0) return;

    let i = 0;

    const interval = setInterval(() => {
      if (i >= logs.length) {
        clearInterval(interval);

        setTimeout(() => {
          setShowTerminal(false);
        }, 1500);

        return;
      }

      setVisibleLogs((prev) => [...prev, logs[i]]);
      i++;
    }, 50);

    return () => clearInterval(interval);
  }, [logs]);

  const uniqueSections = [...new Set(collaborators.map(c => c.Seccion).filter(Boolean))].sort();
  const availableSections = ['Todas', ...uniqueSections];

  const filteredCollaborators = filter === 'Todas'
    ? collaborators
    : collaborators.filter(c => c.Seccion === filter || c.Seccion === "Profesor");

  return (
    <div className="app-container">

      <header className="app-header matrix-enhanced">
        <canvas ref={canvasRef} id="matrixCanvas" />
        <h1 className="glow-title">
          Aquí se forjan los mejores desarrolladores FullStack
        </h1>

        <div className="course-info">
          <h2>Generación 2026 · Duoc UC</h2>
          <p className="course-subtitle">
            Desarrollo FullStack III — Estrategias de Branching y Gestión de Componentes
          </p>
        </div>

        <p className="institutional-motto">
          Código, disciplina y trabajo en equipo.
        </p>

        <div className="quote-container">
          <p className="inspiration-quote">
            "Cada commit cuenta una historia. Cada merge construye el legado."
          </p>
        </div>
      </header>
      <main className="app-main">

        {showTerminal ? (
          <div className="terminal-fullscreen">
            <div className="terminal-container">
              {visibleLogs.map((line, index) => {
                // Verificación ultra-segura
                const isSuccess = line && typeof line === 'string' && line.includes("ACCESO");

                return (
                  <p
                    key={`log-${index}`}
                    className={`terminal-line ${isSuccess ? "success" : ""}`}
                  >
                    {line || ""}
                  </p>
                );
              })}
            </div>
          </div>
        ) : (
          <>
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

            <div className="collaborators-grid fade-in">
              {filteredCollaborators.length > 0 ? (
                filteredCollaborators.map((collab, index) => (
                  <CollaboratorCard
                    key={collab.usuario_github}
                    data={collab}
                  />))
              ) : (
                <div className="empty-message">
                  <p>No hay colaboradores para mostrar.</p>
                  <p>¡Añade tu tarjeta mediante un Pull Request!</p>
                </div>
              )}
            </div>
          </>
        )}

      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Duoc UC - Clase de Git y Branching</p>
      </footer>
    </div>
  );
}

export default App;
