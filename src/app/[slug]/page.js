'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const sf = "'Outfit', sans-serif";
const ss = "'Cormorant Garamond', 'Georgia', serif";

export default function PublicBooking({ params }) {
  const slug = params.slug;
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Booking flow
  const [step, setStep] = useState(0); // 0=browse, 1=service selected, 2=date, 3=confirm, 4=done
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSalon();
  }, [slug]);

  async function loadSalon() {
    const { data: salons } = await supabase.from('salons').select('*').eq('slug', slug).limit(1);

    if (!salons || salons.length === 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const s = salons[0];
    setSalon(s);

    const [svcRes, teamRes] = await Promise.all([
      supabase.from('services').select('*').eq('salon_id', s.id).order('category').order('name'),
      supabase.from('team_members').select('*').eq('salon_id', s.id),
    ]);

    setServices(svcRes.data || []);
    setTeam(teamRes.data || []);
    setLoading(false);
  }

  async function handleBooking(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create or find client
      let clientId = null;
      const names = clientInfo.name.trim().split(' ');
      const firstName = names[0] || '';
      const lastName = names.slice(1).join(' ') || '';

      const { data: existingClients } = await supabase
        .from('clients')
        .select('id')
        .eq('salon_id', salon.id)
        .eq('phone', clientInfo.phone)
        .limit(1);

      if (existingClients && existingClients.length > 0) {
        clientId = existingClients[0].id;
      } else {
        const { data: newClient } = await supabase
          .from('clients')
          .insert({ salon_id: salon.id, first_name: firstName, last_name: lastName, phone: clientInfo.phone, email: clientInfo.email })
          .select('id')
          .single();
        if (newClient) clientId = newClient.id;
      }

      // Create appointment
      await supabase.from('appointments').insert({
        salon_id: salon.id,
        client_id: clientId,
        client_name: clientInfo.name,
        service_name: selectedService.name,
        service_id: selectedService.id,
        date: selectedDate,
        time: selectedTime,
        price: selectedService.price,
        status: 'pending',
      });

      setStep(4);
    } catch (err) {
      alert('Erreur lors de la réservation. Réessaie.');
    }
    setSubmitting(false);
  }

  // Generate available dates (next 14 days)
  const dates = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    if (d.getDay() !== 0) { // Skip Sundays
      dates.push(d.toISOString().split('T')[0]);
    }
  }

  const timeSlots = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const days = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
    const months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: sf, fontSize: 16, color: '#999' }}>Chargement...</p>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <div>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
        <h1 style={{ fontFamily: ss, fontSize: 32, fontWeight: 300, marginBottom: 8 }}>Salon introuvable</h1>
        <p style={{ fontFamily: sf, fontSize: 16, color: '#999' }}>Ce lien ne correspond à aucun salon.</p>
      </div>
    </div>
  );

  // Group services by category
  const categories = {};
  services.forEach(s => {
    const cat = s.category || 'Autres';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(s);
  });

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8' }}>

      {/* Header */}
      <header style={{ background: '#1A1A1A', padding: '20px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: ss, fontSize: 28, fontWeight: 400, color: '#FFF', letterSpacing: 1 }}>{salon.name}</h1>
        {salon.city && <p style={{ fontFamily: sf, fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 4, letterSpacing: 1 }}>{salon.city}</p>}
      </header>

      <main style={{ maxWidth: 600, margin: '0 auto', padding: '24px 20px' }}>

        {/* Step 0: Browse services */}
        {step === 0 && (
          <div>
            <h2 style={{ fontFamily: ss, fontSize: 30, fontWeight: 300, marginBottom: 4 }}>Réserver une prestation</h2>
            <p style={{ fontFamily: sf, fontSize: 15, color: '#999', marginBottom: 24 }}>Choisis ta prestation pour commencer</p>

            {services.length === 0 ? (
              <div style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: 32, textAlign: 'center' }}>
                <p style={{ fontFamily: sf, fontSize: 16, color: '#999' }}>Aucune prestation disponible pour le moment.</p>
              </div>
            ) : (
              Object.entries(categories).map(([cat, svcs]) => (
                <div key={cat} style={{ marginBottom: 20 }}>
                  <h3 style={{ fontFamily: sf, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', color: '#999', marginBottom: 10 }}>{cat}</h3>
                  {svcs.map(s => (
                    <div key={s.id} onClick={() => { setSelectedService(s); setStep(1); }} style={{
                      background: '#FFF', border: '1px solid #E8E8E4', padding: '18px 20px', marginBottom: -1,
                      display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#1A1A1A'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#E8E8E4'}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: sf, fontSize: 16, fontWeight: 500, marginBottom: 2 }}>{s.name}</p>
                        <p style={{ fontFamily: sf, fontSize: 14, color: '#999' }}>{s.duration} min</p>
                      </div>
                      <span style={{ fontFamily: ss, fontSize: 22, fontWeight: 300 }}>{s.price}€</span>
                      <span style={{ fontFamily: sf, fontSize: 14, color: '#999', marginLeft: 14 }}>→</span>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {/* Step 1: Service selected, pick date */}
        {step === 1 && (
          <div>
            <button onClick={() => setStep(0)} style={{ fontFamily: sf, fontSize: 14, color: '#999', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0, letterSpacing: 1.5, textTransform: 'uppercase' }}>← Retour</button>

            <div style={{ background: '#1A1A1A', color: '#FFF', padding: '18px 20px', marginBottom: 24 }}>
              <p style={{ fontFamily: sf, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.5, marginBottom: 4 }}>Prestation sélectionnée</p>
              <p style={{ fontFamily: sf, fontSize: 17, fontWeight: 500 }}>{selectedService.name} — {selectedService.price}€</p>
              <p style={{ fontFamily: sf, fontSize: 14, opacity: 0.5, marginTop: 2 }}>{selectedService.duration} min</p>
            </div>

            <h3 style={{ fontFamily: ss, fontSize: 22, fontWeight: 300, marginBottom: 16 }}>Choisis un jour</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
              {dates.map(d => (
                <button key={d} onClick={() => { setSelectedDate(d); setStep(2); }} style={{
                  padding: '14px 8px', background: '#FFF', border: '1px solid #E8E8E4',
                  cursor: 'pointer', fontFamily: sf, fontSize: 15, textAlign: 'center',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#1A1A1A'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E8E8E4'}
                >
                  {formatDate(d)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Pick time */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} style={{ fontFamily: sf, fontSize: 14, color: '#999', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0, letterSpacing: 1.5, textTransform: 'uppercase' }}>← Retour</button>

            <div style={{ background: '#1A1A1A', color: '#FFF', padding: '18px 20px', marginBottom: 24 }}>
              <p style={{ fontFamily: sf, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.5, marginBottom: 4 }}>Récapitulatif</p>
              <p style={{ fontFamily: sf, fontSize: 17, fontWeight: 500 }}>{selectedService.name} — {selectedService.price}€</p>
              <p style={{ fontFamily: sf, fontSize: 14, opacity: 0.5, marginTop: 2 }}>{formatDate(selectedDate)}</p>
            </div>

            <h3 style={{ fontFamily: ss, fontSize: 22, fontWeight: 300, marginBottom: 16 }}>Choisis un créneau</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {timeSlots.map(t => (
                <button key={t} onClick={() => { setSelectedTime(t); setStep(3); }} style={{
                  padding: '14px', background: '#FFF', border: '1px solid #E8E8E4',
                  cursor: 'pointer', fontFamily: sf, fontSize: 16, textAlign: 'center',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1A1A1A'; e.currentTarget.style.color = '#FFF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FFF'; e.currentTarget.style.color = '#1A1A1A'; }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Client info + confirm */}
        {step === 3 && (
          <div>
            <button onClick={() => setStep(2)} style={{ fontFamily: sf, fontSize: 14, color: '#999', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0, letterSpacing: 1.5, textTransform: 'uppercase' }}>← Retour</button>

            <div style={{ background: '#1A1A1A', color: '#FFF', padding: '18px 20px', marginBottom: 24 }}>
              <p style={{ fontFamily: sf, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.5, marginBottom: 4 }}>Récapitulatif</p>
              <p style={{ fontFamily: sf, fontSize: 17, fontWeight: 500 }}>{selectedService.name} — {selectedService.price}€</p>
              <p style={{ fontFamily: sf, fontSize: 14, opacity: 0.5, marginTop: 2 }}>{formatDate(selectedDate)} à {selectedTime}</p>
            </div>

            <h3 style={{ fontFamily: ss, fontSize: 22, fontWeight: 300, marginBottom: 16 }}>Tes coordonnées</h3>
            <form onSubmit={handleBooking}>
              <input required value={clientInfo.name} onChange={e => setClientInfo({...clientInfo, name: e.target.value})} placeholder="Ton nom complet" style={{ width: '100%', padding: '14px 16px', border: '1px solid #E8E8E4', fontFamily: sf, fontSize: 16, fontWeight: 300, outline: 'none', background: '#FFF', marginBottom: 10 }} />
              <input required value={clientInfo.phone} onChange={e => setClientInfo({...clientInfo, phone: e.target.value})} placeholder="Ton numéro de téléphone" style={{ width: '100%', padding: '14px 16px', border: '1px solid #E8E8E4', fontFamily: sf, fontSize: 16, fontWeight: 300, outline: 'none', background: '#FFF', marginBottom: 10 }} />
              <input type="email" value={clientInfo.email} onChange={e => setClientInfo({...clientInfo, email: e.target.value})} placeholder="Ton email (optionnel)" style={{ width: '100%', padding: '14px 16px', border: '1px solid #E8E8E4', fontFamily: sf, fontSize: 16, fontWeight: 300, outline: 'none', background: '#FFF', marginBottom: 20 }} />

              <button type="submit" disabled={submitting} style={{
                width: '100%', padding: 16, background: '#1A1A1A', color: '#FFF', border: 'none',
                fontFamily: sf, fontSize: 15, fontWeight: 600, letterSpacing: 2.5,
                textTransform: 'uppercase', cursor: 'pointer', opacity: submitting ? 0.5 : 1,
              }}>
                {submitting ? 'Réservation...' : 'Confirmer la réservation ✦'}
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: 48, marginBottom: 20 }}>✦</p>
            <h2 style={{ fontFamily: ss, fontSize: 32, fontWeight: 300, marginBottom: 8 }}>Réservation confirmée !</h2>
            <p style={{ fontFamily: sf, fontSize: 16, color: '#777', marginBottom: 24 }}>Tu recevras un email de confirmation.</p>

            <div style={{ background: '#FFF', border: '1px solid #E8E8E4', padding: 24, textAlign: 'left', maxWidth: 400, margin: '0 auto' }}>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontFamily: sf, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', color: '#999', marginBottom: 2 }}>Prestation</p>
                <p style={{ fontFamily: sf, fontSize: 16, fontWeight: 500 }}>{selectedService.name}</p>
              </div>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontFamily: sf, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', color: '#999', marginBottom: 2 }}>Date et heure</p>
                <p style={{ fontFamily: sf, fontSize: 16, fontWeight: 500 }}>{formatDate(selectedDate)} à {selectedTime}</p>
              </div>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontFamily: sf, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', color: '#999', marginBottom: 2 }}>Prix</p>
                <p style={{ fontFamily: sf, fontSize: 16, fontWeight: 500 }}>{selectedService.price}€</p>
              </div>
              <div>
                <p style={{ fontFamily: sf, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', color: '#999', marginBottom: 2 }}>Salon</p>
                <p style={{ fontFamily: sf, fontSize: 16, fontWeight: 500 }}>{salon.name}</p>
              </div>
            </div>

            <button onClick={() => { setStep(0); setSelectedService(null); setSelectedDate(''); setSelectedTime(''); setClientInfo({ name: '', phone: '', email: '' }); }} style={{
              marginTop: 24, padding: '14px 28px', background: 'transparent', border: '1px solid #D4D4D4',
              fontFamily: sf, fontSize: 15, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer',
            }}>
              Réserver une autre prestation
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '24px 20px', borderTop: '1px solid #E8E8E4', marginTop: 40 }}>
        <p style={{ fontFamily: sf, fontSize: 14, color: '#CCC', letterSpacing: 1.5 }}>Propulsé par <strong style={{ color: '#999', fontWeight: 500 }}>MY PRESTY</strong> · 19€/mois</p>
      </footer>
    </div>
  );
}
