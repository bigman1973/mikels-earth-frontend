import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Image as ImageIcon,
  Type,
  Code
} from 'lucide-react';

// Importación dinámica de ReactQuill para evitar errores de SSR/Hidratación
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
  
  // Modo de rescate: si el editor visual falla, permitir usar texto plano
  const [useVisualEditor, setUseVisualEditor] = useState(true);

  // Configuración del editor Quill
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
  ];

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

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setFormError('Tipo de archivo no permitido. Use: png, jpg, jpeg, gif, webp');
      return;
    }

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

  // Login View
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--mikels-red-10)' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--mikels-red-10)' }}>
              <Lock className="w-8 h-8" style={{ color: 'var(--mikels-red)' }} />
            </div>
          </div>
          
          <h2 
            className="text-3xl font-bold text-center mb-2"
            style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: 'var(--mikels-red)' }}
          >
            Blog Admin
          </h2>
          <p className="text-center text-gray-500 mb-8">Mikel's Earth</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {loginError && (
              <div className="p-4 rounded-lg flex items-center gap-3 text-sm" style={{ backgroundColor: '#FEF2F2', color: '#991B1B' }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {loginError}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                placeholder="admin"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--mikels-red)' }}
            >
              {loginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Iniciar Sesión'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Create/Edit View
  if (view === 'create' || view === 'edit') {
    return (
      <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--mikels-red-10)' }}>
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={goBackToList}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" style={{ color: 'var(--mikels-gray-dark)' }} />
              </button>
              <h1 
                className="text-xl font-bold"
                style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: 'var(--mikels-red)' }}
              >
                {view === 'create' ? 'Nueva Noticia' : 'Editar Noticia'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setUseVisualEditor(!useVisualEditor)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ 
                  backgroundColor: useVisualEditor ? 'var(--mikels-gray-lighter)' : 'var(--mikels-red)',
                  color: useVisualEditor ? 'var(--mikels-gray-dark)' : 'white'
                }}
              >
                {useVisualEditor ? <Code className="w-4 h-4" /> : <Type className="w-4 h-4" />}
                {useVisualEditor ? 'Modo Código' : 'Modo Visual'}
              </button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {formError && (
              <div className="mb-6 p-4 rounded-lg flex items-center gap-3 text-sm" style={{ backgroundColor: '#FEF2F2', color: '#991B1B' }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Columna Principal */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Título de la noticia</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all text-lg font-medium"
                      placeholder="Ej: Los beneficios del aceite temprano..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contenido</label>
                    {useVisualEditor ? (
                      <div className="quill-container">
                        <ReactQuill 
                          theme="snow"
                          value={formData.content}
                          onChange={handleContentChange}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Escribe aquí el contenido de la noticia..."
                          style={{ height: '400px', marginBottom: '50px' }}
                        />
                      </div>
                    ) : (
                      <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all font-mono text-sm"
                        style={{ minHeight: '450px' }}
                        placeholder="Escribe aquí el contenido en formato HTML..."
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Columna Lateral */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                      placeholder="Ej: Recetas, Salud..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Imagen destacada</label>
                    <div className="space-y-3">
                      {formData.featured_image ? (
                        <div className="relative rounded-lg overflow-hidden border group">
                          <img 
                            src={formData.featured_image} 
                            alt="Preview" 
                            className="w-full h-40 object-cover"
                          />
                          <button 
                            onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                          <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          <p className="text-xs text-gray-400">No hay imagen seleccionada</p>
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-2">
                        <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 font-medium hover:bg-green-100 transition-colors">
                          {imageUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {imageUploading ? 'Subiendo...' : 'Subir imagen'}
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={handleImageUpload}
                            accept="image/*"
                            disabled={imageUploading}
                          />
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="featured_image"
                            value={formData.featured_image}
                            onChange={handleFormChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all text-xs"
                            placeholder="O pega una URL de imagen..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                  <button
                    onClick={() => view === 'create' ? handleCreatePost(false) : handleUpdatePost(false)}
                    disabled={formLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: 'var(--mikels-gray-lighter)', color: 'var(--mikels-gray-dark)' }}
                  >
                    {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Guardar borrador
                  </button>
                  
                  <button
                    onClick={() => view === 'create' ? handleCreatePost(true) : handleUpdatePost(true)}
                    disabled={formLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-300 hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: 'var(--mikels-green)' }}
                  >
                    {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    Publicar ahora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--mikels-red-10)' }}>
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 
            className="text-xl font-bold"
            style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: 'var(--mikels-red)' }}
          >
            Blog Admin - Mikel's Earth
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white shadow-md transition-all duration-300 hover:opacity-90"
              style={{ backgroundColor: 'var(--mikels-green)' }}
            >
              <Plus className="w-5 h-5" />
              Nuevo Post
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" style={{ color: 'var(--mikels-gray-dark)' }} />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Noticias', value: stats.total, icon: FileText, color: 'var(--mikels-gray-dark)' },
            { label: 'Publicadas', value: stats.published, icon: CheckCircle, color: 'var(--mikels-green)' },
            { label: 'Borradores', value: stats.drafts, icon: Clock, color: 'var(--mikels-red)' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${stat.color}10` }}>
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--mikels-gray-dark)' }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 rounded-xl flex items-center gap-3 text-white shadow-lg"
              style={{ backgroundColor: 'var(--mikels-green)' }}
            >
              <CheckCircle className="w-5 h-5" />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl flex items-center gap-3 text-sm" style={{ backgroundColor: '#FEF2F2', color: '#991B1B' }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
            <button onClick={() => fetchPosts(token)} className="ml-auto underline font-medium">Reintentar</button>
          </div>
        )}

        {/* Posts Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--mikels-red)' }} />
              <p className="text-gray-500 font-medium">Cargando noticias...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">No hay noticias aún</h3>
              <p className="text-gray-500 mb-6">Comienza creando tu primera noticia para el blog.</p>
              <button
                onClick={openCreateForm}
                className="px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--mikels-green)' }}
              >
                Crear mi primera noticia
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-sm font-bold text-gray-600">Noticia</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600">Estado</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600">Fecha</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-600 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {post.featured_image ? (
                              <img src={post.featured_image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 line-clamp-1">{post.title}</p>
                            <p className="text-xs text-gray-500">{post.category || 'Sin categoría'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                          style={{ 
                            backgroundColor: post.status === 'published' ? '#ECFDF5' : '#FFF7ED',
                            color: post.status === 'published' ? '#065F46' : '#9A3412'
                          }}
                        >
                          {post.status === 'published' ? 'Publicado' : 'Borrador'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(post.published_at || post.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {post.status === 'draft' && (
                            <button 
                              onClick={() => handlePublish(post)}
                              disabled={actionLoading === post.id}
                              className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                              title="Publicar ahora"
                            >
                              {actionLoading === post.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                          )}
                          <a 
                            href={`/blog/${post.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Ver noticia"
                          >
                            <Eye className="w-5 h-5" />
                          </a>
                          <button 
                            onClick={() => openEditForm(post)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setDeleteModal({ show: true, post })}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Eliminación */}
      <AnimatePresence>
        {deleteModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModal({ show: false, post: null })}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative z-10"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--mikels-gray-dark)' }}>¿Eliminar noticia?</h3>
              <p className="text-center text-gray-500 mb-8">
                Esta acción no se puede deshacer. Se eliminará permanentemente la noticia:
                <br />
                <strong className="text-gray-800">"{deleteModal.post?.title}"</strong>
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteModal({ show: false, post: null })}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={actionLoading === deleteModal.post?.id}
                  className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--mikels-red)' }}
                >
                  {actionLoading === deleteModal.post?.id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sí, eliminar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogAdmin;
