import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Download, Upload, Trash2, ShieldAlert, Sparkles, AlertCircle, FileJson, CheckCircle } from 'lucide-react';
import { AppSettings, TeacherPinConfig, DatabaseState } from '../types';
import { downloadJSONBackup } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  pinConfig: TeacherPinConfig;
  dbState: DatabaseState;
  onSaveSettings: (settings: AppSettings) => void;
  onSavePinConfig: (pinConfig: TeacherPinConfig) => void;
  onImportBackup: (importedState: DatabaseState) => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  pinConfig,
  dbState,
  onSaveSettings,
  onSavePinConfig,
  onImportBackup,
  onResetSampleData,
  onClearAllData,
}: SettingsModalProps) {
  // Local state copy
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });
  const [localPin, setLocalPin] = useState<TeacherPinConfig>({ ...pinConfig });
  const [pinInput, setPinInput] = useState<string>(pinConfig.pin);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Validate PIN
    if (localPin.isEnabled) {
      if (!/^\d{4}$/.test(pinInput)) {
        setErrorMsg('Security PIN must be exactly 4 numeric digits.');
        return;
      }
    }

    onSaveSettings(localSettings);
    onSavePinConfig({
      ...localPin,
      pin: pinInput
    });

    setSuccessMsg('Settings saved successfully!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Basic schema validation
        if (
          parsed && 
          Array.isArray(parsed.classes) && 
          Array.isArray(parsed.students) && 
          Array.isArray(parsed.attendance)
        ) {
          onImportBackup(parsed);
          setSuccessMsg('Backup imported successfully!');
          setTimeout(() => setSuccessMsg(''), 2000);
        } else {
          setErrorMsg('Invalid backup file. The required data schema is missing.');
        }
      } catch (err) {
        setErrorMsg('Failed to parse file. Ensure it is a valid JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  const triggerImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="flex h-full max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden dark:bg-gray-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
          <div>
            <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">
              System Settings & Data Control
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Manage database rules, security PINs, and backup archives.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* School & Academic Context */}
            <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
              <h3 className="font-display text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                School Profile
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    School / Institution Name
                  </label>
                  <input
                    type="text"
                    value={localSettings.schoolName}
                    onChange={(e) => setLocalSettings({ ...localSettings, schoolName: e.target.value })}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={localSettings.academicYear}
                    onChange={(e) => setLocalSettings({ ...localSettings, academicYear: e.target.value })}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="e.g., 2026-2027"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Minimum Attendance Requirement (%)
                  </label>
                  <div className="mt-1 flex items-center gap-3">
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={localSettings.minAttendancePercent}
                      onChange={(e) => setLocalSettings({ ...localSettings, minAttendancePercent: parseInt(e.target.value) || 75 })}
                      required
                      className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Students falling below this line are flagged for low attendance alerts (standard is 75%).
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* PIN Lock Security */}
            <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                    PIN Protection
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Secure Teacher Mode to prevent unauthorized modifications.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localPin.isEnabled}
                    onChange={(e) => setLocalPin({ ...localPin, isEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {localPin.isEnabled && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Teacher Security PIN (4 Digits)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      required={localPin.isEnabled}
                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-mono tracking-widest focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      placeholder="e.g., 1234"
                    />
                  </div>
                  <div className="flex items-center rounded-lg border border-yellow-100 bg-yellow-50/30 p-3 text-xs text-yellow-800 dark:border-yellow-900/30 dark:bg-yellow-950/20 dark:text-yellow-400">
                    <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
                    <span>Make sure you remember this PIN. It is required whenever you swap into Teacher View.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Backup & System Data Controls */}
            <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
              <h3 className="font-display text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                Backup, Restore & Reset
              </h3>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => downloadJSONBackup(dbState)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Backup File (.json)</span>
                </button>

                <button
                  type="button"
                  onClick={triggerImportClick}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Import Backup File (.json)</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json"
                  className="hidden"
                />
              </div>

              {/* Dangerous Reset Controls */}
              <div className="border-t border-gray-200/50 pt-4 dark:border-gray-700/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Reset Options
                    </h4>
                    <p className="text-xxs text-gray-500 dark:text-gray-400">
                      Restore default curriculum/students, or wipe clean for active enrollment.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    
                    {/* Reset Sample Button */}
                    {!showResetConfirm ? (
                      <button
                        type="button"
                        onClick={() => { setShowResetConfirm(true); setShowClearConfirm(false); }}
                        className="flex items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Reload Sample Data</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xxs font-semibold text-rose-500">Overwrite changes?</span>
                        <button
                          type="button"
                          onClick={() => { onResetSampleData(); setShowResetConfirm(false); }}
                          className="rounded bg-emerald-600 px-2.5 py-1 text-xxs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowResetConfirm(false)}
                          className="rounded border border-gray-200 bg-white px-2.5 py-1 text-xxs font-semibold text-gray-500 hover:bg-gray-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Clear All Button */}
                    {!showClearConfirm ? (
                      <button
                        type="button"
                        onClick={() => { setShowClearConfirm(true); setShowResetConfirm(false); }}
                        className="flex items-center gap-1 rounded-lg border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Reset Empty</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xxs font-semibold text-rose-500">Wipe all student lists?</span>
                        <button
                          type="button"
                          onClick={() => { onClearAllData(); setShowClearConfirm(false); }}
                          className="rounded bg-rose-600 px-2.5 py-1 text-xxs font-bold text-white hover:bg-rose-700 cursor-pointer"
                        >
                          Confirm Wipe
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowClearConfirm(false)}
                          className="rounded border border-gray-200 bg-white px-2.5 py-1 text-xxs font-semibold text-gray-500 hover:bg-gray-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>

            {/* Error/Success banners */}
            <AnimatePresence>
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400"
                >
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-800 dark:bg-rose-950/20 dark:text-rose-400"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-md shadow-emerald-600/10 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>

          </form>
        </div>
      </motion.div>
    </div>
  );
}
