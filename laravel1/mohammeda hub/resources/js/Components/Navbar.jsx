import React, { useState, useEffect } from 'react';
import { Home, Info, Phone, Menu, X, LogOut, LayoutDashboard, Globe2 } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar = () => {
  const { language, translations, changeLanguage } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-gray-800/95 backdrop-blur-sm shadow-lg' : 'bg-gray-800'
      }`}
      aria-label="Main Navigation"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex-shrink-0"
            variants={itemVariants}
          >
            <h1 className="text-white text-xl font-semibold tracking-wider flex items-center gap-2">
              <span className="text-blue-400">My</span> Mohammedia Hub
            </h1>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <motion.div
              className="relative"
              variants={itemVariants}
            >
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                <Globe2 size={18} />
                <span>{language.toUpperCase()}</span>
              </button>
              <AnimatePresence>
                {isLanguageOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 w-32 bg-gray-700 rounded-lg shadow-lg overflow-hidden"
                  >
                    {['en', 'fr', 'ar'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          changeLanguage(lang);
                          setIsLanguageOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors duration-200"
                      >
                        {lang === 'en' ? 'English' : lang === 'fr' ? 'Français' : 'العربية'}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={itemVariants}>
              <NavLink
                href="#services"
                icon={<Info size={18} />}
                text={translations[language].services}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <NavLink
                href="#contact"
                icon={<Phone size={18} />}
                text={translations[language].contactUs}
              />
            </motion.div>

            {usePage().props.auth.user ? (
              <>
                {usePage().props.auth.user.role === 'admin' && (
                  <motion.div variants={itemVariants}>
                    <NavLink
                      href="/admin"
                      icon={<LayoutDashboard size={18} />}
                      text={translations[language].dashboard}
                    />
                  </motion.div>
                )}
                <motion.div variants={itemVariants}>
                  <NavLink
                    href="/logout"
                    method="post"
                    icon={<LogOut size={18} />}
                    text={translations[language].logOut}
                    className="text-red-400 hover:text-red-300"
                  />
                </motion.div>
              </>
            ) : (
              <motion.div variants={itemVariants}>
                <NavLink
                  href="/login"
                  text={translations[language].login}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                />
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            variants={itemVariants}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90 }}
                  animate={{ rotate: 0 }}
                  exit={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90 }}
                  animate={{ rotate: 0 }}
                  exit={{ rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={mobileMenuVariants}
            className="md:hidden bg-gray-800 border-t border-gray-700"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {[
                { href: '#hero', icon: <Home size={18} />, text: translations[language].home },
                { href: '#about', icon: <Info size={18} />, text: translations[language].aboutUs },
                { href: '#services', icon: <Info size={18} />, text: translations[language].services },
                { href: '#contact', icon: <Phone size={18} />, text: translations[language].contactUs }
              ].map((item, index) => (
                <motion.div
                  key={item.href}
                  variants={itemVariants}
                  custom={index}
                >
                  <MobileNavLink {...item} />
                </motion.div>
              ))}

              {usePage().props.auth.user && (
                <>
                  {usePage().props.auth.user.role === 'admin' && (
                    <motion.div variants={itemVariants}>
                      <MobileNavLink
                        href="/admin"
                        icon={<LayoutDashboard size={18} />}
                        text={translations[language].dashboard}
                      />
                    </motion.div>
                  )}
                  <motion.div variants={itemVariants}>
                    <MobileNavLink
                      href="/logout"
                      method="post"
                      icon={<LogOut size={18} />}
                      text={translations[language].logOut}
                      className="text-red-400 hover:text-red-300"
                    />
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const NavLink = ({ href, icon, text, method, className = '' }) => (
  <Link
    href={href}
    method={method}
    as="button"
    className={`text-gray-300 hover:text-white flex items-center space-x-1 transition-colors duration-200 ${className}`}
  >
    {icon && <span className="flex items-center">{icon}</span>}
    <span>{text}</span>
  </Link>
);

const MobileNavLink = ({ href, icon, text, method, className = '' }) => (
  <Link
    href={href}
    method={method}
    as="button"
    className={`w-full text-gray-300 hover:text-white hover:bg-gray-700 flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${className}`}
  >
    {icon && <span className="flex items-center">{icon}</span>}
    <span>{text}</span>
  </Link>
);

export default Navbar;
