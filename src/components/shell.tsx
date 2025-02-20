interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Shell({
  children,
  className,
  ...props
}: ShellProps) {
  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex flex-col"
      {...props}
    >
      {children}
    </div>
  )
} 