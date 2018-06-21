#version 300 es
precision mediump float;

#define SHADER_NAME BlurBuffer

vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.411764705882353) * direction;
  vec2 off2 = vec2(3.2941176470588234) * direction;
  vec2 off3 = vec2(5.176470588235294) * direction;
  color += texture(image, uv) * 0.1964825501511404;
  color += texture(image, uv + (off1 / resolution)) * 0.2969069646728344;
  color += texture(image, uv - (off1 / resolution)) * 0.2969069646728344;
  color += texture(image, uv + (off2 / resolution)) * 0.09447039785044732;
  color += texture(image, uv - (off2 / resolution)) * 0.09447039785044732;
  color += texture(image, uv + (off3 / resolution)) * 0.010381362401148057;
  color += texture(image, uv - (off3 / resolution)) * 0.010381362401148057;
  return color;
}

uniform sampler2D u_texture;
uniform vec2 u_direction;
uniform vec2 u_resolution;
in vec2 v_texcoord;
out vec4 color;
uniform bool u_flip;

void main() {

    vec2 res = vec2(textureSize(u_texture, 1));
    vec2 uv = v_texcoord;
    if (u_flip) {
         uv.y = 1.0 - uv.y;
    }
    color = blur13(u_texture, uv, u_resolution, u_direction);
}
