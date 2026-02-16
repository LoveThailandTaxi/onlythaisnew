import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Camera, Loader } from 'lucide-react';
import { sendCreatorApplicationEmail } from '../lib/emailService';
import { validateSquareImage } from '../utils/imageValidation';

export default function ProfileSetup() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(profile?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [category, setCategory] = useState(profile?.category || '');
  const [city, setCity] = useState(profile?.city || '');
  const [height, setHeight] = useState(profile?.height || '');
  const [build, setBuild] = useState(profile?.build || '');
  const [hairColour, setHairColour] = useState(profile?.hair_colour || '');
  const [eyeColour, setEyeColour] = useState(profile?.eye_colour || '');
  const [smoke, setSmoke] = useState(profile?.smoke ?? false);
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth || '');
  const [ageConfirmed, setAgeConfirmed] = useState(!!profile?.date_of_birth);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCreator = profile?.user_type === 'creator';

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        setUploading(false);
        return;
      }

      const file = event.target.files[0];

      const validation = await validateSquareImage(file);
      if (!validation.isValid) {
        alert(validation.error);
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      console.log('Uploading to path:', filePath);

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);
      setAvatarUrl(publicUrl);
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    if (isCreator && !category) {
      alert('Please select a category');
      return;
    }

    if (isCreator && !bio.trim()) {
      alert('Please write a bio about yourself');
      return;
    }

    if (isCreator && !city.trim()) {
      alert('Please enter your city');
      return;
    }

    if (isCreator && !avatarUrl) {
      alert('Please upload a profile photo');
      return;
    }

    if (isCreator && !dateOfBirth) {
      alert('Please enter your date of birth');
      return;
    }

    if (isCreator && !ageConfirmed) {
      alert('You must confirm you are 18 years or older');
      return;
    }

    if (isCreator && dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

      if (actualAge < 18) {
        alert('You must be at least 18 years old to create a creator profile');
        return;
      }
    }

    try {
      setSaving(true);

      const updateData: any = {
        display_name: username.trim(),
        avatar_url: avatarUrl || null,
      };

      if (isCreator) {
        updateData.bio = bio.trim() || null;
        updateData.category = category || null;
        updateData.city = city.trim() || null;
        updateData.height = height.trim() || null;
        updateData.build = build || null;
        updateData.hair_colour = hairColour.trim() || null;
        updateData.eye_colour = eyeColour.trim() || null;
        updateData.smoke = smoke;
        updateData.date_of_birth = dateOfBirth || null;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user?.id);

      if (error) throw error;

      if (isCreator && !profile?.display_name) {
        sendCreatorApplicationEmail(user?.email || '', username.trim()).catch(err =>
          console.error('Failed to send creator application email:', err)
        );
      }

      await refreshProfile();
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-400">
              {isCreator ? 'Tell us about yourself to attract the right connections' : 'Add a username and photo to get started'}
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div
                  className="w-32 h-32 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#FF1493] transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-600" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Loader className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-[#FF1493] rounded-full flex items-center justify-center hover:bg-[#FF1493]/80 transition-colors"
                  disabled={uploading}
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
              <p className="text-sm text-gray-400 text-center">
                Click to upload a square profile photo{isCreator && <span className="text-red-400"> *</span>}
                <br />
                <span className="text-xs text-gray-500">Image must be 1:1 aspect ratio</span>
              </p>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username <span className="text-red-400">*</span>
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493]"
                required
              />
            </div>

            {isCreator && (
              <>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#FF1493]"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="dating">Dating</option>
                    <option value="content_creator">Content Creator</option>
                    <option value="escort">Escort</option>
                    <option value="ladyboy">Ladyboy</option>
                    <option value="massage">Massage</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                    Bio <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493] resize-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Bangkok, Phuket, Chiang Mai"
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-300 mb-2">
                    Date of Birth <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#FF1493]"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">You must be 18 or older. Your date of birth is private and not publicly visible.</p>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    id="ageConfirm"
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="w-5 h-5 mt-0.5 bg-[#0A0A0A] border-2 border-gray-700 rounded focus:ring-2 focus:ring-[#FF1493] text-[#FF1493]"
                    required
                  />
                  <label htmlFor="ageConfirm" className="text-sm text-gray-300 leading-tight">
                    I confirm that I am 18 years of age or older <span className="text-red-400">*</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-300 mb-2">
                      Height
                    </label>
                    <input
                      id="height"
                      type="text"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="e.g., 165 cm"
                      className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493]"
                    />
                  </div>

                  <div>
                    <label htmlFor="build" className="block text-sm font-medium text-gray-300 mb-2">
                      Build
                    </label>
                    <select
                      id="build"
                      value={build}
                      onChange={(e) => setBuild(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#FF1493]"
                    >
                      <option value="">Select</option>
                      <option value="Slim">Slim</option>
                      <option value="Medium">Medium</option>
                      <option value="Curvy">Curvy</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="hairColour" className="block text-sm font-medium text-gray-300 mb-2">
                      Hair Color
                    </label>
                    <input
                      id="hairColour"
                      type="text"
                      value={hairColour}
                      onChange={(e) => setHairColour(e.target.value)}
                      placeholder="e.g., Black"
                      className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493]"
                    />
                  </div>

                  <div>
                    <label htmlFor="eyeColour" className="block text-sm font-medium text-gray-300 mb-2">
                      Eye Color
                    </label>
                    <input
                      id="eyeColour"
                      type="text"
                      value={eyeColour}
                      onChange={(e) => setEyeColour(e.target.value)}
                      placeholder="e.g., Brown"
                      className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF1493]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="smoke"
                    type="checkbox"
                    checked={smoke}
                    onChange={(e) => setSmoke(e.target.checked)}
                    className="w-5 h-5 bg-[#0A0A0A] border-2 border-gray-700 rounded focus:ring-2 focus:ring-[#FF1493] text-[#FF1493]"
                  />
                  <label htmlFor="smoke" className="text-sm font-medium text-gray-300">
                    I smoke
                  </label>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={
                saving ||
                uploading ||
                !username.trim() ||
                (isCreator && (!category || !bio.trim() || !city.trim() || !avatarUrl || !dateOfBirth || !ageConfirmed))
              }
              className="w-full py-3 bg-[#FF1493] text-white rounded-lg hover:bg-[#FF1493]/80 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
