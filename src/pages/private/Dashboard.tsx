import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useContracts } from '../../hooks/useContracts';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AIModelDownload } from '../../components/common/AIModelDownload';
import { 
  PlusIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  UserGroupIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import type { Contract } from '../../types';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { data: contractsData, isLoading, error } = useContracts();

  const contracts = contractsData?.contracts || [];
  const recentContracts = contracts.slice(0, 5);
  const stats = {
    totalContracts: contracts.length,
    activeContracts: contracts.filter((c: Contract) => c.status === 'active').length,
    signedContracts: contracts.filter((c: Contract) => c.status === 'finalized').length,
    draftContracts: contracts.filter((c: Contract) => c.status === 'draft').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Contracts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalContracts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Review</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeContracts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Signed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.signedContracts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Drafts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.draftContracts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <Link to="/contracts/new">
                <Button leftIcon={<PlusIcon className="h-5 w-5" />}>
                  Create New Contract
                </Button>
              </Link>
              <Button variant="outline" leftIcon={<DocumentTextIcon className="h-5 w-5" />}>
                Import Contract
              </Button>
              <Button variant="outline" leftIcon={<UserGroupIcon className="h-5 w-5" />}>
                Invite Collaborators
              </Button>
            </div>
          </div>
        </div>

        {/* AI Model Download */}
        <div className="mb-8">
          <AIModelDownload />
        </div>

        {/* Recent Contracts */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Contracts</h2>
            <Link to="/contracts" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" text="Loading contracts..." />
              </div>
            ) : recentContracts.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No contracts</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new contract.</p>
                <div className="mt-6">
                  <Link to="/contracts/new">
                    <Button leftIcon={<PlusIcon className="h-5 w-5" />}>
                      Create Contract
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentContracts.map((contract : Contract) => (
                  <div
                    key={contract._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{contract.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{contract.description}</p>
                      <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                        <span className="capitalize">{contract.status}</span>
                        <span>•</span>
                        <span>{contract.originalLanguage}</span>
                        <span>•</span>
                        <span>{new Date(contract.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link to={`/contracts/${contract._id}`}>
                      <Button variant="ghost" size="sm" rightIcon={<ArrowRightIcon className="h-4 w-4" />}>
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
