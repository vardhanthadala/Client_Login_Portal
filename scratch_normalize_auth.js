const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  let localFiles = fs.readdirSync(dir);
  filelist = filelist || [];
  localFiles.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist = walkSync(dir + '/' + file, filelist);
    }
    else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        filelist.push(dir + '/' + file);
      }
    }
  });
  return filelist;
};

const allFiles = walkSync('./src');
let filesModified = 0;

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace getAuthSession() helper
  const helperRegex = /import\s+\{\s*getToken\s*\}\s+from\s+["']next-auth\/jwt["']\r?\nimport\s+\{\s*cookies,\s*headers\s*\}\s+from\s+["']next\/headers["']\r?\n\r?\n\/\/\s*Helper\s+to\s+get\s+auth\s+token\r?\nasync\s+function\s+getAuthSession\(\)\s*\{[\s\S]*?return\s+getToken\([\s\S]*?\}\r?\n/g;
  
  if (helperRegex.test(content)) {
    content = content.replace(helperRegex, `import { auth } from "@/auth"\n\n// Helper to get auth token\nasync function getAuthSession() {\n  const session = await auth()\n  return session?.user\n}\n`);
  }

  // Also catch variations where getToken is imported but cookies/headers might be above or below
  const helperRegex2 = /\/\/\s*Helper\s+to\s+get\s+auth\s+token\r?\nasync\s+function\s+getAuthSession\(\)\s*\{[\s\S]*?const\s+reqCookies[\s\S]*?return\s+getToken\([\s\S]*?\}\r?\n/g;
  if (helperRegex2.test(content)) {
    content = content.replace(helperRegex2, `// Helper to get auth token\nasync function getAuthSession() {\n  const session = await auth()\n  return session?.user\n}\n`);
    if (!content.includes('import { auth } from "@/auth"')) {
      content = 'import { auth } from "@/auth"\n' + content;
    }
  }
  
  // Replace direct mockReq usages in API routes
  const mockReqRegex = /const\s+reqCookies\s*=\s*await\s+cookies\(\)\r?\n\s*const\s+reqHeaders\s*=\s*await\s+headers\(\)\r?\n\s*(?:\/\/.*?\r?\n)?\s*const\s+(?:mockReq|req)\s*=\s*\{[\s\S]*?\}\s*as\s*any\r?\n\s*(?:let|const)\s+token\s*=\s*await\s+getToken\(\{[\s\S]*?\}\)/g;
  if (mockReqRegex.test(content)) {
    content = content.replace(mockReqRegex, `const session = await auth()\n    let token = session?.user`);
    // ensure `token` is `let` or `const` based on original
    content = content.replace(/let\s+token\s*=\s*session\?\.user/g, 'let token = session?.user');
    if (!content.includes('import { auth } from "@/auth"')) {
      content = 'import { auth } from "@/auth"\n' + content;
    }
  }

  // Same for `req` object directly passed to getToken in page.tsx or routes
  const getTokenDirectRegex = /const\s+token\s*=\s*await\s+getToken\(\{[\s\S]*?\}\)/g;
  if (getTokenDirectRegex.test(content) && content.includes('next-auth/jwt') && !content.includes('mockReq') && !content.includes('reqCookies')) {
    content = content.replace(getTokenDirectRegex, `const session = await auth()\n  const token = session?.user`);
    if (!content.includes('import { auth } from "@/auth"')) {
      content = 'import { auth } from "@/auth"\n' + content;
    }
  }

  // Remove unused next-auth/jwt import if we removed getToken usage
  if (!content.includes('getToken') && content.includes('next-auth/jwt')) {
    content = content.replace(/import\s+\{\s*getToken\s*\}\s+from\s+["']next-auth\/jwt["']\r?\n/, '');
  }
  
  // In API routes: if token assignment is re-assigned, it must be let instead of const. 
  // e.g. let token = session?.user 

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    filesModified++;
    console.log(`Modified ${file}`);
  }
});

console.log(`Done! Modified ${filesModified} files.`);
