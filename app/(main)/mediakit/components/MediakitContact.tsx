'use client';

import React, { FC, useRef, useState } from 'react';

const phonePrefixes = [
  { code: '+34', country: 'Spain' },
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+33', country: 'France' },
  { code: '+49', country: 'Germany' },
  { code: '+39', country: 'Italy' },
  { code: '+351', country: 'Portugal' },
  { code: '+31', country: 'Netherlands' },
  { code: '+32', country: 'Belgium' },
  { code: '+41', country: 'Switzerland' },
];

const interestOptions = [
  'News Portal Advertising',
  'Magazine Advertising',
  'Other services',
  'General inquiry',
];

interface MediakitContactProps {
  contactRef: React.RefObject<HTMLDivElement | null>;
}

const MediakitContact: FC<MediakitContactProps> = ({ contactRef }) => {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phonePrefix: '+34',
    phone: '',
    interest: '',
    message: '',
    acceptedTerms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, acceptedTerms: e.target.checked }));
  };

  const isFormValid = () =>
    formData.name.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.phone.trim() !== '' &&
    formData.interest !== '' &&
    formData.message.trim() !== '' &&
    formData.acceptedTerms;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      console.log('Form submitted:', formData);
      alert('Thank you for your interest! We will contact you soon.');
      setFormData({
        name: '',
        email: '',
        phonePrefix: '+34',
        phone: '',
        interest: '',
        message: '',
        acceptedTerms: false,
      });
    }
  };

  return (
    <>
      <div ref={contactRef} className="mx-auto max-w-4xl mt-16 sm:mt-20">
        <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 mb-8 sm:mb-12">Contact us</h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl p-6 sm:p-8 lg:p-10 rounded-2xl"
        >
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full contact name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white text-gray-900"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Contact email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white text-gray-900"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact phone number <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="sm:w-48">
                  <label htmlFor="phonePrefix" className="block text-xs text-gray-600 mb-1">
                    Country prefix
                  </label>
                  <select
                    id="phonePrefix"
                    name="phonePrefix"
                    value={formData.phonePrefix}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white text-gray-900"
                  >
                    {phonePrefixes.map((prefix) => (
                      <option key={prefix.code} value={prefix.code}>
                        {prefix.code} ({prefix.country})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label htmlFor="phone" className="block text-xs text-gray-600 mb-1">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white text-gray-900"
                    placeholder="123456789"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="interest" className="block text-sm font-semibold text-gray-700 mb-2">
                What are you interested in? <span className="text-red-500">*</span>
              </label>
              <select
                id="interest"
                name="interest"
                value={formData.interest}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white text-gray-900"
              >
                <option value="">Select an option</option>
                {interestOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                Message – Request description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white text-gray-900 resize-y"
                placeholder="Please describe your request..."
              />
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptedTerms"
                name="acceptedTerms"
                checked={formData.acceptedTerms}
                onChange={handleCheckboxChange}
                required
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="acceptedTerms" className="text-sm text-gray-700 cursor-pointer">
                I accept the{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  terms and conditions
                </button>
                <span className="text-red-500"> *</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!isFormValid()}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                isFormValid()
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-[1.02]'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {showTermsModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Terms and Conditions</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
              >
                ×
              </button>
            </div>
            <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 space-y-4">
              <p>By submitting this contact form, you agree to the following terms and conditions:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You consent to being contacted by Glassinformer regarding your inquiry.</li>
                <li>All information provided will be kept confidential and used solely for business communication purposes.</li>
                <li>You confirm that all information provided is accurate and truthful.</li>
                <li>Glassinformer reserves the right to decline any request at its discretion.</li>
                <li>Pricing and availability are subject to change without notice.</li>
                <li>All services are subject to separate agreements and terms of service.</li>
              </ul>
              <p className="mt-4">
                For more detailed information, please contact us directly at our official email address.
              </p>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors duration-200 font-medium"
              >
                I understand
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MediakitContact;
