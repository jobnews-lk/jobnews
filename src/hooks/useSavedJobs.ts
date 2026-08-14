import { useState, useEffect } from 'react';

export function useSavedJobs() {
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('savedJobs');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const sync = () => {
      try {
        const stored = localStorage.getItem('savedJobs');
        setSavedJobIds(stored ? JSON.parse(stored) : []);
      } catch (e) {
        console.error('Failed to parse saved jobs', e);
      }
    };

    window.addEventListener('storage', sync);
    window.addEventListener('savedJobsChanged', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('savedJobsChanged', sync);
    };
  }, []);

  const updateStorage = (updated: string[]) => {
    localStorage.setItem('savedJobs', JSON.stringify(updated));
    window.dispatchEvent(new Event('savedJobsChanged'));
  };

  const saveJob = (jobId: string) => {
    setSavedJobIds((prev) => {
      if (prev.includes(jobId)) return prev;
      const updated = [...prev, jobId];
      updateStorage(updated);
      return updated;
    });
  };

  const removeJob = (jobId: string) => {
    setSavedJobIds((prev) => {
      const updated = prev.filter((id) => id !== jobId);
      updateStorage(updated);
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

  return { savedJobIds, toggleSavedJob, isSaved, count: savedJobIds.length };
}
