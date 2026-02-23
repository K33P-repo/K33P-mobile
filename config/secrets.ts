// IMPORTANT: Never commit this file with real keys!
// Add config/secrets.ts to your .gitignore

export const ENCRYPTION_KEYS = {
    phone: process.env.PHONE_ENCRYPTION_KEY || '__REPLACE_WITH_YOUR_PHONE_KEY__',
    pin: process.env.PIN_ENCRYPTION_KEY || '__REPLACE_WITH_YOUR_PIN_KEY__',
  } as const;
  
  // Validation
  if (
    ENCRYPTION_KEYS.phone === '__REPLACE_WITH_YOUR_PHONE_KEY__' ||
    ENCRYPTION_KEYS.pin === '__REPLACE_WITH_YOUR_PIN_KEY__'
  ) {
    console.warn('⚠️  Using default encryption keys. Please update config/secrets.ts');
  }