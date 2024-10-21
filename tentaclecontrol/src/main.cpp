#include <Arduino.h>
#include <Servo.h>

Servo servo_1;  // create servo object to control a servo
Servo servo_0;

float t = 0.0;
float speed = 0.005;
    // variable to store the servo position

void setup() {
  servo_0.attach(8);
  servo_1.attach(9);
  
  servo_0.write(90);
}

void loop() {

  int pos = (sin(t)+1) * 90;
  servo_1.write(pos);
  t += speed;
  delay(5);
}
