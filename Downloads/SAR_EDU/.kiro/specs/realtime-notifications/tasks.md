# Implementation Plan

- [ ] 1. Create notification data models and services
  - [x] 1.1 Create TypeScript interfaces for notifications and activities



    - Define Notification interface
    - Define Activity interface
    - Define NotificationStore and ActivityStore interfaces
    - Export types from types/notification.ts


    - _Requirements: All_
  
  - [ ] 1.2 Create notification service
    - Build NotificationService class
    - Implement addNotification method
    - Implement getNotifications with role filtering
    - Implement markAsRead and markAllAsRead
    - Implement deleteNotification



    - Implement getUnreadCount
    - Add localStorage integration
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 1.3 Create activity service
    - Build ActivityService class


    - Implement addActivity method
    - Implement getActivities with role filtering
    - Implement cleanupActivities
    - Add localStorage integration
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 2. Create toast notification system


  - [ ] 2.1 Create toast notification component
    - Build ToastNotification component
    - Add type-based styling (success, warning, error, info)
    - Add icons for each type
    - Implement auto-dismiss timer
    - Add manual dismiss button
    - Add slide-in/out animations


    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 2.2 Create toast container and manager
    - Build ToastContainer component
    - Implement toast stacking



    - Add toast queue management
    - Position toasts in top-right corner
    - Handle multiple simultaneous toasts
    - _Requirements: 2.5_

- [ ] 3. Create notification bell and center
  - [ ] 3.1 Create badge component
    - Build Badge component with count


    - Style with SAR red color
    - Add pulse animation for new notifications
    - Support different sizes
    - _Requirements: 1.2, 1.4_
  
  - [x] 3.2 Create notification bell component

    - Build NotificationBell component
    - Add bell icon (Lucide Bell)

    - Integrate badge with unread count
    - Add click handler to toggle center
    - Add pulse animation when new notification arrives
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  


  - [ ] 3.3 Create notification item component
    - Build NotificationItem component
    - Display icon, title, message, timestamp
    - Add relative time formatting
    - Style read vs unread states
    - Add delete button
    - Add action button (if actionUrl exists)
    - _Requirements: 3.2, 3.3, 3.5_


  
  - [ ] 3.4 Create notification center dropdown
    - Build NotificationCenter component
    - Add header with title and "Mark all read" button
    - Add scrollable notification list
    - Add empty state

    - Implement dropdown positioning

    - Add slide-down animation
    - Handle click outside to close
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_


- [ ] 4. Create activity feed component
  - [ ] 4.1 Build activity feed widget
    - Create ActivityFeed component
    - Display activity icon, description, timestamp
    - Add relative time formatting
    - Style with SAR colors
    - Limit to 10 most recent activities



    - Add empty state
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_



- [ ] 5. Integrate notifications into header
  - [ ] 5.1 Update header component
    - Import NotificationBell component
    - Add notification bell to header


    - Position bell in top-right area
    - Ensure responsive design
    - _Requirements: 1.1, 1.5_

- [ ] 6. Add demo notifications and activities
  - [ ] 6.1 Create demo data generator
    - Create function to generate demo notifications per role
    - Create function to generate demo activities per role
    - Add realistic timestamps
    - Include variety of notification types
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 6.2 Initialize demo data on first load
    - Check if user has existing notifications
    - If not, populate with demo data
    - Add demo activities
    - Store in localStorage
    - _Requirements: All_


- [ ] 7. Add activity feeds to dashboards
  - [ ] 7.1 Add activity feed to admin dashboard
    - Import ActivityFeed component
    - Replace or enhance "Recent Activity" section
    - Show admin-relevant activities


    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 7.2 Add activity feed to teacher dashboard
    - Import ActivityFeed component

    - Add "Recent Activity" section
    - Show teacher-relevant activities
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 7.3 Add activity feed to student dashboard

    - Import ActivityFeed component
    - Add "Recent Activity" section
    - Show student-relevant activities
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 8. Add CSS animations
  - [ ] 8.1 Add toast animations to globals.css
    - Add slideInRight keyframe
    - Add slideOutRight keyframe
    - Add animation utility classes
    - _Requirements: 2.1, 2.2_
  
  - [ ] 8.2 Add notification animations
    - Add badge-pulse keyframe
    - Add dropdownSlide keyframe
    - Add animation utility classes
    - _Requirements: 1.2, 3.1_

