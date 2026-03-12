import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { ItemForm } from '@/components/Forms';
import { useItems } from '@/hooks/useItems';
import { useAuth } from '@/hooks/useAuth';
import { ROUTE_PATHS } from '@/lib/index';
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
      const { data, error } = await createItem(item, formData.imageFile);

      if (error) {
        console.error('Supabase error:', JSON.stringify(error, null, 2));
        toast.error(`Failed: ${error.message}`);
        return;
      }

      if (data) {
        setSubmitted(true);
        toast.success('Item submitted! AI is now scanning for matches.');
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
