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
  { num: '1', title: 'Crée ton compte', desc: 'Email, mot de passe, nom de ton salon. 30 secondes.' },
  { num: '2', title: 'Configure tes prestations', desc: 'Ajoute tes services, tes prix, ta durée, ton équipe.' },
  { num: '3', title: 'Partage ton lien', desc: 'Mets ton lien sur Instagram, en vitrine, partout. Tes clientes réservent en autonomie.' },
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

const marqueeText = '3 MOIS OFFERTS ✦ 19€/MOIS ✦ TOUT ILLIMITÉ ✦ SANS ENGAGEMENT ✦ AGENDA EN LIGNE ✦ PAIEMENT CB ✦ RAPPELS AUTO ✦ ÉQUIPE ILLIMITÉE ✦ ';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8' }}>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* ===== BANDEAU DEFILANT ===== */}
      <div style={{ background: '#1A1A1A', overflow: 'hidden', whiteSpace: 'nowrap', padding: '11px 0' }}>
        <div style={{ display: 'inline-block', animation: 'marquee 60s linear infinite' }}>
          <span style={{ fontFamily: sf, fontSize: 13, fontWeight: 600, letterSpacing: 3, color: '#FFF' }}>
            {marqueeText}{marqueeText}{marqueeText}{marqueeText}
          </span>
        </div>
      </div>

      {/* ===== HEADER ===== */}
      <header style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F0F0EC', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: '#1A1A1A', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#FFF', fontFamily: ss, fontSize: 18, fontWeight: 600 }}>MP</span>
          </div>
          <span style={{ fontFamily: sf, fontSize: 17, fontWeight: 600, letterSpacing: 5, textTransform: 'uppercase' }}>MY PRESTY</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/connexion" style={{ fontFamily: sf, fontSize: 13, color: '#777', textDecoration: 'none', padding: '6px 8px' }}>
            Se connecter
          </Link>
          <Link href="/inscription" style={{ fontFamily: sf, fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', padding: '12px 16px', background: '#1A1A1A', color: '#FFF', textDecoration: 'none' }}>
            Commencer
          </Link>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section style={{ padding: '80px 32px 60px', textAlign: 'center', maxWidth: 850, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#4ADE80', marginBottom: 36 }}>
          <span style={{ fontFamily: sf, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#1A1A1A' }}>🎁 3 mois offerts — Offre de lancement</span>
        </div>

        <h1 style={{ fontFamily: ss, fontSize: 'clamp(42px, 7vw, 72px)', fontWeight: 300, lineHeight: 1.08, marginBottom: 28, letterSpacing: -1 }}>
          Ton logiciel de<br />réservation <em style={{ fontStyle: 'italic', fontWeight: 400 }}>beauté</em>
        </h1>

        <p style={{ fontFamily: sf, fontSize: 20, color: '#555', fontWeight: 300, lineHeight: 1.8, maxWidth: 560, margin: '0 auto 24px' }}>
          Agenda en ligne, fichier client, paiement CB, rappels automatiques, page de réservation à ton nom. Tout ce dont tu as besoin pour gérer ton activité.
        </p>

        <p style={{ fontFamily: sf, fontSize: 19, fontWeight: 600, marginBottom: 44 }}>
          19€/mois · Tout illimité · Sans engagement
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          <Link href="/inscription" style={{ fontFamily: sf, fontSize: 15, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', padding: '20px 48px', background: '#1A1A1A', color: '#FFF', textDecoration: 'none' }}>
            Commencer — 3 mois offerts ✦
          </Link>
        </div>

        <p style={{ fontFamily: sf, fontSize: 15, color: '#1A1A1A', fontWeight: 600 }}>
          Inscription en 30 secondes
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
            <p style={{ fontFamily: ss, fontSize: 42, fontWeight: 300, letterSpacing: 1 }}>{s.value}</p>
            <p style={{ fontFamily: sf, fontSize: 13, color: '#999', letterSpacing: 2, textTransform: 'uppercase', marginTop: 6 }}>{s.label}</p>
          </div>
        ))}
      </section>

      {/* ===== FEATURES ===== */}
      <section style={{ background: '#1A1A1A', color: '#FFF', padding: '80px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p style={{ fontFamily: sf, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12, textAlign: 'center' }}>Tout est inclus</p>
          <h2 style={{ fontFamily: ss, fontSize: 'clamp(32px, 5vw, 46px)', fontWeight: 300, textAlign: 'center', marginBottom: 52 }}>
            Un seul outil. <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.6)' }}>Tout dedans.</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 0 }}>
            {features.map((f, i) => (
              <div key={i} style={{ padding: '32px 28px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 16 }}>{f.icon}</span>
                <p style={{ fontFamily: sf, fontSize: 17, fontWeight: 500, marginBottom: 10 }}>{f.title}</p>
                <p style={{ fontFamily: sf, fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMMENT ÇA MARCHE ===== */}
      <section style={{ padding: '80px 32px', maxWidth: 800, margin: '0 auto' }}>
        <p style={{ fontFamily: sf, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', color: '#BBB', marginBottom: 12, textAlign: 'center' }}>Comment ça marche</p>
        <h2 style={{ fontFamily: ss, fontSize: 'clamp(32px, 5vw, 46px)', fontWeight: 300, textAlign: 'center', marginBottom: 52 }}>
          En ligne en <em style={{ fontStyle: 'italic', color: '#999' }}>3 étapes</em>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '32px 0', borderBottom: i < steps.length - 1 ? '1px solid #E8E8E4' : 'none' }}>
              <div style={{ width: 56, height: 56, background: '#1A1A1A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: sf, fontSize: 22, fontWeight: 700, color: '#FFF' }}>{s.num}</span>
              </div>
              <div>
                <p style={{ fontFamily: sf, fontSize: 19, fontWeight: 600, marginBottom: 6 }}>{s.title}</p>
                <p style={{ fontFamily: sf, fontSize: 16, color: '#777', fontWeight: 300 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== POUR QUI ===== */}
      <section style={{ padding: '72px 32px', background: '#FFF', borderTop: '1px solid #F0F0EC', borderBottom: '1px solid #F0F0EC' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p style={{ fontFamily: sf, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', color: '#BBB', marginBottom: 12, textAlign: 'center' }}>Pour qui</p>
          <h2 style={{ fontFamily: ss, fontSize: 'clamp(32px, 5vw, 46px)', fontWeight: 300, textAlign: 'center', marginBottom: 52 }}>
            De l&apos;indépendante au <em style={{ fontStyle: 'italic', color: '#999' }}>grand salon</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {personas.map((p, i) => (
              <div key={i} style={{ border: '1px solid #E8E8E4', padding: '28px 24px' }}>
                <p style={{ fontFamily: sf, fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{p.title}</p>
                <p style={{ fontFamily: sf, fontSize: 15, color: '#777', fontWeight: 300, lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section style={{ padding: '80px 32px', textAlign: 'center' }}>
        <p style={{ fontFamily: sf, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', color: '#BBB', marginBottom: 12 }}>Tarif unique</p>
        <h2 style={{ fontFamily: ss, fontSize: 'clamp(32px, 5vw, 46px)', fontWeight: 300, marginBottom: 44 }}>
          Un seul prix. <em style={{ fontStyle: 'italic', color: '#999' }}>Pas de surprises.</em>
        </h2>

        <div style={{ maxWidth: 440, margin: '0 auto', border: '2px solid #1A1A1A', overflow: 'hidden' }}>
          <div style={{ background: '#4ADE80', padding: '14px', textAlign: 'center' }}>
            <span style={{ fontFamily: sf, fontSize: 14, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#1A1A1A' }}>🎁 3 mois offerts</span>
          </div>
          <div style={{ padding: '36px 32px 40px' }}>
            <p style={{ fontFamily: sf, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', color: '#999', marginBottom: 16 }}>MY PRESTY</p>
            <p style={{ fontFamily: ss, fontSize: 60, fontWeight: 300, marginBottom: 6 }}>19€<span style={{ fontSize: 22, color: '#999' }}>/mois</span></p>
            <p style={{ fontFamily: sf, fontSize: 15, color: '#777', marginBottom: 32 }}>Gratuit pendant 3 mois · Sans engagement</p>

            <div style={{ textAlign: 'left', marginBottom: 32 }}>
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
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 9 ? '1px solid #F5F5F3' : 'none' }}>
                  <span style={{ color: '#4ADE80', fontSize: 16, fontWeight: 700 }}>✓</span>
                  <span style={{ fontFamily: sf, fontSize: 15, fontWeight: 400 }}>{item}</span>
                </div>
              ))}
            </div>

            <Link href="/inscription" style={{ display: 'block', width: '100%', padding: '18px', background: '#1A1A1A', color: '#FFF', textDecoration: 'none', fontFamily: sf, fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center' }}>
              Commencer — 3 mois offerts ✦
            </Link>
            <p style={{ fontFamily: sf, fontSize: 13, color: '#999', marginTop: 14 }}>Tu ne paies rien pendant 3 mois. Ensuite 19€/mois.</p>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section style={{ padding: '72px 32px', background: '#FFF', borderTop: '1px solid #F0F0EC' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontFamily: ss, fontSize: 'clamp(32px, 5vw, 42px)', fontWeight: 300, textAlign: 'center', marginBottom: 44 }}>
            Questions fréquentes
          </h2>
          {faqs.map((f, i) => (
            <div key={i} style={{ padding: '22px 0', borderBottom: i < faqs.length - 1 ? '1px solid #F0F0EC' : 'none' }}>
              <p style={{ fontFamily: sf, fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{f.q}</p>
              <p style={{ fontFamily: sf, fontSize: 15, color: '#555', fontWeight: 300, lineHeight: 1.7 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section style={{ background: '#1A1A1A', color: '#FFF', padding: '80px 32px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: ss, fontSize: 'clamp(32px, 5vw, 50px)', fontWeight: 300, marginBottom: 18, lineHeight: 1.2 }}>
          Prête à simplifier<br />ton <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.5)' }}>quotidien</em> ?
        </h2>
        <p style={{ fontFamily: sf, fontSize: 17, color: 'rgba(255,255,255,0.5)', fontWeight: 300, marginBottom: 40 }}>
          3 mois offerts. Ensuite 19€/mois, sans engagement.
        </p>
        <Link href="/inscription" style={{ display: 'inline-block', padding: '20px 52px', background: '#FFF', color: '#1A1A1A', textDecoration: 'none', fontFamily: sf, fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>
          Commencer — 3 mois offerts ✦
        </Link>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, borderTop: '1px solid #F0F0EC' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 24, background: '#1A1A1A', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#FFF', fontFamily: ss, fontSize: 11, fontWeight: 600 }}>MP</span>
          </div>
          <span style={{ fontFamily: sf, fontSize: 12, color: '#999', letterSpacing: 2, textTransform: 'uppercase' }}>MY PRESTY</span>
        </div>
        <p style={{ fontFamily: sf, fontSize: 12, color: '#BBB', letterSpacing: 1 }}>© 2026 MY PRESTY · mypresty.com</p>
        <div style={{ display: 'flex', gap: 20 }}>
          <a href="https://instagram.com/mypresty" target="_blank" rel="noopener noreferrer" style={{ fontFamily: sf, fontSize: 13, color: '#999', textDecoration: 'none', letterSpacing: 1 }}>Instagram</a>
          <a href="mailto:contact@mypresty.com" style={{ fontFamily: sf, fontSize: 13, color: '#999', textDecoration: 'none', letterSpacing: 1 }}>Contact</a>
        </div>
      </footer>
    </div>
  );
}
