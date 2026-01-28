import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  MoreHorizontal, 
  User, 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Kanban,
  GripVertical,
  Search,
  Filter,
  Bell
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Link } from 'react-router-dom'
import CreateIssue from './create-issue'
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Input } from './ui/input'
import { ThemeToggle } from './theme-toggle'
import UserNav from './user-nav'
import NotificationCenter from './notification-center'

export interface Ticket {
  id: number
  title: string
  description: string
  status: string
  priority: string
  due_date?: string
  creator_id: number
  creator_username: string
  assignee_id: number | null
  assignee_username?: string
}

const COLUMNS = ['Backlog', 'Todo', 'In Progress', 'Done']

function SortableCard({ 
  ticket, 
  onDelete, 
  onUpdateStatus, 
  getPriorityColor 
}: { 
  ticket: Ticket, 
  onDelete: (id: number) => void,
  onUpdateStatus: (id: number, status: string) => void,
  getPriorityColor: (p: string) => string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: ticket.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="group cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-all duration-200 relative bg-white dark:bg-zinc-900 shadow-sm border-zinc-200 dark:border-zinc-800">
        <div 
          {...listeners} 
          className="absolute left-1 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-3 h-3 text-zinc-400" />
        </div>
        <CardHeader className="p-3 pb-0 pl-7">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-tight">
                ISS-{ticket.id}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {COLUMNS.filter(c => c !== ticket.status).map(newStatus => (
                  <DropdownMenuItem 
                    key={newStatus}
                    onClick={() => onUpdateStatus(ticket.id, newStatus)}
                  >
                    Move to {newStatus}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDelete(ticket.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle className="text-sm font-medium leading-normal mt-1">
            {ticket.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-2 pl-7">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </Badge>
              {ticket.due_date && (
                <div className="flex items-center text-[10px] text-muted-foreground bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0 rounded border border-zinc-200 dark:border-zinc-700">
                  <CalendarIcon className="w-3 h-3 mr-1" />
                  {new Date(ticket.due_date).toLocaleDateString()}
                </div>
              )}
            </div>
            <div className="flex items-center text-[11px] text-muted-foreground mt-1">
              <User className="w-3 h-3 mr-1" />
              {ticket.assignee_id ? ticket.assignee_username : 'Unassigned'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Column({ 
  id, 
  title, 
  count, 
  onAdd, 
  children 
}: { 
  id: string, 
  title: string, 
  count: number, 
  onAdd: () => void, 
  children: React.ReactNode 
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="w-80 flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </h2>
          <span className="text-xs text-zinc-500 tabular-nums">
            {count}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onAdd}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div 
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide rounded-xl transition-colors duration-200 min-h-[150px] ${
          isOver ? 'bg-zinc-100/50 dark:bg-zinc-800/50 ring-2 ring-primary/20' : ''
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export default function KanbanBoard() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [activeId, setActiveId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All')
  
  const queryClient = useQueryClient()
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await api.get('/tickets/')
      return response.data.data as Ticket[]
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.patch(`/tickets/${id}/status`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tickets/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    }
  })

  // Filter tickets
  const filteredTickets = tickets?.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over) {
      const draggedTicketId = active.id as number
      const overId = over.id as string | number
      
      let newStatus: string | null = null
      
      if (typeof overId === 'string' && COLUMNS.includes(overId)) {
        newStatus = overId
      } else {
        const overTicket = tickets?.find(t => t.id === overId)
        if (overTicket) {
          newStatus = overTicket.status
        }
      }
      
      if (newStatus) {
        const ticket = tickets?.find(t => t.id === draggedTicketId)
        if (ticket && ticket.status !== newStatus) {
          updateStatusMutation.mutate({ id: draggedTicketId, status: newStatus })
        }
      }
    }
    
    setActiveId(null)
  }

  if (isLoading) {
    return <div className="p-8">Loading board...</div>
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/50'
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50'
      case 'low': return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/50'
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-200 dark:border-zinc-800'
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold tracking-tight">Project Board</h1>
          </div>
          <nav className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <Link to="/">
              <Button variant="ghost" size="sm" className="bg-white dark:bg-zinc-950 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <Kanban className="w-4 h-4 mr-2" />
                Board
              </Button>
            </Link>
            <Link to="/calendar">
              <Button variant="ghost" size="sm" className="hover:bg-white dark:hover:bg-zinc-950 border border-transparent rounded-lg">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Calendar
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="hover:bg-white dark:hover:bg-zinc-950 border border-transparent rounded-lg">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <NotificationCenter />
          <ThemeToggle />
          <UserNav />
          <Button size="sm" className="bg-primary text-primary-foreground shadow-sm rounded-xl ml-2 px-4" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Issue
          </Button>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="px-6 py-4 border-b bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search issues..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <Filter className="h-4 w-4 ml-2 text-muted-foreground" />
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-sm border-none focus:ring-0 px-2 py-1 outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full px-3 py-1 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
            {filteredTickets?.length || 0} matching issues
          </Badge>
        </div>
      </div>

      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-zinc-50/50 dark:bg-zinc-950/50">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full min-w-max">
            {COLUMNS.map(column => (
              <Column 
                key={column} 
                id={column} 
                title={column} 
                count={filteredTickets?.filter(t => t.status === column).length || 0}
                onAdd={() => setIsCreateOpen(true)}
              >
                <SortableContext 
                  items={filteredTickets?.filter(t => t.status === column).map(t => t.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-3">
                    {filteredTickets?.filter(t => t.status === column).map(ticket => (
                      <SortableCard 
                        key={ticket.id} 
                        ticket={ticket} 
                        onDelete={(id) => deleteMutation.mutate(id)}
                        onUpdateStatus={(id, status) => updateStatusMutation.mutate({ id, status })}
                        getPriorityColor={getPriorityColor}
                      />
                    ))}
                    {filteredTickets?.filter(t => t.status === column).length === 0 && (
                      <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl h-24 flex items-center justify-center text-zinc-400 text-xs italic">
                        No issues found
                      </div>
                    )}
                  </div>
                </SortableContext>
              </Column>
            ))}
          </div>
          
          <DragOverlay>
            {activeId ? (
              <div className="w-80 opacity-80 cursor-grabbing rotate-2 scale-105 transition-transform shadow-2xl">
                <SortableCard 
                  ticket={tickets!.find(t => t.id === activeId)!}
                  onDelete={() => {}}
                  onUpdateStatus={() => {}}
                  getPriorityColor={getPriorityColor}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      <CreateIssue open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
