import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileDrawer from './MobileDrawer';

function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Fermer le drawer lors de la navigation
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="layout-container">
      {/* Sidebar Desktop et Tablette */}
      <Sidebar />

      {/* Menu Drawer Mobile latéral */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Contenu principal */}
      <div className="layout-right">
        <Header onToggleMobileMenu={() => setDrawerOpen(prev => !prev)} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>

      {/* Navigation fixe en bas sur écran mobile */}
      <BottomNav />
    </div>
  );
}

export default Layout;