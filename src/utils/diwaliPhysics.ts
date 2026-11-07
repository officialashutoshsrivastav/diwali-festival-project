/**
 * Pure mathematical, 3D projection, and physics functions for
 * "Officialashutoshsrivastav — A Developer's Diwali"
 */

export interface Point2D {
  x: number;
  y: number;
  layer?: 'bowl' | 'rim' | 'inner' | 'wick' | 'pedestal';
  colorWeight?: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface ProjectedPoint {
  screenX: number;
  screenY: number;
  scale: number;
  depth: number;
  visible: boolean;
}

export interface ParticleState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  alpha: number;
}

export interface FlameDraftState {
  leanAngle: number;
  stretchY: number;
  flickerIntensity: number;
}

export interface HumanPose {
  torsoLean: number;
  shoulderAngle: number;
  elbowAngle: number;
  sparklerTipX: number;
  sparklerTipY: number;
  isLightingCracker: boolean;
}

export const TERMINAL_COMMANDS = [
  { text: 'Initializing Diwali...', type: 'command', status: '' },
  { text: 'Loading Happiness...', type: 'progress', status: '██████████ 100%' },
  { text: 'Removing Darkness...', type: 'status', status: 'SUCCESS' },
  { text: 'Installing Happiness...', type: 'status', status: 'SUCCESS' },
  { text: 'execute("SPREAD_LIGHT");', type: 'execute', status: '' },
] as const;

export const SCENE_DEFINITIONS = [
  { id: 1, key: 'terminal', label: 'Terminal' },
  { id: 2, key: 'transform', label: 'Transformation' },
  { id: 3, key: 'diya', label: 'The Diya' },
  { id: 4, key: 'illumination', label: 'Illumination' },
  { id: 5, key: 'message', label: 'Message' },
] as const;

/**
 * Projects a 3D world point (x, y, z) through a rotatable 3D perspective camera
 * onto 2D screen coordinates with perspective foreshortening scale.
 */
export function project3DPoint(
  pt: Point3D,
  viewportW: number,
  viewportH: number,
  cameraYaw = 0,
  cameraPitch = 0,
  cameraDistance = 650,
  fov = 520
): ProjectedPoint {
  // Rotate around Y axis (yaw)
  const cosY = Math.cos(cameraYaw);
  const sinY = Math.sin(cameraYaw);
  const rx = pt.x * cosY - pt.z * sinY;
  const rz1 = pt.x * sinY + pt.z * cosY;

  // Rotate around X axis (pitch)
  const cosP = Math.cos(cameraPitch);
  const sinP = Math.sin(cameraPitch);
  const ry = pt.y * cosP - rz1 * sinP;
  const rz = pt.y * sinP + rz1 * cosP;

  const depth = cameraDistance + rz;
  if (depth <= 20) {
    return { screenX: viewportW * 0.5, screenY: viewportH * 0.5, scale: 0, depth, visible: false };
  }

  const scale = fov / depth;
  return {
    screenX: viewportW * 0.5 + rx * scale,
    screenY: viewportH * 0.54 + ry * scale,
    scale,
    depth,
    visible: true,
  };
}

/**
 * Computes the articulated human character's arm & sparkler kinematics as they
 * bend down to ignite ground crackers (Anaar fountains / rockets) and wave a Phuljhari sparkler.
 */
export function computeHumanCrackerPose(
  timeSec: number,
  igniteCycleProgress: number,
  baseX: number,
  baseY: number,
  scale = 1
): HumanPose {
  // igniteCycleProgress in [0, 1]: when between 0.15 and 0.55, human leans forward to light the cracker fuse
  const isLighting = igniteCycleProgress >= 0.15 && igniteCycleProgress <= 0.55;
  const bendFactor = isLighting
    ? Math.sin(((igniteCycleProgress - 0.15) / 0.4) * Math.PI)
    : 0;

  const idleWave = Math.sin(timeSec * 2.8) * 0.14;
  const torsoLean = 0.08 + bendFactor * 0.34;
  const shoulderAngle = -0.55 + bendFactor * 0.78 + idleWave * (1 - bendFactor);
  const elbowAngle = -0.35 + bendFactor * 0.45 + Math.cos(timeSec * 3.6) * 0.1;

  const shoulderX = baseX + Math.sin(torsoLean) * 34 * scale;
  const shoulderY = baseY - 92 * scale + Math.cos(torsoLean) * 8 * scale;

  const upperArmLen = 34 * scale;
  const forearmLen = 32 * scale;
  const sparklerLen = 28 * scale;

  const elbowX = shoulderX + Math.cos(shoulderAngle) * upperArmLen;
  const elbowY = shoulderY + Math.sin(shoulderAngle) * upperArmLen;

  const wristAngle = shoulderAngle + elbowAngle;
  const tipX = elbowX + Math.cos(wristAngle) * (forearmLen + sparklerLen);
  const tipY = elbowY + Math.sin(wristAngle) * (forearmLen + sparklerLen);

  return {
    torsoLean,
    shoulderAngle,
    elbowAngle,
    sparklerTipX: tipX,
    sparklerTipY: tipY,
    isLightingCracker: isLighting,
  };
}

/**
 * Computes realistic human typing delay (in ms) for a given character and index.
 */
export function computeTypingDelay(
  char: string,
  index: number,
  reducedMotion = false
): number {
  if (reducedMotion) return 8;
  const variance = Math.sin(index * 1.7 + char.charCodeAt(0) * 0.3) * 14;
  if (char === '.') return Math.round(95 + variance);
  if (char === '(' || char === ')' || char === '"' || char === ';') {
    return Math.round(68 + variance);
  }
  if (char === ' ' || char === '_') return Math.round(52 + variance);
  return Math.max(18, Math.round(42 + variance));
}

