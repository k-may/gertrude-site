#version 300 es

in vec4 position;

uniform mat4 u_matrix;

out float vAlpha;

 void main() {
   vAlpha = step( length(position.xy), 0.);
   gl_Position = u_matrix * position;
 }