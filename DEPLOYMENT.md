# Deployment Instructions for Vercel

## Environment Variables Setup

To fix the "Neither apiKey nor config.authenticator provided" error, you need to configure environment variables in Vercel:

### Step 1: Add Environment Variables to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

```
STRIPE_SECRET_KEY=sk_test_51RbL2KR6fXO0h8TaR38AosEZDirJW3ERyl7gFn8MIScqglkkJOGwsYZG6LRAFCnUb2hUggi3n4mGKzLSFQkPGU1200a4P0UXZj
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RbL2KR6fXO0h8TasDchCFeF4xcWrzX4SHrSiJ11HoVBKpTs81Ew0OwONo5bHaMA6zoCl41KoViAkst0BtsX7Z9P00eMKIjw3g
MONGODB_URI=mongodb+srv://dbUser:cakezone@cakezone.5mqnrtp.mongodb.net/?retryWrites=true&w=majority&appName=cakezone
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bGFzdGluZy1saXphcmQtODcuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_YoGVZhxt3X1lT3ezdPGvdxjylygpXKB9qwrijOWCpp
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboards
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboards
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key
```

### Step 2: Update NEXTAUTH_URL

Make sure to replace `https://your-vercel-domain.vercel.app` with your actual Vercel deployment URL.

### Step 3: Redeploy

After adding the environment variables, trigger a new deployment by:
- Pushing a new commit to your repository, or
- Going to the Deployments tab and clicking "Redeploy"

## Security Notes

- **NEVER** commit sensitive environment variables like API keys to your repository
- Use different API keys for development and production
- The `.env.local` file is for local development only and is not deployed to Vercel
- For production, use live Stripe keys instead of test keys

## Troubleshooting

If you continue to get errors:

1. Verify all environment variables are correctly set in Vercel
2. Check that there are no typos in variable names
3. Ensure you're using the correct Stripe API version
4. Check the Vercel function logs for more detailed error messages
