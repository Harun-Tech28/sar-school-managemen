import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-4 text-center",
      className
    )}>
      <div className="rounded-full bg-muted/50 p-8 mb-6 shadow-inner">
        <Icon className="h-16 w-16 text-muted-foreground/60" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-8 max-w-md leading-relaxed">
        {description}
      </p>
      
      {action && (
        <Button 
          onClick={action.onClick}
          size="lg"
          className="gap-2 shadow-primary hover-lift"
        >
          {action.icon && <action.icon className="h-5 w-5" />}
          {action.label}
        </Button>
      )}
    </div>
  )
}
