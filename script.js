/**
 * Crafted By Ashutosh Srivastav · Full Stack Developer */

const gsap = /** @type {any} */ (window).gsap;

/* ==========================================================================
   1. AUDIO SYNTHESIS ENGINE (Web Audio API — Keystrokes, Chimes & Cracker Pops)
   ========================================================================== */

class DiwaliSoundEngine {
  constructor() {
    /** @type {AudioContext | null} */
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => { });
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.init();
      this.playSparkChime(528, 0.04);
    }
    return this.enabled;
  }

  /**
   * Subtle, tactile developer terminal mechanical keystroke click
   * @param {number} charCode
   */
  playKeystroke(charCode = 65) {
    if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 190 + (charCode % 19) * 8;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.028);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.028);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {
      // Ignore audio context restrictions prior to interaction
    }
  }

  /**
   * Warm harmonic swell when the diya ignites or 3D lanterns bloom
   * @param {number} baseFreq
   * @param {number} volume
   */
  playSparkChime(baseFreq = 432, volume = 0.045) {
    if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
    try {
      const now = this.ctx.currentTime;
      const ratios = [1, 1.25, 1.5];
      ratios.forEach((ratio, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * ratio, now + idx * 0.04);

        gain.gain.setValueAtTime(0.001, now + idx * 0.04);
        gain.gain.linearRampToValueAtTime(
          volume / (idx + 1),
          now + idx * 0.04 + 0.08
        );
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 1.4 + idx * 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + 1.65 + idx * 0.2);
      });
    } catch {
      // Ignore audio errors
    }
  }

  /**
   * Festive cracker pop + golden Anaar fountain sizzle
   */
  playCrackerBurst() {
    if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
    try {
      const now = this.ctx.currentTime;
      // 1. Crisp percussive cracker pop
      const osc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(165, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.09);

      popGain.gain.setValueAtTime(0.065, now);
      popGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.095);

      osc.connect(popGain);
      popGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);

      // 2. Sparkler / Anaar shimmer chime
      this.playSparkChime(587.33, 0.035);
    } catch {
      // Ignore audio errors
    }
  }
}

const soundEngine = new DiwaliSoundEngine();

/* ==========================================================================
   2. 3D PERSPECTIVE PROJECTION & MATHEMATICAL GEOMETRY HELPERS
   ========================================================================== */

/**
 * Projects a 3D world point (x, y, z) onto 2D screen coordinates with camera yaw & pitch.
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} centerX
 * @param {number} centerY
 * @param {number} yaw
 * @param {number} pitch
 * @param {number} [fov]
 */
function project3D(x, y, z, centerX, centerY, yaw, pitch, fov = 680) {
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const x1 = x * cosY - z * sinY;
  const z1 = z * cosY + x * sinY;

  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);
  const y2 = y * cosP - z1 * sinP;
  const z2 = z1 * cosP + y * sinP;

  const depth = Math.max(80, fov + z2);
  const scale = fov / depth;
  return {
    screenX: centerX + x1 * scale,
    screenY: centerY + y2 * scale,
    scale,
    depth,
  };
}

/**
 * Computes articulated 2D human pose coordinates for the festive character lighting crackers.
 * @param {number} timeSec
 * @param {number} igniteCycle (0 = standing with sparkler, 1 = leaning down to light Anaar cracker)
 */
function computeHumanPose(timeSec, igniteCycle) {
  const clamped = Math.max(0, Math.min(1, igniteCycle));
  const breathe = Math.sin(timeSec * 2.6) * 0.025;
  const torsoLean = 0.14 + clamped * 0.42 + breathe;

  const shoulderX = -Math.sin(torsoLean) * 44;
  const shoulderY = -66 + Math.cos(torsoLean) * 8;

  const armWave = Math.sin(timeSec * 5.2) * 3.5 * (1 - clamped * 0.5);
  const elbowX = shoulderX - 20 - clamped * 12;
  const elbowY = shoulderY + 20 + clamped * 16 + armWave * 0.4;

  const handX = elbowX - 24 - clamped * 14;
  const handY = elbowY + 12 + clamped * 24 + armWave;

  const sparklerTipX = handX - 28;
  const sparklerTipY = handY + (clamped > 0.4 ? 14 * clamped : -6 + armWave * 0.6);

  return {
    torsoLean,
    shoulder: { x: shoulderX, y: shoulderY },
    elbow: { x: elbowX, y: elbowY },
    hand: { x: handX, y: handY },
    sparklerTip: { x: sparklerTipX, y: sparklerTipY },
  };
}

/**
 * Generates normalized 3D points for the sculpted Indian clay diya.
 * @param {number} totalPoints
 */
function buildDiyaOutline(totalPoints = 320) {
  const pts = [];
  for (let i = 0; i < totalPoints; i++) {
    const ratio = i / totalPoints;
    if (ratio < 0.4) {
      const t = (ratio / 0.4) * Math.PI * 2;
      const spoutFactor = Math.exp(-Math.pow(Math.sin(t / 2), 2) * 6.5) * 0.25;
      const rx = 0.74 + spoutFactor;
      const ry = 0.21;
      const x = Math.cos(t) * rx;
      const y = Math.sin(t) * ry - 0.04 - spoutFactor * 0.14;
      const z = Math.sin(t) * 0.35;
      pts.push({ x, y, z, hue: 42, size: 2.2 });
    } else if (ratio < 0.8) {
      const u = (ratio - 0.4) / 0.4;
      const row = Math.floor(u * 5);
      const depth = (row + 1) / 5.4;
      const angle = (u * 5 - row) * Math.PI;
      const widthAtDepth = 0.74 - depth * 0.38;
      const x = Math.cos(angle) * widthAtDepth;
      const y = 0.01 + Math.sin(angle) * (0.19 + depth * 0.26) + depth * 0.11;
      const z = Math.sin(angle) * 0.28;
      pts.push({ x, y, z, hue: 34, size: 1.9 });
    } else if (ratio < 0.92) {
      const u = (ratio - 0.8) / 0.12;
      const t = u * Math.PI * 2;
      const rScale = 0.36 + (i % 3) * 0.12;
      const x = Math.cos(t) * 0.54 * rScale;
      const y = Math.sin(t) * 0.14 * rScale - 0.03;
      const z = Math.sin(t) * 0.2 * rScale;
      pts.push({ x, y, z, hue: 45, size: 1.7 });
    } else {
      const u = (ratio - 0.92) / 0.08;
      const x = 0.7 + u * 0.25;
      const y = -0.07 - u * 0.14 - Math.pow(u, 2) * 0.04;
      const z = 0;
      pts.push({ x, y, z, hue: 48, size: 2.4 });
    }
  }
  return pts;
}

/* ==========================================================================
   3. STORY STATE & 3D CAMERA CONTROLLER
   ========================================================================== */

const state = {
  currentScene: 1,
  reducedMotion:
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: 1,

  // Animated values controlled by GSAP timeline
  particleMode: 0,
  particleConvergence: 0,
  diyaSolidAlpha: 0,
  flameIgnition: 0,
  worldZoom: 1.0,
  diyaVerticalOffset: 0,
  worldReveal: 0,
  rangoliProgress: 0,

  // 3D Camera & Interactive Parallax State
  pointerX: window.innerWidth * 0.5,
  pointerY: window.innerHeight * 0.5,
  normPointerX: 0,
  normPointerY: 0,
  camYaw: 0,
  camPitch: 0,
  pointerVx: 0,
  windLean: 0,
  litDiyasCount: 1,
  typingRunId: 0,

  // Human cracker-lighting excitement state
  humanIgniteUntil: 0,
  anaarBoostUntil: 0,
};

/* ==========================================================================
   4. 3D CANVAS ENTITIES (PARTICLES, DIYAS, 3D LANTERNS, HUMAN CRACKERS, FIREWORKS)
   ========================================================================== */

const DIYA_CONTOUR = buildDiyaOutline(320);

/** @type {any[]} */
const codeParticles = [];

/** @type {any[]} */
const courtyardDiyas = [];

/** @type {any[]} */
const goldenDustMotes = [];

/** @type {any[]} */
const skyLanterns3D = [];

/** @type {any[]} */
const fireworks = [];

/** @type {any[]} */
const anaarSparks = [];

/** @type {any[]} */
const phuljhariSparks = [];

