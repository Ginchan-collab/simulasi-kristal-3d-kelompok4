import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ================================================================
   DEFINISI KRISTAL (CRYSTAL DEFINITIONS)
   ================================================================ */
const SQRT3 = Math.sqrt(3);
const SQRT8_3 = Math.sqrt(8 / 3);

// Objek yang berisi definisi tiap tipe kristal
const CRYSTALS = {
    BCC: {
        label: 'BCC', fullName: 'Body-Centered Cubic',
        system: 'Kubik', sg: 'Im\u0305 3m (#229)', cn: 8, apc: 2, pf: '68%',
        defaultA: 4.0, cellType: 'cubic',
        basis: [
            { frac: [0,0,0], type: 'Fe', color: '#D4A020', r: 0.42 },
            { frac: [.5,.5,.5], type: 'Fe', color: '#D4A020', r: 0.42 }
        ],
        bondFrac: 0.87,
        legend: [{ c: '#D4A020', l: 'Atom (Fe)' }]
    },
    FCC: {
        label: 'FCC', fullName: 'Face-Centered Cubic',
        system: 'Kubik', sg: 'Fm\u0305 3m (#225)', cn: 12, apc: 4, pf: '74%',
        defaultA: 4.0, cellType: 'cubic',
        basis: [
            { frac: [0,0,0],     type: 'Al', color: '#A8B8C8', r: 0.38 },
            { frac: [.5,.5,0],   type: 'Al', color: '#A8B8C8', r: 0.38 },
            { frac: [.5,0,.5],   type: 'Al', color: '#A8B8C8', r: 0.38 },
            { frac: [0,.5,.5],   type: 'Al', color: '#A8B8C8', r: 0.38 }
        ],
        bondFrac: 0.72,
        legend: [{ c: '#A8B8C8', l: 'Atom (Al)' }]
    },
    HCP: {
        label: 'HCP', fullName: 'Hexagonal Close-Packed',
        system: 'Heksagonal', sg: 'P6\u2083/mmc (#194)', cn: 12, apc: 2, pf: '74%',
        defaultA: 3.5, cellType: 'hexagonal',
        basis: [], // Dihasilkan melalui fungsi khusus (generated specially)
        bondFrac: 1.06,
        legend: [{ c: '#00CED1', l: 'Layer A' }, { c: '#1A9E96', l: 'Layer B' }]
    },
    NaCl: {
        label: 'NaCl', fullName: 'Natrium Klorida (Rock Salt)',
        system: 'Kubik', sg: 'Fm\u0305 3m (#225)', cn: 6, apc: 8, pf: '67%',
        defaultA: 5.0, cellType: 'cubic',
        basis: [
            { frac: [0,0,0],     type: 'Na\u207A', color: '#5B8BD4', r: 0.28 },
            { frac: [.5,.5,0],   type: 'Na\u207A', color: '#5B8BD4', r: 0.28 },
            { frac: [.5,0,.5],   type: 'Na\u207A', color: '#5B8BD4', r: 0.28 },
            { frac: [0,.5,.5],   type: 'Na\u207A', color: '#5B8BD4', r: 0.28 },
            { frac: [.5,0,0],    type: 'Cl\u207B', color: '#5DBF5A', r: 0.42 },
            { frac: [0,.5,0],    type: 'Cl\u207B', color: '#5DBF5A', r: 0.42 },
            { frac: [0,0,.5],    type: 'Cl\u207B', color: '#5DBF5A', r: 0.42 },
            { frac: [.5,.5,.5],  type: 'Cl\u207B', color: '#5DBF5A', r: 0.42 }
        ],
        bondFrac: 0.52,
        legend: [{ c: '#5B8BD4', l: 'Na\u207A' }, { c: '#5DBF5A', l: 'Cl\u207B' }]
    },
    Diamond: {
        label: 'Intan', fullName: 'Diamond Cubic (Intan)',
        system: 'Kubik', sg: 'Fd\u0305 3m (#227)', cn: 4, apc: 8, pf: '34%',
        defaultA: 5.0, cellType: 'cubic',
        basis: [
            { frac: [0,0,0],       type: 'C', color: '#88C8E8', r: 0.32 },
            { frac: [.5,.5,0],     type: 'C', color: '#88C8E8', r: 0.32 },
            { frac: [.5,0,.5],     type: 'C', color: '#88C8E8', r: 0.32 },
            { frac: [0,.5,.5],     type: 'C', color: '#88C8E8', r: 0.32 },
            { frac: [.25,.25,.25], type: 'C', color: '#D0D8F0', r: 0.32 },
            { frac: [.75,.75,.25], type: 'C', color: '#D0D8F0', r: 0.32 },
            { frac: [.75,.25,.75], type: 'C', color: '#D0D8F0', r: 0.32 },
            { frac: [.25,.75,.75], type: 'C', color: '#D0D8F0', r: 0.32 }
        ],
        bondFrac: 0.45,
        legend: [{ c: '#88C8E8', l: 'C (FCC)' }, { c: '#D0D8F0', l: 'C (Tetrahedral)' }]
    }
};

