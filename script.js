import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ================================================================
   DEFINISI KRISTAL (CRYSTAL DEFINITIONS)
   ================================================================ */
const SQRT3 = Math.sqrt(3);
const SQRT8_3 = Math.sqrt(8 / 3);

const CRYSTALS = {
    BCC: {
        label: 'BCC', fullName: 'Body-Centered Cubic',
        system: 'Kubik', sg: 'Im\u0305 3m (#229)', cn: 8,
        apc: { conv: 2, prim: 1 },
        pf: '68% (0.68)',
        defaultA: 4.0, cellType: 'cubic',
        basis: [
            { frac: [0,0,0], type: 'Fe', color: '#D4A020', r: 0.42 },
            { frac: [.5,.5,.5], type: 'Fe', color: '#D4A020', r: 0.42 }
        ],
        primBasis: [
            { frac: [0,0,0], type: 'Fe', color: '#D4A020', r: 0.42 }
        ],
        bondFrac: 0.87, // sqrt(3)/2 = 0.866
        legend: [{ c: '#D4A020', l: 'Atom (Fe)' }],
        calc: (a) => ({
            dist: a * Math.sqrt(3) / 2,
            ratio: (a * Math.sqrt(3) / 4) / a,
            vol: a * a * a,
            vecConv: [[a, 0, 0], [0, a, 0], [0, 0, a]],
            vecPrim: [[-a/2, a/2, a/2], [a/2, -a/2, a/2], [a/2, a/2, -a/2]]
        })
    },
    FCC: {
        label: 'FCC', fullName: 'Face-Centered Cubic',
        system: 'Kubik', sg: 'Fm\u0305 3m (#225)', cn: 12,
        apc: { conv: 4, prim: 1 },
        pf: '74% (0.74)',
        defaultA: 4.0, cellType: 'cubic',
        basis: [
            { frac: [0,0,0],     type: 'Al', color: '#A8B8C8', r: 0.38 },
            { frac: [.5,.5,0],   type: 'Al', color: '#A8B8C8', r: 0.38 },
            { frac: [.5,0,.5],   type: 'Al', color: '#A8B8C8', r: 0.38 },
            { frac: [0,.5,.5],   type: 'Al', color: '#A8B8C8', r: 0.38 }
        ],
        primBasis: [
            { frac: [0,0,0], type: 'Al', color: '#A8B8C8', r: 0.38 }
        ],
        bondFrac: 0.72, // 1/sqrt(2) = 0.707
        legend: [{ c: '#A8B8C8', l: 'Atom (Al)' }],
        calc: (a) => ({
            dist: a / Math.sqrt(2),
            ratio: (a / (2 * Math.sqrt(2))) / a,
            vol: a * a * a,
            vecConv: [[a, 0, 0], [0, a, 0], [0, 0, a]],
            vecPrim: [[0, a/2, a/2], [a/2, 0, a/2], [a/2, a/2, 0]]
        })
    },
    HCP: {
        label: 'HCP', fullName: 'Hexagonal Close-Packed',
        system: 'Heksagonal', sg: 'P6\u2083/mmc (#194)', cn: 12,
        apc: { conv: 6, prim: 2 },
        pf: '74% (0.74)',
        defaultA: 3.5, cellType: 'hexagonal',
        basis: [], // Dihasilkan khusus
        primBasis: [],
        bondFrac: 1.05,
        legend: [{ c: '#00CED1', l: 'Layer A' }, { c: '#1A9E96', l: 'Layer B' }],
        calc: (a) => ({
            dist: a,
            ratio: 0.5,
            vol: (3 * Math.sqrt(3) / 2) * a * a * (a * SQRT8_3),
            vecConv: [[a, 0, 0], [-a/2, a*Math.sqrt(3)/2, 0], [0, 0, a*SQRT8_3]],
            vecPrim: [[a, 0, 0], [-a/2, a*Math.sqrt(3)/2, 0], [0, 0, a*SQRT8_3]]
        })
    },
    NaCl: {
        label: 'NaCl', fullName: 'Natrium Klorida (Rock Salt)',
        system: 'Kubik', sg: 'Fm\u0305 3m (#225)', cn: 6,
        apc: { conv: 8, prim: 2 },
        pf: '67%',
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
        primBasis: [
            { frac: [0,0,0], type: 'Na\u207A', color: '#5B8BD4', r: 0.28 },
            { frac: [.5,0,0], type: 'Cl\u207B', color: '#5DBF5A', r: 0.42 }
        ],
        bondFrac: 0.52, // 0.5
        legend: [{ c: '#5B8BD4', l: 'Na\u207A' }, { c: '#5DBF5A', l: 'Cl\u207B' }],
        calc: (a) => ({
            dist: a / 2,
            ratio: (a/4)/a, // just an approximation for display
            vol: a * a * a,
            vecConv: [[a, 0, 0], [0, a, 0], [0, 0, a]],
            vecPrim: [[0, a/2, a/2], [a/2, 0, a/2], [a/2, a/2, 0]]
        })
    },
    Diamond: {
        label: 'Intan', fullName: 'Diamond Cubic (Intan)',
        system: 'Kubik', sg: 'Fd\u0305 3m (#227)', cn: 4,
        apc: { conv: 8, prim: 2 },
        pf: '34% (0.34)',
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
        primBasis: [
            { frac: [0,0,0], type: 'C', color: '#88C8E8', r: 0.32 },
            { frac: [.25,.25,.25], type: 'C', color: '#D0D8F0', r: 0.32 }
        ],
        bondFrac: 0.45, // sqrt(3)/4 = 0.433
        legend: [{ c: '#88C8E8', l: 'C (FCC)' }, { c: '#D0D8F0', l: 'C (Tetrahedral)' }],
        calc: (a) => ({
            dist: a * Math.sqrt(3) / 4,
            ratio: (a * Math.sqrt(3) / 8) / a,
            vol: a * a * a,
            vecConv: [[a, 0, 0], [0, a, 0], [0, 0, a]],
            vecPrim: [[0, a/2, a/2], [a/2, 0, a/2], [a/2, a/2, 0]]
        })
    }
};

