const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testJobImagesData() {
  console.log('=== CHECKING JOB_IMAGES & THUMBNAIL_URL FOR PUBLISHED JOBS ===');

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, post_type, thumbnail_url, job_images(id, url, sort_order)')
    .eq('status', 'published')
    .limit(10);

  if (error) {
    console.error('Error fetching jobs:', error);
    return;
  }

  console.log(`Fetched ${jobs?.length} published jobs:`);
  jobs?.forEach((j, i) => {
    console.log(`[${i+1}] ID: ${j.id}`);
    console.log(`    Title: ${j.title}`);
    console.log(`    Post Type: ${j.post_type}`);
    console.log(`    Thumbnail URL: ${j.thumbnail_url ? j.thumbnail_url.substring(0, 60) + '...' : 'NULL'}`);
    console.log(`    Job Images Count: ${j.job_images ? j.job_images.length : 0}`);
    if (j.job_images && j.job_images.length > 0) {
      console.log(`    Image 1 URL: ${j.job_images[0].url.substring(0, 60)}...`);
    }
  });
}

testJobImagesData();
