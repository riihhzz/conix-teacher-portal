/**
 * Nomi — maskot CONIX yang hidup (rig 2D dari aset tim aset, public/images/nomi/).
 *
 * Setiap bagian tubuh adalah gambar terpisah yang ditumpuk di "panggung" 780×970
 * (potongan dari kanvas 1080×1080 tim aset). Gerakan diam (bernapas, mengangguk,
 * berayun) dibuat di CSS (src/styles/nomi.css); JS mengatur ekspresi, kedipan,
 * arah pandang, dan reaksi (klik, hover, form).
 *
 *   const nomi = createNomi(el, { mood: 'normal', follow: true, interactive: true });
 *   nomi.setMood('senang');  nomi.play('lompat');  nomi.say(1500);
 */
import { asset } from '../config/constants.js';

/* Panggung: kanvas tim aset dipotong mulai (150, 40), ukuran 780×970 px. */
const STAGE = { x: 150, y: 40, w: 780, h: 970 };
const EXPR = 200; // ukuran kanvas tiap gambar ekspresi (px)

/* Posisi bagian tubuh dalam % panggung: [kiri, atas, lebar] (hasil potong otomatis). */
const PARTS = {
  koin: [50.513, 34.742, 43.077],
  'kaki-kanan': [39.103, 71.649, 10.769],
  'kaki-kiri': [56.026, 71.031, 11.538],
  'sepatu-kanan': [22.051, 77.526, 27.436],
  'sepatu-kiri': [57.821, 77.32, 22.949],
  badan: [7.949, 52.062, 64.487],
  'tangan-kiri': [52.949, 56.289, 19.744],
  'tangan-kanan-turun': [21.8, 56.289, 19.744], // cermin tangan kiri (lengan kanan menggantung)
  'tangan-kanan': [4.872, 51.237, 32.949],
  topi: [14.615, 3.814, 65.128],
  kaca: [11.667, 15.464, 57.692],
  wajah: [16.026, 18.866, 48.974],
};

/* Titik tengah tiap slot wajah (px kanvas tim aset) + skala gambar ekspresi.
   "kanan" = sisi kanan Nomi = kiri layar. Mata & alis diperbesar 1,35× agar proporsinya
   sama dengan desain Nomi (mata ±22% × 30% diameter wajah). */
const SLOTS = {
  eyeR: [388, 432, 1.35],
  eyeL: [544, 432, 1.35],
  browR: [388, 340, 1.35],
  browL: [544, 340, 1.35],
  mouth: [466, 528, 0.95],
};

/* Mata yang pupilnya dipisah agar bisa melirik. */
const PUPIL_EYES = new Set(['mata-normal', 'mata-melotot-kanan', 'mata-melotot-kiri']);

/* Ekspresi = kombinasi gambar per slot. dy = geser alis (px kanvas). */
export const MOODS = {
  normal: { eyeR: 'mata-normal', eyeL: 'mata-normal', browR: 'alis-normal-kanan', browL: 'alis-normal-kiri', mouth: 'mulut-default' },
  senyum: { eyeR: 'mata-normal', eyeL: 'mata-normal', browR: 'alis-normal-kanan', browL: 'alis-normal-kiri', mouth: 'mulut-senyum' },
  kedip: { eyeR: 'mata-normal', eyeL: 'mata-sipit-kiri', browR: 'alis-normal-kanan', browL: 'alis-sipit-kiri', mouth: 'mulut-senyum' },
  senang: { eyeR: 'mata-merem-kanan', eyeL: 'mata-merem-kiri', browR: 'alis-normal-kanan', browL: 'alis-normal-kiri', mouth: 'mulut-lebar' },
  kaget: { eyeR: 'mata-melotot-kanan', eyeL: 'mata-melotot-kiri', browR: 'alis-melotot-kanan', browL: 'alis-melotot-kiri', mouth: 'mulut-ou', dy: -12 },
  ngantuk: { eyeR: 'mata-ngantuk-kanan', eyeL: 'mata-ngantuk-kiri', browR: 'alis-ngantuk-kanan', browL: 'alis-ngantuk-kiri', mouth: 'mulut-rapat' },
  sedih: { eyeR: 'mata-ngantuk-kanan', eyeL: 'mata-ngantuk-kiri', browR: 'alis-ngantuk-kanan', browL: 'alis-ngantuk-kiri', mouth: 'mulut-sedih' },
  tutup: { eyeR: 'mata-merem-kanan', eyeL: 'mata-merem-kiri', browR: 'alis-ngantuk-kanan', browL: 'alis-ngantuk-kiri', mouth: 'mulut-rapat' },
  /* untuk adegan: menyelidik (alis turun) & berpikir (alis tidak simetris) */
  curiga: { eyeR: 'mata-normal', eyeL: 'mata-normal', browR: 'alis-ngantuk-kanan', browL: 'alis-ngantuk-kiri', mouth: 'mulut-rapat', dy: 8 },
  mikir: { eyeR: 'mata-normal', eyeL: 'mata-normal', browR: 'alis-melotot-kanan', browL: 'alis-ngantuk-kiri', mouth: 'mulut-rapat' },
};

