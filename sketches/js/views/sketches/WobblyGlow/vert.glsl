#version 300 es

in vec4 position;

out float vAlpha;

 void main() {

    vAlpha = distance(position.xy, vec2(0,0));

   gl_Position = position;
 }