import { cn } from "@/lib/utils"
import { Header } from "@/components/header"

interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Shell({ children, className, ...props }: ShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={cn("flex-1", className)} {...props}>
        <div className="container py-10">
          {children}
        </div>
      </main>
    </div>
  )
} 