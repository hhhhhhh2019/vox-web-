const vec = function(x, y, z, w) {
	return {x, y, z, w};
}

const matrix = function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
	return [
		a, e, i, m,
		b, f, j, n,
		c, g, k, o,
		d, h, l, p
	];
}

const rotX = function(v, a) {
	return vec(
		v.x,
		v.y * Math.cos(a) - v.z * Math.sin(a),
		v.y * Math.sin(a) + v.z * Math.cos(a)
	)
}

const rotY = function(v, a) {
	return vec(
		v.x * Math.cos(a) - v.z * Math.sin(a),
		v.y,
		v.x * Math.sin(a) + v.z * Math.cos(a)
	)
}

const rotZ = function(v, a) {
	return vec(
		v.x * Math.cos(a) - v.y * Math.sin(a),
		v.x * Math.sin(a) + v.y * Math.cos(a),
		v.z
	)
}

const makeProjMatrix = function(angle, near, far, asp) {
	/*let right = Math.tan(angle / 2) * asp;
	let left = -right;

	let top = Math.tan(angle / 2);
	let bottom = -top;

	let a = 2 / (right - left);
	let b = 2 / (top - bottom);
	let c = (f - n) / (f + n);
	let d = -2 * f * n / (f - n);

	return matrix(
		a, 0, 0, 0,
		0,-b, 0, 0,
		0, 0, c, 1,
		0, 0, d, 0
	);*/
	var f = 1.0 / Math.tan(angle / 2);
  var rangeInv = 1 / (near - far);

  return [
    f / asp, 0,                          0,   0,
    0,               f,                          0,   0,
    0,               0,    (near + far) * rangeInv,  -1,
    0,               0,  near * far * rangeInv * 2,   0
  ];
}


class Vox {
	constructor(cnv, gltype='webgl') {
		this.canvas = cnv;

		this.gl = this.canvas.getContext(gltype);

		if (this.gl == null) {
			console.log(gltype + ' isn\'t supported on your browser!');
		}

		this.projMatrix = [];
		this.camMvMat = [];
		this.camRotMat = [];

		this.light_dir = vec(0,0,1);
	}

	init(w, h, cw=w, ch=h) {
		if (this.gl) {
			this.gl.viewport(0, 0, w, h);
			this.canvas.width = cw;
			this.canvas.height = ch;

			this.gl.enable(this.gl.DEPTH_TEST);
			this.gl.depthFunc(this.gl.LESS);
		}
	}

	initProjection(angle, n, f) {
		this.projMatrix = makeProjMatrix(angle, n, f, this.gl.drawingBufferWidth / this.gl.drawingBufferHeight);
	}

	createShader(source, type) {
		let shader = this.gl.createShader(type);

		this.gl.shaderSource(shader, source);

		this.gl.compileShader(shader);

		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			alert(this.gl.getShaderInfoLog(shader));
			return null;
		}

