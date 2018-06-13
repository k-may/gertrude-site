#version 300 es
precision mediump float;

out vec4 outColor;

in float vAlpha;

void main() {
  // Just set the output to a constant redish-purple
  outColor = vec4(1, 1, 1, vAlpha);
}