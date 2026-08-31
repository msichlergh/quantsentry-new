"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec4 u_colors[8];
uniform int u_colors_length;
uniform float u_dispersionStrength;
uniform float u_edgeDisp;
uniform float u_ephemeralAmp;
uniform float u_lensRadius;
uniform float u_lensScale;
uniform float u_lensSpacingX;
uniform float u_lensSpacingY;
uniform float u_seed;
uniform float u_speed;

const int SAMPLES = 8;
const float EPHEMERAL_DRIP = 1.0;

uvec3 hash3(uvec3 v) {
  v = v * 1664525u + 1013904223u;
  v.x += v.y * v.z;
  v.y += v.z * v.x;
  v.z += v.x * v.y;
  v ^= v >> 16u;
  v.x += v.y * v.z;
  v.y += v.z * v.x;
  v.z += v.x * v.y;
  return v;
}

uvec3 seed;

vec3 random3f() {
  seed = hash3(seed);
  return vec3(seed) / float(-1u);
}

vec3 seedRandom(float seedVal) {
  uvec3 value = uvec3(
    floatBitsToUint(seedVal),
    floatBitsToUint(seedVal * 1.5 + 7.31),
    floatBitsToUint(seedVal * 2.7 + 13.37)
  );
  value = hash3(value);
  return vec3(value) / float(0xFFFFFFFFu);
}

vec3 getColor(int idx) {
  if (u_colors_length < 1) return vec3(0.0);
  int safeIdx = clamp(idx, 0, u_colors_length - 1);
  return u_colors[safeIdx].rgb;
}

vec3 paletteN(float value, int count) {
  if (count < 1) return vec3(0.0);
  if (count < 2) return getColor(0);
  value = clamp(value, 0.0, 1.0) * float(count - 1);
  int idx = min(int(floor(value)), count - 2);
  float localValue = fract(value);
  localValue = localValue * localValue * (3.0 - 2.0 * localValue);
  return mix(getColor(idx), getColor(idx + 1), localValue);
}

float getGradientT(vec2 uv, float time, vec3 seedOne, vec3 seedTwo) {
  float angleOne = seedOne.x * 6.28;
  float angleTwo = seedOne.y * 6.28;
  vec2 directionOne = vec2(cos(angleOne), sin(angleOne));
  vec2 directionTwo = vec2(cos(angleTwo), sin(angleTwo));
  float frequencyOne = 1.0 + seedOne.z * 2.0;
  float frequencyTwo = 1.0 + seedTwo.x * 1.5;
  float frequencyThree = 1.5 + seedTwo.y * 2.0;
  float flow = dot(uv, directionOne) + sin(dot(uv, directionTwo) * frequencyOne + time) * 0.3 + time * 0.2;
  float flowTwo = dot(uv, directionTwo.yx) + cos(dot(uv, directionOne.yx) * frequencyTwo - time * 0.8) * 0.25;
  float gradient = sin(flow * 1.5) * 0.5 + 0.5;
  gradient += cos(flowTwo * 1.2) * 1.3;
  gradient += sin(dot(uv, directionOne + directionTwo) * frequencyThree + time * 3.5) * 1.2;
  return smoothstep(0.0, 4.12, gradient);
}

void applyBandLens(vec2 point, float radiusSquared, float iorOffset, out vec2 warpedUv, out float edgeFactor) {
  vec2 lensPoint = point;
  float spacingX = max(u_lensSpacingX, 0.001);
  float spacingY = max(u_lensSpacingY, 0.001);
  lensPoint.x = fract(point.x / spacingX + 0.5) * spacingX - spacingX * 0.5;
  lensPoint.y = fract(point.y / spacingY + 0.5) * spacingY - spacingY * 0.5;
  float sphere = radiusSquared - lensPoint.x * lensPoint.x - lensPoint.y * lensPoint.y;
  float lensAmount = smoothstep(-0.1, 0.05, sphere);
  float baseLens = sqrt(max(sphere, -sphere * 0.1) / 0.3);
  edgeFactor = (1.0 - smoothstep(0.0, radiusSquared, sphere)) * lensAmount;
  float warpAmount = mix(1.0, baseLens * (1.0 + iorOffset), lensAmount);
  warpedUv = point;
  warpedUv.x += lensPoint.x * warpAmount - lensPoint.x;
  warpedUv.y *= warpAmount;
}

