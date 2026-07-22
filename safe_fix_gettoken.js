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

  const search1 = `getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "c4d8Y0Pq9rK2nX7fWm3JvL8aZs1QeH5tBg9NpRx6UcIyEoDn" })`;
  const replace1 = `getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "c4d8Y0Pq9rK2nX7fWm3JvL8aZs1QeH5tBg9NpRx6UcIyEoDn", secureCookie: process.env.NODE_ENV === "production" || process.env.VERCEL === "1", cookieName: (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") ? "__Secure-authjs.session-token" : "authjs.session-token" })`;
  
  if (content.includes(search1)) {
    content = content.split(search1).join(replace1);
  }

  const search2 = `getToken({ req: mockReq, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "c4d8Y0Pq9rK2nX7fWm3JvL8aZs1QeH5tBg9NpRx6UcIyEoDn" })`;
  const replace2 = `getToken({ req: mockReq, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "c4d8Y0Pq9rK2nX7fWm3JvL8aZs1QeH5tBg9NpRx6UcIyEoDn", secureCookie: process.env.NODE_ENV === "production" || process.env.VERCEL === "1", cookieName: (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") ? "__Secure-authjs.session-token" : "authjs.session-token" })`;
  
  if (content.includes(search2)) {
    content = content.split(search2).join(replace2);
  }
  
  const search3 = `getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })`;
  const replace3 = `getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET, secureCookie: process.env.NODE_ENV === "production" || process.env.VERCEL === "1", cookieName: (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") ? "__Secure-authjs.session-token" : "authjs.session-token" })`;

  if (content.includes(search3)) {
    content = content.split(search3).join(replace3);
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    filesModified++;
    console.log(`Modified ${file}`);
  }
});

console.log(`Done! Modified ${filesModified} files.`);