		return shader;
	}

	createProgram(vert, frag) {
		let program = this.gl.createProgram();

		this.gl.attachShader(program, this.createShader(vert, this.gl.VERTEX_SHADER));
		this.gl.attachShader(program, this.createShader(frag, this.gl.FRAGMENT_SHADER));

		this.gl.linkProgram(program);

		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
			alert(this.gl.getProgramInfoLog(program));
			return null;
		}

		return program;
	}

	setCameraPosition(camPos) {
		this.camMvMat = matrix(
			1, 0, 0, -camPos.x,
			0, 1, 0, -camPos.y,
			0, 0, 1, -camPos.z,
			0, 0, 0, 1
		)
	}
	
	setCameraRotation(camRot) {
		let bx = vec(1,0,0);
		let by = vec(0,1,0);
		let bz = vec(0,0,1);

		bx = rotX(bx, camRot.x); bx = rotY(bx, camRot.y); bx = rotZ(bx, camRot.z);
		by = rotX(by, camRot.x); by = rotY(by, camRot.y); by = rotZ(by, camRot.z);
		bz = rotX(bz, camRot.x); bz = rotY(bz, camRot.y); bz = rotZ(bz, camRot.z);

		this.camRotMat = matrix(
			bx.x, bx.y, bx.z, 0,
			by.x, by.y, by.z, 0,
			bz.x, bz.y, bz.z, 0,
			0, 0, 0, 1
		)
	}

	setUniform(prog, unifn, value, type) {
		const uniform = this.gl.getUniformLocation(prog, unifn);
		
		//alert(value + "\n" + type)
		
		if (type == "int")
			this.gl.uniform1i(uniform, value);
		else if (type == "float")
			this.gl.uniform1f(uniform, value)
		else if (type == "vec2")
			this.gl.uniform2f(uniform, value.x, value.y);
		else if (type == "vec3")
			this.gl.uniform3f(uniform, value.x, value.y, value.z);
		else if (type == "vec4")
			this.gl.uniform4f(uniform, value.x, value.y, value.z, value.w);
		else if (type == "mat3")
			this.gl.uniformMatrix3fv(uniform, false, value);
		else if (type == "mat4")
			this.gl.uniformMatrix4fv(uniform, false, value);
	}

	draw(verts, normals, prog, unif, rend_type=this.gl.TRIANGLES) {
		this.gl.useProgram(prog);


		let triangles = Math.floor(verts.length / 9);

		for (let i = 0; i < triangles; i++) {
			let vert = verts.slice(i * 9, i * 9 + 9);
			let normal = normals.slice(i * 9, i * 9 + 9);


			const vertexAttribute = this.gl.getAttribLocation(prog, 'aVertexPosition');
		
			const normalAttribute = this.gl.getAttribLocation(prog, 'aNormalDirection');


			this.gl.enableVertexAttribArray(vertexAttribute);

			const vert_buff = this.gl.createBuffer();
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vert_buff);

			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vert), this.gl.STATIC_DRAW);

			this.gl.vertexAttribPointer(vertexAttribute, 3, this.gl.FLOAT, false, 0, 0);


			this.gl.enableVertexAttribArray(normalAttribute);

			const normal_buff = this.gl.createBuffer();
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normal_buff);

			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normal), this.gl.STATIC_DRAW);

			this.gl.vertexAttribPointer(normalAttribute, 3, this.gl.FLOAT, false, 0, 0);


			/*const projMatUniform = this.gl.getUniformLocation(prog, 'projMat');
			this.gl.uniformMatrix4fv(projMatUniform, false, this.projMatrix);

			const camMvMatUniform = this.gl.getUniformLocation(prog, 'camMvMat');
			this.gl.uniformMatrix4fv(camMvMatUniform, false, this.camMvMat);

			const camRotMatUniform = this.gl.getUniformLocation(prog, 'camRotMat');
			this.gl.uniformMatrix4fv(camRotMatUniform, false, this.camRotMat);

			const lightDirUniform = this.gl.getUniformLocation(prog, 'light_direction');
			this.gl.uniform3f(lightDirUniform, this.light_dir.x, this.light_dir.y, this.light_dir.z);*/

			for (let i in unif) {
				this.setUniform(prog, i, unif[i].value, unif[i].type);
			}

			this.setUniform(prog, "projMat", this.projMatrix, "mat4");
			this.setUniform(prog, "camMvMat", this.camMvMat, "mat4");
			this.setUniform(prog, "camRotMat", this.camRotMat, "mat4");
			this.setUniform(prog, "light_direction", vec(0,0,-1), "vec3");


			this.gl.drawArrays(rend_type, 0, 3);
		}
	}

	clear(r, g, b, a) {
		this.gl.clearColor(r, g, b, a);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);

		this.gl.clearColor(0, 0, 0, 1);
		this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
	}
}


class VoxObject {
	constructor(vert, norm, prog, unif={}) {
		this.vert = vert;
		this.norm = norm;
		this.prog = prog;
		
		this.pos = vec(0,0,0);
		
		this.unif = unif;
	}
	
	move(vel) {
		this.pos.x += vel.x; this.pos.y += vel.y; this.pos.z += vel.z;
	}
	
	draw(vox) {
		let mvMat = matrix(
			1,0,0,this.pos.x,
			0,1,0,this.pos.y,
			0,0,1,this.pos.z,
			0,0,0,1
		);
		
		vox.draw(this.vert, this.norm, this.prog, Object.assign(this.unif, {
			"objMvMat": {value: mvMat, type: "mat4"}
		}));
	}
}