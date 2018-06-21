#version 300 es

precision mediump float;

uniform sampler2D u_texture;

in vec4 texcoord;

out vec4 color;

void main() {
   color = vec4(1,0,0,1);
}
