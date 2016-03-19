Notes about our project:
* Our group final project is deployed on: http://drewman.github.io/dashboard.html
* Our codebase will be submitted on canvas but is also available at: https://github.com/drewman/drewman.github.
* We have a sparkStreaming script, publisher.py, that takes the mqtt sound durations data, computes some statistics, and publishes the computed stats.
    * This script requires the paho-mqtt package
    * That script is running continuously on our raspberry pi cluster
    * We are restarting the script every minute, so that you can see the k-means algorithm in action but there may be some lag in between the restarts
    * We were unable to read from our local mosquitto server over websockets, so we ended up using the public mosquitto server
* The other piece of the project is in javascript, main.js, where we display the streaming data with d3
    * The scale is completely arbitrary based on the data I was seeing
    * We attempted to have a dynamic scale but it proved to be very complex and we didn't end up including it
    * We weren't completely sure of the units of the sound duration and so they were not included
    * Sometimes the connection closes or crashes unexpectantly, refreshing the page will fix this
    * There are console logs of incoming data
