import { useEffect, useState } from 'react';
import { errorMessage } from '../api/client';

// Runs an async loader when the component mounts (and when `deps` change).
// Returns { data, loading, error, reload }.
export default function useLoad(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    Promise.resolve()
      .then(loader)
      .then((data) => active && setState({ data, loading: false, error: '' }))
      .catch((err) => active && setState({ data: null, loading: false, error: errorMessage(err) }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { ...state, reload: () => setTick((t) => t + 1) };
}
