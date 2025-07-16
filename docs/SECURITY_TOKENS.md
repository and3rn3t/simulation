# Security Notes - API Tokens

## 🔒 IMPORTANT: Never commit these files to git

- `.env*` files
- API tokens or keys
- `.wrangler/` directory contents
- `.snyk` configuration with tokens

## 🔑 Required API Tokens

### Cloudflare (Wrangler)

- **Purpose**: Deploy to Cloudflare Pages
- **Setup**: `wrangler login` or set `CLOUDFLARE_API_TOKEN`
- **Docs**: See `docs/CLI_AUTHENTICATION.md`

### Snyk Security Scanner

- **Purpose**: Vulnerability scanning
- **Setup**: `snyk auth` or set `SNYK_TOKEN`
- **Docs**: See `docs/CLI_AUTHENTICATION.md`

### GitHub CLI (Optional)

- **Purpose**: Repository management
- **Setup**: `gh auth login`
- **Docs**: See `docs/CLI_AUTHENTICATION.md`

## 🚨 If tokens are accidentally committed:

1. **Immediately revoke** the exposed tokens
2. **Generate new tokens**
3. **Update CI/CD secrets**
4. **Force push** to remove from git history (if recent)

## 📖 Full Documentation

See `docs/CLI_AUTHENTICATION.md` for complete authentication setup instructions.
