precision mediump float;

varying float lighting;

void main() {
    vec3 color = vec3(0,1,0);

    color *= lighting;

    gl_FragColor = vec4(color,1);
}