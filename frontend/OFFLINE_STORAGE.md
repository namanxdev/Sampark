# Offline-First Data Storage with IndexedDB

This document explains how the Sampark application stores data locally using IndexedDB and automatically syncs with the backend when internet connectivity is restored.

## 🎯 Overview

The application uses a **local-first** approach where:
1. All data is saved to IndexedDB immediately (even when online)
2. Changes are queued for synchronization
3. Automatic sync happens when internet is available
4. The app works fully offline - no internet required for data entry

## 📦 Architecture

```
┌─────────────────────────────────────────────┐
│           User Interface                     │
│   (React Components)                         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│       Survey Service Layer                   │
│   (API abstraction with offline fallback)   │
└─────────────────────────────────────────────┘
           ↓                    ↓
    ┌──────────┐          ┌──────────┐
    │ Online?  │          │ Offline? │
    │  ↓       │          │  ↓       │
    │ Backend  │          │ IndexedDB│
    │ API      │          │          │
    └──────────┘          └──────────┘
           ↓                    ↓
    ┌──────────────────────────────┐
    │      Sync Service            │
    │   (Automatic background sync)│
    └──────────────────────────────┘
```

## 🗄️ IndexedDB Structure

### Object Stores

1. **surveys** - Stores all survey data
   - Keys: `id` (auto-increment), `survey_id`, `panchayat_id`, `status`
   - Fields: All survey fields + `synced`, `local_id`, `created_at`, `updated_at`

2. **pendingSync** - Queue of operations to sync
   - Keys: `id` (auto-increment), `action`, `timestamp`, `synced`
   - Operations: `create`, `update`, `delete`

3. **syncLogs** - History of sync operations
   - Keys: `id`, `timestamp`, `status`
   - Logs all sync attempts and results

4. **schemas** - Cached form schemas
   - Keys: `id`, `name`
   - Stores survey form definitions

## 🔧 Key Services

### 1. IndexedDB Service (`indexedDBService.js`)

Core database operations:

```javascript
// Initialize database
await indexedDBService.init();

// Save survey (creates or updates)
await indexedDBService.saveSurvey(surveyData);

// Get all surveys
const surveys = await indexedDBService.getAllSurveys({ panchayat_id: 'GP001' });

// Get specific survey
const survey = await indexedDBService.getSurveyById(surveyId);

// Update survey
await indexedDBService.updateSurvey(surveyId, updates);

// Delete survey
await indexedDBService.deleteSurvey(surveyId);

// Get statistics
const stats = await indexedDBService.getStorageStats();
```

### 2. Sync Service (`syncService.js`)

Handles automatic synchronization:

```javascript
// Initialize sync service (starts auto-sync)
await syncService.init();

// Manually trigger sync
const result = await syncService.syncNow();

// Full sync (pull from server + push changes)
await syncService.fullSync();

// Check sync status
const status = await syncService.getSyncStatus();

// Subscribe to sync events
const unsubscribe = syncService.onSyncStatusChange((status) => {
  console.log('Sync status:', status);
});
```

### 3. Survey Service (`surveyService.js`)

Enhanced with offline support:

```javascript
// These methods work both online and offline
const surveys = await surveyService.getSurveys();
const survey = await surveyService.getSurveyById(id);
const newSurvey = await surveyService.createSurvey(data);
const updated = await surveyService.updateSurvey(id, data);
await surveyService.deleteSurvey(id);
```

The service automatically:
- Tries to use the backend API when online
- Falls back to IndexedDB when offline
- Queues changes for sync

## 🔄 Sync Flow

### Create Survey Flow

```
User fills form → Save to IndexedDB → Add to sync queue
                           ↓
                  Create local_id (local_123456)
                           ↓
                  Is online? → Yes → POST to backend
                           ↓          ↓
                          No      Get survey_id from server
                           ↓          ↓
                  Wait for sync   Update local record
                                     ↓
                                 Mark as synced
```

### Update Survey Flow

```
User edits form → Update in IndexedDB → Mark as unsynced
                           ↓
                  Add update to sync queue
                           ↓
                  Is online? → Yes → PUT to backend
                           ↓          ↓
                          No       Mark as synced
                           ↓
                  Wait for sync
```

### Delete Survey Flow

```
User deletes → Mark deleted in IndexedDB → Add to sync queue
                           ↓
                  Is online? → Yes → DELETE on backend
                           ↓          ↓
                          No      Remove from local DB
                           ↓
                  Wait for sync
```

## 📱 React Integration

### SyncContext Hook

```jsx
import { useSync } from '../context/SyncContext';

function MyComponent() {
  const { 
    syncStatus,      // Current sync status
    isOnline,        // Network status
    isSyncing,       // Is sync in progress?
    hasPendingChanges, // Any unsynced data?
    triggerSync,     // Manually sync
    triggerFullSync  // Full sync (pull + push)
  } = useSync();

  return (
    <div>
      {isOnline ? '🟢 Online' : '🔴 Offline'}
      {hasPendingChanges && `${syncStatus.pendingOperations} pending`}
      <button onClick={triggerSync}>Sync Now</button>
    </div>
  );
}
```

### SyncStatusIndicator Component

Already integrated in Navbar:

```jsx
<SyncStatusIndicator /> // Compact version
<SyncStatusIndicator showDetails={true} /> // Detailed card
```

## 🚀 Usage Examples

### Creating a Survey Offline

