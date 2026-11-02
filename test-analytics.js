// Copy and paste this into your browser console to test Umami analytics

console.log("=== Umami Analytics Test ===");

// 1. Check if Umami is loaded
if (typeof window.umami === 'undefined') {
  console.error("❌ Umami not loaded. Check if script is running.");
  console.log("Possible reasons:");
  console.log("1. Dev server needs restart (env variables not loaded)");
  console.log("2. Check Network tab for script.js loading errors");
  console.log("3. Ad blocker might be blocking Umami");
} else {
  console.log("✅ Umami loaded:", window.umami);
}

// 2. Test event tracking
if (window.umami) {
  window.umami.track('test_event', { message: 'Testing analytics', timestamp: Date.now() });
  console.log("✅ Test event sent. Check your Umami dashboard.");
}

// 3. Check if Umami script tag exists in DOM
const umamiScript = document.querySelector('script[src*="umami"]');
if (umamiScript) {
  console.log("✅ Umami script tag found:", umamiScript.src);
  console.log("   Website ID:", umamiScript.getAttribute('data-website-id'));
} else {
  console.error("❌ Umami script tag NOT found in DOM");
}

console.log("=== Test Complete ===");
console.log("Tip: Check your Umami Cloud dashboard → Realtime to see if the event appears.");