/* ================================================================
   STATUS APLIKASI (APPLICATION STATE)
   ================================================================ */
const state = {
    type: 'BCC',
    a: 4.0,
    scale: 1.0,
    rep: 1, // nx, ny, nz multiplier
    mode: 'conventional', // 'conventional' or 'primitive'
    showCell: true,
    showBonds: true,
    showCoords: false,
    autoRotate: false,
    slice: false
};

/* ================================================================
   PERSIAPAN THREE.JS (THREE.JS SETUP)
   ================================================================ */
let scene, camera, renderer, controls;
let crystalGroup = null;

function initThree() {
    const container = document.getElementById('canvas-container');
    const W = container.clientWidth;
    const H = container.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f9ff);

    camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 200);
    camera.position.set(9, 7, 9);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.localClippingEnabled = true; // Aktifkan clipping untuk potongan atom
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.7;
    controls.zoomSpeed = 1.0;
    controls.minDistance = 2;
    controls.maxDistance = 150;

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dir1 = new THREE.DirectionalLight(0xffffff, 1.0);
    dir1.position.set(6, 12, 8);
    scene.add(dir1);
    const dir2 = new THREE.DirectionalLight(0x93c5fd, 0.45);
    dir2.position.set(-6, -4, -6);
    scene.add(dir2);
    const pt = new THREE.PointLight(0x0284c7, 0.4, 30);
    pt.position.set(0, 8, 0);
    scene.add(pt);

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

function genAtoms(def, a, rep, mode) {
    const atoms = [];
    const seen = new Set();
    
    let vecs = def.calc(a).vecConv;
    let basis = def.basis;
    let limitX = rep, limitY = rep, limitZ = rep;

    if (mode === 'primitive') {
        vecs = def.calc(a).vecPrim;
        basis = def.primBasis;
        if (def.cellType === 'hexagonal') {
            basis = [
                { frac: [0, 0, 0], type: 'A', color: '#00CED1', r: 0.38 },
                { frac: [1/3, 2/3, 1/2], type: 'B', color: '#1A9E96', r: 0.38 }
            ];
        }
    } else if (def.cellType === 'hexagonal') {
        return genHCPAtoms(a, rep);
    }

    for (const b of basis) {
        for (let n1 = 0; n1 <= limitX; n1++) {
            for (let n2 = 0; n2 <= limitY; n2++) {
                for (let n3 = 0; n3 <= limitZ; n3++) {
                    const fracX = b.frac[0] + n1;
                    const fracY = b.frac[1] + n2;
                    const fracZ = b.frac[2] + n3;

                    const x = fracX * vecs[0][0] + fracY * vecs[1][0] + fracZ * vecs[2][0];
                    const y = fracX * vecs[0][1] + fracY * vecs[1][1] + fracZ * vecs[2][1];
                    const z = fracX * vecs[0][2] + fracY * vecs[1][2] + fracZ * vecs[2][2];

                    if (n1 === limitX && b.frac[0] > 0) continue;
                    if (n2 === limitY && b.frac[1] > 0) continue;
                    if (n3 === limitZ && b.frac[2] > 0) continue;

                    const key = Math.round(x * 1e4) + '_' + Math.round(y * 1e4) + '_' + Math.round(z * 1e4);
                    if (!seen.has(key)) {
                        seen.add(key);
                        atoms.push({ x, y, z, type: b.type, color: b.color, r: b.r });
                    }
                }
            }
        }
    }
    return atoms;
}

