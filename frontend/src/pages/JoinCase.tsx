import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { casesAPI } from '../services/api';

const JoinCase: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'joining' | 'success' | 'error'>('joining');
  const [error, setError] = useState('');

  useEffect(() => {
    const joinCase = async () => {
      if (!token) return;

      try {
        const response = await casesAPI.joinCase(token);
        setStatus('success');
        // Redirect to case details after a short delay
        setTimeout(() => {
          navigate(`/case/${response.data.data.case._id}`);
        }, 1500);
      } catch (err: any) {
        console.error('Error joining case:', err);
        setStatus('error');
        setError(err.response?.data?.message || 'Failed to join case');
      }
    };

    joinCase();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center transition-colors duration-300">
      <div className="bg-white dark:bg-secondary-800 p-8 rounded-lg shadow-md max-w-md w-full text-center border border-secondary-100 dark:border-secondary-700">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Joining Case...</h1>

        {status === 'joining' && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-secondary-600 dark:text-secondary-400">Please wait while we verify your invitation.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="text-green-500 mb-4">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 dark:text-green-400 font-medium">Successfully joined the case!</p>
            <p className="text-secondary-500 dark:text-secondary-400 text-sm mt-2">Redirecting to case details...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400 font-medium">Error Joining Case</p>
            <p className="text-secondary-600 dark:text-secondary-400 mt-2">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinCase;
