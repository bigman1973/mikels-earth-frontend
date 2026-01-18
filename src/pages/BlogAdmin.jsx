import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, Plus, FileText, CheckCircle, Clock, LogOut, 
  Pencil, Trash2, Eye, Image as ImageIcon, Upload, 
  X, AlertCircle, Send, Code
} from 'lucide-react';

const API_URL = 'https://mikels-earth-backend-production.up.railway.app/api/blog';

const BlogAdmin = ( ) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [token, setToken] = useState(localStorage.getItem('blog_admin_token') || '');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 });
  const editorRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '', content: '', category: 'General', image_url: '', status: 'draft'
  });

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      fetchPosts();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Cargar el editor TinyMCE dinámicamente para evitar errores de Vercel
  useEffect(() => {
    if (showForm && !window.tinymce) {
      const script = document.createElement('script');
      script.src = 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js';
      script.referrerPolicy = 'origin';
      script.onload = ( ) => {
        initEditor();
      };
      document.head.appendChild(script);
    } else if (showForm && window.tinymce) {
      setTimeout(initEditor, 100);
    }
  }, [showForm]);

  const initEditor = () => {
    if (window.tinymce) {
      window.tinymce.remove('#editor-container');
      window.tinymce.init({
        selector: '#editor-container',
        height: 400,
        menubar: false,
        plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount',
        toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
        setup: (editor) => {
          editorRef.current = editor;
          editor.on('change', () => {
            setFormData(prev => ({ ...prev, content: editor.getContent() }));
          });
        },
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
      });
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/posts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) { handleLogout(); return; }
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
    setStats({ total: postsList.length, published, drafts: postsList.length - published });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
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
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch (err) { setError('Error de conexión'); }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('blog_admin_token');
    setIsLoggedIn(false);
    setPosts([]);
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
        const url = data.url || data.secure_url;
        setFormData(prev => ({ ...prev, image_url: url }));
      } else { alert('Error al subir imagen: ' + (data.error || 'Verifica Cloudinary')); }
    } catch (err) { alert('Error de conexión al subir imagen'); }
    finally { setIsUploading(false); }
  };

  const handleSubmit = async (status) => {
    const content = editorRef.current ? editorRef.current.getContent() : formData.content;
    if (!formData.title || !content) {
      alert('Por favor, rellena el título y el contenido');
      return;
    }
    try {
      setLoading(true);
      const url = editingPost ? `${API_URL}/admin/posts/${editingPost.id}` : `${API_URL}/admin/posts`;
      const method = editingPost ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, content, status })
      });
      if (response.ok) {
        setShowForm(false);
        fetchPosts();
        setFormData({ title: '', content: '', category: 'General', image_url: '', status: 'draft' });
      } else {
        const data = await response.json();
        alert(data.error || 'Error al guardar noticia');
      }
    } catch (err) { alert('Error de conexión'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta noticia?')) return;
    try {
      const response = await fetch(`${API_URL}/admin/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) { fetchPosts(); } else { alert('Error al eliminar noticia'); }
    } catch (err) { alert('Error de conexión'); }
  };

  const startEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      category: post.category || 'General',
      image_url: post.featured_image || '',
      status: post.status
    });
    setShowForm(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#CD545B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layout className="w-8 h-8 text-[#CD545B]" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-gray-900">Mikel's Earth</h1>
            <p className="text-gray-500">Panel de Administración</p>
          </div>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" placeholder="Usuario" value={loginData.username} onChange={(e) => setLoginData({...loginData, username: e.target.value})} required />
            <input type="password" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" placeholder="Contraseña" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} required />
            <button type="submit" className="w-full bg-[#CD545B] text-white py-3 rounded-xl font-medium hover:bg-[#b44a50] transition-colors">Iniciar Sesión</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Layout className="w-6 h-6 text-[#CD545B]" />
            <span className="font-serif text-xl font-bold">Mikel's Blog Admin</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-600"><LogOut className="w-5 h-5" />Cerrar Sesión</button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl"><FileText className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl"><CheckCircle className="w-6 h-6 text-green-600" /></div>
            <div><p className="text-sm text-gray-500">Publicadas</p><p className="text-2xl font-bold">{stats.published}</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl"><Clock className="w-6 h-6 text-amber-600" /></div>
            <div><p className="text-sm text-gray-500">Borradores</p><p className="text-2xl font-bold">{stats.drafts}</p></div>
          </div>
        </div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-serif">Gestión de Noticias</h2>
          <button onClick={() => { setEditingPost(null); setFormData({ title: '', content: '', category: 'General', image_url: '', status: 'draft' }); setShowForm(true); }} className="bg-[#B7BF10] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Plus className="w-5 h-5" />Nueva Noticia</button>
        </div>
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl my-8">
              <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="text-xl font-serif font-bold">{editingPost ? 'Editar Noticia' : 'Crear Nueva Noticia'}</h3>
                <button onClick={() => setShowForm(false)}><X className="w-6 h-6 text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <input type="text" className="w-full px-4 py-3 rounded-xl border outline-none" placeholder="Título de la noticia..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    <select className="w-full px-4 py-3 rounded-xl border outline-none" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                      <option value="General">Categoría: General</option><option value="Recetas">Recetas</option><option value="Salud">Salud</option><option value="Tradición">Tradición</option><option value="Eventos">Eventos</option>
                    </select>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Imagen de portada</label>
                      <div className="flex gap-3">
                        <label className="flex-1 cursor-pointer bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-gray-200 transition-all">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">{isUploading ? 'Subiendo...' : 'Haz clic para subir'}</span>
                          <input type="file" className="hidden" onChange={handleImageUpload} disabled={isUploading} accept="image/*" />
                        </label>
                        {formData.image_url && (
                          <div className="w-32 h-32 rounded-xl border overflow-hidden bg-white shadow-inner">
                            <img src={formData.image_url} className="w-full h-full object-cover" alt="Preview" key={formData.image_url} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="h-full min-h-[400px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contenido</label>
                    <textarea id="editor-container" defaultValue={formData.content}></textarea>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-4 bg-gray-50 rounded-b-2xl">
                <button onClick={() => setShowForm(false)} className="px-6 py-3 text-gray-600">Cancelar</button>
                <button onClick={() => handleSubmit('draft')} className="px-6 py-3 bg-gray-200 rounded-xl">Borrador</button>
                <button onClick={() => handleSubmit('published')} className="px-8 py-3 bg-[#CD545B] text-white rounded-xl shadow-lg">Publicar</button>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr><th className="px-6 py-4">Noticia</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4 text-right">Acciones</th></tr>
            </thead>
            <tbody className="divide-y">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 group">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                      {post.featured_image && <img src={post.featured_image} className="w-full h-full object-cover" />}
                    </div>
                    <span className="font-medium">{post.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {post.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(post)} className="p-2 text-gray-400 hover:text-amber-600"><Pencil className="w-5 h-5" /></button>
                      <button onClick={() => handleDelete(post.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default BlogAdmin;