function genHCPAtoms(a, rep) {
    const c = a * SQRT8_3;
    const atoms = [];
    const colA = '#00CED1';
    const colB = '#1A9E96';
    const r = 0.38;
    const seen = new Set();

    const addAtom = (x, y, z, type, col) => {
        const key = Math.round(x * 1e4) + '_' + Math.round(y * 1e4) + '_' + Math.round(z * 1e4);
        if (!seen.has(key)) {
            seen.add(key);
            atoms.push({ x, y, z, type, color: col, r });
        }
    };

    for (let rx = 0; rx < rep; rx++) {
        for (let ry = 0; ry < rep; ry++) {
            for (let rz = 0; rz < rep; rz++) {
                const offsetX = rx * (a * 1.5);
                const offsetY = ry * (a * SQRT3) + (rx % 2 !== 0 ? a * SQRT3 / 2 : 0);
                const offsetZ = rz * c;

                function addALayer(zVal) {
                    addAtom(offsetX, offsetY, zVal + offsetZ, 'A', colA);
                    for (let i = 0; i < 6; i++) {
                        const ang = i * Math.PI / 3;
                        addAtom(offsetX + a * Math.cos(ang), offsetY + a * Math.sin(ang), zVal + offsetZ, 'A', colA);
                    }
                }

                addALayer(0);

                const bPositions = [
                    { x: 0,     y: a * SQRT3 / 3 },
                    { x: a / 2, y: -a * SQRT3 / 6 },
                    { x: -a / 2, y: -a * SQRT3 / 6 }
                ];
                for (const p of bPositions) {
                    addAtom(offsetX + p.x, offsetY + p.y, offsetZ + c / 2, 'B', colB);
                }

                if (rz === rep - 1) {
                    addALayer(c);
                }
            }
        }
    }
    return atoms;
}

/* ================================================================
   PEMBUATAN IKATAN (BOND GENERATION)
   ================================================================ */
function genBonds(atoms, threshold) {
    const bonds = [];
    const t2 = threshold * threshold;
    for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
            const dx = atoms[i].x - atoms[j].x;
            const dy = atoms[i].y - atoms[j].y;
            const dz = atoms[i].z - atoms[j].z;
            const d2 = dx * dx + dy * dy + dz * dz;
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

function createCellWireframe(def, a, rep, mode) {
    const pts = [];
    let vecs = mode === 'primitive' ? def.calc(a).vecPrim : def.calc(a).vecConv;
    
    if (def.cellType === 'hexagonal' && mode === 'conventional') {
        const c = a * SQRT8_3;
        for (let rx = 0; rx < rep; rx++) {
            for (let ry = 0; ry < rep; ry++) {
                for (let rz = 0; rz < rep; rz++) {
                    const ox = rx * (a * 1.5);
                    const oy = ry * (a * SQRT3) + (rx % 2 !== 0 ? a * SQRT3 / 2 : 0);
                    const oz = rz * c;

                    const v = [];
                    for (let i = 0; i < 6; i++) {
                        const ang = i * Math.PI / 3;
                        v.push([ox + a * Math.cos(ang), oy + a * Math.sin(ang), oz]);
                    }
                    for (let i = 0; i < 6; i++) {
                        const ang = i * Math.PI / 3;
                        v.push([ox + a * Math.cos(ang), oy + a * Math.sin(ang), oz + c]);
                    }
                    const e = [];
                    for (let i = 0; i < 6; i++) e.push([i, (i + 1) % 6]);
                    for (let i = 0; i < 6; i++) e.push([i + 6, ((i + 1) % 6) + 6]);
                    for (let i = 0; i < 6; i++) e.push([i, i + 6]);

                    for (const [i, j] of e) {
                        pts.push(...v[i]);
                        pts.push(...v[j]);
                    }
                }
            }
        }
    } else {
        for (let rx = 0; rx < rep; rx++) {
            for (let ry = 0; ry < rep; ry++) {
                for (let rz = 0; rz < rep; rz++) {
                    const ox = rx * vecs[0][0] + ry * vecs[1][0] + rz * vecs[2][0];
                    const oy = rx * vecs[0][1] + ry * vecs[1][1] + rz * vecs[2][1];
                    const oz = rx * vecs[0][2] + ry * vecs[1][2] + rz * vecs[2][2];

                    const corners = [];
                    for (let nx = 0; nx <= 1; nx++) {
                        for (let ny = 0; ny <= 1; ny++) {
                            for (let nz = 0; nz <= 1; nz++) {
                                corners.push([
                                    ox + nx * vecs[0][0] + ny * vecs[1][0] + nz * vecs[2][0],
                                    oy + nx * vecs[0][1] + ny * vecs[1][1] + nz * vecs[2][1],
                                    oz + nx * vecs[0][2] + ny * vecs[1][2] + nz * vecs[2][2]
                                ]);
                            }
                        }
                    }
                    const edges = [
                        [0,1],[0,2],[0,4],[1,3],[1,5],[2,3],[2,6],[3,7],[4,5],[4,6],[5,7],[6,7]
                    ];
                    for (const [i, j] of edges) {
                        pts.push(...corners[i]);
                        pts.push(...corners[j]);
                    }
                }
            }
        }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
        color: 0x0284c7, transparent: true, opacity: 0.65
    }));
}