- [ ] 9. Testing and refinement
  - [ ] 9.1 Test notification system
    - Test notification creation and display
    - Test toast auto-dismiss and manual dismiss
    - Test notification center open/close
    - Test mark as read functionality
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 9.2 Test activity feed and role filtering
    - Test activity feed display
    - Verify role-based filtering
    - Test responsive design
    - Verify all animations work
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_


## Additional Header Features

- [ ] 10. Add global search functionality
  - [ ] 10.1 Create search modal component
    - Build SearchModal component with input field
    - Add keyboard shortcut (Ctrl+K) support
    - Implement search results grouping by category
    - Add keyboard navigation (arrow keys, Enter)
    - Style with SAR colors
    - _Requirements: Header-1.1, Header-1.2, Header-1.3, Header-1.6_
  
  - [ ] 10.2 Create search service
    - Build search function with role-based filtering
    - Implement search for students, teachers, classes
    - Add search for announcements and documents
    - Store recent searches in localStorage
    - _Requirements: Header-1.4, Header-1.7, Header-1.8, Header-4.1, Header-5.1, Header-6.1_
  
  - [ ] 10.3 Add search icon to header
    - Add search icon (Lucide Search) to header
    - Connect to search modal
    - Add Ctrl+K hint tooltip
    - Position in header bar
    - _Requirements: Header-1.1, Header-1.2_

- [ ] 11. Add contact/support functionality
  - [ ] 11.1 Create support modal component
    - Build SupportModal component
    - Add school contact information section
    - Add FAQ accordion section
    - Add support ticket form
    - Add quick links to guides
    - Style with SAR colors
    - _Requirements: Header-2.2, Header-2.3, Header-2.4, Header-2.5, Header-2.6, Header-2.7_
  
  - [ ] 11.2 Create support ticket service
    - Build ticket submission function
    - Generate ticket numbers
    - Store tickets in localStorage
    - Add ticket status tracking
    - _Requirements: Header-8.1, Header-8.2, Header-8.3, Header-8.4, Header-8.5_
  
  - [ ] 11.3 Add help icon to header
    - Add help icon (Lucide HelpCircle) to header
    - Connect to support modal
    - Position in header bar
    - _Requirements: Header-2.1, Header-2.2_

- [ ] 12. Add academic calendar
  - [ ] 12.1 Create calendar modal component
    - Build CalendarModal component
    - Add month view with navigation
    - Implement date highlighting for events
    - Add event details popup
    - Color-code by event type
    - Style with SAR colors
    - _Requirements: Header-3.2, Header-3.3, Header-3.4, Header-3.5, Header-3.6_
  
  - [ ] 12.2 Create calendar service
    - Build calendar event storage
    - Add Ghana Education Service holidays
    - Implement event CRUD operations (admin only)
    - Add personal reminders feature
    - Store in localStorage
    - _Requirements: Header-3.7, Header-3.8, Header-7.1, Header-7.2, Header-7.3, Header-7.4, Header-7.5_
  
  - [ ] 12.3 Add calendar icon to header
    - Add calendar icon (Lucide Calendar) to header
    - Connect to calendar modal
    - Position in header bar
    - _Requirements: Header-3.1, Header-3.2_
  
  - [ ] 12.4 Add demo calendar events
    - Create Ghana school holidays (2025)
    - Add sample exam dates
    - Add sample school events
    - Add term start/end dates
    - _Requirements: Header-3.3, Header-3.4, Header-3.5, Header-3.6_