const BLINK = { eyeR: 'mata-merem-kanan', eyeL: 'mata-merem-kiri' };
const TALK = ['mulut-ou', 'mulut-lebar', 'mulut-default', 'mulut-senyum', 'mulut-ou', 'mulut-rapat'];

const src = (name) => asset(`/images/nomi/ekspresi/${name}.webp`);
const pct = (v, total) => `${(v / total) * 100}%`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function part(name, cls = '') {
  const [left, top, width] = PARTS[name];
  return `<img src="${asset(`/images/nomi/${name}.webp`)}" alt="" class="nomi-part ${cls}" style="left:${left}%;top:${top}%;width:${width}%" draggable="false" />`;
}

function slot(key) {
  const [cx, cy, scale] = SLOTS[key];
  const size = EXPR * scale;
  const pos = `left:${pct(cx - size / 2 - STAGE.x, STAGE.w)};top:${pct(cy - size / 2 - STAGE.y, STAGE.h)};width:${pct(size, STAGE.w)}`;
  const eye = key.startsWith('eye');
  return `<div class="nomi-slot ${eye ? 'nomi-eye' : ''}" data-slot="${key}" style="${pos}">
      <img alt="" draggable="false" />${eye ? '<div class="nomi-pupil"><img alt="" draggable="false" /></div>' : ''}
    </div>`;
}

const TEMPLATE = `
  <div class="nomi-shadow"></div>
  <div class="nomi-rig">
    ${part('koin', 'nomi-koin')}
    <div class="nomi-layer nomi-leg nomi-leg-kanan">${part('kaki-kanan')}${part('sepatu-kanan')}</div>
    <div class="nomi-layer nomi-leg nomi-leg-kiri">${part('kaki-kiri')}${part('sepatu-kiri')}</div>
    <div class="nomi-layer nomi-upper">
      ${part('badan')}
      ${part('tangan-kiri', 'nomi-arm-kiri')}
      ${part('tangan-kanan-turun', 'nomi-arm-kanan-turun')}
      ${part('tangan-kanan', 'nomi-arm-kanan')}
      <div class="nomi-layer nomi-head">
        ${part('topi', 'nomi-topi')}
        ${part('kaca')}
        ${part('wajah')}
        <div class="nomi-layer nomi-face">${Object.keys(SLOTS).map(slot).join('')}</div>
      </div>
    </div>
  </div>`;

/** Preload semua gambar ekspresi agar pergantian tidak berkedip kosong. */
let preloaded = false;
function preload() {
  if (preloaded) return;
  preloaded = true;
  const names = new Set([...Object.values(MOODS).flatMap((m) => Object.values(m)), ...TALK]);
  for (const n of names) {
    if (typeof n !== 'string') continue;
    for (const f of PUPIL_EYES.has(n) ? [`${n}-putih`, `${n}-pupil`] : [n]) new Image().src = src(f);
  }
}

