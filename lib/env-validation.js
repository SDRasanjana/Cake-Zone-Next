/**
 * Environment variable validation utility
 * This helps ensure all required environment variables are present
 */

const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'MONGODB_URI',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXTAUTH_SECRET'
];

export function validateEnvVars() {
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        console.error('Missing required environment variables:', missing);
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    return true;
}

export function getStripeConfig() {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }

    return {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    };
}
