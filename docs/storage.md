# Supabase Storage Setup for Zermind Chat Attachments

## Overview

Zermind uses private Supabase storage buckets for secure chat attachment handling. This ensures user privacy and proper access control for uploaded files.

## Bucket Configuration

### 1. Create the Storage Bucket

In your Supabase dashboard:

1. Go to **Storage** → **Buckets**
2. Click **New Bucket**
3. Set the following configuration:

```
Bucket Name: chat-attachments
Public: false (IMPORTANT - must be private)
File size limit: 50MB
Allowed MIME types:
  - image/jpeg
  - image/png
  - image/gif
  - image/webp
  - application/pdf
```

### 2. Set Up Row Level Security (RLS) Policies

Navigate to **Storage** → **Policies** and create these policies for the `chat-attachments` bucket:

#### Policy 1: Upload Policy

```sql
-- Users can upload files to the uploads folder structure
CREATE POLICY "Allow authenticated uploads to chat-attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-attachments'
  AND (storage.foldername(name))[1] = 'uploads'
);
```

#### Policy 2: Select Policy

```sql
-- Users can view files they uploaded
CREATE POLICY "Allow users to view their own chat attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND (SELECT auth.uid()) = owner_id::uuid
);
```

#### Policy 3: Update Policy

```sql
-- Users can update their own files (for upsert functionality)
CREATE POLICY "Allow users to update their own chat attachments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND (SELECT auth.uid()) = owner_id::uuid
)
WITH CHECK (
  bucket_id = 'chat-attachments'
  AND (SELECT auth.uid()) = owner_id::uuid
);
```

#### Policy 4: Delete Policy

```sql
-- Users can delete their own uploaded files
CREATE POLICY "Allow users to delete their own chat attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND (SELECT auth.uid()) = owner_id::uuid
);
```

### 3. Advanced Policies (Optional - for shared conversations)

If you want to implement shared conversations where multiple users can access the same attachments, you can replace the basic SELECT policy with this enhanced version:

```sql
-- Enhanced select policy for shared conversations
DROP POLICY IF EXISTS "Allow users to view their own chat attachments" ON storage.objects;

CREATE POLICY "Allow users to view shared chat attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND (
    -- User uploaded the file
    (SELECT auth.uid()) = owner_id::uuid
    OR
    -- User has access to the chat containing this attachment
    EXISTS (
      SELECT 1 FROM chats c
      JOIN messages m ON c.id = m.chat_id
      JOIN jsonb_array_elements(m.attachments) AS att ON true
      WHERE att->>'filePath' = name
      AND (
        c.user_id = auth.uid()
        OR c.is_collaborative = true
      )
    )
  )
);
```

### 4. User-Specific Folder Policy (Alternative)

If you prefer to organize files by user ID folders, you can use this alternative upload policy:

```sql
-- Alternative: Users upload to their own user ID folder
CREATE POLICY "Allow authenticated uploads to user folders"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-attachments'
  AND (storage.foldername(name))[1] = 'uploads'
  AND (storage.foldername(name))[2] = (SELECT auth.uid()::text)
);
```

This would create a folder structure like:

```
chat-attachments/
├── uploads/
│   ├── user-uuid-1/
│   │   ├── file1.jpg
│   │   └── file2.pdf
│   ├── user-uuid-2/
│   │   └── file3.png
```

## File Structure

The application organizes files in the following structure:

```
chat-attachments/
├── uploads/
│   ├── 2024/
│   │   ├── 1/          # January
│   │   ├── 2/          # February
│   │   └── ...
│   ├── 2025/
│   │   └── ...
```

**Note**: If you choose the user-specific folder approach, the structure would be:

```
chat-attachments/
├── uploads/
│   ├── user-uuid-1/
│   ├── user-uuid-2/
│   └── ...
```

## Security Benefits

### ✅ Private Storage

- Files are not accessible via direct URLs
- All access requires authentication
- Signed URLs provide temporary, secure access

### ✅ Access Control

- Row Level Security policies enforce permissions based on file ownership
- Users can only access files they uploaded (unless shared)
- Prevents unauthorized file access

### ✅ URL Expiration

- Signed URLs expire after 1 hour
- Reduces risk of URL sharing abuse
- URLs are automatically refreshed when needed

## Migration from Public Bucket

If you're migrating from a public bucket:

1. **Update bucket to private** in Supabase dashboard
2. **Apply RLS policies** as shown above
3. **Update existing attachment URLs** to use signed URLs:

```typescript
// Migration script example
const migrateAttachments = async () => {
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .not("attachments", "is", null);

  for (const message of messages) {
    const updatedAttachments = await Promise.all(
      message.attachments.map(async (attachment) => {
        if (!attachment.filePath) {
          // Extract file path from public URL
          const url = new URL(attachment.url);
          const filePath = url.pathname.split("/public/chat-attachments/")[1];
          return { ...attachment, filePath };
        }
        return attachment;
      })
    );

    await supabase
      .from("messages")
      .update({ attachments: updatedAttachments })
      .eq("id", message.id);
  }
};
```

## Environment Variables

Ensure your `.env` includes:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting

### Common Issues

1. **"Access Denied" errors**

   - Verify RLS policies are correctly set up
   - Check that bucket is marked as private
   - Ensure user is authenticated
   - Verify `owner_id` is set correctly on uploaded files

2. **Signed URL generation fails**

   - Verify file path format matches bucket structure
   - Check bucket permissions in Supabase dashboard
   - Ensure adequate Supabase plan limits

3. **Files not uploading**
   - Check file size limits
   - Verify MIME type restrictions
   - Review bucket policies for INSERT permissions
   - Ensure folder structure matches policy expectations

### Testing Your Policies

You can test your policies by trying to:

1. **Upload a file** (should work for authenticated users)
2. **View your own file** (should work)
3. **View another user's file** (should fail unless shared)
4. **Delete your own file** (should work)
5. **Delete another user's file** (should fail)

### Support Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
