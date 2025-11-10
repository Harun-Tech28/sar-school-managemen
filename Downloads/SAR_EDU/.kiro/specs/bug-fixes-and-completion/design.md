# Design Document

## Overview

This design document outlines the approach to fix all identified bugs and complete incomplete tasks in the SAR Educational Complex School Management System. The fixes will focus on dependency management, package cleanup, TypeScript configuration, authentication improvements, offline functionality enhancements, and ensuring all dashboard pages are functional.

## Architecture

### Current Architecture
- **Frontend Framework**: Next.js 16.0.0 with React 19.2.0
- **Styling**: Tailwind CSS 4.1.9 with custom theme
- **UI Components**: Radix UI primitives
- **State Management**: React hooks and localStorage
- **Offline Storage**: IndexedDB via custom wrapper
- **Type Safety**: TypeScript 5 with strict mode

### Architecture Changes
No major architectural changes are required. The fixes will maintain the existing structure while:
1. Cleaning up invalid dependencies
2. Ensuring compatibility across all packages
3. Improving error handling patterns
4. Completing missing implementations

## Components and Interfaces

### 1. Package Dependency Resolution

#### Invalid Packages to Remove
```json
{
  "@components/Header": "latest",
  "@components/Page": "latest",
  "path": "latest",
  "path-to-and-module": "latest",
  "path-to-configuration-module": "latest",
  "path-to-curriculum-module": "latest",
  "path-to-education-module": "latest",
  "path-to-fee-module": "latest",
  "path-to-file-module": "latest",
  "path-to-ghana-module": "latest",
  "path-to-grading-module": "latest",
  "path-to-including-module": "latest",
  "path-to-new-module": "latest",
  "path-to-structures-module": "latest",
  "path-to-system-module": "latest"
}
```

#### Vaul Package Resolution
The `vaul@0.9.9` package has peer dependency requirements for React ^16.8 || ^17.0 || ^18.0, which conflicts with React 19.2.0.

**Solution Options:**
1. **Option A (Recommended)**: Remove vaul and replace with Radix UI Dialog/Sheet components (already in dependencies)
2. **Option B**: Use `--legacy-peer-deps` flag (not recommended for production)
3. **Option C**: Wait for vaul to support React 19 (blocks progress)

**Selected Solution**: Option A - Replace vaul with existing Radix UI components

### 2. TypeScript Configuration Improvements

#### Current Issues
```typescript
// next.config.mjs
typescript: {
  ignoreBuildErrors: true,  // ❌ Hides type errors
}
```

#### Proposed Changes
```typescript
// next.config.mjs
typescript: {
  ignoreBuildErrors: false,  // ✅ Show all type errors
}
```

This change will expose any hidden TypeScript errors that need to be fixed.

### 3. Authentication Enhancement

#### Current Implementation
- Basic localStorage-based authentication
- Simple role detection from email
- No password validation
- No session management

#### Design Improvements

**Password Validation**
```typescript
interface PasswordValidation {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecial: boolean;
}

function validatePassword(password: string, rules: PasswordValidation): {
  isValid: boolean;
  errors: string[];
}
```

**Enhanced User Data Structure**
```typescript
interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'parent' | 'student';
  createdAt: number;
  lastLogin: number;
}
```

**Session Management**
- Store user data in localStorage with expiration
- Implement session timeout (e.g., 24 hours)
- Add logout functionality
- Validate session on protected routes

### 4. Offline Functionality Enhancements

#### Current Implementation Analysis
The offline functionality is well-structured with:
- IndexedDB wrapper (`offlineDB`)
- Sync manager for online/offline transitions
- React hook for offline data management
- Visual indicator component

#### Identified Issues
1. No error handling for IndexedDB quota exceeded
2. No retry logic for failed sync operations
3. Sync queue could grow indefinitely
4. No conflict resolution for concurrent edits

#### Design Improvements

**Error Handling**
```typescript
interface DBError {
  type: 'QUOTA_EXCEEDED' | 'INIT_FAILED' | 'OPERATION_FAILED';
  message: string;
  timestamp: number;
}

class OfflineDB {
  private errorHandler: (error: DBError) => void;
  
  async save(key: string, data: unknown): Promise<void> {
    try {
      // existing implementation
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        this.errorHandler({
          type: 'QUOTA_EXCEEDED',
          message: 'Storage quota exceeded. Please clear old data.',
          timestamp: Date.now()
        });
      }
      throw error;
    }
  }
}
```

**Sync Retry Logic**
```typescript
interface SyncConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

class SyncManager {
  private syncConfig: SyncConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2
  };
  
  async syncWithRetry(attempt: number = 0): Promise<void> {
    try {
      await this.sync();
    } catch (error) {
      if (attempt < this.syncConfig.maxRetries) {
        const delay = this.syncConfig.retryDelay * Math.pow(this.syncConfig.backoffMultiplier, attempt);
        setTimeout(() => this.syncWithRetry(attempt + 1), delay);
      }
    }
  }
}
```

### 5. Dashboard Page Completion

#### Missing Implementations
Based on the file structure, many dashboard pages exist but may have incomplete implementations. The design ensures:

**Common Dashboard Layout**
```typescript
interface DashboardLayoutProps {
  role: 'admin' | 'teacher' | 'parent' | 'student';
  children: React.ReactNode;
}

// Shared components:
// - Navigation sidebar
// - Header with user info
// - Breadcrumbs
// - Offline indicator
```

