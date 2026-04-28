import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { ItemForm } from '@/components/Forms';
import { useItems } from '@/hooks/useItems';
import { useAuth } from '@/hooks/useAuth';
import { ROUTE_PATHS, buildEnhancedMatches } from '@/lib/index';
import { sendMatchEmail } from '@/hooks/useMatchNotification';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const RATE_LIMIT_MS = 10_000; // 10 seconds between submissions

export default function Submit() {
  const [itemType, setItemType] = useState<'lost' | 'found'>('lost');
  const [submitted, setSubmitted] = useState(false);
  const { createItem } = useItems();
  const { user } = useAuth();
  const navigate = useNavigate();
  const lastSubmitRef = useRef<number>(0);

  const handleSubmit = async (formData: any) => {
    if (!user) { toast.error('You must be logged in to submit an item.'); return; }

    // ── Rate limit: prevent spam submissions ──────────────────────────────────
    const now = Date.now();
    if (now - lastSubmitRef.current < RATE_LIMIT_MS) {
      const secondsLeft = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitRef.current)) / 1000);
      toast.error(`Please wait ${secondsLeft}s before submitting again.`);
      return;
    }
    lastSubmitRef.current = now;

    const item = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      type: itemType,
      status: itemType, // ✅ Fixed: must be 'lost' or 'found' per CHECK constraint
      user_id: user.id,
      location_name: formData.location?.name || '',
      location_lat: formData.location?.lat || 0,
      location_lng: formData.location?.lng || 0,
      ...(itemType === 'lost'
        ? { date_lost: formData.date?.toISOString() || new Date().toISOString() }
        : { date_found: formData.date?.toISOString() || new Date().toISOString() }),
    };

    try {
      // ── Duplicate check: same user, same title, same type submitted before ──
      const { data: existing } = await supabase
        .from('items')
        .select('id, title, type, created_at')
        .eq('user_id', user.id)
        .eq('type', itemType)
        .ilike('title', item.title.trim())
        .limit(5);

      if (existing && existing.length > 0) {
        // Already submitted this exact item — delete the old one and replace with new
        for (const dup of existing) {
          await supabase.from('items').delete().eq('id', dup.id);
        }
        toast.info('Duplicate detected — replacing your previous submission.');
      }

      const { data, error } = await createItem(item, formData.imageFile);

      if (error) {
        console.error('Supabase error:', JSON.stringify(error, null, 2));
        toast.error(`Failed: ${error.message}`);
        return;
      }

      if (data) {
        setSubmitted(true);
        toast.success('Item submitted! AI is now scanning for matches.');

        // Auto match notification via EmailJS
        try {
          const oppositeType = itemType === 'lost' ? 'found' : 'lost';
          const { data: candidates } = await supabase
            .from('items')
            .select('*')
            .eq('type', oppositeType)
            .limit(100);

          if (candidates && candidates.length > 0) {
            const newItem = data;
            const lostItems = itemType === 'lost' ? [newItem] : candidates;
            const foundItems = itemType === 'found' ? [newItem] : candidates;
            const matches = buildEnhancedMatches(lostItems, foundItems, 0.6);

            if (matches.length > 0) {
              const best = matches[0];
              const matchedOppositeItem = itemType === 'lost' ? best.foundItem : best.lostItem;
              const foundDate = new Date(best.foundItem.date_found || best.foundItem.created_at).toLocaleDateString();

              // 1. Email the person who just submitted (current user)
              await sendMatchEmail({
                toEmail: user!.email!,
                userName: user!.user_metadata?.full_name || user!.email!.split('@')[0],
                lostTitle: best.lostItem.title,
                foundTitle: best.foundItem.title,
                confidence: best.confidenceScore,
                foundLocation: best.foundItem.location_name || '',
                foundDate,
              });

              // 2. Cross-user notification is handled server-side via Edge Function
              console.log('Match found for opposite owner:', matchedOppositeItem.user_id);
            }
          }
        } catch (emailErr) {
          console.error('Email notification failed:', emailErr);
          // Don't block the user flow if email fails
        }

        // Auto-resolve: if found item matches a lost item at ≥ 85%, mark both as resolved and delete
        try {
          const oppositeType2 = itemType === 'lost' ? 'found' : 'lost';
          const { data: candidates2 } = await supabase
            .from('items')
            .select('*')
            .eq('type', oppositeType2)
            .limit(100);

          if (candidates2 && candidates2.length > 0) {
            const newItem2 = data;
            const lostItems2 = itemType === 'lost' ? [newItem2] : candidates2;
            const foundItems2 = itemType === 'found' ? [newItem2] : candidates2;
            const matches2 = buildEnhancedMatches(lostItems2, foundItems2, 0.85);

            if (matches2.length > 0) {
              const best2 = matches2[0];
              const matchedItem = itemType === 'found' ? best2.lostItem : best2.foundItem;

              // Delete the matched opposite item (it's been resolved)
              await supabase.from('items').delete().eq('id', matchedItem.id);
              // Also delete the newly submitted item since it's a duplicate resolution
              await supabase.from('items').delete().eq('id', newItem2.id);

              // Cross-user notification handled server-side
              console.log('Auto-resolved: notifying owner of item', matchedItem.user_id);

              toast.success('🎉 Perfect match found! Both items have been resolved automatically.');
              setTimeout(() => navigate(ROUTE_PATHS.BROWSE), 2500);
              return;
            }
          }
        } catch (resolveErr) {
          console.error('Auto-resolve failed:', resolveErr);
        }

        setTimeout(() => {
          navigate(ROUTE_PATHS.BROWSE);
        }, 2000);
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      console.error(err);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#09090f,#0d0a1a)', position:'relative', overflow:'hidden' }}>
        {/* Pulse rings */}
        {[1,2,3].map(i => (
          <motion.div key={i} animate={{ scale:[1,2.5], opacity:[0.4,0] }} transition={{ duration:2, repeat:Infinity, delay:i*0.5, ease:'easeOut' }}
            style={{ position:'absolute', width:80, height:80, borderRadius:'50%', border:'1px solid rgba(52,211,153,0.4)', pointerEvents:'none' }} />
        ))}
        <motion.div initial={{ opacity:0, scale:0.8, y:20 }} animate={{ opacity:1, scale:1, y:0 }} transition={{ type:'spring', stiffness:200, damping:20 }}
          style={{ textAlign:'center', position:'relative', zIndex:1 }}>
          <motion.div animate={{ scale:[1,1.1,1] }} transition={{ duration:1.5, repeat:Infinity, ease:'easeInOut' }}
            style={{ width:80, height:80, borderRadius:'50%', background:'rgba(52,211,153,0.15)', border:'2px solid rgba(52,211,153,0.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <CheckCircle2 style={{ width:40, height:40, color:'#34d399' }} />
          </motion.div>
          <motion.h2 initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            style={{ fontSize:28, fontWeight:800, color:'#fff', marginBottom:8, letterSpacing:'-0.02em' }}>Item Submitted! 🎉</motion.h2>
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}
            style={{ color:'rgba(255,255,255,0.5)', fontSize:15 }}>AI is scanning for matches. Redirecting you to Browse...</motion.p>
          <motion.div initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ delay:0.5, duration:1.8, ease:'linear' }}
            style={{ height:2, background:'linear-gradient(90deg,#34d399,#60a5fa)', borderRadius:2, marginTop:24, transformOrigin:'left' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', padding:'40px 16px', position:'relative', overflow:'hidden' }}>
      {/* Ambient blob */}
      <motion.div animate={{ scale:[1,1.15,1], x:[0,20,0] }} transition={{ duration:18, repeat:Infinity, ease:'easeInOut' }}
        style={{ position:'fixed', top:'-10%', right:'-5%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', filter:'blur(50px)', pointerEvents:'none', zIndex:0 }} />
      <motion.div animate={{ scale:[1,0.9,1], y:[0,-20,0] }} transition={{ duration:22, repeat:Infinity, ease:'easeInOut', delay:5 }}
        style={{ position:'fixed', bottom:'-5%', left:'-5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)', filter:'blur(50px)', pointerEvents:'none', zIndex:0 }} />

      <div style={{ maxWidth:640, margin:'0 auto', position:'relative', zIndex:1 }}>
        {/* Header */}
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:[0.22,1,0.36,1] }} style={{ textAlign:'center', marginBottom:32 }}>
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1 }}
            style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 16px', borderRadius:20, background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.25)', marginBottom:16 }}>
            <motion.div animate={{ rotate:[0,15,-10,15,0] }} transition={{ duration:3, repeat:Infinity, repeatDelay:2 }}>
              <Sparkles style={{ width:14, height:14, color:'#a78bfa' }} />
            </motion.div>
            <span style={{ fontSize:12, color:'#a78bfa', fontWeight:600 }}>AI-Powered Matching</span>
          </motion.div>
          <h1 style={{ fontSize:34, fontWeight:800, color:'#fff', marginBottom:8, letterSpacing:'-0.02em' }}>Submit an Item</h1>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15 }}>Report a lost or found item and let our AI find matches</p>
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity:0, y:24, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ delay:0.15, duration:0.6, ease:[0.22,1,0.36,1] }}
          style={{ background:'rgba(14,14,24,0.85)', backdropFilter:'blur(30px)', WebkitBackdropFilter:'blur(30px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:24, overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,0.4)' }}>
          {/* Top shimmer */}
          <motion.div animate={{ x:['-100%','200%'] }} transition={{ duration:3, repeat:Infinity, repeatDelay:6 }}
            style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(167,139,250,0.6),rgba(96,165,250,0.8),transparent)' }} />
          <div style={{ padding:'28px 32px 32px' }}>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }} style={{ marginBottom:24 }}>
              <h2 style={{ fontSize:17, fontWeight:700, color:'rgba(255,255,255,0.85)', margin:'0 0 4px' }}>Item Details</h2>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', margin:0 }}>Fill in the information below. Our AI will automatically search for matches.</p>
            </motion.div>

            {/* Lost / Found toggle */}
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
              style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:24, padding:5, background:'rgba(255,255,255,0.04)', borderRadius:14, border:'1px solid rgba(255,255,255,0.07)' }}>
              {(['lost','found'] as const).map(type => (
                <motion.button key={type} onClick={() => setItemType(type)} whileTap={{ scale:0.97 }}
                  style={{ padding:'11px 0', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', border:'none', outline:'none', transition:'all 0.2s',
                    background:itemType===type?(type==='lost'?'linear-gradient(135deg,rgba(239,68,68,0.5),rgba(220,38,38,0.5))':'linear-gradient(135deg,rgba(52,211,153,0.4),rgba(5,150,105,0.4))'):'transparent',
                    color:itemType===type?(type==='lost'?'#fca5a5':'#6ee7b7'):'rgba(255,255,255,0.4)',
                    boxShadow:itemType===type?(type==='lost'?'0 4px 16px rgba(239,68,68,0.2)':'0 4px 16px rgba(52,211,153,0.2)'):'none' }}>
                  {type==='lost'?'🔴 Lost Item':'🟢 Found Item'}
                </motion.button>
              ))}
            </motion.div>

            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.42 }}>
              <ItemForm type={itemType} onSubmit={handleSubmit} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
