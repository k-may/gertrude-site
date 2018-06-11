#version 300 es
precision mediump float;

in vec4 v_position;
in vec2 v_texCoord;

uniform vec4 u_diffuseMult;
uniform sampler2D u_diffuse;

out vec4 outColor;

void main() {
  vec4 diffuseColor = texture(u_diffuse, v_texCoord) * u_diffuseMult;
  if (diffuseColor.a < 0.1) {
    discard;
  }
  outColor = diffuseColor;
  outColor.rbg *= outColor.a;

}