**Page Structure Template**
```typescript
// Each dashboard page should follow this structure:
export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Page Title</h1>
        <p className="text-muted-foreground">Page description</p>
      </header>
      
      <main>
        {/* Page content */}
      </main>
    </div>
  );
}
```

### 6. Error Boundary Implementation

#### Design
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Implementation details
}
```

**Usage Locations:**
- Root layout (app/layout.tsx)
- Each dashboard section
- Form components
- Data fetching components

## Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'parent' | 'student';
  createdAt: number;
  lastLogin: number;
  sessionExpiry?: number;
}
```

### Offline Data Model
```typescript
interface StoredData {
  key: string;
  data: unknown;
  timestamp: number;
  synced: boolean;
}

interface SyncQueueItem {
  id?: number;
  key: string;
  action: 'update' | 'delete';
  timestamp: number;
  retryCount?: number;
}
```

### Error Model
```typescript
interface AppError {
  code: string;
  message: string;
  timestamp: number;
  context?: Record<string, unknown>;
}
```

## Error Handling

### Error Categories

1. **Dependency Errors**
   - Detection: During npm install
   - Resolution: Remove invalid packages, update incompatible ones
   - Prevention: Use exact versions, regular dependency audits

2. **TypeScript Errors**
   - Detection: During build process
   - Resolution: Fix type mismatches, add proper type definitions
   - Prevention: Enable strict mode, use proper types

3. **Runtime Errors**
   - Detection: Error boundaries, try-catch blocks
   - Resolution: Graceful degradation, user-friendly messages
   - Prevention: Input validation, defensive programming

4. **Offline Storage Errors**
   - Detection: IndexedDB operation failures
   - Resolution: Fallback to memory storage, clear old data
   - Prevention: Quota monitoring, data cleanup strategies

5. **Sync Errors**
   - Detection: Network failures, API errors
   - Resolution: Retry with exponential backoff, queue persistence
   - Prevention: Connection monitoring, conflict resolution

### Error Handling Strategy

```typescript
// Global error handler
function handleError(error: AppError): void {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[App Error]', error);
  }
  
  // Show user-friendly message
  toast.error(error.message);
  
  // Track in analytics (production)
  if (process.env.NODE_ENV === 'production') {
    // analytics.trackError(error);
  }
}
```

## Testing Strategy

### Unit Testing
- **Offline DB operations**: Test save, get, delete, sync queue
- **Sync Manager**: Test online/offline transitions, retry logic
- **Password validation**: Test all validation rules
- **Utility functions**: Test cn() and other helpers

### Integration Testing
- **Authentication flow**: Test login, registration, session management
- **Offline sync**: Test data persistence and synchronization
- **Dashboard navigation**: Test role-based routing
- **Form submissions**: Test validation and error handling

### Manual Testing Checklist
1. ✅ Install dependencies without errors
2. ✅ Build application successfully
3. ✅ Login with different roles
4. ✅ Register new accounts
5. ✅ Navigate all dashboard pages
6. ✅ Test offline functionality
7. ✅ Test sync when coming back online
8. ✅ Verify error messages display correctly
9. ✅ Check responsive design on mobile
10. ✅ Test in different browsers

## Implementation Priority

### Phase 1: Critical Fixes (High Priority)
1. Fix package.json - remove invalid dependencies
2. Resolve React 19 compatibility issues
3. Fix TypeScript configuration
4. Ensure application builds successfully

### Phase 2: Core Functionality (Medium Priority)
5. Enhance authentication with validation
6. Improve offline error handling
7. Add error boundaries
8. Complete missing dashboard pages

### Phase 3: Polish (Low Priority)
9. Add comprehensive error messages
10. Improve sync retry logic
11. Add loading states
12. Optimize performance

## Security Considerations

1. **Password Storage**: Never store plain text passwords (even in demo)
2. **Session Management**: Implement proper session expiry
3. **Input Validation**: Validate all user inputs
4. **XSS Prevention**: Sanitize user-generated content
5. **CSRF Protection**: Add tokens for state-changing operations (future)

## Performance Considerations

1. **Bundle Size**: Remove unused dependencies to reduce bundle size
2. **Code Splitting**: Lazy load dashboard pages
3. **Image Optimization**: Use Next.js Image component (already implemented)
4. **Offline Storage**: Implement data cleanup to prevent quota issues
5. **Sync Optimization**: Batch sync operations, debounce sync triggers

## Accessibility Considerations

1. **Form Labels**: All inputs have proper labels (already implemented)
2. **Error Messages**: Associate errors with form fields
3. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
4. **Screen Readers**: Add ARIA labels where needed
5. **Color Contrast**: Verify color combinations meet WCAG standards

## Browser Compatibility

- **Target Browsers**: Modern browsers with IndexedDB support
- **Minimum Versions**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Polyfills**: None required for target browsers
- **Progressive Enhancement**: Graceful degradation for older browsers

## Deployment Considerations

1. **Environment Variables**: Set up for different environments
2. **Build Optimization**: Enable production optimizations
3. **Error Tracking**: Integrate error monitoring service (future)
4. **Analytics**: Add usage tracking (Vercel Analytics already included)
5. **CDN**: Use for static assets and images
