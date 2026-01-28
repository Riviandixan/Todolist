import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Camera, Lock, User, LayoutDashboard, Calendar as CalendarIcon, Kanban } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from './theme-toggle'

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await api.get('/auth/me') // Assuming we have this or similar
      return response.data.data
    },
    meta: {
      onSuccess: (data: any) => {
        setUsername(data.username)
      }
    }
  })

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      await api.put('/profile/', { username, profile_photo: '' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      alert('Profile updated!')
    }
  })

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      if (password !== confirmPassword) throw new Error('Passwords do not match')
      await api.put('/profile/password', { password })
    },
    onSuccess: () => {
      setPassword('')
      setConfirmPassword('')
      alert('Password updated!')
    },
    onError: (error: any) => {
      alert(error.message)
    }
  })

  if (isLoading) return <div className="p-8">Loading profile...</div>

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold">Settings</h1>
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
          <Button variant="outline" size="sm" onClick={() => {
            localStorage.removeItem('token')
            window.location.href = '/login'
          }}>Logout</Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div className="w-full max-w-2xl space-y-8">
          <Card className="border-none shadow-sm dark:bg-zinc-900">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="relative group">
                <Avatar className="h-20 w-20 border-2 border-primary/20">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="text-white h-6 w-6" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl">{username}</CardTitle>
                <CardDescription>Manage your public profile and preferences.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex gap-2">
                  <Input 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="dark:bg-zinc-950"
                  />
                  <Button onClick={() => updateProfileMutation.mutate()} disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Lock className="w-5 h-5" /> Security
              </CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="dark:bg-zinc-950"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="dark:bg-zinc-950"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="destructive" 
                onClick={() => updatePasswordMutation.mutate()}
                disabled={updatePasswordMutation.isPending || !password}
              >
                {updatePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
