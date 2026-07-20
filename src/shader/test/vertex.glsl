attribute vec3 aPositionTarget;

uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;
uniform vec3 uColorA;
uniform vec3 uColorB;

varying vec3 vColor;

#include <simplex3DNoise>

void main() {
    float noiseO = snoise(position * 0.2);
    float noiseT = snoise(aPositionTarget * 0.2);

    float noise = mix(noiseO, noiseT, uProgress);
          noise = (noise + 1.0) / 2.0;

    float duration = 0.4;
    float delay    = (1.0 - duration) * noise;
    float end      = duration + delay;
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

    gl_PointSize  = uSize * uResolution.y;
    gl_PointSize *= 1.0 / -viewPosition.z;

    vColor = mix(uColorA, uColorB, noise);
}