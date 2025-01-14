import { useState } from 'react';

interface Props {
    defaultDays: number;
    onExpirationChange: (days: number) => void;
}

const PRESET_PERIODS = [
    { label: '30 days', value: 30 },
    { label: '60 days', value: 60 },
    { label: '90 days', value: 90 },
    { label: '180 days', value: 180 },
    { label: '1 year', value: 365 },
];

export default function ExpirationConfig({ defaultDays, onExpirationChange }: Props) {
    const [customDays, setCustomDays] = useState<number | ''>(defaultDays);

    const handleCustomChange = (value: string) => {
        const days = parseInt(value);
        if (!isNaN(days) && days > 0) {
            setCustomDays(days);
            onExpirationChange(days);
        } else {
            setCustomDays('');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {PRESET_PERIODS.map(({ label, value }) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => {
                            setCustomDays(value);
                            onExpirationChange(value);
                        }}
                        className={`px-3 py-1 text-sm rounded-full border ${value === customDays
                                ? 'bg-indigo-500 border-indigo-400 text-white'
                                : 'border-gray-600 text-gray-300 hover:border-indigo-400'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="number"
                    min="1"
                    value={customDays}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    className="w-20 px-2 py-1 text-sm bg-gray-700/50 border border-gray-600 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Custom"
                />
                <span className="text-sm text-gray-400">days</span>
            </div>
        </div>
    );
} 