import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'am';

interface Translations {
  [key: string]: {
    en: string;
    am: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', am: 'ዳሽቦርድ' },
  'nav.properties': { en: 'Properties', am: 'ንብረቶች' },
  'nav.requests': { en: 'Requests', am: 'ጥያቄዎች' },
  'nav.reports': { en: 'Reports', am: 'ሪፖርቶች' },
  'nav.settings': { en: 'Settings', am: 'ቅንብሮች' },
  'nav.availableProperties': { en: 'Available Properties', am: 'ያሉ ንብረቶች' },
  'nav.myRequests': { en: 'My Requests', am: 'የእኔ ጥያቄዎች' },
  'nav.issueProperties': { en: 'Issue Properties', am: 'ንብረት ማውጣት' },
  'nav.issuedProperties': { en: 'Issued Properties', am: 'የወጡ ንብረቶች' },

  // Common
  'common.welcome': { en: 'Welcome back', am: 'እንኳን ደህና መጡ' },
  'common.loading': { en: 'Loading...', am: 'በመጫን ላይ...' },
  'common.save': { en: 'Save', am: 'አስቀምጥ' },
  'common.cancel': { en: 'Cancel', am: 'ሰርዝ' },
  'common.edit': { en: 'Edit', am: 'አርም' },
  'common.delete': { en: 'Delete', am: 'ሰርዝ' },
  'common.add': { en: 'Add', am: 'ጨምር' },
  'common.search': { en: 'Search', am: 'ፈልግ' },
  'common.filter': { en: 'Filter', am: 'ማጣሪያ' },
  'common.submit': { en: 'Submit', am: 'አስገባ' },
  'common.approve': { en: 'Approve', am: 'ፍቀድ' },
  'common.reject': { en: 'Reject', am: 'ውድቅ አድርግ' },
  'common.pending': { en: 'Pending', am: 'በመጠባበቅ ላይ' },
  'common.approved': { en: 'Approved', am: 'ፀድቋል' },
  'common.rejected': { en: 'Rejected', am: 'ውድቅ ሆኗል' },
  'common.issued': { en: 'Issued', am: 'ወጥቷል' },

  // Dashboard
  'dashboard.title': { en: 'Dashboard', am: 'ዳሽቦርድ' },
  'dashboard.subtitle': { en: 'Here\'s what\'s happening with your property management system today.', am: 'ዛሬ በንብረት አስተዳደር ስርዓትዎ ውስጥ የሚከሰተው ነገር ይህ ነው።' },
  'dashboard.totalProperties': { en: 'Total Properties', am: 'ጠቅላላ ንብረቶች' },
  'dashboard.totalValue': { en: 'Total Value', am: 'ጠቅላላ ዋጋ' },
  'dashboard.pendingRequests': { en: 'Pending Requests', am: 'በመጠባበቅ ላይ ያሉ ጥያቄዎች' },
  'dashboard.lowStock': { en: 'Low Stock Items', am: 'ዝቅተኛ ክምችት ያላቸው እቃዎች' },

  // Properties
  'properties.title': { en: 'Properties', am: 'ንብረቶች' },
  'properties.subtitle': { en: 'Manage your property inventory', am: 'የንብረት ክምችትዎን ያስተዳድሩ' },
  'properties.addProperty': { en: 'Add Property', am: 'ንብረት ጨምር' },
  'properties.propertyNumber': { en: 'Property Number', am: 'የንብረት ቁጥር' },
  'properties.propertyName': { en: 'Property Name', am: 'የንብረት ስም' },
  'properties.modelNumber': { en: 'Model Number', am: 'የሞዴል ቁጥር' },
  'properties.serialNumber': { en: 'Serial Number', am: 'የተከታታይ ቁጥር' },
  'properties.company': { en: 'Company', am: 'ኩባንያ' },
  'properties.quantity': { en: 'Quantity', am: 'መጠን' },
  'properties.available': { en: 'Available', am: 'ያለ' },
  'properties.unitPrice': { en: 'Unit Price', am: 'የአንድ ዋጋ' },
  'properties.totalPrice': { en: 'Total Price', am: 'ጠቅላላ ዋጋ' },

  // Settings
  'settings.title': { en: 'Settings', am: 'ቅንብሮች' },
  'settings.subtitle': { en: 'Manage your account and application preferences', am: 'የመለያዎን እና የመተግበሪያ ምርጫዎችን ያስተዳድሩ' },
  'settings.profile': { en: 'Profile', am: 'መገለጫ' },
  'settings.notifications': { en: 'Notifications', am: 'ማሳወቂያዎች' },
  'settings.preferences': { en: 'Preferences', am: 'ምርጫዎች' },
  'settings.userManagement': { en: 'User Management', am: 'የተጠቃሚ አስተዳደር' },
  'settings.security': { en: 'Security', am: 'ደህንነት' },
  'settings.language': { en: 'Language', am: 'ቋንቋ' },
  'settings.theme': { en: 'Theme', am: 'ገጽታ' },
  'settings.light': { en: 'Light', am: 'ብሩህ' },
  'settings.dark': { en: 'Dark', am: 'ጨለማ' },
  'settings.auto': { en: 'Auto', am: 'ራስ-ሰር' },
  'settings.saveChanges': { en: 'Save Changes', am: 'ለውጦችን አስቀምጥ' },

  // Profile
  'profile.title': { en: 'Profile Settings', am: 'የመገለጫ ቅንብሮች' },
  'profile.subtitle': { en: 'Manage your account information and security', am: 'የመለያ መረጃዎን እና ደህንነትዎን ያስተዳድሩ' },
  'profile.fullName': { en: 'Full Name', am: 'ሙሉ ስም' },
  'profile.email': { en: 'Email Address', am: 'የኢሜይል አድራሻ' },
  'profile.department': { en: 'Department', am: 'ክፍል' },
  'profile.role': { en: 'Role', am: 'ሚና' },
  'profile.changePassword': { en: 'Change Password', am: 'የይለፍ ቃል ቀይር' },
  'profile.currentPassword': { en: 'Current Password', am: 'አሁን ያለ የይለፍ ቃል' },
  'profile.newPassword': { en: 'New Password', am: 'አዲስ የይለፍ ቃል' },
  'profile.confirmPassword': { en: 'Confirm Password', am: 'የይለፍ ቃል አረጋግጥ' },

  // Organization
  'org.name': { en: 'IRD Properties', am: 'ምልተ ንብረቶች' },
  'org.fullName': { en: 'Ethiopian Defence University', am: 'የኢትዮጵያ መከላከያ ዩኒቨርሲቲ' },
  'org.department': { en: 'Institute of Research and Development (IRD)', am: 'የምርምር እና ልማት ተቋም (ምልተ)' },

  // Auth
  'auth.signIn': { en: 'Sign In', am: 'ግባ' },
  'auth.signOut': { en: 'Sign Out', am: 'ውጣ' },
  'auth.username': { en: 'Username', am: 'የተጠቃሚ ስም' },
  'auth.password': { en: 'Password', am: 'የይለፍ ቃል' },
  'auth.invalidCredentials': { en: 'Invalid username or password', am: 'የተሳሳተ የተጠቃሚ ስም ወይም የይለፍ ቃል' },

  // Messages
  'messages.success': { en: 'Success!', am: 'ተሳክቷል!' },
  'messages.error': { en: 'Error occurred', am: 'ስህተት ተከስቷል' },
  'messages.saved': { en: 'Settings saved successfully!', am: 'ቅንብሮች በተሳካ ሁኔታ ተቀምጠዋል!' },
  'messages.passwordChanged': { en: 'Password changed successfully!', am: 'የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል!' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('ird-language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('ird-language', newLanguage);
    
    // Update document direction for RTL languages
    document.documentElement.dir = newLanguage === 'am' ? 'ltr' : 'ltr'; // Amharic is LTR
    document.documentElement.lang = newLanguage;
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language] || translation.en || key;
  };

  const isRTL = false; // Amharic is LTR

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};