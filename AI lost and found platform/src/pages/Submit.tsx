import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { ItemForm } from '@/components/Forms';
import { useItems } from '@/hooks/useItems';
import { useAuth } from '@/hooks/useAuth';
import { ROUTE_PATHS, buildEnhancedMatches } from '@/lib/index';
import { sendMatchEmail } from '@/hooks/useMatchNotification';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { toast } from 'sonner';

const glass = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 24,
} as React.CSSProperties;

export default function Submit() {
  const [itemType, setItemType] = useState<'lost' | 'found'>('lost');
  const [submitted, setSubmitted] = useState(false);
  const { createItem } = useItems();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData: any) => {
    if (!user) { toast.error('You must be logged in to submit an item.'); return; }

    const item = {
      title: formData.title, description: formData.description,
      category: formData.category, type: itemType, status: itemType, user_id: user.id,
      location_name: formData.location?.name || '',
      location_lat: formData.location?.lat || 0,
      location_lng: formData.location?.lng || 0,
      ...(itemType === 'lost'
        ? { date_lost: formData.date?.toISOString() || new Date().toISOString() }
        : { date_found: formData.date?.toISOString() || new Date().toISOString() }),
    };

    try {
      const { data: existing } = await supabase.from('items').select('id').eq('user_id', user.id).eq('type', itemType).ilike('title', item.title.trim()).limit(5);
      if (existing && existing.length > 0) {
        for (const dup of existing) await supabase.from('items').delete().eq('id', dup.id);
        toast.info('Duplicate detected — replacing your previous submission.');
      }

      const { data, error } = await createItem(item, formData.imageFile);
      if (error) { toast.error(`Failed: ${error.message}`); return; }

      if (data) {
        setSubmitted(true);
        toast.success('Item submitted! AI is now scanning for matches.');

        try {
          const oppositeType = itemType === 'lost' ? 'found' : 'lost';
          const { data: candidates } = await supabase.from('items').select('*').eq('type', oppositeType).limit(100);
          if (candidates && candidates.length > 0) {
            const lostItems = itemType === 'lost' ? [data] : candidates;
            const foundItems = itemType === 'found' ? [data] : candidates;
            const matches = buildEnhancedMatches(lostItems, foundItems, 0.4);
            if (matches.length > 0) {
              const best = matches[0];
              await sendMatchEmail({
                toEmail: user!.email!, userName: user!.user_metadata?.full_name || user!.email!.split('@')[0],
                lostTitle: best.lostItem.title, foundTitle: best.foundItem.title,
                confidence: best.confidenceScore, foundLocation: best.foundItem.location_name || '',
                foundDate: new Date(best.foundItem.date_found || best.foundItem.created_at).toLocaleDateString(),
              });
            }
          }
        } catch (emailErr) { console.error('Email notification failed:', emailErr); }

        try {
          const oppositeType2 = itemType === 'lost' ? 'found' : 'lost';
          const { data: candidates2 } = await supabase.from('items').select('*').eq('type', oppositeType2).limit(100);
          if (candidates2 && candidates2.length > 0) {
            const lostItems2 = itemType === 'lost' ? [data] : candidates2;
            const foundItems2 = itemType === 'found' ? [data] : candidates2;
            const matches2 = buildEnhancedMatches(lostItems2, foundItems2, 0.85);
            if (matches2.length > 0) {
              const best2 = matches2[0];
              const matchedItem = itemType === 'found' ? best2.lostItem : best2.foundItem;
              await supabase.from('items').delete().eq('id', matchedItem.id);
              await supabase.from('items').delete().eq('id', data.id);
              const { data: { users: allUsers } } = await supabaseAdmin.auth.admin.listUsers();
              const matchedOwner = allUsers?.find((u: any) => u.id === matchedItem.user_id);
              if (matchedOwner?.email) {
                await sendMatchEmail({
                  toEmail: matchedOwner.email, userName: matchedOwner.user_metadata?.full_name || matchedOwner.email.split('@')[0],
                  lostTitle: best2.lostItem.title, foundTitle: best2.foundItem.title,
                  confidence: best2.confidenceScore, foundLocation: best2.foundItem.location_name || '',
                  foundDate: new Date(best2.foundItem.date_found || best2.foundItem.created_at).toLocaleDateString(),
                });
              }
              toast.success('🎉 Perfect match found! Both items resolved automatically.');
              setTimeout(() => navigate(ROUTE_PATHS.BROWSE), 2500);
              return;
            }
          }
        } catch (resolveErr) { console.error('Auto-resolve failed:', resolveErr); }

        setTimeout(() => navigate(ROUTE_PATHS.BROWSE), 2000);
      }
    } catch (err) { toast.error('Something went wrong. Please try again.'); }
  };

  if (submitted) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
          style={{ ...glass, padding:48, textAlign:'center', maxWidth:360 }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(52,211,153,0.1)', border:'2px solid rgba(52,211,153,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <CheckCircle2 style={{ width:36, height:36, color:'#34d399' }} />
          </div>
          <h2 style={{ fontSize:22, fontWeight:700, color:'#fff', marginBottom:8 }}>Item Submitted!</h2>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>AI is scanning for matches. Redirecting you to Browse...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', padding:'40px 16px' }}>
      <div style={{ maxWidth:640, margin:'0 auto' }}>

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:20, background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)', marginBottom:16 }}>
            <Sparkles style={{ width:14, height:14, color:'#a78bfa' }} />
            <span style={{ fontSize:12, color:'#a78bfa', fontWeight:500 }}>AI-Powered Matching</span>
          </div>
          <h1 style={{ fontSize:30, fontWeight:700, color:'#fff', marginBottom:8 }}>Submit an Item</h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:15 }}>Report a lost or found item and let our AI find matches</p>
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          style={{ ...glass, padding:32 }}>
          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontSize:16, fontWeight:600, color:'rgba(255,255,255,0.8)', marginBottom:4 }}>Item Details</h2>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', marginBottom:24 }}>
              Fill in the information below. Our AI will automatically search for matches.
            </p>

            {/* Lost / Found toggle */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderRadius:14, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)' }}>
              {(['lost','found'] as const).map(type => (
                <button key={type} onClick={() => setItemType(type)}
                  style={{
                    padding:'12px 0', fontSize:14, fontWeight:600, cursor:'pointer', transition:'all 0.2s', border:'none',
                    background: itemType === type
                      ? (type === 'lost' ? 'linear-gradient(135deg,rgba(239,68,68,0.3),rgba(220,38,38,0.2))' : 'linear-gradient(135deg,rgba(52,211,153,0.3),rgba(5,150,105,0.2))')
                      : 'transparent',
                    color: itemType === type ? (type === 'lost' ? '#f87171' : '#34d399') : 'rgba(255,255,255,0.35)',
                  }}>
                  {type === 'lost' ? '🔴  Lost Item' : '🟢  Found Item'}
                </button>
              ))}
            </div>
          </div>

          <ItemForm type={itemType} onSubmit={handleSubmit} />
        </motion.div>

        {/* Info chips */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
          style={{ display:'flex', gap:12, marginTop:20, justifyContent:'center', flexWrap:'wrap' }}>
          {['AI scans in seconds','Email notification sent','Duplicate detection'].map(label => (
            <span key={label} style={{ padding:'5px 12px', borderRadius:20, fontSize:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.4)' }}>
              ✓ {label}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
