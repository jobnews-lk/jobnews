import { useState, useEffect } from 'react';

export function useSavedJobs() {
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('savedJobs');
    if (stored) {
      try {
        setSavedJobIds(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse saved jobs', e);
      }
    }
  }, []);

  const saveJob = (jobId: string) => {
    setSavedJobIds((prev) => {
      if (prev.includes(jobId)) return prev;
      const updated = [...prev, jobId];
      localStorage.setItem('savedJobs', JSON.stringify(updated));
      return updated;
    });
  };

  const removeJob = (jobId: string) => {
    setSavedJobIds((prev) => {
      const updated = prev.filter((id) => id !== jobId);
      localStorage.setItem('savedJobs', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleSavedJob = (jobId: string) => {
    if (savedJobIds.includes(jobId)) {
      removeJob(jobId);
    } else {
      saveJob(jobId);
    }
  };

  const isSaved = (jobId: string) => savedJobIds.includes(jobId);

  return { savedJobIds, toggleSavedJob, isSaved };
}
