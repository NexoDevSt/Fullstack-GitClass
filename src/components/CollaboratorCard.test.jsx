import { render, screen } from '@testing-library/react';
import CollaboratorCard from './CollaboratorCard';
import { describe, it, expect } from 'vitest';

describe('CollaboratorCard', () => {
  const mockData = {
    nombre_completo: 'Test User',
    usuario_github: 'testuser123',
    comentario_libre: 'This is a test bio.',
    color: '#123456',
    Seccion: '003D'
  };

  it('renders collaborator information correctly', () => {
    render(<CollaboratorCard data={mockData} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('This is a test bio.')).toBeInTheDocument();
    expect(screen.getByText('003D')).toBeInTheDocument();
    
    const link = screen.getByRole('link', { name: /ver perfil de github/i });
    expect(link).toHaveAttribute('href', 'https://github.com/testuser123');
  });

  it('generates the correct avatar URL', () => {
    render(<CollaboratorCard data={mockData} />);
    
    const avatar = screen.getByAltText('Avatar de Test User');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://github.com/testuser123.png');
  });

  it('applies custom color correctly', () => {
    const { container } = render(<CollaboratorCard data={mockData} />);
    
    const card = container.querySelector('.collaborator-card');
    const accentLine = container.querySelector('.card-accent');
    
    expect(card).toHaveStyle('border-color: #123456');
    expect(accentLine).toHaveStyle('background-color: #123456');
  });
  
  it('does not apply custom borders if color is missing', () => {
    const dataWithoutColor = { ...mockData, color: undefined };
    const { container } = render(<CollaboratorCard data={dataWithoutColor} />);
    
    const card = container.querySelector('.collaborator-card');
    expect(card).toHaveStyle('border-width: 0');
  });
});
