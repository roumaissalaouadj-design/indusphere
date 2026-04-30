# Script to fix remaining token references in accounting APIs

$files = @(
    "src\app\api\accounting\production-costs\route.ts",
    "src\app\api\accounting\purchase-invoices\route.ts",
    "src\app\api\accounting\sales-invoices\route.ts",
    "src\app\api\accounting\sales-invoices\[id]\pay\route.ts",
    "src\app\api\accounting\taxes\declarations\route.ts"
)

foreach ($filePath in $files) {
    $fullPath = "C:\Users\PC so FT\Desktop\Indusphere\indusphere\$filePath"
    
    if (Test-Path -LiteralPath $fullPath) {
        Write-Host "Processing: $filePath" -ForegroundColor Yellow
        $content = Get-Content -LiteralPath $fullPath -Raw
        
        if ($content -match "token\.") {
            $content = $content -replace 'token\.sub', 'session.user.id'
            $content = $content -replace 'token\.tenantId', 'session.user.tenantId'
            $content = $content -replace 'token\.email', 'session.user.email'
            $content = $content -replace 'token\.name', 'session.user.name'
            
            Set-Content -LiteralPath $fullPath -Value $content -NoNewline
            Write-Host "  -> Fixed: $filePath" -ForegroundColor Green
        } else {
            Write-Host "  -> Skip: $filePath" -ForegroundColor Gray
        }
    } else {
        Write-Host "File not found: $filePath" -ForegroundColor Red
    }
}

Write-Host "Done!" -ForegroundColor Green