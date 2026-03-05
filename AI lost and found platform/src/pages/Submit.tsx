import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, MapPin, Calendar, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useItems } from '@/hooks/useItems';
import { ITEM_CATEGORIES } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { springPresets } from '@/lib/motion';

export default function Submit() {
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [locationName, setLocationName] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { submitLostItem, submitFoundItem, getCurrentLocation } = useItems();
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image under 5MB',
          variant: 'destructive',
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    try {
      const coords = await getCurrentLocation();
      setCoordinates(coords);
      setLocationName(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
      toast({
        title: 'Location captured',
        description: 'GPS coordinates have been recorded',
      });
    } catch (error) {
      toast({
        title: 'Location error',
        description: 'Could not get your location. Please enter manually.',
        variant: 'destructive',
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !category || !locationName || !date) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!imageFile) {
      toast({
        title: 'Image required',
        description: 'Please upload an image of the item',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = {
        title,
        description,
        category: category as typeof ITEM_CATEGORIES[number],
        imageFile,
        location: {
          name: locationName,
          lat: coordinates?.lat || 0,
          lng: coordinates?.lng || 0,
        },
        date: new Date(date),
      };

      const userId = 'user-1';

      if (activeTab === 'lost') {
        await submitLostItem(formData, userId);
      } else {
        await submitFoundItem(formData, userId);
      }

      setSubmitSuccess(true);
      toast({
        title: 'Item submitted successfully',
        description: 'AI matching is now processing your item',
      });

      setTimeout(() => {
        setTitle('');
        setDescription('');
        setCategory('');
        setImageFile(null);
        setImagePreview('');
        setLocationName('');
        setCoordinates(null);
        setDate(new Date().toISOString().split('T')[0]);
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springPresets.gentle}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Submit an Item</h1>
            <p className="text-muted-foreground text-lg">
              Report a lost or found item and let our AI find matches
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>
                Fill in the information below. Our AI will automatically search for matches.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'lost' | 'found')}>
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="lost">Lost Item</TabsTrigger>
                  <TabsTrigger value="found">Found Item</TabsTrigger>
                </TabsList>

                <TabsContent value="lost" className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Item Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Black iPhone 14 Pro"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Provide detailed description including color, brand, distinctive features..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {ITEM_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">Upload Image *</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                        {imagePreview ? (
                          <div className="space-y-4">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-h-64 mx-auto rounded-lg object-cover"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview('');
                              }}
                            >
                              Remove Image
                            </Button>
                          </div>
                        ) : (
                          <label htmlFor="image" className="cursor-pointer block">
                            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                            <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="location"
                          placeholder="Enter location or use GPS"
                          value={locationName}
                          onChange={(e) => setLocationName(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGetLocation}
                          disabled={isGettingLocation}
                        >
                          {isGettingLocation ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <MapPin className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Date Lost *</Label>
                      <div className="relative">
                        <Input
                          id="date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          required
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting || submitSuccess}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : submitSuccess ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Submitted Successfully
                        </>
                      ) : (
                        'Submit Lost Item'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="found" className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title-found">Item Title *</Label>
                      <Input
                        id="title-found"
                        placeholder="e.g., Black iPhone 14 Pro"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description-found">Description *</Label>
                      <Textarea
                        id="description-found"
                        placeholder="Provide detailed description including color, brand, distinctive features..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category-found">Category *</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {ITEM_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image-found">Upload Image *</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                        {imagePreview ? (
                          <div className="space-y-4">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-h-64 mx-auto rounded-lg object-cover"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview('');
                              }}
                            >
                              Remove Image
                            </Button>
                          </div>
                        ) : (
                          <label htmlFor="image-found" className="cursor-pointer block">
                            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                            <Input
                              id="image-found"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location-found">Location *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="location-found"
                          placeholder="Enter location or use GPS"
                          value={locationName}
                          onChange={(e) => setLocationName(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGetLocation}
                          disabled={isGettingLocation}
                        >
                          {isGettingLocation ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <MapPin className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date-found">Date Found *</Label>
                      <div className="relative">
                        <Input
                          id="date-found"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          required
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting || submitSuccess}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : submitSuccess ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Submitted Successfully
                        </>
                      ) : (
                        'Submit Found Item'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">AI Matching Process</p>
                    <p className="text-xs text-muted-foreground">
                      Once submitted, our AI will analyze your item using image recognition,
                      text similarity, location proximity, and time matching. You'll receive
                      email notifications for matches with confidence scores above 80%.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
