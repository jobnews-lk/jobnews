// Native fetch in Node 18+

async function testWorkdayApi() {
  console.log('=== TESTING WORKDAY PUBLIC REST API FOR MINOR HOTELS (ANANTARA / AVANI / TIVOLI) ===');

  // Direct Workday CXS JSON API Endpoint for Minor Hotels
  const workdayApiUrl = 'https://minor.wd102.myworkdayjobs.com/wday/cxs/minor/Careers/jobs';

  try {
    const response = await fetch(workdayApiUrl, {
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

    console.log(`HTTP Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const text = await response.text();
      console.error('Workday API error response:', text.substring(0, 300));
      return;
    }

    const data = await response.json();
    console.log(`\n🎉 WORKDAY API SUCCESS! Found ${data.total} Total Vacancies!`);

    if (data.jobPostings && data.jobPostings.length > 0) {
      console.log('\nShowing first 5 live vacancies:');
      data.jobPostings.slice(0, 5).forEach((j, i) => {
        console.log(`\n[${i + 1}] Title: ${j.title}`);
        console.log(`    Location: ${j.locationsText || 'N/A'}`);
        console.log(`    Posted: ${j.postedOn || 'N/A'}`);
        console.log(`    URL: https://minor.wd102.myworkdayjobs.com/en-US/Careers${j.externalPath}`);
      });
    }
  } catch (err) {
    console.error('Workday fetch error:', err);
  }
}

testWorkdayApi();
