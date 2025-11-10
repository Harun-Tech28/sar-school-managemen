# Design Document

## Overview

This design implements a comprehensive loading and animation system for the SAR Educational Complex application. It includes custom SAR-branded loaders, skeleton screens, smooth page transitions, progress indicators, and animated statistics that enhance user experience and reinforce brand identity.

## Architecture

### Component Structure

```
components/
├── ui/
│   ├── loader.tsx              # Main SAR logo loader
│   ├── spinner.tsx             # Spinning loader
│   ├── skeleton.tsx            # Skeleton placeholders (already exists)
│   ├── progress-bar.tsx        # Progress indicator
│   └── animated-number.tsx     # Number count-up animation
├── loading/
│   ├── page-loader.tsx         # Full-page loading overlay
│   ├── card-skeleton.tsx       # Card skeleton variant
│   ├── table-skeleton.tsx      # Table skeleton variant
│   └── dashboard-skeleton.tsx  # Dashboard skeleton
└── transitions/
    ├── page-transition.tsx     # Page transition wrapper
    └── fade-in.tsx             # Fade-in animation wrapper
```

## Components and Interfaces

### 1. SAR Logo Loader

**Purpose:** Branded loading animation using SAR colors

**Design:**
```tsx
interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
}

// Animation: Pulsing SAR logo with rotating ring
// Colors: Red #E31E24 and Yellow #FFD100
// Duration: 1.5s infinite loop
```

**Visual:**
```
    ┌─────────────┐
    │             │
    │   [SAR]     │  ← Pulsing logo
    │   ○○○○○     │  ← Rotating ring (red/yellow)
    │  Loading... │
    │             │
    └─────────────┘
```

### 2. Spinner Component

**Purpose:** Simple spinning loader for inline use

**Design:**
```tsx
interface SpinnerProps {
  size?: number
  color?: 'red' | 'yellow' | 'white'
  speed?: 'slow' | 'normal' | 'fast'
}

// Animation: Circular spinner with SAR colors
// Variants: Solid, gradient, dual-color
```

### 3. Progress Bar

**Purpose:** Show progress of operations

**Design:**
```tsx
interface ProgressBarProps {
  value: number        // 0-100
  max?: number
  showLabel?: boolean
  color?: 'red' | 'yellow' | 'gradient'
  animated?: boolean
}

// Visual: Horizontal bar with percentage
// Animation: Smooth width transition
```

### 4. Animated Number

**Purpose:** Count-up animation for statistics

**Design:**
```tsx
interface AnimatedNumberProps {
  value: number
  duration?: number    // milliseconds
  decimals?: number
  prefix?: string      // e.g., "₵", "$"
  suffix?: string      // e.g., "%", "+"
  separator?: string   // e.g., ","
}

// Animation: Eased count from 0 to value
// Easing: easeOutExpo for natural feel
```

### 5. Skeleton Variants

**Purpose:** Content placeholders

**Variants:**
- **Card Skeleton**: Mimics stat cards
- **Table Skeleton**: Mimics data tables
- **Dashboard Skeleton**: Full dashboard layout
- **List Skeleton**: List items

**Design:**
```tsx
interface SkeletonProps {
  variant?: 'card' | 'table' | 'list' | 'text'
  count?: number
  animated?: boolean
}

// Animation: Shimmer effect (left to right)
// Colors: Gray base with lighter shimmer
```

## Data Models

### Loading State Management

```typescript
interface LoadingState {
  isLoading: boolean
  progress?: number
  message?: string
  error?: string
}

// Global loading context
interface LoadingContextType {
  loading: LoadingState
  setLoading: (state: Partial<LoadingState>) => void
  startLoading: (message?: string) => void
  stopLoading: () => void
  setProgress: (progress: number) => void
}
```

## Animation Specifications

### 1. Logo Pulse Animation

```css
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

Duration: 1.5s
Easing: ease-in-out
Infinite: yes
```

### 2. Ring Rotation

