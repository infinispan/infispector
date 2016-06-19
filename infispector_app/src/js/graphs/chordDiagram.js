function chordDiagram(options, matrix) {
    unshowFlowDiagram();
    unshowChordDiagram();
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
         .attr("id", "chordDiagram")
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
         .text(function(d) { return gnames[d.index]; })
         .on("click", function(d, i) {clickedNode(gnames[d.index]);});

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
   
   function clickedNode(nodeName) {
       angular.element(document.getElementById('ctrl')).scope().getNodeInfo(nodeName);
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

function unshowChordDiagram() {
    var element = document.getElementById("chordDiagram");
    if (element !== null) {
        element.remove();
    }
}
