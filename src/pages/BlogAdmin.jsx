import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Send, 
  Eye, 
  LogOut, 
  Layout, 
  FileText, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Image as ImageIcon,
  X,
  Upload,
  Code
} from 'lucide-react';

// Carga diferida del editor para evitar errores de SSR/Hidratación que causan pantalla en blanco
const ReactQuill = lazy(() => import('react-quill').then(module => {
  // Asegurar que los estilos se carguen solo en el cliente
  import('react-quill/dist/quill.snow.css');
  return module;
}));

const API_URL = 'https://mikels-earth-backend-production.up.railway.app/api/blog';

const BlogAdmin = () => {
  // Estados de autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [token, setToken] = useState(localStorage.getItem('blog_admin_token') || '');
  
  // Estados de datos
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 });
  
  // Estados de UI
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [useRawEditor, setUseRawEditor] = useState(false); // Modo de rescate
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    image_url: '',
    status: 'draft'
  });

  // Verificar token al cargar
  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      fetchPosts();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/posts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        handleLogout();
        return;
      }
      
      const data = await response.json();
      if (response.ok) {
        setPosts(data.posts || []);
        calculateStats(data.posts || []);
      } else {
        setError(data.error || 'Error al cargar noticias');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (postsList) => {
    const published = postsList.filter(p => p.status === 'published').length;
    setStats({
      total: postsList.length,
      published,
      drafts: postsList.length - published
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        localStorage.setItem('blog_admin_token', data.token);
        setIsLoggedIn(true);
        fetchPosts();
      } else {
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('blog_admin_token');
    setIsLoggedIn(false);
    setPosts([]);
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

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      setIsUploading(true);
      const response = await fetch(`${API_URL}/admin/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadFormData
      });

      const data = await response.json();
      if (response.ok) {
        setFormData(prev => ({ ...prev, image_url: data.url }));
      } else {
        alert(data.error || 'Error al subir imagen');
      }
    } catch (err) {
      alert('Error de conexión al subir imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (status) => {
    if (!formData.title || !formData.content) {
      alert('Título y contenido son obligatorios');
      return;
    }

    const postData = { ...formData, status };
    const url = editingPost 
      ? `${API_URL}/admin/posts/${editingPost.id}` 
      : `${API_URL}/admin/posts`;
    
    const method = editingPost ? 'PUT' : 'POST';

    try {
      setLoading(true);
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingPost(null);
        setFormData({ title: '', content: '', category: 'General', image_url: '', status: 'draft' });
        fetchPosts();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al guardar noticia');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta noticia?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchPosts();
      } else {
        alert('Error al eliminar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const startEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      category: post.category || 'General',
      image_url: post.image_url || '',
      status: post.status
    });
    setShowForm(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
              <Layout className="w-8 h-8 text-[#CD545B]" />
            </div>
            <h1 className="text-2xl font-serif text-gray-900">Blog Admin</h1>
            <p className="text-gray-500">Mikel's Earth</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#CD545B] focus:border-transparent outline-none transition-all"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#CD545B] focus:border-transparent outline-none transition-all"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#CD545B] text-white py-3 rounded-xl font-medium hover:bg-[#b44a50] transition-colors shadow-lg shadow-red-100"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Admin */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Layout className="w-6 h-6 text-[#CD545B]" />
              <span className="font-serif text-xl font-bold text-gray-900">Mikel's Blog Admin</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl"><FileText className="w-6 h-6 text-blue-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Total Noticias</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl"><CheckCircle className="w-6 h-6 text-green-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Publicadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-xl"><Clock className="w-6 h-6 text-amber-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Borradores</p>
                <p className="text-2xl font-bold text-gray-900">{stats.drafts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-serif text-gray-900">Gestión de Noticias</h2>
          <button 
            onClick={() => {
              setEditingPost(null);
              setFormData({ title: '', content: '', category: 'General', image_url: '', status: 'draft' });
              setShowForm(true);
            }}
            className="bg-[#B7BF10] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#a3aa0e] transition-all flex items-center gap-2 shadow-lg shadow-green-100"
          >
            <Plus className="w-5 h-5" />
            Nueva Noticia
          </button>
        </div>

        {/* Formulario (Modal) */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl my-8">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
                <h3 className="text-xl font-serif font-bold text-gray-900">
                  {editingPost ? 'Editar Noticia' : 'Crear Nueva Noticia'}
                </h3>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setUseRawEditor(!useRawEditor)}
                    className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${useRawEditor ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    title="Modo de rescate (Editor de texto plano)"
                  >
                    <Code className="w-4 h-4" />
                    <span className="hidden sm:inline">{useRawEditor ? 'Modo Visual' : 'Modo Código'}</span>
                  </button>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Título de la Noticia</label>
                    <input
                      type="text"
                      name="title"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#CD545B] outline-none"
                      placeholder="Ej: Los beneficios del aceite temprano..."
                      value={formData.title}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                    <select
                      name="category"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#CD545B] outline-none"
                      value={formData.category}
                      onChange={handleFormChange}
                    >
                      <option value="General">General</option>
                      <option value="Recetas">Recetas</option>
                      <option value="Salud">Salud</option>
                      <option value="Tradición">Tradición</option>
                      <option value="Eventos">Eventos</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imagen Destacada</label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="text"
                          name="image_url"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#CD545B] outline-none"
                          placeholder="URL de la imagen o sube un archivo..."
                          value={formData.image_url}
                          onChange={handleFormChange}
                        />
                        <ImageIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <label className={`cursor-pointer flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${isUploading ? 'bg-gray-100 text-gray-400' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                        {isUploading ? (
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                        <span>{isUploading ? 'Subiendo...' : 'Subir imagen'}</span>
                        <input type="file" className="hidden" onChange={handleImageUpload} disabled={isUploading} accept="image/*" />
                      </label>
                    </div>
                  </div>
                  {formData.image_url && (
                    <div className="mt-4 relative inline-block">
                      <img src={formData.image_url} alt="Preview" className="h-32 w-auto rounded-xl object-cover border border-gray-200" />
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contenido de la Noticia</label>
                  <div className="border border-gray-200 rounded-xl overflow-hidden min-h-[300px]">
                    {useRawEditor ? (
                      <textarea
                        className="w-full h-[300px] p-4 font-mono text-sm outline-none resize-none"
                        placeholder="Escribe aquí tu contenido en HTML o texto plano..."
                        value={formData.content}
                        onChange={(e) => handleContentChange(e.target.value)}
                      />
                    ) : (
                      <Suspense fallback={<div className="h-[300px] flex items-center justify-center text-gray-400">Cargando editor visual...</div>}>
                        <ReactQuill 
                          theme="snow"
                          value={formData.content}
                          onChange={handleContentChange}
                          className="h-[250px] mb-12"
                          placeholder="Escribe aquí la historia de tu aceite..."
                          modules={{
                            toolbar: [
                              [{ 'header': [1, 2, 3, false] }],
                              ['bold', 'italic', 'underline', 'strike'],
                              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                              ['link', 'image'],
                              ['clean']
                            ],
                          }}
                        />
                      </Suspense>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    {useRawEditor ? 'Estás en modo código. Puedes usar etiquetas HTML.' : 'Usa la barra de herramientas para dar formato al texto.'}
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-4 bg-gray-50 rounded-b-2xl">
                <button 
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 text-gray-600 font-medium hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleSubmit('draft')}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
                >
                  <Clock className="w-5 h-5" />
                  Guardar Borrador
                </button>
                <button 
                  onClick={() => handleSubmit('published')}
                  disabled={loading}
                  className="px-8 py-3 bg-[#CD545B] text-white rounded-xl font-medium hover:bg-[#b44a50] transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-100"
                >
                  <Send className="w-5 h-5" />
                  {editingPost ? 'Actualizar y Publicar' : 'Publicar Ahora'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Noticias */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading && posts.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-12 h-12 border-4 border-[#CD545B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando noticias...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-2">No hay noticias aún</h3>
              <p className="text-gray-500 mb-8">Empieza a compartir la tradición de Mikel's Earth con el mundo.</p>
              <button 
                onClick={() => setShowForm(true)}
                className="bg-[#B7BF10] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#a3aa0e] transition-all"
              >
                Crear mi primera noticia
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Noticia</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Fecha</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                            {post.image_url ? (
                              <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                            <p className="text-xs text-gray-500">{post.category || 'General'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {post.status === 'published' ? 'Publicado' : 'Borrador'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a 
                            href={`/blog/${post.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Ver noticia"
                          >
                            <Eye className="w-5 h-5" />
                          </a>
                          <button 
                            onClick={() => startEdit(post)}
                            className="p-2 text-gray-400 hover:text-amber-600 transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(post.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
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
      </main>
    </div>
  );
};

export default BlogAdmin;
