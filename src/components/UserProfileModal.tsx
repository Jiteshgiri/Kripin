import { changePin } from "./PinLock";
import React, { useState, useRef } from 'react';
import { X, User, Phone, Briefcase, Hash, RefreshCw, CheckCircle, Camera, Trash2, Upload } from 'lucide-react';
import { UserProfile } from '../types';
import { sendProfileToWebhook } from '../utils/telemetry';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  isDarkMode?: boolean;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  isDarkMode = true,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [mobile, setMobile] = useState(userProfile.mobile);
  const [occupation, setOccupation] = useState(userProfile.occupation);
  const [userId, setUserId] = useState(userProfile.userId || `JT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatarUrl || '');
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleRegenerateId = () => {
    const newId = `JT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setUserId(newId);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size is too large. Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  const updatedProfile: UserProfile = {
    name: name.trim(),
    mobile: mobile.trim(),
    occupation: occupation.trim(),
    userId: userId.trim() || `KR-${Math.floor(100000 + Math.random() * 900000)}`,
    avatarUrl,
  };

  onSaveProfile(updatedProfile);
  sendProfileToWebhook(updatedProfile);
  onClose();
};

  const handleChangePin = () => {
  if (newPin !== confirmPin) {
    setPinMessage("New PIN and Confirm PIN do not match.");
    return;
  }

  const result = changePin(currentPin, newPin);
  setPinMessage(result.message);

  if (result.success) {
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md max-h-[88vh] overflow-y-auto rounded-3xl border shadow-2xl p-4 sm:p-6 transition-all ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">User Profile Settings</h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Personal details & Profile photo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Profile Photo Upload Section */}
          <div className="flex flex-col items-center justify-center pt-1 pb-2">
            <div className="relative group">
              <div
                className={`w-20 h-20 rounded-full border-2 overflow-hidden flex items-center justify-center shadow-md transition-all ${
                  isDarkMode ? 'bg-slate-800 border-emerald-500/50' : 'bg-slate-100 border-emerald-500'
                }`}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl font-bold">
                    {name ? name.charAt(0).toUpperCase() : 'J'}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-400 transition-transform active:scale-95"
                title="Upload Profile Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Upload className="w-3 h-3 text-emerald-500" />
                <span>Upload Photo</span>
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                    isDarkMode
                      ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                      : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                  }`}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>

          {/* User ID (Auto-generated & Regenerative) */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Member / User ID (Auto-Generated)
            </label>
            <div className="flex items-center gap-2">
              <div
                className={`flex-1 flex items-center gap-2 px-3.5 py-2 rounded-xl border font-mono text-sm font-bold ${
                  isDarkMode
                    ? 'bg-slate-950/80 border-slate-800 text-emerald-400'
                    : 'bg-slate-100 border-slate-200 text-emerald-600'
                }`}
              >
                <Hash className="w-4 h-4 shrink-0 text-emerald-500" />
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="bg-transparent border-none outline-none w-full"
                  placeholder="e.g. JT-2026-8849"
                />
              </div>
              <button
                type="button"
                onClick={handleRegenerateId}
                className={`p-2 rounded-xl border flex items-center justify-center transition-colors ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                }`}
                title="Generate New Unique ID"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Full Name
            </label>
            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-800 text-white focus-within:border-emerald-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus-within:border-emerald-500'
              }`}
            >
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="bg-transparent border-none outline-none w-full"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Mobile Number
            </label>
            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-800 text-white focus-within:border-emerald-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus-within:border-emerald-500'
              }`}
            >
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 9876543210"
                required
                className="bg-transparent border-none outline-none w-full"
              />
            </div>
          </div>

          {/* Occupation / User Type */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Occupation / User Type
            </label>
            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-800 text-white focus-within:border-emerald-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus-within:border-emerald-500'
              }`}
            >
              <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm cursor-pointer"
              >
                <option value="Student" className={isDarkMode ? 'bg-slate-900' : ''}>Student</option>
                <option value="Job Person / Working Professional" className={isDarkMode ? 'bg-slate-900' : ''}>
                  Job Person / Working Professional
                </option>
                <option value="Business / Entrepreneur" className={isDarkMode ? 'bg-slate-900' : ''}>
                  Business / Entrepreneur
                </option>
                <option value="Freelancer / Self-Employed" className={isDarkMode ? 'bg-slate-900' : ''}>
                  Freelancer / Self-Employed
                </option>
                <option value="Other" className={isDarkMode ? 'bg-slate-900' : ''}>Other</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-3">🔐 Change PIN</h3>
            <input
            type="password"
            maxLength={4}
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value)}
            placeholder="Current PIN"
            className="w-full mb-2 px-3 py-2 rounded-lg border"
            />
            <input
            type="password"
            maxLength={4}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="New PIN"
            className="w-full mb-2 px-3 py-2 rounded-lg border"
            />
            <input
            type="password"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            placeholder="Confirm New PIN"
            className="w-full mb-3 px-3 py-2 rounded-lg border"
            />
            
            <button
            type="button"
            onClick={handleChangePin}
            className="w-full bg-emerald-500 text-white py-2 rounded-lg">Change PIN</button>
            {pinMessage && (
              <p className="text-sm mt-2 text-center">
                {pinMessage}
                </p>
              )}
              </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
