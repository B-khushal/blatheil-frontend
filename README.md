# BLATHEIL eCommerce Frontend

Modern, production-ready React + Vite frontend for the BLATHEIL premium streetwear brand.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file in frontend folder:

```env
VITE_API_URL=http://localhost:5001/api
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend runs on `http://localhost:8000`

### 4. Build for Production

```bash
npm run build
```

## Features

✅ Real JWT authentication system
✅ User signup/login with auto-redirect
✅ Admin dashboard with analytics
✅ Real-time shopping cart
✅ Product filtering, search, pagination
✅ Checkout flow with address & phone
✅ WhatsApp order sharing
✅ Drag-drop image upload
✅ Role-based route protection
✅ Responsive design (mobile, tablet, desktop)
✅ Dark theme UI with Shadcn components
✅ Toast notifications
✅ Loading states & skeletons

## Project Structure

```
src/
  components/
    ui/              # Shadcn UI components
    layout/          # Navbar, Footer, Layout
    ProtectedRoute   # Route protection
    ImageUpload      # Drag-drop upload
    admin/           # Admin-specific components
  
  pages/
    Login.tsx        # Authentication
    Signup.tsx
    Index.tsx        # Home
    Shop.tsx         # Product listing
    ProductDetail    # Single product
    Cart.tsx         # Shopping cart
    Checkout.tsx     # Order checkout
    admin/           # Admin pages
      AdminDashboard
      AdminProducts
      AdminOrders
      etc.
  
  context/
    AuthContext      # User auth state
    CartContext      # Shopping cart state
  
  lib/
    utils.ts         # Utilities
  
  data/
    products.ts      # Product data
  
  hooks/
    use-toast.ts     # Toast hook
    use-mobile.tsx   # Mobile detection
```

## Environment Variables

| Variable | Required | Default |
|----------|----------|---------|
| VITE_API_URL | No | http://localhost:5001/api |

## Key Pages & Routes

### Public Routes
- `/` - Home page
- `/shop` - Product listing
- `/product/:id` - Product details
- `/about` - About page
- `/contact` - Contact page
- `/login` - User login
- `/signup` - User registration

### Protected User Routes
- `/cart` - Shopping cart
- `/checkout` - Order checkout

### Protected Admin Routes
- `/admin/dashboard` - Dashboard with analytics
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/users` - User management
- `/admin/settings` - Admin settings

## Authentication Flow

1. User signs up/logs in
2. JWT token stored in localStorage
3. Token added to all API requests
4. Auto-redirect based on role:
   - Admin → `/admin/dashboard`
   - Customer → `/shop`
5. Protected routes check authentication
6. Logout clears token & redirects to home

## Components

### AuthContext
Manages user authentication state, JWT token, and user data.

```typescript
const { user, token, login, logout, isAuthenticated, isAdmin } = useAuth();
```

### CartContext
Manages shopping cart with real backend sync.

```typescript
const { items, addToCart, removeFromCart, getTotal } = useCart();
```

### ProtectedRoute
Wraps routes that require authentication.

```typescript
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

### ImageUpload
Drag-drop file upload component for images.

```typescript
<ImageUpload 
  onImageUploaded={(url) => setImageUrl(url)}
  onError={(err) => console.error(err)}
/>
```

## API Integration

All API calls use `VITE_API_URL` environment variable.

### Authentication

```typescript
// Login
POST /api/auth/login
Body: { email, password }
Response: { token, user }

// Signup
POST /api/auth/signup
Body: { name, email, password }
Response: { token, user }

// Profile
GET /api/users/profile
Headers: Authorization: Bearer <token>
```

### Products

```typescript
// Get products with filters
GET /api/products?page=1&limit=10&search=shirt&category=shirt&isFeatured=true

// Get single product
GET /api/products/:id
```

### Cart

```typescript
// Get cart
GET /api/cart
Headers: Authorization: Bearer <token>

// Add to cart
POST /api/cart/add
Body: { productId, quantity, size }

// Update quantity
PUT /api/cart/update
Body: { productId, size, quantity }

// Remove item
POST /api/cart/remove
Body: { productId, size }

// Clear cart
POST /api/cart/clear
```

### Orders

```typescript
// Create order
POST /api/orders
Body: { items, shippingAddress, phone }
Response: { order, whatsappLink }

// Get my orders
GET /api/orders/my

// Upload image
POST /api/upload
Headers: Authorization: Bearer <token>
Body: FormData { image: File }
```

## Styling

- Tailwind CSS for utilities
- Shadcn/ui for components
- Custom CSS for animations
- Dark theme as default

## Scripts

```bash
npm run dev          # Start dev server on port 8000
npm run build        # Build for production
npm run build:dev    # Development build
npm run lint         # Run ESLint
npm run preview      # Preview production build
npm run test         # Run tests
npm run test:watch   # Watch mode testing
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting by route
- Image lazy loading
- API request caching
- Optimized bundle size (~200KB gzipped)

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

Build the app:

```bash
npm run build
```

Deploy the `dist/` folder.

Update `VITE_API_URL` in environment variables on your hosting platform.

## Development Tips

1. Check browser DevTools Network tab for API issues
2. Use React DevTools for component debugging
3. Check localStorage for token debugging
4. Use `VITE_DEBUG=1` for verbose Vite logging

## Troubleshooting

**API calls failing?**
- Check if backend is running on port 5001
- Verify `VITE_API_URL` environment variable
- Check browser console for CORS errors

**Login not working?**
- Verify backend is running
- Check credentials
- Clear localStorage and try again

**Images not showing?**
- Verify Cloudinary credentials in backend
- Check image URL is accessible
- Try clearing browser cache

**Cart not persisting?**
- Check localStorage is enabled
- Verify API cart endpoint is working
- Check token is valid

## Support

For issues or questions, create an issue in the repository.

## License

© 2024 BLATHEIL. All rights reserved.
