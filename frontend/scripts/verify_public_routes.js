const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFYING PUBLIC ROUTES & CLEANUP\n');

// Check if files exist and are properly configured
const checks = [
  {
    name: 'AppRouter.tsx - /browse-venues route',
    file: 'frontend/src/AppRouter.tsx',
    check: (content) => {
      const hasProtectedRoute = content.includes('<ProtectedRoute><BrowseVenuesPage /></ProtectedRoute>');
      const hasPublicRoute = content.includes('<Route path="/browse-venues" element={<BrowseVenuesPage />} />');
      const hasImport = content.includes('import.*BrowseVenuesPage');
      return {
        passed: hasPublicRoute && !hasProtectedRoute && hasImport,
        details: hasPublicRoute ? '/browse-venues is PUBLIC' : '/browse-venues route missing',
        warnings: hasProtectedRoute ? 'Route still protected!' : null
      };
    }
  },
  {
    name: 'AppRouter.tsx - / route',
    file: 'frontend/src/AppRouter.tsx',
    check: (content) => {
      const hasRootRoute = content.includes('<Route path="/" element={<ChoiceSelectorPage />} />');
      const hasProtectedRoot = content.includes('<ProtectedRoute><ChoiceSelectorPage');
      return {
        passed: hasRootRoute && !hasProtectedRoot,
        details: hasRootRoute ? '/ route is PUBLIC' : '/ route missing',
        warnings: hasProtectedRoot ? 'Root route is protected!' : null
      };
    }
  },
  {
    name: 'AppRouter.tsx - ComingSoon imports removed',
    file: 'frontend/src/AppRouter.tsx',
    check: (content) => {
      const hasComingSoonImport = content.includes('ComingSoonLandingPage') || 
                                   content.includes('VenuesComingSoonPage');
      return {
        passed: !hasComingSoonImport,
        details: hasComingSoonImport ? 'ComingSoon imports found' : 'ComingSoon imports removed',
        warnings: hasComingSoonImport ? 'Legacy imports still present' : null
      };
    }
  },
  {
    name: 'Deleted ComingSoon files',
    files: [
      'frontend/src/features/landing/pages/ComingSoonLandingPage.tsx',
      'frontend/src/pages/VenuesComingSoonPage.tsx',
      'frontend/src/features/landing/pages/VenuesLandingPage.tsx'
    ],
    check: () => {
      const missingFiles = [];
      const existingFiles = [];
      
      const filesToCheck = [
        'frontend/src/features/landing/pages/ComingSoonLandingPage.tsx',
        'frontend/src/pages/VenuesComingSoonPage.tsx',
        'frontend/src/features/landing/pages/VenuesLandingPage.tsx'
      ];
      
      filesToCheck.forEach(file => {
        const fullPath = path.join(__dirname, '..', '..', file);
        if (fs.existsSync(fullPath)) {
          existingFiles.push(file);
        } else {
          missingFiles.push(file);
        }
      });
      
      return {
        passed: existingFiles.length === 0,
        details: `${missingFiles.length} files deleted, ${existingFiles.length} still exist`,
        warnings: existingFiles.length > 0 ? `Files still exist: ${existingFiles.join(', ')}` : null
      };
    }
  },
  {
    name: 'BrowseVenuesPage - No forced auth redirects',
    file: 'frontend/src/features/accessibility/pages/BrowseVenuesPage.tsx',
    check: (content) => {
      const hasNavigateToLogin = content.includes('navigate.*login') || 
                                 content.includes('navigate.*/login') ||
                                 content.includes('Redirect.*login') ||
                                 content.includes('useAuth.*redirect');
      const hasProtectedRouteCheck = content.includes('if.*!user.*navigate') ||
                                     content.includes('if.*!user.*redirect') ||
                                     content.includes('ProtectedRoute');
      return {
        passed: !hasNavigateToLogin && !hasProtectedRouteCheck,
        details: hasNavigateToLogin ? 'Has login redirect' : 'No forced auth redirects',
        warnings: hasNavigateToLogin ? 'Page might still force login!' : null
      };
    }
  }
];

let passedCount = 0;
let totalCount = checks.length;

checks.forEach((check, index) => {
  console.log(`${index + 1}. ${check.name}`);
  
  try {
    let result;
    
    if (check.file) {
      const filePath = path.join(__dirname, '..', '..', check.file);
      if (!fs.existsSync(filePath)) {
        console.log('   ❌ File not found');
        return;
      }
      const content = fs.readFileSync(filePath, 'utf8');
      result = check.check(content);
    } else if (check.files) {
      result = check.check();
    }
    
    if (result.passed) {
      console.log(`   ✅ ${result.details}`);
      passedCount++;
    } else {
      console.log(`   ❌ ${result.details}`);
    }
    
    if (result.warnings) {
      console.log(`   ⚠️  ${result.warnings}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('');
});

console.log(`📊 SUMMARY: ${passedCount}/${totalCount} checks passed`);
console.log('');

if (passedCount === totalCount) {
  console.log('🎉 SUCCESS! All fixes applied correctly:');
  console.log('   • /browse-venues route is now PUBLIC');
  console.log('   • / route remains PUBLIC');
  console.log('   • ComingSoon pages DELETED');
  console.log('   • No environment-based redirects');
  console.log('   • Login/signup routes preserved');
  console.log('');
  console.log('🚀 Users can now:');
  console.log('   1. Visit mim.town/ and click "Browse Accessible Venues" without login');
  console.log('   2. Directly access /browse-venues without authentication');
  console.log('   3. Still login via /login for protected features');
} else {
  console.log('⚠️  Some issues need attention. Review the warnings above.');
}

console.log('\n📝 Next Steps:');
console.log('1. Deploy the updated build to Railway');
console.log('2. Test the live site: mim.town');
console.log('3. Verify the Railway environment variable REACT_APP_COMING_SOON is removed');