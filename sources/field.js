//Code which sets functions to be done on the GPU, calculates most things and draws to canvas1

//Adds functions to GPU.js library
gpu.addFunction(function rk4(x,y,h,consts){
  const k1 = get_velocity(x,y,consts);
  const k2 = get_velocity(x+(k1[0]*h*0.5),y+(k1[1]*h*0.5),consts);
  const k3 = get_velocity(x+(k2[0]*h*0.5),y+(k2[1]*h*0.5),consts);
  const k4 = get_velocity(x+(k3[0]*h),y+(k3[1]*h),consts);

  return [((k1[0]/6)+(k2[0]/3)+(k3[0]/3)+(k4[0]/6))*h , ((k1[1]/6)+(k2[1]/3)+(k3[1]/3)+(k4[1]/6))*h];
}) //Fourth order Runge-Kutta method - returns vector to be added to current postion
gpu.addFunction(function Joukowski_Transform(x,y,a) {
  const b = x*x+y*y; //Term calculated here for ease of computation
  return [x*(b+a*a)/b,y*(b-a*a)/b];
}) //The Joukowski transfomaion on a point x,y with paramiter a
gpu.addFunction(function Inverse_Joukowsky_Transform(x,y,a,x0,y0,alpha) {
  const r1 = Math.sqrt(Math.pow(x-2*a,2)+Math.pow(y,2));
  const r2 = Math.sqrt(Math.pow(x+2*a,2)+Math.pow(y,2));
  const t1 = Math.atan2(y,x-2*a);
  const t2 = Math.atan2(y,x+2*a);
  const sqrt = Math.sqrt(r1*r2);

  //const X = (x+sqrt*cos((t1+t2)/2))/2; //Posative sqrt map
  //const Y = (y+sqrt*sin((t1+t2)/2))/2; //Posative sqrt map
  //X = (X-x0)*Math.cos(alpha)+(Y-y0)*Math.sin(alpha); //Translate and rotate
  //Y = (Y-y0)*Math.cos(alpha)-(X-x0)*Math.sin(alpha); //Translate and rotate

  let sign = 1;
  if (false) {sign = -1;} //TODO: Put some condition here, check wheather point is in circle or not, flip sign if it is

  return [(x+sign*sqrt*cos((t1+t2)/2))/2,(y+sign*sqrt*sin((t1+t2)/2))/2];
}) //The inverse Joukowski transformation on a point x,y with paramiter a
gpu.addFunction(function get_velocity(x,y,consts){
  let u = 0; let v = 0;

  //Set values of u and v, based on value of transform switch
  if (consts[3] == 0) { //Untransformed flow
    u = consts[2]*Math.cos(consts[0])-(consts[7]*(y-consts[5]))/(Math.PI*(Math.pow(x-consts[4],2.0)+Math.pow(y-consts[5],2.0))*2.0)-(consts[2]*Math.cos(consts[0])*(consts[5]*consts[5]+Math.pow(consts[1]-consts[4],2.0))*(Math.pow(x-consts[4],2.0)-Math.pow(y-consts[5],2.0)))/(Math.pow(Math.pow(x-consts[4],2.0)-Math.pow(y-consts[5],2.0),2.0)+Math.pow(x-consts[4],2.0)*Math.pow(y-consts[5],2.0)*4.0)-(consts[2]*Math.sin(consts[0])*(consts[5]*consts[5]+Math.pow(consts[1]-consts[4],2.0))*(x-consts[4])*(y-consts[5])*2.0)/(Math.pow(Math.pow(x-consts[4],2.0)-Math.pow(y-consts[5],2.0),2.0)+Math.pow(x-consts[4],2.0)*Math.pow(y-consts[5],2.0)*4.0);

    v = consts[2]*Math.sin(consts[0])+(consts[7]*(x-consts[4]))/(Math.PI*(Math.pow(x-consts[4],2.0)+Math.pow(y-consts[5],2.0))*2.0)+(consts[2]*Math.sin(consts[0])*(consts[5]*consts[5]+Math.pow(consts[1]-consts[4],2.0))*(Math.pow(x-consts[4],2.0)-Math.pow(y-consts[5],2.0)))/(Math.pow(Math.pow(x-consts[4],2.0)-Math.pow(y-consts[5],2.0),2.0)+Math.pow(x-consts[4],2.0)*Math.pow(y-consts[5],2.0)*4.0)-(consts[2]*Math.cos(consts[0])*(consts[5]*consts[5]+Math.pow(consts[1]-consts[4],2.0))*(x-consts[4])*(y-consts[5])*2.0)/(Math.pow(Math.pow(x-consts[4],2.0)-Math.pow(y-consts[5],2.0),2.0)+Math.pow(x-consts[4],2.0)*Math.pow(y-consts[5],2.0)*4.0);

  }else { //Transformed flow
    const newCoords = Inverse_Joukowsky_Transform(x,y,consts[1],consts[4],consts[5],consts[0]); //Inverse map coords
    const X = newCoords[0]; const Y = newCoords[1];
    x = (X - consts[4])*Math.cos(consts[0]) + (Y - consts[5])*Math.sin(consts[0]);
    y = -(X - consts[4])*Math.sin(consts[0]) + (Y - consts[5])*Math.cos(consts[0]);
    const r = Math.sqrt(Math.pow(consts[5],2)+Math.pow(consts[1]-consts[4],2));

    u = (consts[2]*((X*X*X*X)*Math.cos(consts[0])+(Y*Y*Y*Y)*Math.cos(consts[0])+(X*X)*(Y*Y)*Math.cos(consts[0])*2.0-(X*X)*(consts[1]*consts[1])*Math.cos(consts[0])+(Y*Y)*(consts[1]*consts[1])*Math.cos(consts[0])-X*Y*(consts[1]*consts[1])*Math.sin(consts[0])*2.0))/(X*X*X*X+Y*Y*Y*Y+consts[1]*consts[1]*consts[1]*consts[1]+(X*X)*(Y*Y)*2.0-(X*X)*(consts[1]*consts[1])*2.0+(Y*Y)*(consts[1]*consts[1])*2.0)+(consts[2]*(r*r)*1.0/Math.pow(x*x+y*y,2.0)*(-(X*X*X*X)*(x*x)*Math.cos(consts[0])+(X*X*X*X)*(y*y)*Math.cos(consts[0])-(Y*Y*Y*Y)*(x*x)*Math.cos(consts[0])+(Y*Y*Y*Y)*(y*y)*Math.cos(consts[0])-(X*X)*(Y*Y)*(x*x)*Math.cos(consts[0])*2.0+(X*X)*(Y*Y)*(y*y)*Math.cos(consts[0])*2.0+(X*X)*(consts[1]*consts[1])*(x*x)*Math.cos(consts[0])-(X*X)*(consts[1]*consts[1])*(y*y)*Math.cos(consts[0])-(Y*Y)*(consts[1]*consts[1])*(x*x)*Math.cos(consts[0])+(Y*Y)*(consts[1]*consts[1])*(y*y)*Math.cos(consts[0])+(X*X*X*X)*x*y*Math.sin(consts[0])*2.0+(Y*Y*Y*Y)*x*y*Math.sin(consts[0])*2.0+X*Y*(consts[1]*consts[1])*(x*x)*Math.sin(consts[0])*2.0-X*Y*(consts[1]*consts[1])*(y*y)*Math.sin(consts[0])*2.0+(X*X)*(Y*Y)*x*y*Math.sin(consts[0])*4.0-(X*X)*(consts[1]*consts[1])*x*y*Math.sin(consts[0])*2.0+(Y*Y)*(consts[1]*consts[1])*x*y*Math.sin(consts[0])*2.0+X*Y*(consts[1]*consts[1])*x*y*Math.cos(consts[0])*4.0))/(X*X*X*X+Y*Y*Y*Y+consts[1]*consts[1]*consts[1]*consts[1]+(X*X)*(Y*Y)*2.0-(X*X)*(consts[1]*consts[1])*2.0+(Y*Y)*(consts[1]*consts[1])*2.0)-(consts[7]*((X*X*X*X)*y*Math.cos(consts[0])+(Y*Y*Y*Y)*y*Math.cos(consts[0])+(X*X*X*X)*x*Math.sin(consts[0])+(Y*Y*Y*Y)*x*Math.sin(consts[0])+(X*X)*(Y*Y)*y*Math.cos(consts[0])*2.0-(X*X)*(consts[1]*consts[1])*y*Math.cos(consts[0])+(Y*Y)*(consts[1]*consts[1])*y*Math.cos(consts[0])+(X*X)*(Y*Y)*x*Math.sin(consts[0])*2.0-(X*X)*(consts[1]*consts[1])*x*Math.sin(consts[0])+(Y*Y)*(consts[1]*consts[1])*x*Math.sin(consts[0])+X*Y*(consts[1]*consts[1])*x*Math.cos(consts[0])*2.0-X*Y*(consts[1]*consts[1])*y*Math.sin(consts[0])*2.0))/(Math.PI*(x*x+y*y)*(X*X*X*X+Y*Y*Y*Y+consts[1]*consts[1]*consts[1]*consts[1]+(X*X)*(Y*Y)*2.0-(X*X)*(consts[1]*consts[1])*2.0+(Y*Y)*(consts[1]*consts[1])*2.0)*2.0);

    v = (consts[2]*((X*X*X*X)*Math.sin(consts[0])+(Y*Y*Y*Y)*Math.sin(consts[0])+(X*X)*(Y*Y)*Math.sin(consts[0])*2.0-(X*X)*(consts[1]*consts[1])*Math.sin(consts[0])+(Y*Y)*(consts[1]*consts[1])*Math.sin(consts[0])+X*Y*(consts[1]*consts[1])*Math.cos(consts[0])*2.0))/(X*X*X*X+Y*Y*Y*Y+consts[1]*consts[1]*consts[1]*consts[1]+(X*X)*(Y*Y)*2.0-(X*X)*(consts[1]*consts[1])*2.0+(Y*Y)*(consts[1]*consts[1])*2.0)-(consts[2]*(r*r)*1.0/Math.pow(x*x+y*y,2.0)*((X*X*X*X)*(x*x)*Math.sin(consts[0])-(X*X*X*X)*(y*y)*Math.sin(consts[0])+(Y*Y*Y*Y)*(x*x)*Math.sin(consts[0])-(Y*Y*Y*Y)*(y*y)*Math.sin(consts[0])+(X*X)*(Y*Y)*(x*x)*Math.sin(consts[0])*2.0-(X*X)*(Y*Y)*(y*y)*Math.sin(consts[0])*2.0-(X*X)*(consts[1]*consts[1])*(x*x)*Math.sin(consts[0])+(X*X)*(consts[1]*consts[1])*(y*y)*Math.sin(consts[0])+(Y*Y)*(consts[1]*consts[1])*(x*x)*Math.sin(consts[0])-(Y*Y)*(consts[1]*consts[1])*(y*y)*Math.sin(consts[0])+(X*X*X*X)*x*y*Math.cos(consts[0])*2.0+(Y*Y*Y*Y)*x*y*Math.cos(consts[0])*2.0+X*Y*(consts[1]*consts[1])*(x*x)*Math.cos(consts[0])*2.0-X*Y*(consts[1]*consts[1])*(y*y)*Math.cos(consts[0])*2.0+(X*X)*(Y*Y)*x*y*Math.cos(consts[0])*4.0-(X*X)*(consts[1]*consts[1])*x*y*Math.cos(consts[0])*2.0+(Y*Y)*(consts[1]*consts[1])*x*y*Math.cos(consts[0])*2.0-X*Y*(consts[1]*consts[1])*x*y*Math.sin(consts[0])*4.0))/(X*X*X*X+Y*Y*Y*Y+consts[1]*consts[1]*consts[1]*consts[1]+(X*X)*(Y*Y)*2.0-(X*X)*(consts[1]*consts[1])*2.0+(Y*Y)*(consts[1]*consts[1])*2.0)-(consts[7]*(-(X*X*X*X)*x*Math.cos(consts[0])-(Y*Y*Y*Y)*x*Math.cos(consts[0])+(X*X*X*X)*y*Math.sin(consts[0])+(Y*Y*Y*Y)*y*Math.sin(consts[0])-(X*X)*(Y*Y)*x*Math.cos(consts[0])*2.0+(X*X)*(consts[1]*consts[1])*x*Math.cos(consts[0])-(Y*Y)*(consts[1]*consts[1])*x*Math.cos(consts[0])+(X*X)*(Y*Y)*y*Math.sin(consts[0])*2.0-(X*X)*(consts[1]*consts[1])*y*Math.sin(consts[0])+(Y*Y)*(consts[1]*consts[1])*y*Math.sin(consts[0])+X*Y*(consts[1]*consts[1])*y*Math.cos(consts[0])*2.0+X*Y*(consts[1]*consts[1])*x*Math.sin(consts[0])*2.0))/(Math.PI*(x*x+y*y)*(X*X*X*X+Y*Y*Y*Y+consts[1]*consts[1]*consts[1]*consts[1]+(X*X)*(Y*Y)*2.0-(X*X)*(consts[1]*consts[1])*2.0+(Y*Y)*(consts[1]*consts[1])*2.0)*2.0);
  }
  return [u,v];
})//Defines velocity field at point (x,y) - returns array [vel_x,vel_y]

