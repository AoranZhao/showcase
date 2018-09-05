var groupRectangles = function(rects, minNeighbors, confluence) {
	var rectsLength = rects.length;
    if (!confluence) confluence = 1.0;
    
	// Partition rects into similarity classes:
	var numClasses = 0;
	var labels = new Array(rectsLength);
	for (var i = 0; i < labels.length; ++i) {
		labels[i] = 0;
    }
    
	for (var i = 0; i < rectsLength; ++i) {
		var found = false;
		for (var j = 0; j < i; ++j) {

			// Determine similarity:
			var rect1 = rects[i];
			var rect2 = rects[j];
	        var delta = confluence * (Math.min(rect1[2], rect2[2]) + Math.min(rect1[3], rect2[3]));
	        if (Math.abs(rect1[0] - rect2[0]) <= delta &&
	        	Math.abs(rect1[1] - rect2[1]) <= delta &&
	        	Math.abs(rect1[0] + rect1[2] - rect2[0] - rect2[2]) <= delta &&
	        	Math.abs(rect1[1] + rect1[3] - rect2[1] - rect2[3]) <= delta) {
                    
				labels[i] = labels[j];
				found = true;
				break;
			}
		}
		if (!found) {
			labels[i] = numClasses++;
		}
    }
    
	// Compute average rectangle (group) for each cluster:
    var groups = new Array(numClasses);
    
	for (var i = 0; i < numClasses; ++i) {
		groups[i] = [0, 0, 0, 0, 0];
    }
    
	for (var i = 0; i < rectsLength; ++i) {
		var rect = rects[i],
			group = groups[labels[i]];
		group[0] += rect[0];
		group[1] += rect[1];
		group[2] += rect[2];
		group[3] += rect[3];
		++group[4];
    }
    
	for (var i = numClasses - 1; i >= 0; --i) {
		var numNeighbors = groups[i][4];
		if (numNeighbors >= minNeighbors) {
			var group = groups[i];
			group[0] /= numNeighbors;
			group[1] /= numNeighbors;
			group[2] /= numNeighbors;
			group[3] /= numNeighbors;
		} else groups.splice(i, 1);
    }
    
	// Filter out small rectangles inside larger rectangles:
	var filteredGroups = [];
	for (var i = 0; i < numClasses; ++i) {
        var r1 = groups[i];
                
        for (var j = 0; j < numClasses; ++j) {
        	if (i === j) continue;
            var r2 = groups[j];
            var dx = r2[2] * 0.2;
            var dy = r2[3] * 0.2;
                        
            if (r1[0] >= r2[0] - dx &&
                r1[1] >= r2[1] - dy &&
                r1[0] + r1[2] <= r2[0] + r2[2] + dx &&
                r1[1] + r1[3] <= r2[1] + r2[3] + dy) {
            	break;
            }
        }
                
        if (j === numClasses) {
        	filteredGroups.push(r1);
        }
    }
	return filteredGroups;
}

export default {
    groupRectangles: groupRectangles
}