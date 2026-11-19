# Verification script
$explore = Get-Content 'c:\Users\Ilyess\iCloudDrive\Documents\Insite\App\explore.html'
Write-Host '=== explore.html ==='
Write-Host ('Total lines: ' + $explore.Count)
Write-Host ('Line 1: ' + $explore[0])
Write-Host ('Title line: ' + ($explore | Select-String '<title>' | Select-Object -First 1).Line.Trim())
Write-Host ('Active nav: ' + ($explore | Select-String 'tab-btn active' | Select-Object -First 1).Line.Trim())
Write-Host ('Tab div: ' + ($explore | Select-String 'id="exploreTab"' | Select-Object -First 1).Line.Trim())
Write-Host ('showTab override: ' + ($explore | Select-String 'Page-based navigation' | Select-Object -First 1).Line.Trim())
Write-Host ''

$compare = Get-Content 'c:\Users\Ilyess\iCloudDrive\Documents\Insite\App\compare.html'
Write-Host '=== compare.html ==='
Write-Host ('Total lines: ' + $compare.Count)
Write-Host ('Title line: ' + ($compare | Select-String '<title>' | Select-Object -First 1).Line.Trim())
Write-Host ('Active nav: ' + ($compare | Select-String 'tab-btn active' | Select-Object -First 1).Line.Trim())
Write-Host ('Tab div: ' + ($compare | Select-String 'id="compareTab"' | Select-Object -First 1).Line.Trim())
Write-Host ('window.location compareZip: ' + ($compare | Select-String "window.location.href='compare.html'" | Select-Object -First 1).Line.Trim())
Write-Host ''

$stats = Get-Content 'c:\Users\Ilyess\iCloudDrive\Documents\Insite\App\stats.html'
Write-Host '=== stats.html ==='
Write-Host ('Total lines: ' + $stats.Count)
Write-Host ('Title line: ' + ($stats | Select-String '<title>' | Select-Object -First 1).Line.Trim())
Write-Host ('Active nav: ' + ($stats | Select-String 'tab-btn active' | Select-Object -First 1).Line.Trim())
Write-Host ('Tab div: ' + ($stats | Select-String 'id="analyticsTab"' | Select-Object -First 1).Line.Trim())
Write-Host ('Body close: ' + $stats[$stats.Count - 2])
Write-Host ('HTML close: ' + $stats[$stats.Count - 1])
