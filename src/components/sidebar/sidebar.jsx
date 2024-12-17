import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, Home, Folder, Users, Settings, ChevronDown, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'
import './sidebar.css';

export default function Sidebar({ sidebarOpen, setSidebarOpen, setCurrentPage, setSelectedProjectId }) {
  const [projects, setProjects] = useState([])
  const [isProjectsOpen, setIsProjectsOpen] = useState(false)
  const [isStaffOpen, setIsStaffOpen] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name')
        .eq('is_archived', false)

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleProjectClick = (projectId) => {
    setSelectedProjectId(projectId);
    setCurrentPage('workflow');
  }

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 sidebar transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
      <div className="flex items-center justify-between sidebar-header">
        <span className="text-xl font-semibold truncate">NxtGen Innovation</span>
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
        <nav className="p-2">
          {/* Projects Section */}
          <div className="mb-2">
            <Button 
              variant="ghost" 
              className="sidebar-button hover:text-blue-200 hover:bg-blue-800/50 w-full justify-between"
              onClick={() => setIsProjectsOpen(!isProjectsOpen)}
            >
              <div className="flex items-center">
                <Folder className="mr-2 h-4 w-4" />
                <span className="font-medium">Projects</span>
              </div>
              {isProjectsOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            
            {isProjectsOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-blue-700/30 pl-2">
                <Button
                  variant="ghost"
                  className="sidebar-button hover:text-blue-200 hover:bg-blue-800/50 w-full justify-start text-sm"
                  onClick={() => setCurrentPage('projects')}
                >
                  All Projects
                </Button>
                {projects.map((project) => (
                  <Button
                    key={project.id}
                    variant="ghost"
                    className="sidebar-button hover:text-blue-200 hover:bg-blue-800/50 w-full justify-start text-sm"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className="w-full flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></div>
                      <span className="truncate max-w-[180px] block">{project.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Staff Section */}
          <div className="mb-2">
            <Button 
              variant="ghost" 
              className="sidebar-button hover:text-blue-200 hover:bg-blue-800/50 w-full justify-between"
              onClick={() => setIsStaffOpen(!isStaffOpen)}
            >
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <span className="font-medium">Staff</span>
              </div>
              {isStaffOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            {isStaffOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-blue-700/30 pl-2">
                <Button
                  variant="ghost"
                  className="sidebar-button hover:text-blue-200 hover:bg-blue-800/50 w-full justify-start text-sm"
                  onClick={() => setCurrentPage('staff')}
                >
                  Manage Staff
                </Button>
                {/* Add more staff-related options here if needed */}
              </div>
            )}
          </div>
        </nav>
      </ScrollArea>
    </div>
  )
}