var randomParticleArray = gpu.createKernel(function (consts){
  return [Math.random()*(consts[9]-consts[8])+consts[8],
          Math.random()*(consts[11]-consts[10])+consts[10]];
})
  .setOutput([particleRes,particleRes]); //Returns 2d array of random positions in x/y coords

var evenlySpacedParticleArray = gpu.createKernel(function(consts) {
  return [(this.thread.x/this.constants.r)*(consts[9]-consts[8])+consts[8],
          (this.thread.y/this.constants.r)*(consts[11]-consts[10])+consts[10]];
})
  .setConstants({r:particleRes})
  .setOutput([particleRes,particleRes]); //Returns 2d array of evenly spaced positions in x/y coords

var updateParticleArray = gpu.createKernel(function (particleArray,consts){
  const x = particleArray[this.thread.y][this.thread.x][0];
  const y = particleArray[this.thread.y][this.thread.x][1];
  const step = rk4(x,y,consts[14],consts); //[deltax,deltay]
  const mag = Math.sqrt((step[0]*step[0])+(step[1]*step[1]));
  let pos = [x+step[0],y+step[1]];

  if (Math.random()<0.1||mag<1e-8||pos[0]<=consts[8]||pos[0]>=consts[9]||pos[1]<=consts[10]||pos[1]>=consts[11]) {
    pos = [Math.random()*(consts[9]-consts[8])+consts[8],
            Math.random()*(consts[11]-consts[10])+consts[10]]; //New random position
  }
  return pos;
})
  .setOutput([particleRes,particleRes]); //Updates particle positions, using Runge Kutta method