export function createNomi(root, { mood = 'normal', scene = null, follow = true, interactive = true } = {}) {
  preload();
  root.classList.add('nomi');
  root.innerHTML = TEMPLATE;
  const face = root.querySelector('.nomi-face');
  const slots = Object.fromEntries([...root.querySelectorAll('[data-slot]')].map((el) => [el.dataset.slot, el]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = mood;
  let busy = false; // sedang memainkan reaksi
  let talking = 0;

  function setSlot(key, name, dy = 0) {
    const el = slots[key];
    const img = el.firstElementChild;
    const hasPupil = PUPIL_EYES.has(name);
    img.src = src(hasPupil ? `${name}-putih` : name);
    el.style.translate = `0 ${pct(dy, STAGE.h)}`;
    if (key.startsWith('eye')) {
      const wrap = el.querySelector('.nomi-pupil');
      wrap.hidden = !hasPupil;
      if (hasPupil) {
        wrap.firstElementChild.src = src(`${name}-pupil`);
        const mask = `url("${asset(`/images/nomi/ekspresi/${name}-mask.png`)}")`;
        wrap.style.maskImage = mask;
        wrap.style.webkitMaskImage = mask;
      }
    }
  }

  function render(name, { pop = true } = {}) {
    const m = MOODS[name] ?? MOODS.normal;
    for (const key of Object.keys(SLOTS)) setSlot(key, m[key], key.startsWith('brow') ? (m.dy ?? 0) : 0);
    if (pop) {
      face.classList.remove('is-pop');
      void face.offsetWidth; // ulang animasi
      face.classList.add('is-pop');
    }
  }

  function setMood(name) {
    if (!MOODS[name]) return;
    current = name;
    root.dataset.mood = name;
    render(name);
  }

  /* Kedipan acak — hanya saat mata sedang terbuka */
  async function blink() {
    const m = MOODS[current];
    if (busy || (!PUPIL_EYES.has(m.eyeR) && !m.eyeR.includes('ngantuk'))) return;
    setSlot('eyeR', BLINK.eyeR);
    setSlot('eyeL', BLINK.eyeL);
    await wait(120);
    if (!busy) {
      setSlot('eyeR', MOODS[current].eyeR);
      setSlot('eyeL', MOODS[current].eyeL);
    }
  }
  async function blinkLoop() {
    for (;;) {
      await wait(1800 + Math.random() * 3200);
      await blink();
      if (Math.random() < 0.25) {
        await wait(160); // kadang berkedip dua kali
        await blink();
      }
    }
  }

  /* Arah pandang: -1..1. Wajah ikut menoleh sedikit, pupil bergerak lebih jauh. */
  function lookAt(x, y) {
    root.style.setProperty('--lx', Math.max(-1, Math.min(1, x)).toFixed(3));
    root.style.setProperty('--ly', Math.max(-1, Math.min(1, y)).toFixed(3));
  }

  if (follow && matchMedia('(pointer: fine)').matches) {
    window.addEventListener(
      'pointermove',
      (e) => {
        const r = face.getBoundingClientRect();
        const cx = r.left + r.width * 0.42;
        const cy = r.top + r.height * 0.42;
        lookAt((e.clientX - cx) / (window.innerWidth * 0.45), (e.clientY - cy) / (window.innerHeight * 0.45));
      },
      { passive: true },
    );
  } else if (!reduced && (!scene || scene === 'sapa')) {
    // layar sentuh: melirik ke arah acak, sesekali kembali ke depan
    (async () => {
      for (;;) {
        await wait(1600 + Math.random() * 2400);
        if (Math.random() < 0.35) lookAt(0, 0);
        else lookAt(Math.random() * 2 - 1, Math.random() * 1.4 - 0.7);
      }
    })();
  }

  /* Reaksi singkat: kelas CSS is-<aksi> + ekspresi sementara, lalu kembali ke ekspresi sebelumnya */
  async function play(action) {
    if (busy) return;
    busy = true;
    const cls = `is-${action}`;
    const [faceMood, ms] = ACTIONS[action];
    if (faceMood) render(faceMood);
    root.classList.remove(cls);
    void root.offsetWidth;
    root.classList.add(cls);
    await wait(ms);
    root.classList.remove(cls);
    busy = false;
    render(current, { pop: action !== 'lompat' });
  }

  /** Condong ke kiri (-1), tegak (0), atau ke kanan (1). */
  function lean(dir) {
    root.style.setProperty('--lean', dir.toFixed(2));
  }

  /*
   * Berjalan: kaki Nomi (tengah bawah) dipindah ke titik {x, y} di layar.
   * Elemen .nomi digeser lewat `translate` relatif ke posisi asalnya (pembungkusnya tidak ikut bergerak).
   *
   * `target` sebaiknya FUNGSI yang mengembalikan titik: titik tujuan dan posisi asal Nomi harus
   * diukur pada saat yang sama. Koordinat layar yang diukur lebih awal menjadi basi bila halaman
   * di-scroll sementara itu — Nomi lalu "terbang" sejauh jarak scroll (bug lama di adegan "ide").
   */
  let pos = { x: 0, y: 0 };
  async function walkTo(target) {
    if (root.dataset.walk === 'false') return; // Nomi kecil di dalam kartu: cukup menoleh
    const home = root.parentElement.getBoundingClientRect();
    let pt = typeof target === 'function' ? target() : target;
    // pengaman: tujuan selalu di dalam panggungnya (section tempat Nomi berada)
    const box = root.closest('[data-nomi-stage]')?.getBoundingClientRect();
    if (pt && box) {
      const w = root.offsetWidth;
      pt = {
        x: Math.min(box.right + w * 0.4, Math.max(box.left - w * 0.4, pt.x)),
        y: Math.min(box.bottom + w * 0.3, Math.max(box.top - w * 0.3, pt.y)),
      };
    }
    const tx = pt ? pt.x - (home.left + root.offsetWidth / 2) : 0;
    const ty = pt ? pt.y - (home.top + root.offsetHeight) : 0;
    const dist = Math.hypot(tx - pos.x, ty - pos.y);
    if (dist < 4) return;
    const dur = Math.min(1.8, Math.max(0.45, dist / 190));
    lean(Math.sign(tx - pos.x) * 0.45);
    root.style.setProperty('--walk', `${dur}s`);
    root.classList.add('is-walking');
    root.style.translate = `${tx}px ${ty}px`;
    pos = { x: tx, y: ty };
    await wait(dur * 1000);
    root.classList.remove('is-walking');
    lean(0);
  }
  const walkHome = () => walkTo(null);

  /** Menoleh (mata + condong badan) ke arah sebuah elemen di halaman. */
  function lookToward(el, { tilt = true } = {}) {
    const f = face.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const dx = r.left + r.width / 2 - (f.left + f.width * 0.42);
    const dy = r.top + r.height / 2 - (f.top + f.height * 0.42);
    const d = Math.hypot(dx, dy) || 1;
    lookAt(dx / d, (dy / d) * 0.9);
    if (tilt) lean(Math.max(-1, Math.min(1, dx / 260)) * 0.8);
  }

  /* Adegan hanya berjalan saat Nomi terlihat di layar */
  let visible = false;
  let wake = null;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    root.classList.toggle('is-visible', visible);
    if (visible) wake?.();
  }).observe(root);
  const whenVisible = () => (visible ? Promise.resolve() : new Promise((r) => (wake = r)));

  /** Mulut bergerak seperti berbicara selama `ms`. */
  async function say(ms = 1600) {
    const id = ++talking;
    const end = performance.now() + ms;
    let i = 0;
    while (performance.now() < end && id === talking) {
      setSlot('mouth', TALK[i++ % TALK.length]);
      await wait(110 + Math.random() * 70);
    }
    if (id === talking) setSlot('mouth', MOODS[current].mouth);
  }

  if (interactive) {
    root.addEventListener('click', () => play('lompat'));
    root.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse' && !busy) play('kaget').then(() => !busy && setMood('senyum'));
    });
    root.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse' && current === 'senyum') setMood(mood);
    });
  }

  root.style.setProperty('--lx', 0);
  root.style.setProperty('--ly', 0);
  render(mood, { pop: false });
  root.dataset.mood = mood;
  if (!reduced) blinkLoop();

  // "panggung" = section di sekitar Nomi; berisi elemen yang bisa diperiksa ([data-inspect="urutan"])
  const stage = root.closest('[data-nomi-stage]');
  const targets = stage
    ? [...stage.querySelectorAll('[data-inspect]')].sort((a, b) => a.dataset.inspect - b.dataset.inspect)
    : [];

  const api = {
    el: root, stage, targets, setMood, play, say, lookAt, lookToward, lean, walkTo, walkHome, whenVisible, wait,
    get mood() { return current; },
    get busy() { return busy; },
  };
  if (scene && SCENES[scene] && !reduced) {
    root.dataset.scene = scene;
    SCENES[scene](api);
  }
  return api;
}

