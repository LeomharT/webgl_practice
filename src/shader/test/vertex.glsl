attribute vec3 aPositionTarget;
attribute float aSize;

uniform float uSize;
uniform float uProgress;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;

varying vec2 vUv;
varying vec3 vColor;

#include <simplex3DNoise>

void main() {
    float noise = snoise(position * 0.5);
    noise = noise * 0.5 + 0.5;

    float duration = 0.1;
    float delay = (1.0 - duration) * noise;
    float end = delay + duration;

    float progress = smoothstep(delay, end, uProgress);

    vec3 p = mix(
        position,
        aPositionTarget,
        progress
    );

    vec4 modelPosition = modelMatrix * vec4(p, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    gl_PointSize  = uSize * uResolution.y * aSize;
    gl_PointSize *= 1.0 / -viewPosition.z;

    // Varying
    vUv = uv;
    vColor = mix(uColorA, uColorB, noise);
}