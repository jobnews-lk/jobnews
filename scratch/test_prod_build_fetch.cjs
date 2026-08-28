async function testProdFetch() {
  console.log('=== TESTING PRODUCTION VERCEL DEPLOYMENT HTTP RESPONSE ===');

  try {
    const res = await fetch('https://jobnews.lk/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/605.1.15'
      }
    });

    console.log(`Status: ${res.status} ${res.statusText}`);
    const html = await res.text();
    console.log(`HTML Length: ${html.length} bytes`);

    // Check script bundle hash in index.html
    const scriptMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if (scriptMatch) {
      console.log(`Live Index Script: ${scriptMatch[1]}`);
    } else {
      console.log('Script match not found');
    }
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

testProdFetch();
