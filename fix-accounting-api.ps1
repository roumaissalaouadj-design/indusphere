# Script to fix accounting API routes with [id] in path

$projectPath = "C:\Users\PC so FT\Desktop\Indusphere\indusphere"
Set-Location $projectPath

# قائمة الملفات التي تحتوي على [id] في المسار
$files = @(
    "src\app\api\accounting\customers\[id]\route.ts",
    "src\app\api\accounting\payroll\employees\[id]\route.ts",
    "src\app\api\accounting\payroll\salaries\[id]\route.ts",
    "src\app\api\accounting\payroll\salary-structures\[id]\route.ts",
    "src\app\api\accounting\product-prices\[id]\route.ts",
    "src\app\api\accounting\production-costs\[id]\route.ts",
    "src\app\api\accounting\purchase-invoices\[id]\route.ts",
    "src\app\api\accounting\purchase-invoices\[id]\pay\route.ts",
    "src\app\api\accounting\sales-invoices\[id]\route.ts",
    "src\app\api\accounting\sales-invoices\[id]\pay\route.ts",
    "src\app\api\accounting\suppliers\[id]\route.ts",
    "src\app\api\accounting\taxes\declarations\[id]\route.ts",
    "src\app\api\accounting\taxes\settings\[id]\route.ts"
)

Write-Host "Found $($files.Count) files to process" -ForegroundColor Cyan

foreach ($filePath in $files) {
    $fullPath = Join-Path $projectPath $filePath
    
    if (Test-Path -LiteralPath $fullPath) {
        Write-Host "Processing: $filePath" -ForegroundColor Yellow
        
        # قراءة محتوى الملف باستخدام -LiteralPath
        $content = Get-Content -LiteralPath $fullPath -Raw
        
        if ($content -match "getToken") {
            $content = $content -replace 'import \{ getToken \} from "next-auth/jwt";', 'import { auth } from "@/auth";'
            $content = $content -replace "import \{ getToken \} from 'next-auth/jwt';", 'import { auth } from "@/auth";'
            $content = $content -replace 'const token = await getToken\(\{ req: request, secret: process\.env\.NEXTAUTH_SECRET \}\);', 'const session = await auth();'
            $content = $content -replace 'const token = await getToken\(\{ req: request \}\);', 'const session = await auth();'
            $content = $content -replace 'if \(!token\)', 'if (!session)'
            $content = $content -replace 'token\.tenantId', 'session.user.tenantId'
            
            Set-Content -LiteralPath $fullPath -Value $content -NoNewline
            Write-Host "  -> Fixed: $filePath" -ForegroundColor Green
        } else {
            Write-Host "  -> Skip (no getToken): $filePath" -ForegroundColor Gray
        }
    } else {
        Write-Host "File not found: $filePath" -ForegroundColor Red
    }
}

Write-Host "`nDone!" -ForegroundColor Green