import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { casesAPI } from '../services/api';
import { Clock, ArrowLeft, User, LogOut } from 'lucide-react';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

// Define the type for case data
interface Verdict {
  winner: string;
  confidenceScore: number;
  reasoning: string;
  excuse?: string;
  keyPoints?: { point: string; supportingEvidence: string }[];
  compensation?: {
    amount: number;
    currency: string;
    type: string;
    description: string;
  };
  generatedAt: string;
}

interface CaseData {
  title: string;
  description: string;
  status: string;
  creator: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  opposingParty: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  verdict?: Verdict;
}

const CaseDetails = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);

  const [claim, setClaim] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCaseData = async () => {
      if (!caseId) return;

      try {
        const response = await casesAPI.getCase(caseId);
        setCaseData(response.data.data.case);
      } catch (error) {
        console.error('Error fetching case data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCaseData();
  }, [caseId]);

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseId) return;

    setSubmitting(true);
    try {
      await casesAPI.submitClaim(caseId, { claim });
      setClaim('');
      alert('Claim submitted successfully! You will be notified when the verdict is ready.');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error submitting claim:', error);
      const errorMessage = error.response?.data?.errors?.[0]?.message || error.response?.data?.message || 'Failed to submit claim';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const { user, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
        <div className="text-red-500 text-xl">Case not found</div>
      </div>
    );
  }

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
                title="Back to Dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3 pl-4 border-l border-secondary-200 dark:border-secondary-700">
                <div className="h-8 w-8 bg-secondary-100 dark:bg-secondary-700 rounded-full flex items-center justify-center text-secondary-600 dark:text-secondary-300">
                  <User className="h-5 w-5" />
                </div>
              </div>
              <button
                onClick={logout}
                className="text-secondary-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-secondary-800 shadow-card rounded-xl p-8 mb-8 border border-secondary-100 dark:border-secondary-700 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${caseData.status === 'active' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                  caseData.status === 'resolved' ? 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800' :
                    'bg-secondary-100 text-secondary-700 border-secondary-200 dark:bg-secondary-700 dark:text-secondary-300 dark:border-secondary-600'
                  }`}>
                  {caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1)}
                </span>
                <span className="text-secondary-400 dark:text-secondary-500 text-sm">Case ID: {caseId}</span>
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">{caseData.title}</h1>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-secondary-600 dark:text-secondary-300 text-lg leading-relaxed">{caseData.description}</p>
          </div>

          <div className="mt-8 pt-8 border-t border-secondary-100 dark:border-secondary-700 flex gap-8">
            <div>
              <span className="text-xs font-bold text-secondary-400 dark:text-secondary-500 uppercase tracking-wider">Plaintiff</span>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-xs">
                  {caseData.creator.firstName[0]}
                </div>
                <span className="font-semibold text-neutral-900 dark:text-white">{caseData.creator.firstName} {caseData.creator.lastName}</span>
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-secondary-400 dark:text-secondary-500 uppercase tracking-wider">Defendant</span>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-8 w-8 bg-secondary-100 dark:bg-secondary-700 rounded-full flex items-center justify-center text-secondary-600 dark:text-secondary-300 font-bold text-xs">
                  {caseData.opposingParty.firstName[0]}
                </div>
                <span className="font-semibold text-neutral-900 dark:text-white">{caseData.opposingParty.firstName} {caseData.opposingParty.lastName}</span>
              </div>
            </div>
          </div>
        </div>

        {caseData.verdict ? (
          <div className="bg-white dark:bg-secondary-800 shadow-card rounded-xl overflow-hidden border border-secondary-200 dark:border-secondary-700 transition-colors">
            <div className="bg-neutral-900 dark:bg-black p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <svg className="w-6 h-6 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Official Verdict</h2>
                  <p className="text-secondary-400 text-sm">Generated by QuikCort AI • {new Date(caseData.verdict.generatedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-secondary-400">Confidence Score</div>
                <div className="text-2xl font-bold text-primary-400">{caseData.verdict.confidenceScore}%</div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                  <p className="text-green-800 dark:text-green-300 font-bold text-sm uppercase tracking-wider mb-2">Winner</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {caseData.verdict.winner === caseData.creator._id
                      ? `${caseData.creator.firstName} ${caseData.creator.lastName}`
                      : caseData.verdict.winner === caseData.opposingParty._id
                        ? `${caseData.opposingParty.firstName} ${caseData.opposingParty.lastName}`
                        : "Unknown"}
                  </p>
                </div>

                {caseData.verdict.compensation && caseData.verdict.compensation.type !== 'none' && (
                  <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                    <p className="text-blue-800 dark:text-blue-300 font-bold text-sm uppercase tracking-wider mb-2">Compensation</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {caseData.verdict.compensation.type === 'monetary'
                        ? `${caseData.verdict.compensation.currency} ${caseData.verdict.compensation.amount}`
                        : caseData.verdict.compensation.type.charAt(0).toUpperCase() + caseData.verdict.compensation.type.slice(1)}
                    </p>
                    {caseData.verdict.compensation.description && (
                      <p className="text-blue-700 dark:text-blue-200 text-sm mt-1">{caseData.verdict.compensation.description}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center">
                  <span className="w-1 h-6 bg-primary-500 rounded-full mr-3"></span>
                  Reasoning
                </h3>
                <div className="bg-secondary-50 dark:bg-secondary-700/50 p-6 rounded-xl border border-secondary-100 dark:border-secondary-700">
                  <p className="text-neutral-800 dark:text-secondary-200 leading-relaxed font-serif text-lg">
                    {caseData.verdict.reasoning}
                  </p>
                </div>
              </div>

              {caseData.verdict.keyPoints && caseData.verdict.keyPoints.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center">
                    <span className="w-1 h-6 bg-secondary-400 rounded-full mr-3"></span>
                    Key Findings
                  </h3>
                  <ul className="space-y-3">
                    {caseData.verdict.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-white dark:bg-secondary-700 border-2 border-primary-200 dark:border-primary-700 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs mr-3 mt-0.5">
                          {index + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-neutral-900 dark:text-white block">{point.point}</span>
                          {point.supportingEvidence && (
                            <span className="text-secondary-500 dark:text-secondary-400 text-sm mt-1 block">{point.supportingEvidence}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {caseData.verdict.excuse && (
                <div className="mt-8 pt-6 border-t border-secondary-100 dark:border-secondary-700">
                  <p className="text-sm text-secondary-400 italic text-center">
                    "To the losing party: {caseData.verdict.excuse}"
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-primary-50 dark:bg-primary-900/20 p-8 rounded-xl border border-primary-100 dark:border-primary-800 text-center">
              <div className="w-16 h-16 bg-white dark:bg-secondary-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Clock className="h-8 w-8 text-primary-500 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Verdict Pending</h3>
              <p className="text-secondary-600 dark:text-secondary-300 mb-6 max-w-lg mx-auto">
                {caseData.status === 'pending'
                  ? "Waiting for the opposing party to join the case."
                  : caseData.status === 'submitted'
                    ? "Both parties have submitted their claims. The AI is currently analyzing the evidence."
                    : "Waiting for both parties to submit their claims."}
              </p>

              {caseData.status === 'submitted' && (
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      await casesAPI.retryVerdict(caseId!);
                      const response = await casesAPI.getCase(caseId!);
                      setCaseData(response.data.data.case);
                      alert('Verdict generated successfully!');
                    } catch (error: any) {
                      console.error('Error retrying verdict:', error);
                      alert(error.response?.data?.message || 'Failed to generate verdict');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-sm transition-all"
                >
                  Retry Verdict Generation
                </button>
              )}
            </div>

            {/* Submission Form */}
            {caseData.status === 'active' && (
              <div className="bg-white dark:bg-secondary-800 p-8 rounded-xl shadow-card border border-secondary-100 dark:border-secondary-700 transition-colors">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Submit Your Statement</h3>
                <form onSubmit={handleSubmission} className="space-y-6">
                  <div>
                    <label htmlFor="claim" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Your Perspective
                    </label>
                    <div className="relative">
                      <textarea
                        id="claim"
                        rows={8}
                        className="w-full px-4 py-3 bg-secondary-50 dark:bg-secondary-700 border border-secondary-200 dark:border-secondary-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none dark:text-white"
                        placeholder="Describe the situation clearly and objectively..."
                        value={claim}
                        onChange={(e) => setClaim(e.target.value)}
                        required
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-secondary-400">
                        {claim.length} chars
                      </div>
                    </div>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2 flex items-center">
                      <span className="w-1.5 h-1.5 bg-secondary-300 rounded-full mr-2"></span>
                      Please provide at least 50 characters of detail.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || claim.length < 50}
                    className="w-full px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl hover:bg-neutral-800 dark:hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 dark:focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg shadow-neutral-900/10"
                  >
                    {submitting ? 'Submitting...' : 'Submit Statement'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseDetails;
