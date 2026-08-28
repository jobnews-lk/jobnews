async function checkLocalhost() {
  console.log('=== CHECKING LOCALHOST PORTS ===');
  for (const port of [5173, 5174, 3000, 8080]) {
    try {
      const res = await fetch(`http://localhost:${port}/`);
      console.log(`Port ${port}: SUCCESS! Status ${res.status}`);
      return port;
    } catch (e) {
      console.log(`Port ${port}: ${e.message}`);
    }
  }
  return null;
}

checkLocalhost();
