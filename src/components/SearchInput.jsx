import React, { useState, useEffect, useCallback } from 'react';

const API_KEY = import.meta.env.PUBLIC_TMDB_API_KEY;
const API_BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE_URL = "https://image.tmdb.org/t/p/w200"; // Usamos w200 para previews

export function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para obtener sugerencias con "debounce"
  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 3) { // Solo buscar si hay al menos 3 caracteres
      setSuggestions([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${query}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSuggestions(data.results.slice(0, 5)); // Mostrar solo las 5 primeras
    } catch (err) {
      console.error("Error fetching search suggestions:", err);
      setError("Error al buscar sugerencias.");
    } finally {
      setLoading(false);
    }
  }, [API_KEY]);

  // Hook para debounce: solo llama a fetchSuggestions después de un retraso
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 500); // Espera 500ms después de que el usuario deja de escribir

    return () => {
      clearTimeout(handler); // Limpia el temporizador si el usuario sigue escribiendo
    };
  }, [searchTerm, fetchSuggestions]);

  // Manejador del cambio en el input
  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Manejador del submit del formulario (para la búsqueda final)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form-interactive">
      <div className="input-wrapper">
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder="Busca una película..."
          aria-label="Buscar película"
        />
        <button type="submit">🔍</button>
      </div>

      {loading && <div className="suggestions-status">Cargando...</div>}
      {error && <div className="suggestions-error">{error}</div>}

      {suggestions.length > 0 && !loading && (
        <ul className="suggestions-list">
          {suggestions.map((movie) => (
            <li key={movie.id} className="suggestion-item">
              <a href={`/movie/${movie.id}`}>
                {movie.poster_path ? (
                  <img src={`${IMG_BASE_URL}${movie.poster_path}`} alt={`Póster de ${movie.title}`} />
                ) : (
                  <div className="placeholder-thumb"></div>
                )}
                <div className="suggestion-info">
                  <span>{movie.title}</span>
                  {movie.release_date && <small>({new Date(movie.release_date).getFullYear()})</small>}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}