/* ================================================================
   STATUS APLIKASI (APPLICATION STATE)
   ================================================================ */
const state = {
    type: 'BCC',
    a: 4.0,
    scale: 1.0,
    showCell: true,
    showBonds: true,
    showCoords: false,
    autoRotate: false
};

/* ================================================================
   PERSIAPAN THREE.JS (THREE.JS SETUP)
   ================================================================ */
let scene, camera, renderer, controls;
let crystalGroup = null;

const SIDEBAR_W = 310;

// Inisialisasi layar dan pengaturan THREE.js
function initThree() {
    const container = document.getElementById('canvas-container');
    const W = container.clientWidth;
    const H = container.clientHeight;

    // Membuat ruang 3D (Scene)
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a18);

    // Mengatur Kamera
    camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 200);
    camera.position.set(9, 7, 9);

    // Render grafis
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Mengontrol pergerakan (Orbit)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.7;
    controls.zoomSpeed = 1.0;
    controls.minDistance = 2;
    controls.maxDistance = 60;

    // Pencahayaan (Lights)
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const dir1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dir1.position.set(6, 12, 8);
    scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0x6090c0, 0.35);
    dir2.position.set(-6, -4, -6);
    scene.add(dir2);

    const pt = new THREE.PointLight(0x4a9eff, 0.3, 30);
    pt.position.set(0, 8, 0);
    scene.add(pt);

    // Menangani saat ukuran layar berubah (Resize)
    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });
}

/* ================================================================
   PEMBENTUKAN ATOM (ATOM GENERATION)
   ================================================================ */

/** Menghasilkan posisi atom untuk struktur sel kubik */
function genCubicAtoms(basis, a) {
    const atoms = [];
    const seen = new Set();
    const tol = 0.001 * a;

    for (const b of basis) {
        for (let n1 = 0; n1 <= 1; n1++) {
            for (let n2 = 0; n2 <= 1; n2++) {
                for (let n3 = 0; n3 <= 1; n3++) {
                    const x = (b.frac[0] + n1) * a;
                    const y = (b.frac[1] + n2) * a;
                    const z = (b.frac[2] + n3) * a;
                    // Pastikan koordinat dalam batas unit cell
                    if (x >= -tol && x <= a + tol &&
                        y >= -tol && y <= a + tol &&
                        z >= -tol && z <= a + tol) {
                        const key = Math.round(x * 1e4) + '_' + Math.round(y * 1e4) + '_' + Math.round(z * 1e4);
                        if (!seen.has(key)) {
                            seen.add(key);
                            atoms.push({ x, y, z, type: b.type, color: b.color, r: b.r });
                        }
                    }
                }
            }
        }
    }
    return atoms;
}

/** Menghasilkan posisi atom untuk sel konvensional heksagonal (prisma heksagonal) */
function genHCPAtoms(a) {
    const c = a * SQRT8_3;
    const atoms = [];
    const colA = '#00CED1';
    const colB = '#1A9E96';
    const r = 0.38;

    // Fungsi lapisan A (dengan z = tinggi/height)
    function addALayer(zVal) {
        atoms.push({ x: 0, y: 0, z: zVal, type: 'A', color: colA, r });
        for (let i = 0; i < 6; i++) {
            const ang = i * Math.PI / 3;
            atoms.push({
                x: a * Math.cos(ang),
                y: a * Math.sin(ang),
                z: zVal,
                type: 'A', color: colA, r
            });
        }
    }

    // Lapisan bawah A
    addALayer(0);

    // Lapisan B (z = c/2)
    // Tiga atom di atas rongga segitiga yang berselang
    const bPositions = [
        { x: 0,     y: a * SQRT3 / 3 },
        { x: a / 2, y: -a * SQRT3 / 6 },
        { x: -a / 2, y: -a * SQRT3 / 6 }
    ];
    for (const p of bPositions) {
        atoms.push({ x: p.x, y: p.y, z: c / 2, type: 'B', color: colB, r });
    }

    // Lapisan atas A
    addALayer(c);

    return atoms;
}

/* ================================================================
   PEMBUATAN IKATAN (BOND GENERATION)
   ================================================================ */
// Membuat sambungan ikatan antar atom yang berdekatan
function genBonds(atoms, threshold) {
    const bonds = [];
    const t2 = threshold * threshold;
    for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
            const dx = atoms[i].x - atoms[j].x;
            const dy = atoms[i].y - atoms[j].y;
            const dz = atoms[i].z - atoms[j].z;
            const d2 = dx * dx + dy * dy + dz * dz;
            // Jika jaraknya masuk threshold ikatan
            if (d2 > 0.0001 && d2 <= t2) {
                bonds.push([i, j]);
            }
        }
    }
    return bonds;
}

