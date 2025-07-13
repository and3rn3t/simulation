import { UserPreferencesManager } from './src/services/UserPreferencesManager';

// Test what's actually in the instance
const manager = UserPreferencesManager.getInstance();
console.log('Manager instance:', manager);
console.log('Manager constructor:', manager.constructor.name);
console.log('Manager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(manager)));
console.log('Manager static methods:', Object.getOwnPropertyNames(UserPreferencesManager));

// Test method accessibility
console.log('Has updatePreference:', typeof manager.updatePreference);
console.log('Has addChangeListener:', typeof manager.addChangeListener);
console.log('Has getPreferences:', typeof manager.getPreferences);

try {
  const prefs = manager.getPreferences();
  console.log('Preferences retrieved successfully:', prefs.theme);
} catch (e) {
  console.error('Error getting preferences:', e);
}
