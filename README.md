# Pentecost Frontend

Contract negotiations across languages. Simplified.

A multilingual contract collaboration platform enabling parties speaking different languages to negotiate, edit, and finalize contracts using AI-powered translation and Git-like version control.

## Features

- **Multilingual Support**: AI-powered translation for seamless cross-language collaboration
- **Git-like Version Control**: Track changes, create branches, and merge contract versions
- **Real-time Collaboration**: Comments, notifications, and live editing
- **AI-Powered Tools**: Grammar checking, proofreading, and text rewriting
- **Professional UI**: Clean, minimal design optimized for legal workflows

## Tech Stack

- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API + useReducer
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **API Client**: Axios
- **AI Integration**: Chrome Built-in AI APIs
- **Build Tool**: Vite
- **Package Manager**: npm

## Prerequisites

- Node.js 18+ 
- Chrome 127+ with AI features enabled (for AI functionality)
- Backend API running on `http://localhost:3000/api/v1`

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pentecost-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update environment variables in `.env`:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_ENABLE_AI_FEATURES=true
```

## Tailwind CSS Setup

This project uses the latest Tailwind CSS with Vite plugin approach:

- **Installation**: `tailwindcss` and `@tailwindcss/vite` packages
- **Configuration**: Vite plugin in `vite.config.ts`
- **CSS Import**: `@import "tailwindcss"` in `src/index.css`
- **Config File**: `tailwind.config.js` with custom color scheme

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Chrome AI Setup

To use AI features, you need:

1. Chrome version 127+ with AI features enabled
2. Enroll in Chrome Built-in AI Early Preview Program
3. Enable AI features in Chrome settings

The application will detect if AI APIs are available and show appropriate fallback messages if not.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Common UI components
│   ├── contract/       # Contract-specific components
│   ├── version/        # Version control components
│   └── collaboration/  # Collaboration components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── public/         # Public pages (login, signup)
│   └── private/        # Protected pages
├── services/           # API and external services
│   ├── api/            # API client and endpoints
│   ├── ai/             # AI service integrations
│   └── storage/        # Local storage utilities
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main application component
```

## Key Features Implementation

### Authentication
- JWT-based authentication with refresh tokens
- Role-based access control (contract creator, reviewer, admin)
- Protected routes and automatic token refresh

### Contract Management
- Create, edit, and manage contracts
- Real-time collaboration with multiple parties
- Version control with commit history and branching

### AI Integration
- **Translator**: Real-time translation between languages
- **Proofreader**: Grammar and spelling error detection
- **Rewriter**: Alternative phrasing suggestions

### Version Control
- Git-like commit system for contract changes
- Branch creation and merging for alternative terms
- Diff viewer for comparing versions

## API Endpoints

The frontend consumes the following API endpoints:

### Authentication
- `POST /auth/login` - User authentication
- `POST /auth/signup` - User registration
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/me` - Get current user info
- `POST /auth/logout` - User logout

### Contracts
- `GET /contracts` - List user contracts
- `GET /contracts/:id` - Get specific contract
- `POST /contracts` - Create new contract
- `PUT /contracts/:id` - Update contract
- `DELETE /contracts/:id` - Delete contract
- `POST /contracts/:id/share` - Share contract with users
- `POST /contracts/:id/sign` - Sign contract
- `POST /contracts/:id/finalize` - Finalize contract

### Version Control
- `GET /contracts/:id/versions?branch=main` - Get version history
- `POST /contracts/:id/versions/commit` - Commit changes
- `GET /contracts/:id/versions/pull` - Pull latest changes
- `GET /contracts/:id/versions/diff` - Compare versions
- `POST /contracts/:id/versions/rollback` - Rollback to version

### Branches
- `GET /contracts/:id/branches` - List branches
- `POST /contracts/:id/branches` - Create branch
- `POST /contracts/:id/branches/merge` - Merge branches
- `DELETE /contracts/:id/branches` - Delete branch

### Collaboration
- `GET /contracts/:id/comments` - Get comments
- `POST /contracts/:id/comments` - Add comment
- `PUT /contracts/:id/comments/:commentId` - Update comment
- `DELETE /contracts/:id/comments/:commentId` - Delete comment

### Notifications
- `GET /notifications` - Get notifications
- `PUT /notifications/:id/read` - Mark notification as read
- `DELETE /notifications/:id` - Delete notification

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Testing

```bash
npm run test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the repository.