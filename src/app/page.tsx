'use client';

import { useState } from 'react';
import { ClipboardDocumentIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import zxcvbn from 'zxcvbn';

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useUppercase, setUseUppercase] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);

  const generatePassword = () => {
    let charset = '';
    if (useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeSimilar) {
      charset = charset.replace(/[ilLI|`1oO0]/g, '');
    }

    if (excludeAmbiguous) {
      charset = charset.replace(/[{}[\]()\/\\'"~,;:.<>]/g, '');
    }

    let newPassword = '';
    const charArray = charset.split('');

    // Ensure at least one character from each selected type
    if (useLowercase) newPassword += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    if (useUppercase) newPassword += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    if (useNumbers) newPassword += '0123456789'[Math.floor(Math.random() * 10)];
    if (useSymbols) newPassword += '!@#$%^&*()_+-='[Math.floor(Math.random() * 14)];

    while (newPassword.length < length) {
      newPassword += charArray[Math.floor(Math.random() * charArray.length)];
    }

    newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('');
    setPassword(newPassword);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast.success('Password copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy password');
      console.error('Failed to copy password:', err);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { score: 0, color: 'bg-gray-200' };
    const result = zxcvbn(password);
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-blue-500',
      'bg-green-500'
    ];
    return { score: result.score, color: colors[result.score] };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Password Generator</h1>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          {/* Password Display */}
          <div className="bg-gray-900 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type or generate a password"
                className="font-mono text-xl bg-transparent flex-1 outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Copy to clipboard"
                  disabled={!password}
                >
                  <ClipboardDocumentIcon className="w-5 h-5" opacity={password ? 1 : 0.5} />
                </button>
                <button
                  onClick={generatePassword}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Generate new password"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-4 space-y-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded-full transition-all duration-300 ${level <= getPasswordStrength().score
                        ? getPasswordStrength().color
                        : 'bg-gray-700'
                        }`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${getPasswordStrength().color.replace('bg-', 'text-')}`}>
                    {['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][getPasswordStrength().score]}
                  </p>
                  <p className="text-sm text-gray-400">
                    {password.length} characters
                  </p>
                </div>
                {getPasswordStrength().score < 3 && (
                  <p className="text-sm text-yellow-500">
                    Tip: Use a mix of uppercase, lowercase, numbers, and symbols for a stronger password
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Generator Options */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Password Length: {length}</label>
              <input
                type="range"
                min="8"
                max="32"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useUppercase}
                  onChange={(e) => setUseUppercase(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600"
                />
                <span>Uppercase Letters</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useLowercase}
                  onChange={(e) => setUseLowercase(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600"
                />
                <span>Lowercase Letters</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useNumbers}
                  onChange={(e) => setUseNumbers(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600"
                />
                <span>Numbers</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useSymbols}
                  onChange={(e) => setUseSymbols(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600"
                />
                <span>Symbols</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={excludeSimilar}
                  onChange={(e) => setExcludeSimilar(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600"
                />
                <span>Exclude Similar (i, l, 1, L, o, 0, O)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={excludeAmbiguous}
                  onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600"
                />
                <span>Exclude Ambiguous ({`{ } [ ] ( ) / \ ' " ~ , ; : . < >`})</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