/* Aksi: [ekspresi sementara, durasi ms]. Gerakannya ada di nomi.css (.nomi.is-<aksi>). */
const ACTIONS = {
  lompat: ['senang', 1100],
  kaget: ['kaget', 700],
  jempol: ['kedip', 1000],
};

/*
 * Adegan per bagian halaman — tiap Nomi "bercerita" sesuai isi section-nya.
 * Setiap langkah menunggu Nomi terlihat dulu, jadi adegan berhenti saat di luar layar.
 */
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const mark = (el, cls, on = true) => el.classList.toggle(cls, on);

/**
 * Pindahkan alat (mis. kaca pembesar) agar lensanya tepat di depan elemen `el`; null = kembali.
 * Posisi awal dihitung dari offsetLeft/Top (tidak terpengaruh transisi yang sedang berjalan).
 */
function moveTool(tool, el) {
  if (!tool) return;
  if (!el) {
    tool.style.translate = '';
    return;
  }
  const parent = tool.offsetParent.getBoundingClientRect();
  const lensX = parent.left + tool.offsetLeft + tool.offsetWidth * 0.41; // tengah lensa kaca-pembesar.svg
  const lensY = parent.top + tool.offsetTop + tool.offsetHeight * 0.42;
  const r = el.getBoundingClientRect();
  tool.style.translate = `${r.left + r.width * 0.5 - lensX}px ${r.top + r.height * 0.5 - lensY}px`;
}

