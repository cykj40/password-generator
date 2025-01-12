'use client';

import { useEffect, useState } from 'react';
import zxcvbn from 'zxcvbn';

interface StrengthResult {
    score: number;
    entropy: number;
    crackTime: string;
    feedback: {
        warning: string;
        suggestions: string[];
    };
}

export default function PasswordStrengthMeter({ password }: { password: string }) {
    const [strength, setStrength] = useState<StrengthResult | null>(null);

    useEffect(() => {
        if (password) {
            const result = zxcvbn(password);
            setStrength({
                score: result.score,
                entropy: result.guesses_log10,
                crackTime: result.crack_times_display.offline_fast_hashing_1e10_per_second.toString(),
                feedback: result.feedback
            });
        } else {
            setStrength(null);
        }
    }, [password]);

    if (!strength || !password) {
        return null;
    }

    const getStrengthLabel = (score: number): string => {
        switch (score) {
            case 0: return 'Very Weak';
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Strong';
            case 4: return 'Very Strong';
            default: return 'Unknown';
        }
    };

    const getStrengthColor = (score: number): string => {
        switch (score) {
            case 0: return 'text-red-500';
            case 1: return 'text-orange-500';
            case 2: return 'text-yellow-500';
            case 3: return 'text-lime-500';
            case 4: return 'text-green-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="mt-2 space-y-2">
            {/* Progress bars */}
            <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                    <div
                        key={level}
                        className={`h-1 flex-1 rounded-full ${level <= strength.score
                            ? level === strength.score
                                ? getStrengthColor(level).replace('text-', 'bg-')
                                : 'bg-gray-400'
                            : 'bg-gray-700'
                            }`}
                    />
                ))}
            </div>

            {/* Strength label */}
            <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${getStrengthColor(strength.score)}`}>
                    {getStrengthLabel(strength.score)}
                </span>
                <span className="text-gray-400">
                    Crack time: {strength.crackTime}
                </span>
            </div>

            {/* Feedback */}
            {(strength.feedback.warning || strength.feedback.suggestions.length > 0) && (
                <div className="text-sm space-y-1">
                    {strength.feedback.warning && (
                        <p className="text-yellow-500">{strength.feedback.warning}</p>
                    )}
                    {strength.feedback.suggestions.length > 0 && (
                        <ul className="text-gray-400 list-disc list-inside">
                            {strength.feedback.suggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
} 