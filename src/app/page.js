import Link from 'next/link';

const sf = "'Outfit', sans-serif";
const ss = "'Cormorant Garamond', 'Georgia', serif";

const features = [
  { icon: '▦', title: 'Agenda en ligne', desc: 'Tes clientes réservent 24h/24. Vue jour, semaine, mois. Tout se synchronise en temps réel.' },
  { icon: '◎', title: 'Équipe illimitée', desc: '1 ou 50 personnes, même prix. Chaque membre a son planning, ses prestations, ses couleurs.' },
  { icon: '♡', title: 'Fichier client', desc: 'Historique complet, notes, préférences, alertes allergies. Tu connais chaque cliente par cœur.' },
  { icon: '📧', title: 'Rappels automatiques', desc: 'Email envoyé automatiquement avant chaque RDV. Fini les no-show et les oublis.' },
  { icon: '💳', title: 'Paiement en ligne', desc: 'Acomptes, paiement CB sécurisé via Stripe. Ton CA directement sur ton compte.' },
  { icon: '🔗', title: 'Ton lien perso', desc: 'mypresty.com/ton-salon — Un lien unique à mettre partout : bio Insta, vitrine, cartes de visite.' },
];

const steps = [
  { num: '01', title: 'Crée ton compte', desc: 'Email, mot de passe, nom de ton salon. 30 secondes.' },
  { num: '02', title: 'Configure tes prestations', desc: 'Ajoute tes services, tes prix, ta durée, ton équipe.' },
  { num: '03', title: 'Partage ton lien', desc: 'Mets ton lien sur Instagram, en vitrine, partout. Tes clientes réservent en autonomie.' },
];

const personas = [
  { title: 'Prothésiste ongulaire', desc: 'Tu travailles seule depuis chez toi ou en institut. Tu gères tout toi-même.' },
  { title: 'Coiffeuse indépendante', desc: 'Tu as ton propre salon ou tu loues un fauteuil. Tu veux un outil simple.' },
  { title: 'Esthéticienne', desc: 'Soins visage, épilations, massages. Tu as besoin de gérer tes créneaux facilement.' },
  { title: 'Salon avec équipe', desc: 'Tu as 2, 5, 10 ou 50 employées. Chacune a son planning. Même prix.' },
];

