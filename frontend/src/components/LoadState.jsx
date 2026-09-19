import Spinner from './Spinner';
import Alert from './Alert';

// Shows a spinner while loading, an error if it failed, otherwise the children.
export default function LoadState({ loading, error, label, children }) {
  if (loading) return <Spinner label={label} />;
  if (error) return <Alert type="error">{error}</Alert>;
  return children;
}
