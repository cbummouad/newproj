import React, { createContext, useContext, useState } from 'react';

// Create a Language Context
const LanguageContext = createContext();

// Translations object
const translations = {
  en: {
    adminPanel: "Admin Panel",
    complaints: "Complaints",
    userManagement: "User Management",
    settings: "Settings",
    logOut: "Log Out",
    submitComplaint: "Submit Your Complaint", // Added English translation
    supportAvailable: "Support Available", // Added English translation
    resolutionRate: "Resolution Rate", // Added English translation
    responseTime: "Response Time", // Added English translation
    services: "Services",
    contactUs: "Contact Us",
    home: "Home",
    aboutUs: "About Us",
    login: "Login",
    dashboard: "Dashboard",
    welcomeMessage: "Welcome to Mohammedia's Community Hub", // Added English translation
    introMessage: "Your voice matters. We're here to listen, respond, and make our city better together.", // Added English translation
    easyComplaints: "Easy Complaints", // Added English translation
    easyComplaintsDescription: "Submit your concerns easily through our user-friendly platform", // Added English translation
    quickResponse: "Quick Response", // Added English translation
    quickResponseDescription: "Get timely updates and responses to your submissions", // Added English translation
    securePrivate: "Secure & Private", // Added English translation
    securePrivateDescription: "Your privacy and security are our top priorities" // Added English translation
  },
  fr: {
    adminPanel: "Panneau d'administration",
    complaints: "Plaintes",
    userManagement: "Gestion des utilisateurs",
    settings: "Paramètres",
    logOut: "Se déconnecter",
    submitComplaint: "Soumettre votre plainte",
    supportAvailable: "Support disponible",
    resolutionRate: "Taux de résolution",
    responseTime: "Temps de réponse",
    services: "Services",
    contactUs: "Contactez-nous",
    home: "Accueil",
    aboutUs: "À propos de nous",
    login: "Connexion",
    dashboard: "Tableau de bord",
    welcomeMessage: "Bienvenue dans le Centre Communautaire de Mohammedia",
    introMessage: "Votre voix compte. Nous sommes ici pour écouter, répondre et améliorer notre ville ensemble.",
    easyComplaints: "Plaintes faciles",
    easyComplaintsDescription: "Soumettez vos préoccupations facilement grâce à notre plateforme conviviale",
    quickResponse: "Réponse rapide",
    quickResponseDescription: "Recevez des mises à jour et des réponses en temps opportun à vos soumissions",
    securePrivate: "Sécurisé et privé",
    securePrivateDescription: "Votre vie privée et votre sécurité sont nos priorités absolues"
  },
  ar: {
    adminPanel: "لوحة الإدارة", // Added Arabic translation
    complaints: "الشكاوى", // Added Arabic translation
    userManagement: "إدارة المستخدمين", // Added Arabic translation
    settings: "الإعدادات", // Added Arabic translation
    logOut: "تسجيل الخروج", // Added Arabic translation
    services: "الخدمات", // Added Arabic translation
    contactUs: "تواصل معنا", // Added Arabic translation
    home: "الرئيسية", // Added Arabic translation
    aboutUs: "حولنا", // Added Arabic translation
    login: "تسجيل الدخول", // Added Arabic translation
    dashboard: "لوحة التحكم", // Added Arabic translation
    welcomeMessage: "مرحبًا بكم في مركز مجتمع المحمدية", // Added Arabic translation
    introMessage: "صوتك مهم. نحن هنا للاستماع والرد وجعل مدينتنا أفضل معًا.", // Added Arabic translation
    easyComplaints: "شكاوى سهلة", // Added Arabic translation
    easyComplaintsDescription: "قدم مخاوفك بسهولة من خلال منصتنا سهلة الاستخدام", // Added Arabic translation
    quickResponse: "استجابة سريعة", // Added Arabic translation
    quickResponseDescription: "احصل على تحديثات واستجابات في الوقت المناسب لمساهماتك", // Added Arabic translation
    securePrivate: "آمن وخاص", // Added Arabic translation
    securePrivateDescription: "خصوصيتك وأمانك هما أولويتنا القصوى", // Added Arabic translation
    aboutUsHeader: "خدمة مجتمع المحمدية", // Added Arabic translation
    aboutUsDescription: "نحن ملتزمون بتحسين جودة الحياة في المحمدية من خلال توفير قناة مباشرة بين المواطنين وخدمات المدينة. تضمن منصتنا أن يتم سماع صوتك ومعالجة مخاوفك على الفور.", // Added Arabic translation
    ourMission: "مهمتنا", // Added Arabic translation
    ourMissionDescription: "إنشاء نظام فعال وشفاف لمعالجة مخاوف المجتمع وتحسين خدمات المدينة.", // Added Arabic translation
    ourCommunity: "مجتمعنا", // Added Arabic translation
    ourCommunityDescription: "نحن نخدم جميع سكان المحمدية، مما يضمن أن يساهم كل صوت في تطوير المدينة.", // Added Arabic translation
    ourCity: "مدينتنا", // Added Arabic translation
    ourCityDescription: "نعمل معًا لجعل المحمدية مكانًا أفضل للعيش والعمل والازدهار.", // Added Arabic translation
    fastResponse: "استجابة سريعة", // Added Arabic translation
    fastResponseDescription: "نضمن معالجة سريعة لجميع الشكاوى من خلال فريق مخصص يعمل على مدار الساعة.", // Added Arabic translation
    securePlatform: "منصة آمنة", // Added Arabic translation
    securePlatformDescription: "خصوصيتك محمية بأحدث تدابير الأمان وحماية البيانات.", // Added Arabic translation
    support24_7: "دعم على مدار الساعة", // Added Arabic translation
    support24_7Description: "فريق الدعم لدينا متاح دائمًا لمساعدتك في أي أسئلة أو مخاوف.", // Added Arabic translation
    submitComplaint:"تقديم شكواك",
    supportAvailable:"الدعم متاح",
    resolutionRate:"معدل الحل",

    responseTime:"وقت الاستجابة",
  },
};

// Language Provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ar'); // Default language

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the Language Context
export const useLanguage = () => {
  return useContext(LanguageContext);
};
