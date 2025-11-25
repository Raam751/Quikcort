import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { casesAPI, verdictsAPI } from '../services/api';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  Plus,
  User,
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Award,
  FileText
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

interface Stats {
  totalCases: number;
  wonCases: number;
  lostCases: number;
  credibilityScore: number;
  winRate: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [casesResponse, statsResponse] = await Promise.all([
          casesAPI.getCases({ limit: 5 }),
          verdictsAPI.getStats()
        ]);

        setCases(casesResponse.data.data.cases);
        setStats(statsResponse.data.data.stats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
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
              <Link
                to="/create-case"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Case
              </Link>
              <div className="flex items-center space-x-3 pl-4 border-l border-secondary-200 dark:border-secondary-700">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">{user?.firstName} {user?.lastName}</span>
                  <span className="text-xs text-secondary-500 dark:text-secondary-400">Credibility: {stats?.credibilityScore || 0}</span>
                </div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-2 text-lg">
            Here's an overview of your mediation cases and statistics.
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-card p-6 border border-secondary-100 dark:border-secondary-700 transition-colors">
              <div className="flex items-center">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                  <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Total Cases</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.totalCases}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-card p-6 border border-secondary-100 dark:border-secondary-700 transition-colors">
              <div className="flex items-center">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Won Cases</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.wonCases}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-card p-6 border border-secondary-100 dark:border-secondary-700 transition-colors">
              <div className="flex items-center">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Win Rate</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.winRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-card p-6 border border-secondary-100 dark:border-secondary-700 transition-colors">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                  <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Credibility</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.credibilityScore}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Cases */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-card border border-secondary-100 dark:border-secondary-700 overflow-hidden transition-colors">
          <div className="px-6 py-5 border-b border-secondary-100 dark:border-secondary-700 bg-secondary-50/50 dark:bg-secondary-800/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Recent Cases</h2>
              <Link
                to="/cases"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium hover:underline"
              >
                View all cases
              </Link>
            </div>
          </div>

          <div className="divide-y divide-secondary-100 dark:divide-secondary-700">
            {cases.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="bg-secondary-50 dark:bg-secondary-700 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-secondary-400 dark:text-secondary-500" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No cases yet</h3>
                <p className="text-secondary-500 dark:text-secondary-400 mb-6 max-w-sm mx-auto">Start your journey to resolution by creating your first mediation case.</p>
                <Link
                  to="/create-case"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium inline-flex items-center transition-all shadow-sm hover:shadow-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Case
                </Link>
              </div>
            ) : (
              cases.map((caseItem) => (
                <div key={caseItem._id} className="px-6 py-4 hover:bg-secondary-50/50 dark:hover:bg-secondary-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="bg-white dark:bg-secondary-700 p-2 rounded-lg border border-secondary-200 dark:border-secondary-600 shadow-sm">
                          {getStatusIcon(caseItem.status)}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-0.5">
                            {caseItem.title}
                          </h3>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400 flex items-center">
                            <span className="font-medium text-secondary-700 dark:text-secondary-300 mr-1">VS</span>
                            {caseItem.opposingParty.firstName} {caseItem.opposingParty.lastName}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${caseItem.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                        caseItem.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' :
                          caseItem.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' :
                            'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                        }`}>
                        {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                      </span>
                      <Link
                        to={`/case/${caseItem._id}`}
                        className="text-secondary-400 hover:text-primary-600 dark:text-secondary-500 dark:hover:text-primary-400 font-medium transition-colors"
                      >
                        <div className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-colors">
                          <TrendingUp className="h-5 w-5 rotate-90" />
                        </div>
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

export default Dashboard;
