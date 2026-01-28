import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export default function UserNav() {
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      // We'll need an endpoint for current user, for now let's use localStorage
      const token = localStorage.getItem('token')
      if (!token) return null
      // Assuming we have a way to get my info, or just placeholder for now
      return { username: 'Rivi', initials: 'R' } 
    }
  })

  const logout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <AvatarImage src="" alt={user?.username} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {user?.initials || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.username.toLowerCase()}@example.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">Profile Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/logs">Activity Log</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
