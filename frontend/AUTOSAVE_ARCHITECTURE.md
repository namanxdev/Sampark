# Auto-Save System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          SurveyDetail.jsx (Form Component)                │   │
│  │  - Auto-save timer (30s interval)                         │   │
│  │  - Manual save button                                     │   │
│  │  - Status indicators (Online/Offline/Auto-saving)         │   │
│  └─────────┬────────────────────────────────────┬────────────┘   │
└────────────┼────────────────────────────────────┼────────────────┘
             │                                    │
             │ Every 30s                          │ On "Save" click
             │                                    │
             ▼                                    ▼
    ┌────────────────────┐            ┌───────────────────────┐
    │  autoSaveDraft()   │            │   manualSave()        │
    │  (surveyService)   │            │   (surveyService)     │
    └─────────┬──────────┘            └──────────┬────────────┘
              │                                  │
              │                                  │
              ▼                                  ▼
    ┌──────────────────────┐         ┌──────────────────────────┐
    │   saveDraft()        │         │   markAsFinal()          │
    │   (indexedDB)        │         │   (indexedDB)            │
    │   - is_draft: true   │         │   - is_draft: false      │
    │   - NO sync queue    │         │   - ADD to sync queue    │
    └──────────┬───────────┘         └───────────┬──────────────┘
               │                                 │
               ▼                                 │
    ┌──────────────────────┐                    │
    │   IndexedDB Storage  │◄───────────────────┘
    │   (Local Browser)    │
    └──────────┬───────────┘
               │
               │ If online & not draft
               │
               ▼
    ┌──────────────────────────┐
    │   Sync Service           │
    │   - Every 60s            │
    │   - On network change    │
    │   - Skips drafts         │
    └───────────┬──────────────┘
                │
                │ Only syncs is_draft: false
                │
                ▼
    ┌──────────────────────────┐
    │   Backend Server         │
    │   (FastAPI)              │
    └──────────────────────────┘
```

## Data Flow States

### State 1: NEW SURVEY
```
┌─────────────────────────────────────────────┐
│ IndexedDB                                   │
├─────────────────────────────────────────────┤
│ survey_id: "SURVEY_1234..."                 │
│ village_name: "Example Village"             │
│ basic_info: {}                              │
│ is_draft: undefined                         │
│ synced: false                               │
│ last_auto_save: undefined                   │
└─────────────────────────────────────────────┘
Status: New, not edited yet
```

### State 2: AUTO-SAVED (30s after editing)
```
┌─────────────────────────────────────────────┐
│ IndexedDB                                   │
├─────────────────────────────────────────────┤
│ survey_id: "SURVEY_1234..."                 │
│ village_name: "Example Village"             │
│ basic_info: { population: 5000 }            │
│ is_draft: true ◄── DRAFT FLAG               │
│ synced: false                               │
│ last_auto_save: "2025-11-01T10:30:00Z" ◄── │
└─────────────────────────────────────────────┘
Status: Draft, NOT synced to server
```

### State 3: MANUALLY SAVED (User clicked "Save Survey")
```
┌─────────────────────────────────────────────┐
│ IndexedDB                                   │
├─────────────────────────────────────────────┤
│ survey_id: "SURVEY_1234..."                 │
│ village_name: "Example Village"             │
│ basic_info: { population: 5000 }            │
│ is_draft: false ◄── FINALIZED               │
│ synced: false ◄── PENDING SYNC              │
│ last_auto_save: "2025-11-01T10:30:00Z"      │
└─────────────────────────────────────────────┘
           │
           │ Added to Sync Queue
           ▼
┌─────────────────────────────────────────────┐
│ Pending Sync Queue                          │
├─────────────────────────────────────────────┤
│ action: "update"                            │
│ survey_id: "SURVEY_1234..."                 │
│ synced: false                               │
└─────────────────────────────────────────────┘
Status: Finalized, queued for sync
```

### State 4: SYNCED TO SERVER
```
┌─────────────────────────────────────────────┐
│ IndexedDB                                   │
├─────────────────────────────────────────────┤
│ survey_id: "SURVEY_1234..."                 │
│ village_name: "Example Village"             │
│ basic_info: { population: 5000 }            │
│ is_draft: false                             │
│ synced: true ◄── SYNCED                     │
│ synced_at: "2025-11-01T10:35:00Z" ◄──       │
│ last_auto_save: "2025-11-01T10:30:00Z"      │
└─────────────────────────────────────────────┘
           │
           │ Synced successfully
           ▼
┌─────────────────────────────────────────────┐
│ Backend Server                              │
├─────────────────────────────────────────────┤
│ survey_id: "SURVEY_1234..."                 │
│ village_name: "Example Village"             │
│ basic_info: { population: 5000 }            │
│ (No is_draft, last_auto_save fields)        │
└─────────────────────────────────────────────┘
Status: Fully synced
```

## Timeline Example

```
T=0s     User opens survey
         └─→ Draft restored if exists

T=10s    User edits "population" field
         └─→ formData updated in React state

