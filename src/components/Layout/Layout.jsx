
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './SideBar';

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="layout-container">
        <Sidebar mobileOpen={isMobileMenuOpen} />
        <div className="layout-right">
            <Header onMobileMenuToggle={() => setIsMobileMenuOpen((open) => !open)} />
            <div className="layout-content">
                <Outlet /> {/* Ici s'affichent les pages (Dashboard, etc.) */}
            </div>
        </div>
    </div>
  );
}

export default Layout;
