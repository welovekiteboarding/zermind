# BYOK Migration Guide

## Overview

This guide helps you migrate your existing Zermind installation to support BYOK (Bring Your Own Key) functionality.

## 1. Environment Variables

Add the required encryption secret to your `.env.local`:

```bash
# Generate a strong encryption secret
API_KEY_ENCRYPTION_SECRET="$(openssl rand -base64 32)"
```

## 2. Database Migration

Run the Prisma migration to add the API key table:

```bash
# Generate the Prisma client with new schema
npx prisma generate

# Apply the database changes
npx prisma db push

# Or create a proper migration for production
npx prisma migrate dev --name add-api-keys
```

## 3. Verify Installation

1. **Check Settings Page**: Visit `/protected/settings` and verify the API key management section appears
2. **Test Adding a Key**: Try adding an OpenRouter API key
3. **Test Chat**: Start a new conversation and verify the BYOK status indicator appears

## 4. User Migration

### For Existing Users

Existing users will continue using the application's fallback API keys until they:
1. Visit Settings → Chat Preferences & API Keys
2. Add their own API keys for desired providers
3. Activate the keys they want to use

### For New Users

New users can immediately add their API keys during onboarding or first chat session.

## 5. Deployment Considerations

### Production Deployment

1. **Environment Secret**: Ensure `API_KEY_ENCRYPTION_SECRET` is set in production
2. **Database Migration**: Run migrations before deploying new code
3. **Backup**: Create database backup before migration (encrypted keys will be included)

### Vercel Deployment

Add the environment variable in your Vercel dashboard:

```bash
# In Vercel dashboard → Settings → Environment Variables
API_KEY_ENCRYPTION_SECRET=your-generated-secret-here
```

### Docker Deployment

Add to your docker-compose.yml or Dockerfile:

```yaml
environment:
  - API_KEY_ENCRYPTION_SECRET=your-generated-secret-here
```

## 6. Testing BYOK

### Test User API Keys

1. Add an OpenRouter API key in settings
2. Start a chat with a model (e.g., `openai/gpt-4o-mini`)
3. Verify the badge shows "🔑 Your OpenRouter Key"
4. Check browser network tab - should see `X-Using-User-Key: true` header

### Test Fallback

1. Deactivate or remove user API keys
2. Start a chat
3. Verify the badge shows "🏢 App Credits (Provider)"
4. Check network tab - should see `X-Using-User-Key: false` header

## 7. Monitoring

### Error Monitoring

Common errors to watch for:
- `API_KEY_ENCRYPTION_SECRET not found` - Environment variable missing
- `Failed to decrypt API key` - Encryption key changed or corrupted
- `API key not available` - Neither user nor system keys exist

### Usage Analytics

The existing usage logging will continue to work and now tracks whether user or system keys were used.

## 8. Rollback Plan

If you need to rollback:

1. **Code Rollback**: Deploy previous version that doesn't use BYOK
2. **Database**: The new `api_keys` table won't interfere with old code
3. **Environment**: Remove `API_KEY_ENCRYPTION_SECRET` if desired

Note: User API keys will remain encrypted in database and won't be accessible without the encryption secret.

## 9. Best Practices

### Security
- Rotate `API_KEY_ENCRYPTION_SECRET` periodically
- Monitor for failed decryption attempts
- Audit API key usage regularly

### User Experience
- Guide users to add OpenRouter keys first (access to most models)
- Provide clear error messages when keys are missing
- Show savings/usage when users provide their own keys

### Performance
- API key lookup is cached during chat sessions
- Direct provider APIs used when user keys are provided (better performance)
- OpenRouter used as universal fallback (simpler configuration)

## Troubleshooting

### Common Issues

1. **"Prisma client not found"**
   ```bash
   npx prisma generate
   ```

2. **"API_KEY_ENCRYPTION_SECRET not found"**
   - Add the environment variable
   - Restart your development server

3. **"Failed to encrypt/decrypt"**
   - Verify the encryption secret is consistent
   - Check for special characters in the secret

4. **"API key not available"**
   - Verify user has active API key for the provider
   - Check that OPENROUTER_API_KEY is set (required fallback)

### Support

If you encounter issues:
1. Check the application logs for specific error messages
2. Verify all environment variables are set
3. Test with a fresh API key to rule out key format issues
4. Check the BYOK implementation documentation for detailed troubleshooting 