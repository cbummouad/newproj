import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../Components/Navbar';
import HeroSection from '../Components/HeroSection';
import AboutUs from '../Components/AboutUs';

const Home = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <div>
      <Navbar />
      
      <HeroSection />
      <AboutUs />
    </div>
  );
};

export default Home;
