const fs = require('fs');
const path = require('path');

const dirs = [
  'frontend/src/components/insurance/add',
  'frontend/src/app/insurance/create'
];

const replacements = {
  'text-[12px]': 'text-[13px]',
  'text-[13px]': 'text-[15px]', // Bumped a bit more for readability
  'text-[14px]': 'text-[16px]',
  'text-[15px]': 'text-[17px]',
  'text-[16px]': 'text-[18px]',
  'text-[20px]': 'text-[24px]',
  'text-[28px]': 'text-[32px]',
};

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [oldClass, newClass] of Object.entries(replacements)) {
        if (content.includes(oldClass)) {
          content = content.split(oldClass).join(newClass);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

dirs.forEach(d => {
  if (fs.existsSync(d)) {
    processDir(d);
  }
});
