const fs = require('fs');
const path = require('path');

console.log('🔍 TESTING PUBLIC ACCESS FIXES\n');

// Test 1: Check AppRouter.tsx for ProtectedRoute removal
console.log('✅ 1. Checking AppRouter.tsx...');
try {
  const appRouterPath = path.join(__dirname, '..', 'src', 'AppRouter.tsx');
  const appRouterContent = fs.readFileSync(appRouterPath, 'utf8');
  
  const hasBrowseVenuesProtected = appRouterContent.includes('<ProtectedRoute><BrowseVenuesPage /></ProtectedRoute>');
  const hasBrowseVenuesUnprotected = appRouterContent.includes('<Route path="/browse-venues" element={<BrowseVenuesPage />} />');
  
  if (hasBrowseVenuesUnprotected && !hasBrowseVenuesProtected) {
    console.log('   ✅ /browse-venues route is PUBLIC (no ProtectedRoute)');
  } else if (hasBrowseVenuesProtected) {
    console.log('   ❌ /browse-venues route is still PROTECTED');
  } else {
    console.log('   ⚠️  Could not find /browse-venues route');
  }
  
  // Check for removed ComingSoon imports
  const hasComingSoonImport = appRouterContent.includes('import.*ComingSoonLandingPage') || 
                              appRouterContent.includes('ComingSoonLandingPage') ||
                              appRouterContent.includes('VenuesComingSoonPage');
  
  if (!hasComingSoonImport) {
    console.log('   ✅ ComingSoon pages removed from imports');
  } else {
    console.log('   ❌ ComingSoon pages still in imports');
  }
  
} catch (error) {
  console.log('   ❌ Error reading AppRouter.tsx:', error.message);
}

// Test 2: Check file deletions
console.log('\n✅ 2. Checking file deletions...');
const filesToCheck = [
  'frontend/src/features/landing/pages/ComingSoonLandingPage.tsx',
  'frontend/src/pages/VenuesComingSoonPage.tsx',
  'frontend/src/features/landing/pages/VenuesLandingPage.tsx'
];

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, '..', '..', file);
  if (!fs.existsSync(filePath)) {
    console.log(`   ✅ ${file} - DELETED`);
  } else {
    console.log(`   ❌ ${file} - STILL EXISTS`);
  }
});

// Test 3: Check environment variable references
console.log('\n✅ 3. Checking for environment-based redirects...');
try {
  const searchPath = path.join(__dirname, '..', 'src');
  
  // Simple grep for REACT_APP_COMING_SOON
  function grepInDirectory(dir, pattern) {
    let found = false;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory() && file.name !== 'node_modules') {
        found = found || grepInDirectory(fullPath, pattern);
      } else if (file.isFile() && (file.name.endsWith('.tsx') || file.name.endsWith('.ts') || file.name.endsWith('.js'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(pattern)) {
          console.log(`   ⚠️  Found "${pattern}" in ${path.relative(path.join(__dirname, '..', '..'), fullPath)}`);
          found = true;
        }
      }
    }
    return found;
  }
  
  const hasComingSoonVar = grepInDirectory(searchPath, 'REACT_APP_COMING_SOON');
  if (!hasComingSoonVar) {
    console.log('   ✅ No REACT_APP_COMING_SOON environment variable references found');
  }
  
} catch (error) {
  console.log('   ❌ Error checking environment variables:', error.message);
}

console.log('\n🎯 SUMMARY:');
console.log('1. /browse-venues route should now be PUBLIC');
console.log('2. ComingSoon pages should be DELETED');
console.log('3. No environment-based redirects should remain');
console.log('\n📝 Next steps:');
console.log('- Run the React app to verify users can access /browse-venues without login');
console.log('- Test the homepage "Browse Accessible Venues" button');
console.log('- Verify login/signup routes still work (/login)');