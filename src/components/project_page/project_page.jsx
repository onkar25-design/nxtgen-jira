import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Folder, Edit2, Archive } from 'lucide-react'
import './project_page_styles.css'
import { supabase } from '../../../supabaseClient'
import { toast } from 'react-hot-toast'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function ProjectsPage({ setCurrentPage, setSelectedProjectId }) {
  const [projects, setProjects] = useState([])
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editProject, setEditProject] = useState({ id: null, name: '', description: '' })
  const [showArchived, setShowArchived] = useState(false)

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Make sure is_archived is initialized for all projects
      const projectsWithArchiveStatus = data?.map(project => ({
        ...project,
        is_archived: project.is_archived || false
      })) || [];
      
      setProjects(projectsWithArchiveStatus);
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewProject(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newProject.name.trim() && newProject.description.trim()) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .insert([
            { 
              name: newProject.name.trim(), 
              description: newProject.description.trim()
            }
          ])
          .select()

        if (error) throw error

        setProjects(prev => [...prev, data[0]])
        setNewProject({ name: '', description: '' })
      } catch (error) {
        console.error('Error creating project:', error)
      }
    }
  }

  const handleViewDetails = (projectId) => {
    setSelectedProjectId(projectId);
    setCurrentPage('workflow');
  };

  const handleEditProject = (project) => {
    setEditProject(project)
    setIsEditModalOpen(true)
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditProject(prev => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ name: editProject.name, description: editProject.description })
        .eq('id', editProject.id)

      if (error) throw error

      setProjects(prev => prev.map(p => p.id === editProject.id ? { ...p, ...editProject } : p))
      setIsEditModalOpen(false)
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const handleArchiveProject = async (projectId, isArchived) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_archived: !isArchived })
        .eq('id', projectId);

      if (error) throw error;

      // Update local state
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, is_archived: !isArchived }
          : project
      ));

      toast.success(`Project ${!isArchived ? 'archived' : 'unarchived'} successfully`);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project status');
    }
  };

  // Filter projects based on archived status
  const filteredProjects = projects.filter(project => 
    showArchived ? project.is_archived : !project.is_archived
  );

  return (
    <div className="pt-16 md:pl-54 w-full min-h-screen bg-gray-50">
      {/* Improved Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 bg-blue-600">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Edit2 className="h-5 w-5 mr-2" />
                Edit Project
              </h3>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label 
                    htmlFor="editName" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Project Name
                  </label>
                  <input
                    type="text"
                    id="editName"
                    name="name"
                    value={editProject.name}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="editDescription" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="editDescription"
                    name="description"
                    value={editProject.description}
                    onChange={handleEditInputChange}
                    required
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Discard changes and close</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Save Changes
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Save project changes</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="px-4 md:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-700">Projects</h1>
          <div className="flex gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setShowArchived(!showArchived)}
                    className={`${
                      showArchived ? 'bg-gray-100' : ''
                    } text-gray-600 hover:text-gray-800`}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    {showArchived ? 'Show Active' : 'Show Archived'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showArchived ? 'Switch to active projects' : 'View archived projects'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Only show create new project card if not viewing archived projects */}
        {!showArchived && (
          <Card className="mb-8 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-700">Create New Project</CardTitle>
              <CardDescription>Add a new project to your workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Project Name</Label>
                    <Input 
                      id="name" 
                      name="name"
                      placeholder="Enter project name" 
                      value={newProject.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description"
                      placeholder="Describe your project" 
                      value={newProject.description}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Create Project
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create a new project in your workspace</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
          </Card>
        )}

        <h2 className="text-2xl font-semibold text-blue-700 mb-4">
          {showArchived ? 'Archived Projects' : 'Active Projects'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <Card key={project.id} className="bg-white hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <CardHeader>
                <CardTitle className="text-blue-600 flex items-center justify-between gap-2">
                  <div className="flex items-center min-w-0">
                    <Folder className="mr-2 h-5 w-5 flex-shrink-0" /> 
                    <span className="truncate block">
                      {project.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Edit2 
                            className="h-5 w-5 text-blue-600 cursor-pointer flex-shrink-0 hover:text-blue-700" 
                            onClick={() => handleEditProject(project)}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit project details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Archive
                            className={`h-5 w-5 cursor-pointer flex-shrink-0 ${
                              project.is_archived 
                                ? 'text-amber-600 hover:text-amber-700' 
                                : 'text-gray-600 hover:text-gray-700'
                            }`}
                            onClick={() => handleArchiveProject(project.id, project.is_archived)}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{project.is_archived ? 'Unarchive project' : 'Archive project'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600 min-h-[60px]">{project.description}</p>
              </CardContent>
              <CardFooter className="mt-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full text-blue-600 border-blue-600 hover:bg-blue-50"
                        onClick={() => handleViewDetails(project.id)}
                      >
                        View Details
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View project workflows and details</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

