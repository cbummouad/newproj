import React from 'react';
import { Users, Building2, Clock, Phone, Shield, Target } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const AboutUs = () => {
  const { language, translations } = useLanguage();

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {translations[language].aboutUsHeader || "Serving Mohammedia's Community"}
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            {translations[language].aboutUsDescription || "We are dedicated to improving the quality of life in Mohammedia by providing a direct channel between citizens and city services. Our platform ensures that your voice is heard and your concerns are addressed promptly."}
          </p>
        </div>

        {/* Mission Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <MissionCard
            icon={<Target className="w-8 h-8 text-blue-600" />}
            title={translations[language].ourMission || "Our Mission"}
            description={translations[language].ourMissionDescription || "To create an efficient and transparent system for addressing community concerns and improving city services."}
          />
          <MissionCard
            icon={<Users className="w-8 h-8 text-blue-600" />}
            title={translations[language].ourCommunity || "Our Community"}
            description={translations[language].ourCommunityDescription || "We serve all residents of Mohammedia, ensuring every voice contributes to the city's development."}
          />
          <MissionCard
            icon={<Building2 className="w-8 h-8 text-blue-600" />}
            title={translations[language].ourCity || "Our City"}
            description={translations[language].ourCityDescription || "Working together to make Mohammedia a better place to live, work, and thrive."}
          />
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ServiceCard
            icon={<Clock className="w-6 h-6" />}
            title={translations[language].fastResponse || "Fast Response"}
            description={translations[language].fastResponseDescription || "We ensure quick processing of all complaints with a dedicated team working around the clock."}
          />
          <ServiceCard
            icon={<Shield className="w-6 h-6" />}
            title={translations[language].securePlatform || "Secure Platform"}
            description={translations[language].securePlatformDescription || "Your privacy is protected with state-of-the-art security measures and data protection."}
          />
          <ServiceCard
            icon={<Phone className="w-6 h-6" />}
            title={translations[language].support24_7 || "24/7 Support"}
            description={translations[language].support24_7Description || "Our support team is always available to assist you with any questions or concerns."}
          />
        </div>

        {/* Contact CTA */}
        <div className="mt-20 text-center">
          <p className="text-gray-600 mb-6">
            {translations[language].contactUsQuestion || "Have questions about our services? We're here to help!"}
          </p>
          <a
            href="#contact"
            className="inline-flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            {translations[language].contactUs || "Contact Us"}
            <Phone className="ml-2 w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

const MissionCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const ServiceCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow duration-300 border border-gray-100">
    <div className="flex items-center mb-4">
      <div className="flex-shrink-0 mr-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default AboutUs;
