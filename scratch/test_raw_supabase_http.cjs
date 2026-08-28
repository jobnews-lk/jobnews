const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';

async function testRawHttp() {
  console.log('=== TESTING DIRECT HTTP FETCH TO SUPABASE REST API ===');

  const endpoint = `${supabaseUrl}/rest/v1/jobs?select=id,title,company,status,post_type,is_government,is_overseas,closing_date,created_at,location,salary,thumbnail_url&status=eq.published&order=created_at.desc&limit=30`;

  try {
    const res = await fetch(endpoint, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`HTTP Status: ${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log(`Is Array: ${Array.isArray(data)}`);
    console.log(`Returned Count: ${Array.isArray(data) ? data.length : 0}`);
    if (Array.isArray(data) && data.length > 0) {
      console.log('First Job Title:', data[0].title);
    } else {
      console.log('Response body:', data);
    }
  } catch (e) {
    console.error('HTTP Fetch Error:', e);
  }
}

testRawHttp();
