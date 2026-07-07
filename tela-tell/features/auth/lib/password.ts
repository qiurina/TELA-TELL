export type PasswordRequirementKey =
  | 'length'
  | 'uppercase'
  | 'lowercase'
  | 'number'
  | 'special';

export type PasswordRequirement = {
  key: PasswordRequirementKey;
  label: string;
  met: boolean;
};

export type PasswordStrength = 'too-weak' | 'weak' | 'fair' | 'good' | 'strong';

const SPECIAL_CHAR_PATTERN = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    { key: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { key: 'uppercase', label: 'At least 1 uppercase letter (A–Z)', met: /[A-Z]/.test(password) },
    { key: 'lowercase', label: 'At least 1 lowercase letter (a–z)', met: /[a-z]/.test(password) },
    { key: 'number', label: 'At least 1 number (0–9)', met: /[0-9]/.test(password) },
    {
      key: 'special',
      label: 'At least 1 special character (e.g., ! @ # $ % ^ & *)',
      met: SPECIAL_CHAR_PATTERN.test(password),
    },
  ];
}

export function isPasswordValid(password: string): boolean {
  return getPasswordRequirements(password).every((requirement) => requirement.met);
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return 'too-weak';
  }

  const metCount = getPasswordRequirements(password).filter((requirement) => requirement.met).length;

  if (metCount <= 1) {
    return 'too-weak';
  }
  if (metCount === 2) {
    return 'weak';
  }
  if (metCount === 3) {
    return 'fair';
  }
  if (metCount === 4) {
    return 'good';
  }
  return 'strong';
}

export function getPasswordStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case 'too-weak':
      return 'Too weak';
    case 'weak':
      return 'Weak';
    case 'fair':
      return 'Fair';
    case 'good':
      return 'Good';
    case 'strong':
      return 'Strong';
  }
}

export function getPasswordStrengthProgress(strength: PasswordStrength): number {
  switch (strength) {
    case 'too-weak':
      return 0.2;
    case 'weak':
      return 0.4;
    case 'fair':
      return 0.6;
    case 'good':
      return 0.8;
    case 'strong':
      return 1;
  }
}

export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'too-weak':
      return '#E57373';
    case 'weak':
      return '#FFB74D';
    case 'fair':
      return '#FFD54F';
    case 'good':
      return '#81C784';
    case 'strong':
      return '#4CAF50';
  }
}

const PASSWORD_SUCCESS = '#2E7D32';
const PASSWORD_SUCCESS_LIGHT = '#4CAF50';

export function getPasswordSuccessColor(): string {
  return PASSWORD_SUCCESS;
}

export function getPasswordSuccessLightColor(): string {
  return PASSWORD_SUCCESS_LIGHT;
}
