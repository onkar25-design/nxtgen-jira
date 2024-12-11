import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, Home, Folder, Users, Settings } from 'lucide-react'
import './sidebar.css';

export default function Sidebar({ sidebarOpen, setSidebarOpen, setCurrentPage }) {
  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 sidebar transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
      <div className="flex items-center justify-between sidebar-header">
        <span className="text-2xl font-semibold">NxtGen Innovation</span>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:text-blue-200"
          onClick={() => setSidebarOpen(false)}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      <ScrollArea className="flex-grow">
        <nav className="space-y-2 p-4">
          <Button 
            variant="ghost" 
            className="sidebar-button hover:text-blue-200 hover:bg-blue-800"
            onClick={() => setCurrentPage('projects')}
          >
            <Folder className="mr-2 h-4 w-4" />
            Projects
          </Button>
          <Button 
            variant="ghost" 
            className="sidebar-button hover:text-blue-200 hover:bg-blue-800"
            onClick={() => setCurrentPage('staff')}
          >
            <Users className="mr-2 h-4 w-4" />
            Staff
          </Button>
        </nav>
      </ScrollArea>
    </div>
  )
}

