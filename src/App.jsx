import { useState, useEffect } from 'react';
import MSYOCApp from './MSYOCApp';
import AuthGate from './components/AuthGate';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple loading simulation
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
          <p className="text-neutral-600">Ачааллаж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGate>
     <MSYOCApp />
    </AuthGate>
  );
}

export default App;
