import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { casesAPI } from '../services/api';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  ArrowLeft
} from 'lucide-react';

interface Case {
  _id: string;
  caseId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  amount: number;
  currency: string;
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
  createdAt: string;
  deadline: string;
}

const CasesPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await casesAPI.getCases(); // Fetch all cases (or default limit)
        console.log('Cases response:', response.data);
        setCases(response.data.data.cases);
      } catch (error) {
        console.error('Error fetching cases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-300">
      <nav className="bg-white dark:bg-secondary-800 shadow-soft sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center text-secondary-400 hover:text-neutral-900 dark:hover:text-white mr-4 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="bg-primary-50 dark:bg-secondary-700 p-2 rounded-lg transition-colors">
                <Logo className="h-6 w-6" />
              </div>
              <span className="ml-3 text-xl font-bold text-neutral-900 dark:text-white tracking-tight">All Cases</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                to="/create-case"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center shadow-sm transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Case
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-card overflow-hidden border border-secondary-100 dark:border-secondary-700 transition-colors">
          <div className="divide-y divide-secondary-100 dark:divide-secondary-700">
            {cases.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FileText className="h-12 w-12 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No cases found</h3>
                <p className="text-secondary-500 dark:text-secondary-400 mb-4">You haven't created or joined any cases yet.</p>
              </div>
            ) : (
              cases.map((caseItem) => (
                <div key={caseItem._id} className="px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(caseItem.status)}
                        <div>
                          <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                            {caseItem.title}
                          </h3>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400">
                            vs. {caseItem.opposingParty.firstName} {caseItem.opposingParty.lastName}
                          </p>
                          <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">
                            Created on {new Date(caseItem.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(caseItem.status)}`}>
                        {caseItem.status}
                      </span>
                      <Link
                        to={`/case/${caseItem._id}`}
                        className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasesPage;
