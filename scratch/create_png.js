const fs = require('fs');
const path = require('path');
const { zlib } = require('zlib');

// Create a 1200x630 blue PNG buffer
function createPngBuffer(width, height) {
  // We can write a simple valid uncompressed PNG file
  // Header: 8 bytes PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrLength = Buffer.alloc(4);
  ihdrLength.writeUInt32BE(13, 0);
  const ihdrType = Buffer.from('IHDR');
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 2; // Color type: 2 (Truecolor RGB)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrCrc = Buffer.alloc(4);
  ihdrCrc.writeInt32BE(crc32(Buffer.concat([ihdrType, ihdrData])), 0);
  const ihdrChunk = Buffer.concat([ihdrLength, ihdrType, ihdrData, ihdrCrc]);

  // IDAT chunk data (Royal Blue fill: RGB 37, 99, 235)
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      // Blue gradient
      rawData[pxOffset] = 15;     // R
      rawData[pxOffset + 1] = 23;  // G
      rawData[pxOffset + 2] = 42;  // B
    }
  }

  const compressedData = require('zlib').deflateSync(rawData);
  const idatLength = Buffer.alloc(4);
  idatLength.writeUInt32BE(compressedData.length, 0);
  const idatType = Buffer.from('IDAT');
  const idatCrc = Buffer.alloc(4);
  idatCrc.writeInt32BE(crc32(Buffer.concat([idatType, compressedData])), 0);
  const idatChunk = Buffer.concat([idatLength, idatType, compressedData, idatCrc]);

  // IEND chunk
  const iendLength = Buffer.alloc(4);
  iendLength.writeUInt32BE(0, 0);
  const iendType = Buffer.from('IEND');
  const iendCrc = Buffer.alloc(4);
  iendCrc.writeInt32BE(crc32(iendType), 0);
  const iendChunk = Buffer.concat([iendLength, iendType, iendCrc]);

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Simple CRC32 implementation
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      let bit = (byte ^ crc) & 1;
      crc = (crc >>> 1) ^ (bit ? 0xedb88320 : 0);
      byte >>>= 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

const outPath = path.join(__dirname, '../public/og-banner.png');
fs.writeFileSync(outPath, createPngBuffer(1200, 630));
console.log('Successfully created public/og-banner.png (1200x630)');
