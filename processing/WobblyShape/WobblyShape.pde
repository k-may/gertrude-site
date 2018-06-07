void setup() {
  size(500, 500);
}

void draw() {
  background(255);
  stroke(0);

  float x = 0;
  float y = 0;
  
  int numPoints = 100;
  
  for (int i = 0; i < numPoints + 1; i ++) {
    
    int index = i % numPoints;
    float nA = sin(index*0.01 * PI*2) / 2 + 1;
    float nB = sin(index*0.02 * PI*2) / 2 + 1;
    
    float noise = noise(nA, nB, millis() * 0.0001);
    
    float angle = index / (float)numPoints * PI*2;

    float nX = (sin(angle) * (100 + noise * 40))+ width/2;
    float nY = (cos(angle) * (100 + noise * 40)) + height / 2;
    if (i > 0) {
      line(x ,y ,nX, nY);
    }
    
    x = nX;
    y = nY;
  }
}
