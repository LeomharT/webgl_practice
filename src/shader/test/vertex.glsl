varying vec2 vUv;
varying vec4 vTextureUv;

uniform mat4 uTextureMatrix;

void main() {
    #include <begin_vertex>
    #include <project_vertex>

    // Varying
    vUv        = uv;
    vTextureUv = uTextureMatrix * vec4(position, 1.0);
}