# UHAS-HPI Survey App - Offline-First Edition

## Version 2.0 - Complete Refactor ✅

### Major Changes

#### 1. **Removed Firebase Dependency**
   - Eliminated all Firebase imports and initialization code
   - Removed cloud storage and authentication requirements
   - App now fully offline-capable with completely local storage

#### 2. **IndexedDB for Offline Storage**
   - All survey data stored locally in IndexedDB
   - Supports multiple questionnaires (Patients, Clinicians, Herbalists, Caregivers, Policymakers, Researchers)
   - Persistent storage even with app closed/browser cleared (better data preservation)

#### 3. **Service Worker (sw.js)**
   - Installed at root level `/sw.js`
   - Implements offline-first strategy:
     - Network-first for fresh data
     - Falls back to cache when offline
     - Automatically caches app assets on install
   - Enables PWA capabilities:
     - Install as app on mobile/desktop
     - Works completely offline
     - Updated manifest.json with app metadata

#### 4. **Dashboard with Participant Groups**
   - New Dashboard tab (default landing page)
   - Visual cards for each participant type:
     - **Patients** (Red) - 👥
     - **Clinicians** (Blue) - 💊
     - **Herbalists** (Green) - 🌿
     - **Caregivers** (Orange) - 👐
     - **Policymakers** (Purple) - 💼
     - **Researchers** (Teal) - 🔬
   
   - Dashboard displays:
     - Total responses count
     - Participant group counts
     - Study sites count
     - Recent responses list
     - Tap cards to view group details

#### 5. **Import/Export Functionality**
   - **JSON Export**: Full data backup with metadata
   - **JSON Import**: Restore from backup
   
   - Accessible via:
     - Bottom bar "Export" buttons
     - Dashboard "Share" functionality

#### 6. **Offline Status Indicator**
   - Real-time online/offline status in header
   - Automatic status updates on connection change
   - No cloud sync warnings (all data stays local)

### File Structure

```
survey/
├── index.html                    # Main app (updated - no Firebase)
├── app.js                        # App logic (refactored)
├── manifest.json                 # PWA manifest (updated with sw)
├── sw.js                         # Service Worker (new)
├── questions.js                  # Questionnaires (unchanged)
├── assets/
│   ├── css/
│   │   └── main.css             # Styles (added dashboard styles)
│   └── js/
│       ├── config.js            # Config (no Firebase)
│       ├── db.js                # IndexedDB wrapper (existing)
│       ├── participant.js       # ID generation (existing)
│       ├── offline.js           # Status manager (new)
│       ├── exchange.js          # Import/Export (new)
│       ├── dashboard.js         # Dashboard module (new)
│       ├── auth.js              # (can be removed)
│       ├── sync.js              # (deprecated - replaced by offline.js)
│       └── ...other files
└── vendor/                       # Third-party libs (Firebase removed)
```

### New Modules

#### **offline.js**
- Lightweight offline status manager
- No cloud dependencies
- Real-time connection detection

#### **exchange.js**
- JSON import and export
- Structured data serialization
- Error handling for invalid files

#### **dashboard.js**
- Participant group visualization
- Statistics calculation
- Group detail views

#### **sw.js**
- Service Worker for offline support
- Asset caching strategy
- Background sync ready

### Usage

1. **Fill Survey Form**
   - Select questionnaire tab
   - Complete form fields
   - Click "Save" to store locally

2. **View Dashboard**
   - Click "Dashboard" tab
   - See stats and participant cards
   - Tap any group card to view responses

3. **Export Data**
   - Click "Export" button
   - Choose JSON or CSV
   - File downloads to device

4. **Import Data**
   - Click "Import" button
   - Select JSON or CSV file
   - Data appended to local database

5. **Work Offline**
   - App works completely offline
   - Fill and save surveys without internet
   - Export/import when needed

### Storage Details

- **IndexedDB Database Name**: `uhas-hpi-db`
- **Stores**: `participants`, `surveys`, `toolkit`, `exports`
- **No cloud sync**: All data stays on device
- **Persistent**: Data survives app restarts

### PWA Installation

Install as native app:
- **iOS**: Share → Add to Home Screen
- **Android**: Menu → Install App
- **Desktop**: Right-click → Install

### Configuration

Edit `CONFIG` in `config.js` to customize:
- App name and version
- Participant prefixes
- Participant group colors and icons
- Study sites list

### Browser Support

- Chrome/Edge 60+
- Firefox 55+
- Safari 11.1+ (iOS 11.3+)
- Any browser with:
  - IndexedDB support
  - Service Worker support
  - ES6+ JavaScript

### Data Security

- All data stored locally on device only
- No transmission to servers
- No cookies or tracking
- Respects browser privacy settings

### Troubleshooting

**"Database module not loaded"**
- Ensure `config.js` and `db.js` load before `app.js`
- Check browser console for errors

**Import not working**
- Ensure file is valid JSON or CSV format
- Check file headers match expected format
- Verify CSV has: participantId, type, studySite

**Service Worker not registering**
- App must be served over HTTPS (or localhost)
- Check browser console for errors
- Clear site data and reload

### Future Enhancements

- [ ] Data synchronization to server (optional)
- [ ] Advanced analytics dashboard
- [ ] Data validation rules
- [ ] Backup to cloud storage
- [ ] Multi-language support
- [ ] Voice input for accessibility