/* ================================================================
   GARIS BINGKAI SEL SATUAN (UNIT CELL WIREFRAME)
   ================================================================ */

function cubicCellData(a) {
    const v = [
        [0,0,0],[a,0,0],[0,a,0],[0,0,a],
        [a,a,0],[a,0,a],[0,a,a],[a,a,a]
    ];
    const e = [[0,1],[0,2],[0,3],[1,4],[1,5],[2,4],[2,6],[3,5],[3,6],[4,7],[5,7],[6,7]];
    return { v, e };
}

function hexCellData(a) {
    const c = a * SQRT8_3;
    const v = [];
    for (let i = 0; i < 6; i++) {
        const ang = i * Math.PI / 3;
        v.push([a * Math.cos(ang), a * Math.sin(ang), 0]);
    }
    for (let i = 0; i < 6; i++) {
        const ang = i * Math.PI / 3;
        v.push([a * Math.cos(ang), a * Math.sin(ang), c]);
    }
    const e = [];
    for (let i = 0; i < 6; i++) e.push([i, (i + 1) % 6]);           // segienam bawah (bottom hex)
    for (let i = 0; i < 6; i++) e.push([i + 6, ((i + 1) % 6) + 6]); // segienam atas (top hex)
    for (let i = 0; i < 6; i++) e.push([i, i + 6]);                  // garis vertikal
    return { v, e };
}

/* ================================================================
   PEMBANGUN UTAMA KRISTAL (BUILD CRYSTAL MAIN)
   ================================================================ */

// Geometri dasar yang dipakai berulang
const sphereGeo = new THREE.SphereGeometry(1, 36, 36);
const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 10, 1);

const matCache = {};
function getMat(hex) {
    if (!matCache[hex]) {
        matCache[hex] = new THREE.MeshStandardMaterial({
            color: new THREE.Color(hex),
            metalness: 0.35,
            roughness: 0.38
        });
    }
    return matCache[hex];
}

const bondMat = new THREE.MeshStandardMaterial({
    color: 0x888899,
    metalness: 0.2, roughness: 0.5,
    transparent: true, opacity: 0.55
});

// Membangun ulang seluruh tampilan kristal
function buildCrystal() {
    // Bersihkan model sebelumnya (Cleanup)
    if (crystalGroup) {
        scene.remove(crystalGroup);
        crystalGroup.traverse(o => {
            if (o.geometry && o.geometry !== sphereGeo && o.geometry !== cylGeo) o.geometry.dispose();
        });
    }
    crystalGroup = new THREE.Group();

    const def = CRYSTALS[state.type];
    const a = state.a;

    // 1) Dapatkan posisi atom-atom
    let atoms;
    if (def.cellType === 'hexagonal') {
        atoms = genHCPAtoms(a);
    } else {
        atoms = genCubicAtoms(def.basis, a);
    }

    // 2) Hitung titik pusat untuk ditengahkan ke layar
    let cx = 0, cy = 0, cz = 0;
    if (def.cellType === 'cubic') {
        cx = a / 2; cy = a / 2; cz = a / 2;
    } else {
        cz = a * SQRT8_3 / 2; // tengah ketinggian prisma heksagonal
    }

    // 3) Buat mesh/objek 3D atom
    for (const at of atoms) {
        const mesh = new THREE.Mesh(sphereGeo, getMat(at.color));
        const rad = at.r * state.scale;
        mesh.scale.setScalar(rad);
        mesh.position.set(at.x - cx, at.y - cy, at.z - cz);
        crystalGroup.add(mesh);
    }

    // 4) Tambahkan ikatan jika opsi menyala
    if (state.showBonds) {
        const threshold = def.bondFrac * a;
        const bonds = genBonds(atoms, threshold);
        const bondR = 0.06 * state.scale;

        for (const [i, j] of bonds) {
            const s = new THREE.Vector3(atoms[i].x - cx, atoms[i].y - cy, atoms[i].z - cz);
            const e = new THREE.Vector3(atoms[j].x - cx, atoms[j].y - cy, atoms[j].z - cz);
            const dir = new THREE.Vector3().subVectors(e, s);
            const len = dir.length();
            if (len < 0.001) continue;
            const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);

            const mesh = new THREE.Mesh(cylGeo, bondMat);
            mesh.scale.set(bondR, len, bondR);
            mesh.position.copy(mid);

            const up = new THREE.Vector3(0, 1, 0);
            const q = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
            mesh.quaternion.copy(q);

            crystalGroup.add(mesh);
        }
    }

    // 5) Tampilkan wireframe sel satuan jika menyala
    if (state.showCell) {
        const cell = def.cellType === 'cubic' ? cubicCellData(a) : hexCellData(a);
        const pts = [];
        for (const [i, j] of cell.e) {
            const vi = cell.v[i];
            const vj = cell.v[j];
            pts.push(vi[0] - cx, vi[1] - cy, vi[2] - cz);
            pts.push(vj[0] - cx, vj[1] - cy, vj[2] - cz);
        }
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
        const lineMat = new THREE.LineBasicMaterial({
            color: 0xffffff, transparent: true, opacity: 0.3
        });
        crystalGroup.add(new THREE.LineSegments(lineGeo, lineMat));
    }

    scene.add(crystalGroup);

    // 6) Posisikan kamera (Camera framing)
    const span = def.cellType === 'cubic' ? a : Math.max(a * 2, a * SQRT8_3);
    const dist = span * 1.8;
    camera.position.set(dist, dist * 0.75, dist);
    controls.target.set(0, 0, 0);
    controls.update();

    // 7) Perbarui tampilan antarmuka (Update UI)
    updateOverlay(def);
    updateInfo(def);
    updateLegend(def);
    updateCoordTable(atoms);
}

