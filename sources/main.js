//Code used for setup

//Declares Constants
const numParticles = 4e4;
const particleRes = Math.ceil(Math.sqrt(numParticles));
var consts  = [
  parseFloat(document.getElementById("angleofattack").value)*Math.PI/180, // 0 - alpha
  parseFloat(document.getElementById('lengthtxtbox').value),              // 1 - a
  parseFloat(document.getElementById('speedtxtbox').value),               // 2 - U
  document.getElementById('transformswitch').checked,                     // 3 - joukowski
  parseFloat(document.getElementById('controlx').value),                  // 4 - ctrlx
  parseFloat(document.getElementById('controly').value),                  // 5 - ctrly
  document.getElementById('kuttaswitch').checked,                         // 6 - kutta
  0,                                                                      // 7 - gamma
  parseFloat(document.getElementById('xmin').value),                      // 8 - xmin
  parseFloat(document.getElementById('xmax').value),                      // 9 - xmax
  parseFloat(document.getElementById('ymin').value),                      // 10 - ymin
  parseFloat(document.getElementById('ymax').value),                      // 11 - ymax
  document.getElementById("flowwindow").offsetWidth,                      // 12 - width
  document.getElementById("flowwindow").offsetHeight,                     // 13 - height
  0.01,                                                                   // 14 - timestep
  0.8,                                                                    // 15 - fadeAmount
  document.getElementById('drawSwitch').checked,                          // 16 - draw control shapes boolean
  true                                                                    // 17 - Play/Pause boolean
]; //Global array of constants
var pixels = new Uint8ClampedArray(consts[12]*consts[13]*4); //Empty array, four elements per pixel

//Gets canvas data
const canvas1 = document.getElementById('canvas1');
canvas1.width = consts[12]; canvas1.height = consts[13]; //Sets drawing sizes
const gl = canvas1.getContext('webgl2', { premultipliedAlpha: false }); //WebGL initialization

const canvas2 = document.getElementById('canvas2');
canvas2.width = consts[12]; canvas2.height = consts[13]; //Sets drawing sizes
const ctx = canvas2.getContext("2d"); //2d canvas setup

const gpu = new GPU({ //New GPU.js GPU, with the specifed canvas
  canvas1,
  context: gl
});
