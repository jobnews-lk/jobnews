const workdayApiUrl = 'https://minor.wd102.myworkdayjobs.com/wday/cxs/minor/Careers/jobs';

async function testCorsProxies() {
  console.log('=== TESTING CORS PROXIES FOR WORKDAY POST API ===');

  const payload = JSON.stringify({
    appliedFacets: {},
    limit: 20,
    offset: 0,
    searchText: ""
  });

  // Test 1: Direct Fetch
  try {
    const res1 = await fetch(workdayApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    });
    console.log(`[Direct Fetch] Status: ${res1.status}`);
    if (res1.ok) {
      const data1 = await res1.json();
      console.log(`[Direct Fetch] SUCCESS! Total: ${data1.total}`);
    }
  } catch (e) {
    console.log(`[Direct Fetch] Failed: ${e.message}`);
  }

  // Test 2: corsproxy.io
  try {
    const proxyUrl2 = `https://corsproxy.io/?${encodeURIComponent(workdayApiUrl)}`;
    const res2 = await fetch(proxyUrl2, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    });
    console.log(`[corsproxy.io] Status: ${res2.status}`);
    if (res2.ok) {
      const data2 = await res2.json();
      console.log(`[corsproxy.io] SUCCESS! Total: ${data2.total}`);
    }
  } catch (e) {
    console.log(`[corsproxy.io] Failed: ${e.message}`);
  }

  // Test 3: codetabs proxy
  try {
    const proxyUrl3 = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(workdayApiUrl)}`;
    const res3 = await fetch(proxyUrl3, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    });
    console.log(`[codetabs] Status: ${res3.status}`);
    if (res3.ok) {
      const data3 = await res3.json();
      console.log(`[codetabs] SUCCESS! Total: ${data3.total}`);
    }
  } catch (e) {
    console.log(`[codetabs] Failed: ${e.message}`);
  }
}

testCorsProxies();
