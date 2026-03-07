# Mekness Limited - Forex Trading Platform

## Overview

Mekness Limited is a luxury forex trading platform designed with a premium black and gold aesthetic. The platform provides forex traders with a comprehensive suite of tools including account management, trading history tracking, document management, and deposit/withdrawal capabilities. The application emphasizes a futuristic, high-tech design language inspired by premium fintech platforms like Revolut Metal and Stripe Dashboard, combined with trading interfaces reminiscent of TradingView and Bloomberg Terminal.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript and Vite as the build tool

**Routing**: Wouter for lightweight client-side routing with distinct public and authenticated sections

**UI Component System**: shadcn/ui components built on Radix UI primitives, providing accessible, customizable components with consistent styling

**Styling Approach**: 
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming (supports light/dark modes)
- Custom design system based on metallic gold (#D4AF37) and pure black (#000000) color palette
- Glass morphism effects and gold glows for premium aesthetic
- Framer Motion for sophisticated animations and transitions

**State Management**: TanStack Query (React Query) for server state management with custom query client configuration

**Form Handling**: React Hook Form with Zod validation via @hookform/resolvers for type-safe form validation

**Typography**: Inter for UI/data display and Poppins for headlines, loaded via Google Fonts

### Backend Architecture

**Runtime & Framework**: Node.js with Express.js for REST API endpoints

**Language**: TypeScript with strict type checking enabled

**Session Management**: express-session with connect-pg-simple for PostgreSQL-backed sessions (HTTP-only cookies for security)

**Authentication**: 
- bcryptjs for password hashing
- Session-based authentication (no JWT tokens currently implemented despite package presence)
- User sessions stored in database

**API Design**: RESTful endpoints under `/api` prefix with structured error handling and response logging

**Development Server**: Custom Vite integration middleware for HMR (Hot Module Replacement) in development

### Data Layer

**ORM**: Drizzle ORM for type-safe database operations

**Database**: 
- PostgreSQL via Neon serverless driver (@neondatabase/serverless)
- WebSocket support for serverless connection pooling
- Configured for PostgreSQL dialect with migrations directory

**Schema Design**:
- Users table with authentication and profile fields
- Trading accounts (Live, Demo, Bonus types) with balance tracking
- Deposits and withdrawals with status tracking
- Trading history for transaction records
- Documents with upload status and verification
- Notifications system

**Storage Abstraction**: IStorage interface pattern for potential database implementation swapping

### Authentication & Authorization

**Strategy**: Session-based authentication with server-side session storage in PostgreSQL

**Security Measures**:
- Password hashing with bcrypt (10 rounds)
- HTTP-only cookies to prevent XSS attacks
- Session middleware for protecting authenticated routes
- CORS configuration for cross-origin requests

**User Flow**:
- Sign up creates hashed password and auto-generates username from email
- Sign in validates credentials and establishes session
- Session user ID retrieved via middleware helper function

### Build & Deployment

**Development**:
- Vite dev server with HMR
- tsx for TypeScript execution without compilation
- Separate client and server processes

**Production Build**:
- Vite bundles frontend to `dist/public`
- esbuild bundles backend to `dist/index.js` as ESM
- Static asset serving from compiled frontend

**Configuration**:
- Path aliases for clean imports (@/, @shared/, @assets/)
- Module resolution set to "bundler" mode
- Incremental compilation for faster rebuilds

## External Dependencies

### UI Component Libraries
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives (accordion, dialog, dropdown, select, tooltip, etc.)
- **cmdk**: Command palette component for search/navigation
- **framer-motion**: Animation library for sophisticated UI transitions and effects
- **lucide-react**: Icon library for consistent iconography

### Form & Validation
- **react-hook-form**: Performant form state management
- **zod**: TypeScript-first schema validation
- **@hookform/resolvers**: Bridge between react-hook-form and zod

### Data Fetching
- **@tanstack/react-query**: Server state management with caching, background updates, and optimistic UI

### Database & ORM
- **drizzle-orm**: TypeScript ORM for type-safe database queries
- **drizzle-kit**: Migration and schema management tooling
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon
- **connect-pg-simple**: PostgreSQL session store for express-session

### Authentication & Security
- **bcryptjs**: Password hashing library
- **express-session**: Session middleware for Express

### Styling
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Variant-based component styling
- **clsx** & **tailwind-merge**: Conditional className utilities

### Development Tools
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution engine
- **esbuild**: Fast JavaScript bundler for backend
- **@replit/vite-plugin-***: Replit-specific dev tools (error overlay, cartographer, dev banner)

### Utilities
- **date-fns**: Date manipulation library
- **nanoid**: Unique ID generation
- **ws**: WebSocket client for Neon database connections