const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://njrkhpsbbpszvyzosxwf.supabase.co';
const supabaseKey = 'sb_publishable_fGLK6NAxQXIaZnOnp3JzpA_chFpHIxc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixJobExact() {
  console.log('=== FIXING EXACT JOB RECORD ===');
  
  const jobId = '237b4591-0996-42d7-b8d9-0503c940e2c0';
  const location = 'බදුල්ල දිස්ත්‍රික්කය (මීගහකිවුල සහ බණ්ඩාරවෙල ප්‍රාදේශීය ලේකම් කොට්ඨාස)';
  const instructions = `පියවර 1:- අයදුම්පත ලබා ගැනීම
මෙ සඳහා අවශ්‍ය අයදුම්පත (ඇමුණුම් I) සහ අදාළ ග්‍රාම නිලධාරී වසම් ලැයිස්තුව, අදාළ දිස්ත්‍රික් ලේකම් කාර්යාලයෙන්, ප්‍රාදේශීය ලේකම් කාර්යාලයෙන් හෝ ඉඩම් හා දිස්ත්‍රික් රෙජිස්ට්‍රාර් කාර්යාලයෙන් ලබා ගත හැක. එසේම, රෙජිස්ට්‍රාර් ජනරාල් දෙපාර්තමේන්තුවේ නිල වෙබ් අඩවියෙන් ද (www.rgd.gov.lk) ලබා ගත හැක.`;
  const address = `දිස්ත්‍රික් ලේකම්/ අතිරේක රෙජිස්ට්‍රාර් ජනරාල්, දිස්ත්‍රික් ලේකම් කාර්යාලය, බදුල්ල.`;

  const formattedApplyUrl = `${instructions}\n---\nPOSTAL_ADDRESS:\n${address}`;

  const { data, error } = await supabase
    .from('jobs')
    .update({
      location: location,
      apply_url: formattedApplyUrl
    })
    .eq('id', jobId)
    .select('id, title, location, apply_url');

  if (error) {
    console.error('Failed to update job:', error.message);
  } else {
    console.log('Successfully updated job record! Data:', data);
  }
}

fixJobExact();
