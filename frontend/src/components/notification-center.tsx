import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { format, parseISO } from 'date-fns'

export default function NotificationCenter() {
  const { data: logs } = useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      const response = await api.get('/logs/')
      return response.data.data
    },
    refetchInterval: 10000 // Poll every 10 seconds
  })

  // In a real app, you'd filter for "unread" or specific notifications for the user
  const recentLogs = logs?.slice(0, 5) || []

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-800 relative bg-white dark:bg-zinc-900">
          <Bell className="h-4 w-4" />
          {recentLogs.length > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {recentLogs.map((log: { id: number; username: string; action: string; created_at: string }) => (
            <div key={log.id} className="p-4 border-b last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer">
              <p className="text-xs">
                <span className="font-medium">{log.username}</span> {log.action}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {format(parseISO(log.created_at), 'HH:mm')}
              </p>
            </div>
          ))}
          {recentLogs.length === 0 && (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No new notifications
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
