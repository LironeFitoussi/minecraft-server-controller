#!/usr/bin/env node
/**
 * Post-build script to fix incorrect zod import
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, 'dist');

// Fix all incorrect zod imports
const filesToFix = [
  join(distDir, 'utils', 'errorHandler.js')
];

filesToFix.forEach(filePath => {
  try {
    let content = readFileSync(filePath, 'utf8');
    const original = content;
    // Fix '../zod' to 'zod' (node_modules)
    content = content.replace(/from ['"]\.\.\/zod['"]/g, "from 'zod'");
    if (content !== original) {
      writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed zod import in ${filePath.replace(distDir, 'dist')}`);
    }
  } catch (err) {
    // File might not exist, skip
  }
});

