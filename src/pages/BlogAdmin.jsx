import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  LogOut, 
  Trash2, 
  Edit, 
  Eye, 
  Send, 
  Loader2,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://mikels-earth-backend-production.up.railway.app';

const BlogAdmin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [deleteModal, setDeleteModal] = useState({ show: false, post: null });
  const [actionLoading, setActionLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Verificar si hay token guardado
  useEffect(() => {
    const savedToken = localStorage.getItem('blog_admin_token');
    if (savedToken) {
      verifyToken(savedToken);
    }
  }, []);

  const verifyToken = async (savedToken) => {
    try {
      const response = await fetch(`${API_URL}/api/blog/admin/verify`, {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });
      
      if (response.ok) {
        setToken(savedToken);
        setIsLoggedIn(true);
        fetchPosts(savedToken);
      } else {
        localStorage.removeItem('blog_admin_token');
      }
    } catch (err) {
      localStorage.removeItem('blog_admin_token');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    
    try {
      const response = await fetch(`${API_URL}/api/blog/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setToken(data.token);
        setIsLoggedIn(true);
        localStorage.setItem('blog_admin_token', data.token);
        fetchPosts(data.token);
      } else {
        setLoginError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setLoginError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setIsLoggedIn(false);
    localStorage.removeItem('blog_admin_token');
    setPosts([]);
    setStats({ total: 0, published: 0, drafts: 0 });
  };

  const fetchPosts = async (authToken) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/blog/admin/posts`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar los posts');
      }
      
      const data = await response.json();
      setPosts(data.posts || []);
      setStats(data.stats || { total: 0, published: 0, drafts: 0 });
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar los posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.post) return;
    
    setActionLoading(deleteModal.post.id);
    
    try {
      const response = await fetch(`${API_URL}/api/blog/admin/posts/${deleteModal.post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setPosts(posts.filter(p => p.id !== deleteModal.post.id));
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          published: deleteModal.post.status === 'published' ? prev.published - 1 : prev.published,
          drafts: deleteModal.post.status === 'draft' ? prev.drafts - 1 : prev.drafts
        }));
        showSuccess('Post eliminado correctamente');
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (err) {
      setError('Error al eliminar el post');
    } finally {
      setActionLoading(null);
      setDeleteModal({ show: false, post: null });
    }
  };

  const handlePublish = async (post) => {
    setActionLoading(post.id);
    
    try {
      const response = await fetch(`${API_URL}/api/blog/admin/posts/${post.id}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(posts.map(p => p.id === post.id ? data.post : p));
        setStats(prev => ({
          ...prev,
          published: prev.published + 1,
          drafts: prev.drafts - 1
        }));
        showSuccess('Post publicado correctamente');
      } else {
        throw new Error('Error al publicar');
      }
    } catch (err) {
      setError('Error al publicar el post');
    } finally {
      setActionLoading(null);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Pantalla de Login
  if (!isLoggedIn) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: 'var(--mikels-red-10)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--mikels-red-10)' }}
            >
              <Lock className="w-8 h-8" style={{ color: 'var(--mikels-red)' }} />
            </div>
            <h1 
              className="text-2xl font-bold"
              style={{ 
                fontFamily: 'Georgia, serif', 
                fontStyle: 'italic',
                color: 'var(--mikels-red)' 
              }}
            >
              Blog Admin
            </h1>
            <p style={{ color: 'var(--mikels-gray-medium)' }}>
              Mikel's Earth
            </p>
          </div>
          
          <form onSubmit={handleLogin}>
            {loginError && (
              <div 
                className="mb-4 p-3 rounded-lg flex items-center gap-2"
                style={{ backgroundColor: 'var(--mikels-red-10)', color: 'var(--mikels-red)' }}
              >
                <AlertCircle className="w-5 h-5" />
                {loginError}
              </div>
            )}
            
            <div className="mb-4">
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--mikels-gray-dark)' }}
              >
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--mikels-gray-light)',
                  '--tw-ring-color': 'var(--mikels-red-50)'
                }}
                required
              />
            </div>
            
            <div className="mb-6">
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--mikels-gray-dark)' }}
              >
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--mikels-gray-light)',
                  '--tw-ring-color': 'var(--mikels-red-50)'
                }}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--mikels-red)' }}
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Panel Admin
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mikels-red-10)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 
            className="text-xl font-bold"
            style={{ 
              fontFamily: 'Georgia, serif', 
              fontStyle: 'italic',
              color: 'var(--mikels-red)' 
            }}
          >
            Blog Admin - Mikel's Earth
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:opacity-80"
            style={{ 
              backgroundColor: 'var(--mikels-gray-lighter)',
              color: 'var(--mikels-gray-dark)'
            }}
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Mensaje de éxito */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
          style={{ backgroundColor: 'var(--mikels-green)', color: 'white' }}
        >
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </motion.div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--mikels-red-10)' }}
              >
                <FileText className="w-6 h-6" style={{ color: 'var(--mikels-red)' }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--mikels-gray-dark)' }}>
                  {stats.total}
                </p>
                <p style={{ color: 'var(--mikels-gray-medium)' }}>Total Posts</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--mikels-green-10)' }}
              >
                <CheckCircle className="w-6 h-6" style={{ color: 'var(--mikels-green)' }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--mikels-gray-dark)' }}>
                  {stats.published}
                </p>
                <p style={{ color: 'var(--mikels-gray-medium)' }}>Publicados</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--mikels-gray-lighter)' }}
              >
                <Clock className="w-6 h-6" style={{ color: 'var(--mikels-gray-medium)' }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--mikels-gray-dark)' }}>
                  {stats.drafts}
                </p>
                <p style={{ color: 'var(--mikels-gray-medium)' }}>Borradores</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Posts */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b" style={{ borderColor: 'var(--mikels-gray-lighter)' }}>
            <h2 
              className="text-lg font-bold"
              style={{ 
                fontFamily: 'Georgia, serif', 
                fontStyle: 'italic',
                color: 'var(--mikels-gray-dark)' 
              }}
            >
              Todos los Posts
            </h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--mikels-red)' }} />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p style={{ color: 'var(--mikels-red)' }}>{error}</p>
              <button
                onClick={() => fetchPosts(token)}
                className="mt-4 px-4 py-2 rounded-lg font-medium"
                style={{ backgroundColor: 'var(--mikels-red)', color: 'white' }}
              >
                Reintentar
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--mikels-gray-light)' }} />
              <p style={{ color: 'var(--mikels-gray-medium)' }}>
                No hay posts todavía. Envía un email a blog@mikels.es para crear uno.
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--mikels-gray-lighter)' }}>
              {posts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 
                          className="font-semibold truncate"
                          style={{ color: 'var(--mikels-gray-dark)' }}
                        >
                          {post.title}
                        </h3>
                        <span 
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            post.status === 'published' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {post.status === 'published' ? 'Publicado' : 'Borrador'}
                        </span>
                      </div>
                      <p 
                        className="text-sm mb-2 line-clamp-2"
                        style={{ color: 'var(--mikels-gray-medium)' }}
                      >
                        {post.excerpt}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--mikels-gray-light)' }}>
                        {formatDate(post.published_at || post.created_at)}
                        {post.category && ` • ${post.category}`}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {post.status === 'published' && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                          title="Ver post"
                        >
                          <Eye className="w-5 h-5" style={{ color: 'var(--mikels-gray-medium)' }} />
                        </a>
                      )}
                      
                      {post.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(post)}
                          disabled={actionLoading === post.id}
                          className="p-2 rounded-lg transition-colors hover:bg-green-50"
                          title="Publicar"
                        >
                          {actionLoading === post.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--mikels-green)' }} />
                          ) : (
                            <Send className="w-5 h-5" style={{ color: 'var(--mikels-green)' }} />
                          )}
                        </button>
                      )}
                      
                      <button
                        onClick={() => setDeleteModal({ show: true, post })}
                        disabled={actionLoading === post.id}
                        className="p-2 rounded-lg transition-colors hover:bg-red-50"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" style={{ color: 'var(--mikels-red)' }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instrucciones */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 
            className="text-lg font-bold mb-4"
            style={{ 
              fontFamily: 'Georgia, serif', 
              fontStyle: 'italic',
              color: 'var(--mikels-gray-dark)' 
            }}
          >
            Cómo publicar posts
          </h3>
          <div className="space-y-3 text-sm" style={{ color: 'var(--mikels-gray-medium)' }}>
            <p>
              <strong>Publicar:</strong> Envía un email a <code className="bg-gray-100 px-2 py-1 rounded">blog@mikels.es</code> con el título en el asunto y el contenido en el cuerpo.
            </p>
            <p>
              <strong>Borrador:</strong> Añade <code className="bg-gray-100 px-2 py-1 rounded">[DRAFT]</code> al inicio del asunto.
            </p>
            <p>
              <strong>Categoría:</strong> Añade <code className="bg-gray-100 px-2 py-1 rounded">[Categoría]</code> al asunto. Ej: <code className="bg-gray-100 px-2 py-1 rounded">[Recetas] Mi receta favorita</code>
            </p>
            <p>
              <strong>Eliminar por email:</strong> Envía un email con asunto <code className="bg-gray-100 px-2 py-1 rounded">[DELETE] slug-del-post</code>
            </p>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 
                className="text-lg font-bold"
                style={{ 
                  fontFamily: 'Georgia, serif', 
                  fontStyle: 'italic',
                  color: 'var(--mikels-red)' 
                }}
              >
                Confirmar eliminación
              </h3>
              <button
                onClick={() => setDeleteModal({ show: false, post: null })}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" style={{ color: 'var(--mikels-gray-medium)' }} />
              </button>
            </div>
            
            <p className="mb-6" style={{ color: 'var(--mikels-gray-medium)' }}>
              ¿Estás seguro de que quieres eliminar el post <strong>"{deleteModal.post?.title}"</strong>? Esta acción no se puede deshacer.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ show: false, post: null })}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: 'var(--mikels-gray-lighter)',
                  color: 'var(--mikels-gray-dark)'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg font-medium text-white transition-colors flex items-center gap-2"
                style={{ backgroundColor: 'var(--mikels-red)' }}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BlogAdmin;
