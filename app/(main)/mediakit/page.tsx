'use client';

import React, { FC, useState, useRef, useEffect } from 'react';

interface MediakitProps {

}

type InterestOption = 'Communication pack' | 'eMagazine advertisement' | 'Email marketing' | 'Banner' | 'Media partnership' | 'Other';

const Mediakit: FC<MediakitProps> = ({ }) => {
  const contactFormRef = useRef<HTMLDivElement>(null);
  const [selectedInterest, setSelectedInterest] = useState<InterestOption | ''>('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phonePrefix: '+34',
    phone: '',
    interest: '',
    message: '',
    acceptedTerms: false
  });

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

  const interestOptions: InterestOption[] = [
    'Communication pack',
    'eMagazine advertisement',
    'Email marketing',
    'Banner',
    'Media partnership',
    'Other'
  ];

  useEffect(() => {
    if (selectedInterest) {
      setFormData(prev => ({ ...prev, interest: selectedInterest }));
    }
  }, [selectedInterest]);

  const scrollToForm = (interest?: InterestOption) => {
    if (interest) {
      setSelectedInterest(interest);
    }
    contactFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, acceptedTerms: e.target.checked }));
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.interest !== '' &&
      formData.message.trim() !== '' &&
      formData.acceptedTerms
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      // Handle form submission here
      console.log('Form submitted:', formData);
      alert('Thank you for your interest! We will contact you soon.');
      // Reset form
      setFormData({
        name: '',
        email: '',
        phonePrefix: '+34',
        phone: '',
        interest: '',
        message: '',
        acceptedTerms: false
      });
      setSelectedInterest('');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8'>
      <h1 className='text-center text-4xl sm:text-5xl font-bold text-gray-900 pb-8 sm:pb-12'>Mediakit</h1>
      
      {/* Communication pack */}
      <div className='flex flex-col mb-6 sm:mb-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg p-6 sm:p-8 rounded-2xl gap-3 mx-auto max-w-4xl'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <p className='font-bold text-xl sm:text-2xl text-gray-900'>
            Communication pack 
            <span className='pl-2 font-light italic text-sm sm:text-base text-gray-600'>Price: 1000€</span>
          </p>
          <button 
            onClick={() => scrollToForm('Communication pack')}
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 shadow-md hover:shadow-lg font-medium whitespace-nowrap'
          >
            Contact sales
          </button>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2'>
          <div className='flex flex-row bg-white p-4 rounded-lg shadow-md border border-gray-100'>
            <p className='text-gray-700'>Premium directory company profile</p>
          </div>
          <div className='flex flex-row bg-white p-4 rounded-lg shadow-md border border-gray-100'>
            <p className='text-gray-700'>3 adverts in our digital magazine during the year</p>
          </div>
          <div className='flex flex-row bg-white p-4 rounded-lg shadow-md border border-gray-100'>
            <p className='text-gray-700'>1 article published per magazine, also published in Glassinformer.com</p>
          </div>
          <div className='flex flex-row bg-white p-4 rounded-lg shadow-md border border-gray-100'>
            <p className='text-gray-700'>Appearence in our annuary</p>
          </div>
        </div>
      </div>

      {/* eMagazine advertisement */}
      <div className='flex flex-col mb-6 sm:mb-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg p-6 sm:p-8 rounded-2xl gap-4 mx-auto max-w-4xl'>
        <p className='font-bold text-xl sm:text-2xl text-gray-900'>eMagazine advertisement</p>
        <div className='flex flex-col sm:flex-row justify-between gap-3'>
          <div className='w-full flex flex-row items-center bg-white p-4 rounded-lg shadow-md border border-gray-100 justify-between'>
            <p className='text-gray-700'>One page advertisement</p>
            <p className='font-semibold text-gray-900 ml-4'>Price: 1000€</p>
          </div>
          <button 
            onClick={() => scrollToForm('eMagazine advertisement')}
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 shadow-md hover:shadow-lg font-medium whitespace-nowrap sm:w-auto w-full'
          >
            Contact sales
          </button>
        </div>
        <div className='flex flex-col sm:flex-row justify-between gap-3'>
          <div className='w-full flex flex-row items-center bg-white p-4 rounded-lg shadow-md border border-gray-100 justify-between'>
            <p className='text-gray-700'>Double page advertisement</p>
            <p className='font-semibold text-gray-900 ml-4'>Price: 1800€</p>
          </div>
          <button 
            onClick={() => scrollToForm('eMagazine advertisement')}
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 shadow-md hover:shadow-lg font-medium whitespace-nowrap sm:w-auto w-full'
          >
            Contact sales
          </button>
        </div>
        <div className='flex flex-col sm:flex-row justify-between gap-3'>
          <div className='w-full flex flex-row items-center bg-white p-4 rounded-lg shadow-md border border-gray-100 justify-between'>
            <p className='text-gray-700'>Article published in the magazine</p>
            <p className='font-semibold text-gray-900 ml-4'>Price: 1000€</p>
          </div>
          <button 
            onClick={() => scrollToForm('eMagazine advertisement')}
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 shadow-md hover:shadow-lg font-medium whitespace-nowrap sm:w-auto w-full'
          >
            Contact sales
          </button>
        </div>
        <div className='flex flex-col sm:flex-row justify-between gap-3'>
          <div className='w-full flex flex-row items-center bg-white p-4 rounded-lg shadow-md border border-gray-100 justify-between'>
            <p className='text-gray-700'>
              Cover page advertisement 
              <span className='text-sm font-light italic text-gray-500 ml-2'>(limited availability)</span>
            </p>
            <p className='font-semibold text-gray-900 ml-4'>Price: 2500€</p>
          </div>
          <button 
            onClick={() => scrollToForm('eMagazine advertisement')}
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 shadow-md hover:shadow-lg font-medium whitespace-nowrap sm:w-auto w-full'
          >
            Contact sales
          </button>
        </div>
      </div>

      {/* Other services */}
      <div className='flex flex-col mb-6 sm:mb-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg p-6 sm:p-8 rounded-2xl gap-4 mx-auto max-w-4xl'>
        <p className='font-bold text-xl sm:text-2xl text-gray-900'>Other services</p>
        <div className='flex flex-col sm:flex-row justify-between gap-3'>
          <div className='w-full flex flex-row items-center bg-white p-4 rounded-lg shadow-md border border-gray-100 justify-between'>
            <p className='text-gray-700'>
              <span className='font-bold'>Email marketing</span> - One sending, customized content
            </p>
            <p className='font-semibold text-gray-900 ml-4'>Price: 800€</p>
          </div>
          <button 
            onClick={() => scrollToForm('Email marketing')}
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 shadow-md hover:shadow-lg font-medium whitespace-nowrap sm:w-auto w-full'
          >
            Contact sales
          </button>
        </div>
        <div className='flex flex-col sm:flex-row justify-between gap-3'>
          <div className='w-full flex flex-row items-center bg-white p-4 rounded-lg shadow-md border border-gray-100 justify-between'>
            <p className='text-gray-700'>
              Email marketing campaign 
              <span className='text-sm font-light italic text-gray-500 ml-2'>(4 sendings during the year)</span>
            </p>
            <p className='font-semibold text-gray-900 ml-4'>Price: 3000€</p>
          </div>
          <button 
            onClick={() => scrollToForm('Email marketing')}
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 shadow-md hover:shadow-lg font-medium whitespace-nowrap sm:w-auto w-full'
          >
            Contact sales
          </button>
        </div>
        <div className='flex flex-col sm:flex-row justify-between gap-3'>
          <div className='w-full flex flex-row items-center bg-white p-4 rounded-lg shadow-md border border-gray-100 justify-between'>
            <p className='text-gray-700'>
              Banner in our website 
              <span className='text-sm font-light italic text-gray-500 ml-2'>(limited availability)</span>
            </p>
            <p className='font-semibold text-gray-900 ml-4'>200€/3 months</p>
          </div>
          <button 
            onClick={() => scrollToForm('Banner')}
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 shadow-md hover:shadow-lg font-medium whitespace-nowrap sm:w-auto w-full'
          >
            Contact sales
          </button>
        </div>
      </div>

      {/* Event or association */}
      <div className='flex flex-col mb-6 sm:mb-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg p-6 sm:p-8 rounded-2xl gap-4 mx-auto max-w-4xl'>
        <p className='font-bold text-xl sm:text-2xl text-gray-900'>Are you an event or association?</p>
        <div className='flex flex-col sm:flex-row justify-between gap-3'>
          <div className='w-full flex flex-row items-center bg-white p-4 rounded-lg shadow-md border border-gray-100 justify-between'>
            <p className='text-gray-700'>We also offer trade fair promotion and media partnership options</p>
          </div>
          <button 
            onClick={() => scrollToForm('Media partnership')}
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 shadow-md hover:shadow-lg font-medium whitespace-nowrap sm:w-auto w-full'
          >
            Contact sales
          </button>
        </div>
      </div>

      {/* Contact Form */}
      <div ref={contactFormRef} className='mx-auto max-w-4xl mt-16 sm:mt-20'>
        <h2 className='text-center text-3xl sm:text-4xl font-bold text-gray-900 mb-8 sm:mb-12'>Contact us</h2>
        <form onSubmit={handleSubmit} className='bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl p-6 sm:p-8 lg:p-10 rounded-2xl'>
          <div className='space-y-6'>
            {/* Name */}
            <div>
              <label htmlFor='name' className='block text-sm font-semibold text-gray-700 mb-2'>
                Complete contact name <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white text-gray-900'
                placeholder='Enter your full name'
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor='email' className='block text-sm font-semibold text-gray-700 mb-2'>
                Contact email <span className='text-red-500'>*</span>
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white text-gray-900'
                placeholder='your.email@example.com'
              />
            </div>

            {/* Phone */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Contact phone number <span className='text-red-500'>*</span>
              </label>
              <div className='flex flex-col sm:flex-row gap-3'>
                <div className='sm:w-48'>
                  <label htmlFor='phonePrefix' className='block text-xs text-gray-600 mb-1'>
                    Country prefix
                  </label>
                  <select
                    id='phonePrefix'
                    name='phonePrefix'
                    value={formData.phonePrefix}
                    onChange={handleInputChange}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white text-gray-900'
                  >
                    {phonePrefixes.map((prefix) => (
                      <option key={prefix.code} value={prefix.code}>
                        {prefix.code} ({prefix.country})
                      </option>
                    ))}
                  </select>
                </div>
                <div className='flex-1'>
                  <label htmlFor='phone' className='block text-xs text-gray-600 mb-1'>
                    Phone number
                  </label>
                  <input
                    type='tel'
                    id='phone'
                    name='phone'
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white text-gray-900'
                    placeholder='123456789'
                  />
                </div>
              </div>
            </div>

            {/* Interest */}
            <div>
              <label htmlFor='interest' className='block text-sm font-semibold text-gray-700 mb-2'>
                What are you interested in? <span className='text-red-500'>*</span>
              </label>
              <select
                id='interest'
                name='interest'
                value={formData.interest}
                onChange={handleInputChange}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white text-gray-900'
              >
                <option value=''>Select an option</option>
                {interestOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor='message' className='block text-sm font-semibold text-gray-700 mb-2'>
                Message - Request description <span className='text-red-500'>*</span>
              </label>
              <textarea
                id='message'
                name='message'
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white text-gray-900 resize-y'
                placeholder='Please describe your request...'
              />
            </div>

            {/* Terms and conditions */}
            <div className='flex items-start gap-3'>
              <input
                type='checkbox'
                id='acceptedTerms'
                name='acceptedTerms'
                checked={formData.acceptedTerms}
                onChange={handleCheckboxChange}
                required
                className='mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer'
              />
              <label htmlFor='acceptedTerms' className='text-sm text-gray-700 cursor-pointer'>
                I accept the{' '}
                <button
                  type='button'
                  onClick={() => setShowTermsModal(true)}
                  className='text-blue-600 hover:text-blue-800 underline font-medium'
                >
                  terms and conditions
                </button>
                <span className='text-red-500'> *</span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type='submit'
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

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div 
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
          onClick={() => setShowTermsModal(false)}
        >
          <div 
            className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-2xl sm:text-3xl font-bold text-gray-900'>Terms and Conditions</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className='text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors'
              >
                ×
              </button>
            </div>
            <div className='prose prose-sm sm:prose-base max-w-none text-gray-700 space-y-4'>
              <p>
                By submitting this contact form, you agree to the following terms and conditions:
              </p>
              <ul className='list-disc list-inside space-y-2 ml-4'>
                <li>You consent to being contacted by Glassinformer regarding your inquiry.</li>
                <li>All information provided will be kept confidential and used solely for business communication purposes.</li>
                <li>You confirm that all information provided is accurate and truthful.</li>
                <li>Glassinformer reserves the right to decline any request at its discretion.</li>
                <li>Pricing and availability are subject to change without notice.</li>
                <li>All services are subject to separate agreements and terms of service.</li>
              </ul>
              <p className='mt-4'>
                For more detailed information, please contact us directly at our official email address.
              </p>
            </div>
            <div className='mt-8 flex justify-end'>
              <button
                onClick={() => setShowTermsModal(false)}
                className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors duration-200 font-medium'
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mediakit;