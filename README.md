# BLE Project
The project is intended to determine the distance between a ble transmitter and receiver. 
The project is also serve as the purpose of CSE 461 Fianl Project.

## Hardware
1. Raspberry Pi - mobile receiver and computation unit
2. Adafruit LE SPI Friend x 3 - Transmitters
3. Teensy / Arduino x 3 - powering and management unit for Adafruit
4. Inateck x 3 - Actual bluetooth dongle (with Raspi to receive)
5. Hijacked Lab Machine for monitor / mouse and keyboard
6. Portable display screen for Raspberry Pi
7. Portable Power Bank for powering Raspberry Pi and Adafruit
8. USB hub from AmazonBasics

## Software 
1. node as platform (socket.io)
2. noble le as bluetooth central management unit (invoke hcitool, gatttool)
3. Arduino IDE for programming Teensy / Arduino
4. kalmanJS as noise filter

## Log
#### Acient time ago
- Our idea is inspired by [here](https://medium.com/truth-labs/beacon-tracking-with-node-js-and-raspberry-pi-794afa880318#.ada0wu7pv)
#### Early Nov. 
- Installed all the dependencies on Raspberry Pi
- Bought Inateck bluetooth receiver
- Intended to buy iBeacon in some form, but instead, borrowed Adafruit 2633 from Embedded Sys lab
- Originally want to display all the information we required on a 2.2-TFT. However, all the tutorials online requires recompiling the kernel, which is too much work and won't work if we want to connect to other monitor (such as hdmi).

- Discovery ble has relatively long range (than we expected), but rssi is inconsistent according to reading from noble due to multipath

#### Middle Nov. 
- Tried to locate the confidence on the ble range
- Experimented on outdoor environment by walking round
- More specifically, the person holding the transmitted walking away to and from the person who's steady with the recevier. The data collected generated a vague Bell Curve

- Experiment failed when we tried at open field, possibly due to the windy and cold weather. By failing we mean it's impossible to receive data even from short distance, but the ble receiver is also hooked on a VM on Mac instead of Raspberry Pi (due to our laziness)

#### Middle Late Nov. before Thanksgiving
- Created a sheet with fixed distance to more accurately measure ble rssi values- Conducted experiment indoor and outdoor by holding receiver steady and moving transmitter 1 ft each time. We held the position of the beacon constant for ~30 seconds. 
- By running averages on our data, we found that there was a linear correlation between distance and rssi outdoor. For the indoor data, we found that the graph was a bit more choppy. 
- We conclude that outdoor data is more consistent.
- Created a gui to monitor realtime rssi readings. 

- Bought a 5inch hdmi 800x480 portable monitor

#### Beginning of December
- Implemented the Kalman Filter
- Implemented the running average
- Performed the INDOOR experiment on mapping the rssi to distance -> Both on the ground (receiver and transmitter) and hold them in the air

- Found that Kalman Filter has less variance than running average
- Found that the signal of ble is inconsistence after 33 inches (both on the ground and in the air, which convinced us)

## Potential ideas that we can explore
1. Increase the number of receivers to gain more data in order to average out or Kalman Filter the noise. Instead of using the data driven approch, we can use a time period driven approach such as data pushing period is 0.5s. 
2. Increase the number of transmitters to gain more data in order to average out the noise.
3. ~~We can use a kalman filter or running average to reduce the noise~~ (already implemented)
4. Map rssi to distance using the field experiment result we gained from practice. (Rewrite the rssi - distance function)
    - Found a log distance equation [here](https://wouterbulten.nl/blog/tech/kalman-filters-explained-removing-noise-from-rssi-signals/) converting rssi to distance, which is a discrete function, but as the combination of Kalman Filter, the result can be continuous.
5. We can use a EM algorithm to clustering and figure out the confidence (efficiency problem) using the data points we have already generated before as reference clusters.







