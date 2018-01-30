
//Get an Euler Rotation for a given x and y rotation
function rotateAndTilt(x, y) {
	return new THREE.Euler(x * Math.PI / 180, y * Math.PI / 180, 0, 'YXZ');
}

//we'd make one of these constructors for every plant type
function Tree(Type) {
	
	this.trunk = new Type(0);	

	
	//we'd make one of these for every type of obj eg trunk, branch, twig, leaf
	this.newBranch = function(parentPart) {

		var branch = new Type(parentPart.level + 1);
		parentPart.group.add(branch.group);
		parentPart.childParts.push(branch);
		var minAngle = parentPart.minBranchAngle;
		var maxAngle = parentPart.maxBranchAngle;

		//manipulate position and rotation
		branch.group.quaternion.setFromEuler(rotateAndTilt(Math.random() * (maxAngle-minAngle) + minAngle, Math.random() * 360));
		branch.group.position.y = parentPart.height;

	};
	
	var depth = 0;
//this should allow us to setup different rules for different mesh types, triggering on different conditions, but the time stuff is
	this.updateSection = function(part) {
		depth++;
		var age = (Date.now() - part.timestamp + 1)/1000;
		
		part.height = Math.log(age / part.branchTime + 1) / depth;
		
		part.mesh.scale.set(part.height, part.height, part.height);
		
		if (part.straight) {
			this.newBranch(part);
			part.straight = false;;
		};


		while (age > part.branchTime && part.childParts.length < part.numBranches && depth < 7) {
			this.newBranch(part);
		};
		
		var self = this;
		part.childParts.forEach(function(childSection) {
			childSection.group.position.y = part.height;
			self.updateSection(childSection);
		});
		depth--;
	};

};


$(document).ready(function() {

	//setup renderer
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight);
	document.body.appendChild( renderer.domElement);
	
	
	//setup camera
	var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(0, 5, 17);
	camera.lookAt(new THREE.Vector3(0, 5, 0));
	
	
	//setup scene
	var scene = new THREE.Scene();
	
	
	//Setting up lighting
	var light = new THREE.AmbientLight( 0x606060 );
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
	directionalLight.rotation.x -= 35;
	directionalLight.rotation.y += 35;
	scene.add( directionalLight );
	scene.add( light );

	//make new birch object, add it's trunk mesh to scene
	var tree = new Tree(BirchPart);
	scene.add(tree.trunk.group);
	


	//setup animation loop
	function animate() {
		tree.updateSection(tree.trunk);
		tree.trunk.group.rotation.y += 0.005;
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
	};
	animate();
});
