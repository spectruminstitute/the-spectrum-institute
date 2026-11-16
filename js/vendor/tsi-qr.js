/* TSI local QR code generator - no internet / CDN needed (Netaford Company).
   Provides window.QRCode.toDataURL(text, {width, margin, color:{dark, light}}) -> Promise<PNG data URL>,
   the same call the certificate code already uses. Byte mode, versions 1-10, error correction M. */
(function () {
"use strict";

// Small QR code encoder (byte mode, versions 1-10, error correction L or M). Output: SVG text.
// No outside packages, so the app stays self-contained.

// [ecPerBlock, g1Blocks, g1Data, g2Blocks, g2Data]
const EC = {
  L: [null, [7, 1, 19], [10, 1, 34], [15, 1, 55], [20, 1, 80], [26, 1, 108], [18, 2, 68], [20, 2, 78], [24, 2, 97], [30, 2, 116], [18, 2, 68, 2, 69]],
  M: [null, [10, 1, 16], [16, 1, 28], [26, 1, 44], [18, 2, 32], [24, 2, 43], [16, 4, 27], [18, 4, 31], [22, 2, 38, 2, 39], [22, 3, 36, 2, 37], [26, 4, 43, 1, 44]],
};
const ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];
const REMAINDER = [0, 0, 7, 7, 7, 7, 7, 0, 0, 0, 0];
const EC_BITS = { L: 1, M: 0 };

// ---- Galois field 256 ----
const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
(() => { let x = 1; for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; } for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; })();
const mul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);

function generator(n) {
  let g = [1];
  for (let i = 0; i < n; i++) {
    const next = new Array(g.length + 1).fill(0);
    for (let j = 0; j < g.length; j++) { next[j] ^= g[j]; next[j + 1] ^= mul(g[j], EXP[i]); }
    g = next;
  }
  return g;
}
function ecBytes(data, n) {
  const g = generator(n);
  const r = data.concat(new Array(n).fill(0));
  for (let i = 0; i < data.length; i++) {
    const c = r[i];
    if (c) for (let j = 0; j < g.length; j++) r[i + j] ^= mul(g[j], c);
  }
  return r.slice(data.length);
}

function blocksOf(v, level) {
  const [ec, b1, d1, b2 = 0, d2 = 0] = EC[level][v];
  return { ec, sizes: [...Array(b1).fill(d1), ...Array(b2).fill(d2)] };
}
const capacity = (v, level) => blocksOf(v, level).sizes.reduce((a, b) => a + b, 0);

function encodeData(bytes, v, level) {
  const total = capacity(v, level);
  const bits = [];
  const put = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  put(4, 4);
  put(bytes.length, v < 10 ? 8 : 16);
  for (const b of bytes) put(b, 8);
  for (let i = 0; i < 4 && bits.length < total * 8; i++) bits.push(0);
  while (bits.length % 8) bits.push(0);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(""), 2));
  for (let pad = 0xec; data.length < total; pad ^= 0xec ^ 0x11) data.push(pad);
  // split into blocks, add error correction, interleave
  const { ec, sizes } = blocksOf(v, level);
  const blocks = []; let pos = 0;
  for (const s of sizes) { const d = data.slice(pos, pos + s); pos += s; blocks.push({ d, e: ecBytes(d, ec) }); }
  const out = [];
  const maxD = Math.max(...sizes);
  for (let i = 0; i < maxD; i++) for (const b of blocks) if (i < b.d.length) out.push(b.d[i]);
  for (let i = 0; i < ec; i++) for (const b of blocks) out.push(b.e[i]);
  return out;
}

function bch(value, poly, polyBits) {
  let v = value << (polyBits - 1);
  for (let i = 31; i >= polyBits - 1; i--) if ((v >>> i) & 1) v ^= poly << (i - (polyBits - 1));
  return v;
}
const formatBits = (level, mask) => { const d = (EC_BITS[level] << 3) | mask; return ((d << 10) | bch(d, 0x537, 11)) ^ 0x5412; };
const versionBits = (v) => (v << 12) | bch(v, 0x1f25, 13);

