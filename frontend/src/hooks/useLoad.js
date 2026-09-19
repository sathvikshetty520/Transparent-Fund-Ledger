import { useEffect, useState } from 'react';
import { errorMessage } from '../api/client';

// Runs an async loader when the component mounts (and when `deps` change).
// Supports options: { interval: number in ms } for background polling.
// Returns { data, loading, error, reload }.
export default function useLoad(loader, deps = [], options = {}) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);
  const interval = typeof options === 'number' ? options : options?.interval;

  useEffect(() => {
    let active = true;
    
    // Initial fetch (shows loading indicator)
    setState((s) => ({ ...s, loading: !s.data, error: '' }));
    Promise.resolve()
      .then(loader)
      .then((data) => active && setState({ data, loading: false, error: '' }))
      .catch((err) => active && setState((s) => ({ data: s.data, loading: false, error: errorMessage(err) })));

    // Polling interval if specified
    let timer = null;
    if (interval && interval > 0) {
      timer = setInterval(() => {
        if (!active) return;
        Promise.resolve()
          .then(loader)
          .then((data) => active && setState((s) => ({ ...s, data, error: '' })))
          .catch(() => {}); // silent fail on background poll to avoid UX disruption
      }, interval);
    }

    return () => {
      active = false;
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { ...state, reload: () => setTick((t) => t + 1) };
}
