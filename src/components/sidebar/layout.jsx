// src/components/Layout.jsx
import Header from "@/components/sidebar/header"; // Adjust the path as necessary
import Sidebar from "@/components/sidebar/sidebar";

const Layout = ({ sidebarOpen, setSidebarOpen, setCurrentPage, setSelectedProjectId, children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} setCurrentPage={setCurrentPage} setSelectedProjectId={setSelectedProjectId} />
      <div className="flex-grow flex flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} setCurrentPage={setCurrentPage} />
        <div className="flex-grow p-4 overflow-auto md:ml-64">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;