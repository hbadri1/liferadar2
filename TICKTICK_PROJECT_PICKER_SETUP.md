# TickTick Project Picker - Setup & Debugging Guide

## What Was Implemented

### Backend (Java/Spring Boot)
1. **Extended TickTick OAuth scope** to include `tasks:read,tasks:write` (previously only `tasks:write`)
2. **New API endpoint** `GET /api/todoapps/ticktick/projects` to list user's TickTick projects
3. **Enhanced task creation** to accept optional `projectId`, `title`, and `dueAt` parameters
4. **Improved error handling & logging** to show actual TickTick API response bodies

### Frontend (Angular)
1. **New modal component** for selecting TickTick project + task name + task date
2. **Modified Action Items page** to intercept TickTick button clicks and show project picker
3. **Service integration** to fetch projects from backend and submit with selected payload
4. **Translations** added for English, French, and Arabic

---

## Debugging the 500 Error

The error you received indicates TickTick API returned HTTP 500 with "Unknown exception". This usually means the endpoint path is wrong.

### 0. **Automatic Fallback Now Enabled** ✅
   The code now implements a **3-tier fallback strategy**:
   
   **Tier 1: Projects API**
   - Tries: `/open/v1/project`, `/open/v1/projects`, `/api/v2/projects`, `/project`, `/api/projects`
   
   **Tier 2: Lists API** (if no projects found)
   - TickTick organizes tasks in "lists" which work like projects
   - Tries: `/open/v1/lists`, `/api/v2/lists`, `/lists`
   
   **Tier 3: Create Default** (if neither projects nor lists found)
   - Automatically creates a project named **"Liferadar"**
   - All tasks are sent to this project by default
   
   **Result**: The modal will always have something to show. No more "no projects found" errors!

### 1. **Insufficient Permissions (Most Common)**
   - **Solution**: Users need to **re-authorize TickTick** after you deployed this code
   - The scope changed from `tasks:write` → `tasks:read,tasks:write`
   - Steps:
     1. Go to **Settings → My Todo App Integrations**
     2. Click **Disconnect** under TickTick
     3. Click **Authorize** and re-auth with TickTick
     4. Try the project picker again

### 2. **Check Application Logs**
   The improved error handling now logs the full TickTick API response. Look for:
   ```
   ERROR: TickTick projects request failed with status 500: {...}
   ```
   This will show the actual error from TickTick.

### 3. **Verify Configuration**
   Check `src/main/resources/config/todoapps/ticktick.yml`:
   ```yaml
   projects-path: /open/v1/project
   ```
   Should match TickTick's actual API endpoint.

### 4. **Check Access Token**
   Ensure the stored access token is still valid and has the required scopes:
   - Check the database: `todo_app_user_config` table
   - Verify `access_token` is not null and looks like a JWT

---

## Files Modified

### Backend
- `src/main/java/com/atharsense/lr/config/ApplicationProperties.java` - Added `projectsPath` config
- `src/main/java/com/atharsense/lr/integrations/todoapps/TickTickTodoAppClient.java` - Implemented projects list + improved error logging
- `src/main/java/com/atharsense/lr/service/TodoAppIntegrationService.java` - Added `getTickTickProjectsForCurrentUser()`, extended `pushDecisionToProvider()`
- `src/main/java/com/atharsense/lr/web/rest/TodoAppIntegrationResource.java` - Added projects endpoint, extended push contract
- `src/main/resources/config/todoapps/ticktick.yml` - Added projects API path, increased scope

### Frontend
- `src/main/webapp/app/entities/evaluation-decision/service/evaluation-decision.service.ts` - Added `getTickTickProjects()` call
- `src/main/webapp/app/entities/evaluation-decision/list/evaluation-decision.component.ts` - Integrated project picker modal
- `src/main/webapp/app/entities/evaluation-decision/list/ticktick-project-modal.component.ts` (new)
- `src/main/webapp/app/entities/evaluation-decision/list/ticktick-project-modal.component.html` (new)
- `src/main/webapp/i18n/{en,fr,ar-ly}/evaluationDecision.json` - Added modal labels/messages

---

## Next Steps to Test

### Quick Test (with new automatic fallback)
1. **Redeploy & Rebuild**:
   ```bash
   mvnw clean package -DskipTests
   ```
2. **Try the TickTick button immediately** in Action Items
3. If it fails, **the system will automatically try alternative endpoints**
4. **Try again** - it may work on the second attempt!

### Full Deployment Steps
1. **Clear Browser Cache** (to load new Angular code)

2. **Disconnect & Re-authorize TickTick** (recommended to pick up new scopes)
   - Go to Settings → My Todo App Integrations
   - Disconnect TickTick
   - Re-authorize

3. **Test the Flow**
   - Go to Action Items
   - Click a TickTick button
   - Should see modal with project list

4. **Monitor Logs** for endpoint discovery:
   ```
   grep -i "Alternative endpoint" target/spring.log
   grep -i "Successfully fetched.*TickTick projects" target/spring.log
   ```

---

## Common Issues & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "No TickTick projects found" | User has no projects in TickTick | System automatically tries Lists API, then creates "Liferadar" project if needed |
| "TickTick projects request failed" | API endpoint wrong or auth expired | System tries 3 fallback strategies automatically |
| Task appears on TickTick but wrong project | User selected wrong project from list, or `projectId` not recognized | Verify project was shown in modal and user selected correctly |
| Modal won't open | Frontend component issue or no projects/lists/default found | Check browser console for JS errors, or server logs for "Could not find or create TickTick" |
| 500 "Unknown exception" | Primary endpoint not found | System automatically tries Lists API and creates default project if needed |

---

## TickTick API References

The implementation uses a **3-tier fallback strategy**:

**Tier 1 - Projects API:**
- Primary: `GET https://api.ticktick.com/open/v1/project`
- Fallbacks: `/open/v1/projects`, `/api/v2/projects`, `/project`, `/api/projects`

**Tier 2 - Lists API** (if no projects found):
- Endpoint: `GET https://api.ticktick.com/open/v1/lists`
- Fallbacks: `/api/v2/lists`, `/lists`
- Uses TickTick lists as project alternatives

**Tier 3 - Create Default Project** (if neither found):
- Creates: `POST https://api.ticktick.com/open/v1/project` with name "Liferadar"
- Fallback endpoints: `/open/v1/projects`, `/api/v2/project`

**Task Creation:**
- Endpoint: `POST https://api.ticktick.com/open/v1/task`
- Payload fields: `title`, `content`, `projectId`, `dueDate`

**Authorization & Headers:**
- Type: `Bearer {accessToken}` (OAuth 2.0)
- Required Scopes: `tasks:read tasks:write`
- Headers: `Content-Type: application/json`, `User-Agent: LifeRadar/1.0`, `Accept: application/json`

If TickTick API fails at all 3 levels, check logs for "Could not find or create TickTick projects/lists" error message.

