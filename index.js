const width = 720;
const height = 480;

const camSpeed = 0.01;
const camRotSpeed = Math.PI * 0.01;

var camPos = vec(0,0,0);
var camRot = vec(0,0,0);

var camPosVel = vec(0,0,0);
var camRotVel = vec(0,0,0);

const cnv = document.getElementById('cnv');

const vox = new Vox(cnv);

vox.init(width, height);

vox.initProjection(30, 0.01, 10000);

const vert = [
	-0.1,-0.1,0.1,
	0.1,-0.1,0.1,
	-0.1,0.1,0.1,

	0.1,0.1,0.1,
	0.1,-0.1,0.1,
	-0.1,0.1,0.1,

	-0.1,-0.1,-0.1,
	0.1,-0.1,-0.1,
	-0.1,0.1,-0.1,

	0.1,0.1,-0.1,
	0.1,-0.1,-0.1,
	-0.1,0.1,-0.1,

	-0.1,-0.1,-0.1,
	-0.1,0.1,-0.1,
	-0.1,-0.1,0.1,

	-0.1,0.1,0.1,
	-0.1,0.1,-0.1,
	-0.1,-0.1,0.1,

	0.1,-0.1,-0.1,
	0.1,0.1,-0.1,
	0.1,-0.1,0.1,

	0.1,0.1,0.1,
	0.1,0.1,-0.1,
	0.1,-0.1,0.1,

	0.1,-0.1,0.1,
	-0.1,-0.1,0.1,
	0.1,-0.1,-0.1,

	-0.1,-0.1,0.1,
	-0.1,-0.1,-0.1,
	0.1,-0.1,-0.1,

	0.1,0.1,0.1,
	-0.1,0.1,0.1,
	0.1,0.1,-0.1,

	-0.1,0.1,0.1,
	-0.1,0.1,-0.1,
	0.1,0.1,-0.1,
];

const normal = [
	0,0,-1,
	0,0,-1,
	0,0,-1,

	0,0,-1,
	0,0,-1,
	0,0,-1,

	0,0,1,
	0,0,1,
	0,0,1,

	0,0,1,
	0,0,1,
	0,0,1,

	-1,0,0,
	-1,0,0,
	-1,0,0,

	-1,0,0,
	-1,0,0,
	-1,0,0,

	1,0,0,
	1,0,0,
	1,0,0,

	1,0,0,
	1,0,0,
	1,0,0,

	0,-1,0,
	0,-1,0,
	0,-1,0,

	0,-1,0,
	0,-1,0,
	0,-1,0,

	0,1,0,
	0,1,0,
	0,1,0,

	0,1,0,
	0,1,0,
	0,1,0,
];

const std_prog = vox.createProgram(readFile("shader.vert"), readFile("shader.frag"));

document.onkeydown = function(e) {
	if (e.key == "w") camPosVel.z = -camSpeed;
	else if (e.key == "s") camPosVel.z = camSpeed;

	else if (e.key == "a") camPosVel.x = camSpeed;
	else if (e.key == "d") camPosVel.x = -camSpeed;

	else if (e.key == "q") camPosVel.y = -camSpeed;
	else if (e.key == "e") camPosVel.y = camSpeed;


	if (e.key == "ArrowLeft") camRotVel.y = camRotSpeed;
	else if (e.key == "ArrowRight") camRotVel.y = -camRotSpeed;

	else if (e.key == "ArrowUp") camRotVel.x = -camRotSpeed;
	else if (e.key == "ArrowDown") camRotVel.x = camRotSpeed;
}

document.onkeyup = function(e) {
	if (e.key == "w") camPosVel.z = 0;
	else if (e.key == "s") camPosVel.z = 0;

	else if (e.key == "a") camPosVel.x = 0;
	else if (e.key == "d") camPosVel.x = 0;

	else if (e.key == "q") camPosVel.y = 0;
	else if (e.key == "e") camPosVel.y = 0;

	if (e.key == "ArrowLeft") camRotVel.y = 0;
	else if (e.key == "ArrowRight") camRotVel.y = 0;

	else if (e.key == "ArrowUp") camRotVel.x = 0;
	else if (e.key == "ArrowDown") camRotVel.x = 0;
}

const obj = new VoxObject(vert, normal, std_prog);
obj.pos = vec(0,0,-0.5);

const update = function() {
	vox.clear(0,0,0,1);

	let cvel = rotZ(rotY(rotX(camPosVel, camRot.x), camRot.y), camRot.z);

	camPos.x += cvel.x; camPos.y += cvel.y; camPos.z += cvel.z;
	camRot.x += camRotVel.x; camRot.y += camRotVel.y; camRot.z += camRotVel.z;

	vox.setCameraPosition(camPos);
	vox.setCameraRotation(camRot);

	obj.draw(vox);
	
	//obj.pos.x += 1;

	requestAnimationFrame(update);
}

update();