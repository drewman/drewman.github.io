/*
    main.js bulk of app
    heavily influenced this d3 scatterplot: http://bl.ocks.org/mbostock/3887118
*/


require(['d3', 'Paho-mqtt'], function(d3, Paho) {
    /* SETUP D3 2D Scatterplot Graph */
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0, width])
        .domain([114, 135]);

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([0, 0.0009]);

    var colors = d3.scale.linear()
        .domain([1, 4])
        .range(["red", "blue", "green", "yellow"]);

    var color_hash = {
        1: ["kmean1", "red"],
        2: ["kmean2", "green"],
        3: ["kmean3", "purple"],
        4: ["kmean4", "blue"],
        5: ["centroid", "green"]
    };

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", -6)
          .style("text-anchor", "end")
          .text("x-axis");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("y-axis");

    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("x", width - 65)
        .attr("y", 25)
        .attr("height", 100)
        .attr("width", 100);

    /* setup a streaming mqtt client to plot data as it comes in 
       code copied from example: https://eclipse.org/paho/clients/js/ */
    client = new Paho.MQTT.Client("test.mosquitto.org", 8080, "testWebClient");

    // set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // connect the client
    client.connect({onSuccess:onConnect});

    // called when the client connects
    function onConnect() {
      // Once a connection has been made, make a subscription and send a message.
        console.log("onConnect");
        client.subscribe("cis/statistics");
    }

    // called when the client loses its connection
    function onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:"+responseObject.errorMessage);
        }
    }

    // called when a message arrives
    function onMessageArrived(message) {
        dataSet = JSON.parse(message.payloadString);

        if (dataSet.clear) {
            console.log('***STREAM STARTING***');
            svg.selectAll(".dot").remove();
            return;
        }

        console.log("onMessageArrived:"+message.payloadString);

        svg.selectAll(".kmeans").remove();
        svg.selectAll(".centroid").remove();
        svg.selectAll(".legend-text").remove();

        /* add dots for all data values */
        svg.selectAll(".dot")
            .data(dataSet.values, function(d) { return d[0] + d[1]; })
          .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 3)
            .attr("cx", function(d) { return x(d[0]); })
            .attr("cy", function(d) { return y(d[1]); });

        /* clean kmeans data */
        clean_kmeans_centers = [];
        for(var key in dataSet.kmeans_centers) {
            center = {
                "id": key,
                "x": dataSet.kmeans_centers[key][0],
                "y": dataSet.kmeans_centers[key][1]
            };
            clean_kmeans_centers.push(center);
        }

        /* Add legend */
        legend.selectAll('g').data(clean_kmeans_centers)
          .enter()
          .append('g')
          .attr("class", "legend-text")
          .each(function(d, i) {
              var g = d3.select(this);
              g.append("rect")
                .attr("x", width - 270)
                .attr("y", i * 25)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", color_hash[d.id][1]);
        
              g.append("text")
                .attr("x", width - 255)
                .attr("y", i * 25 + 8)
                .attr("height",30)
                .attr("width",100)
                .style("fill", color_hash[d.id][1])
                .text(color_hash[d.id][0] + ": (" + d.x + ", " + d.y + ")");
          });

        legend.selectAll('g.legend-text').data([dataSet.centroid])
          .each(function(d, i) {
              var g = d3.select(this);
              g.append("rect")
                .attr("x", width - 270)
                .attr("y", 4 * 25)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", color_hash[5][1])
                .style("opacity", ".2");
        
              g.append("text")
                .attr("x", width - 255)
                .attr("y", 4 * 25 + 8)
                .attr("height",30)
                .attr("width",100)
                .style("fill", color_hash[5][1])
                .text(color_hash[5][0] + ": (" + d[0] + ", " + d[1] + ")");
          });

        /* add dots for kmeans */
        svg.selectAll(".kmeans")
            .data(clean_kmeans_centers, function(d) { return d.id; })
          .enter().append("circle")
            .attr("class", "dot")
            .attr("class", "kmeans")
            .attr("r", 10)
            .attr("cx", function(d) { return x(d.x); })
            .attr("cy", function(d) { return y(d.y); })
            .style("fill", function(d) { return color_hash[d.id][1]; });

        /* add giant semi-transparent dot for centroid */
        svg.selectAll(".centroid")
            .data([dataSet.centroid])
          .enter().append("circle")
            .attr("class", "dot")
            .attr("class", "centroid")
            .attr("r", 50)
            .attr("cx", function(d) { return x(d[0]); })
            .attr("cy", function(d) { return y(d[1]); })
            .style("fill", color_hash[5][1])
            .style("opacity", ".2");
    }
});