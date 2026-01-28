import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Calendar as CalendarIcon, Kanban } from 'lucide-react'
import { Link } from 'react-router-dom'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts'
import type { Ticket } from './kanban-board'

const PRIORITY_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#3b82f6',
}

export default function Dashboard() {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await api.get('/tickets/')
      return response.data.data as Ticket[]
    }
  })

  if (isLoading) return <div className="p-8">Loading stats...</div>

  const statusData = [
    { name: 'Backlog', value: tickets?.filter(t => t.status === 'Backlog').length || 0 },
    { name: 'Todo', value: tickets?.filter(t => t.status === 'Todo').length || 0 },
    { name: 'In Progress', value: tickets?.filter(t => t.status === 'In Progress').length || 0 },
    { name: 'Done', value: tickets?.filter(t => t.status === 'Done').length || 0 },
  ]

  const priorityData = [
    { name: 'High', value: tickets?.filter(t => t.priority === 'High').length || 0 },
    { name: 'Medium', value: tickets?.filter(t => t.priority === 'Medium').length || 0 },
    { name: 'Low', value: tickets?.filter(t => t.priority === 'Low').length || 0 },
  ]

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
          </div>
          <nav className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            <Link to="/">
              <Button variant="ghost" size="sm" className="hover:bg-white dark:hover:bg-zinc-900">
                <Kanban className="w-4 h-4 mr-2" />
                Board
              </Button>
            </Link>
            <Link to="/calendar">
              <Button variant="ghost" size="sm" className="hover:bg-white dark:hover:bg-zinc-900">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Calendar
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="bg-white dark:bg-zinc-900 shadow-sm">
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

      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {tickets?.filter(t => t.status === 'In Progress').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {tickets?.filter(t => t.status === 'Done').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {tickets?.filter(t => t.priority === 'High').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 p-4">
          <CardHeader>
            <CardTitle className="text-lg">Issues by Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900 p-4">
          <CardHeader>
            <CardTitle className="text-lg">Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      </main>
    </div>
  )
}
