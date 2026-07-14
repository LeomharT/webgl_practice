attribute vec3 aPositionTarget;

uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

varying vec3 vColor;

#include <simplex3DNoise>

void main() {
    float noiseOrigin = snoise(position * 0.2);
    float noiseTarget = snoise(aPositionTarget * 0.2);

    float noise = mix(noiseOrigin, noiseTarget, uProgress);
    noise = noise * 0.5 + 0.5;

    float duration = 0.1;
    float delay    = (1.0 - duration) * noise;
    float end      = delay + duration;

    float progress = smoothstep(delay, end, uProgress);

    vec3 p = mix(
        position,
        aPositionTarget,
        progress
    );

    vec4 modelPosition      = modelMatrix * vec4(p, 1.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    gl_PointSize  = uSize * uResolution.y;
    gl_PointSize *= (1.0 / -viewPosition.z);

    // Varying
    vColor = vec3(noise);
}