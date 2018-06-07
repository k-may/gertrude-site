#version 300 es
in vec4 position;
in vec2 texcoord;

out vec2 v_texCoord;

void main() {
  v_texCoord = texcoord;
  gl_Position = position;
}