function initCanvasEntities() {
  // 1. Initialize 320 code-to-light golden 3D particles
  codeParticles.length = 0;
  for (let i = 0; i < DIYA_CONTOUR.length; i++) {
    const target = DIYA_CONTOUR[i];
    const ox =
      state.width * 0.5 + (Math.random() - 0.5) * Math.min(480, state.width * 0.72);
    const oy = state.height * 0.5 + (Math.random() - 0.5) * 160;
    codeParticles.push({
      x: ox,
      y: oy,
      z: (Math.random() - 0.5) * 180,
      vx: (Math.random() - 0.5) * 2.2,
      vy: -Math.random() * 2.4 - 0.5,
      originX: ox,
      originY: oy,
      normTx: target.x,
      normTy: target.y,
      normTz: target.z,
      size: target.size,
      alpha: 0,
      hue: target.hue,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // 2. Initialize perspective courtyard diyas for Scene 4 & 5
  courtyardDiyas.length = 0;
  const presetPositions = [
    { normX: -0.38, normY: 0.75, z: -40, scale: 0.34 },
    { normX: -0.25, normY: 0.82, z: -90, scale: 0.42 },
    { normX: -0.15, normY: 0.71, z: 40, scale: 0.28 },
    { normX: 0.15, normY: 0.71, z: 40, scale: 0.28 },
    { normX: 0.24, normY: 0.82, z: -90, scale: 0.41 },
    { normX: -0.44, normY: 0.66, z: 110, scale: 0.22 },
    { normX: -0.31, normY: 0.63, z: 150, scale: 0.19 },
    { normX: -0.09, normY: 0.62, z: 180, scale: 0.17 },
    { normX: 0.09, normY: 0.62, z: 180, scale: 0.17 },
    { normX: 0.31, normY: 0.63, z: 150, scale: 0.19 },
  ];

  presetPositions.forEach((pos, idx) => {
    courtyardDiyas.push({
      normX: pos.normX,
      normY: pos.normY,
      z: pos.z,
      scale: pos.scale,
      phase: idx * 1.1,
      isUserAdded: false,
      igniteAnim: 1,
    });
  });

  // 3. Initialize floating 3D golden dust motes
  goldenDustMotes.length = 0;
  for (let i = 0; i < 65; i++) {
    goldenDustMotes.push({
      x: (Math.random() - 0.5) * state.width * 1.2,
      y: (Math.random() - 0.5) * state.height * 1.1,
      z: (Math.random() - 0.5) * 420,
      vy: -0.28 - Math.random() * 0.45,
      vx: (Math.random() - 0.5) * 0.3,
      radius: 1.0 + Math.random() * 2.0,
      alpha: 0.25 + Math.random() * 0.65,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // 4. Initialize 3D Rising Akashdeep Sky Lanterns
  skyLanterns3D.length = 0;
  for (let i = 0; i < 14; i++) {
    skyLanterns3D.push({
      x: (Math.random() - 0.5) * state.width * 1.15,
      y: (Math.random() - 0.5) * state.height * 0.9,
      z: -120 + Math.random() * 480,
      vy: -0.35 - Math.random() * 0.4,
      swayAmp: 0.3 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      width: 16 + Math.random() * 10,
      height: 24 + Math.random() * 14,
    });
  }
}

/**
 * Re-samples actual DOM positions of characters in the terminal right before Scene 2
 */
function sampleTerminalCharacterOrigins() {
  const terminalEl = document.getElementById('terminal-body');
  if (!terminalEl) return;
  const rect = terminalEl.getBoundingClientRect();
  if (rect.width < 20 || rect.height < 20) return;

  for (let i = 0; i < codeParticles.length; i++) {
    const p = codeParticles[i];
    const row = i % 5;
    const colRatio = ((i * 7) % 100) / 100;
    p.originX = rect.left + 28 + colRatio * (rect.width - 56);
    p.originY = rect.top + 28 + row * 34 + (Math.random() - 0.5) * 8;
    p.x = p.originX;
    p.y = p.originY;
    p.vx = (Math.random() - 0.5) * 2.4;
    p.vy = -0.8 - Math.random() * 2.0;
  }
}

/**
 * Spawns a 3D spherical firework shell in the sky
 * @param {number} [customX]
 * @param {number} [customTargetY]
 */
function launchFirework(customX, customTargetY) {
  const x =
    typeof customX === 'number'
      ? customX
      : state.width * (0.14 + Math.random() * 0.72);
  const targetY =
    typeof customTargetY === 'number'
      ? Math.max(state.height * 0.1, Math.min(state.height * 0.46, customTargetY))
      : state.height * (0.12 + Math.random() * 0.26);

  const palette = ['#FFF3D1', '#F5C76B', '#E89B3C', '#FFB74D', '#F4B860'];
  const color = palette[Math.floor(Math.random() * palette.length)];

  fireworks.push({
    x,
    y: state.height * 0.78,
    z: (Math.random() - 0.5) * 180,
    targetY,
    vx: (Math.random() - 0.5) * 0.8,
    vy: -6.8 - Math.random() * 2.2,
    exploded: false,
    color,
    sparks: [],
  });
}

/**
 * Triggers the human character to bend down, blow/ignite the Anaar & Chakri crackers,
 * and launch 3D sky rockets!
 */
function triggerHumanCrackerCelebration() {
  soundEngine.init();
  soundEngine.playCrackerBurst();

  if (state.currentScene < 4) {
    goToScene(4, true);
  }

  const nowSec = performance.now() * 0.001;
  state.humanIgniteUntil = nowSec + 2.8;
  state.anaarBoostUntil = nowSec + 4.5;

  // Burst extra 3D Anaar flowerpot sparks immediately
  const humanX = state.width * 0.78;
  const groundY = state.height * 0.83;
  const anaarX = humanX - 96;
  const anaarY = groundY + 4;

  for (let i = 0; i < 42; i++) {
    const spread = (Math.random() - 0.5) * 0.68;
    const speed = 4.2 + Math.random() * 5.8;
    anaarSparks.push({
      x: anaarX,
      y: anaarY - 14,
      vx: Math.sin(spread) * speed,
      vy: -Math.cos(spread) * speed,
      size: 1.5 + Math.random() * 2.0,
      alpha: 1,
      decay: 0.016 + Math.random() * 0.014,
      color: i % 3 === 0 ? '#FFF8E1' : i % 2 === 0 ? '#F5C76B' : '#E89B3C',
    });
  }

  // Launch 3 staggered sky rockets from the courtyard
  for (let r = 0; r < 3; r++) {
    setTimeout(() => {
      launchFirework(
        state.width * (0.22 + r * 0.26 + (Math.random() - 0.5) * 0.08),
        state.height * (0.14 + Math.random() * 0.18)
      );
    }, r * 190);
  }
}

/**
 * Adds a new glowing clay diya in the courtyard
 * @param {number} [clientX]
 * @param {number} [clientY]
 */
function addCourtyardDiya(clientX, clientY) {
  const normX =
    typeof clientX === 'number'
      ? (clientX - state.width * 0.5) / state.width
      : (Math.random() - 0.5) * 0.72;
  const normY =
    typeof clientY === 'number'
      ? Math.max(0.6, Math.min(0.88, clientY / state.height))
      : 0.64 + Math.random() * 0.22;

  const scale = 0.18 + (normY - 0.58) * 0.85;
  const newDiya = {
    normX,
    normY,
    z: (0.75 - normY) * 320,
    scale: Math.max(0.18, Math.min(0.45, scale)),
    phase: Math.random() * Math.PI * 2,
    isUserAdded: true,
    igniteAnim: 0.05,
  };
  courtyardDiyas.push(newDiya);

  if (gsap) {
    gsap.to(newDiya, {
      igniteAnim: 1,
      duration: 0.85,
      ease: 'power2.out',
    });
  } else {
    newDiya.igniteAnim = 1;
  }

  state.litDiyasCount += 1;
  soundEngine.playSparkChime(480 + (state.litDiyasCount % 6) * 36, 0.035);
}

/* ==========================================================================
   5. CANVAS RENDERING (3D RANGOLI, DIYA, 3D LANTERNS, HUMAN CRACKER-BLOWER)
   ========================================================================== */

/** @type {HTMLCanvasElement | null} */
let glowSpriteCanvas = null;

function getGlowSprite() {
  if (glowSpriteCanvas) return glowSpriteCanvas;
  const c = document.createElement('canvas');
  c.width = 96;
  c.height = 96;
  const gctx = c.getContext('2d');
  if (gctx) {
    const grad = gctx.createRadialGradient(48, 48, 2, 48, 48, 48);
    grad.addColorStop(0, 'rgba(255, 238, 185, 0.58)');
    grad.addColorStop(0.35, 'rgba(245, 175, 70, 0.24)');
    grad.addColorStop(0.7, 'rgba(217, 107, 39, 0.07)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, 96, 96);
  }
  glowSpriteCanvas = c;
  return c;
}

/**
 * Draws the 3D perspective rotating 12-petal lotus Rangoli beneath the central diya
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} baseScale
 * @param {number} progress
 * @param {number} timeSec
 */
function drawLotusRangoli3D(ctx, cx, cy, baseScale, progress, timeSec) {
  if (progress <= 0.01) return;

  ctx.save();
  // Tilt floor plane with 3D camera pitch & yaw parallax
  const tiltY = 0.34 + Math.sin(state.camPitch) * 0.08;
  ctx.translate(cx + state.camYaw * 28, cy + baseScale * 0.44);
  ctx.scale(1, Math.max(0.22, tiltY));

  const maxRadius = baseScale * 1.68;
  const alpha = Math.min(1, progress) * (0.46 + 0.06 * Math.sin(timeSec * 2.2));

  // Outer counter-rotating sacred geometric 3D mandala rings
  ctx.strokeStyle = `rgba(245, 199, 107, ${alpha * 0.6})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, maxRadius * progress, 0, Math.PI * 2 * progress);
  ctx.stroke();

  ctx.strokeStyle = `rgba(232, 155, 60, ${alpha * 0.44})`;
  ctx.beginPath();
  ctx.arc(0, 0, maxRadius * 0.72 * progress, 0, Math.PI * 2 * progress);
  ctx.stroke();

  // 12-Petal Lotus Mandala
  const petals = 12;
  const activePetals = Math.ceil(petals * progress);
  for (let i = 0; i < activePetals; i++) {
    const angle = (i / petals) * Math.PI * 2 + timeSec * 0.045 + state.camYaw * 0.3;
    ctx.save();
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(maxRadius * 0.22, 0);
    ctx.quadraticCurveTo(
      maxRadius * 0.62,
      -maxRadius * 0.22,
      maxRadius * 0.92 * progress,
      0
    );
    ctx.quadraticCurveTo(
      maxRadius * 0.62,
      maxRadius * 0.22,
      maxRadius * 0.22,
      0
    );

    ctx.fillStyle = `rgba(217, 107, 39, ${alpha * 0.16})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(245, 199, 107, ${alpha * 0.76})`;
    ctx.lineWidth = 1.3;
    ctx.stroke();

    if (progress > 0.7) {
      ctx.beginPath();
      ctx.arc(maxRadius * 0.98, 0, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 243, 209, ${alpha * 0.88})`;
      ctx.fill();
    }

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws 3D Rising Akashdeep Sky Lanterns sorted by 3D depth
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} revealAlpha
 * @param {number} timeSec
 */
function draw3DSkyLanterns(ctx, revealAlpha, timeSec) {
  if (revealAlpha <= 0.01) return;
  const sprite = getGlowSprite();
  const centerX = state.width * 0.5;
  const centerY = state.height * 0.45;

  ctx.save();
  for (let i = 0; i < skyLanterns3D.length; i++) {
    const l = skyLanterns3D[i];
    if (!state.reducedMotion) {
      l.y += l.vy;
      l.x += Math.sin(timeSec * 0.8 + l.phase) * l.swayAmp + state.windLean * 0.4;
      if (l.y < -state.height * 0.55) {
        l.y = state.height * 0.55;
        l.x = (Math.random() - 0.5) * state.width * 1.15;
      }
    }

    const proj = project3D(
      l.x,
      l.y,
      l.z,
      centerX,
      centerY,
      state.camYaw * 0.6,
      state.camPitch * 0.6
    );
    const w = l.width * proj.scale;
    const h = l.height * proj.scale;
    const alpha = revealAlpha * Math.min(1, proj.scale * 0.95);

    ctx.save();
    ctx.translate(proj.screenX, proj.screenY);
    ctx.rotate(Math.sin(timeSec * 1.3 + l.phase) * 0.06);
    ctx.globalAlpha = alpha;

    // Warm 3D volumetric glow sprite
    ctx.drawImage(sprite, -w * 1.8, -h * 1.2, w * 3.6, h * 2.8);

    // Sculpted 3D lantern paper cylinder body
    ctx.fillStyle = '#D96B27';
    ctx.strokeStyle = 'rgba(255, 243, 209, 0.65)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(-w * 0.42, -h * 0.48);
    ctx.quadraticCurveTo(0, -h * 0.62, w * 0.42, -h * 0.48);
    ctx.lineTo(w * 0.34, h * 0.45);
    ctx.quadraticCurveTo(0, h * 0.54, -w * 0.34, h * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner core flame illumination
    ctx.fillStyle = '#FFF3D1';
    ctx.beginPath();
    ctx.ellipse(0, h * 0.18, w * 0.18, h * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
  ctx.restore();
}

/**
 * Draws the articulated Human Celebrant in the courtyard blowing/lighting crackers:
 * - Holds a live sparkling Phuljhari (hand sparkler)
 * - Bends down to ignite a 3D Anaar (Golden Flowerpot Fountain Cracker)
 * - Spins a glowing 3D Chakri (Ground Wheel Cracker) on the courtyard floor
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} revealAlpha
 * @param {number} timeSec
 */
function drawHumanCelebrantWithCrackers(ctx, revealAlpha, timeSec) {
  if (revealAlpha <= 0.02) return;

  const sprite = getGlowSprite();
  const scale = Math.max(0.68, Math.min(1.08, state.width / 1280));

  // Position human character on the right-foreground courtyard terrace
  const humanX = state.width * 0.79 + state.camYaw * 36;
  const groundY = state.height * 0.84 + state.camPitch * 18;

  // Periodic cracker-lighting bend cycle (or active when user clicks "Blow Crackers")
  const autoCycle = Math.max(0, Math.sin(timeSec * 1.15 - 0.4));
  const isBoosted = timeSec < state.humanIgniteUntil;
  const igniteCycle = isBoosted ? 0.92 : Math.pow(autoCycle, 3) * 0.85;

  const pose = computeHumanPose(timeSec, igniteCycle);

  // Cracker positions on the courtyard floor in front of the human
  const anaarX = humanX + (pose.sparklerTip.x - 10) * scale;
  const anaarY = groundY + 4;
  const chakriX = anaarX - 58 * scale;
  const chakriY = groundY + 10;

  ctx.save();
  ctx.globalAlpha = Math.min(1, revealAlpha);

  // -------------------------------------------------------------------------
  // A. GROUND GLOW & 3D SPINNING CHAKRI (GROUND WHEEL CRACKER)
  // -------------------------------------------------------------------------
  ctx.drawImage(
    sprite,
    anaarX - 110 * scale,
    anaarY - 65 * scale,
    220 * scale,
    120 * scale
  );

  ctx.save();
  ctx.translate(chakriX, chakriY);
  ctx.scale(1, 0.38); // 3D floor foreshortening
  ctx.rotate(timeSec * 14);
  const chakriR = 22 * scale;
  ctx.strokeStyle = '#FFF3D1';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let arm = 0; arm < 6; arm++) {
    const a = (arm / 6) * Math.PI * 2;
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      Math.cos(a + 0.4) * chakriR * 0.6,
      Math.sin(a + 0.4) * chakriR * 0.6,
      Math.cos(a + 0.85) * chakriR,
      Math.sin(a + 0.85) * chakriR
    );
  }
  ctx.stroke();

  ctx.fillStyle = '#F5C76B';
  ctx.beginPath();
  ctx.arc(0, 0, 5 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // -------------------------------------------------------------------------
  // B. 3D ANAAR (FLOWERPOT FOUNTAIN CRACKER) & ERUPTING SPARK SHOWER
  // -------------------------------------------------------------------------
  const coneW = 14 * scale;
  const coneH = 26 * scale;

  ctx.save();
  ctx.translate(anaarX, anaarY);

  // Conical terracotta/gold foil Anaar body
  ctx.fillStyle = '#9A3B1E';
  ctx.strokeStyle = '#F5C76B';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-coneW * 0.25, -coneH);
  ctx.lineTo(coneW * 0.25, -coneH);
  ctx.lineTo(coneW, 0);
  ctx.quadraticCurveTo(0, 5 * scale, -coneW, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bright nozzle flare at top of Anaar
  const nozzlePulse = 0.85 + 0.25 * Math.sin(timeSec * 22);
  ctx.drawImage(
    sprite,
    -36 * scale * nozzlePulse,
    -coneH - 36 * scale * nozzlePulse,
    72 * scale * nozzlePulse,
    72 * scale * nozzlePulse
  );
  ctx.fillStyle = '#FFFDF8';
  ctx.beginPath();
  ctx.arc(0, -coneH, 4.2 * scale * nozzlePulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Spawn continuous 3D Anaar fountain sparks (denser when human ignites it)
  if (!state.reducedMotion) {
    const spawnCount = timeSec < state.anaarBoostUntil ? 4 : 2;
    for (let s = 0; s < spawnCount; s++) {
      const spread = (Math.random() - 0.5) * 0.56;
      const speed = (3.4 + Math.random() * 4.5) * scale;
      anaarSparks.push({
        x: anaarX + (Math.random() - 0.5) * 4,
        y: anaarY - coneH,
        vx: Math.sin(spread) * speed + state.windLean * 0.5,
        vy: -Math.cos(spread) * speed,
        size: (1.2 + Math.random() * 1.7) * scale,
        alpha: 0.98,
        decay: 0.022 + Math.random() * 0.015,
        color: Math.random() > 0.45 ? '#FFF3D1' : '#F5C76B',
      });
    }
  }

  // Update & render Anaar fountain sparks
  ctx.save();
  for (let i = anaarSparks.length - 1; i >= 0; i--) {
    const sp = anaarSparks[i];
    sp.x += sp.vx;
    sp.y += sp.vy;
    sp.vy += 0.18 * scale; // Gravity arc
    sp.vx *= 0.985;
    sp.alpha -= sp.decay;

    if (sp.y > groundY + 6) {
      sp.y = groundY + 6;
      sp.vy *= -0.35; // Bounce off courtyard floor
    }

    if (sp.alpha <= 0.02) {
      anaarSparks.splice(i, 1);
      continue;
    }

    ctx.globalAlpha = sp.alpha * revealAlpha;
    ctx.fillStyle = sp.color;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // -------------------------------------------------------------------------
  // C. ARTICULATED HUMAN CHARACTER IN TRADITIONAL FESTIVE KURTA
  // -------------------------------------------------------------------------
  ctx.save();
  ctx.translate(humanX, groundY);
  ctx.scale(scale, scale);

  // Soft floor shadow under human
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 28, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs / Churidar trousers
  ctx.strokeStyle = '#2A140B';
  ctx.lineWidth = 8.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  // Back leg
  ctx.moveTo(8, -34);
  ctx.lineTo(14, 0);
  // Front leg slightly bent
  ctx.moveTo(-6, -34);
  ctx.quadraticCurveTo(-14, -16, -10, 0);
  ctx.stroke();

  // Golden rim-highlight on front leg facing the cracker glow
  ctx.strokeStyle = 'rgba(245, 199, 107, 0.42)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-10, -34);
  ctx.quadraticCurveTo(-18, -16, -14, 0);
  ctx.stroke();

  // Torso (Festive Maroon-Gold Silk Kurta leaning forward with pose.torsoLean)
  ctx.save();
  ctx.translate(0, -32);
  ctx.rotate(-pose.torsoLean);

  const kurtaGrad = ctx.createLinearGradient(-22, -46, 20, 8);
  kurtaGrad.addColorStop(0, '#D96B27');
  kurtaGrad.addColorStop(0.45, '#7A2815');
  kurtaGrad.addColorStop(1, '#2B0D06');

  ctx.fillStyle = kurtaGrad;
  ctx.strokeStyle = 'rgba(245, 199, 107, 0.68)';
  ctx.lineWidth = 1.5;

  // Flowing Kurta silhouette
  ctx.beginPath();
  ctx.moveTo(-13, -44);
  ctx.quadraticCurveTo(0, -48, 13, -44);
  ctx.lineTo(19, 10);
  ctx.quadraticCurveTo(0, 14, -20, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Festive golden Angavastram / Dupatta collar trim
  ctx.strokeStyle = '#F5C76B';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-8, -44);
  ctx.quadraticCurveTo(-2, -26, 6, -10);
  ctx.stroke();

  // Head & warm facial profile illuminated by the cracker & sparkler
  ctx.save();
  ctx.translate(-2, -56);
  ctx.rotate(pose.torsoLean * 0.35);

  // Warm skin tone with golden rim light
  ctx.fillStyle = '#C67D4E';
  ctx.strokeStyle = '#FFF3D1';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(0, 0, 10.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Stylish dark hair top
  ctx.fillStyle = '#180D08';
  ctx.beginPath();
  ctx.arc(1.5, -2, 10.8, -Math.PI * 0.85, Math.PI * 0.25);
  ctx.fill();
  ctx.restore();

  ctx.restore(); // End torso rotation

  // Articulated Right Arm & Hand holding the blazing Phuljhari (Sparkler)
  ctx.strokeStyle = '#9E381C';
  ctx.lineWidth = 7.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pose.shoulder.x, pose.shoulder.y);
  ctx.lineTo(pose.elbow.x, pose.elbow.y);
  ctx.lineTo(pose.hand.x, pose.hand.y);
  ctx.stroke();

  // Golden sleeve cuff & warm hand
  ctx.strokeStyle = '#F5C76B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pose.shoulder.x, pose.shoulder.y);
  ctx.lineTo(pose.elbow.x, pose.elbow.y);
  ctx.stroke();

  ctx.fillStyle = '#DDA15E';
  ctx.beginPath();
  ctx.arc(pose.hand.x, pose.hand.y, 4.2, 0, Math.PI * 2);
  ctx.fill();

  // Phuljhari (Hand Sparkler Rod) extending from hand to sparklerTip
  ctx.strokeStyle = '#E5D3B3';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(pose.hand.x, pose.hand.y);
  ctx.lineTo(pose.sparklerTip.x, pose.sparklerTip.y);
  ctx.stroke();

  // Live Blazing Sparkler Core at tip
  const tipX = pose.sparklerTip.x;
  const tipY = pose.sparklerTip.y;
  ctx.drawImage(sprite, tipX - 34, tipY - 34, 68, 68);

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(tipX, tipY, 3.8, 0, Math.PI * 2);
  ctx.fill();

  // Radial star-sparksshooting off the Phuljhari tip
  ctx.strokeStyle = '#FFF3D1';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let r = 0; r < 8; r++) {
    const rayAngle = (r / 8) * Math.PI * 2 + timeSec * 19;
    const rayLen = 8 + (r % 2) * 7;
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(
      tipX + Math.cos(rayAngle) * rayLen,
      tipY + Math.sin(rayAngle) * rayLen
    );
  }
  ctx.stroke();

  ctx.restore(); // End human transform

  // Spawn & render trailing Phuljhari sparks in world space
  const worldTipX = humanX + tipX * scale;
  const worldTipY = groundY + tipY * scale;
  if (!state.reducedMotion) {
    for (let k = 0; k < 2; k++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 1.2 + Math.random() * 2.6;
      phuljhariSparks.push({
        x: worldTipX,
        y: worldTipY,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd - 0.4,
        alpha: 0.95,
        decay: 0.045 + Math.random() * 0.025,
      });
    }
  }

  ctx.save();
  ctx.fillStyle = '#FFF8E1';
  for (let i = phuljhariSparks.length - 1; i >= 0; i--) {
    const ps = phuljhariSparks[i];
    ps.x += ps.vx;
    ps.y += ps.vy;
    ps.vy += 0.08;
    ps.alpha -= ps.decay;
    if (ps.alpha <= 0.02) {
      phuljhariSparks.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = ps.alpha * revealAlpha;
    ctx.beginPath();
    ctx.arc(ps.x, ps.y, 1.4 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.restore();
}

/**
 * Draws a realistic, handcrafted traditional Indian clay diya & natural flickering flame
 */
function drawRealisticDiya(
  ctx,
  cx,
  cy,
  radiusScale,
  clayAlpha,
  flameLevel,
  timeSec,
  phaseOffset = 0
) {
  if (clayAlpha <= 0.01 && flameLevel <= 0.01) return;

  ctx.save();
  ctx.translate(cx + state.camYaw * 18, cy + state.camPitch * 10);

  const w = radiusScale;
  const h = radiusScale * 0.52;

  // 1. Soft ground shadow & warm golden floor reflection
  if (clayAlpha > 0.05) {
    const floorGlow = ctx.createRadialGradient(
      w * 0.15,
      h * 0.68,
      w * 0.05,
      0,
      h * 0.68,
      w * 1.45
    );
    const glowIntensity = flameLevel * 0.38 * clayAlpha;
    floorGlow.addColorStop(0, `rgba(245, 180, 75, ${glowIntensity})`);
    floorGlow.addColorStop(0.5, `rgba(185, 85, 28, ${glowIntensity * 0.4})`);
    floorGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = floorGlow;
    ctx.beginPath();
    ctx.ellipse(0, h * 0.68, w * 1.4, h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Sculpted Terracotta Clay Vessel Body
  if (clayAlpha > 0.01) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, clayAlpha);

    ctx.beginPath();
    ctx.ellipse(0, h * 0.56, w * 0.36, h * 0.13, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#2A0F07';
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 199, 107, 0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-w * 0.74, -h * 0.08);
    ctx.bezierCurveTo(
      -w * 0.72,
      h * 0.55,
      -w * 0.25,
      h * 0.62,
      0,
      h * 0.6
    );
    ctx.bezierCurveTo(
      w * 0.34,
      h * 0.58,
      w * 0.76,
      h * 0.36,
      w * 0.95,
      -h * 0.18
    );
    ctx.quadraticCurveTo(w * 0.4, h * 0.08, -w * 0.74, -h * 0.08);
    ctx.closePath();

    const litBoost = flameLevel * 0.28;
    const clayGrad = ctx.createLinearGradient(
      -w * 0.7,
      -h * 0.2,
      w * 0.9,
      h * 0.6
    );
    clayGrad.addColorStop(0, `rgb(${95 + litBoost * 75}, ${38 + litBoost * 35}, 20)`);
    clayGrad.addColorStop(0.55, `rgb(${138 + litBoost * 85}, ${58 + litBoost * 45}, 28)`);
    clayGrad.addColorStop(1, '#3A150A');

    ctx.fillStyle = clayGrad;
    ctx.fill();

    ctx.strokeStyle = `rgba(245, 199, 107, ${0.28 + flameLevel * 0.42})`;
    ctx.lineWidth = Math.max(1, w * 0.014);
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const t = (i / 60) * Math.PI * 2;
      const spoutPull = Math.exp(-Math.pow(Math.sin(t / 2), 2) * 6.5) * 0.24;
      const rx = w * (0.73 + spoutPull);
      const ry = h * 0.36;
      const px = Math.cos(t) * rx;
      const py = Math.sin(t) * ry - h * 0.08 - spoutPull * h * 0.25;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    const oilGrad = ctx.createRadialGradient(
      w * 0.35,
      -h * 0.12,
      w * 0.04,
      0,
      -h * 0.08,
      w * 0.75
    );
    oilGrad.addColorStop(
      0,
      flameLevel > 0.05
        ? `rgba(245, 175, 66, ${0.45 + flameLevel * 0.35})`
        : '#261008'
    );
    oilGrad.addColorStop(0.55, '#3E1A0D');
    oilGrad.addColorStop(1, '#1E0B05');

    ctx.fillStyle = oilGrad;
    ctx.fill();

    ctx.strokeStyle = `rgba(245, 199, 107, ${0.35 + flameLevel * 0.45})`;
    ctx.lineWidth = Math.max(1.2, w * 0.018);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w * 0.56, -h * 0.11);
    ctx.quadraticCurveTo(w * 0.78, -h * 0.18, w * 0.94, -h * 0.28);
    ctx.strokeStyle = flameLevel > 0.1 ? '#FCE5B4' : '#9E8568';
    ctx.lineWidth = Math.max(2, w * 0.032);
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();
  }

  // 3. Natural Multi-Layer Flickering Flame at the Wick Tip
  if (flameLevel > 0.01) {
    const wickX = w * 0.93;
    const wickY = -h * 0.27;

    const t = timeSec + phaseOffset;
    const wave =
      Math.sin(t * 5.4) * 0.06 +
      Math.sin(t * 12.1 + 1.2) * 0.035 +
      Math.cos(t * 18.7) * 0.018;
    const lean = (wave + state.windLean) * flameLevel;
    const stretch =
      (1 + Math.sin(t * 7.8) * 0.045 + Math.cos(t * 14.5) * 0.02) * flameLevel;

    const flameH = w * 0.72 * stretch;
    const flameW = w * 0.23 * Math.min(1, flameLevel * 1.15);

    ctx.save();
    ctx.translate(wickX, wickY);

    ctx.save();
    const haloRadius = w * (1.8 + Math.sin(t * 6.2) * 0.12) * flameLevel;
    const haloGrad = ctx.createRadialGradient(
      0,
      -flameH * 0.45,
      w * 0.04,
      0,
      -flameH * 0.45,
      haloRadius
    );
    haloGrad.addColorStop(0, `rgba(255, 235, 175, ${0.42 * flameLevel})`);
    haloGrad.addColorStop(0.3, `rgba(245, 165, 55, ${0.22 * flameLevel})`);
    haloGrad.addColorStop(0.65, `rgba(217, 95, 25, ${0.08 * flameLevel})`);
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, -flameH * 0.45, haloRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.rotate(lean);

    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.bezierCurveTo(
      -flameW * 1.25,
      -flameH * 0.22,
      -flameW * 0.85,
      -flameH * 0.72,
      lean * flameW * 0.9,
      -flameH
    );
    ctx.bezierCurveTo(
      flameW * 0.85,
      -flameH * 0.72,
      flameW * 1.25,
      -flameH * 0.22,
      0,
      2
    );
    ctx.closePath();

    const outerFlameGrad = ctx.createLinearGradient(0, 2, 0, -flameH);
    outerFlameGrad.addColorStop(0, 'rgba(217, 91, 22, 0.85)');
    outerFlameGrad.addColorStop(0.45, 'rgba(245, 170, 55, 0.95)');
    outerFlameGrad.addColorStop(0.9, 'rgba(255, 232, 158, 0.95)');
    outerFlameGrad.addColorStop(1, 'rgba(255, 250, 230, 0.2)');

    ctx.fillStyle = outerFlameGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      -flameW * 0.75,
      -flameH * 0.18,
      -flameW * 0.5,
      -flameH * 0.58,
      lean * flameW * 0.4,
      -flameH * 0.78
    );
    ctx.bezierCurveTo(
      flameW * 0.5,
      -flameH * 0.58,
      flameW * 0.75,
      -flameH * 0.18,
      0,
      0
    );
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 240, 185, 0.94)';
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, -flameH * 0.18, flameW * 0.32, flameH * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFDF8';
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws soft warm decorative festoon lights draped across the upper courtyard
 */
function drawWarmDecorativeLights(ctx, revealAlpha, timeSec) {
  if (revealAlpha <= 0.01) return;

  ctx.save();
  const strands = 3;
  for (let s = 0; s < strands; s++) {
    const startX = (s / strands) * state.width - 40;
    const endX = ((s + 1) / strands) * state.width + 40;
    const midX = (startX + endX) * 0.5 + state.camYaw * 16;
    const topY = 48 + (s % 2) * 14;
    const sagY = 108 + (s % 2) * 24 + state.camPitch * 12;

    ctx.beginPath();
    ctx.moveTo(startX, topY);
    ctx.quadraticCurveTo(midX, sagY, endX, topY);
    ctx.strokeStyle = `rgba(245, 199, 107, ${revealAlpha * 0.16})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    const bulbs = 7;
    for (let b = 1; b < bulbs; b++) {
      const t = b / bulbs;
      const bx =
        (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
      const by =
        (1 - t) * (1 - t) * topY + 2 * (1 - t) * t * sagY + t * t * topY;

      const pulse = 0.85 + 0.15 * Math.sin(timeSec * 3.1 + s * 2 + b);

      ctx.fillStyle = `rgba(245, 185, 80, ${revealAlpha * 0.12 * pulse})`;
      ctx.beginPath();
      ctx.arc(bx, by, 13 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(245, 199, 107, ${revealAlpha * 0.28 * pulse})`;
      ctx.beginPath();
      ctx.arc(bx, by, 6 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255, 245, 215, ${revealAlpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(bx, by, 2.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * Fast, sculptural distant courtyard diya renderer
 */
function drawCourtyardMiniatureDiya(ctx, cx, cy, w, alpha, timeSec, phase) {
  if (alpha <= 0.01) return;
  const h = w * 0.52;
  const t = timeSec + phase;
  const sway = (Math.sin(t * 5.8) * 0.08 + state.windLean) * alpha;
  const flameH = w * 0.68 * (0.94 + 0.06 * Math.sin(t * 8.2));
  const flameW = w * 0.22;
  const sprite = getGlowSprite();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = Math.min(1, alpha);

  ctx.drawImage(sprite, -w * 1.2, -h * 0.1, w * 2.5, h * 1.4);

  ctx.fillStyle = '#7A341C';
  ctx.strokeStyle = 'rgba(245, 199, 107, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-w * 0.72, -h * 0.06);
  ctx.quadraticCurveTo(0, h * 0.85, w * 0.9, -h * 0.15);
  ctx.quadraticCurveTo(0, h * 0.12, -w * 0.72, -h * 0.06);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const wx = w * 0.86;
  const wy = -h * 0.2;

  const haloR = w * 1.35;
  ctx.drawImage(
    sprite,
    wx - haloR,
    wy - flameH * 0.45 - haloR,
    haloR * 2,
    haloR * 2
  );

  ctx.fillStyle = '#F5B041';
  ctx.beginPath();
  ctx.moveTo(wx, wy);
  ctx.quadraticCurveTo(
    wx - flameW,
    wy - flameH * 0.45,
    wx + sway * w * 0.35,
    wy - flameH
  );
  ctx.quadraticCurveTo(wx + flameW, wy - flameH * 0.45, wx, wy);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#FFF8E1';
  ctx.beginPath();
  ctx.ellipse(wx, wy - flameH * 0.25, flameW * 0.36, flameH * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* ==========================================================================
   6. MAIN 60FPS 3D ANIMATION & RENDERING LOOP
   ========================================================================== */

let lastFireworkAutoTime = 0;

/**
 * @param {number} timestampMs
 */
function renderLoop(timestampMs) {
  const timeSec = timestampMs * 0.001;
  const canvas = /** @type {HTMLCanvasElement | null} */ (
    document.getElementById('cosmos-canvas')
  );
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.clearRect(0, 0, state.width, state.height);

  // Smooth 3D camera yaw/pitch & wind interpolation
  const targetYaw =
    state.normPointerX * 0.18 + Math.sin(timeSec * 0.45) * 0.05;
  const targetPitch =
    state.normPointerY * 0.12 + Math.cos(timeSec * 0.35) * 0.03;
  state.camYaw += (targetYaw - state.camYaw) * 0.08;
  state.camPitch += (targetPitch - state.camPitch) * 0.08;

  state.windLean += (state.pointerVx * 0.012 - state.windLean) * 0.08;
  state.pointerVx *= 0.9;

  // Apply smooth 3D perspective tilt to active DOM cards
  if (!state.reducedMotion) {
    const rotY = (state.camYaw * 24).toFixed(2);
    const rotX = (-state.camPitch * 22).toFixed(2);
    if (state.currentScene === 1) {
      const termWin = document.getElementById('terminal-window');
      if (termWin) {
        termWin.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }
    } else if (state.currentScene === 5) {
      const msgCard = document.getElementById('message-card');
      if (msgCard) {
        msgCard.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }
    }
  }

  const centerX = state.width * 0.5;
  const centerY = state.height * 0.54 + state.diyaVerticalOffset;
  const baseDiyaScale =
    Math.min(state.width, state.height) * 0.21 * state.worldZoom;

  // 1. SCENE 4 & 5: 3D Sky Lanterns, Decorative Festoon Lights & 3D Golden Dust
  if (state.worldReveal > 0.01) {
    draw3DSkyLanterns(ctx, state.worldReveal, timeSec);
    drawWarmDecorativeLights(ctx, state.worldReveal, timeSec);

    if (
      !state.reducedMotion &&
      timeSec - lastFireworkAutoTime > (state.currentScene === 4 ? 2.2 : 3.2)
    ) {
      lastFireworkAutoTime = timeSec;
      launchFirework();
    }

    // Update & render 3D perspective golden dust particles in a single batched path
    ctx.save();
    ctx.fillStyle = `rgba(245, 199, 107, ${0.52 * state.worldReveal})`;
    ctx.beginPath();
    for (let i = 0; i < goldenDustMotes.length; i++) {
      const m = goldenDustMotes[i];
      if (!state.reducedMotion) {
        m.y += m.vy;
        m.x += m.vx + Math.sin(timeSec * 1.2 + m.phase) * 0.22 + state.windLean * 0.8;
        if (m.y < -state.height * 0.6) {
          m.y = state.height * 0.6;
          m.x = (Math.random() - 0.5) * state.width * 1.2;
        }
      }
      const proj = project3D(
        m.x,
        m.y,
        m.z,
        centerX,
        centerY,
        state.camYaw,
        state.camPitch
      );
      const r = m.radius * proj.scale;
      ctx.moveTo(proj.screenX + r, proj.screenY);
      ctx.arc(proj.screenX, proj.screenY, r, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  }

  // 2. Render active 3D spherical fireworks
  if (fireworks.length > 0) {
    ctx.save();
    for (let i = fireworks.length - 1; i >= 0; i--) {
      const fw = fireworks[i];
      if (!fw.exploded) {
        fw.x += fw.vx;
        fw.y += fw.vy;
        fw.vy += 0.08;

        ctx.fillStyle = 'rgba(245, 199, 107, 0.9)';
        ctx.beginPath();
        ctx.arc(fw.x, fw.y, 2.2, 0, Math.PI * 2);
        ctx.fill();

        if (fw.y <= fw.targetY || fw.vy >= -0.5) {
          fw.exploded = true;
          const sparkCount = 44;
          for (let s = 0; s < sparkCount; s++) {
            // Spherical 3D Fibonacci-like distribution
            const phi = Math.acos(1 - (2 * (s + 0.5)) / sparkCount);
            const theta = Math.PI * (1 + Math.sqrt(5)) * s;
            const speed = 1.6 + Math.random() * 2.8;
            fw.sparks.push({
              x: fw.x,
              y: fw.y,
              z: 0,
              vx: Math.sin(phi) * Math.cos(theta) * speed,
              vy: Math.sin(phi) * Math.sin(theta) * speed,
              vz: Math.cos(phi) * speed,
              alpha: 0.98,
              decay: 0.015 + Math.random() * 0.01,
              color: fw.color,
              size: 1.4 + Math.random() * 1.3,
            });
          }
        }
      } else {
        for (let s = fw.sparks.length - 1; s >= 0; s--) {
          const sp = fw.sparks[s];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.z += sp.vz;
          sp.vx *= 0.962;
          sp.vy = sp.vy * 0.962 + 0.038;
          sp.vz *= 0.962;
          sp.alpha -= sp.decay;

          if (sp.alpha <= 0.01) {
            fw.sparks.splice(s, 1);
            continue;
          }

          const depthScale = Math.max(0.5, Math.min(1.45, 400 / (400 + sp.z)));
          ctx.globalAlpha = sp.alpha;
          ctx.fillStyle = sp.color;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size * depthScale, 0, Math.PI * 2);
          ctx.fill();
        }
        if (fw.sparks.length === 0) {
          fireworks.splice(i, 1);
        }
      }
    }
    ctx.restore();
  }

  // 3. SCENE 4 & 5: 3D Lotus Rangoli, Courtyard Diyas & Human Blowing Crackers
  if (state.rangoliProgress > 0.01) {
    drawLotusRangoli3D(
      ctx,
      centerX,
      centerY,
      baseDiyaScale,
      state.rangoliProgress,
      timeSec
    );
  }

  if (state.worldReveal > 0.01) {
    for (let i = 0; i < courtyardDiyas.length; i++) {
      const cd = courtyardDiyas[i];
      const dx = centerX + cd.normX * state.width + state.camYaw * (24 - cd.z * 0.08);
      const dy = cd.normY * state.height + state.camPitch * 12;
      const dScale = baseDiyaScale * cd.scale;
      drawCourtyardMiniatureDiya(
        ctx,
        dx,
        dy,
        dScale,
        state.worldReveal * cd.igniteAnim,
        timeSec,
        cd.phase
      );
    }

    // Render the Articulated Human Celebrant lighting/blowing crackers in the courtyard
    drawHumanCelebrantWithCrackers(ctx, state.worldReveal, timeSec);
  }

  // 4. SCENE 3, 4, 5: Main Central Clay Diya & Natural Flame
  if (state.diyaSolidAlpha > 0.01 || state.flameIgnition > 0.01) {
    drawRealisticDiya(
      ctx,
      centerX,
      centerY,
      baseDiyaScale,
      state.diyaSolidAlpha,
      state.flameIgnition,
      timeSec,
      0
    );
  }

  // 5. SCENE 2 & 3: 3D Code-to-Light Golden Particles (Batched for 60FPS performance)
  if (state.particleMode > 0.01) {
    ctx.save();
    ctx.fillStyle = `rgba(245, 199, 107, ${Math.min(1, state.particleMode * 0.92)})`;
    ctx.beginPath();

    const conv = state.particleConvergence;
    for (let i = 0; i < codeParticles.length; i++) {
      const p = codeParticles[i];
      const projTarget = project3D(
        p.normTx * baseDiyaScale,
        p.normTy * baseDiyaScale,
        p.normTz * baseDiyaScale,
        centerX,
        centerY,
        state.camYaw * 0.5,
        state.camPitch * 0.4
      );
      const targetX = projTarget.screenX;
      const targetY = projTarget.screenY;

      if (conv < 0.02) {
        const curlAngle =
          Math.sin(p.x * 0.01 + timeSec * 2.0 + p.phase) +
          Math.cos(p.y * 0.01 - timeSec * 1.6);
        p.vx += Math.cos(curlAngle) * 0.14;
        p.vy += Math.sin(curlAngle) * 0.14 - 0.04;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.x += p.vx;
        p.y += p.vy;
      } else {
        const spring = 0.035 + conv * 0.095;
        const turbScale = (1 - conv) * 1.4;
        const noiseAngle =
          Math.sin(p.x * 0.012 + timeSec * 2.2 + p.phase) +
          Math.cos(p.y * 0.012 - timeSec * 1.8);

        const dx = targetX - p.x;
        const dy = targetY - p.y;

        p.vx = (p.vx + dx * spring + Math.cos(noiseAngle) * turbScale) * 0.84;
        p.vy = (p.vy + dy * spring + Math.sin(noiseAngle) * turbScale) * 0.84;
        p.x += p.vx;
        p.y += p.vy;
      }

      const r = p.size * projTarget.scale;
      ctx.moveTo(p.x + r, p.y);
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    }

    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
  setTimeout(() => {
    requestAnimationFrame(renderLoop);
  }, 24);
}

/* ==========================================================================
   7. SCENE 1: REALISTIC DEVELOPER TERMINAL TYPING SEQUENCE
   ========================================================================== */

const TERMINAL_SCRIPT = [
  {
    prompt: '>',
    command: 'Initializing Diwali...',
    kind: 'plain',
    suffix: '',
  },
  {
    prompt: '>',
    command: 'Loading Happiness...',
    kind: 'progress',
    suffix: '██████████ 100%',
  },
  {
    prompt: '>',
    command: 'Removing Darkness...',
    kind: 'status',
    suffix: 'SUCCESS',
  },
  {
    prompt: '>',
    command: 'Installing Happiness...',
    kind: 'status',
    suffix: 'SUCCESS',
  },
  {
    prompt: '>',
    command: 'execute("SPREAD_LIGHT");',
    kind: 'execute',
    suffix: '',
  },
];

function renderTerminalCompletedInstant() {
  const container = document.getElementById('terminal-lines');
  if (!container) return;
  container.innerHTML = '';

  TERMINAL_SCRIPT.forEach((item, idx) => {
    const lineEl = document.createElement('div');
    lineEl.className =
      'terminal-line' + (item.kind === 'execute' ? ' terminal-execute' : '');

    const promptSpan = document.createElement('span');
    promptSpan.className = 'terminal-prompt';
    promptSpan.textContent = item.prompt;

    const textSpan = document.createElement('span');
    textSpan.className = 'terminal-text';
    textSpan.textContent = item.command;

    lineEl.appendChild(promptSpan);
    lineEl.appendChild(textSpan);

    if (item.kind === 'progress') {
      const progSpan = document.createElement('span');
      progSpan.className = 'terminal-progress';
      progSpan.textContent = item.suffix;
      lineEl.appendChild(progSpan);
    } else if (item.kind === 'status') {
      const statusSpan = document.createElement('span');
      statusSpan.className = 'terminal-status';
      statusSpan.textContent = item.suffix;
      lineEl.appendChild(statusSpan);
    }

    if (idx === TERMINAL_SCRIPT.length - 1) {
      const cursor = document.createElement('span');
      cursor.className = 'terminal-cursor';
      lineEl.appendChild(cursor);
    }

    container.appendChild(lineEl);
  });
}

/**
 * @param {number} runId
 * @param {() => void} onComplete
 */
async function runRealisticTerminalSequence(runId, onComplete) {
  const container = document.getElementById('terminal-lines');
  if (!container) return;
  container.innerHTML = '';

  /** @param {number} ms */
  const wait = (ms) =>
    new Promise((resolve) =>
      setTimeout(resolve, state.reducedMotion ? Math.min(ms, 15) : ms)
    );

  const cursor = document.createElement('span');
  cursor.className = 'terminal-cursor';

  for (let i = 0; i < TERMINAL_SCRIPT.length; i++) {
    if (state.typingRunId !== runId) return;
    const item = TERMINAL_SCRIPT[i];

    const lineEl = document.createElement('div');
    lineEl.className =
      'terminal-line' + (item.kind === 'execute' ? ' terminal-execute' : '');

    const promptSpan = document.createElement('span');
    promptSpan.className = 'terminal-prompt';
    promptSpan.textContent = item.prompt;

    const textSpan = document.createElement('span');
    textSpan.className = 'terminal-text';

    lineEl.appendChild(promptSpan);
    lineEl.appendChild(textSpan);
    lineEl.appendChild(cursor);
    container.appendChild(lineEl);

    await wait(150);

    for (let c = 0; c < item.command.length; c++) {
      if (state.typingRunId !== runId) return;
      const ch = item.command[c];
      textSpan.textContent += ch;
      soundEngine.playKeystroke(ch.charCodeAt(0));

      const variance = Math.sin(c * 1.7 + i * 2.3) * 12;
      const delay =
        ch === '.'
          ? 65 + variance
          : ch === '(' || ch === '"' || ch === ';'
            ? 52 + variance
            : 30 + variance;
      await wait(Math.max(15, delay));
    }

    if (item.kind === 'progress') {
      const progSpan = document.createElement('span');
      progSpan.className = 'terminal-progress';
      lineEl.insertBefore(progSpan, cursor);

      for (let step = 1; step <= 10; step++) {
        if (state.typingRunId !== runId) return;
        const filled = '█'.repeat(step) + '░'.repeat(10 - step);
        const pct = step * 10;
        progSpan.textContent = `${filled} ${pct}%`;
        soundEngine.playKeystroke(48 + step);
        await wait(42);
      }
    } else if (item.kind === 'status') {
      await wait(160);
      if (state.typingRunId !== runId) return;
      const statusSpan = document.createElement('span');
      statusSpan.className = 'terminal-status';
      statusSpan.textContent = item.suffix;
      lineEl.insertBefore(statusSpan, cursor);
      soundEngine.playSparkChime(520, 0.025);
    }

    await wait(210);
  }

  if (state.typingRunId === runId) {
    await wait(400);
    if (state.typingRunId === runId) {
      onComplete();
    }
  }
}

/* ==========================================================================
   8. STORYTELLING TIMELINE & SCENE TRANSITIONS
   ========================================================================== */

/**
 * Updates UI state and active scene layers
 * @param {number} sceneNum
 * @param {string} [kicker]
 * @param {string} [caption]
 */
function setSceneUIState(sceneNum, kicker = '', caption = '') {
  state.currentScene = sceneNum;
  document.body.setAttribute('data-scene', String(sceneNum));

  const stageEl = document.getElementById('experience-stage');
  if (stageEl) stageEl.setAttribute('data-scene', String(sceneNum));

  const terminalLayer = document.getElementById('terminal-layer');
  if (terminalLayer) {
    terminalLayer.style.display = sceneNum === 1 ? 'flex' : 'none';
  }

  const whisperEl = document.getElementById('narrative-whisper');
  const kickerEl = document.getElementById('whisper-kicker');
  const captionEl = document.getElementById('whisper-caption');
  if (whisperEl && kickerEl && captionEl) {
    if (caption && sceneNum >= 2 && sceneNum <= 4) {
      kickerEl.textContent = kicker;
      captionEl.textContent = caption;
      whisperEl.classList.add('is-visible');
    } else {
      whisperEl.classList.remove('is-visible');
    }
  }

  const msgStage = document.getElementById('message-stage');
  if (msgStage) {
    msgStage.classList.toggle('is-active', sceneNum === 5);
    msgStage.style.opacity = sceneNum === 5 ? '1' : '0';
  }

  const bloomEl = document.getElementById('ambient-bloom');
  if (bloomEl) {
    const levels = { 1: 0, 2: 0.25, 3: 0.65, 4: 1.0, 5: 1.0 };
    bloomEl.style.opacity = String(
      levels[/** @type {1|2|3|4|5} */ (sceneNum)] || 0
    );
  }
}

/**
 * Smoothly transitions to any scene (1..5).
 * @param {number} sceneNumber
 * @param {boolean} [autoAdvance]
 */
function goToScene(sceneNumber, autoAdvance = false) {
  const target = Math.max(1, Math.min(5, sceneNumber));
  state.typingRunId += 1;
  const currentRunId = state.typingRunId;

  const g = /** @type {any} */ (window).gsap;
  const terminalWindow = document.getElementById('terminal-window');
  const messageStage = document.getElementById('message-stage');

  if (target === 1) {
    state.particleMode = 0;
    state.particleConvergence = 0;
    state.diyaSolidAlpha = 0;
    state.flameIgnition = 0;
    state.worldZoom = 1.0;
    state.diyaVerticalOffset = 0;
    state.worldReveal = 0;
    state.rangoliProgress = 0;
    state.litDiyasCount = 1;

    if (terminalWindow) {
      terminalWindow.style.opacity = '1';
      terminalWindow.style.visibility = 'visible';
      terminalWindow.style.transform = 'scale(1)';
    }

    setSceneUIState(1);
    runRealisticTerminalSequence(currentRunId, () => {
      if (state.typingRunId === currentRunId) {
        goToScene(2, true);
      }
    });
    return;
  }

  renderTerminalCompletedInstant();
  sampleTerminalCharacterOrigins();

  if (target === 2) {
    setSceneUIState(
      2,
      'Code Transformation',
      'Syntax dissolves into 3D golden light, carried by a quiet current...'
    );
    soundEngine.playSparkChime(396, 0.04);

    if (g) {
      g.to(state, {
        particleMode: 1,
        particleConvergence: 0.55,
        diyaSolidAlpha: 0,
        flameIgnition: 0,
        worldReveal: 0,
        rangoliProgress: 0,
        worldZoom: 1.0,
        diyaVerticalOffset: 0,
        duration: 1.2,
        ease: 'power2.out',
      });
    } else {
      state.particleMode = 1;
      state.particleConvergence = 0.55;
      state.diyaSolidAlpha = 0;
      state.flameIgnition = 0;
      state.worldReveal = 0;
      state.rangoliProgress = 0;
      state.worldZoom = 1.0;
      state.diyaVerticalOffset = 0;
    }

    if (autoAdvance) {
      setTimeout(() => {
        if (state.typingRunId === currentRunId) goToScene(3, true);
      }, 2600);
    }
    return;
  }

  if (target === 3) {
    setSceneUIState(
      3,
      'Forming the Diya',
      'Particles of logic gather into an earthen vessel—and a single warm flame awakens.'
    );
    state.litDiyasCount = 1;
    soundEngine.playSparkChime(528, 0.055);

    const centerX = state.width * 0.5;
    const centerY = state.height * 0.54;
    const baseScale = Math.min(state.width, state.height) * 0.21;
    for (let i = 0; i < codeParticles.length; i++) {
      const p = codeParticles[i];
      p.x = centerX + p.normTx * baseScale * 1.15;
      p.y = centerY + p.normTy * baseScale * 1.15;
    }

    if (g) {
      g.to(state, {
        particleMode: 0.35,
        particleConvergence: 1,
        diyaSolidAlpha: 1,
        flameIgnition: 1,
        worldZoom: 1.0,
        diyaVerticalOffset: 0,
        worldReveal: 0,
        rangoliProgress: 0,
        duration: 1.1,
        ease: 'power2.out',
      });
    } else {
      state.particleMode = 0.35;
      state.particleConvergence = 1;
      state.diyaSolidAlpha = 1;
      state.flameIgnition = 1;
      state.worldZoom = 1.0;
      state.diyaVerticalOffset = 0;
      state.worldReveal = 0;
      state.rangoliProgress = 0;
    }

    if (autoAdvance) {
      setTimeout(() => {
        if (state.typingRunId === currentRunId) goToScene(4, true);
      }, 3100);
    }
    return;
  }

  if (target === 4) {
    setSceneUIState(
      4,
      'The World Lights Up',
      'A courtyard of 3D sky lanterns, lotus rangoli, and joyful crackers comes alive.'
    );
    state.litDiyasCount = 1 + courtyardDiyas.length;
    const nowSec = performance.now() * 0.001;
    state.humanIgniteUntil = nowSec + 2.2;
    state.anaarBoostUntil = nowSec + 3.6;

    launchFirework(state.width * 0.28, state.height * 0.22);
    launchFirework(state.width * 0.72, state.height * 0.2);
    soundEngine.playCrackerBurst();

    if (g) {
      g.to(state, {
        particleMode: 0.15,
        particleConvergence: 1,
        diyaSolidAlpha: 1,
        flameIgnition: 1,
        worldZoom: 0.78,
        diyaVerticalOffset: state.height * 0.06,
        rangoliProgress: 1,
        worldReveal: 1,
        duration: 1.2,
        ease: 'power2.out',
      });
    } else {
      state.particleMode = 0.15;
      state.particleConvergence = 1;
      state.diyaSolidAlpha = 1;
      state.flameIgnition = 1;
      state.worldZoom = 0.78;
      state.diyaVerticalOffset = state.height * 0.06;
      state.rangoliProgress = 1;
      state.worldReveal = 1;
    }

    if (autoAdvance) {
      setTimeout(() => {
        if (state.typingRunId === currentRunId) goToScene(5, false);
      }, 3600);
    }
    return;
  }

  if (target === 5) {
    setSceneUIState(5);
    state.litDiyasCount = 1 + courtyardDiyas.length;
    const nowSec = performance.now() * 0.001;
    state.humanIgniteUntil = nowSec + 2.5;
    state.anaarBoostUntil = nowSec + 4.0;

    launchFirework(state.width * 0.22, state.height * 0.18);
    launchFirework(state.width * 0.78, state.height * 0.18);
    soundEngine.playCrackerBurst();

    if (g) {
      g.to(state, {
        particleMode: 0.12,
        particleConvergence: 1,
        diyaSolidAlpha: 1,
        flameIgnition: 1,
        worldZoom: 0.68,
        diyaVerticalOffset: state.height * 0.22,
        rangoliProgress: 1,
        worldReveal: 1,
        duration: 1.0,
        ease: 'power2.out',
      });
    } else {
      state.particleMode = 0.12;
      state.particleConvergence = 1;
      state.diyaSolidAlpha = 1;
      state.flameIgnition = 1;
      state.worldZoom = 0.68;
      state.diyaVerticalOffset = state.height * 0.22;
      state.rangoliProgress = 1;
      state.worldReveal = 1;
    }

    if (messageStage) {
      messageStage.style.opacity = '1';
      messageStage.style.visibility = 'visible';
    }
  }
}

/* ==========================================================================
   9. INTERACTIVE EVENT HANDLERS & INITIALIZATION
   ========================================================================== */

function handleResize() {
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  const canvas = /** @type {HTMLCanvasElement | null} */ (
    document.getElementById('cosmos-canvas')
  );
  if (!canvas) return;
  canvas.width = state.width * state.dpr;
  canvas.height = state.height * state.dpr;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  }
}

function initExperience() {
  handleResize();
  initCanvasEntities();

  window.addEventListener('resize', handleResize);

  const unlockAudioOnce = () => {
    soundEngine.init();
    window.removeEventListener('pointerdown', unlockAudioOnce);
    window.removeEventListener('keydown', unlockAudioOnce);
  };
  window.addEventListener('pointerdown', unlockAudioOnce);
  window.addEventListener('keydown', unlockAudioOnce);

  // Pointer 3D camera parallax & wind draft physics
  const canvas = document.getElementById('cosmos-canvas');
  window.addEventListener('pointermove', (e) => {
    const dx = e.clientX - state.pointerX;
    state.pointerVx = Math.max(-35, Math.min(35, dx));
    state.pointerX = e.clientX;
    state.pointerY = e.clientY;
    state.normPointerX = (e.clientX / Math.max(1, state.width) - 0.5) * 2;
    state.normPointerY = (e.clientY / Math.max(1, state.height) - 0.5) * 2;
  });

  if (canvas) {
    canvas.addEventListener('pointerdown', (e) => {
      soundEngine.init();
      if (state.currentScene >= 3) {
        // Clicking near the right courtyard triggers the human cracker-blowing celebration
        if (e.clientX > state.width * 0.58 && e.clientY > state.height * 0.52) {
          triggerHumanCrackerCelebration();
        } else if (e.clientY < state.height * 0.56) {
          launchFirework(e.clientX, e.clientY);
          soundEngine.playCrackerBurst();
        } else {
          addCourtyardDiya(e.clientX, e.clientY);
        }
      }
    });
  }

  // Brand link resets to Scene 1
  const brandLink = document.getElementById('brand-reset-link');
  if (brandLink) {
    brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      goToScene(1);
    });
  }

  // Top Header "Blow Crackers" Button
  const topCrackersBtn = document.getElementById('top-crackers-btn');
  if (topCrackersBtn) {
    topCrackersBtn.addEventListener('click', () => {
      triggerHumanCrackerCelebration();
    });
  }

  // Sound / Mute Toggle Button
  const soundBtn = document.getElementById('sound-toggle-btn');
  const soundLabel = document.getElementById('sound-label');
  if (soundBtn && soundLabel) {
    soundBtn.addEventListener('click', () => {
      const isEnabled = soundEngine.toggle();
      soundBtn.setAttribute('aria-pressed', String(isEnabled));
      soundLabel.textContent = isEnabled ? 'Sound On' : 'Muted';
    });
  }

  // Replay Button in Scene 5
  const replayBtn = document.getElementById('replay-btn');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      soundEngine.init();
      initCanvasEntities();
      goToScene(1);
    });
  }

  // Celebrate / Blow Crackers & 3D Sky Lanterns Button in Scene 5
  const celebrateBtn = document.getElementById('celebrate-btn');
  if (celebrateBtn) {
    celebrateBtn.addEventListener('click', () => {
      triggerHumanCrackerCelebration();
      addCourtyardDiya();
    });
  }

  // Start 60FPS 3D Canvas Loop
  requestAnimationFrame(renderLoop);

  // Check URL query parameters (?scene=N or ?autostart=1)
  const params = new URLSearchParams(window.location.search);
  const sceneParam = Number(params.get('scene'));
  if (sceneParam >= 1 && sceneParam <= 5) {
    goToScene(sceneParam);
  } else if (params.get('autostart') === '1') {
    goToScene(5);
  } else {
    goToScene(1);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExperience);
} else {
  initExperience();
}
