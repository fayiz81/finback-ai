import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Upload, MapPin, Calendar, Search, Filter, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useItems } from '@/hooks/useItems';
import { ROUTE_PATHS, ITEM_CATEGORIES } from '@/lib/index';
import { springPresets } from '@/lib/motion';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: authError } = await signIn(email, password);
      if (authError) {
        setError(authError.message || 'Login failed. Please check your credentials.');
      } else {
        navigate(ROUTE_PATHS.DASHBOARD);
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.gentle}
    >
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-sm font-medium">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="login-email"
            type="email"
            placeholder="student@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-background/50 border-border/60 focus:border-primary/60 focus:bg-background transition-all"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password" className="text-sm font-medium">
            Password
          </Label>
          <span className="text-xs text-primary cursor-pointer hover:underline underline-offset-2 transition-colors">
            Forgot password?
          </span>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 bg-background/50 border-border/60 focus:border-primary/60 focus:bg-background transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      <Button
        type="submit"
        className="w-full font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Signing in...
          </span>
        ) : 'Sign In →'}
      </Button>

      <div className="text-center text-xs text-muted-foreground bg-muted/30 rounded-lg px-4 py-2.5">
        Demo: <span className="text-foreground/70 font-medium">admin@finback.ai</span> or <span className="text-foreground/70 font-medium">user@college.edu</span> (any password)
      </div>
    </motion.form>
  );
}

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: authError } = await signUp(email, password, name);

      if (!authError && data?.user) {
        // Some Supabase setups require email confirmation — handle both cases
        if (!data.session) {
          setSuccess('Account created! Please check your email to confirm before logging in.');
        } else {
          navigate(ROUTE_PATHS.DASHBOARD);
        }
      } else {
        setError(authError?.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      // Always resets loading
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.gentle}
    >
      <div className="space-y-2">
        <Label htmlFor="register-name" className="text-sm font-medium">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-name"
            type="text"
            placeholder="John Student"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-10 bg-background/50 border-border/60 focus:border-primary/60 focus:bg-background transition-all"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email" className="text-sm font-medium">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-email"
            type="email"
            placeholder="student@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-background/50 border-border/60 focus:border-primary/60 focus:bg-background transition-all"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password" className="text-sm font-medium">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 bg-background/50 border-border/60 focus:border-primary/60 focus:bg-background transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-confirm" className="text-sm font-medium">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-confirm"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10 pr-10 bg-background/50 border-border/60 focus:border-primary/60 focus:bg-background transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-green-500 bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-lg"
        >
          {success}
        </motion.div>
      )}

      <Button
        type="submit"
        className="w-full font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating account...
          </span>
        ) : 'Create Account →'}
      </Button>
    </motion.form>
  );
}

interface ItemFormProps {
  type: 'lost' | 'found';
  onSubmit: (data: any) => void;
}

export function ItemForm({ type, onSubmit }: ItemFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [locationName, setLocationName] = useState('');
  const [date, setDate] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getCurrentLocation } = useItems();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    } catch (error) {
      alert('Unable to get location. Please enter manually.');
    }
    setIsGettingLocation(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      alert('Please select a category');
      return;
    }

    const formData = {
      title,
      description,
      category: category as typeof ITEM_CATEGORIES[number],
      imageFile: imageFile || undefined,
      location: {
        name: locationName,
        lat: coordinates?.lat || 0,
        lng: coordinates?.lng || 0,
      },
      date: date ? new Date(date) : new Date(),
    };

    onSubmit(formData);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.gentle}
    >
      <div className="space-y-2">
        <Label htmlFor="item-title" className="text-sm font-medium">Item Title</Label>
        <Input
          id="item-title"
          type="text"
          placeholder={type === 'lost' ? 'e.g., Black iPhone 15 Pro' : 'e.g., Found Black iPhone'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="item-description" className="text-sm font-medium">Description</Label>
        <Textarea
          id="item-description"
          placeholder="Provide detailed description including color, brand, distinctive features..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="item-category" className="text-sm font-medium">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="item-category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {ITEM_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Item Image</Label>
        <div className="space-y-4">
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload image or drag and drop</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="item-location" className="text-sm font-medium">Location</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="item-location"
              type="text"
              placeholder="Library, Main Building, etc."
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="pl-10"
              required
            />
          </div>
          <Button type="button" variant="outline" onClick={handleGetLocation} disabled={isGettingLocation}>
            {isGettingLocation ? 'Getting...' : 'Use GPS'}
          </Button>
        </div>
        {coordinates && (
          <p className="text-xs text-muted-foreground">
            Coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="item-date" className="text-sm font-medium">
          {type === 'lost' ? 'Date Lost' : 'Date Found'}
        </Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="item-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="pl-10"
            max={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Submit {type === 'lost' ? 'Lost' : 'Found'} Item
      </Button>
    </motion.form>
  );
}

interface FilterFormProps {
  onFilter: (filters: any) => void;
}

export function FilterForm({ onFilter }: FilterFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [maxDistance, setMaxDistance] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleApplyFilters = () => {
    const filters: any = {};
    if (searchQuery) filters.searchQuery = searchQuery;
    if (category !== 'all') filters.category = category;
    if (maxDistance) filters.maxDistance = parseFloat(maxDistance);
    if (startDate && endDate) {
      filters.dateRange = { start: new Date(startDate), end: new Date(endDate) };
    }
    onFilter(filters);
  };

  const handleReset = () => {
    setSearchQuery('');
    setCategory('all');
    setMaxDistance('');
    setStartDate('');
    setEndDate('');
    onFilter({});
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Hide' : 'Show'}
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="filter-category" className="text-sm font-medium">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="filter-category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {ITEM_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-distance" className="text-sm font-medium">Max Distance (km)</Label>
              <Input
                id="filter-distance"
                type="number"
                placeholder="e.g., 5"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                min="0"
                step="0.1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filter-start" className="text-sm font-medium">Start Date</Label>
                <Input id="filter-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-end" className="text-sm font-medium">End Date</Label>
                <Input id="filter-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleApplyFilters} className="flex-1">Apply Filters</Button>
          <Button variant="outline" onClick={handleReset}>Reset</Button>
        </div>
      </div>
    </Card>
  );
}
