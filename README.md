# 🍰 CakeZone - Next.js E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-✓-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

A comprehensive, AI-powered cake ordering platform with advanced business intelligence, inventory management, and automated pricing systems. Built with modern web technologies and designed for scalability.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Key Integrations](#-key-integrations)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🛒 E-Commerce Features
- **Complete Shopping Experience** - Browse cakes, add to cart, and secure checkout
- **Stripe Payment Integration** - Secure payment processing with PCI compliance
- **Order Management** - Real-time order tracking and history
- **Delivery Scheduling** - Custom delivery date selection for each order
- **AI Cake Recommendations** - Budget-based suggestions powered by OpenAI

### 📊 Business Intelligence
- **Real-time Analytics Dashboard** - Sales metrics, weekly trends, and monthly comparisons
- **Price Forecasting** - ML-powered ingredient price predictions using linear regression
- **AI Financial Advisor** - Intelligent business insights and recommendations
- **Expense Tracking** - Comprehensive expense management with categorization
- **PDF Report Generation** - Export detailed business reports

### 💼 Business Management
- **Automated Pricing System** - Dynamic pricing based on ingredients, labor, overhead, and profit margins
- **Recipe Management** - Create and manage recipes with ingredient tracking
- **Ingredient Inventory** - Track ingredient costs with historical price data
- **Notification System** - Multi-tier notifications (order updates, promotions, system announcements)

### 🎨 User Experience
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **3D Cake Visualization** - Interactive 3D models using Three.js
- **Real-time Updates** - Live data synchronization across the platform
- **Animated UI** - Smooth transitions and interactions with Framer Motion

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15.3.5 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS + shadcn/ui components
- **Animations:** Framer Motion
- **Charts:** Recharts
- **3D Graphics:** Three.js + React Three Fiber

### Backend
- **Runtime:** Node.js
- **API:** Next.js API Routes (REST)
- **Database:** MongoDB + Mongoose
- **ORM:** Prisma (optional adapter)

### Authentication & Payments
- **Auth:** Clerk + NextAuth
- **Payments:** Stripe (PaymentIntent API)
- **Webhooks:** Svix

### AI & Analytics
- **AI Platform:** OpenAI (GPT-3.5-turbo)
- **Statistics:** simple-statistics, regression
- **PDF Generation:** jsPDF + jspdf-autotable

### Development Tools
- **Package Manager:** npm
- **Bundler:** Turbopack
- **Linter:** ESLint
- **Testing:** Jest + React Testing Library

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- MongoDB database (local or MongoDB Atlas)
- Stripe account (for payments)
- Clerk account (for authentication)
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SDRasanjana/Cake-Zone-Next.git
   cd Cake-Zone-Next
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory and add the required environment variables (see [Environment Variables](#-environment-variables) section).

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

```bash
npm run build
npm start
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboards
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboards

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_api_key
```

**Security Notes:**
- Never commit `.env.local` to version control
- Use different API keys for development and production
- For production, use live Stripe keys instead of test keys

---

## 📁 Project Structure

```
Cake-Zone-Next/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication routes
│   ├── api/                 # API routes
│   │   ├── cakes/          # Cake management
│   │   ├── orders/         # Order processing
│   │   ├── dashboard/      # Dashboard data
│   │   ├── expenses/       # Expense tracking
│   │   ├── financial-advisor/  # AI advisor
│   │   ├── notifications/  # Notification system
│   │   └── webhooks/       # Stripe/Clerk webhooks
│   ├── dashboards/         # Role-based dashboards
│   │   ├── Owner/          # Owner dashboard
│   │   ├── admin/          # Admin dashboard
│   │   └── customer/       # Customer dashboard
│   ├── menu/               # Cake catalog
│   ├── shopping-cart/      # Shopping cart
│   ├── checkout/           # Checkout process
│   ├── about/              # About page
│   └── contact/            # Contact page
├── components/              # Reusable React components
│   ├── dashboard/          # Dashboard components
│   ├── Navbar.tsx          # Navigation bar
│   ├── CartDrawer.tsx      # Shopping cart drawer
│   └── ...
├── contexts/               # React context providers
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and configurations
├── data/                   # Static data and constants
├── public/                 # Static assets
├── scripts/                # Utility scripts
└── test/                   # Test files
```

---

## 👥 User Roles

### Customer
- Browse and search cake catalog
- Add cakes to cart and checkout
- View order history and track orders
- Manage personal notifications
- Access customer dashboard

### Owner
- All customer features
- Full dashboard with sales analytics
- Manage cakes, recipes, and ingredients
- Track expenses and generate reports
- View financial advisor recommendations
- Access price forecasting tools

### Admin
- All owner features
- User management and administration
- Create and manage system-wide notifications
- Control pricing and inventory
- System configuration and settings

**Role Assignment:** User roles are managed through Clerk's `publicMetadata.role` field.

---

## 📡 API Documentation

### Core Endpoints

#### Cakes
- `GET /api/cakes` - List all cakes
- `POST /api/cakes` - Create new cake (admin/owner)
- `PUT /api/cakes/:id` - Update cake (admin/owner)
- `DELETE /api/cakes/:id` - Delete cake (admin/owner)

#### Orders
- `GET /api/orders` - List user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id` - Update order status (admin/owner)

#### Dashboard
- `GET /api/dashboard/stats?period=current|last` - Get dashboard statistics
- `GET /api/dashboard/weekly-sales` - Get weekly sales data

#### Notifications
- `GET /api/notifications` - Fetch notifications
- `POST /api/notifications` - Create notification (admin)
- `PATCH /api/notifications/:id` - Update/mark as read
- `DELETE /api/notifications/:id` - Delete notification (admin)

#### Financial
- `POST /api/financial-advisor/generate-advice` - Get AI financial advice
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Add expense

#### Price Forecasting
- `GET /api/ingredients/forecast` - Get ingredient price forecasts
- `POST /api/ingredients/forecast/update` - Update forecast data

For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md) (if available).

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   - Add all required environment variables in Vercel project settings
   - Update `NEXTAUTH_URL` to your Vercel domain

4. **Deploy**
   - Vercel will automatically build and deploy your application

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Other Platforms
- **Docker:** See [Docker configuration](Dockerfile) (if available)
- **Self-hosted:** Build with `npm run build` and serve with `npm start`

---

## 🔗 Key Integrations

### Clerk Authentication
- **Purpose:** User authentication and role-based access control
- **Features:** Sign up, sign in, user profiles, role management
- **Documentation:** [Clerk Docs](https://clerk.com/docs)

### Stripe Payments
- **Purpose:** Secure payment processing
- **Features:** PaymentIntent API, webhooks, refunds
- **Documentation:** [Stripe Docs](https://stripe.com/docs)

### MongoDB Database
- **Purpose:** Primary data storage
- **Collections:** users, orders, cakes, recipes, ingredients, expenses, notifications
- **Documentation:** [MongoDB Docs](https://docs.mongodb.com/)

### OpenAI API
- **Purpose:** AI-powered features
- **Features:** Cake recommendations, financial advisor
- **Documentation:** [OpenAI Docs](https://platform.openai.com/docs)

---

## 📚 Documentation

Additional documentation files in this repository:

- **[DASHBOARD_README.md](DASHBOARD_README.md)** - Dashboard features and usage
- **[NOTIFICATION_SYSTEM_README.md](NOTIFICATION_SYSTEM_README.md)** - Notification system documentation
- **[FINANCIAL_ADVISOR_README.md](FINANCIAL_ADVISOR_README.md)** - AI financial advisor guide
- **[CAKE_PRICING_SYSTEM_COMPLETE.md](CAKE_PRICING_SYSTEM_COMPLETE.md)** - Automated pricing system
- **[PRICE_FORECASTING_SETUP.md](PRICE_FORECASTING_SETUP.md)** - Price forecasting setup guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment instructions
- **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** - Vercel-specific deployment guide

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow TypeScript best practices
- Use ESLint configuration provided
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 🧪 Testing

Run tests with:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact & Support

- **Repository:** [SDRasanjana/Cake-Zone-Next](https://github.com/SDRasanjana/Cake-Zone-Next)
- **Issues:** [GitHub Issues](https://github.com/SDRasanjana/Cake-Zone-Next/issues)

---

## 🌟 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Authentication by [Clerk](https://clerk.com/)
- Payments by [Stripe](https://stripe.com/)
- AI powered by [OpenAI](https://openai.com/)

---

<div align="center">
  <p>Made with ❤️ for the cake industry</p>
  <p>⭐ Star this repo if you find it useful!</p>
</div>
