/**
 * Lightweight i18n system for PassAddis
 * Supports English (en) and Amharic (am)
 */

export type Locale = 'en' | 'am';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navigation
    'nav.events': 'Events',
    'nav.shop': 'Shop',
    'nav.tickets': 'Tickets',
    'nav.wallet': 'Wallet',
    'nav.profile': 'Profile Settings',
    'nav.signIn': 'Sign In',
    'nav.getStarted': 'Get Started',
    'nav.signOut': 'Sign Out',
    'nav.dashboard': 'Dashboard',

    // Home
    'home.exploreEvents': 'Explore Events',
    'home.hostEvent': 'Host Your Event',
    'home.howItWorks': 'How It Works',
    'home.simpleProcess': 'Simple Process',
    'home.threeSteps': 'Three Steps to',
    'home.yourExperience': 'Your Experience',
    'home.getTickets': 'Getting your tickets is simple, secure, and instant',
    'home.step1Title': 'Discover Events',
    'home.step1Desc': 'Browse our curated collection of concerts, festivals, sports, and conferences happening across Ethiopia.',
    'home.step2Title': 'Pay Securely',
    'home.step2Desc': 'Complete your purchase securely using Telebirr, Chapa, or international cards.',
    'home.step3Title': 'Get Your Ticket',
    'home.step3Desc': 'Receive your QR code ticket instantly. Just show it at the entrance and enjoy the event.',
    'home.featured': 'Featured',
    'home.featuredEvents': 'Events',
    'home.liveUpcoming': 'Live & Upcoming',
    'home.viewAll': 'View All Events',
    'home.whyPassaddis': 'Why PassAddis?',
    'home.trustedBy': 'Trusted by',
    'home.thousands': 'Thousands',
    'home.securePayments': 'Secure Payments',
    'home.verifiedTickets': 'Verified Tickets',
    'home.instantDelivery': 'Instant Delivery',
    'home.readyToExperience': 'Ready to Experience',
    'home.amazingEvents': 'Amazing Events?',
    'home.browseEvents': 'Browse Events',
    'home.diaspora.title': 'Gift an',
    'home.diaspora.highlight': 'Experience',
    'home.diaspora.desc': 'Curated events perfect for gifting to family and friends back home.',
    'home.diaspora.sendCredit': 'Send Gift Credit',
    'home.diaspora.forDiaspora': 'For the Diaspora',

    // Events
    'events.title': 'Events',
    'events.search': 'Search events...',
    'events.allCategories': 'All Categories',
    'events.noEvents': 'No events found',
    'events.saved': 'Saved Events',
    'events.free': 'Free',
    'events.soldOut': 'Sold Out',
    'events.ticketsLeft': 'tickets left',
    'events.from': 'From',

    // Event Detail
    'event.about': 'About This Event',
    'event.tickets': 'Tickets',
    'event.selectTickets': 'Select Tickets',
    'event.buyTickets': 'Buy Tickets',
    'event.buyAsGift': 'Buy as Gift',
    'event.addToCalendar': 'Add to Calendar',
    'event.share': 'Share',
    'event.organizer': 'Organizer',
    'event.dateTime': 'Date & Time',
    'event.location': 'Location',
    'event.earlyBird': 'Early Bird',
    'event.endsIn': 'Ends in',

    // Wallet
    'wallet.title': 'PassAddis Balance',
    'wallet.topUp': 'Top Up',
    'wallet.sendGift': 'Send Gift',
    'wallet.remit': 'Remit',
    'wallet.overview': 'Overview',
    'wallet.transactions': 'Transaction History',
    'wallet.noTransactions': 'No transactions yet',
    'wallet.topUpCard': 'Top Up with Card',
    'wallet.topUpDesc': 'Add funds using Visa, Mastercard, or Amex',
    'wallet.sendGiftCredit': 'Send Gift Credit',
    'wallet.sendGiftDesc': 'Send PassAddis credit to family or friends in Ethiopia',
    'wallet.recipientPhone': 'Recipient Phone',
    'wallet.amount': 'Amount',
    'wallet.message': 'Message (optional)',
    'wallet.remittance': 'Fund via Remittance',

    // Auth
    'auth.phone': 'Phone Number',
    'auth.password': 'Password',
    'auth.name': 'Full Name',
    'auth.email': 'Email Address',
    'auth.login': 'Sign In',
    'auth.register': 'Create Account',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.retry': 'Try Again',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.viewAll': 'View All',
    'common.seeMore': 'See More',
    'common.etb': 'ETB',
  },

  am: {
    // Navigation
    'nav.events': 'ዝግጅቶች',
    'nav.shop': 'ሱቅ',
    'nav.tickets': 'ትኬቶች',
    'nav.wallet': 'ዋሌት',
    'nav.profile': 'ፕሮፋይል ማስተካከያ',
    'nav.signIn': 'ግባ',
    'nav.getStarted': 'ጀምር',
    'nav.signOut': 'ውጣ',
    'nav.dashboard': 'ዳሽቦርድ',

    // Home
    'home.exploreEvents': 'ዝግጅቶችን ይመልከቱ',
    'home.hostEvent': 'ዝግጅት ያስተናግዱ',
    'home.howItWorks': 'እንዴት ይሰራል',
    'home.simpleProcess': 'ቀላል ሂደት',
    'home.threeSteps': 'ሦስት ደረጃዎች ወደ',
    'home.yourExperience': 'ተሞክሮዎ',
    'home.getTickets': 'ትኬት ማግኘት ቀላል፣ ደህንነቱ የተጠበቀ እና ፈጣን ነው',
    'home.step1Title': 'ዝግጅቶችን ያግኙ',
    'home.step1Desc': 'በኢትዮጵያ ውስጥ የሚካሄዱ ኮንሰርቶችን፣ ፌስቲቫሎችን፣ ስፖርቶችን እና ኮንፈረንሶችን ይፈልጉ።',
    'home.step2Title': 'በደህንነት ይክፈሉ',
    'home.step2Desc': 'በቴሌብር፣ በቻፓ ወይም በዓለም አቀፍ ካርዶች በደህንነት ይክፈሉ።',
    'home.step3Title': 'ትኬትዎን ያግኙ',
    'home.step3Desc': 'የQR ኮድ ትኬትዎን ወዲያውኑ ያግኙ። በመግቢያው ላይ ያሳዩ እና ዝግጅቱን ይደሰቱ።',
    'home.featured': 'ተለይተው የቀረቡ',
    'home.featuredEvents': 'ዝግጅቶች',
    'home.liveUpcoming': 'በቀጥታ እና መጪ',
    'home.viewAll': 'ሁሉንም ዝግጅቶች ይመልከቱ',
    'home.whyPassaddis': 'ለምን PassAddis?',
    'home.trustedBy': 'የሚታመን በ',
    'home.thousands': 'ሺዎች',
    'home.securePayments': 'ደህንነቱ የተጠበቀ ክፍያ',
    'home.verifiedTickets': 'የተረጋገጡ ትኬቶች',
    'home.instantDelivery': 'ፈጣን ማድረስ',
    'home.readyToExperience': 'ለመለማመድ ዝግጁ',
    'home.amazingEvents': 'አስደናቂ ዝግጅቶች?',
    'home.browseEvents': 'ዝግጅቶችን ይፈልጉ',
    'home.diaspora.title': 'ተሞክሮ',
    'home.diaspora.highlight': 'ስጡ',
    'home.diaspora.desc': 'ለቤተሰብ እና ለጓደኞች ስጦታ ለማድረግ የተመረጡ ዝግጅቶች።',
    'home.diaspora.sendCredit': 'ስጦታ ክሬዲት ላኩ',
    'home.diaspora.forDiaspora': 'ለዲያስፖራ',

    // Events
    'events.title': 'ዝግጅቶች',
    'events.search': 'ዝግጅቶችን ይፈልጉ...',
    'events.allCategories': 'ሁሉም ምድቦች',
    'events.noEvents': 'ዝግጅት አልተገኘም',
    'events.saved': 'የተቀመጡ ዝግጅቶች',
    'events.free': 'ነፃ',
    'events.soldOut': 'ተሽጧል',
    'events.ticketsLeft': 'ትኬቶች ቀርተዋል',
    'events.from': 'ከ',

    // Event Detail
    'event.about': 'ስለዚህ ዝግጅት',
    'event.tickets': 'ትኬቶች',
    'event.selectTickets': 'ትኬቶችን ይምረጡ',
    'event.buyTickets': 'ትኬቶችን ይግዙ',
    'event.buyAsGift': 'እንደ ስጦታ ይግዙ',
    'event.addToCalendar': 'ወደ ቀን መቁጠሪያ ያክሉ',
    'event.share': 'ያጋሩ',
    'event.organizer': 'አዘጋጅ',
    'event.dateTime': 'ቀን እና ሰዓት',
    'event.location': 'ቦታ',
    'event.earlyBird': 'ቅድመ ገዥ',
    'event.endsIn': 'ያበቃል በ',

    // Wallet
    'wallet.title': 'PassAddis ቀሪ ሂሳብ',
    'wallet.topUp': 'ሙላ',
    'wallet.sendGift': 'ስጦታ ላክ',
    'wallet.remit': 'ገንዘብ ላክ',
    'wallet.overview': 'አጠቃላይ እይታ',
    'wallet.transactions': 'የግብይት ታሪክ',
    'wallet.noTransactions': 'እስካሁን ግብይት የለም',
    'wallet.topUpCard': 'በካርድ ሙላ',
    'wallet.topUpDesc': 'በVisa፣ Mastercard ወይም Amex ገንዘብ ያክሉ',
    'wallet.sendGiftCredit': 'ስጦታ ክሬዲት ላክ',
    'wallet.sendGiftDesc': 'ለቤተሰብ ወይም ለጓደኞች PassAddis ክሬዲት ይላኩ',
    'wallet.recipientPhone': 'የተቀባይ ስልክ',
    'wallet.amount': 'መጠን',
    'wallet.message': 'መልእክት (አማራጭ)',
    'wallet.remittance': 'በገንዘብ ማስተላለፍ ሙላ',

    // Auth
    'auth.phone': 'ስልክ ቁጥር',
    'auth.password': 'የይለፍ ቃል',
    'auth.name': 'ሙሉ ስም',
    'auth.email': 'ኢሜይል አድራሻ',
    'auth.login': 'ግባ',
    'auth.register': 'ሂሳብ ፍጠር',
    'auth.forgotPassword': 'የይለፍ ቃል ረሳሽ?',
    'auth.noAccount': 'ሂሳብ የለህም?',
    'auth.hasAccount': 'ሂሳብ አለህ?',

    // Common
    'common.loading': 'በመጫን ላይ...',
    'common.error': 'ስህተት ተከስቷል',
    'common.retry': 'እንደገና ሞክር',
    'common.save': 'አስቀምጥ',
    'common.cancel': 'ይቅር',
    'common.confirm': 'አረጋግጥ',
    'common.close': 'ዝጋ',
    'common.back': 'ተመለስ',
    'common.next': 'ቀጣይ',
    'common.submit': 'አስገባ',
    'common.search': 'ፈልግ',
    'common.filter': 'አጣራ',
    'common.sort': 'ደርድር',
    'common.viewAll': 'ሁሉንም ይመልከቱ',
    'common.seeMore': 'ተጨማሪ ይመልከቱ',
    'common.etb': 'ብር',
  },
};

let currentLocale: Locale = (localStorage.getItem('passaddis_locale') as Locale) || 'en';

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  localStorage.setItem('passaddis_locale', locale);
  // Dispatch event so components can re-render
  window.dispatchEvent(new CustomEvent('locale-change', { detail: locale }));
}

export function t(key: string, fallback?: string): string {
  return translations[currentLocale]?.[key] || translations.en[key] || fallback || key;
}

export function getSupportedLocales(): { code: Locale; name: string; nativeName: string }[] {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  ];
}
