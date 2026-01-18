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
  X,
  Plus,
  Save,
  ArrowLeft,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
  
  // Estados para el editor de posts
  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    featured_image: '',
    status: 'draft'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

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
    setView('list');
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

  // Funciones del editor
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: '',
      featured_image: '',
      status: 'draft'
    });
    setFormError('');
    setEditingPost(null);
  };

  const openCreateForm = () => {
    resetForm();
    setView('create');
  };

  const openEditForm = (post) => {
    setFormData({
      title: post.title || '',
      content: post.content || '',
      category: post.category || '',
      featured_image: post.featured_image || '',
      status: post.status || 'draft'
    });
    setEditingPost(post);
    setFormError('');
    setView('edit');
  };

  const goBackToList = () => {
    resetForm();
    setView('list');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setFormError('Tipo de archivo no permitido. Use: png, jpg, jpeg, gif, webp');
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormError('El archivo es demasiado grande. Máximo 5MB');
      return;
    }

    setImageUploading(true);
    setFormError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await fetch(`${API_URL}/api/blog/admin/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      });

      const data = await response.json();

      if (response.ok) {
        setFormData(prev => ({ ...prev, featured_image: data.url }));
        showSuccess('Imagen subida correctamente');
      } else {
        setFormError(data.error || 'Error al subir la imagen');
      }
    } catch (err) {
      setFormError('Error de conexión al subir la imagen');
    } finally {
      setImageUploading(false);
    }
  };

  const handleCreatePost = async (publishNow = false) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setFormError('El título y el contenido son obligatorios');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const response = await fetch(`${API_URL}/api/blog/admin/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          status: publishNow ? 'published' : formData.status
        })
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess(publishNow ? 'Post publicado correctamente' : 'Post guardado como borrador');
        fetchPosts(token);
        goBackToList();
      } else {
        setFormError(data.error || 'Error al crear el post');
      }
    } catch (err) {
      setFormError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdatePost = async (publishNow = false) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setFormError('El título y el contenido son obligatorios');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const response = await fetch(`${API_URL}/api/blog/admin/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          status: publishNow ? 'published' : formData.status
        })
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Post actualizado correctamente');
        fetchPosts(token);
        goBackToList();
      } else {
        setFormError(data.error || 'Error al actualizar el post');
      }
    } catch (err) {
      setFormError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setFormLoading(false);
    }
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

  // Vista de Crear/Editar Post
  if (view === 'create' || view === 'edit') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--mikels-red-10)' }}>
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={goBackToList}
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 hover:opacity-80"
                style={{ 
                  backgroundColor: 'var(--mikels-gray-lighter)',
                  color: 'var(--mikels-gray-dark)'
                }}
              >
                <ArrowLeft className="w-5 h-5" />
                Volver
              </button>
              <h1 
                className="text-xl font-bold"
                style={{ 
                  fontFamily: 'Georgia, serif', 
                  fontStyle: 'italic',
                  color: 'var(--mikels-red)' 
                }}
              >
                {view === 'create' ? 'Nuevo Post' : 'Editar Post'}
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:opacity-80"
              style={{ 
                backgroundColor: 'var(--mikels-gray-lighter)',
                color: 'var(--mikels-gray-dark)'
              }}
            >
              <LogOut className="w-5 h-5" />
              Salir
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
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              {formError && (
                <div 
                  className="mb-6 p-4 rounded-lg flex items-center gap-2"
                  style={{ backgroundColor: 'var(--mikels-red-10)', color: 'var(--mikels-red)' }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {formError}
                </div>
              )}

              {/* Título */}
              <div className="mb-6">
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--mikels-gray-dark)' }}
                >
                  Título *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Escribe el título del post..."
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 text-lg"
                  style={{ 
                    borderColor: 'var(--mikels-gray-light)',
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic'
                  }}
                />
              </div>

              {/* Categoría */}
              <div className="mb-6">
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--mikels-gray-dark)' }}
                >
                  Categoría
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  placeholder="Ej: Recetas, Salud, Historia..."
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--mikels-gray-light)' }}
                />
              </div>

              {/* Imagen destacada */}
              <div className="mb-6">
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--mikels-gray-dark)' }}
                >
                  Imagen destacada
                </label>
                
                {/* Subir archivo */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <label 
                      className="flex items-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 hover:opacity-80"
                      style={{ 
                        backgroundColor: 'var(--mikels-green)',
                        color: 'white'
                      }}
                    >
                      {imageUploading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Subir imagen
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                        onChange={handleImageUpload}
                        disabled={imageUploading}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs" style={{ color: 'var(--mikels-gray-light)' }}>
                      PNG, JPG, GIF, WEBP (máx. 5MB)
                    </span>
                  </div>
                  
                  {/* O introducir URL */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--mikels-gray-light)' }}>o</span>
                    <input
                      type="url"
                      name="featured_image"
                      value={formData.featured_image}
                      onChange={handleFormChange}
                      placeholder="Pegar URL de imagen..."
                      className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 text-sm"
                      style={{ borderColor: 'var(--mikels-gray-light)' }}
                    />
                    {formData.featured_image && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                        className="p-2 rounded-lg transition-all duration-300 hover:opacity-80"
                        style={{ backgroundColor: 'var(--mikels-red-10)', color: 'var(--mikels-red)' }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Preview de imagen */}
                {formData.featured_image && (
                  <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--mikels-gray-lighter)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-4 h-4" style={{ color: 'var(--mikels-green)' }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--mikels-gray-dark)' }}>Vista previa</span>
                    </div>
                    <img 
                      src={formData.featured_image} 
                      alt="Preview" 
                      className="max-h-48 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        setFormError('No se pudo cargar la imagen. Verifica la URL.');
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Contenido con Editor WYSIWYG */}
              <div className="mb-6">
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--mikels-gray-dark)' }}
                >
                  Contenido *
                </label>
                <div className="quill-container">
                  {typeof window !== 'undefined' && (
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                      placeholder="Escribe el contenido de la noticia aquí..."
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link', 'image'],
                          ['clean']
                        ],
                      }}
                      style={{ height: '300px', marginBottom: '50px' }}
                    />
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-3 pt-4 border-t" style={{ borderColor: 'var(--mikels-gray-lighter)' }}>
                <button
                  onClick={() => view === 'create' ? handleCreatePost(false) : handleUpdatePost(false)}
                  disabled={formLoading}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:opacity-90 disabled:opacity-50"
                  style={{ 
                    backgroundColor: 'var(--mikels-gray-lighter)',
                    color: 'var(--mikels-gray-dark)'
                  }}
                >
                  {formLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Guardar borrador
                </button>
                
                <button
                  onClick={() => view === 'create' ? handleCreatePost(true) : handleUpdatePost(true)}
                  disabled={formLoading}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--mikels-green)' }}
                >
                  {formLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  Publicar ahora
                </button>
                
                <button
                  onClick={goBackToList}
                  disabled={formLoading}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:opacity-80"
                  style={{ color: 'var(--mikels-gray-medium)' }}
                >
                  <X className="w-5 h-5" />
                  Cancelar
                </button>
              </div>
            </div>

            {/* Preview del contenido */}
            {formData.content && (
              <div className="mt-8 bg-white rounded-xl shadow-sm p-6 md:p-8">
                <h3 
                  className="text-lg font-bold mb-4 pb-4 border-b"
                  style={{ 
                    fontFamily: 'Georgia, serif', 
                    fontStyle: 'italic',
                    color: 'var(--mikels-gray-dark)',
                    borderColor: 'var(--mikels-gray-lighter)'
                  }}
                >
                  Vista previa
                </h3>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                  style={{ color: 'var(--mikels-gray-dark)' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Panel Admin - Lista de Posts
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
          <div className="flex items-center gap-3">
            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:opacity-90"
              style={{ backgroundColor: 'var(--mikels-green)' }}
            >
              <Plus className="w-5 h-5" />
              Nuevo Post
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:opacity-80"
              style={{ 
                backgroundColor: 'var(--mikels-gray-lighter)',
                color: 'var(--mikels-gray-dark)'
              }}
            >
              <LogOut className="w-5 h-5" />
              Salir
            </button>
          </div>
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
          <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--mikels-gray-lighter)' }}>
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
            <button
              onClick={() => fetchPosts(token)}
              className="text-sm px-3 py-1 rounded-lg transition-colors hover:bg-gray-100"
              style={{ color: 'var(--mikels-gray-medium)' }}
            >
              Actualizar
            </button>
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
              <p className="mb-4" style={{ color: 'var(--mikels-gray-medium)' }}>
                No hay posts todavía.
              </p>
              <button
                onClick={openCreateForm}
                className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:opacity-90"
                style={{ backgroundColor: 'var(--mikels-green)' }}
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Crear primer post
              </button>
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
                      
                      <button
                        onClick={() => openEditForm(post)}
                        className="p-2 rounded-lg transition-colors hover:bg-blue-50"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" style={{ color: '#3b82f6' }} />
                      </button>
                      
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
