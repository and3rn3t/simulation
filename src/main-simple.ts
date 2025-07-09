// Import CSS
import './ui/style.css';

console.log('🚀 Simple main.ts loading...');

// Check if DOM is already loaded
if (document.readyState === 'loading') {
  console.log('⏳ DOM is still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  console.log('✅ DOM already loaded, initializing immediately...');
  initializeApp();
}

async function initializeApp() {
  console.log('🎯 Starting app initialization...');
  
  try {
    console.log('📱 Testing MemoryPanelComponent import...');
    const { MemoryPanelComponent } = await import('./ui/components/MemoryPanelComponent');
    console.log('✅ MemoryPanelComponent imported successfully');
    
    const memoryPanel = new MemoryPanelComponent();
    memoryPanel.mount(document.body);
    console.log('✅ Memory panel created and mounted');
    
    // Add visible test button
    const testButton = document.createElement('button');
    testButton.textContent = '🧠 TOGGLE MEMORY PANEL';
    testButton.style.position = 'fixed';
    testButton.style.top = '10px';
    testButton.style.left = '10px';
    testButton.style.zIndex = '10000';
    testButton.style.padding = '15px';
    testButton.style.backgroundColor = '#4CAF50';
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.borderRadius = '5px';
    testButton.style.cursor = 'pointer';
    testButton.style.fontSize = '16px';
    testButton.style.fontWeight = 'bold';
    testButton.onclick = () => {
      console.log('🔄 Toggling memory panel');
      memoryPanel.toggle();
    };
    document.body.appendChild(testButton);
    console.log('✅ Test button added to page');
    
    // Check canvas visibility
    const canvas = document.getElementById('simulation-canvas');
    if (canvas) {
      console.log('✅ Canvas found:', canvas);
      // Make sure canvas is visible
      canvas.style.border = '2px solid #4CAF50';
      canvas.style.backgroundColor = '#222';
    } else {
      console.error('❌ Canvas not found');
    }
    
  } catch (error) {
    console.error('❌ Failed to create memory panel:', error);
  }
}
