const singleJobUrl = 'https://minor.wd102.myworkdayjobs.com/en-US/Careers/jobs/details/Housekeeping-Attendant_JR109005-1?Business_Unit=aad9f66d5e7f1018d61630cb61990000';

async function testWorkdaySearchForSingleJob() {
  console.log('=== TESTING WORKDAY POST SEARCH FOR SPECIFIC JOB SLUG / TITLE ===');

  const parsedUrl = new URL(singleJobUrl);
  const host = parsedUrl.hostname; // minor.wd102.myworkdayjobs.com
  const tenant = host.split('.')[0]; // minor
  const site = 'Careers';

  const pathParts = parsedUrl.pathname.split('/');
  const jobSlug = pathParts[pathParts.length - 1]; // Housekeeping-Attendant_JR109005-1
  // Clean job slug into search text: "Housekeeping Attendant"
  const searchText = jobSlug.split('_')[0].replace(/-/g, ' ');

  console.log(`Search Text extracted from URL: "${searchText}"`);

  const apiUrl = `https://${host}/wday/cxs/${tenant}/${site}/jobs`;

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        appliedFacets: {},
        limit: 20,
        offset: 0,
        searchText: searchText
      })
    });

    console.log(`HTTP Status: ${res.status} ${res.statusText}`);

    if (res.ok) {
      const data = await res.json();
      console.log(`🎉 100% SUCCESS! Found ${data.total} Jobs matching "${searchText}"!`);

      if (data.jobPostings && data.jobPostings.length > 0) {
        data.jobPostings.forEach((j, i) => {
          console.log(`\n[${i + 1}] Title: ${j.title}`);
          console.log(`    Location: ${j.locationsText}`);
          console.log(`    Posted: ${j.postedOn}`);
          console.log(`    URL: https://${host}/en-US/${site}${j.externalPath}`);
        });
      }
    } else {
      console.error('Workday returned error:', await res.text());
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

testWorkdaySearchForSingleJob();
