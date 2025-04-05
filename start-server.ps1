# Kill any process using port 5000
Write-Host "Checking for processes using port 5000..."
$processes = netstat -ano | findstr :5000
$processes | ForEach-Object {
    $parts = $_ -split '\s+' | Where-Object { $_ -ne '' }
    if ($parts.Count -ge 5) {
        $pid = $parts[4]
        Write-Host "Killing process with PID: $pid"
        taskkill /F /PID $pid
    }
}

# Start the server
cd server
npm run dev 