```css
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

Duration: 2s
Easing: linear
Infinite: yes
```

### 3. Shimmer Effect

```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

Duration: 1.5s
Easing: ease-in-out
Infinite: yes
```

### 4. Number Count-Up

```typescript
// Easing function
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

// Animation loop
requestAnimationFrame(() => {
  const progress = (Date.now() - startTime) / duration
  const easedProgress = easeOutExpo(Math.min(progress, 1))
  currentValue = startValue + (endValue - startValue) * easedProgress
})
```

### 5. Page Transitions

```css
/* Fade transition */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up transition */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

Duration: 300ms
Easing: ease-out
```

## Error Handling

### Loading Failures

- Show error message in loader
- Provide retry button
- Log errors to console
- Fallback to static content

### Animation Performance

- Use CSS transforms (GPU accelerated)
- Debounce rapid state changes
- Cancel animations on unmount
- Reduce motion for accessibility

## Testing Strategy

### Visual Testing

1. Test all loader sizes (sm, md, lg)
2. Verify animations are smooth (60fps)
3. Check color accuracy (SAR red/yellow)
4. Test on different screen sizes
5. Verify accessibility (reduced motion)

### Performance Testing

1. Measure animation frame rate
2. Check memory usage during animations
3. Test with slow network (loading states)
4. Verify no layout shifts

### Integration Testing

1. Test loading states in all dashboards
2. Verify skeleton loaders match content
3. Test page transitions between routes
4. Verify number animations with real data

## Implementation Details

### CSS Animations vs JavaScript

**Use CSS for:**
- Simple rotations, pulses
- Fade in/out
- Shimmer effects
- Page transitions

**Use JavaScript for:**
- Number count-ups
- Progress updates
- Complex sequences
- Data-driven animations

### Performance Optimizations

1. **Use `will-change` CSS property** for animated elements
2. **Lazy load** animation libraries
3. **Cancel animations** on component unmount
4. **Debounce** rapid state changes
5. **Use `requestAnimationFrame`** for smooth animations

### Accessibility

```tsx
// Respect user preferences
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches

// Disable animations if user prefers
if (prefersReducedMotion) {
  // Show instant state changes
  // Skip animations
}
```

## Design Decisions

### Why Custom Loader Instead of Library?

**Rationale:**
- Full control over branding
- Smaller bundle size
- Exact SAR colors
- Custom animations
- No external dependencies

### Why Skeleton Screens?

**Rationale:**
- Better perceived performance
- Users see layout immediately
- Reduces layout shift
- Industry best practice
- Improves UX significantly

### Why Number Animations?

**Rationale:**
- Makes data feel dynamic
- Draws attention to important metrics
- Modern, engaging UX
- Reinforces "live" system feel
- Minimal performance cost

## Color Palette

### Loading States

- **Primary Loader**: Red #E31E24
- **Secondary Accent**: Yellow #FFD100
- **Background**: White with 95% opacity
- **Skeleton Base**: Gray #E5E7EB
- **Skeleton Shimmer**: Gray #F3F4F6

### Progress Indicators

- **Success**: Green #10B981
- **Warning**: Yellow #FFD100
- **Error**: Red #E31E24
- **Info**: Blue #3B82F6

## Usage Examples

### Dashboard Loading

```tsx
<DashboardSkeleton />
// Shows skeleton matching dashboard layout
// Replaces with real content when loaded
```

### Inline Spinner

```tsx
<Button disabled={loading}>
  {loading ? <Spinner size={16} /> : 'Save'}
</Button>
```

### Animated Stats

```tsx
<AnimatedNumber 
  value={1247} 
  duration={2000}
  separator=","
/>
// Counts from 0 to 1,247 over 2 seconds
```

### Progress Upload

```tsx
<ProgressBar 
  value={uploadProgress} 
  showLabel 
  color="gradient"
/>
// Shows upload progress with percentage
```

---

**Status:** Ready for Implementation
**Priority:** High (Quick Win)
**Estimated Effort:** 2-3 days
