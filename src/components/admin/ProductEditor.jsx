import { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';

export default function ProductEditor({ product, onClose, onSaved }) {
  const { authFetch } = useAdminAuth();
  const isNew = !product;
  const fileInputMain = useRef(null);
  const fileInputGallery = useRef(null);
  
  const [form, setForm] = useState({
    name: '',
    slug: '',
    sku: '',
    description: '',
    longDescription: '',
    price: '',
    originalPrice: '',
    image: '',
    images: [],
    category: 'Aceites',
    tags: [],
    stock: 0,
    weight: '',
    soldOut: false,
    soldOutMessage: '',
    ingredients: '',
    featured: false,
    freeShipping: false,
    limitedEdition: false,
    award: '',
    active: true,
    displayOrder: 0,
    shippingCost: 0,
    preparationCost: 0
  });
  
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Cargar datos completos del producto desde la DB
  useEffect(() => {
    if (product && product.id) {
      setLoading(true);
      authFetch(`${API_URL}/api/admin/web-products/${product.id}`)
        .then(res => res.json())
        .then(data => {
          setForm({
            name: data.name || '',
            slug: data.slug || '',
            sku: data.sku || '',
            description: data.description || '',
            longDescription: data.longDescription || '',
            price: data.price || '',
            originalPrice: data.originalPrice || '',
            image: data.image || '',
            images: data.images || [],
            category: data.category || 'Aceites',
            tags: data.tags || [],
            stock: data.stock || 0,
            weight: data.weight || '',
            soldOut: data.soldOut || false,
            soldOutMessage: data.soldOutMessage || '',
            ingredients: data.ingredients || '',
            featured: data.featured || false,
            freeShipping: data.freeShipping || false,
            limitedEdition: data.limitedEdition || false,
            award: data.award || '',
            active: data.active !== undefined ? data.active : true,
            displayOrder: data.displayOrder || 0,
            shippingCost: data.shippingCost || 0,
            preparationCost: data.preparationCost || 0
          });
          setLoading(false);
        })
        .catch(() => {
          // Fallback: usar datos del listado
          setForm({
            name: product.name || product.web_name || '',
            slug: product.slug || '',
            sku: product.sku || '',
            description: product.description || '',
            longDescription: product.longDescription || '',
            price: product.price || product.web_price || '',
            originalPrice: product.originalPrice || '',
            image: product.image || '',
            images: product.images || [],
            category: product.category || product.web_category || 'Aceites',
            tags: product.tags || [],
            stock: product.stock || 0,
            weight: product.weight || '',
            soldOut: product.soldOut || false,
            soldOutMessage: product.soldOutMessage || '',
            ingredients: product.ingredients || '',
            featured: product.featured || false,
            freeShipping: product.freeShipping || false,
            limitedEdition: product.limitedEdition || false,
            award: product.award || '',
            active: product.active !== undefined ? product.active : true,
            displayOrder: product.displayOrder || 0,
            shippingCost: product.shippingCost || product.shipping_cost || 0,
            preparationCost: product.preparationCost || product.preparation_cost || 0
          });
          setLoading(false);
        });
    }
  }, [product]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'name' && isNew) {
      const slug = value.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setForm(prev => ({ ...prev, slug }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const removeImage = (idx) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  // Subida de imagen
  const uploadImage = async (file, field = 'main') => {
    if (!product || !product.id) {
      setError('Guarda el producto primero antes de subir imágenes');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('field', field);
      
      const res = await authFetch(`${API_URL}/api/admin/web-products/${product.id}/image`, {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        if (field === 'main') {
          setForm(prev => ({ ...prev, image: data.image_url }));
        } else {
          setForm(prev => ({ ...prev, images: [...prev.images, data.image_url] }));
        }
        setSuccess(`Imagen subida: ${data.image_url}`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Error al subir imagen');
      }
    } catch (err) {
      setError('Error de conexión al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e, field) => {
    const file = e.target.files[0];
    if (file) uploadImage(file, field);
  };

  // Drag & Drop
  const handleDrop = (e, field) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      uploadImage(file, field);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  // Construir URL completa para preview de imagen
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // Las imágenes están en el frontend (Vercel)
    return `https://www.mikels.es${path}`;
  };

  const handleSave = async () => {
    setError(null);
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return; }
    if (!form.slug.trim()) { setError('El slug es obligatorio'); return; }
    if (!form.category) { setError('La categoría es obligatoria'); return; }
    if (!form.price || parseFloat(form.price) <= 0) { setError('El precio debe ser mayor que 0'); return; }
    
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
        stock: parseInt(form.stock) || 0,
        displayOrder: parseInt(form.displayOrder) || 0,
        shippingCost: parseFloat(form.shippingCost) || 0,
        preparationCost: parseFloat(form.preparationCost) || 0
      };

      let url, method;
      if (isNew) {
        url = `${API_URL}/api/admin/web-products`;
        method = 'POST';
      } else {
        url = `${API_URL}/api/admin/web-products/${product.id}`;
        method = 'PUT';
      }

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res && res.ok) {
        onSaved();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Error al guardar');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!product) return;
    try {
      const res = await authFetch(`${API_URL}/api/admin/web-products/${product.id}/toggle-active`, {
        method: 'POST'
      });
      if (res && res.ok) {
        onSaved();
        onClose();
      }
    } catch (err) {
      setError('Error al cambiar estado');
    }
  };

  const tabs = [
    { id: 'basic', label: 'Básico', icon: '📝' },
    { id: 'media', label: 'Imágenes', icon: '🖼️' },
    { id: 'details', label: 'Detalles', icon: '📋' },
    { id: 'pricing', label: 'Precios', icon: '💰' },
    { id: 'flags', label: 'Opciones', icon: '⚙️' }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-[#1a1a2e] rounded-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Cargando producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Header con preview */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10">
          {form.image && (
            <img 
              src={getImageUrl(form.image)} 
              alt={form.name} 
              className="w-12 h-12 object-contain rounded-lg bg-white/5 p-1"
              onError={(e) => e.target.style.display='none'}
            />
          )}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">
              {isNew ? 'Nuevo producto' : form.name || 'Sin nombre'}
            </h2>
            {!isNew && <p className="text-xs text-gray-500">{form.sku} · {form.category}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 border-b border-white/5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 border-b-0'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Mensajes */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400 flex items-center gap-2">
              <span>✓</span> {success}
            </div>
          )}

          {/* Tab: Básico */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Nombre *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
                    placeholder="Aceite de Oliva Virgen Extra 5L"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Slug (URL) *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500/50"
                    placeholder="aceite-oliva-virgen-extra-5l"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">SKU</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500/50"
                    placeholder="MIKVE5000"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Categoría *</label>
                  <select
                    value={form.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                  >
                    <option value="Aceites">Aceites</option>
                    <option value="Conservas">Conservas</option>
                    <option value="Packs">Packs</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Descripción corta</label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50 resize-none"
                  placeholder="Descripción breve del producto (se muestra en la tarjeta)"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Descripción larga</label>
                <textarea
                  value={form.longDescription}
                  onChange={(e) => handleChange('longDescription', e.target.value)}
                  rows={5}
                  className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50 resize-y"
                  placeholder="Descripción completa del producto (se muestra en la página de detalle). Puedes usar Markdown."
                />
              </div>
              {/* Tags */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Tags</label>
                <div className="flex flex-wrap gap-1.5 mt-2 mb-2 min-h-[32px]">
                  {form.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[11px] rounded-full border border-emerald-500/20 flex items-center gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-emerald-400/60 hover:text-red-400 ml-0.5">✕</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
                    placeholder="Añadir tag..."
                  />
                  <button onClick={addTag} className="px-3 py-2 bg-emerald-500/10 text-emerald-400 text-sm rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20">+</button>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Imágenes - MEJORADO con previews y subida */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              
              {/* Imagen principal */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2 block">Imagen principal</label>
                <div className="flex gap-4 items-start">
                  {/* Preview grande */}
                  <div 
                    className={`w-40 h-40 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-white/5 transition-all ${
                      dragOver ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10'
                    } ${!form.image ? 'cursor-pointer hover:border-white/30' : ''}`}
                    onDrop={(e) => handleDrop(e, 'main')}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => !form.image && fileInputMain.current?.click()}
                  >
                    {form.image ? (
                      <img 
                        src={getImageUrl(form.image)} 
                        alt="Principal" 
                        className="w-full h-full object-contain p-2"
                        onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                      />
                    ) : (
                      <div className="text-center p-3">
                        <p className="text-2xl mb-1">📷</p>
                        <p className="text-[10px] text-gray-500">Arrastra o haz clic</p>
                      </div>
                    )}
                    {form.image && <div className="hidden w-full h-full items-center justify-center text-gray-500 text-xs">No se pudo cargar</div>}
                  </div>
                  
                  {/* Controles */}
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.image}
                        onChange={(e) => handleChange('image', e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                        placeholder="/images/products/mi-producto.webp"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => fileInputMain.current?.click()}
                        disabled={uploading || isNew}
                        className="px-3 py-2 bg-blue-500/10 text-blue-400 text-xs rounded-lg border border-blue-500/20 hover:bg-blue-500/20 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        📤 Subir imagen
                      </button>
                      {form.image && (
                        <button 
                          onClick={() => handleChange('image', '')}
                          className="px-3 py-2 bg-red-500/10 text-red-400 text-xs rounded-lg border border-red-500/20 hover:bg-red-500/20"
                        >
                          🗑️ Quitar
                        </button>
                      )}
                    </div>
                    {isNew && <p className="text-[10px] text-amber-400">Guarda el producto primero para poder subir imágenes</p>}
                    {uploading && <p className="text-[10px] text-blue-400 animate-pulse">Subiendo imagen...</p>}
                    <p className="text-[10px] text-gray-600">Formatos: jpg, png, webp, avif · Arrastra la imagen sobre el recuadro</p>
                  </div>
                </div>
                <input ref={fileInputMain} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'main')} />
              </div>

              {/* Galería */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2 block">
                  Galería ({form.images.length} imágenes)
                </label>
                
                {/* Grid de previews */}
                {form.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 bg-white/5 aspect-square">
                        <img 
                          src={getImageUrl(img)} 
                          alt={`Img ${idx+1}`} 
                          className="w-full h-full object-contain p-2"
                          onError={(e) => { e.target.src = ''; e.target.alt = '⚠️ Error'; }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => removeImage(idx)}
                            className="w-7 h-7 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            🗑️
                          </button>
                          <button
                            onClick={() => handleChange('image', img)}
                            className="w-7 h-7 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-blue-600"
                            title="Usar como principal"
                          >
                            ⭐
                          </button>
                        </div>
                        <p className="absolute bottom-0 left-0 right-0 text-[8px] text-gray-500 bg-black/50 px-1 py-0.5 truncate">{img.split('/').pop()}</p>
                      </div>
                    ))}
                    
                    {/* Botón añadir */}
                    <div 
                      className="rounded-xl border-2 border-dashed border-white/10 aspect-square flex items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
                      onClick={() => fileInputGallery.current?.click()}
                      onDrop={(e) => handleDrop(e, 'gallery')}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <div className="text-center">
                        <p className="text-xl">+</p>
                        <p className="text-[9px] text-gray-500">Añadir</p>
                      </div>
                    </div>
                  </div>
                )}

                {form.images.length === 0 && (
                  <div 
                    className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
                    onClick={() => fileInputGallery.current?.click()}
                    onDrop={(e) => handleDrop(e, 'gallery')}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <p className="text-2xl mb-1">🖼️</p>
                    <p className="text-xs text-gray-500">Arrastra imágenes aquí o haz clic para añadir a la galería</p>
                  </div>
                )}
                
                <input ref={fileInputGallery} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'gallery')} />
              </div>
            </div>
          )}

          {/* Tab: Detalles */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Peso / Volumen</label>
                  <input
                    type="text"
                    value={form.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
                    placeholder="5 Litros"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => handleChange('stock', e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Ingredientes</label>
                <textarea
                  value={form.ingredients}
                  onChange={(e) => handleChange('ingredients', e.target.value)}
                  rows={3}
                  className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50 resize-none"
                  placeholder="100% Aceite de Oliva Virgen Extra. Variedad: Arbequina y Empeltre."
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Premio / Distinción</label>
                <input
                  type="text"
                  value={form.award}
                  onChange={(e) => handleChange('award', e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  placeholder="Medalla de Oro - Concurso Internacional 2024"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Orden de visualización</label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => handleChange('displayOrder', e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  placeholder="0 = primero"
                />
                <p className="text-[10px] text-gray-600 mt-1">Los productos se ordenan de menor a mayor. 0 aparece primero.</p>
              </div>
            </div>
          )}

          {/* Tab: Precios y costes */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-emerald-400 uppercase tracking-wider font-medium">Precio web (con IVA) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-emerald-500/20 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500/50"
                    placeholder="33.00"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Precio original (tachado)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.originalPrice}
                    onChange={(e) => handleChange('originalPrice', e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500/50"
                    placeholder="39.90 (opcional, para mostrar descuento)"
                  />
                </div>
              </div>
              <div className="p-3 bg-white/[0.02] rounded-lg border border-white/5">
                <p className="text-xs text-gray-500 mb-3">Costes logísticos (para cálculo de margen)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-orange-400 uppercase tracking-wider font-medium">Coste portes (€/ud)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.shippingCost}
                      onChange={(e) => handleChange('shippingCost', e.target.value)}
                      className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-orange-500/20 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-purple-400 uppercase tracking-wider font-medium">Coste preparación (€/ud)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.preparationCost}
                      onChange={(e) => handleChange('preparationCost', e.target.value)}
                      className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-purple-500/20 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Opciones */}
          {activeTab === 'flags' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {[
                  { field: 'active', label: 'Producto activo (visible en la web)', color: 'emerald', desc: 'Si se desactiva, el producto desaparece de la tienda online. Los clientes no podrán verlo ni comprarlo. Útil para productos de temporada o descatalogados.' },
                  { field: 'soldOut', label: 'Agotado (muestra mensaje de agotado)', color: 'red', desc: 'El producto sigue visible en la web pero no se puede comprar. Se muestra un mensaje personalizable (ej: "En cosecha - Disponible pronto") en lugar del botón de compra.' },
                  { field: 'featured', label: 'Destacado', color: 'amber', desc: 'El producto aparece en la sección de destacados de la página principal. Ideal para promocionar productos nuevos o de temporada.' },
                  { field: 'freeShipping', label: 'Envío gratuito', color: 'blue', desc: 'Se muestra un badge de "Envío gratis" en la ficha del producto. El cliente no paga gastos de envío al comprar este producto.' },
                  { field: 'limitedEdition', label: 'Edición limitada', color: 'purple', desc: 'Se muestra un badge de "Edición Limitada" en la ficha del producto. Genera urgencia y exclusividad para el cliente.' }
                ].map(({ field, label, color, desc }) => (
                  <div key={field} className="p-3 bg-white/[0.02] rounded-lg border border-white/5 hover:bg-white/[0.04] transition-all">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form[field]}
                        onChange={(e) => handleChange(field, e.target.checked)}
                        className={`w-4 h-4 rounded border-white/20 bg-white/5 text-${color}-500 focus:ring-${color}-500/20`}
                      />
                      <span className="text-sm text-gray-300">{label}</span>
                    </label>
                    <p className="text-[11px] text-gray-500 mt-1.5 ml-7 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
              {form.soldOut && (
                <div>
                  <label className="text-xs text-red-400 uppercase tracking-wider font-medium">Mensaje de agotado</label>
                  <input
                    type="text"
                    value={form.soldOutMessage}
                    onChange={(e) => handleChange('soldOutMessage', e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-red-500/20 rounded-lg text-sm text-white focus:outline-none focus:border-red-500/50"
                    placeholder="En cosecha - Disponible pronto"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <div>
            {!isNew && (
              <button
                onClick={handleToggleActive}
                className={`px-4 py-2 text-xs rounded-lg border transition-all font-medium ${
                  form.active
                    ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                }`}
              >
                {form.active ? '🚫 Desactivar' : '✓ Activar'}
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm rounded-xl border border-emerald-500/30 transition-all disabled:opacity-50 font-medium"
            >
              {saving ? 'Guardando...' : isNew ? 'Crear producto' : '💾 Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
