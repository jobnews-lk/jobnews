async function testThingProxy() {
  console.log('=== TESTING THINGPROXY FOR WORKDAY POST API ===');

  const apiUrl = 'https://minor.wd102.myworkdayjobs.com/wday/cxs/minor/Careers/jobs';
  const proxyUrl = `https://thingproxy.freeboard.io/fetch/${apiUrl}`;

  try {
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ appliedFacets: {}, limit: 20, offset: 0, searchText: "" })
    });
    console.log(`[thingproxy POST] Status: ${res.status} ${res.statusText}`);
    if (res.ok) {
      const data = await res.json();
      console.log(`[thingproxy POST] SUCCESS! Total: ${data.total}, Postings: ${data.jobPostings?.length}`);
    }
  } catch (e) {
    console.log('[thingproxy POST] Failed:', e.message);
  }
}

testThingProxy();
