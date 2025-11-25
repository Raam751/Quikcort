import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { casesAPI } from '../services/api';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  FileText,
  Mail
} from 'lucide-react';

const CreateCase: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'interpersonal',
    amount: '',
    currency: 'USD',
    opposingPartyEmail: '',
    deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [createdCase, setCreatedCase] = useState<{ id: string; link: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await casesAPI.createCase({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        amount: formData.amount ? parseFloat(formData.amount) : 0,
        currency: formData.currency,
        opposingPartyEmail: formData.opposingPartyEmail,
        deadline: formData.deadline
      });

      const caseId = response.data.data.case._id;
      const inviteLink = response.data.data.invitationLink;

      // Show success message with invite link
      setProcessing(false);
      setLoading(false);

      // We'll use a local state to show the success view instead of navigating
      setCreatedCase({ id: caseId, link: inviteLink });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create case');
      setLoading(false);
    }
  };

  const categories = [
    { value: 'interpersonal', label: 'Interpersonal Dispute' },
    { value: 'transactional', label: 'Transactional Dispute' },
    { value: 'property', label: 'Property Dispute' },
    { value: 'contract', label: 'Contract Dispute' },
    { value: 'other', label: 'Other' }
  ];

  const currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'CAD', label: 'CAD (C$)' },
    { value: 'AUD', label: 'AUD (A$)' }
  ];

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 font-sans transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white dark:bg-secondary-800 shadow-soft sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-primary-50 dark:bg-secondary-700 p-2 rounded-lg transition-colors">
                <Logo className="h-6 w-6" />
              </div>
              <span className="ml-3 text-xl font-bold text-neutral-900 dark:text-white tracking-tight">QuikCort</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => navigate('/dashboard')}
                className="text-secondary-400 hover:text-neutral-900 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-card border border-secondary-100 dark:border-secondary-700 overflow-hidden transition-colors">
          <div className="px-8 py-6 border-b border-secondary-100 dark:border-secondary-700 bg-secondary-50/50 dark:bg-secondary-800/50">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Create New Case</h1>
            <p className="text-secondary-500 dark:text-secondary-400 mt-1">
              Start a new mediation case by providing the details below.
            </p>
          </div>

          {createdCase ? (
            <div className="px-8 py-8 space-y-8">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-800/30 mb-6">
                  <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">Case Created Successfully!</h3>
                <p className="text-green-700 dark:text-green-300 max-w-md mx-auto">
                  Share this invitation link with the opposing party so they can join the case.
                </p>

                <div className="mt-6 flex items-center justify-center space-x-2 max-w-lg mx-auto">
                  <input
                    type="text"
                    readOnly
                    value={createdCase.link}
                    className="flex-1 px-4 py-3 border border-green-200 dark:border-green-800 rounded-lg bg-white dark:bg-secondary-700 text-sm text-secondary-600 dark:text-secondary-300 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdCase.link);
                      alert('Link copied to clipboard!');
                    }}
                    className="px-6 py-3 bg-white dark:bg-secondary-700 border border-green-200 dark:border-green-800 rounded-lg text-sm font-medium text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors shadow-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 border border-secondary-200 dark:border-secondary-600 rounded-lg text-secondary-600 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 font-medium transition-colors"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate(`/case/${createdCase.id}`)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-sm transition-colors"
                >
                  View Case Details
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {error}
                </div>
              )}

              {/* Case Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  <FileText className="h-4 w-4 inline mr-2 text-secondary-400" />
                  Case Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-secondary-200 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:bg-secondary-700 dark:text-white"
                  placeholder="Brief description of the dispute"
                />
              </div>

              {/* Case Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Detailed Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-secondary-200 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none dark:bg-secondary-700 dark:text-white"
                  placeholder="Provide a detailed description of the dispute, including relevant background information..."
                />
              </div>

              {/* Category and Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-secondary-200 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white dark:bg-secondary-700 dark:text-white"
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-secondary-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    <DollarSign className="h-4 w-4 inline mr-2 text-secondary-400" />
                    Amount in Dispute (Optional)
                  </label>
                  <div className="flex">
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="px-4 py-3 border border-secondary-200 dark:border-secondary-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-secondary-50 dark:bg-secondary-600 dark:text-white border-r-0"
                    >
                      {currencies.map((currency) => (
                        <option key={currency.value} value={currency.value}>
                          {currency.value}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleChange}
                      className="flex-1 px-4 py-3 border border-secondary-200 dark:border-secondary-600 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-secondary-700 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Opposing Party Email */}
              <div>
                <label htmlFor="opposingPartyEmail" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  <Mail className="h-4 w-4 inline mr-2 text-secondary-400" />
                  Opposing Party Email
                </label>
                <input
                  type="email"
                  id="opposingPartyEmail"
                  name="opposingPartyEmail"
                  required
                  value={formData.opposingPartyEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-secondary-200 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:bg-secondary-700 dark:text-white"
                  placeholder="Enter the email address of the opposing party"
                />
                <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-2">
                  An invitation will be sent to this email address to join the case.
                </p>
              </div>

              {/* Deadline */}
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2 text-secondary-400" />
                  Submission Deadline
                </label>
                <input
                  type="datetime-local"
                  id="deadline"
                  name="deadline"
                  required
                  value={formData.deadline}
                  onChange={handleChange}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 border border-secondary-200 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:bg-secondary-700 dark:text-white"
                />
                <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-2">
                  Both parties must submit their claims before this deadline.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-8 border-t border-secondary-100 dark:border-secondary-700">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 border border-secondary-200 dark:border-secondary-600 rounded-lg text-secondary-600 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-primary-600/20 transition-all"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Case'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {processing && (
        <div className="fixed inset-0 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm z-50">
          <div className="bg-white dark:bg-secondary-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600 mb-4"></div>
            <p className="text-neutral-900 dark:text-white font-medium">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCase;
