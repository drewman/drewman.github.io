require.config({
        paths: {
              "d3": "http://d3js.org/d3.v3.min",
              "Paho-mqtt": "mqttws31"
        }
  });

requirejs(['main']);
