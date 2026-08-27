async function testLiveApiEndpoint() {
  console.log('=== TESTING LIVE VERCEL SERVERLESS ENDPOINT: https://jobnews.lk/api/job-hunter ===');

  try {
    const res = await fetch('https://jobnews.lk/api/job-hunter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    console.log(`HTTP Response Status: ${res.status} ${res.statusText}`);

    if (res.ok) {
      const data = await res.json();
      console.log('\n🎉 100% SUCCESS! VERCEL CLOUD ENGINE EXECUTED:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const text = await res.text();
      console.error('API Error Response:', text.substring(0, 300));
    }
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

testLiveApiEndpoint();
