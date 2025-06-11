let molds = [];
let num = 4000;
let d;
let canvas;

function setup() {
  const container = document.getElementById('sketch-container');
  const w = container.offsetWidth;
  const h = container.offsetHeight;
  if (windowWidth <= 480) {
    h = windowHeight * 0.4;
  }
  let canvas = createCanvas(w, h);
  canvas.parent('sketch-container');
  angleMode(DEGREES);
  background(0);
  d = pixelDensity();
  
  for (let i = 0; i < num; i++) {
    molds.push(new Mold());
  } 
  stroke(255);
  strokeWeight(10);
  noFill();
}

function draw() {
  // semitrasparenza per dissolvere traccia
  background(0, 5);
  
  loadPixels(); // carica pixel per leggere e modificare
  
  for (let i=0; i<num; i++) {
    molds[i].update();
    molds[i].display();
  }
  
  updatePixels(); // aggiorna il buffer dei pixel
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

class Mold {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.heading = random(360);
    this.speed = 0.5;
    this.sensorDist = 10;
    this.sensorAngle = 45;
    this.turnAngle = 25;
    this.r = 2; // raggio punto
  }
  
  update() {
    // sensori
    let senseF = this.sense(0);
    let senseL = this.sense(-this.sensorAngle);
    let senseR = this.sense(this.sensorAngle);

    // scegli direzione
    if (senseF > senseL && senseF > senseR) {
      // dritto
    } else if (senseL > senseR) {
      this.heading -= this.turnAngle;
    } else if (senseR > senseL) {
      this.heading += this.turnAngle;
    } else {
      this.heading += random(-this.turnAngle, this.turnAngle);
    }

    // muoviti
    let vel = p5.Vector.fromAngle(radians(this.heading));
    vel.mult(this.speed);
    this.pos.add(vel);

    // wrap intorno allo schermo
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;

    // lascia traccia più spessa
    let size = 1.5;
    let x = floor(this.pos.x);
    let y = floor(this.pos.y);
    for (let i = -floor(size / 2); i <= floor(size / 2); i++) {
      for (let j = -floor(size / 2); j <= floor(size / 2); j++) {
        let sx = constrain(x + i, 0, width - 1);
        let sy = constrain(y + j, 0, height - 1);
        let idx = 4 * ((sy * width * d) + (sx * d));
        pixels[idx] = 255;
        pixels[idx + 1] = 255;
        pixels[idx + 2] = 255;
        pixels[idx + 3] = 255;
      }
    }
  }
  
  sense(angleOffset) {
    let angle = this.heading + angleOffset;
    let sx = floor(this.pos.x + cos(angle) * this.sensorDist);
    let sy = floor(this.pos.y + sin(angle) * this.sensorDist);
    sx = constrain(sx, 0, width - 1);
    sy = constrain(sy, 0, height - 1);
    let idx = 4 * ((sy * width * d) + (sx * d));
    return pixels[idx]; // canale rosso
  }
  
  display() {
    noStroke();
    fill(255);
    ellipse(this.x, this.y, this.r*2, this.r*2);

  }
}