/** Titik pijakan kaki Nomi di samping elemen (sisi yang lebih lapang di panggung). */
function besideOf(n, el) {
  const r = el.getBoundingClientRect();
  const s = n.stage.getBoundingClientRect();
  const w = n.el.offsetWidth;
  const right = r.left + r.width / 2 < s.left + s.width / 2;
  return { x: right ? r.right + w * 0.55 : r.left - w * 0.55, y: r.top + r.height * 0.85 };
}

const SCENES = {
  /* Beranda: menyapa — bicara, jempol, mengedip, melompat, dan sesekali menoleh ke benda di sekitarnya */
  async sapa(n) {
    const props = n.stage ? [...n.stage.querySelectorAll('[data-poke]')] : [];
    await n.wait(900);
    n.say(1400);
    for (;;) {
      await n.wait(2400 + Math.random() * 1400);
      await n.whenVisible();
      if (n.busy || n.el.matches(':hover')) continue;
      await pick([
        async () => { n.setMood('senyum'); await n.say(1200); },
        async () => n.play('jempol'),
        async () => { n.setMood('kedip'); await n.wait(1400); n.setMood('normal'); },
        async () => n.play('lompat'),
        // jalan-jalan sebentar ke kiri/kanan lalu kembali
        async () => {
          const dir = pick([-1, 1]);
          n.setMood('senyum');
          await n.walkTo(() => {
            const box = n.el.parentElement.getBoundingClientRect(); // posisi asal, bukan posisi sekarang
            return { x: box.left + box.width / 2 + dir * box.width * 0.35, y: box.top + n.el.offsetHeight };
          });
          n.lookAt(dir, 0);
          await n.say(700);
          await n.walkHome();
          n.lookAt(0, 0);
          n.setMood('normal');
        },
        // menoleh ke salah satu benda → benda itu bergoyang → Nomi tersenyum
        ...(props.length ? Array(3).fill(async () => {
          const prop = pick(props);
          n.setMood('kaget');
          n.lookToward(prop, { tilt: false });
          mark(prop, 'is-poked', false);
          void prop.offsetWidth;
          mark(prop, 'is-poked');
          await n.wait(900);
          n.setMood('senyum');
          await n.say(700);
          await n.wait(500);
          n.lookAt(0, 0);
          n.setMood('normal');
        }) : []),
      ])();
    }
  },

  /* Menyelidiki: memeriksa tiap petunjuk satu per satu (kaca pembesar ikut berpindah), lalu "ketemu!" */
  async selidik(n) {
    const tool = n.stage?.querySelector('[data-nomi-tool]');
    const cards = n.targets;
    for (;;) {
      await n.whenVisible();
      if (!cards.length) {
        // tanpa target: mengintip ke kiri & kanan
        n.setMood('curiga');
        for (const dir of [-1, 1]) {
          n.lean(dir);
          n.lookAt(dir, 0.5);
          await n.wait(1500);
        }
      }
      for (const card of cards) {
        await n.whenVisible();
        n.setMood('curiga');
        n.lookToward(card, { tilt: false });
        moveTool(tool, card);
        await n.walkTo(() => besideOf(n, card));
        n.lookToward(card);
        mark(card, 'is-inspected');
        await n.wait(700);
        n.say(450); // "hmm…"
        await n.wait(900);
        mark(card, 'is-inspected', false);
        mark(card, 'is-checked');
      }
      moveTool(tool, null);
      n.lookAt(0, 0);
      await n.walkHome();
      n.lookAt(0, -0.2);
      await n.play('kaget');
      n.setMood('senyum');
      await n.say(1000);
      await n.play('jempol');
      await n.wait(1600);
      cards.forEach((c) => mark(c, 'is-checked', false));
      await n.wait(600);
    }
  },

  /* Membuat misi: berpikir → "ide!" → mengisi kotak jawaban satu per satu, titik langkah ikut menyala */
  async ide(n) {
    const demo = n.stage?.querySelector('[data-wizard-demo]');
    const steps = n.stage ? [...n.stage.querySelectorAll('[data-step]')] : [];
    demo?.classList.add('is-driven');
    for (;;) {
      await n.whenVisible();
      n.setMood('mikir');
      n.lean(0);
      n.lookAt(0.6, -1);
      await n.wait(1500);
      n.lookAt(-0.5, -0.8);
      await n.wait(1000);
      await n.play('kaget');
      n.setMood('senyum');
      for (const [i, slot] of n.targets.entries()) {
        await n.whenVisible();
        // berdiri di atas bingkai kartu, tepat di atas kotak — diukur saat mulai berjalan
        if (demo) {
          await n.walkTo(() => {
            const r = slot.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: demo.getBoundingClientRect().top - 2 };
          });
        }
        n.lookToward(slot);
        await n.wait(350);
        mark(slot.querySelector('.demo-chip'), 'is-on');
        if (steps[i]) mark(steps[i], 'is-on');
        n.say(400);
        await n.wait(800);
      }
      n.lookAt(0, 0);
      await n.walkHome();
      await n.play('jempol');
      await n.wait(1800);
      n.targets.forEach((s) => mark(s.querySelector('.demo-chip'), 'is-on', false));
      steps.forEach((d) => mark(d, 'is-on', false));
      await n.wait(500);
    }
  },

  /* Peringkat: seperti pembawa acara — menunjuk juara 3, 2, lalu 1, kemudian merayakan */
  async umumkan(n) {
    for (;;) {
      await n.whenVisible();
      n.setMood('normal');
      for (const [i, col] of n.targets.entries()) {
        await n.whenVisible();
        const last = i === n.targets.length - 1;
        // berdiri di samping, sejajar puncak podium yang diumumkan
        await n.walkTo(() => {
          const r = col.getBoundingClientRect();
          const bar = (col.querySelector('.grow-bar') ?? col).getBoundingClientRect();
          return { x: r.right - n.el.offsetWidth * 0.1, y: bar.top + 6 };
        });
        n.setMood(last ? 'kaget' : 'senyum');
        n.lookToward(col);
        mark(col, 'is-inspected');
        await n.say(last ? 900 : 600);
        await n.wait(500);
        if (!last) mark(col, 'is-inspected', false);
      }
      await n.play('lompat');
      n.setMood('senang');
      await n.wait(1400);
      n.targets.forEach((c) => mark(c, 'is-inspected', false));
      n.lookAt(0, 0);
      n.setMood('normal');
      await n.walkHome();
      await n.wait(1200);
    }
  },

  /* Aplikasi murid: menari mengikuti irama (gerakan di CSS), ekspresi berganti */
  async rayakan(n) {
    for (;;) {
      await n.whenVisible();
      n.setMood(pick(['senang', 'kedip', 'senyum']));
      n.lookAt(Math.random() * 1.6 - 0.8, Math.random() * 0.6 - 0.4);
      if (Math.random() < 0.4) n.say(900);
      await n.wait(1200);
    }
  },
};

/**
 * Pasang Nomi di semua elemen [data-nomi-rig].
 * Atribut opsional: data-mood, data-scene (sapa | selidik | ide | umumkan | rayakan),
 * data-follow="false", data-interactive="false", data-walk="false" (tidak berjalan).
 * Nomi beradegan tidak mengikuti kursor, kecuali adegan "sapa".
 */
export function mountNomi(scope = document) {
  return [...scope.querySelectorAll('[data-nomi-rig]')].map((el) => {
    const scene = el.dataset.scene;
    return createNomi(el, {
      mood: el.dataset.mood || 'normal',
      scene,
      follow: el.dataset.follow !== 'false' && (!scene || scene === 'sapa'),
      interactive: el.dataset.interactive !== 'false',
    });
  });
}
