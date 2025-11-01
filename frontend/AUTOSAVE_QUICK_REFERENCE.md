# Auto-Save Quick Reference

## What Changed?

### Files Modified:
1. ✅ `src/services/indexedDBService.js` - Added draft management
2. ✅ `src/services/surveyService.js` - Added auto-save methods  
3. ✅ `src/pages/SurveyDetail.jsx` - Added auto-save UI & logic
4. ✅ `src/services/syncService.js` - Updated to skip drafts

## How It Works

### Auto-Save Flow
```
User edits form
    ↓
30 seconds pass
    ↓
autoSaveDraft() called
    ↓
Data saved to IndexedDB as draft (is_draft: true)
    ↓
NOT synced to server
    ↓
Repeat every 30s
```

### Manual Save Flow
```
User clicks "Save Survey"
    ↓
manualSave() called
    ↓
markAsFinal() - Sets is_draft: false
    ↓
updateSurvey() - Updates in IndexedDB
    ↓
If online → Sync to server immediately
If offline → Queue for sync
```

### On Page Load
```
User opens survey page
    ↓
loadDraft() called
    ↓
Check IndexedDB for draft
    ↓
If draft exists → Restore form data
If no draft → Load from survey object
```

## Key Functions

### surveyService.js
```javascript
// Auto-save (called every 30s)
autoSaveDraft(surveyId, formData)
  → Saves to IndexedDB as draft
  → Does NOT add to sync queue
  → Returns { success, timestamp }

// Manual save (called on button click)
manualSave(surveyId, formData)
  → Marks as final
  → Adds to sync queue
  → Syncs if online
  → Returns { success, synced }

// Load draft (called on page load)
loadDraft(surveyId)
  → Retrieves draft from IndexedDB
  → Returns draft data or null
```

### indexedDBService.js
```javascript
// Save draft without sync
saveDraft(surveyId, draftData)
  → Updates survey in IndexedDB
  → Sets is_draft: true
  → Sets last_auto_save timestamp
  → Does NOT add to sync queue

// Mark survey as final
markAsFinal(surveyId)
  → Sets is_draft: false
  → Sets synced: false
  → ADDS to sync queue
```

## UI Elements

### Status Badges
- **🟢 Online** - Connected
- **🟡 Offline** - No connection
- **🔵 Auto-saving...** - Currently saving
- **Draft** - In draft mode
- **Unsynced Changes** - Needs sync

### Timestamps
- **Last updated:** From survey.updated_at
- **Last saved:** From last_auto_save
- **Auto-saved:** Shown during auto-save

## Testing Commands

### Test Auto-Save (every 30s)
1. Open survey detail page
2. Edit any field
3. Wait 30 seconds
4. Check console: "✅ Draft auto-saved successfully"
5. Check browser DevTools → Application → IndexedDB → SamparkDB → surveys
6. Verify `is_draft: true` and `last_auto_save` timestamp

### Test Draft Restoration
1. Edit survey form
2. Wait 30 seconds (auto-save)
3. Close/reload page
4. Check toast: "Draft restored from auto-save"
5. Verify form data is restored

### Test Manual Save (Online)
1. Edit form
2. Click "Save Survey"
3. Check toast: "Survey saved and synced successfully!"
4. Check console: "✅ Manual save successful"
5. Verify `is_draft: false` in IndexedDB

### Test Manual Save (Offline)
1. Go offline (Network tab → Offline)
2. Edit form
3. Click "Save Survey"
4. Check toast: "Survey saved locally. Will sync when online."
5. Go online
6. Wait for auto-sync (60s) or trigger manually
7. Verify sync completes

### Test Online/Offline Transitions
1. Start online → Edit form → Auto-save works
2. Go offline → Edit more → Auto-save continues
3. Go back online → Auto-save continues
4. Click save → Syncs immediately

## Debugging

### Check Auto-Save Timer
```javascript
// In browser console
console.log('Auto-save timer active:', !!autoSaveTimerRef.current)
```

### Check Last Auto-Save
```javascript
// In browser console  
const db = await indexedDB.open('SamparkDB', 1);
// Then check surveys table for last_auto_save field
```

### Check Sync Queue
```javascript
// In browser console
indexedDBService.getPendingSyncOperations()
  .then(ops => console.log('Pending sync ops:', ops))
```

## Common Issues & Solutions

### Auto-save not running?
- Check console for timer start message: "⏱️ Auto-save timer started"
- Verify surveyId is valid
- Check for JavaScript errors

### Draft not restoring?
- Check IndexedDB has draft with `last_auto_save` field
- Verify loadDraft() is called in useEffect
- Check console for "📂 Loading draft" message

### Sync not working?
- Verify `is_draft: false` before sync
- Check online status
- Review sync queue in IndexedDB → pendingSync
- Check console for sync messages

### Form data lost?
- Auto-save should prevent this
- Check if timer was running
- Verify IndexedDB contains data
- Check browser storage quota

## Performance Notes

- Auto-save is lightweight (< 50ms typical)
- Only saves changed data
- No network calls for auto-save
- Sync is throttled (60s interval)
- Old sync operations cleaned up (24hr)

## Browser Compatibility

✅ Chrome/Edge (IndexedDB supported)
✅ Firefox (IndexedDB supported)
✅ Safari (IndexedDB supported)
⚠️ Private/Incognito mode (may have limited storage)

## Next Steps

After deployment, monitor:
1. Auto-save success rate
2. Draft restoration rate
3. Sync queue size
4. Storage usage
5. User feedback on save indicators
