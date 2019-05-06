void setup() {
  Serial.begin(9600);
  Serial.println("READY");
}

void loop() {
  // if there's any serial available, read it:
  while (Serial.available() > 0) {
    String header = Serial.readStringUntil(':');
    String socketEvent = Serial.readStringUntil('\n');
    Serial.println("Recieved: " + header + ":" + socketEvent);
    Serial.println(socketEvent);
  }
}
