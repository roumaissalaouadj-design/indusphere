/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

// 1. مصدر الملفات (المجلد الذي توجد به الترجمات)
const sourceDir = path.join(__dirname, '../messages');
// 2. الوجهة (المجلد المُنشأ حيث سيتم النشر)
const destDir = path.join(__dirname, '../.next/standalone/messages');

// إذا كان المجلد الوجهة غير موجود، قم بإنشائه
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// نسخ جميع الملفات من المصدر إلى الوجهة
const files = fs.readdirSync(sourceDir);
files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);
    // تأكد من أنه ملف وليس مجلد
    if (fs.lstatSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ تم نسخ: ${file}`);
    }
});

console.log('🎉 تم نسخ جميع ملفات الترجمة بنجاح!');