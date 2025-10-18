import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAIModel } from '../../hooks/useAIModel';
import { 
  CheckCircleIcon, 
  ArrowRightIcon,
  ArrowLeftIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

type OnboardingStep = 'ai-model' | 'quick-tour';

interface TourSlide {
  title: string;
  description: string;
  illustration: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { 
    modelStatus, 
    downloadModel, 
    checkAvailability 
  } = useAIModel();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('ai-model');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(true);

  const tourSlides: TourSlide[] = [
    {
      title: "Create Contracts",
      description: "Write contracts in your preferred language with AI-assisted translation and proofreading.",
      illustration: "Contract editor screenshot"
    },
    {
      title: "Git-Like Version Control",
      description: "Commit changes, create branches, and track every revision like a pro developer.",
      illustration: "Version control interface"
    },
    {
      title: "Collaborate Across Languages",
      description: "Team members see contracts in their language. AI translates automatically on pull.",
      illustration: "Multi-language collaboration"
    }
  ];

  useEffect(() => {
    const checkAvailabilityStatus = async () => {
      setIsCheckingAvailability(true);
      await checkAvailability();
      setIsCheckingAvailability(false);
    };
    
    checkAvailabilityStatus();
  }, [checkAvailability]);

  const handleDownloadModel = async () => {
    try {
      await downloadModel();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleSkipOnboarding = () => {
    navigate('/dashboard');
  };

  const handleFinishOnboarding = () => {
    navigate('/dashboard');
  };

  const handleNextSlide = () => {
    if (currentSlide < tourSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinishOnboarding();
    }
  };

  const handlePreviousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkipTour = () => {
    handleFinishOnboarding();
  };

  // Auto-advance to tour when model is ready
  useEffect(() => {
    if (modelStatus.status === 'available' && currentStep === 'ai-model') {
      setTimeout(() => {
        setCurrentStep('quick-tour');
      }, 2000);
    }
  }, [modelStatus.status, currentStep]);

  if (currentStep === 'ai-model') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Progress indicator */}
          <div className="flex justify-between items-center mb-8">
            <span className="text-sm text-gray-600">Step 1 of 2</span>
            <button
              onClick={handleSkipOnboarding}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>
          </div>

          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mb-8">
              <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>

            <h1 className="heading-2 text-gray-900 mb-4">
              Download AI Model
            </h1>
            <p className="body-large text-gray-600 mb-8 max-w-lg mx-auto">
              Pentecost uses Chrome's built-in AI for translation, proofreading, and rewriting. Download the foundational model to unlock these features.
            </p>

            {/* Requirements Card */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="heading-4 text-gray-900 mb-4">System Requirements</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="h-4 w-4 text-success mr-2" />
                  Chrome 127+ with AI features enabled
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="h-4 w-4 text-success mr-2" />
                  22 GB free storage space
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="h-4 w-4 text-success mr-2" />
                  GPU with &gt;4GB VRAM OR 16GB RAM + 4 CPU cores
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="h-4 w-4 text-success mr-2" />
                  Unlimited network connection
                </li>
              </ul>
            </div>

            {/* Download Info */}
            <div className="text-center mb-8">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Model Size:</strong> ~4GB (Gemini Nano)
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Estimated Time:</strong> 30-60 minutes
              </p>
              <p className="text-xs text-gray-500">
                Download happens once. Language-specific models download on first use.
              </p>
            </div>

            {/* Download States */}
            {isCheckingAvailability ? (
              <div className="text-center">
                <LoadingSpinner size="lg" text="Checking AI model availability..." />
              </div>
            ) : modelStatus.isDownloading ? (
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${modelStatus.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Downloading AI model... {modelStatus.progress}%
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  This may take 30-60 minutes. You can continue working, but AI features will be unavailable.
                </p>
              </div>
            ) : modelStatus.status === 'available' ? (
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-success-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircleIcon className="h-8 w-8 text-success" />
                </div>
                <h3 className="heading-4 text-gray-900 mb-2">AI model ready!</h3>
                <p className="text-sm text-gray-600">
                  Moving to next step...
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={handleDownloadModel}>
                  Download Model
                </Button>
                <Button variant="outline" size="lg" onClick={handleSkipOnboarding}>
                  Skip for Now
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Quick Tour Step
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress indicator */}
        <div className="flex justify-between items-center mb-8">
          <span className="text-sm text-gray-600">Step 2 of 2</span>
          <button
            onClick={handleSkipTour}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip Tour
          </button>
        </div>

        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mb-8">
            <PlayIcon className="h-10 w-10 text-primary" />
          </div>

          <h1 className="heading-2 text-gray-900 mb-4">
            Quick Tour
          </h1>
          <p className="body-large text-gray-600 mb-8">
            Learn how to create and collaborate on contracts with AI
          </p>

          {/* Tour Slide */}
          <div className="bg-gray-50 rounded-lg p-8 mb-8">
            <h3 className="heading-3 text-gray-900 mb-4">
              {tourSlides[currentSlide].title}
            </h3>
            <p className="body-large text-gray-600 mb-6">
              {tourSlides[currentSlide].description}
            </p>
            <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-sm">
                {tourSlides[currentSlide].illustration}
              </span>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center space-x-2 mb-8">
            {tourSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
              onClick={handlePreviousSlide}
              disabled={currentSlide === 0}
            >
              Previous
            </Button>
            
            {currentSlide === tourSlides.length - 1 ? (
              <Button
                onClick={handleFinishOnboarding}
                rightIcon={<ArrowRightIcon className="h-4 w-4" />}
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button
                onClick={handleNextSlide}
                rightIcon={<ArrowRightIcon className="h-4 w-4" />}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
