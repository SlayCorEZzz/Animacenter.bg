import sharp from 'sharp';
await sharp('public/brand/anima-icon.png').flatten({background:'#f7f3ea'}).resize({width:220}).png()
  .toFile('C:/Users/SLAYCO~1/AppData/Local/Temp/claude/icon-check.png');
