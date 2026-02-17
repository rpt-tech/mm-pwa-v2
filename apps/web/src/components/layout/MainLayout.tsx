import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Navigation from '@/components/navigation/Navigation';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