var mapParticleArrayToPx = gpu.createKernel(function(particleArray,consts){
  let x = particleArray[this.thread.y][this.thread.x][0];
  let y = particleArray[this.thread.y][this.thread.x][1];
  x = Math.round((x-consts[8])/(consts[9]-consts[8])*consts[12]);
  y = Math.round((y-consts[10])/(consts[11]-consts[10])*consts[13]);
  return [x,y];
})
  .setOutput([particleRes,particleRes]); //Converts x/y coords to pixel coords

function particleArrayToPixelMap(pxParticleArray,consts) {
  var out = new Uint8ClampedArray(consts[12]*consts[13]);
  for (var i = 0; i < particleRes; i++) {
    for (var j = 0; j < particleRes; j++) {
      var x = pxParticleArray[i][j][0];
      var y = pxParticleArray[i][j][1];
      out[y*consts[12]+x] = 1;
    }
  }
  return out;
} //Turns particle array into array with 1 denoting particle locations

var drawParticles = gpu.createKernel(function(inp,pixels,consts){
  let px = ((consts[13]-this.thread.y-1)*consts[12]+this.thread.x)*4; //*4 as each pixel has rgba values
  const particle = inp[this.thread.y*consts[12]+this.thread.x];
  if (particle == 1) {
    this.color(4/255,178/255,217/255,1);
  }else if (pixels[px+3]<255*0.1) {
    this.color(0,0,0,0); //Reset to transparent pixel
  }else {
    this.color(pixels[px]/255,pixels[px+1]/255,pixels[px+2]/255,pixels[px+3]/255*consts[15]);
  }
})
  .setOutput([consts[12],consts[13]])
  .setGraphical(true); //Draws new particles to screen and fades exsisting trails

var particleArray = randomParticleArray(consts); //Initializes particle array

function drawFrame() {
  particleArray = updateParticleArray(particleArray,consts); //Updares particle postions
  var pxParticleArray = mapParticleArrayToPx(particleArray,consts); //Maps particle positions to pixel space
  var pixelMap = particleArrayToPixelMap(pxParticleArray,consts); //Turns pixel coords to grid of particle locations
  drawParticles(pixelMap,pixels,consts); //Draws particles
  pixels = drawParticles.getPixels(); //Gets pixels from canvas
  if (consts[17]) {
      window.requestAnimationFrame(drawFrame); //Callback for next frame
  }
} //Draws a frame to the canvas, fades particle trails

window.requestAnimationFrame(drawFrame); //Starts drawing frames to the canvas
