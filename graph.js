var data = [
	{ 
		name: "San Francisco",
		id: "San Francisco",
		parent: ""
	}
];

var types = new Set();


d3.csv("fire2020.csv").then(function(csv){
  global_csv = csv;
  csv.forEach(function(d){
    types.add(d.CallType);
  });
  createLegend();
  filterDay('2020-04-12');
});

/*data.each(function(n){
  types.add(n.data.CallType);
})*/

arr = [...types].sort();

var color = d3.scaleOrdinal()
.domain(["Alarms", "Assist Police", "Citizen Assist / Service Call", "Confined Space / Structure Collapse", "Electrical Hazard", "Elevator / Escalator Rescue", "Explosion", "Fuel Spill", "Gas Leak (Natural and LP Gases)", "HazMat", "High Angle Rescue", "Medical Incident", "Odor (Strange / Unknown)", "Oil Spill", "Outside Fire", "Smoke Investigation (Outside)", "Structure Fire", "Traffic Collision", "Train / Rail Incident", "Vehicle Fire", "Water Rescue", "Watercraft in Distress"])
.range(["#3957ff", "#d3fe14", "#c9080a", "#fec7f8", "#0b7b3e", "#0bf0e9", "#c203c8", "#fd9b39", "#888593", "#906407", "#98ba7f", "#fe6794", "#10b0ff", "#ac7bff", "#e9700a", "#964c63", "#1da49c", "#0ad811", "#bbd9fd", "#fe6cfe", "#297192", "#d1a09c"]);

function createLegend(){
  
  arr = [...types].sort();

  var color = d3.scaleOrdinal()
  .domain(arr)
  .range(["#3957ff", "#d3fe14", "#c9080a", "#fec7f8", "#0b7b3e", "#0bf0e9", "#c203c8", "#fd9b39", "#888593", "#906407", "#98ba7f", "#fe6794", "#10b0ff", "#ac7bff", "#e9700a", "#964c63", "#1da49c", "#0ad811", "#bbd9fd", "#fe6cfe", "#297192", "#d1a09c"]);

  var legend = d3.select("#legend");

  legend.selectAll("dots")
  .data(arr)
  .enter()
  .append("circle")
    .attr("cx", 20)
    .attr("cy", function(d,i){ return 20 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 7)
    .style("fill", function(d){ return color(d)});

  // Add one dot in the legend for each name.
  legend.selectAll("labels")
    .data(arr)
    .enter()
    .append("text")
      .attr("x", 35)
      .attr("y", function(d,i){ return 20 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
      .text(function(d){ return d})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");

}



function update(str){
  d3.selectAll('svg > g > *').remove();
  while(data.length > 1) {
    data.pop();
  }
  filterDay(str);
}

function filterDay(str) {
	var change = str.split("-");
	var filter = global_csv.filter(function(row) {
		if (row['CallDate'] == change[1]+"/"+change[2]+"/"+change[0]){
			return row;
		}
	});
	buildhierarcy(filter);
}

function buildhierarcy(csv) {

	var numbers = new Set(csv.map(row => row.CallNumber + "," +row.Battalion));
  var battalion = new Set(csv.map(row => row.Battalion));

  battalion.forEach( e => {
  	var bat = {
  		name: e,
  		id: e,
  		parent: "San Francisco"
  	};
  	data.push(bat);
  });

  numbers.forEach( e => {
  	var split3 = e.split(",");
  	var num = {
  		name: split3[0],
  		parent: split3[1]
  	}
  	data.push(num);
  });

  csv.forEach(row => {
    r = {
      CallType: row.CallType,
      CallNumber: row.CallNumber,
      parent: row.CallNumber
    }
    data.push(r);
  });

  root = d3.stratify()
  .id(function(row) { return row.name; })
  .parentId(function(row) {
    return row.parent;
  })
  (data);

  root.count()
  
 root.each(function(node) {
    node.data.leaves = node.value;
  })
  
  root.sum(row => row.size)
  
  root.each(function(node) {
    node.data.total = node.value;
  })

  buildGraph(root);
  buildPlot(root)
}



width = 1000;
height = 1000;
radius = width / 2;
tree = d3.tree()
    .size([2 * Math.PI, radius])
    .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)

function buildGraph(data) {

  data.sort(function(a, b) { 
    return b.height - a.height || b.count - a.count; 
  });

	const root = tree(data);
  
  const svg = d3.select("#vis").append("svg");

  svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
    .selectAll("path")
    .data(root.links())
    .join("path")
      .attr("d", d3.linkRadial()
          .angle(d => d.x)
          .radius(d => d.y));
  
  let circles = svg.append("g")
    .selectAll("circle")
    .data(root.descendants())
    .join("circle")
      .attr("transform", d => `
        rotate(${d.x * 180 / Math.PI - 90})
        translate(${d.y},0)
      `)
      .attr("fill", d => d.children ? "#555" : color(d.data.CallType))
      .attr("r", 2.5);

  svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 18)
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
    .selectAll("text")
    .data(root.descendants())
    .join("text")
      .attr("transform", d => `
        rotate(${d.x * 180 / Math.PI - 90}) 
        translate(${d.y},0) 
        rotate(${d.x >= Math.PI ? 180 : 0})
      `)
      .attr("dy", "0.31em")
      .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
      .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
      .text(d => d.data.id)
    .clone(true).lower()
      .attr("stroke", "white");

  svg.attr("viewBox", [-550, -550, 1100, 1100]).node();

  const g = svg.selectAll("g")
      .attr("cursor", "grab");

  g.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([1, 8])
      .on("zoom", zoomed));

  function dragstarted() {
    d3.select(this).raise();
    g.attr("cursor", "grabbing");
  }

  function dragged(d) {
    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
  }

  function dragended() {
    g.attr("cursor", "grab");
  }

  function zoomed() {
    g.attr("transform", d3.event.transform);
  }

  circles.on("mouseover", function(d) {
      if(!d.children){
        circles.filter(e => (d.data.CallType !== e.data.CallType && !e.children)).transition().attr("visibility", "hidden");
      }
    });

   circles.on("mouseout", function(d) {
      circles.transition().attr("visibility", "visible");
    });

  svg.node();
  setupEvents(svg.append("g"), circles, true);

}

