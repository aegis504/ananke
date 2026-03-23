# Ananke App - Implementation Guide for Remaining Features

## Completed ✅
- ✅ Logo updated to use image asset (icon-512.png)
- ✅ Windows .exe installer created (Ananke Setup 0.0.0.exe)
- ✅ DevTools disabled in Electron app
- ✅ Single instance lock enabled
- ✅ System tray support with minimize-to-tray

## Critical Fixes Needed

### 1. **Admin Email Restriction**
**File:** `src/App.tsx` (line ~60-70)
**Change:** Add admin email check before rendering ForJudgesPage

```typescript
// Add this check in the useEffect that validates user access
const ADMIN_EMAIL = 'samsari.owner.gmail.com';
if (view === 'judges' && user?.email !== ADMIN_EMAIL) {
  setView('dashboard'); // Redirect non-admin users
}
```

### 2. **Task Completion - Mark Only ONE Task**
**File:** `src/hooks/useTasks.ts` (completeTask function)
**Current Issue:** May be completing all tasks instead of one
**Fix:** Ensure the selector only updates the specific task:
```typescript
const completeTask = (id: string) =>
  updateTask(id, { completed: true, completed_at: new Date().toISOString() })
```

**File:** `src/components/dashboard/TasksPage.tsx` (onCompleteTask handler)
**Fix:** Pass single task ID, not array:
```typescript
// Ensure only one task is marked as complete
onCompleteTask={() => onCompleteTask(task.id)}  // ✓ Correct
```

### 3. **AI Assistant Task Organization**
**File:** `src/hooks/useAI.ts` or new file `src/api/tasks-ai.ts`
**Add endpoint for AI task parsing:**
```typescript
// Parse user input into structured task with date, deadline, tags
// Returns: { title, deadline, tags, mode }
```

### 4. **API Error Handling with Fallback Keys**
**File:** `api/ai.ts` (lines 5-10)
**Add fallback API key support:**
```typescript
const API_KEY = process.env.VITE_AI_API_KEY_PRIMARY || process.env.VITE_AI_API_KEY_FALLBACK
const MODEL = 'Qwen/Qwen2.5-7B-Instruct';

// Add error handler for 503 errors
if (response.status === 503) {
  return new Response(
    JSON.stringify({ 
      error: 'API unavailable - out of credits or service down',
      code: 'SERVICE_UNAVAILABLE'
    }),
    { status: 503, headers: cors }
  );
}
```

### 5. **Shortcuts Tutorial - Interactive Guide**
**File:** `src/components/dashboard/ShortcutsPage.tsx`
**Replace static shortcuts with interactive tutorial:**
- Add step-by-step walkthrough
- Show keyboard visualizations
- Add "Try it now" buttons for each shortcut

### 6. **Notebook Save-to-Notebook Feature**
**File:** `src/components/dashboard/NotesPage.tsx` (add context menu)
**Add option on three-dot menu:**
```jsx
{/* In the note's three-dot menu */}
<button onClick={() => showNotebookSelector()}>
  Save to Notebook
</button>

{/* Shows list of user's notebooks */}
{showingSaveModal && (
  <div>
    {notebooks.map(nb => (
      <button onClick={() => saveNoteToNotebook(note.id, nb.id)}>
        {nb.name}
      </button>
    ))}
  </div>
)}
```

### 7. **Calendar iOS Connect Feature**
**File:** `src/components/dashboard/CalendarPage.tsx`
**Add iOS integration button:**
```jsx
<button onClick={() => generateIosConnectionCode()}>
  Connect to iOS
</button>
```
**Generates QR code or link for mobile app to scan**

### 8. **File Summarize Error Handling**
**File:** `src/hooks/useAI.ts`
**Wrap file operations with try-catch:**
```typescript
try {
  const result = await fetch('/api/ai', {
    method: 'POST',
    body: JSON.stringify({ action: 'summarize', content: fileContent })
  });
  
  if (!result.ok) {
    const error = await result.json();
    throw new Error(error.error || `HTTP ${result.status}`);
  }
  return await result.json();
} catch (err) {
  notifyError(`Failed to summarize: ${err.message}`);
}
```