/**
 * Generates normalized 2D points representing a realistic sculpted Indian clay diya
 * in perspective view (centered at 0,0, width ~ [-1, 1], height ~ [-0.6, 0.6]).
 */
export function generateDiyaContourPoints(totalPoints: number): Point2D[] {
  const count = Math.max(20, Math.floor(totalPoints));
  const points: Point2D[] = [];

  for (let i = 0; i < count; i++) {
    const ratio = i / count;
    if (ratio < 0.38) {
      const t = (ratio / 0.38) * Math.PI * 2;
      const spoutPull = Math.exp(-Math.pow(Math.sin(t / 2), 2) * 6.5) * 0.24;
      const rx = 0.72 + spoutPull;
      const ry = 0.21;
      const x = Math.cos(t) * rx;
      const y = Math.sin(t) * ry - 0.04 - spoutPull * 0.14;
      points.push({ x, y, layer: 'rim', colorWeight: 0.9 });
    } else if (ratio < 0.78) {
      const u = (ratio - 0.38) / 0.4;
      const row = Math.floor(u * 5);
      const depth = (row + 1) / 5.5;
      const angle = (u * 5 - row) * Math.PI;
      const widthAtDepth = (0.72 - depth * 0.38) * (1 + (depth < 0.4 ? 0.08 : 0));
      const x = Math.cos(angle) * widthAtDepth;
      const y = 0.02 + Math.sin(angle) * (0.18 + depth * 0.26) + depth * 0.12;
      points.push({ x, y, layer: 'bowl', colorWeight: 0.6 - depth * 0.2 });
    } else if (ratio < 0.92) {
      const u = (ratio - 0.78) / 0.14;
      const t = u * Math.PI * 2;
      const rScale = 0.35 + (i % 3) * 0.1;
      const x = Math.cos(t) * 0.52 * rScale;
      const y = Math.sin(t) * 0.14 * rScale - 0.03;
      points.push({ x, y, layer: 'inner', colorWeight: 0.75 });
    } else {
      const u = (ratio - 0.92) / 0.08;
      const x = 0.68 + u * 0.26;
      const y = -0.07 - u * 0.14 - Math.pow(u, 2) * 0.05;
      points.push({ x, y, layer: 'wick', colorWeight: 1.0 });
    }
  }

  return points;
}

/**
 * Generates traditional geometric 12-petal lotus Rangoli coordinates around (0,0)
 * in normalized radius [-1, 1].
 */
export function generateRangoliPoints(petals = 12, samplesPerPetal = 16): Point2D[] {
  const safePetals = Math.max(4, petals);
  const safeSamples = Math.max(4, samplesPerPetal);
  const points: Point2D[] = [];

  for (let p = 0; p < safePetals; p++) {
    const baseAngle = (p / safePetals) * Math.PI * 2;
    for (let s = 0; s < safeSamples; s++) {
      const u = s / safeSamples;
      const theta = baseAngle + (u - 0.5) * ((Math.PI * 2) / safePetals);
      const petalTip = Math.sin(u * Math.PI);
      const r = 0.35 + 0.55 * Math.pow(petalTip, 0.85);
      points.push({
        x: Math.cos(theta) * r,
        y: Math.sin(theta) * r,
        colorWeight: petalTip,
      });
    }
  }
  return points;
}

/**
 * Advances a single golden particle one physics step toward its target position.
 */
export function stepParticlePhysics(
  particle: ParticleState,
  timeSec: number,
  springStrength = 0.045,
  turbulenceStrength = 0.35,
  damping = 0.88
): ParticleState {
  const dx = particle.tx - particle.x;
  const dy = particle.ty - particle.y;

  const noiseAngle =
    Math.sin(particle.x * 0.012 + timeSec * 1.8) +
    Math.cos(particle.y * 0.012 - timeSec * 1.4);
  const turbX = Math.cos(noiseAngle) * turbulenceStrength;
  const turbY = Math.sin(noiseAngle) * turbulenceStrength;

  const vx = (particle.vx + dx * springStrength + turbX) * damping;
  const vy = (particle.vy + dy * springStrength + turbY) * damping;

  return {
    ...particle,
    x: particle.x + vx,
    y: particle.y + vy,
    vx,
    vy,
  };
}

/**
 * Computes realistic natural flame flicker & cursor wind-draft lean parameters.
 */
export function computeFlameDynamics(
  timeSec: number,
  pointerVelocityX = 0,
  igniteProgress = 1
): FlameDraftState {
  const clampedIgnite = Math.max(0, Math.min(1, igniteProgress));
  const multiWave =
    Math.sin(timeSec * 5.2) * 0.06 +
    Math.sin(timeSec * 11.7 + 1.3) * 0.035 +
    Math.cos(timeSec * 19.1) * 0.018;

  const windLean = Math.max(-0.42, Math.min(0.42, pointerVelocityX * 0.015));
  const leanAngle = (multiWave + windLean) * clampedIgnite;

  const stretchWave =
    1 +
    (Math.sin(timeSec * 7.4) * 0.045 + Math.cos(timeSec * 14.3) * 0.025) *
      clampedIgnite;

  const flickerIntensity =
    clampedIgnite *
    (0.88 +
      0.12 *
        (0.5 + 0.5 * Math.sin(timeSec * 6.8 + Math.cos(timeSec * 13.2))));

  return {
    leanAngle,
    stretchY: stretchWave * clampedIgnite,
    flickerIntensity,
  };
}
