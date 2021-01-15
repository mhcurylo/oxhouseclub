const fs = `#version 300 es
precision mediump float;

uniform mediump vec2 u_resolution;
uniform mediump float u_time;
uniform mediump float u_scroll;
in vec2 v_position;

out vec4 outColor;

float minus(float a, float b) {
  return a * abs(b -1.);
}

void main() {
  vec2 ipos = v_position / vec2(u_resolution.y/u_resolution.x,1);
  ipos *= 2.0;
  vec2 pos = ipos;
  pos.y += u_scroll*0.0025;
  pos = fract(pos);
  pos -= 0.5;

  float c1 = step(0.31, distance(pos, vec2(0)));

  vec2 pos2 = ipos;
  pos2 *= 1.025;
  pos2.y += u_scroll*0.00125+sin(u_time*0.001)*0.35;
  pos2.x += u_time*0.0015;
  pos2 = fract(pos2);
  pos2 -= 0.5;

  float c2 = minus(abs(step(0.205, distance(pos2, vec2(0)))-1.),c1);

  float b = minus(1., c1+c2);

  outColor = vec4(c1,c2,b,1.);
}
`
const vs = `#version 300 es

uniform mediump vec2 u_resolution;
in vec2 a_position;

out vec2 v_position;

void main() {
  vec2 zeroToOne = a_position;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;
  v_position = clipSpace;
  gl_Position = vec4(clipSpace, 0, 1);
}
`
const canvas = document.getElementById("bckg");
const webGl = canvas.getContext("webgl2");

if (!webGl) { 
  console.log("No WebGl2!"); 
} else { 
  runWebGl(webGl);
};

function fail() {
  throw "Background refuses to work."
}

function createShader(gl, t, s) {
  const shader = gl.createShader(t);
  if (shader) {
    gl.shaderSource(shader, s);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      console.log(gl.getShaderInfoLog(shader));
      fail();
    };
  } else {fail();};
  return shader;
}

function runWebGl(gl) {
  let time = 0;
  const vshader = createShader(gl, gl.VERTEX_SHADER, vs);
  const fshader = createShader(gl, gl.FRAGMENT_SHADER, fs);

  const program = gl.createProgram();

  if (program) {
    gl.attachShader(program, vshader);
    gl.attachShader(program, fshader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
      console.log(gl.getProgramInfoLog(program));
      fail();
    };
  } else {fail();};

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [
    -1.0,  1.0,
     1.0,  1.0,
    -1.0, -1.0,
     1.0, -1.0,
  ];


  gl.bufferData(gl.ARRAY_BUFFER,
     new Float32Array(positions),
     gl.DYNAMIC_DRAW);

  const numComponents = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, numComponents, type, normalize, stride, offset);

  const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  const timeUniformLocation = gl.getUniformLocation(program, "u_time");
  const scrollUniformLocation = gl.getUniformLocation(program, "u_scroll");

  gl.useProgram(program);

  updateResolution();
  
  window.onscroll = step;

  const ro = new ResizeObserver(updateResolution);
  ro.observe(document.querySelector("body"));

  function step() {
    time += 1;
    const y = window.scrollY;
  
    gl.uniform1f(scrollUniformLocation, window.scrollY);
    gl.uniform1f(timeUniformLocation, time);
    redraw();
  }

  function updateResolution() {
    gl.canvas.width  = window.innerWidth;
    gl.canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(scrollUniformLocation, window.scrollY);
    redraw();
  }

  function redraw () {
    gl.clearColor(1,1,1,0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, 4);
  };
};


