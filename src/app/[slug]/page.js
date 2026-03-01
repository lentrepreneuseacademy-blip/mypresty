'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
const sf = "'Outfit', sans-serif";
const ss = "'Cormorant Garamond', 'Georgia', serif";

export default function PublicPage({ params }) {
  const slug = params.slug;
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [team, setTeam] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState('booking');
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientInfo, setClientInfo] = useState({name:'',phone:'',email:''});
  const [submitting, setSubmitting] = useState(false);
  const [expandedCat, setExpandedCat] = useState({});
  const [gc, setGc] = useState({sender_name:'',sender_email:'',recipient_name:'',recipient_email:'',amount:50,message:''});
  const [gcDone, setGcDone] = useState(false);
  const [gcCode, setGcCode] = useState('');
  const [photoIdx, setPhotoIdx] = useState(null);

  useEffect(()=>{const r=()=>setIsMobile(window.innerWidth<768);r();window.addEventListener('resize',r);return()=>window.removeEventListener('resize',r);},[]);
  useEffect(()=>{loadSalon();},[slug]);

  async function loadSalon(){
    const {data:salons}=await supabase.from('salons').select('*').eq('slug',slug).limit(1);
    if(!salons||salons.length===0){setNotFound(true);setLoading(false);return;}
    const s=salons[0]; setSalon(s);
    const [svc,tm,ph,rv,pr,pk]=await Promise.all([
      supabase.from('services').select('*').eq('salon_id',s.id).order('category').order('name'),
      supabase.from('team_members').select('*').eq('salon_id',s.id),
      supabase.from('salon_photos').select('*').eq('salon_id',s.id).order('created_at',{ascending:false}),
      supabase.from('reviews').select('*').eq('salon_id',s.id).order('created_at',{ascending:false}),
      supabase.from('products').select('*').eq('salon_id',s.id).order('name'),
      supabase.from('packages').select('*').eq('salon_id',s.id).eq('active',true),
    ]);
    setServices(svc.data||[]);setTeam(tm.data||[]);setPhotos(ph.data||[]);
    setReviews(rv.data||[]);setProducts(pr.data||[]);setPackages(pk.data||[]);
    const cats={};(svc.data||[]).forEach(sv=>{const c=sv.category||'Prestations';if(!cats[c])cats[c]=true;});
    setExpandedCat(cats);setLoading(false);
  }

  async function handleBooking(e){
    e.preventDefault();setSubmitting(true);
    try{
      const names=clientInfo.name.trim().split(' ');
      await supabase.from('appointments').insert({salon_id:salon.id,client_name:clientInfo.name,client_phone:clientInfo.phone,client_email:clientInfo.email,service_name:selectedService.name,date:selectedDate,time:selectedTime,duration:selectedService.duration,price:selectedService.price,status:'confirmed'});
      setStep(4);
    }catch(err){alert('Erreur lors de la réservation');}
    setSubmitting(false);
  }

  async function submitGiftCard(e){
    e.preventDefault();
    const code='MP-'+Math.random().toString(36).substring(2,8).toUpperCase();
    const {error}=await supabase.from('gift_cards').insert({salon_id:salon.id,code,amount:gc.amount,remaining:gc.amount,sender_name:gc.sender_name,sender_email:gc.sender_email||null,recipient_name:gc.recipient_name,recipient_email:gc.recipient_email||null,message:gc.message||null});
    if(error){alert('Erreur : '+error.message);return;}
    setGcCode(code);setGcDone(true);
  }

  function formatDate(d){const days=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];const months=['jan','fév','mars','avr','mai','juin','juil','août','sept','oct','nov','déc'];const dt=new Date(d);return `${days[dt.getDay()]} ${dt.getDate()} ${months[dt.getMonth()]}`;}
  function getNextDays(n=14){const days=[];for(let i=1;i<=n;i++){const d=new Date();d.setDate(d.getDate()+i);days.push(d.toISOString().slice(0,10));}return days;}
  function getTimeSlots(){const slots=[];const start=parseInt(salon?.opening_time)||9;const end=parseInt(salon?.closing_time)||19;for(let h=start;h<end;h++){slots.push(`${String(h).padStart(2,'0')}:00`);slots.push(`${String(h).padStart(2,'0')}:30`);}return slots;}

  const avgRating=reviews.length>0?(reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1):null;
  const starsStr=n=>'★'.repeat(Math.round(n))+'☆'.repeat(5-Math.round(n));
  const categories={};services.forEach(s=>{const cat=s.category||'Prestations';if(!categories[cat])categories[cat]=[];categories[cat].push(s);});
  const sections=['booking','photos','avis','carte-cadeau','infos'];
  const sectionLabels={booking:'Prendre RDV',photos:'Photos',avis:'Avis','carte-cadeau':'Carte cadeau',infos:'À propos'};

  if(loading)return(<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#FAFAF8'}}><div style={{textAlign:'center'}}><div style={{width:32,height:32,border:'3px solid #E8E8E4',borderTopColor:'#1A1A1A',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 12px'}}/><p style={{fontFamily:sf,fontSize:14,color:'#999'}}>Chargement...</p></div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>);
  if(notFound)return(<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:24,background:'#FAFAF8'}}><div><p style={{fontSize:48,marginBottom:16}}>🔍</p><h1 style={{fontFamily:ss,fontSize:28,fontWeight:300,marginBottom:8}}>Salon introuvable</h1><p style={{fontFamily:sf,fontSize:15,color:'#999'}}>Ce lien ne correspond à aucun salon.</p></div></div>);

  const inp={width:'100%',padding:'12px 14px',border:'1px solid #E8E8E4',fontFamily:sf,fontSize:15,outline:'none',background:'#FFF',marginBottom:8,boxSizing:'border-box'};
  const tc=salon?.theme_color||'#1A1A1A';

  return(
    <div style={{fontFamily:sf,background:'#FAFAF8',minHeight:'100vh'}}>
      {/* HERO */}
      <div style={{background:tc,color:'#FFF',padding:isMobile?'24px 16px':'36px 40px'}}>
        <div style={{maxWidth:800,margin:'0 auto'}}>
          <h1 style={{fontFamily:ss,fontSize:isMobile?28:38,fontWeight:400,marginBottom:8}}>{salon.name}</h1>
          <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:12}}>
            {salon.city&&<span style={{fontSize:14,opacity:0.7}}>📍 {salon.address||salon.city}</span>}
            {avgRating&&<span style={{fontSize:14,background:'rgba(255,255,255,0.15)',padding:'3px 10px',borderRadius:12}}>⭐ {avgRating} ({reviews.length} avis)</span>}
            {salon.phone&&<a href={`tel:${salon.phone}`} style={{fontSize:14,color:'rgba(255,255,255,0.7)',textDecoration:'none'}}>📞 {salon.phone}</a>}
          </div>
        </div>
      </div>

      {/* PHOTOS STRIP */}
      {photos.length>0&&<div style={{maxWidth:800,margin:'0 auto',padding:'12px 0'}}><div style={{display:'flex',gap:4,overflowX:'auto',scrollbarWidth:'none',padding:'0 16px'}}>
        {photos.slice(0,8).map((p,i)=>(<div key={p.id} onClick={()=>setPhotoIdx(i)} style={{flexShrink:0,width:isMobile?180:220,height:isMobile?130:160,background:`url(${p.url}) center/cover`,borderRadius:4,cursor:'pointer',position:'relative'}}>
          {i===0&&photos.length>1&&<div style={{position:'absolute',bottom:6,right:6,background:'rgba(0,0,0,0.6)',color:'#FFF',padding:'3px 8px',borderRadius:4,fontSize:12}}>📷 {photos.length}</div>}
        </div>))}
      </div></div>}

      {/* PHOTO MODAL */}
      {photoIdx!==null&&<div onClick={()=>setPhotoIdx(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
        <img src={photos[photoIdx]?.url} style={{maxWidth:'90%',maxHeight:'85vh',objectFit:'contain'}}/>
        <div style={{position:'absolute',bottom:20,display:'flex',gap:12}}>
          <button onClick={e=>{e.stopPropagation();setPhotoIdx(Math.max(0,photoIdx-1));}} style={{background:'rgba(255,255,255,0.2)',color:'#FFF',border:'none',padding:'8px 16px',cursor:'pointer',fontSize:14}}>←</button>
          <span style={{color:'#FFF',fontSize:14,padding:'8px 0'}}>{photoIdx+1}/{photos.length}</span>
          <button onClick={e=>{e.stopPropagation();setPhotoIdx(Math.min(photos.length-1,photoIdx+1));}} style={{background:'rgba(255,255,255,0.2)',color:'#FFF',border:'none',padding:'8px 16px',cursor:'pointer',fontSize:14}}>→</button>
        </div>
        <button onClick={()=>setPhotoIdx(null)} style={{position:'absolute',top:20,right:20,background:'none',border:'none',color:'#FFF',fontSize:28,cursor:'pointer'}}>✕</button>
      </div>}

      {/* STICKY NAV */}
      <nav style={{position:'sticky',top:0,zIndex:40,background:'#FFF',borderBottom:'1px solid #E8E8E4'}}>
        <div style={{maxWidth:800,margin:'0 auto',display:'flex',overflowX:'auto',scrollbarWidth:'none'}}>
          {sections.filter(s=>s!=='carte-cadeau'||salon.gift_card_enabled).filter(s=>s!=='photos'||photos.length>0).map(s=>(
            <button key={s} onClick={()=>{setActiveSection(s);document.getElementById(s)?.scrollIntoView({behavior:'smooth',block:'start'});}} style={{
              padding:isMobile?'14px 14px':'14px 20px',background:'none',border:'none',borderBottom:activeSection===s?`2.5px solid ${tc}`:'2.5px solid transparent',
              fontFamily:sf,fontSize:isMobile?13:14,fontWeight:activeSection===s?600:400,color:activeSection===s?'#1A1A1A':'#999',cursor:'pointer',whiteSpace:'nowrap',letterSpacing:0.5
            }}>{sectionLabels[s]}</button>
          ))}
        </div>
      </nav>

      <div style={{maxWidth:800,margin:'0 auto',padding:isMobile?'0 16px':'0 20px'}}>

        {/* BOOKING */}
        <section id="booking" style={{paddingTop:28,paddingBottom:20}}>
          <h2 style={{fontFamily:ss,fontSize:isMobile?24:28,fontWeight:300,marginBottom:4}}>Réserver en ligne</h2>
          <p style={{fontSize:14,color:'#999',marginBottom:20}}>24h/24 · Gratuit · Confirmation immédiate</p>

          {step===0&&<div>
            {packages.length>0&&<div style={{marginBottom:20}}>
              <p style={{fontSize:12,letterSpacing:2,textTransform:'uppercase',color:'#999',marginBottom:10}}>✦ FORFAITS</p>
              {packages.map(pk=>(<div key={pk.id} onClick={()=>{setSelectedService({name:pk.name,duration:90,price:pk.total_price});setStep(1);}} style={{background:'#FFF',border:'1px solid #E8E8E4',padding:'16px 20px',marginBottom:-1,cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}} onMouseEnter={e=>e.currentTarget.style.borderColor=tc} onMouseLeave={e=>e.currentTarget.style.borderColor='#E8E8E4'}>
                <div><p style={{fontSize:15,fontWeight:500}}>{pk.name}</p>{pk.description&&<p style={{fontSize:13,color:'#999',marginTop:2}}>{pk.description}</p>}</div>
                <div style={{textAlign:'right',flexShrink:0}}>{pk.original_price>0&&<span style={{fontSize:13,color:'#999',textDecoration:'line-through',marginRight:6}}>{pk.original_price}€</span>}<span style={{fontSize:17,fontWeight:600}}>{pk.total_price}€</span></div>
              </div>))}
            </div>}
            {Object.entries(categories).map(([cat,svcs])=>(<div key={cat} style={{marginBottom:16}}>
              <button onClick={()=>setExpandedCat({...expandedCat,[cat]:!expandedCat[cat]})} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',background:'#FFF',border:'1px solid #E8E8E4',cursor:'pointer',fontSize:14,fontWeight:600,letterSpacing:1,textTransform:'uppercase',color:'#1A1A1A',fontFamily:sf}}>
                <span>{cat}</span><span style={{fontSize:12,color:'#999'}}>{svcs.length} presta. {expandedCat[cat]?'▲':'▼'}</span>
              </button>
              {expandedCat[cat]&&svcs.map(s=>(<div key={s.id} onClick={()=>{setSelectedService(s);setStep(1);}} style={{background:'#FFF',borderLeft:'1px solid #E8E8E4',borderRight:'1px solid #E8E8E4',borderBottom:'1px solid #E8E8E4',padding:'14px 20px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}} onMouseEnter={e=>e.currentTarget.style.background='#FAFAF8'} onMouseLeave={e=>e.currentTarget.style.background='#FFF'}>
                <div><p style={{fontSize:15,fontWeight:500}}>{s.name}</p><p style={{fontSize:13,color:'#999',marginTop:2}}>{s.duration} min</p></div>
                <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
                  {s.promo_active&&<span style={{fontSize:12,background:'#FEF3C7',color:'#92400E',padding:'2px 6px'}}>-{s.promo_percent}%</span>}
                  <span style={{fontSize:15,fontWeight:600}}>à partir de {s.price}€</span>
                  <span style={{background:tc,color:'#FFF',padding:'6px 14px',fontSize:13,fontWeight:500}}>Choisir</span>
                </div>
              </div>))}
            </div>))}
            {services.length===0&&<div style={{background:'#FFF',border:'1px solid #E8E8E4',padding:40,textAlign:'center'}}><p style={{fontSize:15,color:'#999'}}>Aucune prestation disponible.</p></div>}
          </div>}

          {step===1&&<div>
            <button onClick={()=>{setStep(0);setSelectedService(null);}} style={{fontSize:14,color:tc,background:'none',border:'none',cursor:'pointer',marginBottom:16}}>← Retour</button>
            <div style={{background:'#FFF',border:'1px solid #E8E8E4',padding:20,marginBottom:16}}><p style={{fontSize:17,fontWeight:500}}>{selectedService.name}</p><p style={{fontSize:14,color:'#999'}}>{selectedService.duration} min · {selectedService.price}€</p></div>
            <p style={{fontSize:14,fontWeight:600,marginBottom:10}}>Choisis une date</p>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{getNextDays().map(d=>(<button key={d} onClick={()=>{setSelectedDate(d);setStep(2);}} style={{padding:'10px 16px',border:'1px solid #E8E8E4',background:'#FFF',fontSize:14,cursor:'pointer',borderRadius:4,fontFamily:sf}}>{formatDate(d)}</button>))}</div>
          </div>}

          {step===2&&<div>
            <button onClick={()=>setStep(1)} style={{fontSize:14,color:tc,background:'none',border:'none',cursor:'pointer',marginBottom:16}}>← Retour</button>
            <div style={{background:'#FFF',border:'1px solid #E8E8E4',padding:20,marginBottom:16}}><p style={{fontSize:15,fontWeight:500}}>{selectedService.name} · {formatDate(selectedDate)}</p></div>
            <p style={{fontSize:14,fontWeight:600,marginBottom:10}}>Choisis un créneau</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))',gap:8}}>
              {getTimeSlots().map(t=>(<button key={t} onClick={()=>{setSelectedTime(t);setStep(3);}} style={{padding:10,border:'1px solid #E8E8E4',background:'#FFF',fontSize:15,cursor:'pointer',textAlign:'center',fontFamily:sf}} onMouseEnter={e=>{e.currentTarget.style.background=tc;e.currentTarget.style.color='#FFF';}} onMouseLeave={e=>{e.currentTarget.style.background='#FFF';e.currentTarget.style.color='#1A1A1A';}}>{t}</button>))}
            </div>
          </div>}

          {step===3&&<div>
            <button onClick={()=>setStep(2)} style={{fontSize:14,color:tc,background:'none',border:'none',cursor:'pointer',marginBottom:16}}>← Retour</button>
            <div style={{background:'#FFF',border:'1px solid #E8E8E4',padding:20,marginBottom:16}}><p style={{fontSize:17,fontWeight:500,marginBottom:4}}>{selectedService.name}</p><p style={{fontSize:14,color:'#999'}}>{formatDate(selectedDate)} à {selectedTime} · {selectedService.price}€</p></div>
            <form onSubmit={handleBooking}>
              <input required placeholder="Votre nom complet" value={clientInfo.name} onChange={e=>setClientInfo({...clientInfo,name:e.target.value})} style={inp}/>
              <input required placeholder="Numéro de téléphone" value={clientInfo.phone} onChange={e=>setClientInfo({...clientInfo,phone:e.target.value})} style={inp}/>
              <input type="email" placeholder="Email (optionnel)" value={clientInfo.email} onChange={e=>setClientInfo({...clientInfo,email:e.target.value})} style={inp}/>
              <button type="submit" disabled={submitting} style={{width:'100%',padding:14,background:tc,color:'#FFF',border:'none',fontSize:15,fontWeight:600,letterSpacing:1.5,textTransform:'uppercase',cursor:'pointer',opacity:submitting?0.6:1,fontFamily:sf}}>{submitting?'Réservation...':'Confirmer la réservation'}</button>
            </form>
          </div>}

          {step===4&&<div style={{textAlign:'center',padding:'40px 0'}}>
            <p style={{fontSize:48,marginBottom:12}}>✅</p>
            <h2 style={{fontFamily:ss,fontSize:26,fontWeight:300,marginBottom:8}}>Rendez-vous confirmé !</h2>
            <p style={{fontSize:15,color:'#777'}}>{selectedService.name} · {formatDate(selectedDate)} à {selectedTime} · {selectedService.price}€</p>
            <p style={{fontSize:15,color:'#999',marginTop:8}}>Chez {salon.name}</p>
            <button onClick={()=>{setStep(0);setSelectedService(null);setSelectedDate('');setSelectedTime('');setClientInfo({name:'',phone:'',email:''});}} style={{marginTop:20,padding:'12px 28px',background:'transparent',border:`1px solid ${tc}`,fontSize:14,letterSpacing:1,cursor:'pointer',fontFamily:sf}}>Réserver une autre prestation</button>
          </div>}
        </section>

        {/* PHOTOS GRID */}
        {photos.length>0&&<section id="photos" style={{paddingTop:28,paddingBottom:20,borderTop:'1px solid #E8E8E4'}}>
          <h2 style={{fontFamily:ss,fontSize:isMobile?24:28,fontWeight:300,marginBottom:16}}>Photos</h2>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(3,1fr)',gap:6}}>
            {photos.map((p,i)=>(<div key={p.id} onClick={()=>setPhotoIdx(i)} style={{paddingBottom:'100%',position:'relative',cursor:'pointer',borderRadius:4,overflow:'hidden'}}><div style={{position:'absolute',inset:0,background:`url(${p.url}) center/cover`}}/></div>))}
          </div>
        </section>}

        {/* AVIS */}
        <section id="avis" style={{paddingTop:28,paddingBottom:20,borderTop:'1px solid #E8E8E4'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h2 style={{fontFamily:ss,fontSize:isMobile?24:28,fontWeight:300}}>Avis clients</h2>
            {avgRating&&<span style={{fontSize:15,fontWeight:500}}>⭐ {avgRating}/5 · {reviews.length} avis</span>}
          </div>
          {reviews.length===0?<p style={{fontSize:15,color:'#999',padding:'20px 0'}}>Aucun avis pour le moment.</p>:
          reviews.slice(0,6).map(r=>(<div key={r.id} style={{background:'#FFF',border:'1px solid #E8E8E4',padding:'16px 20px',marginBottom:8}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:32,height:32,borderRadius:'50%',background:'#F5F5F3',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:14,fontWeight:600}}>{r.client_name?.[0]}</span></div>
                <p style={{fontSize:14,fontWeight:500}}>{r.client_name}</p>
              </div>
              <span style={{fontSize:14,color:'#F59E0B'}}>{starsStr(r.rating)}</span>
            </div>
            {r.comment&&<p style={{fontSize:14,color:'#555',lineHeight:1.5}}>{r.comment}</p>}
            {r.reply&&<div style={{background:'#F5F5F3',padding:'10px 14px',marginTop:8,borderLeft:`3px solid ${tc}`}}><p style={{fontSize:13,fontWeight:500,marginBottom:2}}>Réponse du salon</p><p style={{fontSize:14,color:'#555'}}>{r.reply}</p></div>}
          </div>))}
        </section>

        {/* CARTE CADEAU */}
        {salon.gift_card_enabled&&<section id="carte-cadeau" style={{paddingTop:28,paddingBottom:20,borderTop:'1px solid #E8E8E4'}}>
          <h2 style={{fontFamily:ss,fontSize:isMobile?24:28,fontWeight:300,marginBottom:4}}>🎁 Offrir une carte cadeau</h2>
          <p style={{fontSize:14,color:'#999',marginBottom:20}}>Un cadeau qui fait toujours plaisir</p>
          {gcDone?<div style={{background:'#FFF',border:'1px solid #E8E8E4',padding:32,textAlign:'center'}}>
            <p style={{fontSize:40,marginBottom:12}}>🎉</p><p style={{fontSize:17,fontWeight:500,marginBottom:8}}>Carte cadeau créée !</p>
            <div style={{background:'#F5F5F3',padding:'16px 24px',display:'inline-block',marginBottom:12}}><p style={{fontSize:22,fontWeight:700,letterSpacing:3}}>{gcCode}</p></div>
            <p style={{fontSize:14,color:'#999'}}>Communiquez ce code au destinataire</p>
            <button onClick={()=>{setGcDone(false);setGc({sender_name:'',sender_email:'',recipient_name:'',recipient_email:'',amount:50,message:''});}} style={{marginTop:16,padding:'10px 24px',background:'transparent',border:`1px solid ${tc}`,fontSize:13,cursor:'pointer',fontFamily:sf}}>Créer une autre carte</button>
          </div>:
          <form onSubmit={submitGiftCard} style={{background:'#FFF',border:'1px solid #E8E8E4',padding:isMobile?16:24}}>
            <p style={{fontSize:12,letterSpacing:2,textTransform:'uppercase',color:'#999',marginBottom:8}}>Montant</p>
            <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
              {[25,50,75,100,150].map(v=>(<button key={v} type="button" onClick={()=>setGc({...gc,amount:v})} style={{padding:'10px 20px',border:gc.amount===v?`2px solid ${tc}`:'1px solid #E8E8E4',background:gc.amount===v?tc:'#FFF',color:gc.amount===v?'#FFF':'#1A1A1A',fontSize:16,fontWeight:600,cursor:'pointer',fontFamily:sf}}>{v}€</button>))}
            </div>
            <p style={{fontSize:12,letterSpacing:2,textTransform:'uppercase',color:'#999',marginBottom:8}}>De la part de</p>
            <input required placeholder="Votre nom" value={gc.sender_name} onChange={e=>setGc({...gc,sender_name:e.target.value})} style={inp}/>
            <p style={{fontSize:12,letterSpacing:2,textTransform:'uppercase',color:'#999',marginBottom:8,marginTop:12}}>Pour</p>
            <input required placeholder="Nom du destinataire" value={gc.recipient_name} onChange={e=>setGc({...gc,recipient_name:e.target.value})} style={inp}/>
            <input type="email" placeholder="Email du destinataire (optionnel)" value={gc.recipient_email} onChange={e=>setGc({...gc,recipient_email:e.target.value})} style={inp}/>
            <input placeholder="Message personnalisé" value={gc.message} onChange={e=>setGc({...gc,message:e.target.value})} style={{...inp,marginTop:8}}/>
            <button type="submit" style={{width:'100%',marginTop:12,padding:14,background:tc,color:'#FFF',border:'none',fontSize:15,fontWeight:600,letterSpacing:1.5,textTransform:'uppercase',cursor:'pointer',fontFamily:sf}}>Offrir {gc.amount}€</button>
          </form>}
        </section>}

        {/* PRODUITS */}
        {products.length>0&&<section style={{paddingTop:28,paddingBottom:20,borderTop:'1px solid #E8E8E4'}}>
          <h2 style={{fontFamily:ss,fontSize:isMobile?24:28,fontWeight:300,marginBottom:16}}>Nos produits</h2>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(3,1fr)',gap:10}}>
            {products.map(p=>(<div key={p.id} style={{background:'#FFF',border:'1px solid #E8E8E4',padding:16,textAlign:'center'}}>
              {p.photo_url&&<div style={{width:'100%',paddingBottom:'80%',background:`url(${p.photo_url}) center/cover`,marginBottom:8,borderRadius:4}}/>}
              <p style={{fontSize:14,fontWeight:500}}>{p.name}</p>{p.brand&&<p style={{fontSize:13,color:'#999'}}>{p.brand}</p>}<p style={{fontSize:16,fontWeight:600,marginTop:4}}>{p.price}€</p>
            </div>))}
          </div>
        </section>}

        {/* EQUIPE */}
        {team.length>0&&<section style={{paddingTop:28,paddingBottom:20,borderTop:'1px solid #E8E8E4'}}>
          <h2 style={{fontFamily:ss,fontSize:isMobile?24:28,fontWeight:300,marginBottom:16}}>L'équipe</h2>
          <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
            {team.map(m=>(<div key={m.id} style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:m.color||'#E8E8E4',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:16,fontWeight:600,color:'#FFF'}}>{m.name?.[0]}</span></div>
              <div><p style={{fontSize:15,fontWeight:500}}>{m.name}</p>{m.role&&<p style={{fontSize:13,color:'#999'}}>{m.role}</p>}</div>
            </div>))}
          </div>
        </section>}

        {/* INFOS + MAP */}
        <section id="infos" style={{paddingTop:28,paddingBottom:20,borderTop:'1px solid #E8E8E4'}}>
          <h2 style={{fontFamily:ss,fontSize:isMobile?24:28,fontWeight:300,marginBottom:16}}>Informations</h2>
          {(salon.address||salon.city)&&<div style={{marginBottom:16}}>
            <iframe width="100%" height="250" style={{border:0,borderRadius:4}} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://maps.google.com/maps?q=${encodeURIComponent(salon.address||salon.city)}&output=embed&z=15`}/>
            <p style={{fontSize:14,color:'#777',marginTop:6}}>📍 {salon.address||salon.city}</p>
          </div>}
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:16}}>
            <div style={{background:'#FFF',border:'1px solid #E8E8E4',padding:20}}>
              <p style={{fontSize:12,letterSpacing:2,textTransform:'uppercase',color:'#999',marginBottom:10}}>Horaires</p>
              <p style={{fontSize:15}}>{salon.opening_time||'9h00'} — {salon.closing_time||'19h00'}</p>
              {salon.closed_days&&<p style={{fontSize:14,color:'#999',marginTop:4}}>Fermé : {Array.isArray(salon.closed_days)?salon.closed_days.join(', '):salon.closed_days}</p>}
            </div>
            <div style={{background:'#FFF',border:'1px solid #E8E8E4',padding:20}}>
              <p style={{fontSize:12,letterSpacing:2,textTransform:'uppercase',color:'#999',marginBottom:10}}>Contact</p>
              {salon.phone&&<p style={{fontSize:15}}>📞 <a href={`tel:${salon.phone}`} style={{color:'#1A1A1A',textDecoration:'none'}}>{salon.phone}</a></p>}
            </div>
          </div>
          {salon.description&&<div style={{background:'#FFF',border:'1px solid #E8E8E4',padding:20,marginTop:16}}>
            <p style={{fontSize:12,letterSpacing:2,textTransform:'uppercase',color:'#999',marginBottom:10}}>À propos</p>
            <p style={{fontSize:15,color:'#555',lineHeight:1.7}}>{salon.description}</p>
          </div>}
        </section>
      </div>

      <footer style={{textAlign:'center',padding:'28px 20px',borderTop:'1px solid #E8E8E4',marginTop:20}}>
        <p style={{fontSize:13,color:'#CCC',letterSpacing:1}}>Propulsé par <strong style={{color:'#999',fontWeight:500}}>MY PRESTY</strong></p>
      </footer>
    </div>
  );
}
