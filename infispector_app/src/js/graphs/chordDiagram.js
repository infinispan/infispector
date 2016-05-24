var visual = document.getElementById("visual");
   // --> from ROW to COLLUMN

   function getNodes() {
       return [ "Node1", "Node2", "Node3", "Node4", "Node5", "Node6", "Node7", "Node8",
            "Node9", "Node10", "Node11", "Node12", "Node13", "Node14", "Node15", "Node16"];
   }
   
   function getNumberOfMessages(nodeFrom, nodeTo, from, to) {
       var matrix = [
            [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
            [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
            [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
            [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
            [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
            [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
            [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
            [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
            [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
            [ 100, 100, 100, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],



            [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
            [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
            [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
            [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
            [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
            [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5]
         ];
         return matrix[from][to];
   }
   
   function getMatrix(nodes) {
       var arrayLength = nodes.length;
       var matrix = [];
       for (var index = 0; index < arrayLength; index++) {
           matrix[index] = [];
           for (var index1 = 0; index1 < arrayLength; index1++) {
               matrix[index][index1] = getNumberOfMessages(nodes[index], nodes[index1], index, index1);
           }
       }
       return matrix;
   }

/*var matrix2 = [
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100],
      [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100],
      [ 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 0, 100, 0],
      [ 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0],
      [ 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 0]
   ];

   var matrix = [
      [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
      [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
      [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
      [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
      [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
      [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
      [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
      [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
      [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
      [ 100, 100, 100, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],



      [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
      [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
      [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
      [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
      [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5],
      [ 20, 11, 3, 30, 32, 35, 59, 5, 20, 11, 3, 30, 32, 35, 59, 5]
   ];

   var array = [ "Node1", "Node2", "Node3", "Node4", "Node5", "Node6", "Node7", "Node8",
            "Node9", "Node10", "Node11", "Node12", "Node13", "Node14", "Node15", "Node16"];*/

   var nodes = getNodes();
   //var nodes1 = angular.element(document.getElementById('myId')).scope();
   //console.log("undefined? :(");
   //console.log(nodes1);
   var matrix = getMatrix(nodes);

   var rotation = -0.7;

   var chord_options = {
      "gnames": nodes,
      "rotation": rotation,
      "colors": ["rgb(233,222,187)","rgb(255,205,243)","rgb(255,255,155)",
                 "rgb(0,0,0)","rgb(87,87,87)","rgb(173,35,35)",
                 "rgb(42,75,215)","rgb(29,105,20)","rgb(129,74,25)",
                 "rgb(255,146,51)","rgb(255,238,51)","rgb(129,38,192)",
                 "rgb(160,160,160)","rgb(129,197,122)","rgb(157,175,215)",
                 "rgb(41,208,208)"]
   };

   function Chord(container, options, matrix) {

      // initialize the chord configuration variables
      var config = {
         width: 800,
         height: 800,
         rotation: 0,
         textgap: 26,
         colors: ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f", "#bf5b17", "#666666"]
      };

      // add options to the chord configuration object
      if (options) {
         extend(config, options);
      }

      // set chord visualization variables from the configuration object
      var offset = Math.PI * config.rotation,
            width = config.width,
            height = config.height,
            textgap = config.textgap
      colors = config.colors;

      // set viewBox and aspect ratio to enable a resize of the visual dimensions
      var viewBoxDimensions = "0 0 " + width + " " + height,
            aspect = width / height;

      if (config.gnames) {
         gnames = config.gnames;
      } else {
         // make a list of names
         gnames = [];
         for (var i=97; i<matrix.length; i++) {
            gnames.push(String.fromCharCode(i));
         }
      }

      // start the d3 magic
      var chord = d3.layout.chord()
            .padding(0.05)
            .sortSubgroups(d3.descending)
            .matrix(matrix);

      var innerRadius = Math.min(width, height) * 0.31,
            outerRadius = innerRadius * 1.1;

      var fill = d3.scale.ordinal()
            .domain(d3.range(matrix.length-1))
            .range(colors);

      var svg = d3.select("body").append("svg")
            .attr("id", "visual")
            .attr("viewBox", viewBoxDimensions)
            .attr("preserveAspectRatio", "xMinYMid")    // add viewBox and preserveAspectRatio
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var g = svg.selectAll("g.group")
            .data(chord.groups)
            .enter().append("svg:g")
            .attr("class", "group");

      g.append("svg:path")
            .style("fill", function(d) { return fill(d.index); })
            .style("stroke", function(d) { return fill(d.index); })
            .attr("id", function(d, i) { return "group" + d.index; })
            .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius).startAngle(startAngle).endAngle(endAngle))
            .on("mouseover", fade(0.1))
            .on("mouseout", fade(1));

      g.append("svg:text")
            .each(function(d) {d.angle = ((d.startAngle + d.endAngle) / 2) + offset; })
            .attr("dy", ".35em")
            .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .attr("transform", function(d) {
                     return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                           "translate(" + (outerRadius + textgap) + ")" +
                           (d.angle > Math.PI ? "rotate(180)" : "");
                  })
            .text(function(d) { return gnames[d.index]; });

      svg.append("g")
            .attr("class", "chord")
            .selectAll("path")
            .data(chord.chords)
            .enter().append("path")
            .attr("d", d3.svg.chord().radius(innerRadius).startAngle(startAngle).endAngle(endAngle))
            .style("fill", function(d) { return fill(d.source.index); })
            .style("opacity", 1)
            .append("svg:title")
            .text(function(d) {
                     return  d.source.value + " messages from " + gnames[d.source.index] +
                           " sent to " + gnames[d.target.index];
                  });

      // helper functions start here

      function startAngle(d) {
         return d.startAngle + offset;
      }

      function endAngle(d) {
         return d.endAngle + offset;
      }

      function extend(a, b) {
         for( var i in b ) {
            a[ i ] = b[ i ];
         }
      }

      // Returns an event handler for fading a given chord group.
      function fade(opacity) {
         return function(g, i) {
            svg.selectAll(".chord path")
                  .filter(function(d) { return d.source.index != i && d.target.index != i; })
                  .transition()
                  .style("opacity", opacity);
         };
      }


      window.onresize = function() {
         var targetWidth = (window.innerWidth < width)? window.innerWidth : width;

         var svg = d3.select("#visual")
               .attr("width", targetWidth)
               .attr("height", targetWidth / aspect);
      }


   }
   Chord(visual, chord_options, matrix);
   /*window.onload = function() {
      Chord(visual, chord_options, matrix);
   }*/

   d3.select(self.frameElement).style("height", "600px");
