# Quick Test Checklist - New UI Integration

## ✅ Fixes Applied
1. ✅ Added missing scale marker elements (hidden)
2. ✅ Made legend update code defensive (null checks)
3. ✅ Updated details card references (drawer fallback)
4. ✅ Made stats update defensive (null checks)
5. ✅ Made datalist population conditional

## 🧪 Test Now

### 1. Refresh Browser
Open: http://localhost:8000/index-working-with-new-ui.html
Or refresh the current Simple Browser tab

### 2. Visual Check
- [ ] Map loads with colored ZIP code polygons
- [ ] Top bar shows: Logo | Search | Mode Toggle | Data Selector | Icons
- [ ] Bottom-center info cards visible (6 cards)
- [ ] Bottom-left legend visible
- [ ] No glass/blur effects (solid backgrounds)

### 3. Console Check
Open browser console (Cmd+Option+J in Chrome)
- [ ] No red errors
- [ ] Look for: "✅ Map initialized successfully"
- [ ] Look for: "✅ New UI components initialized"

### 4. Interactive Tests

#### Search & Selection
- [ ] Click a ZIP code → Details drawer opens on right
- [ ] Details drawer shows ZIP info
- [ ] Close button (×) works on details drawer

#### Stats Display
Check bottom-center info cards show:
- [ ] Median Value: $XXXk (not $0)
- [ ] Population: XXXXX (not 0)
- [ ] Med. Income: $XXk (not $0)
- [ ] Crime Rate: X.X (not 0)
- [ ] Avg Rating: X.X/10 (not 0)
- [ ] Areas: XXX (not 0)

#### Filters Panel
- [ ] Click filter icon (top-right) → Panel opens on top-left
- [ ] Panel shows data category checkboxes
- [ ] Uncheck a category → Map updates
- [ ] Close button (×) works

#### Legend
- [ ] Legend shows at bottom-left
- [ ] Shows current data layer name
- [ ] Gradient bar displays
- [ ] Min/Mid/Max labels show values

#### Data Layer Selector
- [ ] Click "Data:" dropdown in top bar
- [ ] Select "Home Value" → Map colors change
- [ ] Legend updates to show "Home Value"
- [ ] Legend values update

#### Hover/Score Ring
- [ ] Hover over ZIP code
- [ ] Score ring appears near cursor
- [ ] Shows score value
- [ ] Shows ZIP code number below

## 🔍 Expected Behavior

### When Map Loads
```
Stats should show real data like:
- Median Value: $245k
- Population: 35,420
- Med. Income: $68k
- Crime Rate: 4.2
- Avg Rating: 7.3/10
- Areas: 152
```

### When Click ZIP Code
```
Details drawer opens showing:
- ZIP Code: 30318
- City: Atlanta
- Population: 15,234
- Median Value: $285,000
- Median Income: $72,400
- Crime Rate: 3.8
- [Charts and detailed breakdown]
```

## 🐛 If Issues Persist

### Issue: Stats Still Show 0
**Check**: Open console, look for:
```
✅ Loaded data from cache
✅ Map initialized successfully
```

**Fix**: Clear sessionStorage and reload:
```javascript
// In browser console:
sessionStorage.clear();
location.reload();
```

### Issue: "Cannot read property of null"
**Check**: Which element ID in error message
**Fix**: That element needs null check or needs to be added to HTML

### Issue: Panels Don't Toggle
**Check**: Console for "✅ New UI components initialized"
**Fix**: Make sure `ui-interactions.js` loaded

## 📊 Performance Check
- [ ] No lag when moving mouse over map
- [ ] Smooth zoom in/out
- [ ] Quick panel open/close
- [ ] Instant color changes when selecting data layer

## ✨ Clean UI Verification
- [ ] No transparent/blurred backgrounds
- [ ] Solid color panels
- [ ] Clear, readable text
- [ ] Color-coded polygons still transparent (data visualization)

---

## If All Tests Pass ✅
**Status**: New UI fully integrated and working!
**Next Steps**: 
1. Test on mobile
2. Deploy to production
3. Update main iframe references

## If Tests Fail ❌
**Report back with**:
1. Browser console error messages
2. Which test failed
3. Screenshot if visual issue

---
**Created**: January 5, 2025
**File**: index-working-with-new-ui.html
**Status**: Ready for testing