### 9. **Home Page Download Button**
**File:** `src/components/landing/Hero.tsx`
**Add download section:**
```jsx
<section className="mt-8">
  <a href="/downloads" className="btn btn-primary">
    🍎 Download iOS App
  </a>
  <a href="/releases" className="btn btn-primary">
    💻 Download Desktop App (Windows)
  </a>
</section>
```

### 10. **User Settings**
**File:** `src/components/dashboard/SettingsPage.tsx`

**Password Change:**
```typescript
const changePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) showError(`Failed: ${error.message}`);
};
```

**Push Notifications:**
```typescript
const enablePushNotifications = async () => {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    await registerServiceWorker();
  }
};
```

**Add to Calendar Error:**
```typescript
const addToCalendar = async () => {
  try {
    // Google Calendar API call
  } catch (err) {
    showError('Access blocked: OAuth verification incomplete. Visit Google Cloud Console.');
  }
};
```

### 11. **Shared Notes Sections**
**File:** `src/components/dashboard/SharedPage.tsx`
**Ensure three sections show correctly:**
- "Shared with me" - Notes others shared with you
- "Shared by me" - Notes you shared with others  
- "Test Completed" - Status label for each note
- Add filter/search in each section

### 12. **Timer Display on Tasks**
**File:** `src/hooks/useTimer.ts`
**Already implemented - show countdown:**
- Minutes: "45m left"
- Hours: "2h left"
- Days: "3d left"
- Overdue: "5m overdue" (red)

---

## Deployment Steps

###Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Fix Code Issues
- Decode base64 files if needed
- Apply fixes from guides above
- Test each feature locally with `npm run dev`

### Step 3: Build and Deploy

**Web Deployment (Vercel):**
```bash
npm run build
# Automatically deploys to Vercel on git push
```

**Desktop Build:**
```bash
npm run electron:build
# Creates installer: release/Ananke Setup 1.0.0.exe
```

### Step 4: Push to GitHub
```bash
git add .
git commit -m "feat: implement admin controls, task fixes, AI error handling"
git push origin main
```

### Step 5: Environment Variables
Add to `.env.local` or Vercel dashboard:
```
VITE_AI_API_KEY_PRIMARY=key1
VITE_AI_API_KEY_FALLBACK=key2
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

---

## Files to Update (Base64 Encoded)

These files need careful decoding and updating:
- `src/App.tsx` - Add admin email check
- `src/components/dashboard/TasksPage.tsx` - Fix task completion
- `src/components/dashboard/SettingsPage.tsx` - Add password change, notifications
- `src/hooks/useAI.ts` - Add error handling
- `src/components/dashboard/ShortcutsPage.tsx` - Interactive tutorial
- `api/ai.ts` - Fallback API key support

**Decode command:**
```powershell
$file = "src/App.tsx"
$raw = Get-Content $file -Raw
$decoded = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($raw))
[System.IO.File]::WriteAllText($file, $decoded)
```

---

## Testing Checklist

- [ ] Logo displays in navbar and window
- [ ] Admin email restriction works (only samsari.owner.gmail.com can access /judges)
- [ ] Single task marked complete, not all
- [ ] Timer counts down correctly
- [ ] AI summarize works with error fallback
- [ ] Shortcuts show interactive tutorial
- [ ] Notebook three-dots menu works
- [ ] "Save to Notebook" option appears
- [ ] Shared notes sections displayed correctly
- [ ] Calendar iOS connect button appears
- [ ] User can change password
- [ ] Push notification request works
- [ ] Download app buttons on home page
- [ ] Windows installer runs and loads web app

---

## Version Update
Change `"version": "0.0.0"` to `"version": "1.0.0"` in `package.json` before final build.

This will create: `Ananke Setup 1.0.0.exe`
