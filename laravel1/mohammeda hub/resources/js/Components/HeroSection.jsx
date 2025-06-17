import React, { useState } from 'react';
import { MessageSquare, Clock, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import FormComponent from '@/Pages/FormComponent';

const HeroSection = () => {
  const { language, translations } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <section id="hero" className="relative min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />

      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            {translations[language].welcomeMessage || "Welcome to Mohammedia's Community Hub"}
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 animate-fade-in-delay">
            {translations[language].introMessage || "Your voice matters. We're here to listen, respond, and make our city better together."}
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <FeatureCard
              icon={<MessageSquare className="w-8 h-8" />}
              title={translations[language].easyComplaints || "Easy Complaints"}
              description={translations[language].easyComplaintsDescription || "Submit your concerns easily through our user-friendly platform"}
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title={translations[language].quickResponse || "Quick Response"}
              description={translations[language].quickResponseDescription || "Get timely updates and responses to your submissions"}
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title={translations[language].securePrivate || "Secure & Private"}
              description={translations[language].securePrivateDescription || "Your privacy and security are our top priorities"}
            />
          </div>

          {/* CTA Button */}
          <div className="mt-12">
            <button
              onClick={toggleModal}
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-full hover:bg-blue-50 transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              {translations[language].submitComplaint || "Submit Your Complaint"}
              <MessageSquare className="ml-2 w-5 h-5" />
            </button>
            {isModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black opacity-50" onClick={toggleModal} />
                <div className="bg-white rounded-lg p-5 z-10">
                  <FormComponent />
                  <button onClick={toggleModal} className="mt-4 bg-red-500 text-white rounded px-4 py-2">Close</button>
                </div>
              </div>
            )}
          </div>
            
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-20 text-center">
            <div className="p-4">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">{translations[language].supportAvailable || "Support Available"}</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-200">{translations[language].resolutionRate || "Resolution Rate"}</div>
            </div>
            <div className="p-4 col-span-2 md:col-span-1">
              <div className="text-4xl font-bold mb-2">{"< 24h"}</div>
              <div className="text-blue-200">{translations[language].responseTime || "Response Time"}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-300">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-blue-100">{description}</p>
  </div>
);

export default HeroSection;
