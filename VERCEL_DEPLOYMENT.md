# Vercel Deployment Checklist

## Pre-Deployment Steps

### 1. Environment Variables Setup
Make sure all environment variables are configured in Vercel:

```bash
# Database
MONGODB_URI=mongodb+srv://dbUser:cakezone@cakezone.5mqnrtp.mongodb.net/?retryWrites=true&w=majority&appName=cakezone

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bGFzdGluZy1saXphcmQtODcuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_YoGVZhxt3X1lT3ezdPGvdxjylygpXKB9qwrijOWCpp
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboards
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboards

# Payment Processing (Stripe)
STRIPE_SECRET_KEY=sk_test_51RbL2KR6fXO0h8TaR38AosEZDirJW3ERyl7gFn8MIScqglkkJOGwsYZG6LRAFCnUb2hUggi3n4mGKzLSFQkPGU1200a4P0UXZj
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RbL2KR6fXO0h8TasDchCFeF4xcWrzX4SHrSiJ11HoVBKpTs81Ew0OwONo5bHaMA6zoCl41KoViAkst0BtsX7Z9P00eMKIjw3g

# NextAuth
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key
```

### 2. Database Seeding
Run the seed script to populate the database:
```bash
node scripts/seedCakesWithEnv.mjs
```

### 3. Image Assets
Verify all images are in the `/public` folder:
- ✓ Butterscoch-Fudge-Cake.jpg
- ✓ Marble-Cake-1.jpg
- ✓ Mocha-Chocolate-Cake.jpg
- ✓ Pineapple-Gateaux.jpg
- ✓ Ultimate-Chocolate-Cake.jpg
- ✓ Red-velvet-cake-1-1.jpg
- ✓ default-cake.png (fallback)

### 4. API Health Check
Test the API endpoints:
- `/api/health` - Basic health check
- `/api/cakes` - Fetch all cakes
- `/api/payments/create-payment-intent` - Payment processing

## Common Issues and Solutions

### Issue 1: "Neither apiKey nor config.authenticator provided"
**Solution:** Ensure `STRIPE_SECRET_KEY` is set in Vercel environment variables

### Issue 2: Images not showing on Vercel
**Solution:** 
- Verify image paths in database match actual files in `/public`
- Check image fallback is working
- Ensure `next.config.ts` has proper image configuration

### Issue 3: Database connection errors
**Solution:** 
- Verify `MONGODB_URI` is correctly set
- Check MongoDB Atlas IP whitelist includes 0.0.0.0/0 for Vercel
- Ensure database user has proper permissions

### Issue 4: Build errors
**Solution:**
- Check all environment variables are set
- Verify no TypeScript/ESLint errors
- Ensure all dependencies are properly installed

## Deployment Steps

1. **Push to Repository**
   ```bash
   git add .
   git commit -m "Fix menu images and environment variables"
   git push origin main
   ```

2. **Configure Vercel**
   - Add all environment variables in Vercel dashboard
   - Set `NEXTAUTH_URL` to your Vercel domain
   - Enable automatic deployments

3. **Deploy**
   - Vercel will automatically deploy on push
   - Monitor build logs for any errors
   - Test all functionality after deployment

4. **Post-Deployment Testing**
   - Test menu page loads correctly
   - Verify all images display properly
   - Check payment processing works
   - Test user authentication flows

## Monitoring

- Check Vercel function logs for any runtime errors
- Monitor database connections
- Verify image loading performance
- Test payment processing regularly
