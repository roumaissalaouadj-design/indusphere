# Script to fix all accounting API routes to use auth() instead of getToken()

$projectPath = "C:\Users\PC so FT\Desktop\Indusphere\indusphere"
Set-Location $projectPath

# البحث عن جميع ملفات route.ts في مجلد accounting
$files = Get-ChildItem -Path "src\app\api\accounting" -Recurse -Filter "route.ts"

Write-Host "Found $($files.Count) files to process" -ForegroundColor Cyan

foreach ($file in $files) {
    Write-Host "`nProcessing: $($file.FullName)" -ForegroundColor Yellow
    
    # قراءة محتوى الملف
    $content = Get-Content $file.FullName -Raw
    
    # التحقق مما إذا كان الملف يستخدم getToken
    if ($content -match "getToken") {
        
        # إزالة استيراد getToken
        $content = $content -replace "import \{ getToken \} from 'next-auth/jwt';", "import { auth } from '@/auth';"
        $content = $content -replace "import \{ getToken \} from 'next-auth/jwt'`r?`n", "import { auth } from '@/auth';`r`n"
        
        # استبدال const token = await getToken(...)
        $content = $content -replace "const token = await getToken\(\{ req: request, secret: process\.env\.NEXTAUTH_SECRET \}\);", "const session = await auth();"
        $content = $content -replace "const token = await getToken\(\{ req: request \}\);", "const session = await auth();"
        
        # استبدال if (!token) بـ if (!session)
        $content = $content -replace "if \(!token\)", "if (!session)"
        
        # استبدال token.tenantId بـ session.user.tenantId
        $content = $content -replace "token\.tenantId", "session.user.tenantId"
        
        # حفظ الملف المعدل
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  -> Fixed: $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "  -> Skip (no getToken): $($file.Name)" -ForegroundColor Gray
    }
}

Write-Host "`nDone!" -ForegroundColor Green