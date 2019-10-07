// Contains code which draws either an ellipse or an airfoil to canvas2

//Defines colours used
var fillColour1 = '#02313C'; //Dark blue
var outlineColour1 = "#99FFF8"; //Light blue

function drawControlShape() {
  ctx.clearRect(0, 0, canvas2.width, canvas2.height); //Clears canvas 2
  if (consts[16]) {
    if (consts[3]) { //If joukowski
      drawControlAirfoil();
    }else {
      drawControlEllipse();
    }
  }
} //Decides which shape to draw

function drawControlEllipse() {
  const dy = consts[5]; //Leg of right triangle
  const dx = consts[1]-consts[4]; //Other leg of right triangle
  const r = Math.sqrt(dx*dx+dy*dy); //Circle radius

  const xstr = consts[12]/(consts[9]-consts[8]); //How much x dir lengths scale mapping to px coords
  const ystr = consts[13]/(consts[11]-consts[10]); //How much y dir lengths scale mappinh to px coords

  const x = (consts[4]-consts[8])/(consts[9]-consts[8])*consts[12]; //Maps ctrlx to pixel coords
  const y = consts[13] - (consts[5]-consts[10])/(consts[11]-consts[10])*consts[13]; //Maps ctrly to pixel coords

  ctx.fillStyle = fillColour1; //Fill colour
  ctx.strokeStyle = outlineColour1; //Outline colour
  ctx.beginPath();
  ctx.ellipse(x,y,r*xstr,r*ystr,0,0,2*Math.PI);
  ctx.fill(); //Fills ellipse
  ctx.stroke(); //Draws outline
} //Draws the control ellipse to canvas2

function drawControlAirfoil() {
  const numPts = 500; //Number of points to sample for airfoil shape

  ctx.fillStyle = fillColour1;
  ctx.strokeStyle = outlineColour1;

  var initialpt = getAirfoilCoords(0); //Gets first point on the airfoil
  ctx.moveTo(initialpt[0],initialpt[1]); //Moves pen to initial point
  ctx.beginPath();
  for (var i = 0; i < 2*Math.PI; i+=2*Math.PI/numPts) {
    var pt = getAirfoilCoords(i); //Get next point
    ctx.lineTo(pt[0],pt[1]); //Join to last point
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
} //Draws airfoil to canvas 2

function getAirfoilCoords(theta){ //Returns a coordinate vector, takes in theta in 0 to 2 pi
  var x = consts[4]+Math.cos(theta)*Math.sqrt(Math.pow(consts[5],2)+Math.pow((consts[1]-consts[4]),2))+(Math.pow(consts[1],2)*(consts[4]+Math.cos(theta)*Math.sqrt(Math.pow(consts[5],2)+Math.pow((consts[1]-consts[4]),2))))/(Math.pow((consts[4]+Math.cos(theta)*Math.sqrt(Math.pow(consts[5],2)+Math.pow((consts[1]-consts[4]),2))),2)+Math.pow((consts[5]+Math.sin(theta)*Math.sqrt(Math.pow(consts[5],2)+Math.pow((consts[1]-consts[4]),2))),2));
  var y = consts[5]+Math.sin(theta)*Math.sqrt(Math.pow(consts[5],2)+Math.pow((consts[1]-consts[4]),2))-(Math.pow(consts[1],2)*(consts[5]+Math.sin(theta)*Math.sqrt(Math.pow(consts[5],2)+Math.pow((consts[1]-consts[4]),2))))/(Math.pow((consts[4]+Math.cos(theta)*Math.sqrt(Math.pow(consts[5],2)+Math.pow((consts[1]-consts[4]),2))),2)+Math.pow((consts[5]+Math.sin(theta)*Math.sqrt(Math.pow(consts[5],2)+Math.pow((consts[1]-consts[4]),2))),2));
  x = (x-consts[8])/(consts[9]-consts[8])*consts[12]; //Maps x to px coords
  y = consts[13]-(y-consts[10])/(consts[11]-consts[10])*consts[13]; //Maps y to px coords
  return [x,y]; //Return coords
}

drawControlShape(); //Draws shape onLoad
