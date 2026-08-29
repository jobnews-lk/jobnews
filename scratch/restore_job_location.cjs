const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreJobLocation() {
  console.log('=== RESTORING JOB LOCATION ===');
  
  const jobId = '237b4591-0996-42d7-b8d9-0503c940e2c0';
  const newLocation = 'බදුල්ල දිස්ත්‍රික්කය (මීගහකිවුල සහ බණ්ඩාරවෙල ප්‍රාදේශීය ලේකම් කොට්ඨාස)';
  const applyAddress = 'දිස්ත්‍රික් ලේකම්/ අතිරේක රෙජිස්ට්‍රාර් ජනරාල්,දිස්ත්‍රික් ලේකම් කාර්යාලය';

  const { data, error } = await supabase
    .from('jobs')
    .update({
      location: newLocation,
      apply_address: applyAddress
    })
    .eq('id', jobId)
    .select('id, title, location, apply_address');

  if (error) {
    console.error('Failed to update job location:', error.message);
  } else {
    console.log('Successfully restored job location! Data:', data);
  }
}

restoreJobLocation();