function buildPlot(data) {
  data.sort(function(a, b) { 
    return b.height - a.height || b.count - a.count; 
  });
  
  // make sure value is set

  data.count()

  let pad = 14;
  
  // layout based on width, height minus some padding
  let layout = d3.treemap().padding(5).size([960 - 2 * pad, 500 - 2 * pad]);
  
  layout(data);
  
  let svg = d3.select("#plot");
  
  let plot = svg.append("g")
    .attr("id", "plot")
    .attr("transform", translate(pad, pad));
  
  let rects = plot.selectAll("rect")
    .data(data.descendants())
    .enter()
    .append("rect")
    .attr("x", function(d) { return d.x0; })
    .attr("y", function(d) { return d.y0; })
    .attr("width", function(d) { return d.x1 - d.x0; })
    .attr("height", function(d) { return d.y1 - d.y0; })
    .attr("id", function(d) { return d.data.name; })
    .attr("class", "node")
    .style("fill", function(d) {
        if(d.depth == 0){
          return "#ffd0c2";
        }else if(d.depth == 1){
          return "#ff8ab3";
        }else if(d.depth == 2){
          return "#d65f59";
        }
        return color(d.data.CallType);    
    });
  
  setupEvents(plot, rects, false);

  return svg.node();
}

function translate(x, y) {
    return 'translate(' + String(x) + ',' + String(y) + ')';
}


function setupEvents(g, selection, raise) {
  selection.on('mouseover.highlight', function(d) {
    // https://github.com/d3/d3-hierarchy#node_path
    // returns path from d3.select(this) node to selection.data()[0] root node
    if(d.children){
      let path = d3.select(this).datum().path(selection.data()[0]);
    
      // select all of the nodes on the shortest path
      let update = selection.data(path, node => node.data.name);

      // highlight the selected nodes
      update.classed('selected', true);
      
      if (raise) {
        update.raise();
      }
    }
  });
  
  selection.on('mouseout.highlight', function(d) {
    let path = d3.select(this).datum().path(selection.data()[0]);
    let update = selection.data(path, node => node.data.name);
    update.classed('selected', false);
  });
  
  // show tooltip text on mouseover (hover)
  selection.on('mouseover.tooltip', function(d) {
    showTooltip(g, d3.select(this));
  });
  
  // remove tooltip text on mouseout
  selection.on('mouseout.tooltip', function(d) {
    g.select("#tooltip").remove();
  }); 
}


numberFormat = d3.format(".2~s");

function showTooltip(g, node) {
  let gbox = g.node().getBBox();     // get bounding box of group BEFORE adding text
  let nbox = node.node().getBBox();  // get bounding box of node
  
  // calculate shift amount
  let dx = nbox.width / 2;
  let dy = nbox.height / 2;

  // retrieve node attributes (calculate middle point)
  let x = nbox.x + dx;
  let y = nbox.y + dy;

  // get data for node
  let datum = node.datum();

  let text = "";

  // remove "java.base." from the node name
  let name = datum.data.name
  // use node name and total size as tooltip text
  if(name != null){
    text = `${name} (${numberFormat(datum.data.leaves)} cases)`;
  }else{
    text = `${datum.data.CallNumber}: ${datum.data.CallType}`;
  }
  
  
  // create tooltip
  let tooltip = g.append('text')
    .text(text)
    .attr('x', x)
    .attr('y', y)
    .attr('dy', -dy - 4) // shift upward above circle
    .attr('text-anchor', 'middle') // anchor in the middle
    .attr('id', 'tooltip');

  // it is possible the tooltip will fall off the edge of the
  // plot area. we can detect when this happens, and set the
  // text anchor appropriately

  // get bounding box for the text
  let tbox = tooltip.node().getBBox();

  // if text will fall off left side, anchor at start
  if (tbox.x < gbox.x) {
    tooltip.attr('text-anchor', 'start');
    tooltip.attr('dx', -dx); // nudge text over from center
  }
  // if text will fall off right side, anchor at end
  else if ((tbox.x + tbox.width) > (gbox.x + gbox.width)) {
    tooltip.attr('text-anchor', 'end');
    tooltip.attr('dx', dx);
  }

  // if text will fall off top side, place below circle instead
  if (tbox.y < gbox.y) {
    tooltip.attr('dy', dy + tbox.height);
  }
}
