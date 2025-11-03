# Supabase Storage Setup Guide

## Overview

The SAR School Management System uses Supabase Storage for managing files across four buckets:
- **documents** - School documents, forms, policies (10MB limit)
- **materials** - Teaching materials, assignments, notes (10MB limit)
- **reports** - Generated report cards and transcripts (10MB limit)
- **profile-images** - User profile photos (5MB limit)

## Setup Methods

### Method 1: Using Migration (Recommended)

The storage buckets and policies are created automatically when you run the migration:

```bash
supabase db push
```

Or if using the dashboard, run the SQL from:
`supabase/migrations/20240101000005_create_storage_buckets.sql`

### Method 2: Manual Setup via Dashboard

If the migration doesn't work or you prefer manual setup:

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the sidebar
3. Create each bucket manually:

#### Create Documents Bucket
- Name: `documents`
- Public: No (unchecked)
- File size limit: 10485760 (10MB)
- Allowed MIME types: 
  - application/pdf
  - application/msword
  - application/vnd.openxmlformats-officedocument.wordprocessingml.document
  - image/jpeg
  - image/png

#### Create Materials Bucket
- Name: `materials`
- Public: No (unchecked)
- File size limit: 10485760 (10MB)
- Allowed MIME types:
  - application/pdf
  - application/msword
  - application/vnd.openxmlformats-officedocument.wordprocessingml.document
  - application/vnd.ms-powerpoint
  - application/vnd.openxmlformats-officedocument.presentationml.presentation
  - image/jpeg
  - image/png
  - text/plain

#### Create Reports Bucket
- Name: `reports`
- Public: No (unchecked)
- File size limit: 10485760 (10MB)
- Allowed MIME types:
  - application/pdf

#### Create Profile Images Bucket
- Name: `profile-images`
- Public: No (unchecked)
- File size limit: 5242880 (5MB)
- Allowed MIME types:
  - image/jpeg
  - image/png
  - image/webp

## Storage Policies

### Documents Bucket Policies
- **Admins**: Full access (read, write, delete)
- **All authenticated users**: Read access

### Materials Bucket Policies
- **Admins**: Full access
- **Teachers**: Can upload, update own materials, delete own materials
- **All authenticated users**: Read access

### Reports Bucket Policies
- **Admins**: Full access
- **System**: Can create reports (for automated generation)
- **Students**: Can view own reports
- **Parents**: Can view children's reports
- **Teachers**: Can view reports for their students

### Profile Images Bucket Policies
- **Admins**: Full access
- **All users**: Can upload, update, delete own profile image
- **All authenticated users**: Read access to all profile images

## Folder Structure

### Documents Bucket
```
documents/
├── policies/
├── forms/
└── circulars/
```

### Materials Bucket
```
materials/
├── {teacher_id}/
│   ├── {subject_id}/
│   │   ├── notes/
│   │   └── assignments/
```

### Reports Bucket
```
reports/
└── {student_id}/
    └── {term_id}/
        └── report_card.pdf
```

### Profile Images Bucket
```
profile-images/
├── {user_id}/
│   └── profile.jpg
```

## Usage Examples

### Web App (React)

```typescript
import { FileUploader } from '@/components/FileUploader'

// In your component
<FileUploader
  bucket="materials"
  path={`materials/${teacherId}/${subjectId}/notes/${fileName}`}
  accept=".pdf,.doc,.docx"
  maxSizeMB={10}
  allowedTypes={['application/pdf', 'application/msword']}
  onUploadComplete={(url, path) => {
    console.log('File uploaded:', url)
    // Save to database
  }}
  onError={(error) => {
    console.error('Upload error:', error)
  }}
/>
```

### Using the Hook Directly

```typescript
import { useFileUpload } from '@/hooks/useFileUpload'

const { upload, uploading, progress, error } = useFileUpload({
  bucket: 'profile-images',
  onSuccess: (result) => {
    console.log('Upload successful:', result.url)
  },
})

// Upload file
const handleUpload = async (file: File) => {
  const path = `profile-images/${userId}/profile.jpg`
  await upload(file, path)
}
```

### Mobile App (React Native)

```typescript
import * as DocumentPicker from 'expo-document-picker'
import { uploadFile } from '@sar-school/shared'
import { supabase } from '@/lib/supabase'

const pickAndUpload = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
  })

  if (result.type === 'success') {
    const file = {
      uri: result.uri,
      name: result.name,
      type: result.mimeType,
    }

    const uploadResult = await uploadFile(supabase, {
      bucket: 'materials',
      path: `materials/${teacherId}/${fileName}`,
      file: file as any,
      contentType: result.mimeType,
    })

    if (uploadResult.success) {
      console.log('Uploaded:', uploadResult.url)
    }
  }
}
```

## Verifying Storage Setup

### Check Buckets Exist
```sql
SELECT * FROM storage.buckets;
```

You should see 4 buckets: documents, materials, reports, profile-images

### Check Storage Policies
```sql
SELECT * FROM storage.policies;
```

You should see multiple policies for each bucket.

### Test Upload (via Dashboard)
1. Go to Storage in Supabase Dashboard
2. Select a bucket
3. Try uploading a test file
4. Verify it appears in the bucket

## Troubleshooting

### Error: "Bucket not found"
- Run the storage migration again
- Or create buckets manually via dashboard

### Error: "Policy violation" or "Permission denied"
- Check that RLS policies are created
- Verify user is authenticated
- Check user role matches policy requirements

### Error: "File size exceeds limit"
- Check file size limits in bucket configuration
- Validate file size before upload in your code

### Files Not Uploading
- Check browser console for errors
- Verify Supabase credentials in .env
- Check network tab for failed requests
- Ensure user has proper permissions

### Can't Delete Files
- Check if user owns the file (for user-specific buckets)
- Verify user role has delete permissions
- Check storage policies

## Security Best Practices

1. **Never make buckets public** unless absolutely necessary
2. **Use signed URLs** for temporary access to private files
3. **Validate file types** on both client and server
4. **Limit file sizes** to prevent abuse
5. **Use folder structure** to organize files by user/role
6. **Audit file access** using audit_logs table
7. **Clean up old files** periodically to save storage space

## Storage Limits

### Supabase Free Tier
- 1GB storage included
- Additional storage: $0.021/GB per month

### Recommended Cleanup Strategy
- Delete old report cards after 2 years
- Archive old materials at end of academic year
- Compress images before upload
- Use PDF compression for documents

## Next Steps

After setting up storage:
1. Test file upload in web app
2. Test file upload in mobile app
3. Verify access controls with different user roles
4. Implement file cleanup routines
5. Monitor storage usage in Supabase dashboard
