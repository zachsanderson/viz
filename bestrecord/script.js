// var seasondata = [];

function doSomethingWithData(jsondata) {
	console.log(jsondata);
}

d3.json("seasons.json", doSomethingWithData);
