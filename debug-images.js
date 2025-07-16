// Debug script to test image loading
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const imageFiles = [
    'Butterscoch-Fudge-Cake.jpg',
    'Marble-Cake-1.jpg',
    'Mocha-Chocolate-Cake.jpg',
    'Pineapple-Gateaux.jpg',
    'Red-velvet-cake-1-1.jpg',
    'Ultimate-Chocolate-Cake.jpg',
    'default-cake.png'
];

console.log('Checking image files in public directory...');
console.log('Public directory path:', publicDir);
console.log('Directory exists:', fs.existsSync(publicDir));

imageFiles.forEach(filename => {
    const filePath = path.join(publicDir, filename);
    const exists = fs.existsSync(filePath);
    console.log(`${filename}: ${exists ? '✓' : '✗'} (${exists ? 'exists' : 'missing'})`);

    if (exists) {
        const stats = fs.statSync(filePath);
        console.log(`  Size: ${(stats.size / 1024).toFixed(2)} KB`);
    }
});

console.log('\nAll files in public directory:');
if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir).filter(f => f.match(/\.(jpg|jpeg|png|gif|webp)$/i));
    files.forEach(file => console.log(`  ${file}`));
}
