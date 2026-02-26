'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const sf = "'Outfit', sans-serif";
const ss = "'Cormorant Garamond', 'Georgia', serif";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('accueil');
  const [isMobile, setIsMobile] = useState(false);

  // Data states
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [team, setTeam] = useState([]);

  // Form states
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [newService, setNewService] = useState({ name: '', duration: 60, price: 0, category: '' });
  const [newClient, setNewClient] = useState({ first_name: '', last_name: '', phone: '', email: '' });
  const [newMember, setNewMember] = useState({ name: '', role: '' });

  // Stripe states
  const [stripeLoading, setStripeLoading] = useState(false);
  const [subscription, setSubscription] = useState({ status: 'loading' });

  useEffect(() => {
    checkAuth();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function checkAuth() {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { router.push('/connexion'); return; }
    setUser(u);

    const { data: salons } = await supabase.from('salons').select('*').eq('owner_id', u.id).limit(1);
    if (salons && salons.length > 0) {
      setSalon(salons[0]);
      loadData(salons[0].id);
    }
    setLoading(false);

    // Check subscription status
    if (u?.email) {
      try {
        const res = await fetch('/api/stripe/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: u.email }),
        });
        const subData = await res.json();
        setSubscription(subData);
      } catch (e) {
        setSubscription({ status: 'none' });
      }
    }
  }

  async function loadData(salonId) {
    const [aptsRes, clientsRes, servicesRes, teamRes] = await Promise.all([
      supabase.from('appointments').select('*').eq('salon_id', salonId).order('date', { ascending: true }),
      supabase.from('clients').select('*').eq('salon_id', salonId).order('last_name'),
      supabase.from('services').select('*').eq('salon_id', salonId).order('name'),
      supabase.from('team_members').select('*').eq('salon_id', salonId).order('name'),
    ]);
    setAppointments(aptsRes.data || []);
    setClients(clientsRes.data || []);
    setServices(servicesRes.data || []);
    setTeam(teamRes.data || []);
  }

  async function addService(e) {
    e.preventDefault();
    if (!salon) return;
    const { error } = await supabase.from('services').insert({ ...newService, salon_id: salon.id });
    if (!error) {
      setNewService({ name: '', duration: 60, price: 0, category: '' });
      setShowServiceForm(false);
      loadData(salon.id);
    }
  }

  async function deleteService(id) {
    await supabase.from('services').delete().eq('id', id);
    loadData(salon.id);
  }

  async function addClient(e) {
    e.preventDefault();
    if (!salon) return;
    const { error } = await supabase.from('clients').insert({ ...newClient, salon_id: salon.id });
    if (!error) {
      setNewClient({ first_name: '', last_name: '', phone: '', email: '' });
      setShowClientForm(false);
      loadData(salon.id);
    }
  }

  async function addMember(e) {
    e.preventDefault();
    if (!salon) return;
    const { error } = await supabase.from('team_members').insert({ ...newMember, salon_id: salon.id });
    if (!error) {
      setNewMember({ name: '', role: '' });
      setShowTeamForm(false);
      loadData(salon.id);
    }
  }

  async function deleteMember(id) {
    await supabase.from('team_members').delete().eq('id', id);
    loadData(salon.id);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  // Stripe: Checkout subscription
  async function handleStripeCheckout() {
    setStripeLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, salon_id: salon.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Erreur lors de la connexion à Stripe');
    } catch (e) { alert('Erreur de connexion. Vérifie ta connexion internet.'); }
    setStripeLoading(false);
  }

  // Stripe: Connect for pros
  async function handleStripeConnect() {
    setStripeLoading(true);
    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salon_id: salon.id, email: user?.email, salon_name: salon.name }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Erreur lors de la connexion Stripe Connect');
    } catch (e) { alert('Erreur de connexion. Vérifie ta connexion internet.'); }
    setStripeLoading(false);
  }

  // Stripe: Customer portal
  async function handleStripePortal() {
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {}
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: sf, fontSize: 14, color: '#999' }}>Chargement...</p>
    </div>
  );

  if (!salon) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <p style={{ fontFamily: sf, fontSize: 14, color: '#999' }}>Aucun salon trouvé. <Link href="/inscription" style={{ color: '#1A1A1A' }}>Créer un salon</Link></p>
    </div>
  );

  const publicUrl = (process.env.NEXT_PUBLIC_APP_URL || '') + '/' + salon.slug;
  const todayAppts = appointments.filter(a => {
    const d = new Date(a.date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const tabs = [
    { id: 'accueil', label: 'Accueil', icon: '◉' },
    { id: 'prestations', label: 'Prestations', icon: '✦' },
    { id: 'clients', label: 'Clients', icon: '♡' },
    { id: 'equipe', label: 'Équipe', icon: '◎' },
    { id: 'rdv', label: 'RDV', icon: '▦' },
    { id: 'parametres', label: 'Paramètres', icon: '⚙' },
  ];

  const pad = isMobile ? 16 : 28;

  const inputStyle = {
    width: '100%', padding: '12px 14px', border: '1px solid #E8E8E4',
    fontFamily: sf, fontSize: 13, fontWeight: 300, outline: 'none',
    background: '#FFF', marginBottom: 10, boxSizing: 'border-box',
  };

  const btnPrimary = {
    padding: isMobile ? '10px 16px' : '12px 24px', background: '#1A1A1A', color: '#FFF', border: 'none',
    fontFamily: sf, fontSize: 11, fontWeight: 600, letterSpacing: 2,
    textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap',
  };

  const btnSecondary = {
    padding: isMobile ? '8px 14px' : '10px 18px', background: 'transparent', color: '#999', border: '1px solid #E8E8E4',
    fontFamily: sf, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', overflowX: 'hidden' }}>

      {/* HEADER */}
      <header style={{
        background: '#1A1A1A', padding: isMobile ? '10px 16px' : '12px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, border: '1.5px solid #FFF', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#FFF', fontFamily: ss, fontSize: 12, fontWeight: 600 }}>MP</span>
          </div>
          {!isMobile && <span style={{ fontFamily: sf, color: '#FFF', fontSize: 13, fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase' }}>MY PRESTY</span>}
          {!isMobile && <span style={{ fontFamily: sf, color: 'rgba(255,255,255,0.3)', fontSize: 9, letterSpacing: 2 }}>19€/MOIS</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', flexShrink: 0 }} />
          <span style={{ fontFamily: sf, color: 'rgba(255,255,255,0.5)', fontSize: isMobile ? 10 : 11, maxWidth: isMobile ? 120 : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{salon.name}</span>
          <button onClick={handleLogout} style={{ fontFamily: sf, fontSize: 10, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: 1 }}>Déconnexion</button>
        </div>
      </header>

      {/* NAV TABS */}
      <nav style={{
        display: 'flex', borderBottom: '1px solid #E8E8E4', background: '#FFF',
        padding: isMobile ? '0 8px' : '0 28px', overflowX: 'auto', overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none',
      }}>
        <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: isMobile ? '12px 12px' : '14px 18px', background: 'none', border: 'none',
            borderBottom: tab === t.id ? '2px solid #1A1A1A' : '2px solid transparent',
            cursor: 'pointer', fontFamily: sf, fontSize: isMobile ? 10 : 11, fontWeight: tab === t.id ? 500 : 400,
            color: tab === t.id ? '#1A1A1A' : '#999', letterSpacing: 1.5, textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            <span style={{ fontSize: isMobile ? 10 : 12 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </nav>

      {/* MAIN */}
      <main style={{ padding: pad, maxWidth: 1100, margin: '0 auto' }}>

        {/* ═══ ACCUEIL ═══ */}
        {tab === 'accueil' && (
          <div>
            <h1 style={{ fontFamily: ss, fontSize: isMobile ? 24 : 32, fontWeight: 300, marginBottom: 6 }}>Bienvenue, {salon.name} ✦</h1>
            <p style={{ fontFamily: sf, fontSize: 13, color: '#999', marginBottom: 24 }}>
              {todayAppts.length} RDV aujourd&apos;hui · {clients.length} clients · {services.length} prestations
            </p>

            {/* Stats grid - 2 cols mobile, 4 cols desktop */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
              {[
                { label: 'RDV aujourd\'hui', value: todayAppts.length, accent: false },
                { label: 'Clients total', value: clients.length, accent: false },
                { label: 'Prestations', value: services.length, accent: true },
                { label: 'Équipe', value: team.length, accent: false },
              ].map((s, i) => (
                <div key={i} style={{
                  background: s.accent ? '#1A1A1A' : '#FFF', color: s.accent ? '#FFF' : '#1A1A1A',
                  border: s.accent ? 'none' : '1px solid #E8E8E4', padding: isMobile ? '16px 14px' : '22px 18px',
                }}>
                  <p style={{ fontFamily: sf, fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.5, marginBottom: 6 }}>{s.label}</p>
                  <p style={{ fontSize: isMobile ? 26 : 32, fontWeight: 300 }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Quick link */}
            <div style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: isMobile ? '16px' : '20px 24px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 12 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', marginBottom: 4 }}>Ton lien de réservation</p>
                <p style={{ fontFamily: sf, fontSize: isMobile ? 13 : 15, fontWeight: 500, wordBreak: 'break-all' }}>{publicUrl}</p>
              </div>
              <button onClick={() => navigator.clipboard.writeText(publicUrl)} style={btnPrimary}>Copier le lien</button>
            </div>
          </div>
        )}

        {/* ═══ PRESTATIONS ═══ */}
        {tab === 'prestations' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <h1 style={{ fontFamily: ss, fontSize: isMobile ? 24 : 32, fontWeight: 300 }}>Prestations</h1>
              <button onClick={() => setShowServiceForm(!showServiceForm)} style={btnPrimary}>+ Ajouter</button>
            </div>

            {showServiceForm && (
              <form onSubmit={addService} style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: isMobile ? 16 : 24, marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Nom</label>
                    <input required value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} placeholder="Ex: Coupe & Brushing" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Catégorie</label>
                    <input value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})} placeholder="Ex: Coiffure" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Durée (min)</label>
                    <input type="number" value={newService.duration} onChange={e => setNewService({...newService, duration: parseInt(e.target.value)})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Prix (€)</label>
                    <input type="number" value={newService.price} onChange={e => setNewService({...newService, price: parseFloat(e.target.value)})} style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <button type="submit" style={btnPrimary}>Enregistrer</button>
                  <button type="button" onClick={() => setShowServiceForm(false)} style={btnSecondary}>Annuler</button>
                </div>
              </form>
            )}

            {services.length === 0 ? (
              <div style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: '40px 20px', textAlign: 'center' }}>
                <p style={{ fontFamily: sf, fontSize: 14, color: '#999' }}>Aucune prestation. Ajoute tes services !</p>
              </div>
            ) : (
              services.map(s => (
                <div key={s.id} style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: isMobile ? '14px 16px' : '18px 22px', marginBottom: -1, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: sf, fontSize: 14, fontWeight: 500 }}>{s.name}</p>
                    <p style={{ fontFamily: sf, fontSize: 11, color: '#999' }}>{s.duration}min · {s.category || 'Sans catégorie'}</p>
                  </div>
                  <span style={{ fontFamily: sf, fontSize: 16, fontWeight: 500, flexShrink: 0 }}>{s.price}€</span>
                  <button onClick={() => deleteService(s.id)} style={{ ...btnSecondary, color: '#EF4444', borderColor: '#FEE2E2', padding: '6px 12px' }}>✕</button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═══ CLIENTS ═══ */}
        {tab === 'clients' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <h1 style={{ fontFamily: ss, fontSize: isMobile ? 24 : 32, fontWeight: 300 }}>Clients</h1>
              <button onClick={() => setShowClientForm(!showClientForm)} style={btnPrimary}>+ Ajouter</button>
            </div>

            {showClientForm && (
              <form onSubmit={addClient} style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: isMobile ? 16 : 24, marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Prénom</label>
                    <input required value={newClient.first_name} onChange={e => setNewClient({...newClient, first_name: e.target.value})} placeholder="Prénom" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Nom</label>
                    <input required value={newClient.last_name} onChange={e => setNewClient({...newClient, last_name: e.target.value})} placeholder="Nom" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Téléphone</label>
                    <input value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} placeholder="06 12 34 56 78" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Email</label>
                    <input type="email" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} placeholder="email@exemple.com" style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <button type="submit" style={btnPrimary}>Enregistrer</button>
                  <button type="button" onClick={() => setShowClientForm(false)} style={btnSecondary}>Annuler</button>
                </div>
              </form>
            )}

            {clients.length === 0 ? (
              <div style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: '40px 20px', textAlign: 'center' }}>
                <p style={{ fontFamily: sf, fontSize: 14, color: '#999' }}>Aucun client pour le moment.</p>
              </div>
            ) : (
              clients.map(c => (
                <div key={c.id} style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: isMobile ? '14px 16px' : '18px 22px', marginBottom: -1, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontFamily: sf, fontSize: 15, fontWeight: 600, flexShrink: 0 }}>
                    {(c.first_name || '')[0]}{(c.last_name || '')[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: sf, fontSize: 14, fontWeight: 500 }}>{c.first_name} {c.last_name}</p>
                    <p style={{ fontFamily: sf, fontSize: 11, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.phone || c.email || 'Pas de contact'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═══ ÉQUIPE ═══ */}
        {tab === 'equipe' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <h1 style={{ fontFamily: ss, fontSize: isMobile ? 24 : 32, fontWeight: 300 }}>Équipe</h1>
              <button onClick={() => setShowTeamForm(!showTeamForm)} style={btnPrimary}>+ Ajouter</button>
            </div>

            {showTeamForm && (
              <form onSubmit={addMember} style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: isMobile ? 16 : 24, marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Nom</label>
                    <input required value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} placeholder="Prénom Nom" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Rôle</label>
                    <input value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} placeholder="Ex: Coiffeuse, Esthéticienne" style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <button type="submit" style={btnPrimary}>Enregistrer</button>
                  <button type="button" onClick={() => setShowTeamForm(false)} style={btnSecondary}>Annuler</button>
                </div>
              </form>
            )}

            {team.length === 0 ? (
              <div style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: '40px 20px', textAlign: 'center' }}>
                <p style={{ fontFamily: sf, fontSize: 14, color: '#999' }}>Aucun membre. Ajoute ton équipe !</p>
              </div>
            ) : (
              team.map(m => (
                <div key={m.id} style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: isMobile ? '14px 16px' : '20px 22px', marginBottom: -1, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontFamily: sf, fontSize: 15, fontWeight: 600, flexShrink: 0 }}>
                    {(m.name || '')[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: sf, fontSize: 15, fontWeight: 500 }}>{m.name}</p>
                    <p style={{ fontFamily: sf, fontSize: 12, color: '#999' }}>{m.role || 'Pas de rôle défini'}</p>
                  </div>
                  <button onClick={() => deleteMember(m.id)} style={{ ...btnSecondary, color: '#EF4444', borderColor: '#FEE2E2', padding: '6px 12px' }}>Supprimer</button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═══ RDV ═══ */}
        {tab === 'rdv' && (
          <div>
            <h1 style={{ fontFamily: ss, fontSize: isMobile ? 24 : 32, fontWeight: 300, marginBottom: 24 }}>Rendez-vous</h1>
            {appointments.length === 0 ? (
              <div style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: '40px 20px', textAlign: 'center' }}>
                <p style={{ fontFamily: sf, fontSize: 14, color: '#999' }}>Aucun rendez-vous pour le moment.</p>
                <p style={{ fontFamily: sf, fontSize: 12, color: '#BBB', marginTop: 8 }}>Partage ton lien de réservation pour recevoir tes premiers RDV !</p>
              </div>
            ) : (
              appointments.map(a => (
                <div key={a.id} style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: isMobile ? '14px 16px' : '18px 22px', marginBottom: -1, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ width: 50, flexShrink: 0 }}>
                    <p style={{ fontFamily: sf, fontSize: 13, fontWeight: 600 }}>{a.time || '--:--'}</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: sf, fontSize: 14, fontWeight: 500 }}>{a.client_name || 'Client'}</p>
                    <p style={{ fontFamily: sf, fontSize: 11, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.service_name || 'Prestation'} · {a.date}</p>
                  </div>
                  <span style={{
                    fontFamily: sf, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', padding: '4px 10px',
                    background: a.status === 'confirmed' ? '#1A1A1A' : 'transparent',
                    color: a.status === 'confirmed' ? '#FFF' : '#999',
                    border: a.status === 'confirmed' ? 'none' : '1px solid #D4D4D4', flexShrink: 0,
                  }}>
                    {a.status === 'confirmed' ? 'Confirmé' : a.status === 'pending' ? 'En attente' : a.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═══ PARAMETRES ═══ */}
        {tab === 'parametres' && (
          <div>
            <h1 style={{ fontFamily: ss, fontSize: isMobile ? 24 : 32, fontWeight: 300, marginBottom: 24 }}>Paramètres</h1>

            {/* ABONNEMENT */}
            <div style={{ background: '#1A1A1A', color: '#FFF', padding: isMobile ? '20px 16px' : '24px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: 16, flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
                <div>
                  <p style={{ fontFamily: sf, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.5, marginBottom: 4 }}>Mon abonnement</p>
                  <p style={{ fontFamily: sf, fontSize: 16, fontWeight: 500 }}>MY PRESTY — 19€/mois</p>
                  {subscription.status === 'trial' && subscription.trialEnd && (
                    <p style={{ fontFamily: sf, fontSize: 12, fontWeight: 300, opacity: 0.7, marginTop: 2 }}>
                      Essai gratuit jusqu&apos;au {new Date(subscription.trialEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  {subscription.status === 'active' && (
                    <p style={{ fontFamily: sf, fontSize: 12, fontWeight: 300, opacity: 0.7, marginTop: 2 }}>
                      Prochain paiement le {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                    </p>
                  )}
                  {(subscription.status === 'none' || subscription.status === 'loading') && (
                    <p style={{ fontFamily: sf, fontSize: 12, fontWeight: 300, opacity: 0.5, marginTop: 2 }}>3 mois offerts, puis 19€/mois. Tout illimité.</p>
                  )}
                </div>
                {subscription.status === 'trial' && (
                  <span style={{ fontFamily: sf, fontSize: 10, padding: '6px 14px', border: '1px solid rgba(74,222,128,0.5)', color: '#4ADE80', letterSpacing: 1.5, textTransform: 'uppercase', flexShrink: 0, alignSelf: isMobile ? 'flex-start' : 'center' }}>✓ Essai gratuit actif</span>
                )}
                {subscription.status === 'active' && (
                  <span style={{ fontFamily: sf, fontSize: 10, padding: '6px 14px', border: '1px solid rgba(74,222,128,0.5)', color: '#4ADE80', letterSpacing: 1.5, textTransform: 'uppercase', flexShrink: 0, alignSelf: isMobile ? 'flex-start' : 'center' }}>✓ Abonnement actif</span>
                )}
                {(subscription.status === 'canceled' || subscription.status === 'past_due' || subscription.status === 'unpaid') && (
                  <span style={{ fontFamily: sf, fontSize: 10, padding: '6px 14px', border: '1px solid rgba(239,68,68,0.5)', color: '#EF4444', letterSpacing: 1.5, textTransform: 'uppercase', flexShrink: 0, alignSelf: isMobile ? 'flex-start' : 'center' }}>
                    {subscription.status === 'canceled' ? 'Annulé' : 'Paiement échoué'}
                  </span>
                )}
                {(subscription.status === 'none' || subscription.status === 'loading') && (
                  <span style={{ fontFamily: sf, fontSize: 10, padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase', flexShrink: 0, alignSelf: isMobile ? 'flex-start' : 'center' }}>
                    {subscription.status === 'loading' ? 'Vérification...' : 'Pas d\'abonnement'}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {(subscription.status === 'none' || subscription.status === 'canceled') && (
                  <button onClick={handleStripeCheckout} disabled={stripeLoading} style={{
                    padding: '12px 24px', background: '#4ADE80', color: '#1A1A1A', border: 'none',
                    fontFamily: sf, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
                    cursor: 'pointer', opacity: stripeLoading ? 0.5 : 1,
                  }}>
                    {stripeLoading ? 'Chargement...' : 'Activer — 3 mois offerts'}
                  </button>
                )}
                {(subscription.status === 'trial' || subscription.status === 'active' || subscription.status === 'past_due') && (
                  <button onClick={handleStripePortal} style={{
                    padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: '#FFF',
                    border: '1px solid rgba(255,255,255,0.2)', fontFamily: sf, fontSize: 11,
                    letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer',
                  }}>
                    Gérer mon abonnement
                  </button>
                )}
              </div>
            </div>

            {/* STRIPE CONNECT */}
            <div style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: isMobile ? '20px 16px' : '24px', marginBottom: 16 }}>
              <p style={{ fontFamily: sf, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#999', marginBottom: 4 }}>Paiement en ligne</p>
              <p style={{ fontFamily: sf, fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Recevoir les paiements de tes clientes</p>
              <p style={{ fontFamily: sf, fontSize: 13, color: '#999', fontWeight: 300, marginBottom: 16 }}>Connecte ton compte Stripe pour recevoir les paiements CB et acomptes directement sur ton compte bancaire.</p>
              <button onClick={handleStripeConnect} disabled={stripeLoading} style={{
                padding: '14px 28px', background: '#635BFF', color: '#FFF', border: 'none',
                fontFamily: sf, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase',
                cursor: 'pointer', opacity: stripeLoading ? 0.5 : 1,
              }}>
                {stripeLoading ? 'Chargement...' : 'Connecter Stripe 💳'}
              </button>
            </div>

            {/* LIEN PUBLIC */}
            <div style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: isMobile ? '16px' : '20px 24px', marginBottom: 12 }}>
              <p style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>Lien de réservation public</p>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: 10 }}>
                <p style={{ fontFamily: sf, fontSize: isMobile ? 13 : 15, fontWeight: 500, flex: 1, wordBreak: 'break-all' }}>{publicUrl}</p>
                <button onClick={() => navigator.clipboard.writeText(publicUrl)} style={btnPrimary}>Copier</button>
              </div>
            </div>

            {/* INFOS SALON */}
            <div style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: isMobile ? '16px' : '20px 24px', marginBottom: 12 }}>
              <p style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>Informations du salon</p>
              <p style={{ fontFamily: sf, fontSize: 15, fontWeight: 500 }}>{salon.name}</p>
              <p style={{ fontFamily: sf, fontSize: 12, color: '#999', marginTop: 4 }}>{salon.city || 'Ville non définie'} · {salon.phone || 'Téléphone non défini'}</p>
            </div>

            {/* COMPTE */}
            <div style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: isMobile ? '16px' : '20px 24px' }}>
              <p style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>Compte</p>
              <p style={{ fontFamily: sf, fontSize: 13, color: '#777', wordBreak: 'break-all' }}>{user?.email}</p>
            </div>
          </div>
        )}

      </main>

      <footer style={{ textAlign: 'center', padding: 20, borderTop: '1px solid #E8E8E4', marginTop: 32 }}>
        <p style={{ fontFamily: sf, fontSize: 10, color: '#CCC', letterSpacing: 2, textTransform: 'uppercase' }}>MY PRESTY · 19€/mois · Tout illimité · © 2026</p>
      </footer>
    </div>
  );
}