/* ================================================================
   PEMBARUAN TAMPILAN ANTARMUKA (UI UPDATES)
   ================================================================ */

function updateOverlay(def) {
    document.getElementById('ov-title').textContent = def.label;
    document.getElementById('ov-sub').textContent = def.fullName;
}

function updateInfo(def) {
    document.getElementById('i-sys').textContent = def.system;
    document.getElementById('i-sg').textContent = def.sg;
    document.getElementById('i-cn').textContent = def.cn;
    document.getElementById('i-apc').textContent = def.apc;
    document.getElementById('i-pf').textContent = def.pf;
}

function updateLegend(def) {
    const el = document.getElementById('legend');
    el.innerHTML = def.legend.map(it =>
        '<div class="legend-item">' +
            '<span class="legend-dot" style="background:' + it.c + '"></span>' +
            '<span>' + it.l + '</span>' +
        '</div>'
    ).join('');
}

function updateCoordTable(atoms) {
    const tb = document.getElementById('coord-body');
    tb.innerHTML = atoms.map((at, i) =>
        '<tr>' +
            '<td>' + (i + 1) + '</td>' +
            '<td class="type-cell">' + at.type + '</td>' +
            '<td>' + at.x.toFixed(3) + '</td>' +
            '<td>' + at.y.toFixed(3) + '</td>' +
            '<td>' + at.z.toFixed(3) + '</td>' +
        '</tr>'
    ).join('');
}

/* ================================================================
   PENANGANAN INTERAKSI PENGGUNA (EVENT HANDLERS)
   ================================================================ */

function setupUI() {
    // Tombol pemilihan jenis kristal
    document.querySelectorAll('.structure-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.structure-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.type = btn.dataset.type;
            state.a = CRYSTALS[state.type].defaultA;
            document.getElementById('lattice-slider').value = state.a;
            document.getElementById('lattice-val').textContent = state.a.toFixed(1);
            buildCrystal();
        });
    });

    // Pengaturan ukuran atom
    document.getElementById('atom-slider').addEventListener('input', e => {
        state.scale = parseFloat(e.target.value);
        document.getElementById('atom-val').textContent = state.scale.toFixed(1);
        buildCrystal();
    });

    // Pengaturan jarak kisi (lattice constant)
    document.getElementById('lattice-slider').addEventListener('input', e => {
        state.a = parseFloat(e.target.value);
        document.getElementById('lattice-val').textContent = state.a.toFixed(1);
        buildCrystal();
    });

    // Sakelar nyala/mati pengaturan tampilan (Toggles)
    document.getElementById('tog-cell').addEventListener('change', e => {
        state.showCell = e.target.checked;
        buildCrystal();
    });
    document.getElementById('tog-bonds').addEventListener('change', e => {
        state.showBonds = e.target.checked;
        buildCrystal();
    });
    document.getElementById('tog-rotate').addEventListener('change', e => {
        state.autoRotate = e.target.checked;
        controls.autoRotate = state.autoRotate;
        controls.autoRotateSpeed = 2.0;
    });
    document.getElementById('tog-coords').addEventListener('change', e => {
        state.showCoords = e.target.checked;
        document.getElementById('coord-section').style.display = state.showCoords ? 'block' : 'none';
    });
}

/* ================================================================
   PROSES ANIMASI (ANIMATION LOOP)
   ================================================================ */

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

/* ================================================================
   INISIALISASI AWAL (INITIALIZATION)
   ================================================================ */

initThree();
setupUI();
buildCrystal();
animate();
