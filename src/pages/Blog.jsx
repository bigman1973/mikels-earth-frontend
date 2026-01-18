import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Loader2, BookOpen } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://mikels-earth-backend-production.up.railway.app';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/blog/posts?page=${currentPage}&per_page=6`);
      
      if (!response.ok) {
        throw new Error('Error al cargar los posts');
      }
      
      const data = await response.json();
      setPosts(data.posts || []);
      setTotalPages(data.pages || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('No se pudieron cargar las noticias. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Imagen por defecto si no hay featured_image
  const getImageUrl = (post) => {
    if (post.featured_image) return post.featured_image;
    // Imagen placeholder con colores de Mikel's
    return `https://placehold.co/600x400/CD545B/ffffff?text=${encodeURIComponent(post.title.substring(0, 20))}`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mikels-red-10)' }}>
      {/* Hero Section */}
      <section className="py-16 md:py-20" style={{ backgroundColor: 'var(--mikels-red-10)' }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-8 h-8" style={{ color: 'var(--mikels-green)' }} />
              <span 
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color: 'var(--mikels-green)' }}
              >
                Nuestro Blog
              </span>
            </div>
            <h1 
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ 
                fontFamily: 'Georgia, serif', 
                fontStyle: 'italic',
                color: 'var(--mikels-red)' 
              }}
            >
              Historias, Recetas y Tradición
            </h1>
            <p 
              className="text-lg md:text-xl"
              style={{ color: 'var(--mikels-gray-medium)' }}
            >
              Descubre el mundo del aceite de oliva virgen extra, recetas tradicionales 
              y la historia de nuestra familia desde 1819.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 
                className="w-12 h-12 animate-spin mb-4" 
                style={{ color: 'var(--mikels-red)' }} 
              />
              <p style={{ color: 'var(--mikels-gray-medium)' }}>Cargando noticias...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-lg mb-4" style={{ color: 'var(--mikels-red)' }}>{error}</p>
              <button
                onClick={fetchPosts}
                className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:opacity-90"
                style={{ 
                  backgroundColor: 'var(--mikels-red)',
                  color: 'white'
                }}
              >
                Reintentar
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen 
                className="w-16 h-16 mx-auto mb-4" 
                style={{ color: 'var(--mikels-gray-light)' }} 
              />
              <h2 
                className="text-2xl font-bold mb-4"
                style={{ 
                  fontFamily: 'Georgia, serif', 
                  fontStyle: 'italic',
                  color: 'var(--mikels-gray-dark)' 
                }}
              >
                Próximamente
              </h2>
              <p style={{ color: 'var(--mikels-gray-medium)' }}>
                Estamos preparando contenido increíble para ti. ¡Vuelve pronto!
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
                    style={{ 
                      boxShadow: '0 4px 6px -1px rgba(205, 84, 91, 0.1), 0 2px 4px -1px rgba(205, 84, 91, 0.06)'
                    }}
                  >
                    <Link to={`/blog/${post.slug}`}>
                      {/* Imagen */}
                      <div className="relative overflow-hidden aspect-video">
                        <img
                          src={getImageUrl(post)}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {post.category && (
                          <span 
                            className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold rounded-full text-white"
                            style={{ backgroundColor: 'var(--mikels-green)' }}
                          >
                            {post.category}
                          </span>
                        )}
                      </div>
                      
                      {/* Contenido */}
                      <div className="p-6">
                        <h2 
                          className="text-xl font-bold mb-3 line-clamp-2 group-hover:opacity-80 transition-opacity"
                          style={{ 
                            fontFamily: 'Georgia, serif', 
                            fontStyle: 'italic',
                            color: 'var(--mikels-red)' 
                          }}
                        >
                          {post.title}
                        </h2>
                        
                        <p 
                          className="mb-4 line-clamp-3"
                          style={{ color: 'var(--mikels-gray-medium)' }}
                        >
                          {post.excerpt}
                        </p>
                        
                        {/* Meta info */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span 
                              className="flex items-center gap-1"
                              style={{ color: 'var(--mikels-gray-light)' }}
                            >
                              <Calendar className="w-4 h-4" />
                              {formatDate(post.published_at)}
                            </span>
                          </div>
                          
                          <span 
                            className="flex items-center gap-1 font-semibold group-hover:gap-2 transition-all"
                            style={{ color: 'var(--mikels-red)' }}
                          >
                            Leer más
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: currentPage === 1 ? 'var(--mikels-gray-lighter)' : 'var(--mikels-red)',
                      color: currentPage === 1 ? 'var(--mikels-gray-medium)' : 'white'
                    }}
                  >
                    Anterior
                  </button>
                  
                  <span style={{ color: 'var(--mikels-gray-dark)' }}>
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: currentPage === totalPages ? 'var(--mikels-gray-lighter)' : 'var(--mikels-red)',
                      color: currentPage === totalPages ? 'var(--mikels-gray-medium)' : 'white'
                    }}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
