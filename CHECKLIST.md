
# Signup to Website Creation Flow Checklist

## 1. Authentication with Clerk
- [x] Ensure Clerk is properly configured in main.tsx with ClerkProvider
- [x] Verify Auth.tsx handles sign-in and sign-up flows properly
- [x] Confirm authentication state is properly managed in App.tsx
- [x] Test successful authentication redirects to onboarding for new users

## 2. User Creation and Persistence
- [x] Ensure Clerk user ID is properly converted to UUID using getUUIDFromClerkID utility
- [x] Verify profile record creation in Supabase after Clerk signup
- [x] Confirm subscriber record creation in Supabase for new users
- [x] Validate that RLS policies allow the correct access for authenticated users

## 3. Onboarding Flow
- [x] Fix template selection step to properly store the selected template
- [x] Ensure practice info step captures all required information
- [x] Modify PracticeInfo component to validate required fields (name and specialty)
- [x] Store practice information in profiles table during onboarding
- [x] Update Clerk user metadata with onboarding completion status

## 4. Website Creation
- [x] Fix RLS policies on the websites table to allow proper access
- [x] Ensure websiteContent is properly populated with practice information
- [x] Verify proper template selection and application of template defaults
- [x] Fix type casting issues in useWebsiteOperations.ts for content and settings
- [x] Create website record in Supabase during onboarding completion
- [x] Handle potential errors during website creation with proper user feedback

## 5. Post-Onboarding Navigation
- [x] Ensure users are redirected to dashboard after completing onboarding
- [x] Verify website appears in "My Websites" tab in WebsiteManager
- [x] Prevent duplicate onboarding by checking onboarding status
- [x] Ensure proper error handling if website creation fails

## 6. RLS Policy Fixes
- [x] Review and fix websites table RLS policies to ensure:
  - [x] SELECT policy uses auth.uid()::text = userid::text
  - [x] INSERT policy uses auth.uid()::text = userid::text
  - [x] UPDATE policy uses auth.uid()::text = userid::text
  - [x] DELETE policy uses auth.uid()::text = userid::text
- [x] Verify profiles table has appropriate RLS policies

## 7. Landing Page Generation
- [x] Create static landing page components for SEO-friendly rendering
- [x] Implement server-side rendering for landing pages when possible
- [x] Ensure landing pages load website content from Supabase
- [x] Add proper metadata to landing pages for SEO

## 8. Error Handling and User Experience
- [x] Implement proper loading states during onboarding and website creation
- [x] Add toast notifications for success and error states
- [x] Handle network failures and database errors gracefully
- [x] Provide user feedback during longer operations like website creation

## 9. Testing
- [ ] Test complete flow from signup to website creation
- [ ] Verify practice info is correctly saved to profiles table
- [ ] Confirm website creation and appearance in WebsiteManager
- [ ] Test error scenarios and recovery paths

## 10. Performance Optimization
- [ ] Optimize database queries to reduce loading times
- [ ] Consider implementing caching for website templates
- [ ] Review and optimize component re-renders in onboarding flow
