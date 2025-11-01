# 🌍 Multilingual Implementation Checklist

This is a step-by-step guide to implement multilingual support in Sampark.

## 📋 Implementation Checklist

### Phase 1: Setup (1-2 hours)

- [ ] Install dependencies
  ```bash
  npm install react-i18next i18next i18next-browser-languagedetector
  ```

- [ ] Create directory structure
  ```
  src/i18n/
  ├── config.js
  └── locales/
      ├── en/
      └── hi/
  ```

- [ ] Create i18n config file
- [ ] Initialize i18n in main.jsx
- [ ] Test basic setup

### Phase 2: Translation Files (3-4 hours)

- [ ] **English (en)**
  - [ ] common.json (UI elements)
  - [ ] auth.json (Login/logout)
  - [ ] survey.json (Survey page)
  - [ ] modules.json (All 7 modules)

- [ ] **Hindi (hi)**
  - [ ] common.json
  - [ ] auth.json
  - [ ] survey.json
  - [ ] modules.json

### Phase 3: Component Updates (4-6 hours)

- [ ] **Navbar**
  - [ ] App name
  - [ ] Navigation links
  - [ ] User menu
  - [ ] Sync indicator

- [ ] **Login Page**
  - [ ] Form labels
  - [ ] Button text
  - [ ] Error messages
  - [ ] Welcome message

- [ ] **Dashboard**
  - [ ] Stats cards
  - [ ] Welcome message
  - [ ] Quick actions

- [ ] **Surveys Page**
  - [ ] Search placeholder
  - [ ] Filter options
  - [ ] Survey cards
  - [ ] Status badges
  - [ ] Action buttons

- [ ] **NewSurvey Page**
  - [ ] Village name input
  - [ ] Module list
  - [ ] Save/Cancel buttons

- [ ] **SurveyDetail Page**
  - [ ] Module navigation
  - [ ] Form fields (all modules)
  - [ ] Progress indicator
  - [ ] Action buttons

- [ ] **Settings Page**
  - [ ] Section titles
  - [ ] Options
  - [ ] Sync logs

### Phase 4: Language Switcher (1 hour)

- [ ] Create LanguageSwitcher component
- [ ] Add to Navbar
- [ ] Style dropdown menu
- [ ] Test language switching
- [ ] Verify localStorage persistence

### Phase 5: Form Fields Translation (3-4 hours)

Translate all form fields in 7 modules:

- [ ] **Basic Information**
  - [ ] Total Households
  - [ ] Total Population
  - [ ] Male/Female Population
  - [ ] SC/ST Population
  - [ ] Literacy Rate
  - [ ] BPL Families

- [ ] **Infrastructure**
  - [ ] Roads (paved/unpaved)
  - [ ] Public Buildings
  - [ ] Schools
  - [ ] Health Centers
  - [ ] Community Centers

- [ ] **Sanitation**
  - [ ] Toilets (public/private)
  - [ ] Drainage system
  - [ ] Sewerage
  - [ ] Open defecation

- [ ] **Connectivity**
  - [ ] Internet access
  - [ ] Mobile network
  - [ ] Public transport
  - [ ] Road connectivity

- [ ] **Land & Forest**
  - [ ] Agricultural land
  - [ ] Forest area
  - [ ] Waste land
  - [ ] Water bodies

- [ ] **Electricity**
  - [ ] Power supply hours
  - [ ] Electrified households
  - [ ] Street lights
  - [ ] Solar panels

- [ ] **Waste Management**
  - [ ] Collection system
  - [ ] Segregation
  - [ ] Disposal method
  - [ ] Composting

### Phase 6: Messages & Notifications (2 hours)

- [ ] **Toast Messages**
  - [ ] Success messages
  - [ ] Error messages
  - [ ] Warning messages
  - [ ] Info messages

- [ ] **Confirmation Dialogs**
  - [ ] Delete confirmation
  - [ ] Logout confirmation
  - [ ] Clear data confirmation

- [ ] **Loading States**
  - [ ] Loading...
  - [ ] Syncing...
  - [ ] Saving...

### Phase 7: Backend Integration (2-3 hours)

- [ ] Add `preferred_language` field to User model
- [ ] Create migration
- [ ] Add API endpoint to save preference
- [ ] Update frontend to sync language preference
- [ ] Load user's preferred language on login

### Phase 8: Offline Support (2 hours)

- [ ] Add translations store to IndexedDB
- [ ] Save translations offline
- [ ] Load translations when offline
- [ ] Test offline language switching

### Phase 9: Additional Languages (2-3 hours per language)

- [ ] **Punjabi (pa)**
  - [ ] All translation files
  - [ ] Test with native speaker

- [ ] **Bengali (bn)**
  - [ ] All translation files
  - [ ] Test with native speaker

- [ ] **Tamil (ta)**
  - [ ] All translation files
  - [ ] Test with native speaker

- [ ] **Telugu (te)**
  - [ ] All translation files
  - [ ] Test with native speaker

