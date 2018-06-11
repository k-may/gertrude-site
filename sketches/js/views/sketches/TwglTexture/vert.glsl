#version 300 es
in vec4 position;
in vec2 texcoord;
in float color;

out vec2 v_texCoord;
out float v_color;

void main() {
  v_texCoord = texcoord;
  gl_Position = position;
}