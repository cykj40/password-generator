import { PasswordRequirements, DEFAULT_REQUIREMENTS } from '@/utils/passwordValidation';

interface Props {
    requirements: PasswordRequirements;
    onChange: (requirements: PasswordRequirements) => void;
}

export default function PasswordRequirementsConfig({ requirements, onChange }: Props) {
    const handleChange = (field: keyof PasswordRequirements, value: number | boolean) => {
        onChange({
            ...requirements,
            [field]: value
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="flex items-center justify-between text-sm text-gray-200">
                    <span>Minimum Length: {requirements.minLength}</span>
                    <input
                        type="range"
                        min="8"
                        max="128"
                        value={requirements.minLength}
                        onChange={(e) => handleChange('minLength', parseInt(e.target.value))}
                        className="w-1/2 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                </label>
            </div>

            <div>
                <label className="flex items-center justify-between text-sm text-gray-200">
                    <span>Minimum Strength: {requirements.minStrength}/4</span>
                    <input
                        type="range"
                        min="0"
                        max="4"
                        value={requirements.minStrength}
                        onChange={(e) => handleChange('minStrength', parseInt(e.target.value))}
                        className="w-1/2 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={requirements.requireLowercase}
                        onChange={(e) => handleChange('requireLowercase', e.target.checked)}
                        className="rounded border-gray-600 bg-gray-700/50 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-300">Require Lowercase</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={requirements.requireUppercase}
                        onChange={(e) => handleChange('requireUppercase', e.target.checked)}
                        className="rounded border-gray-600 bg-gray-700/50 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-300">Require Uppercase</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={requirements.requireNumbers}
                        onChange={(e) => handleChange('requireNumbers', e.target.checked)}
                        className="rounded border-gray-600 bg-gray-700/50 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-300">Require Numbers</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={requirements.requireSpecial}
                        onChange={(e) => handleChange('requireSpecial', e.target.checked)}
                        className="rounded border-gray-600 bg-gray-700/50 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-300">Require Special</span>
                </label>
            </div>
        </div>
    );
} 