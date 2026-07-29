import React from 'react';
import type { Job } from '../lib/supabase';
import ImageNoticeCard from './ImageNoticeCard';
import PdfNoticeCard from './PdfNoticeCard';
import TextNoticeCard from './TextNoticeCard';
import AdPlaceholder from './AdPlaceholder';

interface LatestJobFeedProps {
  jobs: Job[];
}

export default function LatestJobFeed({ jobs }: LatestJobFeedProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job, index) => {
        let card = null;
        if (job.post_type === 'image') {
          card = <ImageNoticeCard key={job.id} job={job} />;
        } else if (job.post_type === 'pdf') {
          card = <PdfNoticeCard key={job.id} job={job} />;
        } else {
          card = <TextNoticeCard key={job.id} job={job} />;
        }

        // // Insert an inline ad after every 6 jobs (spanning full width)
        // if (index > 0 && index % 6 === 0) {
        //   return (
        //     <React.Fragment key={job.id}>
        //       <div className="col-span-1 md:col-span-2 lg:col-span-3">
        //         <AdPlaceholder className="h-32 my-2" />
        //       </div>
        //       {card}
        //     </React.Fragment>
        //   );
        // }

        return card;
      })}
    </div>
  );
}