/* ================================================================
   PEMBANGUN UTAMA KRISTAL (BUILD CRYSTAL MAIN)
   ================================================================ */

const sphereGeo = new THREE.SphereGeometry(1, 36, 36);
const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 10, 1);

function getMat(hex, planes) {
    return new THREE.MeshStandardMaterial({
        color: new THREE.Color(hex),
        metalness: 0.2,
        roughness: 0.35,
        clippingPlanes: planes,
        clipIntersection: false
    });
}

function buildCrystal() {
    if (crystalGroup) {
        scene.remove(crystalGroup);
        crystalGroup.traverse(o => {
            if (o.geometry && o.geometry !== sphereGeo && o.geometry !== cylGeo) o.geometry.dispose();
            if (o.material) o.material.dispose();
        });
    }
    crystalGroup = new THREE.Group();

    const def = CRYSTALS[state.type];
    const a = state.a;
    const rep = state.rep;
    const mode = state.mode;

    const atoms = genAtoms(def, a, rep, mode);

    let cx = 0, cy = 0, cz = 0;
    let clipPlanes = [];

    if (mode === 'conventional' && def.cellType === 'cubic') {
        cx = (a * rep) / 2;
        cy = (a * rep) / 2;
        cz = (a * rep) / 2;
        
        if (state.slice) {
            clipPlanes = [
                new THREE.Plane(new THREE.Vector3(1, 0, 0), cx),
                new THREE.Plane(new THREE.Vector3(-1, 0, 0), cx),
                new THREE.Plane(new THREE.Vector3(0, 1, 0), cy),
                new THREE.Plane(new THREE.Vector3(0, -1, 0), cy),
                new THREE.Plane(new THREE.Vector3(0, 0, 1), cz),
                new THREE.Plane(new THREE.Vector3(0, 0, -1), cz)
            ];
        }
    } else {
        let sumX=0, sumY=0, sumZ=0;
        for (const at of atoms) { sumX+=at.x; sumY+=at.y; sumZ+=at.z; }
        cx = sumX/atoms.length; cy = sumY/atoms.length; cz = sumZ/atoms.length;
        clipPlanes = [];
    }

    for (const at of atoms) {
        const mesh = new THREE.Mesh(sphereGeo, getMat(at.color, clipPlanes));
        const rad = at.r * state.scale;
        mesh.scale.setScalar(rad);
        mesh.position.set(at.x - cx, at.y - cy, at.z - cz);
        crystalGroup.add(mesh);
    }

    if (state.showBonds) {
        const threshold = def.bondFrac * a;
        const bonds = genBonds(atoms, threshold);
        const bondR = 0.06 * state.scale;
        
        const bondMat = new THREE.MeshStandardMaterial({
            color: 0x64748b, metalness: 0.1, roughness: 0.4,
            transparent: true, opacity: 0.6,
            clippingPlanes: clipPlanes
        });

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

    if (state.showCell) {
        const wireframe = createCellWireframe(def, a, rep, mode);
        wireframe.position.set(-cx, -cy, -cz);
        crystalGroup.add(wireframe);
    }

    scene.add(crystalGroup);

    const span = a * rep * 1.5;
    const dist = Math.max(8, span * 1.8);
    camera.position.set(dist, dist * 0.75, dist);
    controls.target.set(0, 0, 0);
    controls.update();

    updateOverlay(def);
    updateInfo(def, a, mode);
    updateLegend(def);
    updateCoordTable(atoms, cx, cy, cz);
}

/* ================================================================
   PEMBARUAN TAMPILAN ANTARMUKA (UI UPDATES)
   ================================================================ */

function updateOverlay(def) {
    document.getElementById('ov-title').textContent = def.label;
    document.getElementById('ov-sub').textContent = def.fullName;
}

function formatVec(v) {
    return `[${v[0].toFixed(2)}, ${v[1].toFixed(2)}, ${v[2].toFixed(2)}]`;
}

function updateInfo(def, a, mode) {
    const calc = def.calc(a);
    
    document.getElementById('i-sys').textContent = def.system;
    document.getElementById('i-param').textContent = def.cellType === 'hexagonal' ? `a = ${a.toFixed(2)}, c = ${(a*SQRT8_3).toFixed(2)}` : `a = ${a.toFixed(2)}`;
    
    const apc = mode === 'primitive' ? def.apc.prim : def.apc.conv;
    document.getElementById('i-apc').textContent = apc;
    
    document.getElementById('i-cn').textContent = def.cn;
    document.getElementById('i-dist').textContent = calc.dist.toFixed(3);
    document.getElementById('i-ratio').textContent = calc.ratio.toFixed(3);
    document.getElementById('i-vol').textContent = calc.vol.toFixed(2);
    document.getElementById('i-pf').textContent = def.pf;

    const vecs = mode === 'primitive' ? calc.vecPrim : calc.vecConv;
    document.getElementById('vec-type').textContent = mode === 'primitive' ? 'Primitif' : 'Konvensional';
    document.getElementById('i-vec-a').textContent = `a₁ = ${formatVec(vecs[0])}`;
    document.getElementById('i-vec-b').textContent = `a₂ = ${formatVec(vecs[1])}`;
    document.getElementById('i-vec-c').textContent = `a₃ = ${formatVec(vecs[2])}`;
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

function updateCoordTable(atoms, cx, cy, cz) {
    const tb = document.getElementById('coord-body');
    tb.innerHTML = atoms.map((at, i) =>
        '<tr>' +
            '<td>' + (i + 1) + '</td>' +
            '<td class="type-cell">' + at.type + '</td>' +
            '<td>' + (at.x - cx).toFixed(3) + '</td>' +
            '<td>' + (at.y - cy).toFixed(3) + '</td>' +
            '<td>' + (at.z - cz).toFixed(3) + '</td>' +
        '</tr>'
    ).join('');
}

/* ================================================================
   PENANGANAN INTERAKSI PENGGUNA (EVENT HANDLERS)
   ================================================================ */

function setupUI() {
    document.querySelectorAll('.structure-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.structure-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.type = btn.dataset.type;
            state.a = CRYSTALS[state.type].defaultA;
            document.getElementById('lattice-slider').value = state.a;
            document.getElementById('lattice-val').textContent = state.a.toFixed(1);
            
            if (state.type === 'HCP' && state.slice) {
                state.slice = false;
                document.getElementById('tog-slice').checked = false;
            }

            buildCrystal();
        });
    });

    document.getElementById('atom-slider').addEventListener('input', e => {
        state.scale = parseFloat(e.target.value);
        document.getElementById('atom-val').textContent = state.scale.toFixed(1);
        buildCrystal();
    });

    document.getElementById('lattice-slider').addEventListener('input', e => {
        state.a = parseFloat(e.target.value);
        document.getElementById('lattice-val').textContent = state.a.toFixed(1);
        buildCrystal();
    });

    document.getElementById('rep-slider').addEventListener('input', e => {
        state.rep = parseInt(e.target.value);
        document.getElementById('rep-val').textContent = state.rep;
        buildCrystal();
    });

    document.querySelectorAll('input[name="cell_mode"]').forEach(radio => {
        radio.addEventListener('change', e => {
            state.mode = e.target.value;
            buildCrystal();
        });
    });

    document.getElementById('tog-cell').addEventListener('change', e => {
        state.showCell = e.target.checked;
        buildCrystal();
    });
    document.getElementById('tog-bonds').addEventListener('change', e => {
        state.showBonds = e.target.checked;
        buildCrystal();
    });
    document.getElementById('tog-slice').addEventListener('change', e => {
        state.slice = e.target.checked;
        if (state.type === 'HCP' && state.slice) {
            alert('Fitur potongan atom (slicing) difokuskan untuk unit cell Kubik.');
            state.slice = false;
            e.target.checked = false;
        }
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
