#version 300 es

in vec4 position;

out vec2 v_texcoord;

uniform mat4 u_matrix;

void main() {
    v_texcoord = position.xy;
    gl_Position = u_matrix * position;
}
