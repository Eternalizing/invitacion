/**
 * Criptografía autenticada en JavaScript puro (SHA-256 + PBKDF2-HMAC-SHA256 + CTR-HMAC-SHA256).
 * Funciona de forma idéntica en Node.js y en cualquier navegador móvil o de escritorio,
 * tanto en HTTPS como en HTTP local (sin depender de window.crypto.subtle).
 */

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

const rotr = (n, x) => (x >>> n) | (x << (32 - n));

export function sha256(data) {
  const bytes = typeof data === 'string' ? textEncoder.encode(data) : data;
  const len = bytes.length;
  const bitLen = len * 8;
  const paddedLen = Math.ceil((len + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[len] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);

  for (let i = 0; i < paddedLen; i += 64) {
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + j * 4, false);
    }
    for (let j = 16; j < 64; j++) {
      const s0 = rotr(7, w[j - 15]) ^ rotr(18, w[j - 15]) ^ (w[j - 15] >>> 3);
      const s1 = rotr(17, w[j - 2]) ^ rotr(19, w[j - 2]) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let j = 0; j < 64; j++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[j] + w[j]) >>> 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  outView.setUint32(20, h5, false);
  outView.setUint32(24, h6, false);
  outView.setUint32(28, h7, false);
  return out;
}

export function sha256Hex(data) {
  const digest = sha256(data);
  let hex = '';
  for (let i = 0; i < digest.length; i++) {
    hex += digest[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export function hmacSha256(keyBytes, msgBytes) {
  let k = keyBytes;
  if (k.length > 64) {
    k = sha256(k);
  }
  const paddedKey = new Uint8Array(64);
  paddedKey.set(k);

  const inner = new Uint8Array(64 + msgBytes.length);
  const outer = new Uint8Array(64 + 32);

  for (let i = 0; i < 64; i++) {
    inner[i] = paddedKey[i] ^ 0x36;
    outer[i] = paddedKey[i] ^ 0x5c;
  }
  inner.set(msgBytes, 64);
  outer.set(sha256(inner), 64);
  return sha256(outer);
}

export function pbkdf2Sha256(password, saltBytes, iterations, dkLen = 64) {
  const pwdBytes = typeof password === 'string' ? textEncoder.encode(password) : password;
  const blocks = Math.ceil(dkLen / 32);
  const dk = new Uint8Array(blocks * 32);

  for (let blockIdx = 1; blockIdx <= blocks; blockIdx++) {
    const saltWithIndex = new Uint8Array(saltBytes.length + 4);
    saltWithIndex.set(saltBytes);
    new DataView(saltWithIndex.buffer).setUint32(saltBytes.length, blockIdx, false);

    let u = hmacSha256(pwdBytes, saltWithIndex);
    const t = new Uint8Array(u);

    for (let i = 1; i < iterations; i++) {
      u = hmacSha256(pwdBytes, u);
      for (let j = 0; j < 32; j++) {
        t[j] ^= u[j];
      }
    }

    dk.set(t, (blockIdx - 1) * 32);
  }

  return dk.slice(0, dkLen);
}

function toBase64(bytes) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let bin = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(bin);
}

function fromBase64(str) {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(str, 'base64'));
  }
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

function getRandomBytes(len) {
  const out = new Uint8Array(len);
  globalThis.crypto.getRandomValues(out);
  return out;
}

function ctrXor(encKey, ivBytes, inputBytes) {
  const out = new Uint8Array(inputBytes.length);
  const blockInput = new Uint8Array(ivBytes.length + 4);
  blockInput.set(ivBytes);
  const counterView = new DataView(blockInput.buffer);

  let offset = 0;
  let counter = 0;
  while (offset < inputBytes.length) {
    counterView.setUint32(ivBytes.length, counter, false);
    const keystream = hmacSha256(encKey, blockInput);
    const chunkLen = Math.min(32, inputBytes.length - offset);
    for (let i = 0; i < chunkLen; i++) {
      out[offset + i] = inputBytes[offset + i] ^ keystream[i];
    }
    offset += chunkLen;
    counter++;
  }
  return out;
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export function encryptJson(obj, passphrase, iterations = 1000) {
  const salt = getRandomBytes(16);
  const iv = getRandomBytes(16);
  const keys = pbkdf2Sha256(passphrase, salt, iterations, 64);
  const encKey = keys.slice(0, 32);
  const macKey = keys.slice(32, 64);

  const plainBytes = textEncoder.encode(JSON.stringify(obj));
  const ct = ctrXor(encKey, iv, plainBytes);

  const macInput = new Uint8Array(iv.length + ct.length);
  macInput.set(iv);
  macInput.set(ct, iv.length);
  const mac = hmacSha256(macKey, macInput);

  return {
    v: 1,
    i: iterations,
    s: toBase64(salt),
    iv: toBase64(iv),
    ct: toBase64(ct),
    mac: toBase64(mac),
  };
}

export function decryptJson(envelope, passphrase) {
  if (!envelope || envelope.v !== 1 || !envelope.s || !envelope.iv || !envelope.ct || !envelope.mac) {
    return null;
  }
  const salt = fromBase64(envelope.s);
  const iv = fromBase64(envelope.iv);
  const ct = fromBase64(envelope.ct);
  const mac = fromBase64(envelope.mac);
  const iterations = Number(envelope.i) || 1000;

  const keys = pbkdf2Sha256(passphrase, salt, iterations, 64);
  const encKey = keys.slice(0, 32);
  const macKey = keys.slice(32, 64);

  const macInput = new Uint8Array(iv.length + ct.length);
  macInput.set(iv);
  macInput.set(ct, iv.length);
  const expectedMac = hmacSha256(macKey, macInput);

  if (!constantTimeEqual(mac, expectedMac)) {
    return null;
  }

  const plainBytes = ctrXor(encKey, iv, ct);
  return JSON.parse(textDecoder.decode(plainBytes));
}