- [ ] **Marathi (mr)**
  - [ ] All translation files
  - [ ] Test with native speaker

### Phase 10: Testing (3-4 hours)

- [ ] **Functional Testing**
  - [ ] Switch between languages
  - [ ] Verify all text translates
  - [ ] Check form inputs
  - [ ] Test offline mode
  - [ ] Verify language persistence

- [ ] **UI Testing**
  - [ ] Long text handling (German-length)
  - [ ] Short text handling (Hindi)
  - [ ] Layout breaks
  - [ ] Button sizes
  - [ ] Modal dialogs

- [ ] **Browser Testing**
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Mobile browsers

- [ ] **Accessibility**
  - [ ] Screen reader support
  - [ ] Keyboard navigation
  - [ ] Language announcement

---

## 🚀 Quick Start Implementation

### Minimum Viable i18n (2-3 hours)

For fastest implementation, do this:

1. **Install packages** (5 min)
2. **Setup config** (30 min)
3. **Translate Navbar & Login** (30 min)
4. **Translate Surveys page** (1 hour)
5. **Add Language Switcher** (30 min)

This gives you:
- ✅ Basic UI in 2 languages
- ✅ Language switching
- ✅ Core functionality translated

Then expand module-by-module.

---

## 📊 Estimated Timeline

| Phase | Time | Priority |
|-------|------|----------|
| Setup | 1-2 hours | High |
| English translations | 3-4 hours | High |
| Hindi translations | 3-4 hours | High |
| Component updates | 4-6 hours | High |
| Language switcher | 1 hour | High |
| Backend integration | 2-3 hours | Medium |
| Additional languages | 2-3 hrs each | Low |
| Testing | 3-4 hours | High |

**Total for English + Hindi: ~20-25 hours**  
**Each additional language: +2-3 hours**

---

## 🎯 Translation Priority

### High Priority (Must Have)
- UI elements (buttons, labels)
- Navigation
- Form fields
- Error messages
- Success messages

### Medium Priority (Should Have)
- Help text
- Tooltips
- Settings descriptions
- Status messages

### Low Priority (Nice to Have)
- About page
- Terms & conditions
- Documentation
- Email templates

---

## 🛠️ Tools & Resources

### Translation Tools
- **Google Translate API** - Auto-translate (review required)
- **DeepL** - Better quality translations
- **Crowdin** - Collaborative translation platform
- **Lokalise** - Translation management

### Testing Tools
- **Chrome DevTools** - Network throttling
- **React Developer Tools** - Component inspection
- **i18n Ally (VS Code)** - Translation helper extension

### Resources
- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [Unicode CLDR](http://cldr.unicode.org/) - Number/date formats

---

## 💡 Pro Tips

1. **Use professional translators** for official languages
2. **Keep keys short but descriptive** - `btn_save` not `button_for_saving_survey`
3. **Group related translations** - Use namespaces wisely
4. **Add context in comments** - Help translators understand
5. **Test with native speakers** - Especially for rural contexts
6. **Handle pluralization** - Different rules per language
7. **Consider cultural context** - Colors, icons mean different things
8. **Plan for text expansion** - German can be 30% longer than English
9. **Use variables** - `"welcome": "Welcome {{name}}"` for dynamic content
10. **Keep formatting consistent** - Date/time/number formats per locale

---

## 🐛 Common Issues & Solutions

### Issue: Text overflows buttons
**Solution:** Use CSS `white-space: nowrap` or increase button width

### Issue: Missing translations show keys
**Solution:** Always provide fallback language (English)

### Issue: Language doesn't persist
**Solution:** Check localStorage implementation

### Issue: RTL languages break layout
**Solution:** Add proper RTL CSS rules

### Issue: Numbers not formatting correctly
**Solution:** Use i18n number formatting: `t('number', { val: 1000 })`

---

## 📝 Example Code Snippets

### Translating a form field
```jsx
const { t } = useTranslation('modules');

<input
  type="number"
  placeholder={t('basic_info.total_households')}
  value={data.total_households || ''}
  onChange={handleChange}
/>
```

### Translating with variables
```jsx
const { t } = useTranslation('common');

<p>{t('items_found', { count: surveys.length })}</p>
// Translation: "items_found": "Found {{count}} surveys"
```

### Translating dates
```jsx
const { t, i18n } = useTranslation();

const formattedDate = new Date(survey.created_at).toLocaleDateString(
  i18n.language,
  { year: 'numeric', month: 'long', day: 'numeric' }
);
```

---

## ✅ Ready to Ship Checklist

Before deploying multilingual feature:

- [ ] All UI text translated
- [ ] No hardcoded strings in JSX
- [ ] Language switcher works
- [ ] Translations load offline
- [ ] Language preference saves to DB
- [ ] All languages tested by native speakers
- [ ] No console errors
- [ ] Documentation updated
- [ ] Backend supports language field
- [ ] Migration scripts ready

---

**Need help?** Refer to the main README for detailed implementation examples.
