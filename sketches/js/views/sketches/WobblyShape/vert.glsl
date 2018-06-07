#version 300 es

in vec4 position;
in float color;

out float vColor;

void main() {
  vColor = color;
  gl_Position = vec4(position.xyz, 1);
}