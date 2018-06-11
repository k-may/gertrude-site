#version 300 es
precision mediump float;

in vec2 v_texCoord;
in float v_color;

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
  // Just set the output to a constant redish-purple
  outColor =texture(u_texture, v_texCoord);
}