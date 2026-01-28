import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutDashboard, Kanban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import type { Ticket } from './kanban-board'

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await api.get('/tickets/')
      return response.data.data as Ticket[]
    }
  })

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/50'
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50'
      case 'low': return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/50'
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-200 dark:border-zinc-800'
    }
  }

  if (isLoading) return <div className="p-8">Loading calendar...</div>

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold tracking-tight">Calendar</h1>
          </div>
          <nav className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <Link to="/">
              <Button variant="ghost" size="sm" className="hover:bg-white dark:hover:bg-zinc-900 border border-transparent">
                <Kanban className="w-4 h-4 mr-2" />
                Board
              </Button>
            </Link>
            <Link to="/calendar">
              <Button variant="ghost" size="sm" className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-700">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Calendar
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="hover:bg-white dark:hover:bg-zinc-900 border border-transparent">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => {
            localStorage.removeItem('token')
            window.location.href = '/login'
          }}>
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar Plan</h1>
          </div>
          <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-1 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-zinc-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const dayTickets = tickets?.filter(t => t.due_date && isSameDay(new Date(t.due_date), day))
              
              return (
                <div 
                  key={idx} 
                  className={`min-h-[140px] p-2 border-r border-b border-zinc-100 dark:border-zinc-800 last:border-r-0 ${
                    !isSameMonth(day, monthStart) ? 'bg-zinc-50/50 dark:bg-zinc-950/50 opacity-50' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-2 flex items-center justify-center w-7 h-7 rounded-full ${
                    isSameDay(day, new Date()) ? 'bg-primary text-white' : ''
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayTickets?.map(ticket => (
                      <div 
                        key={ticket.id}
                        className={`${getPriorityColor(ticket.priority)} border text-[10px] px-1.5 py-0.5 rounded shadow-sm truncate cursor-pointer transition-transform hover:scale-105`}
                        title={ticket.title}
                      >
                        {ticket.title}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
