# Script to automatically find and fix all files with useLocale

$projectPath = "C:\Users\PC so FT\Desktop\Indusphere\indusphere"
Set-Location $projectPath

# البحث عن جميع الملفات التي تحتوي على useLocale
$files = Get-ChildItem -Path "src" -Recurse -Filter "*.tsx" | Select-String "useLocale" -List | Select-Object -ExpandProperty Path

Write-Host "Found $($files.Count) files with useLocale" -ForegroundColor Cyan

foreach ($filePath in $files) {
    Write-Host "`nProcessing: $filePath" -ForegroundColor Yellow
    
    $content = Get-Content $filePath -Raw
    
    # إنشاء المحتوى الجديد
    $newImports = @"
'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  params: Promise<{ locale: string }>;
};

"@
    
    # إزالة الـ 'use client' القديم
    $content = $content -replace "'use client';[\r\n]+", ""
    $content = $content -replace "'use client'`r?`n`r?`n", ""
    
    # إزالة استيراد useLocale
    $content = $content -replace "import \{ useLocale \} from 'next-intl';[\r\n]+", ""
    $content = $content -replace "import \{ useTranslations, useLocale \} from 'next-intl';", "import { useTranslations } from 'next-intl';"
    $content = $content -replace "import \{ useLocale, useTranslations \} from 'next-intl';", "import { useTranslations } from 'next-intl';"
    
    # استبدال const locale = useLocale();
    $content = $content -replace "const locale = useLocale\(\);", "const { locale } = use(params);"
    
    # إضافة Props إلى دالة المكون
    if ($content -match "export default function (\w+)\(\)") {
        $componentName = $matches[1]
        $content = $content -replace "export default function $componentName\(\)", "export default function $componentName({ params }: Props)"
    }
    
    # دمج المحتوى
    $finalContent = $newImports + $content
    
    # حفظ الملف
    Set-Content -Path $filePath -Value $finalContent -NoNewline
    Write-Host "✅ Fixed: $filePath" -ForegroundColor Green
}

Write-Host "`n🎉 Done!" -ForegroundColor Green