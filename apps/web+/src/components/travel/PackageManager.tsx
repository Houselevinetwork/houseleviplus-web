// apps/web-plus/components/travel/PackageManager.tsx
// Admin UI for creating and managing travel packages
// Each package: title, description, photographer note, image upload, status

'use client';

import { useState, useEffect, useRef } from 'react';
import type {
  TravelPackage,
  CreatePackageDto,
  UpdatePackageDto,
  PackageStatus,
  PackageType,
} from '@houselevi/travel-api';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// ── Package Manager (list + create/edit panel) ─────────────────────────────

export function PackageManager() {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [editing, setEditing] = useState<TravelPackage | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/travel/packages`, {
        headers: authHeader(),
      });
      const data = await res.json();
      setPackages(Array.isArray(data) ? data : data.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this package? This cannot be undone.')) return;
    await fetch(`${API}/travel/packages/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    });
    load();
  };

  const handleStatusChange = async (id: string, status: PackageStatus) => {
    await fetch(`${API}/travel/packages/${id}/status`, {
      method: 'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  if (creating || editing) {
    return (
      <PackageForm
        package={editing ?? undefined}
        onSave={() => { setEditing(null); setCreating(false); load(); }}
        onCancel={() => { setEditing(null); setCreating(false); }}
      />
    );
  }

  return (
    <div className="package-manager">
      <div className="package-manager__header">
        <h2>Travel Packages</h2>
        <button
          className="package-manager__add-btn"
          onClick={() => setCreating(true)}
        >
          + Add Package
        </button>
      </div>

      {loading && <p className="package-manager__loading">Loading...</p>}

      {!loading && packages.length === 0 && (
        <div className="package-manager__empty">
          <p>No packages yet. Add your first travel package.</p>
        </div>
      )}

      {!loading && packages.length > 0 && (
        <div className="package-manager__list">
          {[...packages].sort((a, b) => a.order - b.order).map(pkg => (
            <PackageRow
              key={pkg.id}
              package={pkg}
              onEdit={() => setEditing(pkg)}
              onDelete={() => handleDelete(pkg.id)}
              onStatusChange={(status) => handleStatusChange(pkg.id, status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Package Row ──────────────────────────────────────────────────────────────

interface PackageRowProps {
  package: TravelPackage;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: PackageStatus) => void;
}

function PackageRow({ package: pkg, onEdit, onDelete, onStatusChange }: PackageRowProps) {
  const statusColors: Record<PackageStatus, string> = {
    draft: '#888',
    active: '#27ae60',
    sold_out: '#c0392b',
    archived: '#888',
  };

  return (
    <div className="package-row">
      <div className="package-row__image">
        {pkg.heroImageUrl
          ? <img src={pkg.heroImageUrl} alt={pkg.destination} />
          : <div className="package-row__image-placeholder" />
        }
      </div>

      <div className="package-row__info">
        <p className="package-row__title">{pkg.title}</p>
        <p className="package-row__meta">
          {pkg.spotsRemaining}/{pkg.groupSizeMax} spots &middot; {pkg.type}
        </p>
      </div>

      <div className="package-row__status">
        <select
          value={pkg.status}
          onChange={e => onStatusChange(e.target.value as PackageStatus)}
          style={{ color: statusColors[pkg.status] }}
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="sold_out">Sold Out</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="package-row__actions">
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete} className="package-row__delete">Delete</button>
      </div>
    </div>
  );
}

// ── Package Form ─────────────────────────────────────────────────────────────

interface PackageFormProps {
  package?: TravelPackage;
  onSave: () => void;
  onCancel: () => void;
}

function PackageForm({ package: existing, onSave, onCancel }: PackageFormProps) {
  const isEdit = !!existing;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CreatePackageDto & { status?: PackageStatus }>({
    destination: existing?.destination ?? '',
    title: existing?.title ?? '',
    tagline: existing?.tagline ?? '',
    taglineColor: existing?.taglineColor ?? 'red',
    description: existing?.description ?? '',
    photographerNote: existing?.photographerNote ?? '',
    type: existing?.type ?? 'group',
    startDate: existing?.startDate ?? '',
    endDate: existing?.endDate ?? '',
    duration: existing?.duration ?? '',
    groupSizeMax: existing?.groupSizeMax ?? 12,
    spotsRemaining: existing?.spotsRemaining ?? 12,
    price: existing?.price,
    currency: existing?.currency ?? 'USD',
    inquiryEmail: existing?.inquiryEmail ?? 'travel@houselevi.com',
    featured: existing?.featured ?? false,
    status: existing?.status ?? 'draft',
  });

  const [imagePreview, setImagePreview] = useState<string>(existing?.heroImageUrl ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      setForm(prev => ({ ...prev, [field]: value }));
    };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let packageId = existing?.id;

      if (isEdit) {
        const res = await fetch(`${API}/travel/packages/${packageId}`, {
          method: 'PUT',
          headers: { ...authHeader(), 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to update package');
      } else {
        const res = await fetch(`${API}/travel/packages`, {
          method: 'POST',
          headers: { ...authHeader(), 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to create package');
        const created = await res.json();
        packageId = created.id ?? created.data?.id;
      }

      // Upload image if provided
      if (imageFile && packageId) {
        const formData = new FormData();
        formData.append('image', imageFile);
        await fetch(`${API}/travel/packages/${packageId}/image`, {
          method: 'POST',
          headers: authHeader(),
          body: formData,
        });
      }

      onSave();
    } catch (err: any) {
      setError(err.message ?? 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="package-form" onSubmit={handleSubmit}>
      <div className="package-form__header">
        <h2>{isEdit ? `Edit: ${existing?.title}` : 'New Travel Package'}</h2>
        <button type="button" className="package-form__cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {/* ── BASIC INFO ── */}
      <fieldset className="package-form__section">
        <legend>Basic Info</legend>

        <div className="package-form__row">
          <div className="package-form__field">
            <label>Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              required
              placeholder="1. Cappadocia (October 2027)"
            />
            <small>Include the number prefix as shown on the site.</small>
          </div>
          <div className="package-form__field">
            <label>Destination *</label>
            <input
              type="text"
              value={form.destination}
              onChange={set('destination')}
              required
              placeholder="Cappadocia, Turkey"
            />
          </div>
        </div>

        <div className="package-form__row">
          <div className="package-form__field">
            <label>Package Type</label>
            <select value={form.type} onChange={set('type')}>
              <option value="group">Group</option>
              <option value="private">Private</option>
              <option value="photography_only">Photography Only</option>
            </select>
          </div>
          <div className="package-form__field">
            <label>Status</label>
            <select value={form.status} onChange={set('status')}>
              <option value="draft">Draft (hidden)</option>
              <option value="active">Active (visible)</option>
              <option value="sold_out">Sold Out</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="package-form__row">
          <div className="package-form__field">
            <label>Tagline</label>
            <input
              type="text"
              value={form.tagline ?? ''}
              onChange={set('tagline')}
              placeholder="Only 5 Spaces Left"
            />
          </div>
          <div className="package-form__field">
            <label>Tagline Color</label>
            <select value={form.taglineColor} onChange={set('taglineColor')}>
              <option value="red">Red (urgency)</option>
              <option value="gold">Gold</option>
            </select>
          </div>
        </div>

        <div className="package-form__field package-form__field--checkbox">
          <label>
            <input
              type="checkbox"
              checked={form.featured ?? false}
              onChange={set('featured')}
            />
            Featured (pinned to top of page)
          </label>
        </div>
      </fieldset>

      {/* ── DESCRIPTION ── */}
      <fieldset className="package-form__section">
        <legend>Description</legend>

        <div className="package-form__field">
          <label>Description *</label>
          <textarea
            value={form.description}
            onChange={set('description')}
            required
            rows={6}
            placeholder="This region in East Central Anatolia in Turkey is among Mother Earth's most surreal..."
          />
        </div>

        <div className="package-form__field">
          <label>Photographer Note</label>
          <textarea
            value={form.photographerNote ?? ''}
            onChange={set('photographerNote')}
            rows={2}
            placeholder="Please note that this trip is specifically for photographers."
          />
          <small>Leave blank if not a photography-specific trip.</small>
        </div>
      </fieldset>

      {/* ── IMAGE UPLOAD ── */}
      <fieldset className="package-form__section">
        <legend>Package Image</legend>

        <div className="package-form__image-upload">
          {imagePreview ? (
            <div className="package-form__image-preview">
              <img src={imagePreview} alt="Preview" />
              <button
                type="button"
                className="package-form__image-remove"
                onClick={() => { setImagePreview(''); setImageFile(null); }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div
              className="package-form__image-dropzone"
              onClick={() => fileRef.current?.click()}
            >
              <p>Click to upload package image</p>
              <small>JPG, PNG, WEBP — recommended 1200×800px</small>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </div>
      </fieldset>

      {/* ── LOGISTICS ── */}
      <fieldset className="package-form__section">
        <legend>Logistics</legend>

        <div className="package-form__row">
          <div className="package-form__field">
            <label>Start Date</label>
            <input type="date" value={form.startDate ?? ''} onChange={set('startDate')} />
          </div>
          <div className="package-form__field">
            <label>End Date</label>
            <input type="date" value={form.endDate ?? ''} onChange={set('endDate')} />
          </div>
          <div className="package-form__field">
            <label>Duration Label</label>
            <input
              type="text"
              value={form.duration ?? ''}
              onChange={set('duration')}
              placeholder="10 Days / 9 Nights"
            />
          </div>
        </div>

        <div className="package-form__row">
          <div className="package-form__field">
            <label>Max Group Size *</label>
            <input
              type="number"
              min={1}
              value={form.groupSizeMax}
              onChange={set('groupSizeMax')}
              required
            />
          </div>
          <div className="package-form__field">
            <label>Spots Remaining *</label>
            <input
              type="number"
              min={0}
              value={form.spotsRemaining}
              onChange={set('spotsRemaining')}
              required
            />
          </div>
        </div>

        <div className="package-form__row">
          <div className="package-form__field">
            <label>Price (per person)</label>
            <input
              type="number"
              value={form.price ?? ''}
              onChange={set('price')}
              placeholder="Leave blank to hide"
            />
          </div>
          <div className="package-form__field">
            <label>Currency</label>
            <input type="text" value={form.currency ?? 'USD'} onChange={set('currency')} />
          </div>
        </div>

        <div className="package-form__field">
          <label>Inquiry Email</label>
          <input
            type="email"
            value={form.inquiryEmail ?? 'travel@houselevi.com'}
            onChange={set('inquiryEmail')}
          />
          <small>Inquiries for this package will be forwarded here.</small>
        </div>
      </fieldset>

      {error && <p className="package-form__error">{error}</p>}

      <div className="package-form__actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" className="package-form__save" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Package'}
        </button>
      </div>
    </form>
  );
}

// ── Auth header helper — replace with your actual auth token getter ──────────
function authHeader(): Record<string, string> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('hl_admin_token')
    : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}