T=30s    Auto-save timer triggers
         └─→ autoSaveDraft() called
         └─→ Saved to IndexedDB (is_draft: true)
         └─→ NOT added to sync queue
         └─→ "Auto-saved at 10:30:30"

T=45s    User edits "households" field
         └─→ formData updated in React state

T=60s    Auto-save timer triggers again
         └─→ autoSaveDraft() called
         └─→ Updated in IndexedDB (is_draft: true)
         └─→ "Auto-saved at 10:31:00"

T=75s    User clicks "Save Survey" button
         └─→ manualSave() called
         └─→ markAsFinal() sets is_draft: false
         └─→ Added to sync queue
         └─→ If online: Immediate sync to server
         └─→ If offline: Queued for later sync
         └─→ Toast: "Survey saved successfully!"

T=90s    Auto-save timer triggers
         └─→ autoSaveDraft() called
         └─→ Now is_draft: false (stays final)
         └─→ Continues auto-saving

T=120s   Sync service runs (if online)
         └─→ Checks pending sync queue
         └─→ Finds finalized survey
         └─→ Syncs to server
         └─→ Marks as synced: true
         └─→ Toast: "Survey synced to server"
```

## Offline/Online Scenario

```
ONLINE PHASE
────────────────────────────────────────────
T=0s     User online, editing form
T=30s    Auto-save → IndexedDB (draft)
T=60s    Auto-save → IndexedDB (draft)
         
         ✂️ Network disconnects
         
OFFLINE PHASE
────────────────────────────────────────────
T=90s    Auto-save → IndexedDB (draft) ✅ Still works!
T=120s   User clicks "Save Survey"
         └─→ Saved locally (is_draft: false)
         └─→ Added to sync queue
         └─→ Toast: "Will sync when online"
T=150s   Auto-save → IndexedDB ✅ Still works!
         
         🔌 Network reconnects
         
ONLINE PHASE (RESUMED)
────────────────────────────────────────────
T=180s   Network online event detected
         └─→ Sync triggered automatically
         └─→ Pending surveys pushed to server
         └─→ Toast: "Survey synced to server"
T=210s   Auto-save → IndexedDB (now synced)
```

## Storage Locations

### IndexedDB Structure
```
SamparkDB (Database)
├── surveys (Object Store)
│   ├── Survey 1
│   │   ├── id: 1 (IndexedDB auto-increment)
│   │   ├── survey_id: "SURVEY_..."
│   │   ├── village_name: "..."
│   │   ├── basic_info: { ... }
│   │   ├── is_draft: true/false
│   │   ├── synced: true/false
│   │   ├── last_auto_save: "timestamp"
│   │   └── synced_at: "timestamp"
│   └── Survey 2...
│
├── pendingSync (Object Store)
│   ├── Sync Operation 1
│   │   ├── id: 1
│   │   ├── action: "update"
│   │   ├── survey_id: "..."
│   │   ├── data: { ... }
│   │   ├── synced: false
│   │   └── timestamp: "..."
│   └── Sync Operation 2...
│
└── syncLogs (Object Store)
    ├── Log 1
    │   ├── timestamp: "..."
    │   ├── status: "success"
    │   └── details: { ... }
    └── Log 2...
```

## Decision Flow Chart

```
┌─────────────────────────┐
│   Form Data Changed     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Wait 30 seconds       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Auto-save triggered?  │
└───────────┬─────────────┘
            │
    ┌───────┴────────┐
    │                │
   Yes              No (Manual save?)
    │                │
    ▼                ▼
┌──────────┐    ┌──────────────┐
│ Draft    │    │ Mark Final   │
│ Save     │    │ (is_draft=0) │
└────┬─────┘    └──────┬───────┘
     │                 │
     │                 ▼
     │         ┌──────────────┐
     │         │ Add to Sync  │
     │         │ Queue        │
     │         └──────┬───────┘
     │                │
     │                ▼
     │         ┌──────────────┐
     │         │ Is Online?   │
     │         └──────┬───────┘
     │                │
     │         ┌──────┴───────┐
     │         │              │
     │        Yes            No
     │         │              │
     │         ▼              ▼
     │   ┌─────────┐    ┌─────────┐
     │   │ Sync    │    │ Queue   │
     │   │ Now     │    │ for     │
     │   └─────────┘    │ Later   │
     │                  └─────────┘
     │                       
     └─────────┬─────────────┘
               │
               ▼
      ┌──────────────┐
      │ IndexedDB    │
      │ Updated      │
      └──────────────┘
```

## Key Differences: Draft vs Final

| Aspect | Draft (Auto-save) | Final (Manual save) |
|--------|------------------|---------------------|
| Trigger | 30s timer | User clicks "Save" |
| Field | `is_draft: true` | `is_draft: false` |
| Sync Queue | ❌ Not added | ✅ Added |
| Server Sync | ❌ Never | ✅ When online |
| Purpose | Prevent data loss | Persist changes |
| Frequency | Every 30s | On demand |

This architecture ensures data safety while minimizing server load!
