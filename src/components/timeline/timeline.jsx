import React, { useState, useEffect } from 'react'
import { format, addDays, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown 
} from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { supabase } from '../../../supabaseClient'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function ProjectTimeline() {
  const [projects, setProjects] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Add fetchData function
  const fetchData = async () => {
    try {
      // First get all projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
      
      if (projectsError) throw projectsError

      // Then get all tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
      
      if (tasksError) throw tasksError

      // Group tasks by project
      const groupedData = projectsData.map(project => ({
        projectId: project.id,
        projectName: project.name,
        isExpanded: true,
        tasks: tasksData
          .filter(task => task.project_id === project.id)
          .map(task => ({
            id: task.id,
            name: task.content,
            startDate: task.created_at.split('T')[0], // Use created_at as start date
            endDate: task.due_date,
            dependencies: [], // You might want to add a dependencies column to your table
            priority: task.priority,
          }))
      }))

      setProjects(groupedData)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // Add useEffect to fetch data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  const startDate = startOfMonth(currentDate)
  const endDate = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const getTaskPosition = (task) => {
    const start = new Date(task.startDate)
    const end = new Date(task.endDate)
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    
    // Check if task is outside current month
    if (end < monthStart || start > monthEnd) {
        return { left: '0%', width: '0%', display: 'none' }
    }
    
    const clampedStart = start < monthStart ? monthStart : start
    const clampedEnd = end > monthEnd ? monthEnd : end
    
    // Calculate positions based on day numbers instead of percentages
    const totalDays = days.length
    const startDayIndex = Math.floor((clampedStart - monthStart) / (1000 * 60 * 60 * 24))
    const endDayIndex = Math.ceil((clampedEnd - monthStart) / (1000 * 60 * 60 * 24))
    
    const left = (startDayIndex / totalDays) * 100
    const width = ((endDayIndex - startDayIndex) / totalDays) * 100
    
    return { 
        left: `${left}%`, 
        width: `${width}%`,
        display: 'block'
    }
  }

  // Fixed drawDependencyLines function
  const drawDependencyLines = (task, projectIndex, taskIndex) => {
    if (task.dependencies.length === 0) return null

    return task.dependencies.map(depId => {
      const currentProjectTasks = projects[projectIndex].tasks
      const parentTask = currentProjectTasks.find(t => t.id === depId)
      if (!parentTask) return null

      const parentPos = getTaskPosition(parentTask)
      const childPos = getTaskPosition(task)
      
      // Calculate vertical position based on project and task indices
      const baseHeight = 40 // Height per task
      const projectOffset = projectIndex * (projects.length * baseHeight + 30) // Extra space between projects
      const parentTaskIndex = currentProjectTasks.findIndex(t => t.id === depId)
      
      return (
        <svg
          key={`${task.id}-${depId}`}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <path
            d={`M ${parseFloat(parentPos.left) + parseFloat(parentPos.width)}% ${projectOffset + parentTaskIndex * baseHeight + 20}
                C ${parseFloat(parentPos.left) + parseFloat(parentPos.width) + 2}% ${projectOffset + parentTaskIndex * baseHeight + 20}
                  ${parseFloat(childPos.left) - 2}% ${projectOffset + taskIndex * baseHeight + 20}
                  ${childPos.left} ${projectOffset + taskIndex * baseHeight + 20}`}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="2"
          />
        </svg>
      )
    })
  }

  // Add function to toggle project expansion
  const toggleProject = (projectId) => {
    setProjects(prev => prev.map(project => 
      project.projectId === projectId 
        ? { ...project, isExpanded: !project.isExpanded }
        : project
    ))
  }

  // Add function to get task color based on priority
  const getTaskColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-400 hover:bg-red-500'
      case 'medium':
        return 'bg-yellow-400 hover:bg-yellow-500'
      case 'low':
        return 'bg-green-400 hover:bg-green-500'
      default:
        return 'bg-blue-400 hover:bg-blue-500'
    }
  }

  return (
    <div className="flex h-screen bg-white pt-16">
      <div className="flex-1 flex flex-col">
        {/* Timeline Header */}
        <div className="flex items-center gap-4 p-4 border-b">
          <h1 className="text-xl font-semibold">My Tasks</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Timeline Grid - Updated Structure */}
        <div className="flex-1 flex">
          {/* Updated Projects Column */}
          <div className="w-72 flex-shrink-0 border-r bg-gray-50">
            <div className="border-b p-3 font-semibold bg-white">
              Projects & Tasks
            </div>
            <div className="space-y-4 p-4">
              {projects.map((project, projectIndex) => (
                <div 
                  key={project.projectId}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleProject(project.projectId)}
                    className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-800">{project.projectName}</span>
                    {project.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  
                  {project.isExpanded && (
                    <div className="divide-y divide-gray-100">
                      {project.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-2 pl-4 text-sm hover:bg-gray-50 transition-colors flex items-center"
                          style={{ height: '40px' }}
                        >
                          <div className={cn(
                            "w-2 h-2 rounded-full mr-2",
                            task.priority === 'high' ? 'bg-red-400' :
                            task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                          )} />
                          {task.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Updated Timeline Area */}
          <ScrollArea className="flex-1" orientation="horizontal">
            <div className="min-w-[800px] h-full">
              {/* Enhanced Date Headers */}
              <div className="flex border-b bg-white sticky top-0">
                {days.map((day, i) => (
                  <div
                    key={i}
                    className="flex-1 text-center p-2 text-sm border-r relative"
                  >
                    <div className="font-medium">{format(day, 'd')}</div>
                    <div className="text-xs text-gray-500">{format(day, 'EEE')}</div>
                  </div>
                ))}
              </div>

              {/* Enhanced Timeline Content */}
              <div className="relative h-full min-h-screen">
                {/* Vertical date lines */}
                <div className="absolute inset-0 flex h-full">
                  {days.map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 border-r border-gray-200 h-full"
                    />
                  ))}
                </div>

                {projects.map((project, projectIndex) => (
                  project.isExpanded && (
                    <div key={project.projectId}>
                      <div style={{ height: '40px' }} className="bg-gray-50" />
                      {project.tasks.map((task, taskIndex) => (
                        <div
                          key={task.id}
                          className="relative"
                          style={{ height: '40px' }}
                        >
                          {drawDependencyLines(task, projectIndex, taskIndex)}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "absolute h-6 top-1/2 -mt-3 rounded shadow-sm transition-all",
                                    getTaskColor(task.priority)
                                  )}
                                  style={{
                                    ...getTaskPosition(task),
                                    transform: 'translateX(1px)',
                                    marginRight: '-2px',
                                    display: getTaskPosition(task).display
                                  }}
                                >
                                  <div className="h-full w-full flex items-center justify-center text-white text-xs font-medium px-2 overflow-hidden">
                                    <span className="truncate whitespace-nowrap">
                                      {task.name}
                                    </span>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="bottom" 
                                align="start"
                                sideOffset={5}
                                className="z-50"
                              >
                                <div className="space-y-1">
                                  <p className="font-medium">{task.name}</p>
                                  <p className="text-xs">Start: {format(new Date(task.startDate), 'MMM d, yyyy')}</p>
                                  <p className="text-xs">Due: {format(new Date(task.endDate), 'MMM d, yyyy')}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ))}
                    </div>
                  )
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