void main() {
  vec2 fragCoord = v_uv * u_resolution;
  seed = uvec3(uvec2(fragCoord), uint(fract(u_time) * 1000.0));
  vec2 resolution = u_resolution;
  vec2 point = (fragCoord * 2.0 - resolution) / resolution.y;
  float time = u_time * u_speed;
  int colorCount = u_colors_length;

  if (colorCount < 1) {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec3 seedOne = seedRandom(u_seed);
  vec3 seedTwo = seedRandom(u_seed + 100.0);
  float dice = random3f().x;
  float radiusSquared = u_lensRadius * u_lensRadius;
  vec3 iorOffsets = vec3(-1.0, 0.0, 1.0) * u_dispersionStrength;
  vec3 color = vec3(0.0);

  for (int sampleIndex = 0; sampleIndex < SAMPLES; sampleIndex++) {
    float ephemeral = (float(sampleIndex) + dice) / float(SAMPLES);
    float ephemeralSquared = ephemeral * ephemeral;
    vec2 samplePoint = point;
    samplePoint.x += u_ephemeralAmp * ephemeralSquared * sin(point.y * 2.0 + time);
    samplePoint.y += u_ephemeralAmp * ephemeralSquared * cos(point.x * 1.5 - time) * 0.5;
    samplePoint.y -= (1.0 - exp(-EPHEMERAL_DRIP * ephemeralSquared)) * abs(samplePoint.y) * sign(samplePoint.y) * 0.3;
    vec3 tint = smoothstep(1.0, 0.0, abs(3.0 * ephemeral - vec3(1.0, 1.5, 2.0)));
    vec3 gradientValues = vec3(0.0);
    vec3 edgeFactors = vec3(0.0);

    for (int channel = 0; channel < 3; channel++) {
      vec2 lensPoint = samplePoint * u_lensScale;
      vec2 warpedUv;
      float edgeFactor;
      applyBandLens(lensPoint, radiusSquared, iorOffsets[channel], warpedUv, edgeFactor);
      vec2 gradientUv = warpedUv / u_lensScale;
      gradientValues[channel] = getGradientT(gradientUv, time * 0.8, seedOne, seedTwo);
      edgeFactors[channel] = edgeFactor;
    }

    vec3 convergentColor = paletteN(gradientValues.g, colorCount);
    float edgeMix = max(max(edgeFactors.r, edgeFactors.g), edgeFactors.b);
    vec3 dispersedColor = vec3(
      paletteN(gradientValues.r, colorCount).r,
      convergentColor.g,
      paletteN(gradientValues.b, colorCount).b
    );
    vec3 finalColor = mix(convergentColor, dispersedColor, edgeMix * 2.0);
    vec3 rainbow = (gradientValues - gradientValues.g) * 3.0;
    finalColor += rainbow * edgeMix * u_edgeDisp;
    color += tint * finalColor * (3.0 / float(SAMPLES));
  }

  fragColor = vec4(color, 1.0);
}
`;

const POSITIONS = new Float32Array([
  -1, -1,
  1, -1,
  -1, 1,
  -1, 1,
  1, -1,
  1, 1,
]);

const COLORS = new Float32Array([
  9 / 255, 9 / 255, 11 / 255, 1,
  34 / 255, 211 / 255, 238 / 255, 1,
  5 / 255, 6 / 255, 8 / 255, 1,
]);

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGL2RenderingContext) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertexShader || !fragmentShader) {
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

export function DispersionBandsCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      powerPreference: "default",
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const program = createProgram(gl);
    if (!program) return;

    const buffer = gl.createBuffer();
    const positionLocation = gl.getAttribLocation(program, "a_position");
    if (!buffer || positionLocation < 0) {
      if (buffer) gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, POSITIONS, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(program);
    gl.clearColor(0, 0, 0, 0);

    const uniforms = {
      time: gl.getUniformLocation(program, "u_time"),
      resolution: gl.getUniformLocation(program, "u_resolution"),
      colors: gl.getUniformLocation(program, "u_colors[0]"),
      colorCount: gl.getUniformLocation(program, "u_colors_length"),
      dispersion: gl.getUniformLocation(program, "u_dispersionStrength"),
      edges: gl.getUniformLocation(program, "u_edgeDisp"),
      ephemeral: gl.getUniformLocation(program, "u_ephemeralAmp"),
      radius: gl.getUniformLocation(program, "u_lensRadius"),
      scale: gl.getUniformLocation(program, "u_lensScale"),
      spacingX: gl.getUniformLocation(program, "u_lensSpacingX"),
      spacingY: gl.getUniformLocation(program, "u_lensSpacingY"),
      seed: gl.getUniformLocation(program, "u_seed"),
      speed: gl.getUniformLocation(program, "u_speed"),
    };

    gl.uniform4fv(uniforms.colors, COLORS);
    gl.uniform1i(uniforms.colorCount, 3);
    gl.uniform1f(uniforms.dispersion, 0);
    gl.uniform1f(uniforms.edges, 5);
    gl.uniform1f(uniforms.ephemeral, 0);
    gl.uniform1f(uniforms.radius, 0.1);
    gl.uniform1f(uniforms.spacingX, 0.4);
    gl.uniform1f(uniforms.spacingY, 0.01);
    gl.uniform1f(uniforms.seed, 748);
    gl.uniform1f(uniforms.speed, 0.25);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;
    let visible = true;

    const render = (time: number) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uniforms.time, time);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    // The shader normalises coordinates by height, so a narrow viewport fits far
    // fewer bands across its width and the field reads as zoomed in. Scaling the
    // lens by how much narrower the canvas is than the reference aspect keeps the
    // texture at a consistent size. The reference is the canvas aspect this was
    // tuned against at desktop, so wide screens land back on exactly 15; the max
    // keeps phones from turning into a busy moire.
    const REFERENCE_ASPECT = 1.22;
    const BASE_LENS_SCALE = 15;
    const MAX_LENS_SCALE = 30;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const resolutionScale = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
      const width = Math.max(1, Math.round(rect.width * resolutionScale));
      const height = Math.max(1, Math.round(rect.height * resolutionScale));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const aspect = rect.height > 0 ? rect.width / rect.height : REFERENCE_ASPECT;
      const lensScale = Math.min(
        MAX_LENS_SCALE,
        Math.max(BASE_LENS_SCALE, (BASE_LENS_SCALE * REFERENCE_ASPECT) / Math.max(aspect, 0.01)),
      );
      gl.uniform1f(uniforms.scale, lensScale);

      if (reducedMotion) render(5.5);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "100px" },
    );
    intersectionObserver.observe(canvas);

    const frame = (time: number) => {
      if (visible) render(time / 1000);
      animationFrame = requestAnimationFrame(frame);
    };

    if (!reducedMotion) animationFrame = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="hero-aurora-canvas" />;
}

export function HeroAurora({ targetId }: { targetId: string }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(`#${targetId} > section.hero:first-child`);
    if (!hero) return;

    hero.classList.add("signal-field-hero");
    const visualTarget = hero.querySelector<HTMLElement>("[data-hero-visual-root]") ?? hero;
    const frame = requestAnimationFrame(() => setTarget(visualTarget));

    return () => {
      cancelAnimationFrame(frame);
      hero.classList.remove("signal-field-hero");
    };
  }, [targetId]);

  if (!target) return null;

  return createPortal(
    <div className="hero-aurora" aria-hidden="true">
      <DispersionBandsCanvas />
    </div>,
    target,
  );
}
