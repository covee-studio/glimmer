#!/usr/bin/env node

import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Source icon path
const sourceIcon = resolve(__dirname, '../public/web-app-manifest-512x512.png');
const outputSVG = resolve(__dirname, '../public/favicon.svg');

async function generateSVG() {
  console.log('🎨 开始生成新的SVG图标...');
  console.log(`📁 源文件: ${sourceIcon}`);
  console.log(`📁 输出文件: ${outputSVG}`);
  
  // Check if source file exists
  if (!existsSync(sourceIcon)) {
    console.error('❌ Source icon file does not exist:', sourceIcon);
    process.exit(1);
  }
  
  try {
    // Convert PNG to base64
    const buffer = await sharp(sourceIcon)
      .resize(32, 32, {
        kernel: sharp.kernel.lanczos3,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();
    
    const base64 = buffer.toString('base64');
    
    // Build SVG content
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="rounded-corners">
      <rect width="32" height="32" rx="6" ry="6"/>
    </clipPath>
  </defs>
  <image 
    width="32" 
    height="32" 
    href="data:image/png;base64,${base64}"
    clip-path="url(#rounded-corners)"
  />
</svg>`;
    
    // Write SVG file
    writeFileSync(outputSVG, svgContent, 'utf8');
    
    console.log('✅ SVG icon generated successfully!');
    console.log(`📁 Output: ${outputSVG}`);
    console.log('🎯 Features:');
    console.log('- 32x32 size for favicon use');
    console.log('- Rounded corners');
    console.log('- Generated from your 512x512 PNG');
    console.log('- Embedded base64 data, no external dependency');
    
  } catch (error) {
    console.error('❌ Failed to generate SVG:', error);
    process.exit(1);
  }
}

// Execute
generateSVG().catch(error => {
  console.error('❌ Script execution failed:', error);
  process.exit(1);
}); 