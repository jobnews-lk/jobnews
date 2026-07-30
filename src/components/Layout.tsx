import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import TopTicker from './TopTicker';
import MobileBottomNav from './MobileBottomNav';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <TopTicker />
      <Navbar />
      {/* Added pb-16 on mobile to account for the fixed bottom nav */}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
