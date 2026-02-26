import Link from 'next/link';

const sf = "'Outfit', sans-serif";
const ss = "'Cormorant Garamond', 'Georgia', serif";

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 24px', textAlign: 'center' }}>

      {/* Logo */}
      <div style={{ width: 56, height: 56, background: '#1A1A1A', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <span style={{ color: '#FFF', fontFamily: ss, fontSize: 24, fontWeight: 600 }}>MP</span>
      </div>
      <div style={{ fontFamily: sf, fontSize: 20, fontWeight: 600, letterSpacing: 8, textTransform: 'uppercase', marginBottom: 8 }}>MY PRESTY</div>
      <div style={{ fontFamily: sf, fontSize: 11, letterSpacing: 3, color: '#BBB', textTransform: 'uppercase', marginBottom: 48 }}>Beauté · Simplifiée</div>

      {/* Headline */}
      <h1 style={{ fontFamily: ss, fontSize: 52, fontWeight: 300, lineHeight: 1.1, marginBottom: 20, maxWidth: 600 }}>
        Ton logiciel de réservation <em style={{ fontStyle: 'italic', fontWeight: 400 }}>beauté</em>
      </h1>
      <p style={{ fontFamily: sf, fontSize: 16, color: '#888', fontWeight: 300, lineHeight: 1.7, maxWidth: 460, marginBottom: 16 }}>
        Agenda, réservations, fichier client, paiement en ligne, rappels automatiques. Tout ce dont tu as besoin.
      </p>
      <p style={{ fontFamily: sf, fontSize: 15, fontWeight: 500, marginBottom: 48 }}>
        19€/mois · Tout illimité · Sans engagement
      </p>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/inscription" style={{
          padding: '16px 40px', background: '#1A1A1A', color: '#FFF',
          fontFamily: sf, fontSize: 13, fontWeight: 600, letterSpacing: 2,
          textTransform: 'uppercase', textDecoration: 'none',
        }}>
          Créer mon espace ✦
        </Link>
        <Link href="/connexion" style={{
          padding: '16px 32px', border: '1px solid #D4D4D4',
          fontFamily: sf, fontSize: 13, fontWeight: 400, letterSpacing: 2,
          textTransform: 'uppercase', textDecoration: 'none', color: '#666',
        }}>
          Se connecter
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 48, marginTop: 64, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { value: '19€', label: 'Par mois' },
          { value: '♾️', label: 'Tout illimité' },
          { value: '0€', label: 'Frais cachés' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontWeight: 300 }}>{s.value}</p>
            <p style={{ fontFamily: sf, fontSize: 10, color: '#BBB', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Early bird */}
      <p style={{ fontFamily: sf, fontSize: 12, color: '#CCC', marginTop: 48 }}>
        🎁 3 mois offerts pour les 100 premières inscrites
      </p>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 20, fontFamily: sf, fontSize: 10, color: '#DDD', letterSpacing: 2 }}>
        © 2026 MY PRESTY
      </div>
    </div>
  );
}
