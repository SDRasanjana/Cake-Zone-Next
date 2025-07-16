// Test image paths for Vercel deployment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');

// Image paths from database
const imagePaths = [
    '/Butterscoch-Fudge-Cake.jpg',
    '/Marble-Cake-1.jpg',
    '/Mocha-Chocolate-Cake.jpg',
    '/Pineapple-Gateaux.jpg',
    '/Ultimate-Chocolate-Cake.jpg',
    '/Red-velvet-cake-1-1.jpg',
    '/default-cake.png'
];

console.log('🔍 Testing image paths for Vercel deployment...\n');

imagePaths.forEach(imagePath => {
    // Remove leading slash for file system check
    const filename = imagePath.substring(1);
    const fullPath = path.join(publicDir, filename);

    if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        console.log(`✅ ${imagePath} - ${(stats.size / 1024).toFixed(1)}KB`);
    } else {
        console.log(`❌ ${imagePath} - NOT FOUND`);
    }
});

console.log('\n📋 Vercel Image URL Test:');
console.log('These URLs should work in production:');
imagePaths.forEach(imagePath => {
    console.log(`https://your-vercel-domain.vercel.app${imagePath}`);
});

console.log('\n🛠️  Next.js Image Component Test:');
console.log('Image src values that should work:');
imagePaths.forEach(imagePath => {
    console.log(`src="${imagePath}"`);
});

console.log('\n✅ All tests completed. If all images show ✅, they should work on Vercel.');
