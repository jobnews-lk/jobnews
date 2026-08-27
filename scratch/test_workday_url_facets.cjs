const userUrl = 'https://minor.wd102.myworkdayjobs.com/en-US/Careers?Business_Unit=aad9f66d5e7f1018d61630cb61990000&Business_Group=9db76b4e787d1000a5e7c0e54a700000&Business_Group=9db76b4e787d1000a5e7c6e8de720000&Business_Group=9db76b4e787d1000a5e7cbb8823f0000&Business_Group=aad9f66d5e7f1018d61628fe1b550000&Business_Group=9db76b4e787d1000a5e7dbf4b3230000&jobFamily=b3f9e2923ea010087d21052a7dcb0000&jobFamily=b3f9e2923ea010087d210d90b3d60000';

async function testLimit20WorkdayUrl() {
  console.log('=== TESTING WORKDAY API WITH LIMIT 20 ===');

  const parsedUrl = new URL(userUrl);
  const host = parsedUrl.hostname; // minor.wd102.myworkdayjobs.com
  const tenant = host.split('.')[0]; // minor
  const site = 'Careers';

  const apiUrl = `https://${host}/wday/cxs/${tenant}/${site}/jobs`;

  console.log(`Cleaned API URL: ${apiUrl}`);

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        appliedFacets: {},
        limit: 20,
        offset: 0,
        searchText: ""
      })
    });

    console.log(`HTTP Status: ${res.status} ${res.statusText}`);

    if (res.ok) {
      const data = await res.json();
      console.log(`🎉 100% SUCCESS! Found ${data.total} Total Vacancies!`);

      if (data.jobPostings && data.jobPostings.length > 0) {
        console.log(`\nTop 10 Live Vacancies fetched from user URL:`);
        data.jobPostings.slice(0, 10).forEach((j, i) => {
          console.log(`[${i + 1}] Title: ${j.title} | Location: ${j.locationsText} | Posted: ${j.postedOn}`);
        });
      }
    } else {
      console.error('Workday returned error:', await res.text());
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

testLimit20WorkdayUrl();
