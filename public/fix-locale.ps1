# ============================================
# سكربت لتعديل جميع ملفات page.tsx في مشروع Next.js
# لإصلاح مشكلة params و useLocale
# ============================================

$projectPath = "C:\Users\PC so FT\Desktop\Indusphere\indusphere"

# الانتقال إلى مجلد المشروع
Set-Location $projectPath

# البحث عن جميع ملفات page.tsx في مجلد [locale]
$files = Get-ChildItem -Path "src\app\[locale]" -Recurse -Filter "page.tsx"

Write-Host "🔍 تم العثور على $($files.Count) ملفات للمعالجة" -ForegroundColor Cyan

foreach ($file in $files) {
    Write-Host "`n📄 معالجة: $($file.FullName)" -ForegroundColor Yellow
    
    # قراءة محتوى الملف
    $content = Get-Content $file.FullName -Raw
    
    # التحقق مما إذا كان الملف يستخدم 'use client'
    if ($content -match "'use client'") {
        
        # التحقق مما إذا كان يستخدم useLocale
        if ($content -match "useLocale") {
            
            # إضافة الاستيرادات الجديدة
            $newImports = @"
'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  params: Promise<{ locale: string }>;
};

"@
            
            # إزالة السطر 'use client' القديم واستبداله بالجديد
            $content = $content -replace "'use client';[\r\n]+", ""
            $content = $content -replace "import \{ useLocale \} from 'next-intl';[\r\n]+", ""
            $content = $content -replace "import \{ useTranslations, useLocale \} from 'next-intl';", "import { useTranslations } from 'next-intl';"
            
            # استبدال const locale = useLocale();
            $content = $content -replace "const locale = useLocale\(\);", "const { locale } = use(params);"
            
            # إضافة Props إلى دالة المكون
            if ($content -match "export default function (\w+)\(\)") {
                $componentName = $matches[1]
                $content = $content -replace "export default function $componentName\(\)", "export default function $componentName({ params }: Props)"
            }
            
            # دمج المحتوى النهائي
            $finalContent = $newImports + $content
            
            # حفظ الملف
            Set-Content -Path $file.FullName -Value $finalContent -NoNewline
            Write-Host "✅ تم تعديل: $($file.Name)" -ForegroundColor Green
            
        } else {
            Write-Host "⏭️  تخطي (لا يستخدم useLocale): $($file.Name)" -ForegroundColor Gray
        }
    } else {
        Write-Host "⏭️  تخطي (ليس client component): $($file.Name)" -ForegroundColor Gray
    }
}

Write-Host "`n🎉 اكتملت المعالجة!" -ForegroundColor Green
Write-Host "⚠️  يرجى مراجعة الملفات المعدلة للتأكد من صحتها" -ForegroundColor Yellow