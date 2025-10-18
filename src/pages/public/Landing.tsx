import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { 
  CheckCircleIcon, 
  ArrowRightIcon,
  ChevronDownIcon,
  ChartBarIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: ChartBarIcon,
      title: "Dynamic dashboard",
      description: "Pentecost helps legal teams work faster, smarter and more efficiently, delivering the visibility and data-driven insights to mitigate risk and ensure compliance.",
      buttonText: "Explore all",
      visual: "chart"
    },
    {
      icon: BellIcon,
      title: "Smart notifications",
      description: "Easily accessible from the notifications center, calendar or email with the relevant activities.",
      buttonText: "Explore all",
      visual: "notifications"
    },
    {
      icon: ClipboardDocumentListIcon,
      title: "Task management",
      description: "Discuss contract queries, manage tasks, secure approvals, track progress in the workspace.",
      buttonText: "Explore all",
      visual: "activity"
    }
  ];

  const integrations = [
    { name: "Slack", icon: "💬" },
    { name: "Notion", icon: "📝" },
    { name: "Google Drive", icon: "📁" },
    { name: "PayPal", icon: "💳" },
    { name: "Jira", icon: "🎯" },
    { name: "Asana", icon: "✅" },
    { name: "Google", icon: "🔍" },
    { name: "Salesforce", icon: "☁️" },
    { name: "HubSpot", icon: "🎯" },
    { name: "Zapier", icon: "⚡" },
    { name: "Shopify", icon: "🛒" },
    { name: "Microsoft", icon: "🪟" }
  ];

  const partners = [
    { name: "HubSpot", logo: "🟠" },
    { name: "Dropbox", logo: "📦" },
    { name: "Square", logo: "⬜" },
    { name: "Intercom", logo: "💬" },
    { name: "Grammarly", logo: "✍️" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-success rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">Pentecost</h1>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <div className="relative group">
                <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                  Solutions
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                </button>
              </div>
              <div className="relative group">
                <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                  Customers
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                </button>
              </div>
              <div className="relative group">
                <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                  Pricing
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                </button>
              </div>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Log In
              </Link>
              <Link to="/signup">
                <Button className="bg-success hover:bg-success-700 text-white">
                  Start Now
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center relative">
            {/* Collaboration avatars */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>+ CREATE FORFAST</span>
              </div>
            </div>
            
            {/* Main heading */}
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              One tool to <span className="text-success">manage</span> contracts and your team.
            </h1>
            
            {/* Subheading */}
            <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Pentecost helps legal teams work faster, smarter and more efficiently, delivering the visibility and data-driven insights to mitigate risk and ensure compliance.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/signup">
                <Button size="lg" className="bg-success hover:bg-success-700 text-white px-8 py-4 text-lg">
                  Start for Free
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-success text-success hover:bg-success hover:text-white px-8 py-4 text-lg">
                Get a Demo
              </Button>
            </div>

            {/* Collaboration visual */}
            <div className="relative">
              <div className="flex justify-center items-center space-x-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">{i}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-gray-600">More than 100+ companies partner</p>
          </div>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            {partners.map((partner, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-2xl">{partner.logo}</span>
                <span className="text-gray-600 font-medium">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-full mb-4">
              FEATURES
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Latest advanced technologies to ensure everything you needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Maximize your team's productivity and security with our affordable, user-friendly contract management system.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8">
                <div className="mb-6">
                  <feature.icon className="h-12 w-12 text-success mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                {/* Feature-specific content */}
                {feature.visual === "chart" && (
                  <div className="mb-6">
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm text-gray-500">Acme Inc.</span>
                        <span className="text-sm text-gray-500">2002</span>
                      </div>
                      <div className="flex items-end space-x-2 h-20">
                        <div className="bg-success w-8 h-16 rounded"></div>
                        <div className="bg-success w-8 h-12 rounded"></div>
                        <div className="bg-success w-8 h-20 rounded"></div>
                        <div className="bg-success w-8 h-8 rounded"></div>
                      </div>
                      <div className="text-right text-sm text-gray-500 mt-2">10K</div>
                    </div>
                  </div>
                )}
                
                {feature.visual === "notifications" && (
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">New messages, comment, or replies</span>
                      <div className="w-12 h-6 bg-success rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Social emails</span>
                      <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Announcement and Update</span>
                      <div className="w-12 h-6 bg-success rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Reminders</span>
                      <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {feature.visual === "activity" && (
                  <div className="mb-6">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Activity</h4>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-medium">BS</span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">Bill Sanders</p>
                            <p className="text-xs text-gray-500">Asked to sign a contract</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-sm font-medium">JC</span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">Jane Cooper</p>
                            <p className="text-xs text-gray-500">Uploaded a new contract</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                  {feature.buttonText}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 bg-success">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-success-700 text-white text-sm font-medium px-3 py-1 rounded-full mb-4">
              INTEGRATIONS
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Don't replace. Integrate.
            </h2>
            <p className="text-xl text-success-100 max-w-3xl mx-auto mb-8">
              We understand the hustle of replacing the long used tools in your process. That's why we integrate tools you use in your day-to-day work.
            </p>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-success">
              All Integrations
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-white rounded-lg p-4 flex flex-col items-center justify-center hover:shadow-lg transition-shadow">
                <span className="text-2xl mb-2">{integration.icon}</span>
                <span className="text-xs text-gray-600 text-center">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <span className="text-white text-lg">"</span>
              </div>
            </div>
            <blockquote className="text-3xl lg:text-4xl font-bold text-gray-900 leading-relaxed mb-8">
              Pentecost is helping our company to decrease operational expenses and turnaround time, while increasing the compliance, resource allocation and effectiveness of our contract management.
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">DR</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Darlene Robertson</p>
                <p className="text-gray-600">Head of Strategy at Mailchimp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-gray-900 mb-2">2021</div>
              <div className="text-gray-600">Pentecost Founded</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-gray-900 mb-2">50K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-gray-900 mb-2">1k+</div>
              <div className="text-gray-600">Company Partners</div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-success py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="h-5 w-5 text-success" />
                </div>
                <div className="ml-3">
                  <h3 className="text-xl font-semibold text-white">Pentecost</h3>
                </div>
              </div>
              <p className="text-success-100 mb-2">hello@pentecost.com</p>
              <p className="text-success-100">+1 (555) 123-4567</p>
            </div>
            
            {/* Solution Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Solution</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-success-100 hover:text-white">Why Pentecost</a></li>
                <li><a href="#" className="text-success-100 hover:text-white">Features</a></li>
                <li><a href="#" className="text-success-100 hover:text-white">Open AI</a></li>
                <li><a href="#" className="text-success-100 hover:text-white">Technology</a></li>
                <li><a href="#" className="text-success-100 hover:text-white">Security</a></li>
              </ul>
            </div>
            
            {/* Customer Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Customers</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-success-100 hover:text-white">Procurement</a></li>
                <li><a href="#" className="text-success-100 hover:text-white">Sales</a></li>
                <li><a href="#" className="text-success-100 hover:text-white">Legal</a></li>
                <li><a href="#" className="text-success-100 hover:text-white">Medium</a></li>
                <li><a href="#" className="text-success-100 hover:text-white">Enterprise</a></li>
              </ul>
            </div>
            
            {/* Resources Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-success-100 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-success-100 hover:text-white">Contact Sales</a></li>
                <li><a href="#" className="text-success-100 hover:text-white">Changelog</a></li>
                <li><a href="#" className="text-success-100 hover:text-white">Blog</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Footer */}
          <div className="border-t border-success-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-success-100 text-sm">
              © Copyright 2025 Pentecost. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-success-100 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-success-100 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-success-100 hover:text-white">
                <span className="sr-only">YouTube</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.316 2.316A1 1 0 013.684 1h12.632a1 1 0 01.368 1.316L14 6l-1.316 3.684a1 1 0 01-.368.316H3.684a1 1 0 01-.368-.316L2 6l.316-3.684zM4 8v6a2 2 0 002 2h8a2 2 0 002-2V8H4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-success-100 hover:text-white">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
