import React, { useState, useEffect, useRef } from 'react';

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
  const imagePreviewRef = useRef(null);

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
        if (imagePreviewRef.current) {
          imagePreviewRef.current.src = url + '?t=' + Date.now();
        }
      } else { alert('Error al subir imagen: ' + (data.error || 'Verifica Cloudinary')); }
    } catch (err) { alert('Error de conexión al subir imagen'); }
    finally { setIsUploading(false); }
  };

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setFormData(prev => ({ ...prev, content: editorRef.current.innerHTML }));
    }
  };

  const handleSubmit = async (status) => {
    const content = editorRef.current ? editorRef.current.innerHTML : formData.content;
    if (!formData.title || !content || content === '  
') {
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
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '400px', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '2rem', border: '1px solid #f3f4f6' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Mikel's Earth</h1>
            <p style={{ color: '#6b7280' }}>Panel de Administración</p>
          </div>
          {error && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '0.75rem', color: '#b91c1c', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <input type="text" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Usuario" value={loginData.username} onChange={(e) => setLoginData({...loginData, username: e.target.value})} required />
            <input type="password" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Contraseña" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} required />
            <button type="submit" style={{ width: '100%', backgroundColor: '#CD545B', color: 'white', padding: '0.75rem', borderRadius: '0.75rem', fontWeight: '500', border: 'none', cursor: 'pointer' }}>Iniciar Sesión</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingBottom: '5rem' }}>
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', height: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Mikel's Blog Admin</span>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>Cerrar Sesión</button>
        </div>
      </header>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.total}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Publicadas</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.published}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Borradores</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.drafts}</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Gestión de Noticias</h2>
          <button onClick={() => { setEditingPost(null); setFormData({ title: '', content: '', category: 'General', image_url: '', status: 'draft' }); setShowForm(true); }} style={{ backgroundColor: '#B7BF10', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>+ Nueva Noticia</button>
        </div>
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '1000px', borderRadius: '1rem', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'white' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{editingPost ? 'Editar Noticia' : 'Crear Nueva Noticia'}</h3>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #d1d5db' }} placeholder="Título de la noticia..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    <select style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #d1d5db' }} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                      <option value="General">Categoría: General</option>
                      <option value="Recetas">Recetas</option>
                      <option value="Salud">Salud</option>
                      <option value="Tradición">Tradición</option>
                      <option value="Eventos">Eventos</option>
                    </select>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <label style={{ flex: 1, cursor: 'pointer', backgroundColor: '#f3f4f6', border: '2px dashed #d1d5db', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{isUploading ? 'Subiendo...' : 'Subir Imagen'}</span>
                        <input type="file" style={{ display: 'none' }} onChange={handleImageUpload} disabled={isUploading} accept="image/*" />
                      </label>
                      {formData.image_url && (
                        <div style={{ width: '80px', height: '80px', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                          <img ref={imagePreviewRef} src={formData.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Contenido</label>
                    <div style={{ border: '1px solid #d1d5db', borderRadius: '0.75rem', overflow: 'hidden' }}>
                      <div style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #d1d5db', padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => applyFormat('bold')} style={{ padding: '0.25rem 0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>B</button>
                        <button onClick={() => applyFormat('italic')} style={{ padding: '0.25rem 0.5rem', fontStyle: 'italic', cursor: 'pointer' }}>I</button>
                        <button onClick={() => applyFormat('insertUnorderedList')} style={{ padding: '0.25rem 0.5rem', cursor: 'pointer' }}>• Lista</button>
                      </div>
                      <div 
                        ref={editorRef}
                        contentEditable 
                        style={{ width: '100%', minHeight: '250px', padding: '1rem', outline: 'none', backgroundColor: 'white' }}
                        onInput={handleEditorChange}
                        suppressContentEditableWarning
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: '#f9fafb' }}>
                <button onClick={() => setShowForm(false)} style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={() => handleSubmit('draft')} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#e5e7eb', borderRadius: '0.75rem', border: 'none', cursor: 'pointer' }}>Borrador</button>
                <button onClick={() => handleSubmit('published')} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#CD545B', color: 'white', borderRadius: '0.75rem', border: 'none', cursor: 'pointer' }}>Publicar</button>
              </div>
            </div>
          </div>
        )}
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Noticia</th>
                <th style={{ padding: '1rem' }}>Estado</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
                      {post.featured_image && <img src={post.featured_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={post.title} />}
                    </div>
                    <span style={{ fontWeight: '500' }}>{post.title}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', backgroundColor: post.status === 'published' ? '#dcfce7' : '#fef3c7', color: post.status === 'published' ? '#166534' : '#92400e' }}>
                      {post.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => startEdit(post)} style={{ marginRight: '0.5rem', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>Editar</button>
                    <button onClick={() => handleDelete(post.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Eliminar</button>
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