const MASKS = [
  (r, c) => (r + c) % 2 === 0, (r) => r % 2 === 0, (r, c) => c % 3 === 0, (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0, (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0, (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function buildMatrix(v, level, codewords, mask) {
  const n = 17 + 4 * v;
  const m = Array.from({ length: n }, () => new Array(n).fill(null)); // null = free
  const set = (r, c, val) => { m[r][c] = val ? 1 : 0; };
  const finder = (r0, c0) => {
    for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) {
      const rr = r0 + r, cc = c0 + c;
      if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue;
      const on = r >= 0 && r <= 6 && c >= 0 && c <= 6 && (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
      set(rr, cc, on);
    }
  };
  finder(0, 0); finder(0, n - 7); finder(n - 7, 0);
  for (let i = 8; i < n - 8; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  const al = ALIGN[v];
  const L = al.length - 1;
  al.forEach((r, i) => al.forEach((c, j) => {
    if ((i === 0 && j === 0) || (i === 0 && j === L) || (i === L && j === 0)) return; // finder corners
    for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
  }));
  set(n - 8, 8, 1); // dark module
  // reserve format areas
  for (let i = 0; i < 9; i++) { if (m[8][i] === null) m[8][i] = 0; if (m[i][8] === null) m[i][8] = 0; }
  for (let i = 0; i < 8; i++) { if (m[8][n - 1 - i] === null) m[8][n - 1 - i] = 0; if (m[n - 1 - i][8] === null) m[n - 1 - i][8] = 0; }
  if (v >= 7) {
    const vb = versionBits(v);
    for (let i = 0; i < 18; i++) {
      const bit = (vb >>> i) & 1, a = Math.floor(i / 3), b = n - 11 + (i % 3);
      set(a, b, bit); set(b, a, bit);
    }
  }
  const reserved = m.map((row) => row.map((x) => x !== null));
  // data
  const bits = [];
  for (const cw of codewords) for (let i = 7; i >= 0; i--) bits.push((cw >>> i) & 1);
  for (let i = 0; i < REMAINDER[v]; i++) bits.push(0);
  let k = 0, up = true;
  for (let col = n - 1; col > 0; col -= 2) {
    if (col === 6) col = 5;
    for (let i = 0; i < n; i++) {
      const r = up ? n - 1 - i : i;
      for (const c of [col, col - 1]) {
        if (reserved[r][c]) continue;
        let bit = k < bits.length ? bits[k++] : 0;
        if (MASKS[mask](r, c)) bit ^= 1;
        m[r][c] = bit;
      }
    }
    up = !up;
  }
  // format info (two copies)
  const fb = formatBits(level, mask), bit = (i) => (fb >>> i) & 1;
  for (let i = 0; i <= 5; i++) m[i][8] = bit(i);
  m[7][8] = bit(6); m[8][8] = bit(7); m[8][7] = bit(8);
  for (let i = 9; i < 15; i++) m[8][14 - i] = bit(i);
  for (let i = 0; i < 8; i++) m[8][n - 1 - i] = bit(i);
  for (let i = 8; i < 15; i++) m[n - 15 + i][8] = bit(i);
  m[n - 8][8] = 1;
  return m;
}

function penalty(m) {
  const n = m.length; let p = 0;
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i < n; i++) {
    let run = 1;
    for (let j = 1; j < n; j++) {
      const a = pass ? m[j][i] : m[i][j], b = pass ? m[j - 1][i] : m[i][j - 1];
      if (a === b) run++; else { if (run >= 5) p += run - 2; run = 1; }
    }
    if (run >= 5) p += run - 2;
  }
  for (let r = 0; r < n - 1; r++) for (let c = 0; c < n - 1; c++) {
    const s = m[r][c] + m[r + 1][c] + m[r][c + 1] + m[r + 1][c + 1];
    if (s === 0 || s === 4) p += 3;
  }
  const pat = [1, 0, 1, 1, 1, 0, 1];
  for (let r = 0; r < n; r++) for (let c = 0; c <= n - 7; c++) {
    let h = true, v = true;
    for (let k = 0; k < 7; k++) { if (m[r][c + k] !== pat[k]) h = false; if (m[c + k][r] !== pat[k]) v = false; }
    const lightH = (a, b) => { for (let k = a; k < b; k++) if (k >= 0 && k < n && m[r][k]) return false; return true; };
    const lightV = (a, b) => { for (let k = a; k < b; k++) if (k >= 0 && k < n && m[k][r]) return false; return true; };
    if (h && (lightH(c - 4, c) || lightH(c + 7, c + 11))) p += 40;
    if (v && (lightV(c - 4, c) || lightV(c + 7, c + 11))) p += 40;
  }
  let dark = 0; for (const row of m) for (const x of row) dark += x;
  p += Math.floor(Math.abs((dark * 100) / (n * n) - 50) / 5) * 10;
  return p;
}

/** Returns the module matrix (array of rows of 0/1). */
function matrix(text, level = "L") {
  const bytes = [...new TextEncoder().encode(String(text))]; // works in the app window and in Node
  let v = 1;
  while (v <= 10 && capacity(v, level) < bytes.length + (v < 10 ? 2 : 3)) v++;
  if (v > 10) throw new Error("QR text is too long");
  const cw = encodeData(bytes, v, level);
  let best = null, bestP = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const mx = buildMatrix(v, level, cw, mask);
    const pp = penalty(mx);
    if (pp < bestP) { bestP = pp; best = mx; }
  }
  return best;
}

/** SVG of the QR code with a 4-module quiet zone. */
function svg(text, { level = "L", color = "#000" } = {}) {
  const m = matrix(text, level);
  const n = m.length, q = 4, size = n + q * 2;
  let d = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (m[r][c]) d += `M${c + q} ${r + q}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><path d="${d}" fill="${color}"/></svg>`;
}



function toDataURL(text, opts) {
  opts = opts || {};
  return new Promise(function (resolve, reject) {
    try {
      var m = matrix(text, "M");
      var n = m.length, margin = opts.margin == null ? 1 : opts.margin, cells = n + margin * 2;
      var width = opts.width || 512, px = Math.max(1, Math.floor(width / cells)), size = px * cells;
      var c = document.createElement("canvas"); c.width = size; c.height = size;
      var ctx = c.getContext("2d");
      var col = opts.color || {}, light = col.light || "#ffffff", dark = col.dark || "#000000";
      var transparent = /^#[0-9a-f]{6}00$/i.test(light) || light === "transparent" || /rgba\([^)]*,\s*0\s*\)/i.test(light);
      if (!transparent) { ctx.fillStyle = light; ctx.fillRect(0, 0, size, size); }
      ctx.fillStyle = dark;
      for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (m[r][k]) ctx.fillRect((k + margin) * px, (r + margin) * px, px, px);
      resolve(c.toDataURL("image/png"));
    } catch (e) { reject(e); }
  });
}
window.QRCode = { toDataURL: toDataURL, matrix: matrix, svg: svg };
})();
