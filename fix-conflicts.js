const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
// Keep upstream's changes, discard stashed changes for the conflicted chunks
schema = schema.replace(/<<<<<<< Updated upstream[\s\S]*?=======\r?\n([\s\S]*?)>>>>>>> Stashed changes/g, (match, stashed) => {
    // Wait, the upstream changes are BEFORE the ======
    return match.split('=======')[0].replace('<<<<<<< Updated upstream\n', '').replace('<<<<<<< Updated upstream\r\n', '');
});
fs.writeFileSync('prisma/schema.prisma', schema);

let layout = fs.readFileSync('src/app/layout.tsx', 'utf8');
layout = layout.replace(/<<<<<<< Updated upstream[\s\S]*?=======\r?\n([\s\S]*?)>>>>>>> Stashed changes/g, (match) => {
    return match.split('=======')[0].replace('<<<<<<< Updated upstream\n', '').replace('<<<<<<< Updated upstream\r\n', '');
});
fs.writeFileSync('src/app/layout.tsx', layout);
