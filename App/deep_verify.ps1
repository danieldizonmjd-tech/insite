# Deep verification
$explore = Get-Content 'c:\Users\Ilyess\iCloudDrive\Documents\Insite\App\explore.html'

# 1. Check notification panel is clean
$notifStart = ($explore | Select-String 'notificationCenter' | Select-Object -First 1).LineNumber
Write-Host "Notification panel starts at line: $notifStart"
Write-Host "Lines $notifStart to $($notifStart+8):"
for ($i = $notifStart - 1; $i -lt [Math]::Min($notifStart + 8, $explore.Count); $i++) {
  Write-Host ("  " + ($i+1) + ": " + $explore[$i])
}

# 2. Check all 5 nav buttons
Write-Host ''
Write-Host "All nav buttons with window.location.href:"
$explore | Select-String "window.location.href" | Where-Object { $_.Line -match 'tab-btn' } | ForEach-Object {
  Write-Host ("  Line " + $_.LineNumber + ": " + $_.Line.Trim())
}

# 3. Check JS ends before override
Write-Host ''
Write-Host "showTab override block (explore.html):"
$explore | Select-String "window.showTab = function" | ForEach-Object {
  $lineNum = $_.LineNumber
  for ($i = $lineNum - 2; $i -lt [Math]::Min($lineNum + 14, $explore.Count); $i++) {
    Write-Host ("  " + ($i+1) + ": " + $explore[$i])
  }
}

# 4. Check loadingIndicator is present (from the JS sections)
Write-Host ''
Write-Host "loadData function present: $(if (($explore | Select-String 'async function loadData').Count -gt 0) { 'YES' } else { 'NO' })"
Write-Host "updateAnalytics present: $(if (($explore | Select-String 'function updateAnalytics').Count -gt 0) { 'YES' } else { 'NO' })"
