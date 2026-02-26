'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const sf = "'Outfit', sans-serif";
const ss = "'Cormorant Garamond', 'Georgia', serif";

// Traduction des erreurs Supabase en français
function translateError(msg) {
  if (!msg) return 'Une erreur est survenue.';
  const m = msg.toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid_credentials')) return 'Email ou mot de passe incorrect.';
  if (m.includes('email not confirmed')) return 'Ton email n\'est pas encore confirmé. Vérifie ta boîte mail !';
  if (m.includes('too many requests')) return 'Trop de tentatives. Attends un peu avant de réessayer.';
  if (m.includes('network')) return 'Erreur de connexion. Vérifie ta connexion internet.';
  if (m.includes('invalid email')) return 'Adresse email invalide.';
  if (m.includes('user not found')) return 'Aucun compte trouvé avec cet email.';
  if (m.includes('email rate limit')) return 'Trop de tentatives. Attends quelques minutes.';
  return msg;
}

export default function Connexion() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(translateError(authError.message));
        setLoading(false);
        return;
      }

      // Vérifier si l'utilisateur a un salon
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: salons } = await supabase.from('salons').select('id').eq('owner_id', user.id).limit(1);
        if (!salons || salons.length === 0) {
          // Pas de salon → aller à l'inscription étape 2
          router.push('/inscription');
          return;
        }
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

        <form onSubmit={handleLogin}>
          <h1 style={{ fontFamily: ss, fontSize: 30, fontWeight: 300, marginBottom: 8 }}>Connexion</h1>
          <p style={{ fontFamily: sf, fontSize: 13, color: '#999', marginBottom: 28 }}>Accède à ton espace MY PRESTY</p>

          <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 6 }}>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ton@email.com" style={inputStyle} />

          <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 6 }}>Mot de passe</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Ton mot de passe" style={inputStyle} />

          {error && <p style={{ fontFamily: sf, fontSize: 12, color: '#EF4444', marginBottom: 12 }}>{error}</p>}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '16px', background: '#1A1A1A', color: '#FFF',
            border: 'none', fontFamily: sf, fontSize: 12, fontWeight: 600,
            letterSpacing: 2.5, textTransform: 'uppercase', cursor: 'pointer',
            marginTop: 8, opacity: loading ? 0.5 : 1,
          }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontFamily: sf, fontSize: 13, color: '#999', marginTop: 24 }}>
          Pas encore inscrite ? <Link href="/inscription" style={{ color: '#1A1A1A', fontWeight: 500, textDecoration: 'none' }}>Créer mon espace</Link>
        </p>
      </div>
    </div>
  );
}
