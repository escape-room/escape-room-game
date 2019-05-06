#include <RBDdimmer.h>
#include <Adafruit_NeoPixel.h>
#define PIN        7
#define NUMPIXELS 9
Adafruit_NeoPixel pixels(NUMPIXELS, PIN, NEO_GRB + NEO_KHZ800);
int battery[3] = {A0, 13, A1};
int socket[5] = {A5, 3, 4, 5, 6};
int cable[5] = {11, 9, 10, 12, 8};
int pixel[5] = {5, 4, 3, 1, 2};
int button = A2;
int puzzle = A3;
int motorPin = A4;
dimmerLamp motor(motorPin);
String stopMotorString = "DISABLE-RUMBLE";
String header;
String socketEvent;
boolean buttonPressed;
boolean socketRecieved = false;
boolean motorRumbling = false;
int solved = 0;
void setup() {
  Serial.begin(9600);
  pixels.begin(); // INITIALIZE NeoPixel strip object (REQUIRED)
  for (int i = 0; i < 3; i++) {
    pinMode(battery[i], INPUT_PULLUP);
  }
  for (int i = 0; i < 5; i++) {
    pinMode(cable[i], OUTPUT);
    pinMode(socket[i], INPUT_PULLUP);
  }
  pinMode(button, INPUT_PULLUP);
  pinMode(puzzle, INPUT_PULLUP);
  motor.begin(NORMAL_MODE, ON); //dimmer initialisation: name.begin(MODE, STATE)
  motor.setPower(50);
  motor.setState(OFF);
  pixels.setPixelColor(0, pixels.Color(150, 0, 0));
  pixels.show();
  Serial.println("READY");
}
void loop() {
  while (Serial.available() > 0) {
    header = Serial.readStringUntil(':');
    socketEvent = Serial.readStringUntil('\n');
//    Serial.println("Recieved: " + header + ":" + socketEvent);
    if (motorRumbling == true && header == stopMotorString) {
      stopRumble();
    } else {
      socketRecieved = true;
    }
    // save socketEvent and then transmit back when button is pressed. then empty socketEvent
  }
  if (!digitalRead(button)) {
    if (socketRecieved == true) {
      Serial.println(socketEvent);
      // activate motor
      rumble();
      socketEvent = "";
      socketRecieved = false;
    } else {
      buzz();
    }
  }
  while (!digitalRead(button)) {
    delay(50); // required for button read
  }
  
  if (!solved) {
    solved = 1;
    if (!checkCables()) {
      solved = 0;
    }
    if (!checkBattery()) {
      solved = 0;
    }
    if (solved == 1) {
      Serial.println("puzzles-solved");
    }
  }
  delay(10);
}
void rumble() {
  motor.setState(ON);
  motorRumbling = true;
}
void buzz() {
  if (!motorRumbling) {
    motor.setState(ON);
    delay(300);
    motor.setState(OFF);
    delay(200);
    motor.setState(ON);
    delay(300);
    motor.setState(OFF);
  }
}
void stopRumble() {
  motor.setState(OFF);
  motorRumbling = false;
}
int checkBattery() {
  int connectd = 1;
  for (int i = 0; i < 3; i++) {
    if (digitalRead(battery[i])) {
      connectd = 0;
      pixels.setPixelColor(i + 6, pixels.Color(0, 150, 0));
      pixels.show();
    } else {
      pixels.setPixelColor(i + 6, pixels.Color(150, 0, 0));
      pixels.show();
    }
  }
  return connectd;
}
int checkCables() {
  int connectd = 1;
  for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 5; j++) {
      digitalWrite(cable[j], HIGH);
    }
    digitalWrite(cable[i], LOW);
    if (digitalRead(socket[i])) {
      connectd = 0;
      pixels.setPixelColor(pixel[i], pixels.Color(0, 150, 0));
      pixels.show();
    }
    else {
      pixels.setPixelColor(pixel[i], pixels.Color(150, 0, 0));
      pixels.show();
    }
  }
  return connectd;
}
