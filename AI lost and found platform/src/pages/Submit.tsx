import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { ItemForm } from '@/components/Forms';
import { useItems } from '@/hooks/useItems';
import { useAuth } from '@/hooks/useAuth';
import { ROUTE_PATHS, buildEnhancedMatches } from '@/lib/index';
import { sendMatchEmail } from '@/hooks/useMatchNotification';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Submit() {
  const [itemType, setItemType] = useState<'lost' | 'found'>('lost');
  const [submitted, setSubmitted] = useState(false);
  const { createItem } = useItems();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData: any) => {
    if (!user) {
      toast.error('You must be logged in to submit an item.');
      return;
    }

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

              // 2. Also email the owner of the MATCHED item (the other person)
              if (matchedOppositeItem.user_id && matchedOppositeItem.user_id !== user!.id) {
                const { data: { users: allUsers } } = await supabaseAdmin.auth.admin.listUsers();
                const oppositeOwner = allUsers?.find((u: any) => u.id === matchedOppositeItem.user_id);
                if (oppositeOwner?.email) {
                  await sendMatchEmail({
                    toEmail: oppositeOwner.email,
                    userName: oppositeOwner.user_metadata?.full_name || oppositeOwner.email.split('@')[0],
                    lostTitle: best.lostItem.title,
                    foundTitle: best.foundItem.title,
                    confidence: best.confidenceScore,
                    foundLocation: best.foundItem.location_name || '',
                    foundDate,
                  });
                  console.log('Match notification also sent to opposite item owner:', oppositeOwner.email);
                }
              }
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

              // Notify the owner of the matched item that their item was found
              const { data: { users: allUsers } } = await supabaseAdmin.auth.admin.listUsers();
              const matchedOwner = allUsers?.find((u: any) => u.id === matchedItem.user_id);
              if (matchedOwner?.email) {
                await sendMatchEmail({
                  toEmail: matchedOwner.email,
                  userName: matchedOwner.user_metadata?.full_name || matchedOwner.email.split('@')[0],
                  lostTitle: best2.lostItem.title,
                  foundTitle: best2.foundItem.title,
                  confidence: best2.confidenceScore,
                  foundLocation: best2.foundItem.location_name || '',
                  foundDate: new Date(best2.foundItem.date_found || best2.foundItem.created_at).toLocaleDateString(),
                });
              }

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Item Submitted!</h2>
          <p className="text-muted-foreground">AI is scanning for matches. Redirecting you to Browse...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Submit an Item</h1>
          <p className="text-muted-foreground">Report a lost or found item and let our AI find matches</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-1">Item Details</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Fill in the information below. Our AI will automatically search for matches.
            </p>

            {/* Lost / Found toggle */}
            <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-border mb-6">
              {(['lost', 'found'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setItemType(type)}
                  className={`py-3 text-sm font-semibold transition-all ${
                    itemType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {type === 'lost' ? 'Lost Item' : 'Found Item'}
                </button>
              ))}
            </div>
          </div>

          <ItemForm type={itemType} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
