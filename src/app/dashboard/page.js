'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const sf = "'Outfit', sans-serif";
const ss = "'Cormorant Garamond', 'Georgia', serif";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('accueil');
  const [isMobile, setIsMobile] = useState(false);

  // Data
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [team, setTeam] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loyaltyConfig, setLoyaltyConfig] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [waitlist, setWaitlist] = useState([]);

  // UI state
  const [showForm, setShowForm] = useState(null);
  const [selClient, setSelClient] = useState(null);
  const [selMember, setSelMember] = useState(null);
  const [statsPeriod, setStatsPeriod] = useState('month');
  const [dynPricing, setDynPricing] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Forms
  const [newService, setNewService] = useState({ name:'',duration:60,price:0,category:'',photo_url:'',promo_active:false,promo_percent:0,promo_label:'' });
  const [newClient, setNewClient] = useState({ first_name:'',last_name:'',phone:'',email:'',notes:'',allergies:'',birthday:'' });
  const [newMember, setNewMember] = useState({ name:'',role:'',commission_percent:0,target_monthly:0,color:'#1A1A1A' });
  const [newMessage, setNewMessage] = useState({ title:'',content:'' });
  const [newPhoto, setNewPhoto] = useState({ url:'',caption:'',photo_type:'feed' });
  const [newProduct, setNewProduct] = useState({ name:'',brand:'',price:0,stock:0,category:'' });
  const [newPackage, setNewPackage] = useState({ name:'',description:'',services:'',total_price:0,original_price:0 });
  const [newFormula, setNewFormula] = useState({ client:'',formula:'' });

  // IA
  const [aiChat, setAiChat] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  // Stripe
  const [subscription, setSubscription] = useState({ status:'loading' });

  const tc = salon?.theme_color || '#1A1A1A';

  useEffect(() => {
    const r = () => setIsMobile(window.innerWidth < 768);
    r(); window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/connexion'); return; }
    setUser(user);
    const { data: salons } = await supabase.from('salons').select('*').eq('owner_id', user.id).limit(1);
    if (salons && salons.length > 0) {
      setSalon(salons[0]);
      setDynPricing(salons[0].dyn_pricing_enabled || false);
      loadData(salons[0].id);
      checkSubscription(user.email);
    }
    setLoading(false);
  }

  async function checkSubscription(email) {
    try {
      const res = await fetch('/api/stripe/status', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email}) });
      const data = await res.json();
      setSubscription(data);
    } catch(e) { setSubscription({status:'none'}); }
  }

  async function loadData(salonId) {
    const [a,c,s,t,p,m,l,r,pr,pk,w] = await Promise.all([
      supabase.from('appointments').select('*').eq('salon_id',salonId).order('date',{ascending:false}).order('time',{ascending:true}),
      supabase.from('clients').select('*').eq('salon_id',salonId).order('created_at',{ascending:false}),
      supabase.from('services').select('*').eq('salon_id',salonId).order('name'),
      supabase.from('team_members').select('*').eq('salon_id',salonId).order('name'),
      supabase.from('salon_photos').select('*').eq('salon_id',salonId).order('created_at',{ascending:false}),
      supabase.from('messages').select('*').eq('salon_id',salonId).order('sent_at',{ascending:false}),
      supabase.from('loyalty_config').select('*').eq('salon_id',salonId).limit(1),
      supabase.from('reviews').select('*').eq('salon_id',salonId).order('created_at',{ascending:false}),
      supabase.from('products').select('*').eq('salon_id',salonId).order('name'),
      supabase.from('packages').select('*').eq('salon_id',salonId).order('created_at',{ascending:false}),
      supabase.from('waitlist').select('*').eq('salon_id',salonId).eq('status','waiting').order('created_at',{ascending:false}),
    ]);
    setAppointments(a.data||[]);setClients(c.data||[]);setServices(s.data||[]);setTeam(t.data||[]);
    setPhotos(p.data||[]);setMessages(m.data||[]);setLoyaltyConfig(l.data?.[0]||null);
    setReviews(r.data||[]);setProducts(pr.data||[]);setPackages(pk.data||[]);setWaitlist(w.data||[]);
  }

  // ═══════ HELPERS ═══════
  function getFilteredAppointments() {
    const now = new Date();
    return appointments.filter(a => {
      const d = new Date(a.date);
      if (statsPeriod === 'day') return d.toDateString() === now.toDateString();
      if (statsPeriod === 'week') { const w = new Date(now); w.setDate(w.getDate()-7); return d >= w; }
      if (statsPeriod === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      return d.getFullYear() === now.getFullYear();
    });
  }
  function getCA() { return getFilteredAppointments().reduce((s,a)=>s+(Number(a.price)||0),0); }
  function getBusyDays() {
    const days = [0,0,0,0,0,0,0];
    appointments.forEach(a => { const d = new Date(a.date).getDay(); days[d]++; });
    return ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'].map((n,i) => ({name:n,count:days[i]}));
  }
  function getBusyHours() {
    const hours = {};
    appointments.forEach(a => { if(a.time){const h=a.time.split(':')[0]+'h';hours[h]=(hours[h]||0)+1;} });
    return Object.entries(hours).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([h,c])=>({hour:h,count:c}));
  }
  function getTopServices() {
    const sv = {};
    appointments.forEach(a => { if(a.service_name) sv[a.service_name]=(sv[a.service_name]||0)+1; });
    return Object.entries(sv).sort((a,b)=>b[1]-a[1]).slice(0,5);
  }
  function getDangerClients() {
    const now = Date.now();
    return clients.filter(c => {
      if(!c.total_visits || c.total_visits < 2) return false;
      const lastAppt = appointments.find(a => a.client_name && a.client_name.includes(c.first_name));
      if(!lastAppt) return false;
      const daysSince = Math.round((now - new Date(lastAppt.date).getTime())/(1000*60*60*24));
      const avgInterval = 35;
      return daysSince > avgInterval * 1.3;
    });
  }
  function getAvgRating() {
    if(reviews.length===0) return 0;
    return (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1);
  }
  function getPredictedCA() {
    const confirmed = appointments.filter(a => {
      const d = new Date(a.date);
      const now = new Date();
      const nextWeek = new Date(now); nextWeek.setDate(now.getDate()+7);
      return d >= now && d <= nextWeek;
    }).reduce((s,a)=>s+(Number(a.price)||0),0);
    const avgWeekly = getCA() / 4;
    return { confirmed, predicted: Math.round(confirmed + avgWeekly * 0.3), avg: Math.round(avgWeekly) };
  }
  function getClientHistory(client) {
    return appointments.filter(a => a.client_name && (a.client_name.includes(client.first_name) || a.client_name.includes(client.last_name)));
  }
  function getClientFavorites(client) {
    const hist = getClientHistory(client);
    const sv = {};
    hist.forEach(a => { if(a.service_name) sv[a.service_name]=(sv[a.service_name]||0)+1; });
    return Object.entries(sv).sort((a,b)=>b[1]-a[1]);
  }


  // ═══════ CRUD ═══════
  async function addService(e) {
    e.preventDefault();
    await supabase.from('services').insert({...newService,salon_id:salon.id});
    setNewService({name:'',duration:60,price:0,category:'',photo_url:'',promo_active:false,promo_percent:0,promo_label:''});
    setShowForm(null); loadData(salon.id);
  }
  async function deleteService(id) { await supabase.from('services').delete().eq('id',id); loadData(salon.id); }
  async function togglePromo(s) {
    await supabase.from('services').update({promo_active:!s.promo_active}).eq('id',s.id);
    loadData(salon.id);
  }
  async function addClient(e) {
    e.preventDefault();
    await supabase.from('clients').insert({...newClient,salon_id:salon.id});
    setNewClient({first_name:'',last_name:'',phone:'',email:'',notes:'',allergies:'',birthday:''});
    setShowForm(null); loadData(salon.id);
  }
  async function addMember(e) {
    e.preventDefault();
    await supabase.from('team_members').insert({...newMember,salon_id:salon.id});
    setNewMember({name:'',role:'',commission_percent:0,target_monthly:0,color:'#1A1A1A'});
    setShowForm(null); loadData(salon.id);
  }
  async function deleteMember(id) { await supabase.from('team_members').delete().eq('id',id); loadData(salon.id); }
  async function sendMessage(e) {
    e.preventDefault();
    await supabase.from('messages').insert({...newMessage,salon_id:salon.id,target:'all'});
    setNewMessage({title:'',content:''}); setShowForm(null); loadData(salon.id);
  }
  async function addPhoto(e) {
    e.preventDefault();
    await supabase.from('salon_photos').insert({...newPhoto,salon_id:salon.id});
    setNewPhoto({url:'',caption:'',photo_type:'feed'}); setShowForm(null); loadData(salon.id);
  }
  async function deletePhoto(id) { await supabase.from('salon_photos').delete().eq('id',id); loadData(salon.id); }
  async function addProduct(e) {
    e.preventDefault();
    await supabase.from('products').insert({...newProduct,salon_id:salon.id});
    setNewProduct({name:'',brand:'',price:0,stock:0,category:''}); setShowForm(null); loadData(salon.id);
  }
  async function deleteProduct(id) { await supabase.from('products').delete().eq('id',id); loadData(salon.id); }
  async function addPackage(e) {
    e.preventDefault();
    const svcs = newPackage.services.split(',').map(s=>s.trim());
    await supabase.from('packages').insert({name:newPackage.name,description:newPackage.description,services:svcs,total_price:newPackage.total_price,original_price:newPackage.original_price,salon_id:salon.id});
    setNewPackage({name:'',description:'',services:'',total_price:0,original_price:0}); setShowForm(null); loadData(salon.id);
  }
  async function deletePackage(id) { await supabase.from('packages').delete().eq('id',id); loadData(salon.id); }
  async function replyReview(reviewId) {
    await supabase.from('reviews').update({reply:replyText}).eq('id',reviewId);
    setReplyingTo(null); setReplyText(''); loadData(salon.id);
  }
  async function saveLoyalty(active, visits, reward) {
    if(loyaltyConfig) { await supabase.from('loyalty_config').update({active,visits_required:visits,reward_text:reward}).eq('id',loyaltyConfig.id); }
    else { await supabase.from('loyalty_config').insert({salon_id:salon.id,active,visits_required:visits,reward_text:reward}); }
    loadData(salon.id);
  }
  async function saveSalonSettings(updates) {
    await supabase.from('salons').update(updates).eq('id',salon.id);
    setSalon({...salon,...updates});
  }
  async function addFormula(memberId) {
    // Store formula in team_member notes (JSON in notes field for simplicity)
    const member = team.find(m=>m.id===memberId);
    const formulas = JSON.parse(member?.formulas_json || '[]');
    formulas.push({...newFormula, date: new Date().toLocaleDateString('fr-FR')});
    await supabase.from('team_members').update({formulas_json: JSON.stringify(formulas)}).eq('id',memberId);
    setNewFormula({client:'',formula:''}); setShowForm(null); loadData(salon.id);
  }
  async function handleStripeConnect() {
    const res = await fetch('/api/stripe/connect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:user.email,salonId:salon.id})});
    const data = await res.json();
    if(data.url) window.location.href = data.url;
  }

  // ═══════ AI ASSISTANT ═══════
  function handleAi(q) {
    if(!q.trim()) return;
    setAiChat(prev=>[...prev,{role:'user',text:q}]);
    setAiInput(''); setAiTyping(true);
    setTimeout(()=>{
      const caVal = getCA();
      const filtered = getFilteredAppointments();
      const danger = getDangerClients();
      const avg = getAvgRating();
      let resp = '';
      const ql = q.toLowerCase();
      if(ql.includes('mois')||ql.includes('comment va')) {
        resp = `📊 Ce mois : ${caVal}€ de CA, ${filtered.length} RDV, panier moyen ${filtered.length>0?Math.round(caVal/filtered.length):0}€. ${clients.length} clients au total, note moyenne ${avg}/5. ${danger.length>0?`⚠️ ${danger.length} cliente(s) en danger de perte.`:'✓ Aucune cliente en danger.'}`;
      } else if(ql.includes('recontact')||ql.includes('relancer')||ql.includes('danger')) {
        resp = danger.length>0?`🔴 ${danger.length} cliente(s) à recontacter :\n${danger.map(c=>`• ${c.first_name} ${c.last_name} — ${c.total_visits} visites, ${c.total_spent||0}€ dépensés`).join('\n')}\n\n💡 Envoie un SMS personnalisé depuis l'onglet Clients.`:'✅ Aucune cliente en danger ! Toutes sont dans leur cycle habituel.';
      } else if(ql.includes('créneau')||ql.includes('creneau')||ql.includes('remplissage')) {
        const busyD = getBusyDays();
        const worst = busyD.filter(d=>d.count>0).sort((a,b)=>a.count-b.count)[0];
        resp = worst?`📉 Ton jour le moins rempli : ${worst.name} (${worst.count} RDV). Active la tarification dynamique dans Prestations pour offrir un tarif Happy Hour ce jour-là.`:'Pas encore assez de données pour analyser les créneaux.';
      } else if(ql.includes('promo')||ql.includes('remplir')) {
        resp = `🎯 Suggestions promo :\n• Happy Hour sur les jours creux (-15%)\n• Flash SMS aux ${waitlist.length} clientes en waitlist\n• Pack "${services[0]?.name||'Coupe'} + Soin" à prix réduit\n\n💡 Crée un forfait dans l'onglet Forfaits ou envoie un message dans Communication.`;
      } else {
        resp = `🤔 D'après tes données : ${caVal}€ de CA ce mois, ${clients.length} clients, ${services.length} prestations. ${danger.length>0?`${danger.length} cliente(s) à relancer.`:''} Pose-moi une question plus précise !`;
      }
      setAiChat(prev=>[...prev,{role:'ai',text:resp}]);
      setAiTyping(false);
    }, 1200);
  }


  // ═══════ STYLES ═══════
  const sty = { fontFamily: sf, fontSize: isMobile?9:10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', marginBottom: 8 };
  const card = { background: '#FFF', border: '1px solid #E8E8E4', padding: isMobile?'14px':'18px', marginBottom: 10 };
  const inp = { width:'100%', padding:'10px 12px', border:'1px solid #E8E8E4', fontFamily:sf, fontSize:12, outline:'none', background:'#FFF', marginBottom:8, boxSizing:'border-box' };
  const btn = (outline) => ({ padding:'8px 16px', background:outline?'transparent':tc, color:outline?tc:'#FFF', border:outline?`1px solid ${tc}`:'none', fontFamily:sf, fontSize:10, fontWeight:600, letterSpacing:1.5, textTransform:'uppercase', cursor:'pointer' });

  const Tgl = ({on,fn}) => (<button onClick={fn} style={{width:40,height:22,borderRadius:11,background:on?'#4ADE80':'#DDD',border:'none',cursor:'pointer',position:'relative',flexShrink:0}}><div style={{width:18,height:18,borderRadius:'50%',background:'#FFF',position:'absolute',top:2,left:on?20:2,transition:'left 0.2s'}}/></button>);

  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5-n);

  const proTabs = [
    {id:'accueil',icon:'◉',label:'Accueil'},{id:'prestations',icon:'✦',label:'Presta.'},{id:'clients',icon:'♡',label:'Clients'},{id:'equipe',icon:'◎',label:'Équipe'},
    {id:'rdv',icon:'▦',label:'RDV'},{id:'avis',icon:'⭐',label:'Avis'},{id:'produits',icon:'📦',label:'Produits'},{id:'forfaits',icon:'🎫',label:'Forfaits'},
    {id:'parrainage',icon:'👩‍👧',label:'Parrain.'},{id:'com',icon:'✉',label:'Com.'},{id:'ia',icon:'🧠',label:'IA'},
    {id:'salon',icon:'📷',label:'Salon'},{id:'reglages',icon:'⚙',label:'Régl.'},
  ];

  // ═══════ LOADING ═══════
  if (loading) return (<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#FAFAF8'}}><p style={{fontFamily:sf,color:'#999',letterSpacing:3,textTransform:'uppercase',fontSize:12}}>Chargement...</p></div>);
  if (!salon) return (<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#FAFAF8',flexDirection:'column',gap:12}}><p style={{fontFamily:sf,color:'#999'}}>Aucun salon trouvé.</p><button onClick={()=>router.push('/inscription')} style={btn()}>Créer mon salon</button></div>);

  const dangerClients = getDangerClients();
  const caVal = getCA();
  const filtered = getFilteredAppointments();
  const busyDays = getBusyDays();
  const busyHours = getBusyHours();
  const maxDay = Math.max(...busyDays.map(d=>d.count),1);
  const prevCA = getPredictedCA();
  const avgRating = getAvgRating();

  // ═══════ RENDER ═══════
  return (
    <div style={{ fontFamily: sf, background: '#FAFAF8', minHeight: '100vh' }}>
      {/* HEADER */}
      <header style={{ background: tc, padding: isMobile?'10px 14px':'14px 28px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:28,height:28,border:'1.5px solid #FFF',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{color:'#FFF',fontFamily:ss,fontSize:12,fontWeight:600}}>{salon.name?.[0]||'P'}</span>
          </div>
          <span style={{fontFamily:sf,color:'#FFF',fontSize:11,fontWeight:600,letterSpacing:3}}>MY PRESTY</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {subscription.status==='active'||subscription.status==='trial'?<div style={{width:6,height:6,borderRadius:'50%',background:'#4ADE80'}}/>:<div style={{width:6,height:6,borderRadius:'50%',background:'#EF4444'}}/>}
          <span style={{fontFamily:sf,color:'rgba(255,255,255,0.5)',fontSize:10}}>{salon.name}</span>
          <button onClick={async()=>{await supabase.auth.signOut();router.push('/connexion');}} style={{fontFamily:sf,color:'rgba(255,255,255,0.3)',fontSize:9,background:'none',border:'none',cursor:'pointer'}}>Déco.</button>
        </div>
      </header>

      {/* NAV */}
      <nav style={{display:'flex',borderBottom:'1px solid #E8E8E4',background:'#FFF',overflowX:'auto',scrollbarWidth:'none',padding:'0 4px'}}>
        {proTabs.map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id);setSelClient(null);setSelMember(null);setShowForm(null);}} style={{
            padding:isMobile?'10px 7px':'12px 10px',background:'none',border:'none',
            borderBottom:tab===t.id?`2px solid ${tc}`:'2px solid transparent',
            cursor:'pointer',fontFamily:sf,fontSize:isMobile?7:9,fontWeight:tab===t.id?600:400,
            color:tab===t.id?'#1A1A1A':'#999',letterSpacing:1,textTransform:'uppercase',whiteSpace:'nowrap',flexShrink:0
          }}>{t.icon} {t.label}</button>
        ))}
      </nav>

      <main style={{padding:isMobile?'12px':'20px 28px',maxWidth:900,margin:'0 auto'}}>


        {/* ═══ ACCUEIL ═══ */}
        {tab === 'accueil' && (<div>
          <h1 style={{fontFamily:ss,fontSize:isMobile?20:26,fontWeight:300,marginBottom:4}}>Bienvenue, {salon.name} ✦</h1>
          <p style={{fontFamily:sf,fontSize:11,color:'#999',marginBottom:14}}>{filtered.length} RDV · {clients.length} clients · {services.length} prestations {avgRating>0&&`· ⭐ ${avgRating}`}</p>

          {dangerClients.length>0&&<div style={{background:'#FEF2F2',border:'1px solid #FEE2E2',padding:'12px 14px',marginBottom:12}}>
            <p style={{fontFamily:sf,fontSize:11,fontWeight:600,color:'#EF4444',marginBottom:6}}>🔴 {dangerClients.length} cliente(s) en danger de perte</p>
            {dangerClients.slice(0,3).map(c=>(<div key={c.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'3px 0'}}>
              <span style={{fontFamily:sf,fontSize:11}}>{c.first_name} {c.last_name} — {c.total_visits} visites</span>
              <span onClick={()=>{setTab('clients');setSelClient(c);}} style={{fontFamily:sf,fontSize:9,color:tc,fontWeight:600,cursor:'pointer'}}>Voir fiche →</span>
            </div>))}
          </div>}

          {waitlist.length>0&&<div style={{background:'#FFFBEB',border:'1px solid #FEF3C7',padding:'12px 14px',marginBottom:12}}>
            <p style={{fontFamily:sf,fontSize:11,fontWeight:600,color:'#92400E'}}>⚡ {waitlist.length} cliente(s) en liste d'attente</p>
          </div>}

          <div style={{display:'flex',gap:4,marginBottom:12}}>
            {[{id:'day',l:'Jour'},{id:'week',l:'Sem.'},{id:'month',l:'Mois'},{id:'year',l:'Année'}].map(p=>(
              <button key={p.id} onClick={()=>setStatsPeriod(p.id)} style={{padding:'6px 12px',border:statsPeriod===p.id?'none':'1px solid #E8E8E4',background:statsPeriod===p.id?tc:'#FFF',color:statsPeriod===p.id?'#FFF':'#777',fontFamily:sf,fontSize:9,letterSpacing:1,textTransform:'uppercase',cursor:'pointer'}}>{p.l}</button>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:12}}>
            <div style={{background:tc,color:'#FFF',padding:'16px 14px',gridColumn:'span 2'}}>
              <p style={{fontFamily:sf,fontSize:9,textTransform:'uppercase',letterSpacing:2,opacity:0.5,marginBottom:4}}>Chiffre d'affaires</p>
              <p style={{fontSize:32,fontWeight:300}}>{caVal.toLocaleString('fr-FR')}€</p>
            </div>
            {[{l:'RDV',v:filtered.length},{l:'Panier moyen',v:filtered.length>0?Math.round(caVal/filtered.length)+'€':'—'},{l:'Clients',v:clients.length},{l:'Produits vendus',v:products.reduce((s,p)=>s+p.stock,0)}].map((c,i)=>(
              <div key={i} style={{background:'#FFF',border:'1px solid #E8E8E4',padding:'14px'}}>
                <p style={{fontFamily:sf,fontSize:8,textTransform:'uppercase',letterSpacing:2,color:'#999',marginBottom:4}}>{c.l}</p>
                <p style={{fontSize:24,fontWeight:300}}>{c.v}</p>
              </div>
            ))}
          </div>

          <div style={card}>
            <p style={sty}>📈 Prévision semaine prochaine</p>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
              <div style={{flex:1}}><p style={{fontFamily:sf,fontSize:11,color:'#999'}}>Confirmé</p><p style={{fontFamily:sf,fontSize:20,fontWeight:300}}>{prevCA.confirmed}€</p></div>
              <div style={{width:1,height:30,background:'#E8E8E4'}}/>
              <div style={{flex:1}}><p style={{fontFamily:sf,fontSize:11,color:'#999'}}>Estimé</p><p style={{fontFamily:sf,fontSize:20,fontWeight:300}}>{prevCA.predicted}€</p></div>
            </div>
            {prevCA.avg>0&&<><div style={{background:'#F0F0EC',height:8,borderRadius:4,marginBottom:4}}><div style={{background:prevCA.predicted>=prevCA.avg?'#4ADE80':'#F59E0B',height:8,borderRadius:4,width:`${Math.min((prevCA.predicted/prevCA.avg)*100,100)}%`}}/></div>
            <p style={{fontFamily:sf,fontSize:10,color:prevCA.predicted>=prevCA.avg?'#4ADE80':'#F59E0B',fontWeight:500}}>{prevCA.predicted>=prevCA.avg?'✓ En bonne voie':'⚠️ En dessous de ta moyenne — lance une promo !'}</p></>}
          </div>

          <div style={card}>
            <p style={sty}>Jours les plus fréquentés</p>
            <div style={{display:'flex',gap:4,alignItems:'flex-end',height:70}}>
              {busyDays.map((d,i)=>(<div key={i} style={{flex:1,textAlign:'center'}}><div style={{background:d.count>0?tc:'#F0F0EC',height:Math.max((d.count/maxDay)*55,3),borderRadius:2,marginBottom:3}}/><p style={{fontFamily:sf,fontSize:9,color:'#999'}}>{d.name}</p></div>))}
            </div>
          </div>

          {busyHours.length>0&&<div style={card}>
            <p style={sty}>Heures les plus demandées</p>
            {busyHours.map((h,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:6,marginTop:5}}>
              <span style={{fontFamily:sf,fontSize:10,fontWeight:600,width:30}}>{h.hour}</span>
              <div style={{flex:1,background:'#F0F0EC',height:6,borderRadius:3}}><div style={{background:tc,height:6,borderRadius:3,width:`${(h.count/busyHours[0].count)*100}%`}}/></div>
              <span style={{fontFamily:sf,fontSize:9,color:'#999',width:20}}>{h.count}</span>
            </div>))}
          </div>}

          <div style={{...card,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><p style={{...sty,marginBottom:3}}>Ton lien de réservation</p><p style={{fontFamily:sf,fontSize:13,fontWeight:500}}>mypresty.com/{salon.slug}</p></div>
            <button onClick={()=>{navigator.clipboard?.writeText(`${window.location.origin}/${salon.slug}`);}} style={btn()}>Copier</button>
          </div>
        </div>)}


        {/* ═══ PRESTATIONS ═══ */}
        {tab === 'prestations' && (<div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <h1 style={{fontFamily:ss,fontSize:isMobile?20:26,fontWeight:300}}>Prestations</h1>
            <button onClick={()=>setShowForm(showForm==='service'?null:'service')} style={btn()}>{showForm==='service'?'✕ Fermer':'+ Ajouter'}</button>
          </div>

          <div style={{...card,display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div><p style={{fontFamily:sf,fontSize:12,fontWeight:500}}>💰 Tarification dynamique</p><p style={{fontFamily:sf,fontSize:10,color:'#999'}}>Ajuste les prix selon le remplissage</p></div>
            <Tgl on={dynPricing} fn={()=>{setDynPricing(!dynPricing);saveSalonSettings({dyn_pricing_enabled:!dynPricing});}}/>
          </div>

          {showForm==='service'&&<form onSubmit={addService} style={{...card,background:'#FAFAF8'}}>
            <p style={sty}>Nouvelle prestation</p>
            <input required placeholder="Nom (ex: Coupe & Brushing)" value={newService.name} onChange={e=>setNewService({...newService,name:e.target.value})} style={inp}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <input required type="number" placeholder="Durée (min)" value={newService.duration||''} onChange={e=>setNewService({...newService,duration:Number(e.target.value)})} style={inp}/>
              <input required type="number" placeholder="Prix (€)" value={newService.price||''} onChange={e=>setNewService({...newService,price:Number(e.target.value)})} style={inp}/>
            </div>
            <input placeholder="Catégorie (ex: Coiffure, Soins...)" value={newService.category} onChange={e=>setNewService({...newService,category:e.target.value})} style={inp}/>
            <input placeholder="URL photo (optionnel)" value={newService.photo_url} onChange={e=>setNewService({...newService,photo_url:e.target.value})} style={inp}/>
            <button type="submit" style={btn()}>Enregistrer</button>
          </form>}

          {services.length===0?<div style={card}><p style={{fontFamily:sf,color:'#999',textAlign:'center',padding:'20px 0'}}>Aucune prestation. Clique sur + Ajouter.</p></div>:
          services.map(s=>(<div key={s.id} style={{...card,marginBottom:-1,display:'flex',alignItems:'center',gap:10}}>
            <div style={{flex:1}}>
              <p style={{fontFamily:sf,fontSize:13,fontWeight:500}}>{s.name}</p>
              <p style={{fontFamily:sf,fontSize:10,color:'#999'}}>{s.duration}min{s.category?` · ${s.category}`:''}</p>
              {s.promo_active&&<span style={{fontFamily:sf,fontSize:9,background:'#FEF3C7',color:'#92400E',padding:'2px 6px',display:'inline-block',marginTop:3}}>🏷️ -{s.promo_percent}% {s.promo_label}</span>}
            </div>
            <div style={{textAlign:'right'}}>
              {s.promo_active?<><span style={{fontFamily:sf,fontSize:11,color:'#999',textDecoration:'line-through'}}>{s.price}€</span><br/><span style={{fontFamily:sf,fontSize:16,fontWeight:600}}>{Math.round(s.price*(1-s.promo_percent/100))}€</span></>:
              <span style={{fontFamily:sf,fontSize:16,fontWeight:500}}>{s.price}€</span>}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:4,flexShrink:0}}>
              <button onClick={()=>togglePromo(s)} style={{fontFamily:sf,fontSize:8,padding:'3px 8px',background:s.promo_active?'#FEF3C7':'#F5F5F3',border:'none',cursor:'pointer',color:s.promo_active?'#92400E':'#999'}}>🏷️ Promo</button>
              <button onClick={()=>deleteService(s.id)} style={{fontFamily:sf,fontSize:8,padding:'3px 8px',background:'#FEF2F2',border:'none',cursor:'pointer',color:'#EF4444'}}>✕</button>
            </div>
          </div>))}
        </div>)}

        {/* ═══ CLIENTS ═══ */}
        {tab === 'clients' && !selClient && (<div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <h1 style={{fontFamily:ss,fontSize:isMobile?20:26,fontWeight:300}}>Clients</h1>
            <button onClick={()=>setShowForm(showForm==='client'?null:'client')} style={btn()}>{showForm==='client'?'✕ Fermer':'+ Ajouter'}</button>
          </div>

          <div style={{background:tc,color:'#FFF',padding:'14px',marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><p style={{fontFamily:sf,fontSize:10,letterSpacing:2,textTransform:'uppercase',opacity:0.5}}>Programme fidélité</p>
              <p style={{fontFamily:sf,fontSize:13,fontWeight:500,marginTop:3}}>{loyaltyConfig?.active?`✓ ${loyaltyConfig.visits_required} visites = ${loyaltyConfig.reward_text}`:'Désactivé'}</p></div>
              <Tgl on={loyaltyConfig?.active||false} fn={()=>saveLoyalty(!loyaltyConfig?.active,loyaltyConfig?.visits_required||10,loyaltyConfig?.reward_text||'1 prestation offerte')}/>
            </div>
          </div>

          {showForm==='client'&&<form onSubmit={addClient} style={{...card,background:'#FAFAF8'}}>
            <p style={sty}>Nouveau client</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <input required placeholder="Prénom" value={newClient.first_name} onChange={e=>setNewClient({...newClient,first_name:e.target.value})} style={inp}/>
              <input required placeholder="Nom" value={newClient.last_name} onChange={e=>setNewClient({...newClient,last_name:e.target.value})} style={inp}/>
            </div>
            <input placeholder="Téléphone" value={newClient.phone} onChange={e=>setNewClient({...newClient,phone:e.target.value})} style={inp}/>
            <input placeholder="Email" value={newClient.email} onChange={e=>setNewClient({...newClient,email:e.target.value})} style={inp}/>
            <input placeholder="Notes privées" value={newClient.notes} onChange={e=>setNewClient({...newClient,notes:e.target.value})} style={inp}/>
            <input placeholder="Allergies / Contre-indications" value={newClient.allergies} onChange={e=>setNewClient({...newClient,allergies:e.target.value})} style={inp}/>
            <input type="date" placeholder="Anniversaire" value={newClient.birthday} onChange={e=>setNewClient({...newClient,birthday:e.target.value})} style={inp}/>
            <button type="submit" style={btn()}>Enregistrer</button>
          </form>}

          {clients.length===0?<div style={card}><p style={{fontFamily:sf,color:'#999',textAlign:'center',padding:'20px 0'}}>Aucun client. Ils apparaîtront ici après leur 1ère réservation.</p></div>:
          clients.map(c=>{
            const isDanger = dangerClients.some(d=>d.id===c.id);
            const ltv = Math.round((c.total_spent||0)*3.5);
            return(<div key={c.id} onClick={()=>setSelClient(c)} style={{...card,marginBottom:-1,display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
              <div style={{position:'relative',flexShrink:0}}>
                <div style={{width:36,height:36,borderRadius:'50%',background:isDanger?'#EF4444':tc,display:'flex',alignItems:'center',justifyContent:'center',color:'#FFF',fontFamily:sf,fontSize:12,fontWeight:600}}>{c.first_name?.[0]||''}{c.last_name?.[0]||''}</div>
                {isDanger&&<div style={{position:'absolute',top:-2,right:-2,width:10,height:10,borderRadius:'50%',background:'#EF4444',border:'2px solid #FFF'}}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontFamily:sf,fontSize:13,fontWeight:500}}>{c.first_name} {c.last_name} {isDanger&&<span style={{fontSize:10,color:'#EF4444'}}>⚠️</span>}</p>
                <p style={{fontFamily:sf,fontSize:10,color:'#999'}}>{c.phone||'—'} · {c.total_spent||0}€{ltv>0?` · LTV ${ltv}€`:''}</p>
              </div>
              {loyaltyConfig?.active&&<div style={{textAlign:'center',flexShrink:0}}>
                <svg width="32" height="32" style={{transform:'rotate(-90deg)'}}>
                  <circle cx="16" cy="16" r="13" fill="none" stroke="#F0F0EC" strokeWidth="2"/>
                  <circle cx="16" cy="16" r="13" fill="none" stroke={isDanger?'#EF4444':'#4ADE80'} strokeWidth="2" strokeDasharray={`${((c.loyalty_visits||0)/(loyaltyConfig.visits_required||10))*81.7} 81.7`}/>
                </svg>
                <p style={{fontFamily:sf,fontSize:8,fontWeight:600,marginTop:-24,position:'relative'}}>{c.loyalty_visits||0}/{loyaltyConfig.visits_required||10}</p>
              </div>}
              <span style={{color:'#CCC',fontSize:14}}>›</span>
            </div>);})}
        </div>)}

        {/* ═══ FICHE CLIENT DÉTAILLÉE ═══ */}
        {tab === 'clients' && selClient && (<div>
          <button onClick={()=>setSelClient(null)} style={{fontFamily:sf,fontSize:11,color:'#999',background:'none',border:'none',cursor:'pointer',marginBottom:10}}>← Retour aux clients</button>
          <div style={{textAlign:'center',marginBottom:14}}>
            <div style={{width:56,height:56,borderRadius:'50%',background:dangerClients.some(d=>d.id===selClient.id)?'#EF4444':tc,display:'inline-flex',alignItems:'center',justifyContent:'center',color:'#FFF',fontFamily:sf,fontSize:22,fontWeight:600}}>{selClient.first_name?.[0]}{selClient.last_name?.[0]}</div>
            <h2 style={{fontFamily:sf,fontSize:18,fontWeight:600,marginTop:8}}>{selClient.first_name} {selClient.last_name}</h2>
            <p style={{fontFamily:sf,fontSize:12,color:'#999'}}>{selClient.phone||''} {selClient.email?`· ${selClient.email}`:''}</p>
          </div>

          {dangerClients.some(d=>d.id===selClient.id)&&<div style={{background:'#FEF2F2',border:'1px solid #FEE2E2',padding:'12px',marginBottom:10,textAlign:'center'}}>
            <p style={{fontFamily:sf,fontSize:11,fontWeight:600,color:'#EF4444'}}>🔴 Cliente en danger de perte</p>
            <p style={{fontFamily:sf,fontSize:10,color:'#B91C1C',marginTop:2}}>{selClient.total_visits||0} visites · Dernière activité il y a longtemps</p>
            <button style={{marginTop:8,padding:'6px 14px',background:'#EF4444',color:'#FFF',border:'none',fontFamily:sf,fontSize:10,fontWeight:600,letterSpacing:1,textTransform:'uppercase',cursor:'pointer'}}>Envoyer un SMS de relance</button>
          </div>}

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:12}}>
            {[{l:'Valeur vie',v:`${Math.round((selClient.total_spent||0)*3.5)}€`,bg:tc,fg:'#FFF'},{l:'Dépensé',v:`${selClient.total_spent||0}€`},{l:'Visites',v:selClient.total_visits||0},{l:'Fidélité',v:`${selClient.loyalty_visits||0}/${loyaltyConfig?.visits_required||10}`}].map((s,i)=>(
              <div key={i} style={{background:s.bg||'#FFF',color:s.fg||'#1A1A1A',border:s.bg?'none':'1px solid #E8E8E4',padding:'12px',textAlign:'center'}}>
                <p style={{fontFamily:sf,fontSize:8,textTransform:'uppercase',letterSpacing:1.5,opacity:0.5,marginBottom:3}}>{s.l}</p>
                <p style={{fontSize:18,fontWeight:300}}>{s.v}</p>
              </div>
            ))}
          </div>

          {selClient.allergies&&<div style={{background:'#FEF2F2',border:'1px solid #FEE2E2',padding:'12px',marginBottom:10}}>
            <p style={{fontFamily:sf,fontSize:11,fontWeight:600,color:'#EF4444'}}>⚠️ Allergie : {selClient.allergies}</p>
          </div>}

          {selClient.notes&&<div style={card}><p style={sty}>Notes privées</p><p style={{fontFamily:sf,fontSize:12,color:'#555',lineHeight:1.6}}>{selClient.notes}</p></div>}
          {selClient.birthday&&<div style={card}><p style={{fontFamily:sf,fontSize:12}}>🎂 Anniversaire : {new Date(selClient.birthday).toLocaleDateString('fr-FR')}</p></div>}

          <div style={card}>
            <p style={sty}>⭐ Prestations favorites</p>
            {(()=>{const favs=getClientFavorites(selClient);const maxF=Math.max(...favs.map(f=>f[1]),1);return favs.length>0?favs.map(([s,c],i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:i<favs.length-1?'1px solid #F0F0EC':'none'}}>
                <span style={{fontFamily:sf,fontSize:12,fontWeight:500}}>{s}</span>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{background:'#F0F0EC',height:6,width:70,borderRadius:3}}><div style={{background:tc,height:6,borderRadius:3,width:`${(c/maxF)*100}%`}}/></div>
                  <span style={{fontFamily:sf,fontSize:10,color:'#999'}}>{c}×</span>
                </div>
              </div>
            )):<p style={{fontFamily:sf,fontSize:11,color:'#999'}}>Aucune prestation enregistrée</p>;})()}
          </div>

          <div style={card}>
            <p style={sty}>📋 Historique des RDV</p>
            {(()=>{const hist=getClientHistory(selClient);return hist.length>0?hist.slice(0,10).map(a=>(
              <div key={a.id} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:'1px solid #F0F0EC'}}>
                <div style={{width:45,flexShrink:0}}><p style={{fontFamily:sf,fontSize:11,fontWeight:600}}>{a.date?.slice(5)}</p><p style={{fontFamily:sf,fontSize:8,color:'#BBB'}}>{a.time}</p></div>
                <div style={{flex:1}}><p style={{fontFamily:sf,fontSize:12,fontWeight:500}}>{a.service_name}</p><p style={{fontFamily:sf,fontSize:9,color:'#999'}}>{a.team_member||''}</p></div>
                <span style={{fontFamily:sf,fontSize:12,fontWeight:600}}>{a.price}€</span>
                <span style={{fontFamily:sf,fontSize:8,padding:'2px 6px',background:a.status==='confirmed'?tc:'#F5F5F3',color:a.status==='confirmed'?'#FFF':'#999'}}>✓</span>
              </div>
            )):<p style={{fontFamily:sf,fontSize:11,color:'#999'}}>Aucun RDV enregistré</p>;})()}
          </div>

          <div style={card}>
            <p style={sty}>Photos avant / après</p>
            <div style={{display:'flex',gap:8}}>
              <div style={{flex:1,height:80,background:'#F0F0EC',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:6}}><span style={{fontFamily:sf,fontSize:10,color:'#999'}}>📷 Avant</span></div>
              <div style={{flex:1,height:80,background:'#F0F0EC',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:6}}><span style={{fontFamily:sf,fontSize:10,color:'#999'}}>📷 Après</span></div>
            </div>
          </div>
        </div>)}


        {/* ═══ ÉQUIPE ═══ */}
        {tab === 'equipe' && !selMember && (<div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <h1 style={{fontFamily:ss,fontSize:isMobile?20:26,fontWeight:300}}>Équipe</h1>
            <button onClick={()=>setShowForm(showForm==='member'?null:'member')} style={btn()}>{showForm==='member'?'✕ Fermer':'+ Ajouter'}</button>
          </div>

          {showForm==='member'&&<form onSubmit={addMember} style={{...card,background:'#FAFAF8'}}>
            <p style={sty}>Nouveau membre</p>
            <input required placeholder="Nom complet" value={newMember.name} onChange={e=>setNewMember({...newMember,name:e.target.value})} style={inp}/>
            <input placeholder="Rôle (ex: Coiffeuse senior)" value={newMember.role} onChange={e=>setNewMember({...newMember,role:e.target.value})} style={inp}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
              <input type="number" placeholder="Commission %" value={newMember.commission_percent||''} onChange={e=>setNewMember({...newMember,commission_percent:Number(e.target.value)})} style={inp}/>
              <input type="number" placeholder="Objectif €/mois" value={newMember.target_monthly||''} onChange={e=>setNewMember({...newMember,target_monthly:Number(e.target.value)})} style={inp}/>
              <input type="color" value={newMember.color} onChange={e=>setNewMember({...newMember,color:e.target.value})} style={{...inp,padding:4,height:42}}/>
            </div>
            <button type="submit" style={btn()}>Enregistrer</button>
          </form>}

          {team.length===0?<div style={card}><p style={{fontFamily:sf,color:'#999',textAlign:'center',padding:'20px 0'}}>Aucun membre. Ajoute ton équipe !</p></div>:
          team.map(m=>{
            const progress = m.target_monthly>0?Math.min((m.current_month_ca||0)/m.target_monthly*100,100):0;
            return(<div key={m.id} onClick={()=>setSelMember(m)} style={{...card,marginBottom:-1,cursor:'pointer'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <div style={{width:38,height:38,borderRadius:'50%',background:m.color||tc,display:'flex',alignItems:'center',justifyContent:'center',color:'#FFF',fontFamily:sf,fontSize:15,fontWeight:600,flexShrink:0}}>{m.name?.[0]||'?'}</div>
                <div style={{flex:1}}><p style={{fontFamily:sf,fontSize:13,fontWeight:500}}>{m.name}</p><p style={{fontFamily:sf,fontSize:10,color:'#999'}}>{m.role||'—'} · {m.commission_percent||0}% commission</p></div>
                <span style={{color:'#CCC',fontSize:14}}>›</span>
              </div>
              {m.target_monthly>0&&<div style={{display:'flex',alignItems:'center',gap:6}}>
                <p style={{fontFamily:sf,fontSize:9,color:'#999',width:55,flexShrink:0}}>Objectif</p>
                <div style={{flex:1,background:'#F0F0EC',height:8,borderRadius:4}}><div style={{background:progress>=100?'#4ADE80':m.color||tc,height:8,borderRadius:4,width:`${progress}%`}}/></div>
                <span style={{fontFamily:sf,fontSize:10,fontWeight:600,flexShrink:0}}>{m.current_month_ca||0}€/{m.target_monthly}€</span>
              </div>}
              {progress>=100&&<p style={{fontFamily:sf,fontSize:10,color:'#4ADE80',marginTop:4,fontWeight:500}}>✓ Objectif atteint !</p>}
            </div>);})}
        </div>)}

        {/* ═══ ESPACE PRIVÉ MEMBRE ═══ */}
        {tab === 'equipe' && selMember && (<div>
          <button onClick={()=>setSelMember(null)} style={{fontFamily:sf,fontSize:11,color:'#999',background:'none',border:'none',cursor:'pointer',marginBottom:10}}>← Retour à l'équipe</button>
          <div style={{textAlign:'center',marginBottom:14}}>
            <div style={{width:56,height:56,borderRadius:'50%',background:selMember.color||tc,display:'inline-flex',alignItems:'center',justifyContent:'center',color:'#FFF',fontFamily:sf,fontSize:22,fontWeight:600}}>{selMember.name?.[0]}</div>
            <h2 style={{fontFamily:sf,fontSize:18,fontWeight:600,marginTop:8}}>{selMember.name}</h2>
            <p style={{fontFamily:sf,fontSize:12,color:'#999'}}>{selMember.role}</p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:12}}>
            <div style={{background:selMember.color||tc,color:'#FFF',padding:'14px',textAlign:'center'}}><p style={{fontFamily:sf,fontSize:8,textTransform:'uppercase',letterSpacing:1.5,opacity:0.6}}>CA ce mois</p><p style={{fontSize:22,fontWeight:300}}>{selMember.current_month_ca||0}€</p></div>
            <div style={{background:'#FFF',border:'1px solid #E8E8E4',padding:'14px',textAlign:'center'}}><p style={{fontFamily:sf,fontSize:8,textTransform:'uppercase',letterSpacing:1.5,color:'#999'}}>Commission</p><p style={{fontSize:22,fontWeight:300}}>{Math.round((selMember.current_month_ca||0)*(selMember.commission_percent||0)/100)}€</p></div>
          </div>

          <div style={card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <p style={sty}>🧪 Formules & recettes</p>
              <button onClick={()=>setShowForm(showForm==='formula'?null:'formula')} style={{fontFamily:sf,fontSize:9,color:tc,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>+ Ajouter</button>
            </div>
            {showForm==='formula'&&<div style={{background:'#F8F8F6',padding:10,marginBottom:10}}>
              <input placeholder="Nom de la cliente" value={newFormula.client} onChange={e=>setNewFormula({...newFormula,client:e.target.value})} style={inp}/>
              <input placeholder="Formule (ex: 30vol + 9.1 cuivré, 25min)" value={newFormula.formula} onChange={e=>setNewFormula({...newFormula,formula:e.target.value})} style={inp}/>
              <button onClick={()=>addFormula(selMember.id)} style={btn()}>Enregistrer</button>
            </div>}
            {(()=>{const formulas=JSON.parse(selMember.formulas_json||'[]');return formulas.length>0?formulas.map((f,i)=>(
              <div key={i} style={{padding:'8px 0',borderBottom:i<formulas.length-1?'1px solid #F0F0EC':'none'}}>
                <div style={{display:'flex',justifyContent:'space-between'}}><p style={{fontFamily:sf,fontSize:12,fontWeight:500}}>{f.client}</p><span style={{fontFamily:sf,fontSize:9,color:'#BBB'}}>{f.date}</span></div>
                <p style={{fontFamily:sf,fontSize:11,color:'#666',marginTop:2}}>{f.formula}</p>
              </div>
            )):<p style={{fontFamily:sf,fontSize:11,color:'#999'}}>Aucune formule. Ajoute tes recettes couleur ici !</p>;})()}
          </div>

          <div style={card}>
            <p style={sty}>📝 Notes personnelles</p>
            <p style={{fontFamily:sf,fontSize:12,color:'#666',lineHeight:1.6}}>{selMember.notes||'Aucune note.'}</p>
          </div>

          <div style={card}>
            <p style={sty}>🎤 Note vocale rapide</p>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:selMember.color||tc,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><span style={{fontSize:18,color:'#FFF'}}>🎙️</span></div>
              <p style={{fontFamily:sf,fontSize:11,color:'#999'}}>Appuie pour dicter une formule ou une note.<br/>L'IA transcrit et classe automatiquement.</p>
            </div>
          </div>

          <button onClick={()=>deleteMember(selMember.id)} style={{fontFamily:sf,fontSize:10,color:'#EF4444',background:'none',border:'1px solid #FEE2E2',padding:'8px 16px',cursor:'pointer',width:'100%',marginTop:8}}>Supprimer ce membre</button>
        </div>)}

        {/* ═══ RDV ═══ */}
        {tab === 'rdv' && (<div>
          <h1 style={{fontFamily:ss,fontSize:isMobile?20:26,fontWeight:300,marginBottom:10}}>Rendez-vous</h1>

          <div style={{display:'flex',gap:6,marginBottom:12}}>
            <div style={{...card,flex:1,display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:0}}>
              <div><p style={{fontFamily:sf,fontSize:11,fontWeight:500}}>Créneaux auto</p><p style={{fontFamily:sf,fontSize:9,color:'#999'}}>Gap: {salon.slot_gap||30}min</p></div>
              <Tgl on={salon.auto_slots!==false} fn={()=>saveSalonSettings({auto_slots:salon.auto_slots===false})}/>
            </div>
            <div style={{...card,flex:1,display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:0}}>
              <div><p style={{fontFamily:sf,fontSize:11,fontWeight:500}}>Waitlist</p><p style={{fontFamily:sf,fontSize:9,color:'#999'}}>{waitlist.length} en att.</p></div>
              <Tgl on={salon.waitlist_enabled!==false} fn={()=>saveSalonSettings({waitlist_enabled:salon.waitlist_enabled===false})}/>
            </div>
          </div>

          {waitlist.length>0&&<div style={{background:'#F5F3FF',border:'1px solid #E9D5FF',padding:'12px',marginBottom:12}}>
            <p style={{fontFamily:sf,fontSize:11,fontWeight:600,color:'#7C3AED',marginBottom:6}}>📋 Liste d'attente</p>
            {waitlist.map(w=>(<div key={w.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'4px 0'}}>
              <span style={{fontFamily:sf,fontSize:11}}>{w.client_name} — {w.service_name}</span>
              <span style={{fontFamily:sf,fontSize:10,color:'#999'}}>{w.preferred_date} {w.preferred_time}</span>
            </div>))}
          </div>}

          {appointments.length===0?<div style={card}><p style={{fontFamily:sf,color:'#999',textAlign:'center',padding:'20px 0'}}>Aucun rendez-vous.</p></div>:
          appointments.slice(0,20).map(a=>(<div key={a.id} style={{...card,marginBottom:-1,display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:42,flexShrink:0}}><p style={{fontFamily:sf,fontSize:12,fontWeight:600}}>{a.time||'—'}</p><p style={{fontFamily:sf,fontSize:8,color:'#BBB'}}>{a.date?.slice(5)}</p></div>
            <div style={{flex:1,minWidth:0}}><p style={{fontFamily:sf,fontSize:12,fontWeight:500}}>{a.client_name}</p><p style={{fontFamily:sf,fontSize:9,color:'#999'}}>{a.service_name} {a.team_member?`· ${a.team_member}`:''}</p></div>
            {a.deposit_paid&&<span style={{fontFamily:sf,fontSize:8,background:'#F0FDF4',color:'#10B981',padding:'2px 6px'}}>💳</span>}
            <span style={{fontFamily:sf,fontSize:13,fontWeight:600,flexShrink:0}}>{a.price}€</span>
            <span style={{fontFamily:sf,fontSize:8,padding:'3px 7px',background:a.status==='confirmed'?tc:'transparent',color:a.status==='confirmed'?'#FFF':'#999',border:a.status==='confirmed'?'none':'1px solid #DDD',flexShrink:0}}>{a.status==='confirmed'?'✓':'...'}</span>
          </div>))}
        </div>)}


        {/* ═══ AVIS ═══ */}
        {tab === 'avis' && (<div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <h1 style={{fontFamily:ss,fontSize:isMobile?20:26,fontWeight:300}}>Avis clients</h1>
            <div style={{textAlign:'right'}}><p style={{fontFamily:sf,fontSize:26,fontWeight:300}}>{avgRating}<span style={{fontSize:14,color:'#999'}}>/5</span></p><p style={{fontSize:12,color:'#F59E0B'}}>{avgRating>=4.5?'★★★★★':avgRating>=3.5?'★★★★☆':'★★★☆☆'}</p></div>
          </div>
          {reviews.length===0?<div style={card}><p style={{fontFamily:sf,color:'#999',textAlign:'center',padding:'20px 0'}}>Aucun avis. Ils apparaîtront après les 1ers RDV.</p></div>:
          reviews.map(r=>(<div key={r.id} style={card}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <div><p style={{fontFamily:sf,fontSize:13,fontWeight:500}}>{r.client_name}</p><p style={{fontSize:11,color:'#F59E0B',marginTop:2}}>{stars(r.rating)}</p></div>
              <span style={{fontFamily:sf,fontSize:10,color:'#BBB'}}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
            <p style={{fontFamily:sf,fontSize:12,color:'#555',lineHeight:1.6,marginTop:4}}>{r.comment}</p>
            {r.service_name&&<p style={{fontFamily:sf,fontSize:10,color:'#999',marginTop:4}}>Prestation : {r.service_name}</p>}
            {r.reply?<div style={{background:'#F8F8F6',padding:'8px 10px',marginTop:8}}>
              <p style={{fontFamily:sf,fontSize:10,fontWeight:600,color:tc}}>Votre réponse :</p>
              <p style={{fontFamily:sf,fontSize:11,color:'#666',marginTop:2}}>{r.reply}</p>
            </div>:
            replyingTo===r.id?<div style={{marginTop:8}}>
              <input value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Votre réponse..." style={inp}/>
              <div style={{display:'flex',gap:6}}><button onClick={()=>replyReview(r.id)} style={btn()}>Envoyer</button><button onClick={()=>{setReplyingTo(null);setReplyText('');}} style={btn(true)}>Annuler</button></div>
            </div>:
            <div onClick={()=>setReplyingTo(r.id)} style={{marginTop:8,padding:'7px',border:`1px dashed ${tc}`,textAlign:'center',cursor:'pointer'}}><span style={{fontFamily:sf,fontSize:10,color:tc,fontWeight:500}}>Répondre</span></div>}
          </div>))}
        </div>)}

        {/* ═══ PRODUITS ═══ */}
        {tab === 'produits' && (<div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <h1 style={{fontFamily:ss,fontSize:isMobile?20:26,fontWeight:300}}>Produits</h1>
            <button onClick={()=>setShowForm(showForm==='product'?null:'product')} style={btn()}>{showForm==='product'?'✕ Fermer':'+ Ajouter'}</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:12}}>
            <div style={{background:tc,color:'#FFF',padding:'14px',textAlign:'center'}}><p style={{fontFamily:sf,fontSize:8,textTransform:'uppercase',letterSpacing:1.5,opacity:0.5}}>Réf.</p><p style={{fontSize:22,fontWeight:300}}>{products.length}</p></div>
            <div style={{background:'#FFF',border:'1px solid #E8E8E4',padding:'14px',textAlign:'center'}}><p style={{fontFamily:sf,fontSize:8,textTransform:'uppercase',letterSpacing:1.5,color:'#999'}}>Stock</p><p style={{fontSize:22,fontWeight:300}}>{products.reduce((s,p)=>s+(p.stock||0),0)}</p></div>
            <div style={{background:'#FFF',border:'1px solid #E8E8E4',padding:'14px',textAlign:'center'}}><p style={{fontFamily:sf,fontSize:8,textTransform:'uppercase',letterSpacing:1.5,color:'#999'}}>Valeur</p><p style={{fontSize:22,fontWeight:300}}>{products.reduce((s,p)=>s+(p.price||0)*(p.stock||0),0)}€</p></div>
          </div>
          {showForm==='product'&&<form onSubmit={addProduct} style={{...card,background:'#FAFAF8'}}>
            <p style={sty}>Nouveau produit</p>
            <input required placeholder="Nom du produit" value={newProduct.name} onChange={e=>setNewProduct({...newProduct,name:e.target.value})} style={inp}/>
            <input placeholder="Marque" value={newProduct.brand} onChange={e=>setNewProduct({...newProduct,brand:e.target.value})} style={inp}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
              <input type="number" placeholder="Prix €" value={newProduct.price||''} onChange={e=>setNewProduct({...newProduct,price:Number(e.target.value)})} style={inp}/>
              <input type="number" placeholder="Stock" value={newProduct.stock||''} onChange={e=>setNewProduct({...newProduct,stock:Number(e.target.value)})} style={inp}/>
              <input placeholder="Catégorie" value={newProduct.category} onChange={e=>setNewProduct({...newProduct,category:e.target.value})} style={inp}/>
            </div>
            <button type="submit" style={btn()}>Enregistrer</button>
          </form>}
          {products.length===0?<div style={card}><p style={{fontFamily:sf,color:'#999',textAlign:'center',padding:'20px 0'}}>Aucun produit.</p></div>:
          products.map(p=>(<div key={p.id} style={{...card,marginBottom:-1,display:'flex',alignItems:'center',gap:10}}>
            <div style={{flex:1}}><p style={{fontFamily:sf,fontSize:12,fontWeight:500}}>{p.name}</p><p style={{fontFamily:sf,fontSize:10,color:'#999'}}>{p.brand||''} {p.category?`· ${p.category}`:''}</p></div>
            <div style={{textAlign:'right',flexShrink:0}}><p style={{fontFamily:sf,fontSize:14,fontWeight:600}}>{p.price}€</p><p style={{fontFamily:sf,fontSize:10,color:p.stock<6?'#EF4444':'#999'}}>{p.stock<6?'⚠️ ':''}{p.stock||0} stock</p></div>
            <button onClick={()=>deleteProduct(p.id)} style={{fontFamily:sf,fontSize:8,padding:'3px 8px',background:'#FEF2F2',border:'none',cursor:'pointer',color:'#EF4444',flexShrink:0}}>✕</button>
          </div>))}
        </div>)}

        {/* ═══ FORFAITS ═══ */}
        {tab === 'forfaits' && (<div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <h1 style={{fontFamily:ss,fontSize:isMobile?20:26,fontWeight:300}}>Forfaits</h1>
            <button onClick={()=>setShowForm(showForm==='package'?null:'package')} style={btn()}>{showForm==='package'?'✕ Fermer':'+ Créer'}</button>
          </div>
          {showForm==='package'&&<form onSubmit={addPackage} style={{...card,background:'#FAFAF8'}}>
            <p style={sty}>Nouveau forfait</p>
            <input required placeholder="Nom (ex: Pack Couleur + Soin)" value={newPackage.name} onChange={e=>setNewPackage({...newPackage,name:e.target.value})} style={inp}/>
            <input placeholder="Description" value={newPackage.description} onChange={e=>setNewPackage({...newPackage,description:e.target.value})} style={inp}/>
            <input required placeholder="Prestations (séparées par virgule)" value={newPackage.services} onChange={e=>setNewPackage({...newPackage,services:e.target.value})} style={inp}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <input type="number" placeholder="Prix original €" value={newPackage.original_price||''} onChange={e=>setNewPackage({...newPackage,original_price:Number(e.target.value)})} style={inp}/>
              <input type="number" placeholder="Prix forfait €" value={newPackage.total_price||''} onChange={e=>setNewPackage({...newPackage,total_price:Number(e.target.value)})} style={inp}/>
            </div>
            <button type="submit" style={btn()}>Enregistrer</button>
          </form>}
          {packages.length===0?<div style={card}><p style={{fontFamily:sf,color:'#999',textAlign:'center',padding:'20px 0'}}>Aucun forfait. Crée des packs pour booster ton panier moyen !</p></div>:
          packages.map(p=>(<div key={p.id} style={{...card,position:'relative'}}>
            {p.original_price>0&&<div style={{position:'absolute',top:0,right:0,background:'#4ADE80',padding:'3px 8px'}}><span style={{fontFamily:sf,fontSize:9,fontWeight:700}}>-{Math.round((1-p.total_price/p.original_price)*100)}%</span></div>}
            <p style={{fontFamily:sf,fontSize:15,fontWeight:600,marginBottom:6}}>{p.name}</p>
            {p.description&&<p style={{fontFamily:sf,fontSize:11,color:'#777',marginBottom:6}}>{p.description}</p>}
            {(p.services||[]).map((s,i)=>(<span key={i} style={{fontFamily:sf,fontSize:9,background:'#F5F5F3',padding:'3px 8px',marginRight:4,display:'inline-block',marginBottom:4}}>{s}</span>))}
            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:6}}>
              {p.original_price>0&&<span style={{fontFamily:sf,fontSize:12,color:'#999',textDecoration:'line-through'}}>{p.original_price}€</span>}
              <span style={{fontFamily:sf,fontSize:20,fontWeight:600}}>{p.total_price}€</span>
              {p.original_price>0&&<span style={{fontFamily:sf,fontSize:10,color:'#4ADE80',fontWeight:500}}>Économise {p.original_price-p.total_price}€</span>}
            </div>
            <button onClick={()=>deletePackage(p.id)} style={{fontFamily:sf,fontSize:9,color:'#EF4444',background:'none',border:'none',cursor:'pointer',marginTop:6}}>Supprimer</button>
          </div>))}
        </div>)}


        {/* ═══ PARRAINAGE ═══ */}
        {tab === 'parrainage' && (<div>
          <h1 style={{fontFamily:ss,fontSize:isMobile?20:26,fontWeight:300,marginBottom:10}}>Parrainage</h1>
          <div style={{background:tc,color:'#FFF',padding:'16px',marginBottom:12}}>
            <p style={{fontFamily:sf,fontSize:10,letterSpacing:2,textTransform:'uppercase',opacity:0.5}}>Programme de parrainage</p>
            <div style={{display:'flex',gap:14,marginTop:8}}>
              <div><p style={{fontSize:28,fontWeight:300}}>{clients.filter(c=>c.referred_by).length}</p><p style={{fontFamily:sf,fontSize:10,opacity:0.6}}>Filleules</p></div>
              <div><p style={{fontSize:28,fontWeight:300}}>{clients.filter(c=>c.referred_by).reduce((s,c)=>s+(c.total_spent||0),0)}€</p><p style={{fontFamily:sf,fontSize:10,opacity:0.6}}>CA généré</p></div>
            </div>
          </div>
          <div style={card}>
            <p style={sty}>Règles actives</p>
            <p style={{fontFamily:sf,fontSize:12,color:'#555'}}><strong>Marraine :</strong> 10€ de crédit par filleule</p>
            <p style={{fontFamily:sf,fontSize:12,color:'#555',marginTop:3}}><strong>Filleule :</strong> -20% sur le 1er RDV</p>
          </div>
          <p style={sty}>🏆 Top ambassadrices</p>
          {clients.filter(c=>c.referral_count>0).sort((a,b)=>(b.referral_count||0)-(a.referral_count||0)).length>0?
            clients.filter(c=>c.referral_count>0).sort((a,b)=>(b.referral_count||0)-(a.referral_count||0)).map((c,i)=>(
              <div key={c.id} style={{...card,marginBottom:-1,display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontFamily:sf,fontSize:16,fontWeight:700,color:i===0?'#F59E0B':i===1?'#999':'#CCC',width:24}}>{i+1}.</span>
                <div style={{width:30,height:30,borderRadius:'50%',background:tc,display:'flex',alignItems:'center',justifyContent:'center',color:'#FFF',fontFamily:sf,fontSize:10,fontWeight:600}}>{c.first_name?.[0]}{c.last_name?.[0]}</div>
                <div style={{flex:1}}><p style={{fontFamily:sf,fontSize:12,fontWeight:500}}>{c.first_name} {c.last_name}</p><p style={{fontFamily:sf,fontSize:10,color:'#999'}}>{c.referral_count} filleules</p></div>
                {i===0&&<span style={{fontSize:16}}>👑</span>}
              </div>
            )):<div style={card}><p style={{fontFamily:sf,color:'#999',textAlign:'center'}}>Aucun parrainage encore. Partage le code de tes clientes !</p></div>}
        </div>)}

        {/* ═══ COMMUNICATION ═══ */}
        {tab === 'com' && (<div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <h1 style={{fontFamily:ss,fontSize:isMobile?20:26,fontWeight:300}}>Communication</h1>
            <button onClick={()=>setShowForm(showForm==='message'?null:'message')} style={btn()}>{showForm==='message'?'✕ Fermer':'+ Message'}</button>
          </div>
          {showForm==='message'&&<form onSubmit={sendMessage} style={{...card,background:'#FAFAF8'}}>
            <p style={sty}>Nouveau message</p>
            <input required placeholder="Titre (ex: 🌸 Promo printemps)" value={newMessage.title} onChange={e=>setNewMessage({...newMessage,title:e.target.value})} style={inp}/>
            <textarea required placeholder="Contenu du message..." value={newMessage.content} onChange={e=>setNewMessage({...newMessage,content:e.target.value})} style={{...inp,minHeight:80,resize:'vertical'}}/>
            <button type="submit" style={btn()}>Envoyer à tous les clients</button>
          </form>}
          {messages.length===0?<div style={card}><p style={{fontFamily:sf,color:'#999',textAlign:'center',padding:'20px 0'}}>Aucun message envoyé.</p></div>:
          messages.map(m=>(<div key={m.id} style={card}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <p style={{fontFamily:sf,fontSize:13,fontWeight:500}}>{m.title}</p>
              <span style={{fontFamily:sf,fontSize:9,color:'#BBB'}}>{new Date(m.sent_at).toLocaleDateString('fr-FR')}</span>
            </div>
            <p style={{fontFamily:sf,fontSize:11,color:'#666',lineHeight:1.6}}>{m.content}</p>
            <p style={{fontFamily:sf,fontSize:9,color:'#BBB',marginTop:6,letterSpacing:1,textTransform:'uppercase'}}>Envoyé à {clients.length} client(e)s</p>
          </div>))}
        </div>)}

        {/* ═══ ASSISTANT IA ═══ */}
        {tab === 'ia' && (<div>
          <h1 style={{fontFamily:ss,fontSize:isMobile?20:26,fontWeight:300,marginBottom:4}}>Assistant IA</h1>
          <p style={{fontFamily:sf,fontSize:11,color:'#999',marginBottom:12}}>Pose une question sur ton salon. L'IA analyse tes données en temps réel.</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:14}}>
            {['Comment va mon mois ?','Qui recontacter ?','Quel créneau est faible ?','Quelle promo lancer ?'].map(q=>(<button key={q} onClick={()=>handleAi(q)} style={{padding:'7px 12px',background:'#FFF',border:'1px solid #E8E8E4',fontFamily:sf,fontSize:10,cursor:'pointer',color:'#555'}}>{q}</button>))}
          </div>
          <div style={{background:'#FFF',border:'1px solid #E8E8E4',minHeight:280,maxHeight:400,overflowY:'auto',marginBottom:10,padding:12,scrollbarWidth:'none'}}>
            {aiChat.length===0&&<div style={{textAlign:'center',padding:'50px 14px'}}><p style={{fontSize:32}}>🧠</p><p style={{fontFamily:sf,fontSize:13,color:'#BBB',marginTop:10}}>Demande-moi n'importe quoi sur ton business !</p></div>}
            {aiChat.map((m,i)=>(<div key={i} style={{marginBottom:12,textAlign:m.role==='user'?'right':'left'}}>
              <div style={{display:'inline-block',maxWidth:'85%',padding:'10px 14px',background:m.role==='user'?tc:'#F5F5F3',color:m.role==='user'?'#FFF':'#333',fontFamily:sf,fontSize:12,lineHeight:1.7,borderRadius:m.role==='user'?'14px 14px 3px 14px':'14px 14px 14px 3px',whiteSpace:'pre-wrap'}}>{m.text}</div>
            </div>))}
            {aiTyping&&<div style={{marginBottom:12}}><div style={{display:'inline-block',padding:'10px 18px',background:'#F5F5F3',borderRadius:14}}><span style={{fontFamily:sf,fontSize:12,color:'#999'}}>🧠 Analyse en cours...</span></div></div>}
          </div>
          <div style={{display:'flex',gap:8}}>
            <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')handleAi(aiInput);}} placeholder="Pose ta question..." style={{...inp,flex:1,marginBottom:0}}/>
            <button onClick={()=>handleAi(aiInput)} style={{...btn(),display:'flex',alignItems:'center',padding:'10px 16px'}}>→</button>
          </div>
        </div>)}

        {/* ═══ MON SALON ═══ */}
        {tab === 'salon' && (<div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <h1 style={{fontFamily:ss,fontSize:isMobile?20:26,fontWeight:300}}>Mon salon</h1>
            <button onClick={()=>setShowForm(showForm==='photo'?null:'photo')} style={btn()}>{showForm==='photo'?'✕ Fermer':'+ Photo'}</button>
          </div>

          <div style={{...card,display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:50,height:50,borderRadius:12,background:tc,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><span style={{color:'#FFF',fontFamily:ss,fontSize:20,fontWeight:600}}>{salon.name?.[0]||'P'}</span></div>
            <div><p style={{fontFamily:sf,fontSize:15,fontWeight:500}}>{salon.name}</p><p style={{fontFamily:sf,fontSize:11,color:'#999'}}>{salon.category||'Beauté'} {salon.city?`· ${salon.city}`:''}</p></div>
          </div>

          <div style={card}>
            <p style={sty}>Description</p>
            <p style={{fontFamily:sf,fontSize:12,color:'#666',lineHeight:1.7}}>{salon.description||'Aucune description.'}</p>
          </div>

          {showForm==='photo'&&<form onSubmit={addPhoto} style={{...card,background:'#FAFAF8'}}>
            <p style={sty}>Ajouter une photo</p>
            <input required placeholder="URL de l'image" value={newPhoto.url} onChange={e=>setNewPhoto({...newPhoto,url:e.target.value})} style={inp}/>
            <input placeholder="Légende" value={newPhoto.caption} onChange={e=>setNewPhoto({...newPhoto,caption:e.target.value})} style={inp}/>
            <select value={newPhoto.photo_type} onChange={e=>setNewPhoto({...newPhoto,photo_type:e.target.value})} style={inp}>
              <option value="feed">Fil d'actu</option><option value="work">Réalisations</option><option value="institute">Institut</option>
            </select>
            <button type="submit" style={btn()}>Ajouter</button>
          </form>}

          {photos.length>0&&<>
            <p style={{...sty,marginTop:6}}>Photos ({photos.length})</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4}}>
              {photos.map(p=>(<div key={p.id} style={{position:'relative'}}>
                {p.url?<img src={p.url} alt={p.caption} style={{width:'100%',height:90,objectFit:'cover'}}/>:<div style={{width:'100%',height:90,background:'#F0F0EC',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:16,opacity:0.3}}>📷</span></div>}
                <p style={{fontFamily:sf,fontSize:8,padding:'3px 4px',color:'#777',background:'#FFF',border:'1px solid #E8E8E4',borderTop:'none'}}>{p.caption||'Photo'}</p>
                <button onClick={()=>deletePhoto(p.id)} style={{position:'absolute',top:2,right:2,width:18,height:18,background:'rgba(0,0,0,0.5)',color:'#FFF',border:'none',fontSize:10,cursor:'pointer',borderRadius:'50%'}}>✕</button>
              </div>))}
            </div>
          </>}
        </div>)}


        {/* ═══ RÉGLAGES ═══ */}
        {tab === 'reglages' && (<div>
          <h1 style={{fontFamily:ss,fontSize:isMobile?20:26,fontWeight:300,marginBottom:14}}>Réglages</h1>

          <div style={{background:tc,color:'#FFF',padding:'16px',marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div>
                <p style={{fontFamily:sf,fontSize:10,letterSpacing:2,textTransform:'uppercase',opacity:0.5}}>Abonnement</p>
                <p style={{fontFamily:sf,fontSize:14,fontWeight:500,marginTop:3}}>MY PRESTY — 19€/mois</p>
                <p style={{fontFamily:sf,fontSize:11,opacity:0.6,marginTop:3}}>
                  {subscription.status==='active'?'Abonnement actif':subscription.status==='trial'?'Essai gratuit (90 jours)':'Non abonné'}
                </p>
              </div>
              <span style={{fontFamily:sf,fontSize:9,padding:'4px 10px',border:'1px solid rgba(74,222,128,0.5)',color:'#4ADE80',letterSpacing:1,textTransform:'uppercase'}}>
                {subscription.status==='active'?'✓ Actif':subscription.status==='trial'?'✓ Essai':'—'}
              </span>
            </div>
            {subscription.status!=='active'&&<button onClick={async()=>{const res=await fetch('/api/stripe/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:user.email,salonId:salon.id})});const data=await res.json();if(data.url)window.location.href=data.url;}} style={{marginTop:10,padding:'8px 18px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',color:'#FFF',fontFamily:sf,fontSize:10,letterSpacing:1.5,textTransform:'uppercase',cursor:'pointer'}}>S'abonner</button>}
          </div>

          <div style={card}>
            <p style={sty}>Paiement en ligne</p>
            {salon.stripe_account_id?
              <p style={{fontFamily:sf,fontSize:12,color:'#4ADE80',fontWeight:500}}>✓ Stripe connecté</p>:
              <button onClick={handleStripeConnect} style={{padding:'10px 20px',background:'#635BFF',color:'#FFF',border:'none',fontFamily:sf,fontSize:10,fontWeight:600,letterSpacing:1.5,textTransform:'uppercase',cursor:'pointer'}}>Connecter Stripe 💳</button>}
          </div>

          <div style={card}>
            <p style={sty}>Couleur du profil</p>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {['#1A1A1A','#635BFF','#EC4899','#F59E0B','#10B981','#6366F1','#EF4444','#8B5CF6','#06B6D4','#D4A574'].map(c=>(
                <button key={c} onClick={()=>saveSalonSettings({theme_color:c})} style={{width:28,height:28,background:c,border:tc===c?'2px solid #FFF':'none',boxShadow:tc===c?`0 0 0 2px ${c}`:'none',cursor:'pointer',borderRadius:4}}/>
              ))}
            </div>
          </div>

          <div style={card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><p style={{fontFamily:sf,fontSize:13,fontWeight:500}}>🛡️ Protection no-show</p><p style={{fontFamily:sf,fontSize:10,color:'#999'}}>Acompte de {salon.deposit_percent||30}% obligatoire</p></div>
              <Tgl on={salon.deposit_required||false} fn={()=>saveSalonSettings({deposit_required:!salon.deposit_required})}/>
            </div>
          </div>

          <div style={card}>
            <p style={sty}>Politique d'annulation</p>
            <p style={{fontFamily:sf,fontSize:12,color:'#555'}}>Annulation possible jusqu'à <strong>{salon.cancellation_hours||24}h avant</strong></p>
            <p style={{fontFamily:sf,fontSize:11,color:'#999',marginTop:3}}>Frais d'annulation tardive : {salon.cancellation_fee||50}% du prix</p>
          </div>

          <div style={card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><p style={{fontFamily:sf,fontSize:13,fontWeight:500}}>📱 Rappels SMS</p><p style={{fontFamily:sf,fontSize:10,color:'#999'}}>En plus des emails</p></div>
              <Tgl on={salon.sms_reminders||false} fn={()=>saveSalonSettings({sms_reminders:!salon.sms_reminders})}/>
            </div>
          </div>

          <div style={card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><p style={{fontFamily:sf,fontSize:13,fontWeight:500}}>💰 Tarification dynamique</p><p style={{fontFamily:sf,fontSize:10,color:'#999'}}>Ajuste les prix selon les créneaux</p></div>
              <Tgl on={dynPricing} fn={()=>{setDynPricing(!dynPricing);saveSalonSettings({dyn_pricing_enabled:!dynPricing});}}/>
            </div>
          </div>

          <div style={card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><p style={{fontFamily:sf,fontSize:13,fontWeight:500}}>🎰 Roue de la chance</p><p style={{fontFamily:sf,fontSize:10,color:'#999'}}>Après chaque paiement client</p></div>
              <Tgl on={salon.wheel_enabled||false} fn={()=>saveSalonSettings({wheel_enabled:!salon.wheel_enabled})}/>
            </div>
          </div>

          <div style={card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><p style={{fontFamily:sf,fontSize:13,fontWeight:500}}>🧲 Carte cadeau digitale</p><p style={{fontFamily:sf,fontSize:10,color:'#999'}}>Visible sur ta page publique</p></div>
              <Tgl on={salon.gift_card_enabled||false} fn={()=>saveSalonSettings({gift_card_enabled:!salon.gift_card_enabled})}/>
            </div>
          </div>

          <div style={card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><p style={{fontFamily:sf,fontSize:13,fontWeight:500}}>📋 Liste d'attente</p><p style={{fontFamily:sf,fontSize:10,color:'#999'}}>Quand les créneaux sont pleins</p></div>
              <Tgl on={salon.waitlist_enabled||false} fn={()=>saveSalonSettings({waitlist_enabled:!salon.waitlist_enabled})}/>
            </div>
          </div>

          <div style={card}>
            <p style={sty}>Horaires d'ouverture</p>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <div style={{padding:'8px 12px',border:'1px solid #E8E8E4',fontFamily:sf,fontSize:12}}>{salon.opening_time||'9h00'}</div>
              <span style={{color:'#CCC'}}>→</span>
              <div style={{padding:'8px 12px',border:'1px solid #E8E8E4',fontFamily:sf,fontSize:12}}>{salon.closing_time||'19h00'}</div>
            </div>
          </div>

          <div style={card}>
            <p style={sty}>Lien de réservation</p>
            <p style={{fontFamily:sf,fontSize:13,fontWeight:500}}>mypresty.com/{salon.slug}</p>
          </div>

          <div style={card}>
            <p style={sty}>Compte</p>
            <p style={{fontFamily:sf,fontSize:12,color:'#777'}}>{user?.email}</p>
          </div>

          <button onClick={async()=>{await supabase.auth.signOut();router.push('/connexion');}} style={{width:'100%',padding:'12px',background:'none',border:'1px solid #EF4444',color:'#EF4444',fontFamily:sf,fontSize:11,fontWeight:600,letterSpacing:1.5,textTransform:'uppercase',cursor:'pointer',marginTop:8}}>Se déconnecter</button>
        </div>)}

      </main>
    </div>
  );
}
