# Design Document - Frontend UX Improvements

## Overview

This design document outlines comprehensive UX/UI improvements to make the SAR Educational Complex School Management System more user-friendly, accessible, and visually appealing.

## Design Principles

1. **Clarity**: Every element should have a clear purpose
2. **Consistency**: Similar elements should look and behave the same
3. **Feedback**: Users should always know what's happening
4. **Efficiency**: Common tasks should be quick and easy
5. **Forgiveness**: Users should be able to undo mistakes

## Component Improvements

### 1. Enhanced Loading States

**Skeleton Loaders**
```typescript
// components/ui/skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-muted", className)} />
  )
}

// Usage in tables
<TableRow>
  <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
</TableRow>
```

**Loading Overlays**
```typescript
// components/ui/loading-overlay.tsx
export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  )
}
```

### 2. Toast Notifications System

Using Sonner (already in dependencies):

```typescript
// lib/toast.ts
import { toast as sonnerToast } from 'sonner'

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message, {
      duration: 3000,
      position: 'top-right',
    })
  },
  
  error: (message: string) => {
    sonnerToast.error(message, {
      duration: 5000,
      position: 'top-right',
    })
  },
  
  loading: (message: string) => {
    return sonnerToast.loading(message, {
      position: 'top-right',
    })
  },
  
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return sonnerToast.promise(promise, messages)
  }
}
```

### 3. Confirmation Dialogs

```typescript
// components/ui/confirm-dialog.tsx
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "default"
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={variant === "destructive" ? "bg-destructive" : ""}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### 4. Empty States

```typescript
// components/ui/empty-state.tsx
export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.icon && <action.icon className="mr-2 h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

### 5. Enhanced Navigation

**Breadcrumbs Component**
```typescript
// components/ui/breadcrumb.tsx
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      {items.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          {index === items.length - 1 ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-foreground transition">
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
```

**Mobile Navigation**
```typescript
// components/layout/mobile-nav.tsx
export function MobileNav({ userRole }: { userRole: string }) {
  const [open, setOpen] = useState(false)
  
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <Sidebar userRole={userRole} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
```

### 6. Form Enhancements

**Inline Validation**
```typescript
// components/ui/form-field.tsx
export function FormField({
  label,
  error,
  hint,
  required,
  children
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}
```

**Auto-save Indicator**
```typescript
// components/ui/auto-save-indicator.tsx
export function AutoSaveIndicator({ status }: { status: 'saving' | 'saved' | 'error' }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {status === 'saving' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="h-3 w-3 text-accent" />
          <span>Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="h-3 w-3 text-destructive" />
          <span>Error saving</span>
        </>
      )}
    </div>
  )
}
```

### 7. Data Tables Enhancement

**Sortable Headers**
```typescript
// components/ui/sortable-header.tsx
export function SortableHeader({
  label,
  sortKey,
  currentSort,
  onSort
}: SortableHeaderProps) {
  const isActive = currentSort.key === sortKey
  
  return (
    <TableHead>
      <button
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-2 hover:text-foreground transition"
      >
        {label}
        {isActive ? (
          currentSort.direction === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-50" />
        )}
      </button>
    </TableHead>
  )
}
```

**Pagination Component**
```typescript
// components/ui/pagination.tsx
export function Pagination({
  currentPage,
  totalPages,
  onPageChange
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
```

### 8. Search and Filters

**Search Bar Component**
```typescript
// components/ui/search-bar.tsx
export function SearchBar({
  value,
  onChange,
  placeholder = "Search..."
}: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}
```

**Filter Dropdown**
```typescript
// components/ui/filter-dropdown.tsx
export function FilterDropdown({
  label,
  options,
  value,
  onChange
}: FilterDropdownProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          {label}
          {value && <Badge variant="secondary">{value}</Badge>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => onChange(option.value)}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
```

### 9. Dashboard Widgets

**Stat Card with Trend**
```typescript
// components/dashboard/stat-card.tsx
export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue
}: StatCardProps) {
  const isPositive = trend === 'up'
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold">{value}</p>
        {trendValue && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            isPositive ? "text-accent" : "text-destructive"
          )}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {trendValue}
          </div>
        )}
      </div>
    </Card>
  )
}
```

### 10. Animations

**Page Transitions**
```typescript
// components/ui/page-transition.tsx
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}
```

## Responsive Design Strategy

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations
1. Stack cards vertically
2. Collapse sidebar to hamburger menu
3. Make tables horizontally scrollable
4. Increase touch target sizes (min 44x44px)
5. Simplify navigation

## Accessibility Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Proper focus indicators
- [ ] ARIA labels on all icons
- [ ] Color contrast ratio >= 4.5:1
- [ ] Form labels properly associated
- [ ] Error messages announced to screen readers
- [ ] Skip navigation link
- [ ] Semantic HTML structure

## Performance Optimizations

1. **Lazy Loading**: Load components only when needed
2. **Image Optimization**: Use Next.js Image component
3. **Code Splitting**: Split large pages into chunks
4. **Memoization**: Use React.memo for expensive components
5. **Debouncing**: Debounce search and filter inputs

## Color System Enhancement

```css
/* Enhanced color palette */
:root {
  /* Primary - SAR Red */
  --primary-50: oklch(0.95 0.05 15);
  --primary-100: oklch(0.90 0.10 15);
  --primary-500: oklch(0.52 0.22 15);
  --primary-600: oklch(0.45 0.22 15);
  --primary-700: oklch(0.38 0.22 15);
  
  /* Secondary - SAR Yellow */
  --secondary-50: oklch(0.95 0.05 90);
  --secondary-100: oklch(0.90 0.10 90);
  --secondary-500: oklch(0.82 0.20 90);
  --secondary-600: oklch(0.75 0.20 90);
  
  /* Success */
  --success: oklch(0.65 0.20 145);
  
  /* Warning */
  --warning: oklch(0.75 0.15 60);
  
  /* Info */
  --info: oklch(0.60 0.20 240);
}
```

## Typography Scale

```css
/* Font sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

## Implementation Priority

### Phase 1: Core UX (High Priority)
1. Toast notifications
2. Loading states
3. Empty states
4. Confirmation dialogs

### Phase 2: Navigation (Medium Priority)
5. Breadcrumbs
6. Mobile navigation
7. Search functionality

### Phase 3: Polish (Low Priority)
8. Animations
9. Advanced filters
10. Tooltips and hints
