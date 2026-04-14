import React from 'react';

const CollaboratorCard = ({ data }) => {
  const { nombre_completo, usuario_github, comentario_libre, color, Seccion } = data;
  const avatarUrl = `https://github.com/${usuario_github}.png`;
  const githubUrl = `https://github.com/${usuario_github}`;

  // Color de acento proporcionado por el estudiante, sino usamos el amarillo de Duoc como fallback
  const customStyle = color ? { backgroundColor: color } : {};

  return (
    <div className="collaborator-card" style={{ borderColor: color, borderWidth: color ? '2px' : '0', borderStyle: 'solid' }}>
      <div className="card-accent" style={customStyle}></div>
      {Seccion && <div className="card-watermark">{Seccion}</div>}
      <img
        src={avatarUrl}
        alt={`Avatar de ${nombre_completo}`}
        className="card-avatar"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
        }}
      />
      <div className="card-content">
        <h3 className="card-title">{nombre_completo}</h3>
        <p className="card-bio">{comentario_libre}</p>
        <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="card-cta">
          Ver Perfil de GitHub
        </a>
      </div>
    </div>
  );
};

export default CollaboratorCard;
