# Build multi-page navigation HTML files from insite_main.html
$src = 'c:\Users\Ilyess\iCloudDrive\Documents\Insite\App\insite_main.html'
$outDir = 'c:\Users\Ilyess\iCloudDrive\Documents\Insite\App'
$lines = Get-Content $src -Encoding UTF8

# ─── Extract shared sections ─────────────────────────────────────────────────
$head1       = $lines[0..26]        # Lines 1-27  (head before <title>)
$headRest    = $lines[28..98]       # Lines 29-99 (rest of head after title line)
$bodyOpen    = $lines[99]           # Line 100    (<body>)
$inlineStyles = $lines[100..1005]   # Lines 101-1006 (inline <style>)
$notifClean  = $lines[1021..1028]   # Lines 1022-1029 (notification panel, clean part)
$otherPanels = $lines[1045..1933]   # Lines 1046-1934 (rest of overlay panels)
$toolbar     = $lines[1934..1956]   # Lines 1935-1957 (toolbar)
$mainJS      = $lines[3643..11462]  # Lines 3644-11463 (main JS script block)
$navCollapseJS = $lines[11464..11497] # Lines 11465-11498 (nav collapse script)

# ─── Shared: clean notification panel close ──────────────────────────────────
$notifClose = @(
  '    </div>',
  '  </div>'
)

# ─── Shared: showTab override (replaces single-page tab switching with page nav) ─
$showTabOverride = @(
'  <script>',
'    // Page-based navigation: override showTab() to redirect between pages',
'    window.showTab = function(tabName) {',
'      var pageMap = {',
"        'home': 'insite_main.html',",
"        'explore': 'explore.html',",
"        'compare': 'compare.html',",
"        'analytics': 'stats.html',",
"        'lifestyle': 'insite_main.html',",
"        'map': 'index.html'",
'      };',
'      var page = pageMap[tabName];',
"      if (page) window.location.href = page;",
'    };',
'  </script>'
)

# ─── Helper: build sidebar nav ───────────────────────────────────────────────
function Get-SidebarNav {
  param([string]$activePage)  # 'home','explore','compare','analytics','map'
  $homeClass    = if ($activePage -eq 'home')      { 'tab-btn active' } else { 'tab-btn' }
  $exploreClass = if ($activePage -eq 'explore')   { 'tab-btn active' } else { 'tab-btn' }
  $compareClass = if ($activePage -eq 'compare')   { 'tab-btn active' } else { 'tab-btn' }
  $statsClass   = if ($activePage -eq 'analytics') { 'tab-btn active' } else { 'tab-btn' }
  $mapClass     = if ($activePage -eq 'map')       { 'tab-btn active' } else { 'tab-btn' }

  return @(
    '  <!-- Persistent main vertical nav inserted outside tab-container so it isn''t hidden -->',
    '  <div class="main-vertical-nav" id="mainVerticalNav">',
    '    <div class="nav-panel" role="navigation" aria-label="Primary tabs">',
    '      <button id="navToggle" class="nav-toggle-btn" title="Collapse/Expand" aria-pressed="false"><i class="fas fa-chevron-left"></i></button>',
    '      <div class="tab-group main-group">',
    "        <button class=""$homeClass"" onclick=""window.location.href='insite_main.html'"" title=""Home""><i class=""fas fa-home""></i><span>Home</span></button>",
    "        <button class=""$exploreClass"" onclick=""window.location.href='explore.html'"" title=""Explore""><i class=""fas fa-compass""></i><span>Explore</span></button>",
    "        <button class=""$compareClass"" onclick=""window.location.href='compare.html'"" title=""Compare""><i class=""fas fa-balance-scale""></i><span>Compare</span></button>",
    "        <button class=""$statsClass"" onclick=""window.location.href='stats.html'"" title=""Analytics""><i class=""fas fa-chart-bar""></i><span>Stats</span></button>",
    '      </div>',
    '      <div class="map-group">',
    "        <button class=""$mapClass"" onclick=""window.location.href='index.html'"" title=""Map""><i class=""fas fa-map""></i><span>Map</span></button>",
    '      </div>',
    '    </div>',
    '  </div>'
  )
}

# ─── Helper: build complete page ─────────────────────────────────────────────
function Build-Page {
  param(
    [string]$title,
    [string]$activePage,
    [string[]]$tabContent   # The lines for the single active tab div
  )
  $titleLine   = "  <title>$title</title>"
  $sidebarNav  = Get-SidebarNav -activePage $activePage

  $tabOpen  = @(
    '  <div class="tab-container">',
    "    <div id=""$($activePage)Tab"" class=""tab-content active"">"
  )

  # Fix tab IDs: analytics page uses analyticsTab
  if ($activePage -eq 'analytics') {
    $tabOpen = @(
      '  <div class="tab-container">',
      '    <div id="analyticsTab" class="tab-content active">'
    )
  }

  $tabClose = @(
    '    </div>',
    '  </div>'
  )

  $allLines = (
    $head1 +
    @($titleLine) +
    $headRest +
    @($bodyOpen) +
    $inlineStyles +
    $sidebarNav +
    $notifClean +
    $notifClose +
    $otherPanels +
    $toolbar +
    $tabOpen +
    $tabContent +
    $tabClose +
    $mainJS +
    $showTabOverride +
    $navCollapseJS +
    @('</body>', '</html>')
  )
  return $allLines
}

# ─── Extract tab inner content (without outer wrapper div) ───────────────────

# EXPLORE TAB: lines 2255-2963 = index 2254-2962 (inner content, skip wrapper div on line 2254)
$exploreInner = $lines[2254..2962]   # Lines 2255-2963 (content inside exploreTab div)

# COMPARE TAB: lines 2968-3086 = index 2967-3085 (inner content, skip wrapper div on line 2967)
$compareInner = $lines[2967..3085]   # Lines 2968-3087 excluding outer div lines

# ANALYTICS TAB: lines 3259-3371 = index 3258-3370 (inner content, skip wrapper div on line 3258)
$analyticsInner = $lines[3258..3370] # Lines 3259-3372 excluding outer div lines

# ─── Build and write explore.html ────────────────────────────────────────────
$exploreLines = Build-Page -title 'InSite - Explore' -activePage 'explore' -tabContent $exploreInner
[System.IO.File]::WriteAllLines("$outDir\explore.html", $exploreLines, [System.Text.Encoding]::UTF8)
Write-Host "Created explore.html ($($exploreLines.Count) lines)"

# ─── Build and write compare.html ────────────────────────────────────────────
$compareLines = Build-Page -title 'InSite - Compare' -activePage 'compare' -tabContent $compareInner
[System.IO.File]::WriteAllLines("$outDir\compare.html", $compareLines, [System.Text.Encoding]::UTF8)
Write-Host "Created compare.html ($($compareLines.Count) lines)"

# ─── Build and write stats.html ──────────────────────────────────────────────
# For stats/analytics page, the activePage is 'analytics'
$statsLines = Build-Page -title 'InSite - Stats' -activePage 'analytics' -tabContent $analyticsInner
[System.IO.File]::WriteAllLines("$outDir\stats.html", $statsLines, [System.Text.Encoding]::UTF8)
Write-Host "Created stats.html ($($statsLines.Count) lines)"

Write-Host "Done!"
