'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const sf = "'Outfit', sans-serif";
const ss = "'Cormorant Garamond', 'Georgia', serif";

// Traduction des erreurs Supabase en français
function translateError(msg) {
  if (!msg) return 'Une erreur est survenue.';
  const m = msg.toLowerCase();
  if (m.includes('user already registered')) return 'Cette adresse email est déjà utilisée. Connecte-toi plutôt !';
  if (m.includes('email rate limit') || m.includes('rate limit')) return 'Un email de confirmation a déjà été envoyé. Vérifie ta boîte mail (et tes spams) !';
  if (m.includes('password') && m.includes('6')) return 'Le mot de passe doit contenir au moins 6 caractères.';
  if (m.includes('password') && m.includes('characters')) return 'Le mot de passe doit contenir au moins 6 caractères.';
  if (m.includes('invalid email')) return 'Adresse email invalide.';
  if (m.includes('signup is disabled')) return 'Les inscriptions sont temporairement désactivées.';
  if (m.includes('email not confirmed')) return 'Ton email n\'est pas encore confirmé. Vérifie ta boîte mail !';
  if (m.includes('invalid login')) return 'Email ou mot de passe incorrect.';
  if (m.includes('too many requests')) return 'Trop de tentatives. Attends un peu avant de réessayer.';
  if (m.includes('network')) return 'Erreur de connexion. Vérifie ta connexion internet.';
  if (m.includes('already') && m.includes('exists')) return 'Ce salon existe déjà. Choisis un autre nom.';
  if (m.includes('duplicate') || m.includes('unique')) return 'Ce nom de salon est déjà pris. Choisis un autre nom.';
  if (m.includes('violates row-level security')) return 'Erreur de permissions. Reconnecte-toi et réessaie.';
  return msg;
}

export default function Inscription() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', salonName: '', phone: '', city: '' });
  const [emailSent, setEmailSent] = useState(false);

  const update = (field, value) => setForm({ ...form, [field]: value });

  // Vérifie si l'utilisateur revient après avoir confirmé son email
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: salons } = await supabase.from('salons').select('id').eq('owner_id', user.id).limit(1);
        if (salons && salons.length > 0) {
          router.push('/dashboard');
        } else {
          setStep(2);
        }
      }
    }
    checkUser();

    // Écouter les changements d'auth (quand l'utilisateur confirme son email)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setStep(2);
        setEmailSent(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStep1 = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/inscription`,
        },
      });

      if (authError) {
        setError(translateError(authError.message));
        setLoading(false);
        return;
      }

      // Vérifier si Supabase a créé une session (email confirmation désactivée)
      if (data.session) {
        setStep(2);
      } else {
        // Email de confirmation envoyé
        setEmailSent(true);
      }
    } catch (err) {
      setError('Une erreur est survenue. Réessaie.');
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
        setError('Tu dois d\'abord confirmer ton email. Vérifie ta boîte mail !');
        setLoading(false);
        return;
      }

      const slug = form.salonName
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const trialStart = new Date().toISOString();
      const trialEnd = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

      const { error: salonError } = await supabase.from('salons').insert({
        owner_id: user.id,
        name: form.salonName,
        slug: slug,
        phone: form.phone,
        city: form.city,
        trial_start: trialStart,
        trial_end: trialEnd,
        subscription_status: 'trial',
      });

      if (salonError) {
        setError(translateError(salonError.message));
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('Une erreur est survenue. Réessaie.');
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

        {/* ÉTAPE 1 : Email + Mot de passe */}
        {step === 1 && !emailSent && (
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

        {/* EMAIL ENVOYÉ — En attente de confirmation */}
        {step === 1 && emailSent && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: '#F0FDF4', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 28 }}>✉️</span>
            </div>
            <h1 style={{ fontFamily: ss, fontSize: 28, fontWeight: 300, marginBottom: 12 }}>Vérifie ta boîte mail !</h1>
            <p style={{ fontFamily: sf, fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 8 }}>
              Un email a été envoyé à <strong>{form.email}</strong>
            </p>
            <p style={{ fontFamily: sf, fontSize: 13, color: '#999', lineHeight: 1.6, marginBottom: 24 }}>
              Clique sur le lien dans le mail pour activer ton compte.
              <br />Ensuite, reviens ici pour créer ton salon.
            </p>
            <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', padding: '14px 18px', marginBottom: 20, textAlign: 'left' }}>
              <p style={{ fontFamily: sf, fontSize: 12, color: '#92400E' }}>
                💡 Pense à vérifier tes spams si tu ne vois pas le mail !
              </p>
            </div>
            <button onClick={() => { setEmailSent(false); setError(''); }} style={{ ...btnStyle, background: 'transparent', color: '#999', border: '1px solid #E8E8E4' }}>
              ← Changer d'email
            </button>
          </div>
        )}

        {/* ÉTAPE 2 : Infos du salon */}
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
