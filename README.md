# EasyBima Admin Portal

## 🚀 Executive Summary

EasyBima Admin Portal is a comprehensive insurance administration platform designed to streamline policy management, client interactions, and business operations for CIC insurance . This modern web application provides a robust, secure, and user-friendly interface for administrators and agents to manage the entire insurance lifecycle efficiently.

## 🌟 Key Features

- **User Authentication & Authorization**
  - Secure JWT-based authentication
  - Role-based access control (Admin, User)
  - Session management with refresh tokens

- **Dashboard & Analytics**
  - Real-time business insights
  - Policy and revenue metrics
  - Interactive data visualizations

- **Policy Management**
  - End-to-end policy lifecycle management
  - Document generation and storage
  - Premium calculations

- **Client Management**
  - Client profiles and history
  - Communication logs
  - Document management

- **Commission Tracking**
  - Automated commission calculations
  - Payout tracking
  - Agent performance analytics

## 🛠 Technology Stack

### Frontend
- **reactjs**
  - React framework with server-side rendering
  - File-based routing
  - API routes
  - *Why?* Excellent developer experience, performance optimizations, and SEO benefits

- **TypeScript**
  - Static type checking
  - Better developer experience
  - *Why?* Reduces runtime errors and improves code maintainability

- **Tailwind CSS**
  - Utility-first CSS framework
  - Responsive design
  - *Why?* Rapid UI development with consistent design system

- **Shadcn/UI**
  - Accessible, unstyled components
  - Built with Radix UI primitives
  - *Why?* Customizable design system with great accessibility

### Backend
- **Node.js with Express**
  - JavaScript runtime
  - RESTful API architecture
  - *Why?* Non-blocking I/O, large ecosystem, and great performance

- **PostgreSQL with Sequelize ORM**
  - Relational database
  - Data modeling and migrations
  - *Why?* Data integrity, complex queries, and relationships

- **JWT Authentication**
  - Secure token-based authentication
  - Role-based access control
  - *Why?* Stateless, scalable, and secure

- **ESLint & Prettier**
  - Code quality and formatting
  - Consistent code style
  - *Why?* Maintainable and clean codebase

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- oracle db
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd Easybima-admin
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cp server/.env.local server/.env.example
   
   # Frontend
   cp frontend/.env.local.example frontend/.env.local
   ```

3. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

4. **Database setup**
   ```bash
   # Run migrations
   cd ../server
   npx sequelize-cli db:migrate
   
   # Seed initial data (optional)
   npx sequelize-cli db:seed:all
   ```

5. **Running the application**
   ```bash
   # Start backend server
   cd server
   npm run dev
   
   # In a new terminal, start frontend
   cd frontend
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 🏗 Project Structure

```
Easybima-admin/
├── frontend/               # Next.js frontend application
│   ├── app/                # App router pages and layouts
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React context providers
│   ├── lib/                # Utility functions
│   ├── services/           # API service layer
│   └── types/              # TypeScript type definitions
│
└── server/                # Express backend
    ├── src/
    │   ├── config/         # Configuration files
    │   ├── controllers/     # Route controllers
    │   ├── middleware/      # Express middlewares
    │   ├── models/          # Database models
    │   ├── routes/          # API routes
    │   └── services/        # Business logic
    └── migrations/          # Database migrations
```

## 🔒 Security Features

- **Authentication**
  - JWT with HTTP-only cookies
  - CSRF protection
  - Rate limiting

- **Authorization**
  - Role-based access control (RBAC)
  - Route protection
  - Permission middleware

- **Data Protection**


## 📈 Performance Optimizations

- **Frontend**
  - Code splitting and lazy loading with Next.js dynamic imports
  - Image optimization with Next.js Image component
  - Client-side caching strategies
  - Efficient state management with React Context and hooks
  - Bundle size optimization with tree-shaking

- **Backend**
  - Response compression
  - Database query optimization and indexing
  - Redis caching for frequently accessed data
  - Connection pooling for database connections

- **Infrastructure**
  - Containerization with Docker for consistent environments
  - Horizontal scaling capabilities
  - CDN integration for static assets
  - Load balancing for high availability
  - Monitoring and performance metrics with Prometheus/Grafana

## 🧪 Testing Strategy

- **Unit Testing**
  - Jest for JavaScript/TypeScript unit tests
  - React Testing Library for component testing
  - Test coverage reporting with Istanbul

- **Integration Testing**
  - API endpoint testing with Supertest
  - Database integration tests
  - Authentication flow testing

- **End-to-End Testing**
  - Cypress for browser automation
  - User journey testing
  - Visual regression testing

- **Performance Testing**
  - Load testing with k6
  - Stress testing for system limits
  - Lighthouse audits for frontend performance

## 🚀 Deployment

### Prerequisites
- Docker and Docker Compose
- Node.js 18+
- PostgreSQL 13+
- Redis (for caching)

### Environment Setup
1. Clone the repository
2. Set up environment variables
3. Install dependencies
4. Run database migrations
5. Build the application
6. Start the services

### CI/CD Pipeline
- GitHub Actions for automated testing
- Automated deployment to staging/production
- Blue-green deployment strategy
- Automated rollback on failure

## 📚 Documentation

- **API Documentation**
  - Swagger/OpenAPI specifications
  - Postman collection
  - Example requests and responses

- **Developer Documentation**
  - Setup instructions
  - Code style guide
  - Contribution guidelines
  - Architecture decisions record (ADR)

- **User Documentation**
  - Admin guide
  - User manual
  - FAQ

## 🤝 Contributing


1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ✨ Contributors

- [francis.mwangi]

## 🙏 Acknowledgments


<div align="center">
  Made with ❤️ by [francis.mwangi]
</div>
  - Code splitting
  - Lazy loading
  - Image optimization
  - Client-side caching

- **Backend**
  - Response compression
  - Query optimization
  - Caching layer
  - Connection pooling

## 🧪 Testing Strategy

- **Unit Testing**
  - Jest for JavaScript/TypeScript
  - React Testing Library for components

- **Integration Testing**
  - API endpoint testing
  - Database integration tests

- **E2E Testing**
  - Cypress for browser automation
  - User flow testing

## 📚 Documentation

- **API Documentation**
  - Swagger/OpenAPI
  - Postman collection

- **Component Library**
  - Storybook for UI components
  - Usage examples

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<div align="center">
  Made with ❤️ by [francis, Andy, Arnold]
</div>
