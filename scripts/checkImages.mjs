// Check if all image files exist in the public directory
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');
const expectedImages = [
    'Butterscoch-Fudge-Cake.jpg',
    'Marble-Cake-1.jpg',
    'Mocha-Chocolate-Cake.jpg',
    'Pineapple-Gateaux.jpg',
    'Ultimate-Chocolate-Cake.jpg',
    'Red-velvet-cake-1-1.jpg',
    'default-cake.png'
];

console.log('Checking image files in public directory...');
console.log('Public directory:', publicDir);
console.log('=' * 50);

const missingFiles = [];
const existingFiles = [];

expectedImages.forEach(filename => {
    const filepath = path.join(publicDir, filename);
    if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        console.log(`✅ ${filename} (${(stats.size / 1024).toFixed(1)}KB)`);
        existingFiles.push(filename);
    } else {
        console.log(`❌ ${filename} - NOT FOUND`);
        missingFiles.push(filename);
    }
});

console.log('\n' + '=' * 50);
console.log(`Summary: ${existingFiles.length} found, ${missingFiles.length} missing`);

if (missingFiles.length > 0) {
    console.log('\nMissing files:');
    missingFiles.forEach(file => console.log(`  - ${file}`));
}

// Check what files actually exist in public
console.log('\nAll files in public directory:');
const allFiles = fs.readdirSync(publicDir).filter(file =>
    file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')
);
allFiles.forEach(file => console.log(`  - ${file}`));
