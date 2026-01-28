import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-[350px] space-y-6">
          {children}
        </div>
      </div>
      <div className="hidden lg:flex flex-col justify-center bg-zinc-900 overflow-hidden relative">
        <img 
          src="/right-photo-todo.png" 
          alt="Todo App" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
      </div>
    </div>
  )
}