```javascript
import { surveyService } from '../services/surveyService';

// This works offline - data is saved to IndexedDB
const survey = await surveyService.createSurvey({
  panchayat_id: 'GP001',
  survey_type: 'basic_information',
  form_data: {
    village_name: 'Rampur',
    population: 5000,
    // ... other fields
  },
  status: 'draft'
});

// Survey is immediately available
console.log(survey.local_id); // local_1234567890

// When online, sync happens automatically
// After sync, survey.survey_id will be set
```

### Checking Sync Status

```javascript
import indexedDBService from '../services/indexedDBService';

const stats = await indexedDBService.getStorageStats();
console.log(`
  Total surveys: ${stats.totalSurveys}
  Unsynced: ${stats.unsyncedSurveys}
  Pending operations: ${stats.pendingOperations}
`);
```

### Manual Sync

```javascript
import syncService from '../services/syncService';

// Sync now
const result = await syncService.syncNow();
console.log(`Synced: ${result.success}, Failed: ${result.failed}`);

// Full sync (pull latest from server + push changes)
await syncService.fullSync({ panchayat_id: 'GP001' });
```

## 🎨 UI Features

### Visual Indicators

- **🟢 Green**: Everything synced, online
- **🟡 Yellow**: Pending changes, waiting to sync
- **🔴 Red**: Offline mode
- **🔵 Blue**: Currently syncing (spinning icon)

### Auto-Save

Forms auto-save to IndexedDB every 30 seconds, preventing data loss.

### Sync Notifications

Toast notifications show:
- "✓ Synced X items"
- "⚠ Offline - changes saved locally"
- "❌ Sync failed: [reason]"

## ⚙️ Configuration

### Sync Interval

Default: 60 seconds (1 minute)

To change:
```javascript
// In syncService.js initialization
syncService.startAutoSync(120000); // 2 minutes
```

### IndexedDB Version

To update the database schema:
```javascript
// In indexedDBService.js
const DB_VERSION = 2; // Increment this

// Then add migration logic in onupgradeneeded
```

## 🔍 Debugging

### View IndexedDB in Browser

1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "IndexedDB" → "SamparkDB"
4. View each object store

### Check Sync Logs

```javascript
import indexedDBService from '../services/indexedDBService';

const logs = await indexedDBService.getSyncLogs(20);
logs.forEach(log => {
  console.log(`${log.timestamp}: ${log.status} - ${log.message}`);
});
```

### Monitor Network Events

```javascript
window.addEventListener('online', () => {
  console.log('Network: ONLINE');
});

window.addEventListener('offline', () => {
  console.log('Network: OFFLINE');
});
```

## ⚠️ Important Notes

### Data Conflicts

Currently uses "last write wins" strategy. Future enhancement:
- Detect conflicts during sync
- Show diff to user
- Allow manual conflict resolution

### Storage Limits

IndexedDB typically allows:
- **Chrome/Edge**: 60% of available disk space
- **Firefox**: 50% of available disk space
- **Safari**: 1GB (asks user for more)

Monitor storage:
```javascript
if (navigator.storage && navigator.storage.estimate) {
  const estimate = await navigator.storage.estimate();
  console.log(`Used: ${estimate.usage / 1024 / 1024} MB`);
  console.log(`Available: ${estimate.quota / 1024 / 1024} MB`);
}
```

### Browser Support

IndexedDB is supported in all modern browsers:
- ✅ Chrome 24+
- ✅ Firefox 16+
- ✅ Safari 10+
- ✅ Edge (all versions)

## 🧪 Testing Offline Mode

### Simulate Offline

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Change "Online" dropdown to "Offline"

**Firefox DevTools:**
1. Open DevTools (F12)
2. Menu → More Tools → Work Offline

### Test Scenarios

1. **Create survey offline** → Go online → Verify sync
2. **Edit synced survey offline** → Go online → Verify update
3. **Delete survey offline** → Go online → Verify deletion
4. **Multiple operations** → Sync → Verify all operations
5. **Conflict test** → Edit same survey on two devices → Sync both

## 📚 Best Practices

1. **Always save to IndexedDB first** - Never rely only on backend
2. **Show sync status** - Users should know if data is synced
3. **Handle errors gracefully** - Don't lose data on sync failure
4. **Regular sync** - Don't let sync queue grow too large
5. **Clear old logs** - Prevent IndexedDB from growing indefinitely

## 🔮 Future Enhancements

- [ ] Conflict resolution UI
- [ ] Partial sync (only changed fields)
- [ ] Background sync (Service Worker)
- [ ] Export/import offline data
- [ ] Multi-device conflict detection
- [ ] Compressed storage for large forms
- [ ] Attachments/photos support
- [ ] Offline map data caching

## 🆘 Troubleshooting

### Problem: Sync not happening

**Solution:**
```javascript
// Check if sync is running
const status = await syncService.getSyncStatus();
console.log('Syncing:', status.syncing);

// Check pending operations
console.log('Pending:', status.pendingOperations);

// Manually trigger
await syncService.syncNow();
```

### Problem: Database corruption

**Solution:**
```javascript
// Clear and reinitialize (CAUTION: loses data)
await indexedDBService.clearAllData();
await syncService.fullSync();
```

### Problem: Storage quota exceeded

**Solution:**
```javascript
// Clear old logs
const transaction = indexedDBService.getTransaction('syncLogs', 'readwrite');
const store = transaction.objectStore('syncLogs');
await store.clear();

// Or clear completed sync operations
// (Keep only pending ones)
```

---

**Need Help?** Check the console logs or contact the development team.
