var cnv = document.getElementById("placeholder");
var camera = document.getElementById("camera");

cnv.width = camera.getBoundingClientRect().width;
cnv.height = camera.getBoundingClientRect().height;

var c = cnv.getContext("2d");
var w = cnv.width;
var h = cnv.height;
var speed = 0.7;
var lineLen = 175;
var pointNum = 30; //reduce this number if experiencing lag
var points = [];

function draw() {
	c.clearRect(0,0,cnv.width, cnv.height);
	c.fillStyle = "rgb(10, 11, 24)";
	c.fillRect(0,0,cnv.width, cnv.height);
	let curpoint = 0;
	points.forEach(point=>{
		point.x+=point.dx;
		point.y+=point.dy;
		if (point.x<0||point.y<0||point.x>w||point.y>h) {
			points.splice(curpoint,1);
			genRandPoints(1);
		}
		for (var i = points.length - 1; i >= 0; i--) {
			var sqrt = Math.sqrt(Math.pow((point.x-points[i].x),2)+Math.pow((point.y-points[i].y),2));
			if(sqrt<=lineLen) {
				c.beginPath();
				c.moveTo(points[i].x,points[i].y);
				c.strokeStyle=`rgba(110,110,200,${(lineLen-sqrt)/lineLen})`;
				c.lineWidth=0.5;
				c.lineTo(point.x,point.y);
				c.stroke();
			}
		}
		curpoint++;
	});
	requestAnimationFrame(draw);
}

draw();

function genRandPoints(r) {
	for (var i = r; i > 0; i--) {
		switch(Math.floor(Math.random()*6)) {
			case 0:
				points.push({
					x: 0,
					y: Math.floor(Math.random()*h)+1,
					dx: Math.random()*speed,
					dy: Math.random()*speed*(Math.floor(Math.random()*2)=== 1 ? 1 : -1)
				});
			break;
			case 1:
				points.push({
					x: w,
					y: Math.floor(Math.random()*h)+1,
					dx: -1*(Math.random()*speed),
					dy: Math.random()*speed*(Math.floor(Math.random()*2)=== 1 ? 1 : -1)
				});
			break;
			case 2:
				points.push({
					x: Math.floor(Math.random()*w)+1,
					y: 0,
					dx: Math.random()*speed*(Math.floor(Math.random()*2) === 1 ? 1 : -1),
					dy: Math.random()*speed
				});
			break;
			case 3:
				points.push({
					x: Math.floor(Math.random()*w)+1,
					y: h,
					dx: Math.random()*speed*(Math.floor(Math.random()*2) === 1 ? 1 : -1),
					dy: -1*(Math.random()*speed)
				});
			break;
			default:
				if (Math.floor(Math.random()*2)===1) {
					points.push({
						x: Math.floor(Math.random()*w)+1,
						y: 0,
						dx: Math.random()*speed*(Math.floor(Math.random()*2) === 1 ? 1 : -1),
						dy: Math.random()*speed
					});
				} else {
					points.push({
						x: Math.floor(Math.random()*w)+1,
						y: h,
						dx: Math.random()*speed*(Math.floor(Math.random()*2) === 1 ? 1 : -1),
						dy: -1*(Math.random()*speed)
					});
				}
			break;
		}
	}
}
genRandPoints(pointNum);