define([
    'underscore',
    'node-uuid',
    'view/diagrams/diagrams',
    'view/components/axis',
    'view/components/filter',
    'view/components/legend'
],function(_, uuid, diagrams, Axis, Filter, Legend){
    function Pane(parent, _options){
	var options = {
	    width: 700,
	    height: 500,
	    margin: {top: 30, bottom: 80, left: 80, right: 30},
	    xrange: [0,0],
	    yrange: [0,0],
	    x_label:'X',
	    y_label:'Y',
	    zoom: true,
	    grid: true,
	    scale: 'fixed',
	    bg_color: '#eee',
	    grid_color: '#fff',
	    legend: false,
	    legend_width: 100,
	    legend_options: {}
	};
	if(arguments.length>1)_.extend(options, _options);

	var model = parent.append("svg")
	    .attr("width", options.width)
	    .attr("height", options.height);

	var inner_width = options.width - options.margin.left - options.margin.right;
	var inner_height = options.height - options.margin.top - options.margin.bottom;
	if(options.legend){
	    inner_width -= options.legend_width;
	}
	var ranges = {x:[0,inner_width], y:[inner_height,0]};
	var scales = {};

	_.each({x:'xrange',y:'yrange'},function(val, key){
	    if(options[val].length > 2 || _.any(options[val], function(el){return !isFinite(el);}))
		scales[key] = d3.scale.ordinal().domain(options[val]).rangeBands(ranges[key]);
	    else
		scales[key] = d3.scale.linear().domain(options[val]).range(ranges[key]);
	});

	model.append("g")
	    .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")")
	    .append("rect")
	    .attr("x", 0)
	    .attr("y", 0)
	    .attr("width", inner_width)
	    .attr("height", inner_height)
	    .attr("stroke", "#000000")
	    .attr("stroke_width", 2)
	    .attr("fill", options.bg_color);

	var axis = new Axis(model.select("g"), scales, {
	    width:inner_width, 
	    height:inner_height,
	    margin:options.margin,
	    grid:options.grid,
	    x_label:options.x_label,
	    y_label:options.y_label,
	    stroke_color: options.grid_color
	});

	model.select("g")
	    .append("g")
	    .attr("class", "context")
	    .append("clipPath")
	    .attr("id", "clip_context")
	    .append("rect")
	    .attr("x", 0)
	    .attr("y", 0)
	    .attr("width", inner_width)
	    .attr("height", inner_height);

	if(options.legend){
	    var legend_space = model.select("g")
		.append("g")
		.attr("transform", "translate(" + inner_width + ",0)");

	    options.legend_options['height'] = inner_height;
	    options.legend_options['width'] = options.legend_width;
	    this.legend = new Legend(legend_space, options.legend_options);
	}

	this.diagrams = [];
	this.context = model.select(".context");
	this.scales = scales;
	this.options = options;
	this.filter = null;

	return this;
    }

    Pane.prototype.addDiagram = function(type, data, options){
	_.extend(options, {uuid: uuid.v4()});
	var diagram = new diagrams[type](this.context, this.scales, data, options);
	var legend = this.legend;
	if(this.options.legend){
	    _.each(diagram.legends, function(l){
		legend.add(l['label'], l['color'], l['on'], l['off'], l['mode']);
	    });
	}
	this.diagrams.push(diagram);
    };

    Pane.prototype.addFilter = function(target, options){
	var diagrams = this.diagrams;
	var callback = function(ranges){
	    _.each(diagrams, function(diagram){
		diagram.checkSelectedData(ranges);
	    });
	};
	this.filter = new Filter(this.context, this.scales, callback, options);
    };

    Pane.prototype.selected = function(df_id, rows){
	var diagrams = this.diagrams;
	if(this.options.scale=='fluid'){
	    _.each(diagrams, function(diagram){
		if(diagram.df_id == df_id)diagram.selected(df_id, rows);
	    });
	}
    };

    Pane.prototype.update = function(){
	_.each(this.diagrams, function(diagram){
	    diagram.update();
	});
    };

    return Pane;
});
