#version 300 es

precision mediump float;

uniform sampler2D u_texture;

in vec2 v_texcoord;

out vec4 color;

void main() {
    color = texture(u_texture, v_texcoord);

    if(color.a < 0.1)
        discard;
    //color = vec4(1,0,0,1);
}
