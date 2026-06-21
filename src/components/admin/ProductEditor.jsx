import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';

export default function ProductEditor({ product, onClose, onSaved }) {
  const { authFetch } = useAdminAuth();
  const isNew = !product;
  
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
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [newTag, setNewTag] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        slug: product.slug || '',
        sku: product.sku || '',
        description: product.description || '',
        longDescription: product.longDescription || '',
        price: product.price || product.web_price || '',
        originalPrice: product.originalPrice || '',
        image: product.image || '',
        images: product.images || [],
        category: product.category || 'Aceites',
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
    }
  }, [product]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Auto-generar slug desde el nombre (solo si es nuevo producto)
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

  const addImage = () => {
    if (newImageUrl.trim()) {
      setForm(prev => ({ ...prev, images: [...prev.images, newImageUrl.trim()] }));
      setNewImageUrl('');
    }
  };

  const removeImage = (idx) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    setError(null);
    
    // Validaciones
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
    { id: 'basic', label: 'Básico' },
    { id: 'media', label: 'Imágenes' },
    { id: 'details', label: 'Detalles' },
    { id: 'pricing', label: 'Precios y costes' },
    { id: 'flags', label: 'Opciones' }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">
            {isNew ? 'Nuevo producto' : `Editar: ${product.name}`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-white/5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 border-b-0'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {error}
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
                  placeholder="Descripción breve que aparece en la tarjeta del producto"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Descripción larga (detalle)</label>
                <textarea
                  value={form.longDescription}
                  onChange={(e) => handleChange('longDescription', e.target.value)}
                  rows={4}
                  className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50 resize-none"
                  placeholder="Descripción completa que aparece en la página de detalle del producto"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Tags</label>
                <div className="flex flex-wrap gap-2 mt-1 mb-2">
                  {form.tags.map((tag, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-lg border border-emerald-500/20">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-emerald-400/60 hover:text-red-400">✕</button>
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

          {/* Tab: Imágenes */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Imagen principal (URL)</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => handleChange('image', e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  placeholder="/images/products/aceite-5l.webp"
                />
                {form.image && (
                  <div className="mt-2 p-2 bg-white/5 rounded-lg inline-block">
                    <img src={form.image} alt="Preview" className="h-24 object-contain rounded" onError={(e) => e.target.style.display='none'} />
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Galería de imágenes</label>
                <div className="grid grid-cols-4 gap-2 mt-2 mb-3">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative group p-1 bg-white/5 rounded-lg border border-white/10">
                      <img src={img} alt={`Img ${idx+1}`} className="h-16 w-full object-contain rounded" onError={(e) => e.target.style.display='none'} />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        ✕
                      </button>
                      <p className="text-[9px] text-gray-500 truncate mt-1">{img.split('/').pop()}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
                    placeholder="/images/products/foto-2.webp"
                  />
                  <button onClick={addImage} className="px-3 py-2 bg-emerald-500/10 text-emerald-400 text-sm rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20">+ Añadir</button>
                </div>
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
          )}

          {/* Tab: Opciones */}
          {activeTab === 'flags' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {[
                  { field: 'active', label: 'Producto activo (visible en la web)', color: 'emerald' },
                  { field: 'soldOut', label: 'Agotado (muestra mensaje de agotado)', color: 'red' },
                  { field: 'featured', label: 'Destacado', color: 'amber' },
                  { field: 'freeShipping', label: 'Envío gratuito', color: 'blue' },
                  { field: 'limitedEdition', label: 'Edición limitada', color: 'purple' }
                ].map(({ field, label, color }) => (
                  <label key={field} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-all">
                    <input
                      type="checkbox"
                      checked={form[field]}
                      onChange={(e) => handleChange(field, e.target.checked)}
                      className={`w-4 h-4 rounded border-white/20 bg-white/5 text-${color}-500 focus:ring-${color}-500/20`}
                    />
                    <span className="text-sm text-gray-300">{label}</span>
                  </label>
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
                {form.active ? 'Desactivar producto' : 'Activar producto'}
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
              {saving ? 'Guardando...' : isNew ? 'Crear producto' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
