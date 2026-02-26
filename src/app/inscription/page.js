'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const sf = "'Outfit', sans-serif";
const ss = "'Cormorant Garamond', 'Georgia', serif";

export default function Inscription() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', salonName: '', phone: '', city: '' });

  const update = (field, value) => setForm({ ...form, [field]: value });

  const handleStep1 = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      setStep(2);
    } catch (err) {
      setError('Une erreur est survenue.');
    }
    setLoading(false);
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Session expirée. Reconnecte-toi.');
        setLoading(false);
        return;
      }

      const slug = form.salonName
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const { error: salonError } = await supabase.from('salons').insert({
        owner_id: user.id,
        name: form.salonName,
        slug: slug,
        phone: form.phone,
        city: form.city,
      });

      if (salonError) {
        setError(salonError.message);
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('Une erreur est survenue.');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px', border: '1px solid #E8E8E4',
    fontFamily: sf, fontSize: 14, fontWeight: 300, outline: 'none',
    background: '#FFF', marginBottom: 12,
  };

  const btnStyle = {
    width: '100%', padding: '16px', background: '#1A1A1A', color: '#FFF',
    border: 'none', fontFamily: sf, fontSize: 12, fontWeight: 600,
    letterSpacing: 2.5, textTransform: 'uppercase', cursor: 'pointer',
    marginTop: 8,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 48, height: 48, background: '#1A1A1A', borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <span style={{ color: '#FFF', fontFamily: ss, fontSize: 20, fontWeight: 600 }}>MP</span>
            </div>
            <div style={{ fontFamily: sf, fontSize: 16, fontWeight: 600, letterSpacing: 6, textTransform: 'uppercase' }}>MY PRESTY</div>
          </Link>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          <div style={{ flex: 1, height: 3, background: '#1A1A1A' }} />
          <div style={{ flex: 1, height: 3, background: step >= 2 ? '#1A1A1A' : '#E8E8E4' }} />
        </div>

        {step === 1 && (
          <form onSubmit={handleStep1}>
            <h1 style={{ fontFamily: ss, fontSize: 30, fontWeight: 300, marginBottom: 8 }}>Crée ton espace</h1>
            <p style={{ fontFamily: sf, fontSize: 13, color: '#999', marginBottom: 28 }}>Étape 1/2 — Ton compte</p>

            <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="ton@email.com" style={inputStyle} />

            <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 6 }}>Mot de passe</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Minimum 6 caractères" style={inputStyle} />

            {error && <p style={{ fontFamily: sf, fontSize: 12, color: '#EF4444', marginBottom: 12 }}>{error}</p>}

            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.5 : 1 }}>
              {loading ? 'Création...' : 'Continuer →'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2}>
            <h1 style={{ fontFamily: ss, fontSize: 30, fontWeight: 300, marginBottom: 8 }}>Ton salon</h1>
            <p style={{ fontFamily: sf, fontSize: 13, color: '#999', marginBottom: 28 }}>Étape 2/2 — Les infos de ton établissement</p>

            <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 6 }}>Nom du salon</label>
            <input type="text" required value={form.salonName} onChange={(e) => update('salonName', e.target.value)} placeholder="Ex: Beauty Lounge Paris" style={inputStyle} />

            <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 6 }}>Téléphone</label>
            <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="06 12 34 56 78" style={inputStyle} />

            <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 6 }}>Ville</label>
            <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Paris" style={inputStyle} />

            {error && <p style={{ fontFamily: sf, fontSize: 12, color: '#EF4444', marginBottom: 12 }}>{error}</p>}

            <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.5 : 1 }}>
              {loading ? 'Création...' : 'Lancer mon espace ✦'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', fontFamily: sf, fontSize: 13, color: '#999', marginTop: 24 }}>
          Déjà inscrite ? <Link href="/connexion" style={{ color: '#1A1A1A', fontWeight: 500, textDecoration: 'none' }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
