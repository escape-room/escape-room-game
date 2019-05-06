void setup() {
  Serial.begin(9600);
  Serial.println("READY");
}

String header;
String socketEvent;
boolean buttonPressed = true;

void loop() {  
  while (Serial.available() > 0) {
    header = Serial.readStringUntil(':');
    socketEvent = Serial.readStringUntil('\n');
    Serial.println("Recieved: " + header + ":" + socketEvent);
    // save socketEvent and then transmit back when button is pressed. then empty socketEvent
  }

  if (buttonPressed && socketEvent != "") {
    Serial.println(socketEvent);
    // activate motor
    socketEvent = "";
  }
}
