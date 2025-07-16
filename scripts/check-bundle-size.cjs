const fs = require('fs');
const path = require('path');

function checkBundleSize() {
  const distPath = path.join(process.cwd(), 'dist');
  let totalSize = 0;

  function getSize(dirPath) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        getSize(filePath);
      } else {
        totalSize += stats.size;
      }
    });
  }

  if (fs.existsSync(distPath)) {
    getSize(distPath);
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    
    console.log(`📦 Bundle size: ${sizeMB} MB`);
    
    // Size thresholds
    if (totalSize > 5 * 1024 * 1024) {
      console.error('❌ Bundle size exceeds 5MB');
      process.exit(1);
    } else if (totalSize > 2 * 1024 * 1024) {
      console.warn('⚠️ Bundle size above 2MB - optimization recommended');
    } else {
      console.log('✅ Bundle size optimal');
    }
  }
}

checkBundleSize();