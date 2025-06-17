import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { MapPin, Upload, Map, Camera } from 'lucide-react';
import useNotifications from '../hooks/useNotifications';
import { useLanguage } from '../contexts/LanguageContext'; // Import useLanguage
import Notifications from '../Components/Notifications'; // Import Notifications component

const FormComponent = () => {
  const { data, setData, post, processing, errors } = useForm({
    image: null,
    location: '',
    title: '',
    type: '',
  });

  const [preview, setPreview] = useState(null);
  const { notifications, showNotification } = useNotifications();
  const { language, translations } = useLanguage(); // Use the useLanguage hook to access translations

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setData('location', `${latitude}, ${longitude}`);
          showNotification('Location updated successfully!', 'success');
        },
        (error) => {
          console.error('Error getting location:', error);
          showNotification('Failed to get location. Please try again.', 'error');
        }
      );
    } else {
      showNotification('Geolocation is not supported by your browser.', 'error');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        showNotification('Image uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/form-data', {
      preserveScroll: true,
      onSuccess: () => {
        showNotification('Form submitted successfully!', 'success');
        // Reset form
        setData({
          image: null,
          location: '',
          title: '',
          type: ''
        });
        setPreview(null);
      },
      onError: () => {
        showNotification('Failed to submit form. Please check your inputs.', 'error');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Notifications notifications={notifications} />
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">{translations[language].submitLocation || "Submit Location"}</h2>
          <p className="text-gray-600">{translations[language].shareFavoritePlaces || "Share your favorite places with the community"}</p>
        </div>

        {/* Image Upload Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <div className="relative">
            {preview ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setData('image', null);
                    showNotification('Image removed', 'info');
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  capture="camera"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Camera className="w-12 h-12 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Take a photo or upload an image</span>
                </label>
              </div>
            )}
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={data.location}
                onChange={e => setData('location', e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter location"
              />
            </div>
            <button
              type="button"
              onClick={getLocation}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Use Current</span>
            </button>
          </div>
          {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
        </div>

        {/* Title Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={data.title}
            onChange={e => setData('title', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Give your location a title"
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
        </div>

        {/* Type Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={data.type}
            onChange={e => setData('type', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a type</option>
            <option value="restaurant">Restaurant</option>
            <option value="park">Park</option>
            <option value="landmark">Landmark</option>
            <option value="shop">Shop</option>
            <option value="other">Other</option>
          </select>
          {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={processing}
          className={`w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium
            ${processing ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700'}
            transition-colors duration-200 flex items-center justify-center gap-2`}
        >
          {processing ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Submit Location</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default FormComponent;
