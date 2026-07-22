const fs = require('fs');

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

  // Replace getToken({ req, secret: ... }) with cookieName logic
  const getTokenRegex = /getToken\(\{([\s\S]*?)secret:([^,]*)(,?[\s\S]*?)\}\)/g;
  
  if (getTokenRegex.test(content) && content.includes('reqCookies')) {
    content = content.replace(getTokenRegex, (match, beforeSecret, secretStr, afterSecret) => {
      // If it already has cookieName, skip
      if (match.includes('cookieName')) return match;
      
      const secureLogic = `\n    secureCookie: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",\n    cookieName: (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") ? "__Secure-authjs.session-token" : "authjs.session-token"`;
      return `getToken({${beforeSecret}secret:${secretStr},${secureLogic}${afterSecret}})`;
    });
  }

  // Handle direct mockReq usage in API routes
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    filesModified++;
    console.log(`Modified ${file}`);
  }
});

console.log(`Done! Modified ${filesModified} files.`);
