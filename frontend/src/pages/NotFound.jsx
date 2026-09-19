import Button from '../components/Button';

export default function NotFound() {
  return (
    <div className="container page narrow center">
      <h1>Page not found</h1>
      <p className="muted">The page you are looking for does not exist or has moved.</p>
      <Button to="/">Go to home</Button>
    </div>
  );
}
