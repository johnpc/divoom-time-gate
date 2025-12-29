import { Providers } from '@/components/providers';
import { Dashboard } from '@/components/dashboard';

export default function Home() {
  return (
    <Providers>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <h1 className="text-4xl font-bold mb-8">Home Dashboard</h1>
          <Dashboard />
        </div>
      </main>
    </Providers>
  );
}
