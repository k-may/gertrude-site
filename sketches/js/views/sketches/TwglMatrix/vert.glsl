#version 300 es
uniform mat4 u_worldViewProjection;
uniform mat4 u_world;

in vec4 position;
in vec2 texcoord;

out vec4 v_position;
out vec2 v_texCoord;

void main() {
  v_texCoord = texcoord;
  gl_Position = u_worldViewProjection * position;
}