import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Delete, ShieldAlert } from 'lucide-react';

interface PasscodeLockProps {
  correctPin: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PasscodeLock({ correctPin, onSuccess, onCancel }: PasscodeLockProps) {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const handleNumberClick = (num: number) => {
    if (pin.length >= 4) return;
    setError(false);
    const newPin = pin + num;
    setPin(newPin);

    if (newPin.length === 4) {
      if (newPin === correctPin) {
        // Success animation or trigger success immediately
        setTimeout(() => {
          onSuccess();
        }, 150);
      } else {
        setTimeout(() => {
          setError(true);
          setPin('');
        }, 200);
      }
    }
  };

  const handleDelete = () => {
    setError(false);
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-800"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Lock className="h-6 w-6" id="lock-icon" />
          </div>
          
          <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
            Teacher Authentication
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter PIN to access Teacher Mode and modify records.
          </p>
          <p className="mt-1 text-xs text-emerald-600 font-mono font-medium dark:text-emerald-400">
            Default PIN: {correctPin === '1234' ? '1234' : '••••'}
          </p>

          {/* Pin Dots */}
          <div className="mt-6 flex gap-4 justify-center">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`h-4 w-4 rounded-full transition-all duration-150 ${
                  error 
                    ? 'bg-rose-500 animate-bounce' 
                    : index < pin.length 
                      ? 'bg-emerald-600 scale-110 dark:bg-emerald-400' 
                      : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-rose-500"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Incorrect PIN. Please try again.</span>
            </motion.div>
          )}

          {/* Numpad Grid */}
          <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-[280px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumberClick(num)}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-xl font-semibold text-gray-800 transition-colors hover:bg-gray-100 active:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:active:bg-gray-500 cursor-pointer"
              >
                {num}
              </button>
            ))}
            
            {/* Cancel Button */}
            <button
              type="button"
              onClick={onCancel}
              className="flex h-16 w-16 items-center justify-center rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            
            {/* Zero */}
            <button
              type="button"
              onClick={() => handleNumberClick(0)}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-xl font-semibold text-gray-800 transition-colors hover:bg-gray-100 active:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:active:bg-gray-500 cursor-pointer"
            >
              0
            </button>
            
            {/* Delete Button */}
            <button
              type="button"
              onClick={handleDelete}
              className="flex h-16 w-16 items-center justify-center rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 dark:active:bg-gray-600 cursor-pointer"
            >
              <Delete className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
