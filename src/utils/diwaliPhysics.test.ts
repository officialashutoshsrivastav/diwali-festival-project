import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TERMINAL_COMMANDS,
  SCENE_DEFINITIONS,
  computeTypingDelay,
  generateDiyaContourPoints,
  generateRangoliPoints,
  stepParticlePhysics,
  computeFlameDynamics,
  project3DPoint,
  computeHumanCrackerPose,
} from './diwaliPhysics';

test('terminal commands match all five required story prompts', () => {
  assert.equal(TERMINAL_COMMANDS.length, 5);
  assert.equal(TERMINAL_COMMANDS[0].text, 'Initializing Diwali...');
  assert.equal(TERMINAL_COMMANDS[1].status, '██████████ 100%');
  assert.equal(TERMINAL_COMMANDS[2].status, 'SUCCESS');
  assert.equal(TERMINAL_COMMANDS[3].status, 'SUCCESS');
  assert.equal(TERMINAL_COMMANDS[4].text, 'execute("SPREAD_LIGHT");');
});

test('scene definitions cover all 5 story chapters in order', () => {
  assert.equal(SCENE_DEFINITIONS.length, 5);
  assert.deepEqual(
    SCENE_DEFINITIONS.map((s) => s.id),
    [1, 2, 3, 4, 5]
  );
});

test('computeTypingDelay produces varied human-like cadence and respects reducedMotion', () => {
  const normalA = computeTypingDelay('I', 0, false);
  const normalDot = computeTypingDelay('.', 5, false);
  const reduced = computeTypingDelay('I', 0, true);

  assert.equal(reduced, 8);
  assert.ok(normalA >= 18 && normalA <= 70, `Expected normal char delay in range, got ${normalA}`);
  assert.ok(normalDot > normalA, 'Punctuation should have a slightly longer contemplative pause');
});

test('generateDiyaContourPoints generates bounded points across rim, bowl, inner, and wick layers', () => {
  const pts = generateDiyaContourPoints(200);
  assert.equal(pts.length, 200);

  const layers = new Set(pts.map((p) => p.layer));
  assert.ok(layers.has('rim'));
  assert.ok(layers.has('bowl'));
  assert.ok(layers.has('inner'));
  assert.ok(layers.has('wick'));

  for (const pt of pts) {
    assert.ok(Number.isFinite(pt.x) && Number.isFinite(pt.y));
    assert.ok(pt.x >= -1.2 && pt.x <= 1.2, `x out of bounds: ${pt.x}`);
    assert.ok(pt.y >= -0.8 && pt.y <= 0.8, `y out of bounds: ${pt.y}`);
  }
});

test('generateRangoliPoints produces symmetric lotus petal geometry', () => {
  const pts = generateRangoliPoints(12, 10);
  assert.equal(pts.length, 120);
  for (const pt of pts) {
    const r = Math.hypot(pt.x, pt.y);
    assert.ok(r >= 0.3 && r <= 0.95, `Radius out of expected lotus ring: ${r}`);
  }
});

test('stepParticlePhysics converges particles smoothly toward target diya coordinates', () => {
  let p = { x: 0, y: 0, vx: 0, vy: 0, tx: 100, ty: -50, alpha: 1 };
  const initialDist = Math.hypot(p.tx - p.x, p.ty - p.y);

  for (let step = 0; step < 30; step++) {
    p = stepParticlePhysics(p, step * 0.016, 0.06, 0.1, 0.85);
  }

  const finalDist = Math.hypot(p.tx - p.x, p.ty - p.y);
  assert.ok(finalDist < initialDist * 0.25, `Particle did not converge: ${finalDist} vs ${initialDist}`);
});

test('computeFlameDynamics responds to ignition state and wind draft velocity', () => {
  const unlit = computeFlameDynamics(1.0, 0, 0);
  assert.equal(unlit.stretchY, 0);
  assert.equal(unlit.flickerIntensity, 0);

  const litCalm = computeFlameDynamics(1.5, 0, 1);
  assert.ok(litCalm.stretchY > 0.9 && litCalm.stretchY < 1.1);
  assert.ok(litCalm.flickerIntensity >= 0.85 && litCalm.flickerIntensity <= 1.0);

  const litWindRight = computeFlameDynamics(1.5, 25, 1);
  assert.ok(litWindRight.leanAngle > litCalm.leanAngle, 'Wind to the right should lean flame positively');
});

test('project3DPoint applies perspective scaling and camera rotation', () => {
  const near = project3DPoint({ x: 100, y: 50, z: -150 }, 640, 360, 0, 0, 600);
  const far = project3DPoint({ x: 100, y: 50, z: 300 }, 640, 360, 0, 0, 600);

  assert.equal(near.visible, true);
  assert.equal(far.visible, true);
  assert.ok(near.scale > far.scale, `Near point should have larger perspective scale (${near.scale} vs ${far.scale})`);
});

test('computeHumanCrackerPose leans torso and lowers sparkler toward ground cracker during ignition', () => {
  const upright = computeHumanCrackerPose(0, 0, 500, 600);
  const igniting = computeHumanCrackerPose(1.0, 0.35, 500, 600);

  assert.equal(upright.isLightingCracker, false);
  assert.equal(igniting.isLightingCracker, true);
  assert.ok(igniting.torsoLean > upright.torsoLean, 'Torso should lean forward when igniting cracker');
  assert.ok(igniting.sparklerTipY > upright.sparklerTipY, 'Sparkler tip should lower toward ground cracker when igniting');
});