const faqs = [
  { q: 'Comment fonctionnent les 3 mois offerts ?', a: 'Tu crées ton compte, tu configures ton salon, et tu utilises MY PRESTY gratuitement pendant 3 mois. Au bout des 3 mois, ton abonnement passe à 19€/mois. Tu peux annuler avant si tu veux.' },
  { q: 'Je dois installer quelque chose ?', a: 'Non. MY PRESTY fonctionne dans ton navigateur (Safari, Chrome). Rien à télécharger.' },
  { q: 'Mes clientes actuelles, je les perds ?', a: 'Non. C\'est TON lien, TES clientes, TA page. Tes clientes viennent de toi (Instagram, bouche-à-oreille). MY PRESTY ne prend rien.' },
  { q: 'C\'est quoi la différence avec Planity ?', a: 'Planity est un annuaire qui prend une commission. MY PRESTY est ton outil privé. Pas d\'annuaire, pas de commission, pas de concurrence affichée à côté de toi.' },
  { q: 'Je peux annuler quand je veux ?', a: 'Oui. Sans engagement, tu annules en 1 clic depuis tes paramètres. Pas de frais cachés.' },
  { q: 'Et si j\'ai 50 employées ?', a: 'Même prix : 19€/mois. Équipe illimitée, réservations illimitées, clients illimités. Tout est inclus.' },
];

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8' }}>

      {/* ===== HEADER ===== */}
      <header style={{ padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F0F0EC' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: '#1A1A1A', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#FFF', fontFamily: ss, fontSize: 16, fontWeight: 600 }}>MP</span>
          </div>
          <span style={{ fontFamily: sf, fontSize: 15, fontWeight: 600, letterSpacing: 5, textTransform: 'uppercase' }}>MY PRESTY</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/connexion" style={{ fontFamily: sf, fontSize: 12, color: '#777', textDecoration: 'none', letterSpacing: 1, padding: '10px 18px' }}>
            Se connecter
          </Link>
          <Link href="/inscription" style={{ fontFamily: sf, fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', padding: '12px 28px', background: '#1A1A1A', color: '#FFF', textDecoration: 'none' }}>
            Commencer
          </Link>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section style={{ padding: '80px 32px 60px', textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', border: '1px solid #E8E8E4', marginBottom: 32 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} />
          <span style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: '#999' }}>Offre de lancement — 3 mois offerts</span>
        </div>

        <h1 style={{ fontFamily: ss, fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 300, lineHeight: 1.08, marginBottom: 24, letterSpacing: -1 }}>
          Ton logiciel de<br />réservation <em style={{ fontStyle: 'italic', fontWeight: 400 }}>beauté</em>
        </h1>

        <p style={{ fontFamily: sf, fontSize: 17, color: '#777', fontWeight: 300, lineHeight: 1.8, maxWidth: 520, margin: '0 auto 20px' }}>
          Agenda en ligne, fichier client, paiement CB, rappels automatiques, page de réservation à ton nom. Tout ce dont tu as besoin pour gérer ton activité.
        </p>

        <p style={{ fontFamily: sf, fontSize: 16, fontWeight: 600, marginBottom: 40 }}>
          19€/mois · Tout illimité · Sans engagement
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <Link href="/inscription" style={{ fontFamily: sf, fontSize: 12, fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase', padding: '18px 44px', background: '#1A1A1A', color: '#FFF', textDecoration: 'none' }}>
            Commencer — 3 mois offerts ✦
          </Link>
        </div>

        <p style={{ fontFamily: sf, fontSize: 13, color: '#1A1A1A', fontWeight: 600, letterSpacing: 1 }}>
          🎁 3 mois offerts — Inscription en 30 secondes
        </p>
      </section>

      {/* ===== STATS ===== */}
      <section style={{ display: 'flex', justifyContent: 'center', gap: 56, padding: '40px 32px 60px', flexWrap: 'wrap' }}>
        {[
          { value: '19€', label: 'Par mois' },
          { value: '♾️', label: 'Tout illimité' },
          { value: '3 mois', label: 'Offerts' },
          { value: '0€', label: 'Frais cachés' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: ss, fontSize: 36, fontWeight: 300, letterSpacing: 1 }}>{s.value}</p>
            <p style={{ fontFamily: sf, fontSize: 10, color: '#BBB', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </section>

      {/* ===== FEATURES ===== */}
      <section style={{ background: '#1A1A1A', color: '#FFF', padding: '72px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ fontFamily: sf, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12, textAlign: 'center' }}>Tout est inclus</p>
          <h2 style={{ fontFamily: ss, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 300, textAlign: 'center', marginBottom: 48 }}>
            Un seul outil. <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.6)' }}>Tout dedans.</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 0 }}>
            {features.map((f, i) => (
              <div key={i} style={{ padding: '28px 24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 22, display: 'block', marginBottom: 14 }}>{f.icon}</span>
                <p style={{ fontFamily: sf, fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{f.title}</p>
                <p style={{ fontFamily: sf, fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMMENT ÇA MARCHE ===== */}
      <section style={{ padding: '72px 32px', maxWidth: 800, margin: '0 auto' }}>
        <p style={{ fontFamily: sf, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#CCC', marginBottom: 12, textAlign: 'center' }}>Comment ça marche</p>
        <h2 style={{ fontFamily: ss, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 300, textAlign: 'center', marginBottom: 48 }}>
          En ligne en <em style={{ fontStyle: 'italic', color: '#999' }}>3 étapes</em>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 24, padding: '28px 0', borderBottom: i < steps.length - 1 ? '1px solid #F0F0EC' : 'none' }}>
              <span style={{ fontFamily: ss, fontSize: 42, fontWeight: 300, color: '#E8E8E4', lineHeight: 1 }}>{s.num}</span>
              <div>
                <p style={{ fontFamily: sf, fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{s.title}</p>
                <p style={{ fontFamily: sf, fontSize: 13, color: '#999', fontWeight: 300 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== POUR QUI ===== */}
      <section style={{ padding: '60px 32px', background: '#FFF', borderTop: '1px solid #F0F0EC', borderBottom: '1px solid #F0F0EC' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ fontFamily: sf, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#CCC', marginBottom: 12, textAlign: 'center' }}>Pour qui</p>
          <h2 style={{ fontFamily: ss, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 300, textAlign: 'center', marginBottom: 48 }}>
            De l&apos;indépendante au <em style={{ fontStyle: 'italic', color: '#999' }}>grand salon</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {personas.map((p, i) => (
              <div key={i} style={{ border: '1px solid #E8E8E4', padding: '24px 22px' }}>
                <p style={{ fontFamily: sf, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{p.title}</p>
                <p style={{ fontFamily: sf, fontSize: 12, color: '#999', fontWeight: 300, lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section style={{ padding: '72px 32px', textAlign: 'center' }}>
        <p style={{ fontFamily: sf, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#CCC', marginBottom: 12 }}>Tarif unique</p>
        <h2 style={{ fontFamily: ss, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 300, marginBottom: 40 }}>
          Un seul prix. <em style={{ fontStyle: 'italic', color: '#999' }}>Pas de surprises.</em>
        </h2>

        <div style={{ maxWidth: 420, margin: '0 auto', border: '2px solid #1A1A1A', padding: '0', overflow: 'hidden' }}>
          <div style={{ background: '#4ADE80', padding: '12px', textAlign: 'center' }}>
            <span style={{ fontFamily: sf, fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#1A1A1A' }}>🎁 3 mois offerts</span>
          </div>
          <div style={{ padding: '32px 32px 40px' }}>
          <p style={{ fontFamily: sf, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#999', marginBottom: 16 }}>MY PRESTY</p>
          <p style={{ fontFamily: ss, fontSize: 56, fontWeight: 300, marginBottom: 4 }}>19€<span style={{ fontSize: 20, color: '#999' }}>/mois</span></p>
          <p style={{ fontFamily: sf, fontSize: 12, color: '#999', marginBottom: 28 }}>Gratuit pendant 3 mois · Sans engagement</p>

          <div style={{ textAlign: 'left', marginBottom: 28 }}>
            {[
              'Réservations illimitées',
              'Clients illimités',
              'Équipe illimitée',
              'Prestations illimitées',
              'Page de réservation publique',
              'Rappels email automatiques',
              'Paiement CB en ligne',
              'Fichier client avec historique',
              'Statistiques et CA',
              'Support inclus',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 9 ? '1px solid #F5F5F3' : 'none' }}>
                <span style={{ color: '#4ADE80', fontSize: 14 }}>✓</span>
                <span style={{ fontFamily: sf, fontSize: 13, fontWeight: 400 }}>{item}</span>
              </div>
            ))}
          </div>

          <Link href="/inscription" style={{ display: 'block', width: '100%', padding: '16px', background: '#1A1A1A', color: '#FFF', textDecoration: 'none', fontFamily: sf, fontSize: 12, fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase', textAlign: 'center' }}>
            Commencer — 3 mois offerts ✦
          </Link>
          <p style={{ fontFamily: sf, fontSize: 11, color: '#999', marginTop: 12 }}>Tu ne paies rien pendant 3 mois. Ensuite 19€/mois.</p>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section style={{ padding: '60px 32px', background: '#FFF', borderTop: '1px solid #F0F0EC' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontFamily: ss, fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 300, textAlign: 'center', marginBottom: 40 }}>
            Questions fréquentes
          </h2>
          {faqs.map((f, i) => (
            <div key={i} style={{ padding: '20px 0', borderBottom: i < faqs.length - 1 ? '1px solid #F0F0EC' : 'none' }}>
              <p style={{ fontFamily: sf, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{f.q}</p>
              <p style={{ fontFamily: sf, fontSize: 13, color: '#777', fontWeight: 300, lineHeight: 1.6 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section style={{ background: '#1A1A1A', color: '#FFF', padding: '72px 32px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: ss, fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 300, marginBottom: 16, lineHeight: 1.2 }}>
          Prête à simplifier<br />ton <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.5)' }}>quotidien</em> ?
        </h2>
        <p style={{ fontFamily: sf, fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 300, marginBottom: 36 }}>
          3 mois offerts. Ensuite 19€/mois, sans engagement.
        </p>
        <Link href="/inscription" style={{ display: 'inline-block', padding: '18px 48px', background: '#FFF', color: '#1A1A1A', textDecoration: 'none', fontFamily: sf, fontSize: 12, fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase' }}>
          Commencer — 3 mois offerts ✦
        </Link>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderTop: '1px solid #F0F0EC' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 22, height: 22, background: '#1A1A1A', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#FFF', fontFamily: ss, fontSize: 10, fontWeight: 600 }}>MP</span>
          </div>
          <span style={{ fontFamily: sf, fontSize: 10, color: '#BBB', letterSpacing: 2, textTransform: 'uppercase' }}>MY PRESTY</span>
        </div>
        <p style={{ fontFamily: sf, fontSize: 10, color: '#DDD', letterSpacing: 1 }}>© 2026 MY PRESTY · mypresty.com</p>
        <div style={{ display: 'flex', gap: 16 }}>
          <a href="https://instagram.com/mypresty" target="_blank" rel="noopener noreferrer" style={{ fontFamily: sf, fontSize: 10, color: '#BBB', textDecoration: 'none', letterSpacing: 1 }}>Instagram</a>
          <a href="mailto:contact@mypresty.com" style={{ fontFamily: sf, fontSize: 10, color: '#BBB', textDecoration: 'none', letterSpacing: 1 }}>Contact</a>
        </div>
      </footer>
    </div>
  );
}
