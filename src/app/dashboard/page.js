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

  useEffect(() => {
    checkAuth();
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

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: sf, fontSize: 14, color: '#999' }}>Chargement...</p>
    </div>
  );

  if (!salon) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
    { id: 'rdv', label: 'Rendez-vous', icon: '▦' },
    { id: 'parametres', label: 'Paramètres', icon: '⚙' },
  ];

  const inputStyle = {
    width: '100%', padding: '12px 14px', border: '1px solid #E8E8E4',
    fontFamily: sf, fontSize: 13, fontWeight: 300, outline: 'none',
    background: '#FFF', marginBottom: 10,
  };

  const btnPrimary = {
    padding: '12px 24px', background: '#1A1A1A', color: '#FFF', border: 'none',
    fontFamily: sf, fontSize: 11, fontWeight: 600, letterSpacing: 2,
    textTransform: 'uppercase', cursor: 'pointer',
  };

  const btnSecondary = {
    padding: '10px 18px', background: 'transparent', color: '#999', border: '1px solid #E8E8E4',
    fontFamily: sf, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8' }}>

      {/* Header */}
      <header style={{ background: '#1A1A1A', padding: '12px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 30, height: 30, border: '1.5px solid #FFF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#FFF', fontFamily: ss, fontSize: 14, fontWeight: 600 }}>MP</span>
          </div>
          <span style={{ fontFamily: sf, color: '#FFF', fontSize: 14, fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase' }}>MY PRESTY</span>
          <span style={{ fontFamily: sf, color: 'rgba(255,255,255,0.3)', fontSize: 9, letterSpacing: 2, marginLeft: 8 }}>19€/MOIS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} />
          <span style={{ fontFamily: sf, color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{salon.name}</span>
          <button onClick={handleLogout} style={{ fontFamily: sf, fontSize: 10, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: 1 }}>Déconnexion</button>
        </div>
      </header>

      {/* Nav */}
      <nav style={{ display: 'flex', borderBottom: '1px solid #E8E8E4', background: '#FFF', padding: '0 28px', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '14px 18px', background: 'none', border: 'none',
            borderBottom: tab === t.id ? '2px solid #1A1A1A' : '2px solid transparent',
            cursor: 'pointer', fontFamily: sf, fontSize: 11, fontWeight: tab === t.id ? 500 : 400,
            color: tab === t.id ? '#1A1A1A' : '#999', letterSpacing: 1.5, textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
          }}>
            <span style={{ fontSize: 12 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </nav>

      <main style={{ padding: 28, maxWidth: 1100, margin: '0 auto' }}>

        {/* ACCUEIL */}
        {tab === 'accueil' && (
          <div>
            <h1 style={{ fontFamily: ss, fontSize: 32, fontWeight: 300, marginBottom: 6 }}>Bienvenue, {salon.name} ✦</h1>
            <p style={{ fontFamily: sf, fontSize: 13, color: '#999', marginBottom: 28 }}>
              {todayAppts.length} rendez-vous aujourd&apos;hui · {clients.length} clients · {services.length} prestations
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
              {[
                { label: 'RDV aujourd\'hui', value: todayAppts.length, accent: false },
                { label: 'Clients total', value: clients.length, accent: false },
                { label: 'Prestations', value: services.length, accent: true },
                { label: 'Équipe', value: team.length, accent: false },
              ].map((s, i) => (
                <div key={i} style={{
                  background: s.accent ? '#1A1A1A' : '#FFF', color: s.accent ? '#FFF' : '#1A1A1A',
                  border: s.accent ? 'none' : '1px solid #E8E8E4', padding: '22px 18px',
                }}>
                  <p style={{ fontFamily: sf, fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.5, marginBottom: 6 }}>{s.label}</p>
                  <p style={{ fontSize: 32, fontWeight: 300 }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Quick link */}
            <div style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', marginBottom: 4 }}>Ton lien de réservation</p>
                <p style={{ fontFamily: sf, fontSize: 15, fontWeight: 500 }}>{publicUrl}</p>
              </div>
              <button onClick={() => navigator.clipboard.writeText(publicUrl)} style={btnPrimary}>Copier le lien</button>
            </div>
          </div>
        )}

        {/* PRESTATIONS */}
        {tab === 'prestations' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h1 style={{ fontFamily: ss, fontSize: 32, fontWeight: 300 }}>Prestations</h1>
              <button onClick={() => setShowServiceForm(!showServiceForm)} style={btnPrimary}>+ Ajouter</button>
            </div>

            {showServiceForm && (
              <form onSubmit={addService} style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: 24, marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Nom</label>
                    <input required value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} placeholder="Ex: Coupe & Brushing" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Catégorie</label>
                    <input value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})} placeholder="Ex: Coiffure" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Durée (minutes)</label>
                    <input type="number" required value={newService.duration} onChange={e => setNewService({...newService, duration: parseInt(e.target.value)})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Prix (€)</label>
                    <input type="number" required value={newService.price} onChange={e => setNewService({...newService, price: parseFloat(e.target.value)})} style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="submit" style={btnPrimary}>Enregistrer</button>
                  <button type="button" onClick={() => setShowServiceForm(false)} style={btnSecondary}>Annuler</button>
                </div>
              </form>
            )}

            {services.length === 0 ? (
              <div style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: '40px', textAlign: 'center' }}>
                <p style={{ fontFamily: sf, fontSize: 14, color: '#999' }}>Aucune prestation. Clique sur &quot;+ Ajouter&quot; pour commencer.</p>
              </div>
            ) : (
              services.map(s => (
                <div key={s.id} style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: '18px 22px', marginBottom: -1, display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: sf, fontSize: 15, fontWeight: 500, marginBottom: 2 }}>{s.name}</p>
                    <p style={{ fontFamily: sf, fontSize: 11, color: '#999' }}>{s.category || 'Sans catégorie'} · {s.duration} min</p>
                  </div>
                  <span style={{ fontFamily: ss, fontSize: 22, fontWeight: 300, marginRight: 20 }}>{s.price}€</span>
                  <button onClick={() => deleteService(s.id)} style={{ ...btnSecondary, color: '#EF4444', borderColor: '#FEE2E2' }}>Supprimer</button>
                </div>
              ))
            )}
          </div>
        )}

        {/* CLIENTS */}
        {tab === 'clients' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h1 style={{ fontFamily: ss, fontSize: 32, fontWeight: 300 }}>Clients</h1>
              <button onClick={() => setShowClientForm(!showClientForm)} style={btnPrimary}>+ Nouveau</button>
            </div>

            {showClientForm && (
              <form onSubmit={addClient} style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: 24, marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Prénom</label>
                    <input required value={newClient.first_name} onChange={e => setNewClient({...newClient, first_name: e.target.value})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Nom</label>
                    <input required value={newClient.last_name} onChange={e => setNewClient({...newClient, last_name: e.target.value})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Téléphone</label>
                    <input value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} placeholder="06 12 34 56 78" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Email</label>
                    <input type="email" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="submit" style={btnPrimary}>Enregistrer</button>
                  <button type="button" onClick={() => setShowClientForm(false)} style={btnSecondary}>Annuler</button>
                </div>
              </form>
            )}

            {clients.length === 0 ? (
              <div style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: '40px', textAlign: 'center' }}>
                <p style={{ fontFamily: sf, fontSize: 14, color: '#999' }}>Aucun client. Ajoute tes premiers clients !</p>
              </div>
            ) : (
              clients.map(c => (
                <div key={c.id} style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: '18px 22px', marginBottom: -1, display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontFamily: sf, fontSize: 12, fontWeight: 500, marginRight: 14 }}>
                    {(c.first_name || '')[0]}{(c.last_name || '')[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: sf, fontSize: 14, fontWeight: 500 }}>{c.first_name} {c.last_name}</p>
                    <p style={{ fontFamily: sf, fontSize: 11, color: '#999' }}>{c.phone || 'Pas de téléphone'} · {c.email || 'Pas d\'email'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* EQUIPE */}
        {tab === 'equipe' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h1 style={{ fontFamily: ss, fontSize: 32, fontWeight: 300 }}>Équipe</h1>
              <button onClick={() => setShowTeamForm(!showTeamForm)} style={btnPrimary}>+ Ajouter</button>
            </div>

            <div style={{ background: '#FAFAF8', border: '1px solid #E8E8E4', padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>♾️</span>
              <p style={{ fontFamily: sf, fontSize: 13, color: '#777' }}><strong style={{ fontWeight: 500, color: '#1A1A1A' }}>Membres illimités</strong> — Ajoute autant de personnes que tu veux, c&apos;est inclus.</p>
            </div>

            {showTeamForm && (
              <form onSubmit={addMember} style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: 24, marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Nom</label>
                    <input required value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} placeholder="Ex: Sabrina" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: 4 }}>Rôle</label>
                    <input value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} placeholder="Ex: Coiffeuse" style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="submit" style={btnPrimary}>Enregistrer</button>
                  <button type="button" onClick={() => setShowTeamForm(false)} style={btnSecondary}>Annuler</button>
                </div>
              </form>
            )}

            {team.length === 0 ? (
              <div style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: '40px', textAlign: 'center' }}>
                <p style={{ fontFamily: sf, fontSize: 14, color: '#999' }}>Aucun membre. Ajoute ton équipe !</p>
              </div>
            ) : (
              team.map(m => (
                <div key={m.id} style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: '20px 22px', marginBottom: -1, display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontFamily: sf, fontSize: 16, fontWeight: 600, marginRight: 16 }}>
                    {(m.name || '')[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: sf, fontSize: 15, fontWeight: 500 }}>{m.name}</p>
                    <p style={{ fontFamily: sf, fontSize: 12, color: '#999' }}>{m.role || 'Pas de rôle défini'}</p>
                  </div>
                  <button onClick={() => deleteMember(m.id)} style={{ ...btnSecondary, color: '#EF4444', borderColor: '#FEE2E2' }}>Supprimer</button>
                </div>
              ))
            )}
          </div>
        )}

        {/* RDV */}
        {tab === 'rdv' && (
          <div>
            <h1 style={{ fontFamily: ss, fontSize: 32, fontWeight: 300, marginBottom: 24 }}>Rendez-vous</h1>
            {appointments.length === 0 ? (
              <div style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: '40px', textAlign: 'center' }}>
                <p style={{ fontFamily: sf, fontSize: 14, color: '#999' }}>Aucun rendez-vous pour le moment.</p>
                <p style={{ fontFamily: sf, fontSize: 12, color: '#BBB', marginTop: 8 }}>Partage ton lien de réservation pour recevoir tes premiers RDV !</p>
              </div>
            ) : (
              appointments.map(a => (
                <div key={a.id} style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: '18px 22px', marginBottom: -1, display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 50, marginRight: 14 }}>
                    <p style={{ fontFamily: sf, fontSize: 13, fontWeight: 600 }}>{a.time || '--:--'}</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: sf, fontSize: 14, fontWeight: 500 }}>{a.client_name || 'Client'}</p>
                    <p style={{ fontFamily: sf, fontSize: 11, color: '#999' }}>{a.service_name || 'Prestation'} · {a.date}</p>
                  </div>
                  <span style={{
                    fontFamily: sf, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', padding: '4px 12px',
                    background: a.status === 'confirmed' ? '#1A1A1A' : 'transparent',
                    color: a.status === 'confirmed' ? '#FFF' : '#999',
                    border: a.status === 'confirmed' ? 'none' : '1px solid #D4D4D4',
                  }}>
                    {a.status === 'confirmed' ? 'Confirmé' : a.status === 'pending' ? 'En attente' : a.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* PARAMETRES */}
        {tab === 'parametres' && (
          <div>
            <h1 style={{ fontFamily: ss, fontSize: 32, fontWeight: 300, marginBottom: 24 }}>Paramètres</h1>

            <div style={{ background: '#1A1A1A', color: '#FFF', padding: '20px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: sf, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.5, marginBottom: 4 }}>Mon abonnement</p>
                <p style={{ fontFamily: sf, fontSize: 16, fontWeight: 500 }}>MY PRESTY — 19€/mois</p>
                <p style={{ fontFamily: sf, fontSize: 12, fontWeight: 300, opacity: 0.5, marginTop: 2 }}>Tout illimité : équipe, réservations, clients, prestations</p>
              </div>
              <span style={{ fontFamily: sf, fontSize: 10, padding: '6px 14px', border: '1px solid rgba(74,222,128,0.5)', color: '#4ADE80', letterSpacing: 1.5, textTransform: 'uppercase' }}>Actif</span>
            </div>

            <div style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: '20px 24px', marginBottom: 12 }}>
              <p style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>Lien de réservation public</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <p style={{ fontFamily: sf, fontSize: 15, fontWeight: 500, flex: 1 }}>{publicUrl}</p>
                <button onClick={() => navigator.clipboard.writeText(publicUrl)} style={btnPrimary}>Copier</button>
              </div>
            </div>

            <div style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: '20px 24px', marginBottom: 12 }}>
              <p style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>Informations du salon</p>
              <p style={{ fontFamily: sf, fontSize: 15, fontWeight: 500 }}>{salon.name}</p>
              <p style={{ fontFamily: sf, fontSize: 12, color: '#999', marginTop: 4 }}>{salon.city || 'Ville non définie'} · {salon.phone || 'Téléphone non défini'}</p>
            </div>

            <div style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: '20px 24px' }}>
              <p style={{ fontFamily: sf, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>Compte</p>
              <p style={{ fontFamily: sf, fontSize: 13, color: '#777' }}>{user?.email}</p>
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
