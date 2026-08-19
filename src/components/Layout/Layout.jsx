
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './SideBar';

function Layout() {
  return (
    <div className="layout-container">
        <Sidebar />
        <div className="layout-right">
            <Header />
            <div className="layout-content">
                <Outlet /> {/* Ici s'affichent les pages (Dashboard, etc.) */}
            </div>
        </div>
    </div>
  );
}

export default Layout;