#version 300 es

#define SHADER_NAME Sprite

uniform mat4 u_matrix;

out vec2 v_texcoord;

in vec4 position;

void main() {
    v_texcoord = position.xy;
    gl_Position = u_matrix * position;
}