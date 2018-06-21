#version 300 es
precision mediump float;

uniform sampler2D u_texture;

in vec2 v_texcoord;

out vec4 outColor;

void main() {

    vec2 coord = v_texcoord;
    vec2 v = coord - vec2(0.5);
    v *= -0.1;
    outColor = mix(vec4(0,0,0,.4),texture(u_texture, coord + v ), 0.7);

}