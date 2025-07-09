// Test file to verify basic loading
import './ui/test-style.css';

console.log('🚀 SIMPLIFIED MAIN.TS LOADED - CSS should be working now!');

// Add basic test content
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div style="background: red; padding: 20px; color: white;">
        TEST: If you see this styled, CSS is working!
      </div>
    `;
  }
});
