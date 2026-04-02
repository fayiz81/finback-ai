import { motion } from "framer-motion";
import { MapPin, Calendar, Edit, Mail, CheckCircle, XCircle, Image as ImageIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { MatchResult } from "@/lib/index";

const spring = { type: "spring" as const, stiffness: 300, damping: 35 };

const glass = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 18,
  overflow: 'hidden',
} as React.CSSProperties;

export function LostItemCard({ item, onEdit }: { item: any; onEdit?: () => void }) {
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={spring} whileHover={{ scale:1.02 }}>
      <div style={{ ...glass, transition:'all 0.3s' }}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.border='1px solid rgba(239,68,68,0.25)'}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.border='1px solid rgba(255,255,255,0.1)'}>
        <div style={{ position:'relative', height:180, background:'rgba(255,255,255,0.04)' }}>
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          ) : (
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ImageIcon style={{ width:36, height:36, color:'rgba(255,255,255,0.1)' }} />
            </div>
          )}
          <span style={{ position:'absolute', top:10, right:10, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:'rgba(239,68,68,0.2)', color:'#f87171', border:'1px solid rgba(239,68,68,0.3)', backdropFilter:'blur(10px)' }}>
            {(item.status || 'lost').charAt(0).toUpperCase() + (item.status || 'lost').slice(1)}
          </span>
        </div>
        <div style={{ padding:16 }}>
          <h3 style={{ fontSize:15, fontWeight:600, color:'#fff', marginBottom:6, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</h3>
          <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:6, fontSize:11, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.45)', border:'1px solid rgba(255,255,255,0.08)', marginBottom:10 }}>{item.category}</span>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.5, marginBottom:10, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.description}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'rgba(255,255,255,0.35)' }}>
              <MapPin style={{ width:11, height:11, color:'#7c3aed', flexShrink:0 }} />
              <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.location_name || 'Location not specified'}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'rgba(255,255,255,0.35)' }}>
              <Calendar style={{ width:11, height:11, color:'#7c3aed', flexShrink:0 }} />
              <span>Lost on {item.date_lost ? new Date(item.date_lost).toLocaleDateString() : new Date(item.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          {onEdit && (
            <button onClick={onEdit} style={{ width:'100%', marginTop:12, padding:'8px', borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <Edit style={{ width:13, height:13 }} />Edit Item
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function FoundItemCard({ item, onEdit }: { item: any; onEdit?: () => void }) {
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={spring} whileHover={{ scale:1.02 }}>
      <div style={{ ...glass, transition:'all 0.3s' }}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.border='1px solid rgba(52,211,153,0.25)'}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.border='1px solid rgba(255,255,255,0.1)'}>
        <div style={{ position:'relative', height:180, background:'rgba(255,255,255,0.04)' }}>
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          ) : (
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ImageIcon style={{ width:36, height:36, color:'rgba(255,255,255,0.1)' }} />
            </div>
          )}
          <span style={{ position:'absolute', top:10, right:10, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:'rgba(52,211,153,0.2)', color:'#34d399', border:'1px solid rgba(52,211,153,0.3)', backdropFilter:'blur(10px)' }}>
            {(item.status || 'found').charAt(0).toUpperCase() + (item.status || 'found').slice(1)}
          </span>
        </div>
        <div style={{ padding:16 }}>
          <h3 style={{ fontSize:15, fontWeight:600, color:'#fff', marginBottom:6, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</h3>
          <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:6, fontSize:11, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.45)', border:'1px solid rgba(255,255,255,0.08)', marginBottom:10 }}>{item.category}</span>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.5, marginBottom:10, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.description}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'rgba(255,255,255,0.35)' }}>
              <MapPin style={{ width:11, height:11, color:'#059669', flexShrink:0 }} />
              <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.location_name || 'Location not specified'}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'rgba(255,255,255,0.35)' }}>
              <Calendar style={{ width:11, height:11, color:'#059669', flexShrink:0 }} />
              <span>Found on {item.date_found ? new Date(item.date_found).toLocaleDateString() : new Date(item.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          {onEdit && (
            <button onClick={onEdit} style={{ width:'100%', marginTop:12, padding:'8px', borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <Edit style={{ width:13, height:13 }} />Edit Item
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function MatchCard({ match, onContact }: { match: MatchResult; onContact?: () => void }) {
  const score = match.confidenceScore;
  const color = score >= 0.8 ? '#34d399' : score >= 0.6 ? '#fbbf24' : 'rgba(255,255,255,0.5)';
  const bg = score >= 0.8 ? 'rgba(52,211,153,0.08)' : score >= 0.6 ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.04)';
  const border = score >= 0.8 ? 'rgba(52,211,153,0.2)' : score >= 0.6 ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.08)';

  const statusColors: Record<string, string> = {
    pending:'rgba(124,58,237,0.2)', contacted:'rgba(37,99,235,0.2)', confirmed:'rgba(52,211,153,0.2)', rejected:'rgba(239,68,68,0.2)',
  };
  const statusTextColors: Record<string, string> = {
    pending:'#a78bfa', contacted:'#60a5fa', confirmed:'#34d399', rejected:'#f87171',
  };

  return (
    <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={spring} whileHover={{ scale:1.02 }}>
      <div style={{ background:bg, border:`1px solid ${border}`, borderRadius:18, overflow:'hidden', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)' }}>
        <div style={{ padding:'16px 18px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ padding:'8px 16px', borderRadius:12, background:bg, border:`1px solid ${border}` }}>
                <span style={{ fontSize:24, fontWeight:700, color }}>{Math.round(score * 100)}%</span>
              </div>
              <div>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', margin:0 }}>Match Confidence</p>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.25)', margin:'2px 0 0' }}>{new Date(match.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:500, background:statusColors[match.status]||statusColors.pending, color:statusTextColors[match.status]||statusTextColors.pending, border:`1px solid ${border}` }}>
              {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
            </span>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { label:'Image Similarity', value:match.breakdown.imageSimilarity },
              { label:'Text Similarity', value:match.breakdown.textSimilarity },
              { label:'Location Proximity', value:match.breakdown.locationProximity },
              { label:'Time Proximity', value:match.breakdown.timeProximity },
            ].map(b => (
              <div key={b.label}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:12 }}>
                  <span style={{ color:'rgba(255,255,255,0.4)' }}>{b.label}</span>
                  <span style={{ color:'rgba(255,255,255,0.7)', fontWeight:500 }}>{Math.round(b.value * 100)}%</span>
                </div>
                <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:2, width:`${b.value*100}%`, background:color, transition:'width 0.8s ease' }} />
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:12 }}>
            Weighted: Image (40%) + Text (30%) + Location (20%) + Time (10%)
          </p>

          {onContact && match.status === 'pending' && (
            <button onClick={onContact} style={{ width:'100%', marginTop:12, padding:'10px', borderRadius:12, background:'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(79,70,229,0.3))', border:'1px solid rgba(124,58,237,0.3)', color:'#e9d5ff', fontSize:13, fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <Mail style={{ width:14, height:14 }} />Contact Owner
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
