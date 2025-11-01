# Auto-Save Implementation Guide

## Overview
This document explains the auto-save functionality implemented for the survey forms in the Sampark application.

## Architecture

```
User fills form
   ↓
Every 30s → Auto-save → IndexedDB (drafts table)
   ↓
If Online → Sync to Server → Mark synced
   ↓
On reload → Load from IndexedDB → Restore form
   ↓
On Offline → Keep saving locally (no error)
   ↓
On Online → Push unsynced data again
```

## Key Features

### 1. **Auto-Save (Every 30 seconds)**
- Form data is automatically saved to IndexedDB every 30 seconds
- Runs whether online or offline
- Does NOT trigger server sync (saves bandwidth)
- Marked as `is_draft: true` in IndexedDB

### 2. **Draft Storage**
- All auto-saves are stored as drafts in IndexedDB
- Includes `last_auto_save` timestamp
- Preserves all form state including:
  - Village name
  - All module data (basic_info, infrastructure, etc.)
  - Completion percentage

### 3. **Form Restoration**
- On page load, checks for existing draft
- If draft exists with `last_auto_save` timestamp, restores it
- Shows toast notification: "Draft restored from auto-save"
- Falls back to server data if no draft found

### 4. **Manual Save**
- User clicks "Save Survey" button
- Marks survey as `is_draft: false`
- Adds to sync queue
- Immediately syncs to server if online
- Shows appropriate success message

### 5. **Online/Offline Handling**
- **Offline Mode:**
  - Auto-saves continue working
  - Drafts stored locally
  - No sync attempts
  - Shows offline badge and warning
  
- **Online Mode:**
  - Auto-saves continue working
  - Manual saves trigger immediate sync
  - Background sync every 60 seconds for unsynced surveys
  - Shows online badge

### 6. **Sync Behavior**
- Drafts are NEVER synced to server automatically
- Only finalized surveys (is_draft: false) are synced
- When coming back online, only non-draft surveys sync
- Prevents incomplete data from reaching server

## Implementation Files

### 1. **indexedDBService.js**
New methods added:
- `saveDraft(surveyId, draftData)` - Save auto-save draft
- `getDraft(surveyId)` - Retrieve draft
- `markAsFinal(surveyId)` - Mark as final (ready for sync)

### 2. **surveyService.js**
New methods added:
- `autoSaveDraft(surveyId, formData)` - Auto-save every 30s
- `manualSave(surveyId, formData)` - Manual save with sync
- `loadDraft(surveyId)` - Load draft on page load
- `calculateCompletion(formData)` - Calculate progress

### 3. **SurveyDetail.jsx**
Enhanced with:
- Auto-save timer (30s interval)
- Draft restoration on load
- Auto-save status indicators
- Last save timestamp display
- Online/offline status badges
- Enhanced progress tracking

### 4. **syncService.js**
Updated to:
- Skip drafts during sync
- Only sync finalized surveys
- Filter `is_draft` and `last_auto_save` fields

## User Interface Changes

### Header Section
```
[Village Name] [Online/Offline Badge] [Auto-saving Badge]
Panchayat • Created Date • Last saved: HH:MM:SS
```

### Progress Card
```
Overall Progress [Badges: Offline/Unsynced/Draft] XX%
[Progress Bar]
Last updated: DateTime | Auto-saved: HH:MM:SS
[Offline Warning if applicable]
```

### Badges
- **Online** (green) - Connected to internet
- **Offline** (yellow) - Working offline
- **Auto-saving** (blue) - Currently saving
- **Unsynced Changes** (info) - Has local changes
- **Draft** (accent) - In draft mode

## Flow Examples

### Scenario 1: Online Editing
1. User opens survey → Draft restored if exists
2. User edits form
3. After 30s → Auto-save to IndexedDB as draft
4. Every 30s → Continues auto-saving
5. User clicks "Save Survey" → Marked as final → Synced to server

### Scenario 2: Offline Editing
1. User opens survey offline → Draft restored
2. User edits form
3. After 30s → Auto-save to IndexedDB as draft
4. Every 30s → Continues auto-saving locally
5. User clicks "Save Survey" → Marked as final → Queued for sync
6. User comes online → Auto-sync pushes changes

### Scenario 3: Page Reload
1. User editing form
2. Auto-save runs at 30s, 60s, 90s
3. User accidentally closes tab
4. User reopens survey → Draft restored with all changes
5. Form state exactly as it was before close

### Scenario 4: Online/Offline Transition
1. User editing online
2. Network drops → Auto-save continues locally
3. User clicks save → Queued for sync
4. Network returns → Auto-sync pushes changes
5. Survey marked as synced

## Technical Details

### Auto-Save Timer
```javascript
useEffect(() => {
  const timer = setInterval(async () => {
    await surveyService.autoSaveDraft(surveyId, formData);
  }, 30000); // 30 seconds
  
  return () => clearInterval(timer);
}, [surveyId]);
```

### Draft vs Final
- **Draft** (`is_draft: true`)
  - Auto-saved every 30s
  - NOT synced to server
  - Local only
  
- **Final** (`is_draft: false`)
  - User clicked "Save Survey"
  - Added to sync queue
  - Will sync when online

### Data Structure
```javascript
{
  survey_id: "...",
  village_name: "...",
  basic_info: { ... },
  // ... other modules ...
  is_draft: true,           // Draft flag
  last_auto_save: "2025-11-01T10:30:00Z",  // Auto-save timestamp
  synced: false,            // Sync status
  updated_at: "2025-11-01T10:30:00Z"
}
```

## Testing Checklist

- [ ] Auto-save runs every 30 seconds
- [ ] Draft restored on page reload
- [ ] Manual save triggers sync when online
- [ ] Manual save queues when offline
- [ ] Auto-save continues during offline mode
- [ ] No server sync for drafts
- [ ] Online/offline transitions handled smoothly
- [ ] Last save time displays correctly
- [ ] Status badges show correctly
- [ ] Toast notifications work
- [ ] Form state persists across reloads

## Benefits

1. **No Data Loss** - Auto-save every 30s prevents accidental data loss
2. **Works Offline** - Full functionality without internet
3. **Bandwidth Efficient** - Only final saves sync to server
4. **User-Friendly** - Clear status indicators and notifications
5. **Seamless Experience** - Automatic draft restoration
6. **Conflict Prevention** - Local changes preserved until manually saved

## Future Enhancements

1. Configurable auto-save interval
2. Manual "Save Draft" button
3. Draft history/versioning
4. Conflict resolution UI
5. Auto-save on form field blur
6. Export draft as JSON
