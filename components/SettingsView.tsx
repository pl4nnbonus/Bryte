
import React, { useState } from 'react';
import { User, ShieldCheck, Folder, Bell, LogOut, ChevronRight, Trash2, AlertTriangle, Edit2, Moon, Database, Smartphone, Mic, Lock, Camera, AtSign } from 'lucide-react';
import { clsx } from 'clsx';

interface SettingsViewProps {
  brytetag: string;
  isVerified: boolean;
  userAvatar?: string;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ brytetag, isVerified, userAvatar, onLogout }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteAccount = () => {
      onLogout(); // Clears local storage and reloads
  };

  return (
    <div className="flex flex-col h-full bg-black text-white px-4 pt-6 pb-24 overflow-y-auto no-scrollbar">
      <h1 className="text-3xl font-black mb-8">Settings</h1>

      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-8 bg-[#1a1a1a] p-4 rounded-2xl border border-gray-800 relative overflow-hidden group">
          <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl text-black overflow-hidden bg-gradient-to-tr from-bryte-accent to-blue-500">
              {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" /> : (brytetag[1]?.toUpperCase() || 'B')}
          </div>
          <div className="flex-1">
              <h2 className="font-bold text-lg">{brytetag}</h2>
              <div className="flex items-center gap-2 mt-1">
                  {isVerified ? (
                      <span className="text-green-500 text-xs font-bold flex items-center gap-1"><ShieldCheck size={12} /> Verified Identity</span>
                  ) : (
                      <span className="text-red-500 text-xs font-bold flex items-center gap-1">Unverified</span>
                  )}
              </div>
          </div>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition">
              <Edit2 size={16} />
          </button>
      </div>

      <div className="space-y-6">
          {/* Profile Settings (Enhanced) */}
          <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Manage Profile</h3>
              <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-800">
                  <div className="p-4 flex items-center justify-between border-b border-gray-800 hover:bg-white/5 cursor-pointer">
                      <div className="flex items-center gap-3">
                          <Camera size={20} className="text-bryte-accent" />
                          <div>
                              <span className="font-medium block text-sm">Change Profile Picture</span>
                              <span className="text-[10px] text-gray-500">Update your public avatar</span>
                          </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-600" />
                  </div>
                   <div className="p-4 flex items-center justify-between border-b border-gray-800 hover:bg-white/5 cursor-pointer">
                      <div className="flex items-center gap-3">
                          <AtSign size={20} className="text-gray-400" />
                          <div>
                              <span className="font-medium block text-sm">Personal Details</span>
                              <span className="text-[10px] text-gray-500">Name, Bio, and Links</span>
                          </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-600" />
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer">
                      <div className="flex items-center gap-3">
                          <Lock size={20} className="text-gray-400" />
                          <span className="font-medium text-sm">Privacy & Security</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-600" />
                  </div>
              </div>
          </section>

          {/* Useful Settings */}
          <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">General</h3>
              <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-800">
                  <div className="p-4 flex items-center justify-between border-b border-gray-800">
                      <div className="flex items-center gap-3">
                          <Moon size={20} className="text-gray-400" />
                          <span className="font-medium">Dark Mode</span>
                      </div>
                      <input type="checkbox" className="w-5 h-5 accent-bryte-accent" defaultChecked disabled />
                  </div>
                  <div className="p-4 flex items-center justify-between border-b border-gray-800">
                      <div className="flex items-center gap-3">
                          <Database size={20} className="text-gray-400" />
                          <span className="font-medium">Data Saver</span>
                      </div>
                      <input type="checkbox" className="w-5 h-5 accent-bryte-accent" />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <Smartphone size={20} className="text-gray-400" />
                          <span className="font-medium">FaceID Login</span>
                      </div>
                      <input type="checkbox" className="w-5 h-5 accent-bryte-accent" defaultChecked />
                  </div>
              </div>
          </section>

          <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Studio Preferences</h3>
              <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-800">
                  <div className="p-4 flex items-center justify-between border-b border-gray-800">
                      <div className="flex items-center gap-3">
                          <Folder size={20} className="text-gray-400" />
                          <div className="flex flex-col">
                              <span className="font-medium">Scan Unzipped Folders</span>
                              <span className="text-xs text-gray-500">Auto-import drum kits</span>
                          </div>
                      </div>
                      <input type="checkbox" className="w-5 h-5 accent-bryte-accent" defaultChecked />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <Mic size={20} className="text-gray-400" />
                          <span className="font-medium">High Quality Audio</span>
                      </div>
                      <input type="checkbox" className="w-5 h-5 accent-bryte-accent" defaultChecked />
                  </div>
              </div>
          </section>

          <button 
            onClick={onLogout}
            className="w-full bg-[#1a1a1a] text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500/10 transition mt-4"
          >
              <LogOut size={20} /> Sign Out
          </button>
          
          {/* Delete Account Section */}
          <div className="mt-8 pt-8 border-t border-gray-900">
              <h3 className="text-xs font-bold text-red-900/50 uppercase tracking-widest mb-3 px-1">Danger Zone</h3>
              {!confirmDelete ? (
                  <button 
                    onClick={() => setConfirmDelete(true)}
                    className="w-full bg-red-900/10 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-900/20 transition"
                  >
                      <Trash2 size={20} /> Delete Account
                  </button>
              ) : (
                  <div className="bg-red-900/10 border border-red-900/30 rounded-2xl p-4 animate-in fade-in zoom-in duration-200">
                      <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
                          <AlertTriangle size={24} />
                          <h4 className="font-bold">Are you sure?</h4>
                      </div>
                      <p className="text-center text-xs text-gray-400 mb-4">This action cannot be undone. All your data, beats, and earnings will be lost.</p>
                      <div className="flex gap-2">
                          <button 
                            onClick={() => setConfirmDelete(false)}
                            className="flex-1 bg-transparent border border-gray-700 text-gray-300 py-3 rounded-xl font-bold"
                          >
                              Cancel
                          </button>
                          <button 
                            onClick={handleDeleteAccount}
                            className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700"
                          >
                              Confirm Delete
                          </button>
                      </div>
                  </div>
              )}
          </div>

          <p className="text-center text-xs text-gray-600 pb-4 pt-4">Bryte OS v1.1.0 • Build 2024.10.27</p>
      </div>
    </div>
  );
};
