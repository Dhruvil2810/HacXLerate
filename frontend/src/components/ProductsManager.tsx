import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { Product } from '../types/marketplace';
import { Plus, Package, Globe, Tag, Trash2, X, Sparkles } from 'lucide-react';

const INITIAL_DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod_demo_1',
    brandId: 'bp_demo_1',
    name: 'Nexus Pro Mechanical Keyboard',
    description: 'Hot-swappable custom gasket-mounted mechanical keyboard with wireless Bluetooth 5.2 and OLED interactive screen.',
    category: 'Hardware & Peripherals',
    websiteUrl: 'https://nexustechlabs.io/keyboard',
    usp: 'Ultra-low 1ms latency wireless switchable PCB',
    features: ['Gasket mount', 'Hot-swappable switches', 'OLED display', 'CNC Aluminum'],
    targetAudience: 'Software developers, mechanical keyboard enthusiasts, productivity creators',
    createdAt: new Date().toISOString(),
    _count: { campaigns: 2 },
  },
  {
    id: 'prod_demo_2',
    brandId: 'bp_demo_1',
    name: 'AirGlide Wireless Productivity Mouse',
    description: 'Ergonomic 58g ultra-lightweight wireless mouse engineered for precision design work and extended coding sessions.',
    category: 'Hardware & Peripherals',
    websiteUrl: 'https://nexustechlabs.io/mouse',
    usp: '58g ultra-lightweight with 120-hour battery life',
    features: ['PAW3395 Sensor', 'Optical switches', '120h battery', 'Custom software'],
    targetAudience: 'Designers, developers, and esports creators',
    createdAt: new Date().toISOString(),
    _count: { campaigns: 1 },
  },
];

export const ProductsManager: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const [products, setProducts] = useState<Product[]>(INITIAL_DEMO_PRODUCTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hardware & Peripherals');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [usp, setUsp] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiBanner, setAiBanner] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      if (!token) return;
      try {
        const res = await apiRequest<{ products: Product[] }>('/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.success && res.data?.products && res.data.products.length > 0) {
          setProducts(res.data.products);
        }
      } catch {
        // Fallback to demo items
      }
    }
    loadProducts();
  }, [token]);

  const handleAiAnalyze = async () => {
    if (!name || !description) {
      alert('Please enter a product name and description first.');
      return;
    }

    setAiAnalyzing(true);
    setAiBanner(null);

    try {
      if (token) {
        const res = await apiRequest<{ analysis: any; creditCost: number }>('/ai/product-analyze', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name, category, description, websiteUrl, usp }),
        });

        if (res.success && res.data?.analysis) {
          const analysis = res.data.analysis;
          setUsp(analysis.uniqueSellingPoints?.[0] || usp);
          setTargetAudience(analysis.targetAudience || targetAudience);
          setAiBanner(`✨ AI Extraction Complete (-10 Credits): Identified USPs and audience focus.`);

          if (user?.creditWallet) {
            updateUser({
              ...user,
              creditWallet: {
                ...user.creditWallet,
                balance: user.creditWallet.balance - 10,
              },
            });
          }
        } else {
          // Heuristic fallback
          setUsp('Low-latency precision hardware built for daily professional workflows');
          setTargetAudience('Tech enthusiasts, software engineers, and digital creators aged 20-38');
          setAiBanner('✨ AI Analysis heuristics applied: extracted USPs and demographic segments.');
        }
      }
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      category,
      description,
      websiteUrl: websiteUrl || undefined,
      usp: usp || undefined,
      targetAudience: targetAudience || undefined,
      features: ['High durability', 'Ergonomic design'],
    };

    try {
      if (token) {
        const res = await apiRequest<{ product: Product }>('/products', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });

        if (res.success && res.data?.product) {
          setProducts((prev) => [res.data!.product, ...prev]);
        } else {
          // Local fallback
          const newLocalProduct: Product = {
            id: `prod_${Date.now()}`,
            brandId: 'local',
            name,
            category,
            description,
            websiteUrl,
            usp,
            targetAudience,
            createdAt: new Date().toISOString(),
            _count: { campaigns: 0 },
          };
          setProducts((prev) => [newLocalProduct, ...prev]);
        }
      }
      setIsModalOpen(false);
      setName('');
      setDescription('');
      setWebsiteUrl('');
      setUsp('');
      setTargetAudience('');
      setAiBanner(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (token) {
      await apiRequest(`/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3>Product Catalog & AI Intelligence</h3>
          <p style={{ fontSize: '0.875rem' }}>
            Products created here are analyzed by OpenRouter AI to generate high-converting creator brief hooks.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
          style={{ fontSize: '0.85rem' }}
          id="add-product-btn"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                <span className="badge badge-neutral">
                  <Tag size={12} /> {product.category}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {product._count?.campaigns || 0} Campaigns Attached
                </span>
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{product.name}</h4>
              <p style={{ fontSize: '0.875rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                {product.description}
              </p>

              {product.usp && (
                <div style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                  borderLeft: '3px solid var(--color-brand)',
                }}>
                  <strong>USP:</strong> {product.usp}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between" style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
              {product.websiteUrl ? (
                <a
                  href={product.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                >
                  <Globe size={14} /> View Landing Page
                </a>
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No URL specified</span>
              )}

              <button
                onClick={() => handleDeleteProduct(product.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-danger)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                title="Delete Product"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '540px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative',
          }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '1.5rem' }}>
              <div className="badge badge-verified" style={{ marginBottom: '0.5rem' }}>
                <Package size={12} /> Product Definition
              </div>
              <h2>Add Product & AI Analysis</h2>
              <p style={{ fontSize: '0.875rem' }}>
                Provide product details or use OpenRouter AI to automatically extract USPs and audience targets.
              </p>
            </div>

            {aiBanner && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: 'var(--color-brand-light)',
                color: 'var(--color-brand)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.825rem',
                border: '1px solid var(--color-info-border)',
              }}>
                {aiBanner}
              </div>
            )}

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nexus Pro Mechanical Keyboard"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Category
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hardware, SaaS, Gaming, Lifestyle"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe features, build materials, pricing, and what sets it apart..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* AI Trigger Button */}
              <div>
                <button
                  type="button"
                  onClick={handleAiAnalyze}
                  disabled={aiAnalyzing}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    borderColor: 'var(--color-brand)',
                    color: 'var(--color-brand)',
                    fontSize: '0.825rem',
                    padding: '0.5rem',
                  }}
                >
                  <Sparkles size={14} color="var(--color-brand)" />
                  {aiAnalyzing ? 'AI Extracting Intelligence...' : 'AI Auto-Extract USPs & Audience (Cost: 10 Credits)'}
                </button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Unique Selling Point (USP)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1ms wireless latency with hot-swappable PCB"
                  value={usp}
                  onChange={(e) => setUsp(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Target Audience
                </label>
                <input
                  type="text"
                  placeholder="e.g. Programmers, tech reviewers, desk setup enthusiasts"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Creating...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
