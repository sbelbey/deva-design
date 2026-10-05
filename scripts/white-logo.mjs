// Uso: node scripts/white-logo.mjs <entrada.png> <salida.png>
// Sólo PNG RGBA de 8 bits sin entrelazado (el wordmark oficial lo es).
import { readFileSync, writeFileSync } from 'node:fs';
import zlib from 'node:zlib';

const [src, dst] = process.argv.slice(2);
const buf = readFileSync(src);
const chunks = [];
for (let pos = 8; pos < buf.length; ) {
  const len = buf.readUInt32BE(pos);
  chunks.push({ type: buf.toString('ascii', pos + 4, pos + 8), data: buf.subarray(pos + 8, pos + 8 + len) });
  pos += 12 + len;
}
const ihdr = chunks.find((c) => c.type === 'IHDR').data;
const width = ihdr.readUInt32BE(0);
const height = ihdr.readUInt32BE(4);
if (ihdr[8] !== 8 || ihdr[9] !== 6 || ihdr[12] !== 0) throw new Error('Sólo PNG RGBA de 8 bits sin entrelazado');

const raw = zlib.inflateSync(Buffer.concat(chunks.filter((c) => c.type === 'IDAT').map((c) => c.data)));
const bpp = 4;
const stride = width * bpp;
const out = Buffer.alloc(height * (stride + 1));
let prev = Buffer.alloc(stride);
for (let y = 0; y < height; y += 1) {
  const filter = raw[y * (stride + 1)];
  const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
  for (let x = 0; x < stride; x += 1) {
    const a = x >= bpp ? line[x - bpp] : 0;
    const b = prev[x];
    const c = x >= bpp ? prev[x - bpp] : 0;
    let add = 0;
    if (filter === 1) add = a;
    else if (filter === 2) add = b;
    else if (filter === 3) add = Math.floor((a + b) / 2);
    else if (filter === 4) {
      const p = a + b - c;
      const pa = Math.abs(p - a);
      const pb = Math.abs(p - b);
      const pc = Math.abs(p - c);
      add = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
    }
    line[x] = (line[x] + add) & 255;
  }
  prev = line;
  const o = y * (stride + 1);
  out[o] = 0; // sin filtro
  for (let x = 0; x < width; x += 1) {
    out[o + 1 + x * 4] = 255;
    out[o + 2 + x * 4] = 255;
    out[o + 3 + x * 4] = 255;
    out[o + 4 + x * 4] = line[x * 4 + 3];
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (data) => {
  let c = 0xffffffff;
  for (const byte of data) c = crcTable[(c ^ byte) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
writeFileSync(dst, Buffer.concat([
  buf.subarray(0, 8),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(out, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]));
console.log(`${dst}: ${width}x${height} en blanco.`);
