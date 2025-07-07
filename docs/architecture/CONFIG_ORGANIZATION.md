# Configuration Files Organization

## Why .env is in the Root Directory

### Standard Practice
- `.env` is expected in the root by most Node.js tools (dotenv, etc.)
- It's a convention that most developers follow
- Moving it requires extra configuration in multiple places

### Current Configuration Files

**Root Directory:**
- `.env` - Environment variables (DATABASE_URL, JWT_SECRET, etc.)
- `package.json` - Node.js project configuration
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Frontend build configuration
- `drizzle.config.ts` - Database migration configuration
- `tailwind.config.ts` - CSS framework configuration
- `postcss.config.js` - CSS processing configuration

### Best Practices
1. **Environment Variables** (.env) - Keep in root for compatibility
2. **Build Configs** - Keep in root where build tools expect them
3. **Application Config** - Can be organized in folders:
   - `server/config/` - Server-specific settings
   - `frontend/config/` - Frontend constants

### Why Not Move Everything to /config?
- Build tools (Vite, TypeScript, etc.) look for configs in root by default
- Moving them requires updating multiple tool configurations
- Can cause issues with third-party integrations
- Industry standard is to keep these in root

### What Could Be in /config?
If you want a config folder, use it for:
- API endpoints configuration
- Feature flags
- Application constants
- Business logic settings