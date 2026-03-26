'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const fs = require('fs');
const path = require('path');
const [, , filePath, blacklistFile] = process.argv;
const blacklist = fs
  .readFileSync(blacklistFile, 'utf-8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.length > 0);
const fileContent = fs.readFileSync(filePath, 'utf-8');
const secrets = blacklist.filter((word) => fileContent.includes(word));
if (secrets.length > 0) {
  console.error(
    `Forbidden words or secrets found in ${path.basename(
      filePath
    )}: ${secrets.join(', ')}`
  );
  process.exit(1);
}
process.exit(0);
//# sourceMappingURL=detect-secrets-plugin.js.map
