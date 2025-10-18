import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useContracts } from '../../hooks/useContracts';
import { useAIModel } from '../../hooks/useAIModel';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { 
  PlusIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  UserGroupIcon,
  ArrowRightIcon,
  FolderOpenIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CogIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import type { Contract } from '../../types';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { data: contractsData, isLoading, error } = useContracts();
  const { 
    modelStatus, 
    downloadModel, 
    checkAvailability 
  } = useAIModel();

  const contracts = contractsData?.contracts || [];
  const recentContracts = contracts.slice(0, 5);
  const stats = {
    totalContracts: contracts.length,
    activeContracts: contracts.filter((c: Contract) => c.status === 'active').length,
    signedContracts: contracts.filter((c: Contract) => c.status === 'finalized').length,
    draftContracts: contracts.filter((c: Contract) => c.status === 'draft').length,
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderAIModelStatus = () => {
    if (modelStatus.isDownloading) {
      return (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-warning-600"></div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="heading-4 text-warning-800 mb-2">Downloading AI Model</h3>
              <div className="w-full bg-warning-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-warning-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${modelStatus.progress}%` }}
                ></div>
              </div>
              <p className="body-regular text-warning-700 mb-2">
                This may take 30-60 minutes. You can continue working, but AI features will be unavailable.
              </p>
              <p className="body-small text-warning-600">
                Estimated time remaining: {Math.max(0, Math.round((100 - modelStatus.progress) * 0.5))} minutes
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (modelStatus.status === 'available') {
      return (
        <div className="bg-success-50 border border-success-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="heading-4 text-success-800 mb-2">AI Features Ready</h3>
              <p className="body-regular text-success-700 mb-4">
                All AI features are active. Translation, proofreading, and rewriting are ready to use.
              </p>
              <Button variant="secondary" size="sm" onClick={() => checkAvailability()}>
                Test Features
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-6 w-6 text-warning-600" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="heading-4 text-warning-800 mb-2">AI Model Not Installed</h3>
            <p className="body-regular text-warning-700 mb-4">
              Download the AI model to unlock translation, proofreading, and rewriting features.
            </p>
            <div className="flex space-x-3">
              <Button size="sm" onClick={() => downloadModel()}>
                Download Now
              </Button>
              <Button variant="outline" size="sm">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-semibold text-gray-900">Pentecost</h1>
                </div>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link to="/dashboard" className="flex items-center text-primary font-medium">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Dashboard
              </Link>
              <Link to="/contracts" className="flex items-center text-gray-600 hover:text-gray-900">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Contracts
                {contracts.length > 0 && (
                  <span className="ml-2 bg-primary text-white text-xs rounded-full px-2 py-1">
                    {contracts.length}
                  </span>
                )}
              </Link>
              <Link to="/settings" className="flex items-center text-gray-600 hover:text-gray-900">
                <CogIcon className="h-5 w-5 mr-2" />
                Settings
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <BellIcon className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary font-medium text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting Section */}
        <div className="mb-8">
          <h1 className="heading-1 text-gray-900 mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="body-large text-gray-600">
            {getCurrentDate()}
          </p>
        </div>

        {/* AI Model Status */}
        <div className="mb-8">
          {renderAIModelStatus()}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="heading-3 text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/contracts/create" className="group">
              <div className="card hover:shadow-elevated transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <PlusIcon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="heading-4 text-gray-900 mb-2">Create New Contract</h3>
                <p className="body-regular text-gray-600 mb-4">
                  Start a new contract with AI-powered features
                </p>
                <Button size="sm" className="w-full">
                  Create
                </Button>
              </div>
            </Link>

            <div className="group cursor-pointer">
              <div className="card hover:shadow-elevated transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-secondary-100 rounded-lg flex items-center justify-center group-hover:bg-secondary-200 transition-colors">
                    <FolderOpenIcon className="h-6 w-6 text-secondary-600" />
                  </div>
                </div>
                <h3 className="heading-4 text-gray-900 mb-2">Browse Templates</h3>
                <p className="body-regular text-gray-600 mb-4">
                  Choose from pre-built contract templates
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Browse
                </Button>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="card hover:shadow-elevated transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-secondary-100 rounded-lg flex items-center justify-center group-hover:bg-secondary-200 transition-colors">
                    <ArrowUpTrayIcon className="h-6 w-6 text-secondary-600" />
                  </div>
                </div>
                <h3 className="heading-4 text-gray-900 mb-2">Import Contract</h3>
                <p className="body-regular text-gray-600 mb-4">
                  Upload existing .txt, .doc, or .docx files
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Import
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Contracts */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="heading-3 text-gray-900">Recent Contracts</h2>
            <Link to="/contracts" className="text-primary hover:text-primary-hover text-sm font-medium">
              View all
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Loading contracts..." />
            </div>
          ) : recentContracts.length === 0 ? (
            <div className="card text-center py-12">
              <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="heading-4 text-gray-900 mb-2">No contracts yet</h3>
              <p className="body-regular text-gray-600 mb-6">
                Create your first contract to get started with AI-powered collaboration.
              </p>
              <Link to="/contracts/create">
                <Button leftIcon={<PlusIcon className="h-5 w-5" />}>
                  Create Contract
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentContracts.map((contract: Contract) => (
                <Link key={contract._id} to={`/contracts/${contract._id}`} className="group">
                  <div className="card hover:shadow-elevated transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="heading-4 text-gray-900 mb-2 group-hover:text-primary transition-colors">
                          {contract.title}
                        </h3>
                        <p className="body-regular text-gray-600 mb-3 line-clamp-2">
                          {contract.description}
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          contract.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          contract.status === 'active' ? 'bg-warning-100 text-warning-800' :
                          'bg-success-100 text-success-800'
                        }`}>
                          {contract.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>{contract.originalLanguage}</span>
                        <span>•</span>
                        <span>{new Date(contract.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
