attribute vec3 aVertexPosition;
attribute vec3 aNormalDirection;

uniform mat4 projMat;
uniform mat4 camMvMat;
uniform mat4 camRotMat;

uniform mat4 objMvMat;

uniform vec3 light_direction;

varying float lighting;

void main() {
    gl_Position = projMat * camRotMat * camMvMat * objMvMat * vec4(aVertexPosition, 1);
    //gl_Position.z *= 0.01;

    lighting = dot(normalize(vec4(aNormalDirection, 1) * camRotMat).xyz, light_direction) / 2. + 0.5;
}