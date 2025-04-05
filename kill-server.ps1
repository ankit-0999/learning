# Kill any process using ports 5000-5003
$ports = @(5000, 5001, 5002, 5003)

foreach ($port in $ports) {
    Write-Host "Checking for processes using port $port..."
    $processes = netstat -ano | findstr ":$port"
    $killed = $false
    
    $processes | ForEach-Object {
        $parts = $_ -split '\s+' | Where-Object { $_ -ne '' }
        if ($parts.Count -ge 5) {
            $processId = $parts[4]
            Write-Host "Killing process with PID: $processId on port $port"
            taskkill /F /PID $processId
            $killed = $true
        }
    }
    
    if (-not $killed) {
        Write-Host "No processes found using port $port"
    }
}

Write-Host "All processes using ports 5000-5003 have been terminated" 