# Mumbai Police Volunteer Portal

## Overview

This is a full-stack web application designed for the Mumbai Police volunteer management system. The platform serves two primary user types: police officers who create and manage volunteer opportunities, and citizens who can apply for these opportunities and earn credits for their participation. The system includes a rewards store where volunteers can redeem their earned credits for various benefits and discounts from partner brands.

The application features a modern tech stack with React frontend, Express.js backend, PostgreSQL database with Drizzle ORM, and session-based authentication. It's built with TypeScript throughout for type safety and uses Tailwind CSS with shadcn/ui components for a polished user interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript and follows a component-based architecture. The UI uses shadcn/ui components built on top of Radix UI primitives, providing accessible and customizable interface elements. State management is handled through React Query (@tanstack/react-query) for server state and React hooks for local state. The routing system uses Wouter for lightweight client-side navigation.

The frontend implements three main interfaces:
- **Police Dashboard**: For officers to create and manage volunteer opportunities
- **Citizen Portal**: For volunteers to browse and apply for opportunities
- **Rewards Store**: For redeeming earned credits for various rewards

### Backend Architecture
The server is built with Express.js and follows a RESTful API design pattern. The application uses a modular structure with separate files for authentication, database configuration, route handling, and storage operations. Session-based authentication is implemented using Passport.js with local strategy for username/password authentication.

The backend provides comprehensive API endpoints for:
- User authentication and registration
- Opportunity management (CRUD operations)
- Application processing and status tracking
- Credit system and transaction management
- Rewards redemption functionality

### Database Design
The database uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema includes:

- **Users**: Stores user information with role-based access (police/citizen)
- **Opportunities**: Volunteer opportunities with categories, location, and credit rewards
- **Applications**: Links users to opportunities with status tracking
- **Transactions**: Credit earning and spending history
- **Redemptions**: Reward redemption records
- **Rewards**: Available rewards catalog

The system uses enums for standardized values (user types, opportunity categories, application statuses) and includes proper foreign key relationships with cascading operations.

### Authentication & Authorization
The application implements session-based authentication using express-session with PostgreSQL session storage. Password security uses Node.js crypto module with scrypt for hashing and salt generation. Role-based access control differentiates between police officers and citizens, with protected routes enforcing appropriate permissions.

### Development & Build System
The project uses Vite for fast development and building, with TypeScript compilation and hot module replacement. The build process creates separate client and server bundles, with the client assets served statically in production. Path aliases are configured for clean imports, and the development setup includes runtime error overlays and Replit-specific tooling.

## External Dependencies

### Database & ORM
- **Neon Database**: PostgreSQL database hosting with serverless connections
- **Drizzle ORM**: Type-safe database operations with automatic migration support
- **connect-pg-simple**: PostgreSQL session store for express-session

### Authentication & Security
- **Passport.js**: Authentication middleware with local strategy implementation
- **express-session**: Session management with secure configuration
- **Node.js crypto**: Built-in cryptographic functions for password hashing

### Frontend Libraries
- **React Query**: Server state management, caching, and data synchronization
- **Radix UI**: Accessible component primitives for the design system
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Wouter**: Minimalist routing library for React applications
- **React Hook Form**: Form handling with validation support

### UI Components & Styling
- **shadcn/ui**: Pre-built component library with customizable design tokens
- **Lucide React**: Icon library with consistent design language
- **class-variance-authority**: Utility for creating variant-based component APIs
- **Tailwind CSS variables**: CSS custom properties for theme consistency

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit tooling**: Development environment integration and error handling