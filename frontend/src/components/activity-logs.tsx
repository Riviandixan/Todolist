import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { format, parseISO } from 'date-fns'
import { History, User, Kanban, Calendar as CalendarIcon, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ThemeToggle } from './theme-toggle'
import UserNav from './user-nav'

interface LogEntry {
  id: number
  ticket_id: number | null
  user_id: number
  username: string
  action: string
  created_at: string
}

export default function ActivityLogs() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      const response = await api.get('/logs/')
      return response.data.data as LogEntry[]
    }
  })

  if (isLoading) return <div className="p-8">Loading logs...</div>

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Activity Log</h1>
          </div>
          <nav className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <Link to="/">
              <Button variant="ghost" size="sm" className="rounded-lg">
                <Kanban className="w-4 h-4 mr-2" /> Board
              </Button>
            </Link>
            <Link to="/calendar">
              <Button variant="ghost" size="sm" className="rounded-lg">
                <CalendarIcon className="w-4 h-4 mr-2" /> Calendar
              </Button>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserNav />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div className="w-full max-w-4xl space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Audit Trail</h2>
              <p className="text-sm text-muted-foreground">Recent changes and updates across all issues.</p>
            </div>
          </div>

          <Card className="border-none shadow-sm dark:bg-zinc-900 overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {logs?.map((log) => (
                  <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="mt-1">
                      <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <User className="h-4 w-4 text-zinc-500" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-semibold text-foreground">{log.username}</span>
                        {' '}
                        <span className="text-muted-foreground">{log.action}</span>
                        {log.ticket_id && (
                          <span className="ml-2 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            ISS-{log.ticket_id}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(log.created_at), 'PPP p')}
                      </p>
                    </div>
                  </div>
                ))}
                {logs?.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">
                    No activity logs found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
