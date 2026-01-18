import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  User, 
  ArrowLeft, 
  Loader2, 
  Share2, 
  Mail, 
  MessageCircle,
  Link as LinkIcon,
  Check
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://mikels-earth-backend-production.up.railway.app';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/blog/posts/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Artículo no encontrado');
        }
        throw new Error('Error al cargar el artículo');
      }
      
      const data = await response.json();
      setPost(data);
      setError(null);
      
      // Actualizar título de la página
      document.title = `${data.title} | Blog Mikel's Earth`;
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(err.message);
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

  const shareUrl = window.location.href;
  const shareTitle = post?.title || '';

  const handleShare = async (method) => {
    switch (method) {
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`Te comparto este artículo de Mikel's Earth: ${shareUrl}`)}`;
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareTitle} - ${shareUrl}`)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Error copying to clipboard:', err);
        }
        break;
    }
  };

  // Imagen por defecto
  const getImageUrl = () => {
    if (post?.featured_image) return post.featured_image;
    return `https://placehold.co/1200x600/CD545B/ffffff?text=${encodeURIComponent(post?.title?.substring(0, 30) || 'Blog')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--mikels-red-10)' }}>
        <Loader2 
          className="w-12 h-12 animate-spin mb-4" 
          style={{ color: 'var(--mikels-red)' }} 
        />
        <p style={{ color: 'var(--mikels-gray-medium)' }}>Cargando artículo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--mikels-red-10)' }}>
        <h1 
          className="text-3xl font-bold mb-4"
          style={{ 
            fontFamily: 'Georgia, serif', 
            fontStyle: 'italic',
            color: 'var(--mikels-red)' 
          }}
        >
          {error}
        </h1>
        <p className="mb-6" style={{ color: 'var(--mikels-gray-medium)' }}>
          El artículo que buscas no existe o ha sido eliminado.
        </p>
        <Link
          to="/blog"
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:opacity-90"
          style={{ 
            backgroundColor: 'var(--mikels-red)',
            color: 'white'
          }}
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mikels-red-10)' }}>
      {/* Breadcrumb */}
      <div className="py-4" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto px-4">
          <Link
            to="/blog"
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--mikels-red)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Blog
          </Link>
        </div>
      </div>

      {/* Hero con imagen */}
      <section className="relative">
        <div className="aspect-[21/9] md:aspect-[3/1] w-full overflow-hidden">
          <img
            src={getImageUrl()}
            alt={post?.title}
            className="w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0"
            style={{ 
              background: 'linear-gradient(to top, rgba(74, 77, 61, 0.8) 0%, transparent 60%)'
            }}
          />
        </div>
        
        {/* Título superpuesto */}
        <div className="absolute bottom-0 left-0 right-0 pb-8 md:pb-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {post?.category && (
                <span 
                  className="inline-block px-4 py-1 text-sm font-semibold rounded-full text-white mb-4"
                  style={{ backgroundColor: 'var(--mikels-green)' }}
                >
                  {post.category}
                </span>
              )}
              <h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-4xl"
                style={{ 
                  fontFamily: 'Georgia, serif', 
                  fontStyle: 'italic',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {post?.title}
              </h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Meta info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap items-center gap-6 mb-8 pb-8"
              style={{ borderBottom: '1px solid var(--mikels-gray-lighter)' }}
            >
              <span 
                className="flex items-center gap-2"
                style={{ color: 'var(--mikels-gray-medium)' }}
              >
                <User className="w-5 h-5" />
                {post?.author || "Mikel's Earth"}
              </span>
              <span 
                className="flex items-center gap-2"
                style={{ color: 'var(--mikels-gray-medium)' }}
              >
                <Calendar className="w-5 h-5" />
                {formatDate(post?.published_at)}
              </span>
            </motion.div>

            {/* Contenido del post */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="prose prose-lg max-w-none"
              style={{
                '--tw-prose-body': 'var(--mikels-gray-dark)',
                '--tw-prose-headings': 'var(--mikels-red)',
                '--tw-prose-links': 'var(--mikels-red)',
                '--tw-prose-bold': 'var(--mikels-gray-dark)',
                '--tw-prose-quotes': 'var(--mikels-gray-medium)',
                '--tw-prose-quote-borders': 'var(--mikels-green)',
              }}
            >
              <div 
                dangerouslySetInnerHTML={{ __html: post?.content }}
                className="blog-content"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: '1.8',
                  color: 'var(--mikels-gray-dark)'
                }}
              />
            </motion.article>

            {/* Tags */}
            {post?.tags && post.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap gap-2 mt-8 pt-8"
                style={{ borderTop: '1px solid var(--mikels-gray-lighter)' }}
              >
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm rounded-full"
                    style={{ 
                      backgroundColor: 'var(--mikels-red-10)',
                      color: 'var(--mikels-red)'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </motion.div>
            )}

            {/* Compartir */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 p-6 rounded-xl"
              style={{ backgroundColor: 'white' }}
            >
              <h3 
                className="text-lg font-bold mb-4 flex items-center gap-2"
                style={{ 
                  fontFamily: 'Georgia, serif', 
                  fontStyle: 'italic',
                  color: 'var(--mikels-gray-dark)' 
                }}
              >
                <Share2 className="w-5 h-5" />
                Compartir este artículo
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleShare('email')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:opacity-80"
                  style={{ 
                    backgroundColor: 'var(--mikels-red-10)',
                    color: 'var(--mikels-red)'
                  }}
                >
                  <Mail className="w-5 h-5" />
                  Email
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:opacity-80"
                  style={{ 
                    backgroundColor: 'var(--mikels-green-10)',
                    color: 'var(--mikels-green)'
                  }}
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:opacity-80"
                  style={{ 
                    backgroundColor: 'var(--mikels-gray-lighter)',
                    color: 'var(--mikels-gray-dark)'
                  }}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-5 h-5" />
                      Copiar enlace
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 text-center"
            >
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:opacity-90"
                style={{ 
                  backgroundColor: 'var(--mikels-red)',
                  color: 'white'
                }}
              >
                <ArrowLeft className="w-5 h-5" />
                Ver más artículos
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Estilos para el contenido del blog */}
      <style>{`
        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4 {
          font-family: Georgia, serif;
          font-style: italic;
          color: var(--mikels-red);
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        
        .blog-content h2 {
          font-size: 1.75rem;
        }
        
        .blog-content h3 {
          font-size: 1.5rem;
        }
        
        .blog-content p {
          margin-bottom: 1.5rem;
        }
        
        .blog-content a {
          color: var(--mikels-red);
          text-decoration: underline;
        }
        
        .blog-content a:hover {
          color: var(--mikels-green);
        }
        
        .blog-content ul,
        .blog-content ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        
        .blog-content li {
          margin-bottom: 0.5rem;
        }
        
        .blog-content blockquote {
          border-left: 4px solid var(--mikels-green);
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: var(--mikels-gray-medium);
        }
        
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
        
        .blog-content strong {
          color: var(--mikels-gray-dark);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default BlogPost;
