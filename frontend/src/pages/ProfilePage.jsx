import { Save, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const phonePattern = /^\d{10}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(user);
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!user) return;
    setProfile(user);
    api.get('/users/profile').then(({ data }) => setProfile(data)).catch(() => {});
  }, [user]);

  const updateProfile = async (event) => {
    event.preventDefault();
    setMessage('');
    setFieldErrors({});

    if (!emailPattern.test(profile?.email || '')) {
      setFieldErrors({ email: 'Enter a valid email address.' });
      return;
    }

    if (!phonePattern.test(profile?.phone || '')) {
      setFieldErrors({ phone: 'Phone number must contain exactly 10 digits.' });
      return;
    }

    try {
      const { data } = await api.put('/users/profile', { name: profile.name, email: profile.email, phone: profile.phone, profileImage: profile.profileImage });
      setProfile(data);
      updateUser(data);
      setMessage('Profile updated successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not update profile.');
    }
  };

  if (!user) return <p className="rounded-lg bg-white p-6 shadow-sm">Please login to view your profile.</p>;

  return (
    <section className="mx-auto h-fit max-w-md rounded-lg bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        {profile?.profileImage ? (
          <img src={profile.profileImage} alt={profile.name || 'Profile'} className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <span className="grid h-12 w-12 place-items-center rounded-full bg-limewash text-leaf"><User className="h-6 w-6" /></span>
        )}
        <div>
          <h1 className="text-2xl font-black">Profile</h1>
          <p className="text-sm text-slate-500">{profile?.email}</p>
        </div>
      </div>
      <form onSubmit={updateProfile} className="mt-5 space-y-3">
        <input className="w-full rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" value={profile?.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        <input type="email" className="w-full rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf" value={profile?.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
        {fieldErrors.email && <p className="text-sm font-semibold text-red-600">{fieldErrors.email}</p>}
        <input
          inputMode="numeric"
          maxLength={10}
          className="w-full rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf"
          value={profile?.phone || ''}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value.replace(/\D/g, '') })}
        />
        {fieldErrors.phone && <p className="text-sm font-semibold text-red-600">{fieldErrors.phone}</p>}
        <input
          type="url"
          className="w-full rounded-md border border-slate-200 px-3 py-3 outline-none focus:border-leaf"
          value={profile?.profileImage || ''}
          onChange={(e) => setProfile({ ...profile, profileImage: e.target.value })}
          placeholder="Profile image URL"
        />
        <button className="flex w-full items-center justify-center gap-2 rounded-md bg-leaf px-4 py-3 font-bold text-white">
          <Save className="h-4 w-4" /> Save profile
        </button>
      </form>
      {message && <p className="mt-3 rounded-lg bg-limewash p-3 text-sm font-bold text-leaf">{message}</p>}
    </section>
  );
};

export default ProfilePage;
