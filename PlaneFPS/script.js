//Declaracao de variaveis
var scene,camera,render,canvas,controls,ambientLight,lightPoint,background,raycaster;

var mesh,meshFloor,meshCube, meshSphere, meshPoint;

var material, cubeCamera;

//xSauceCode controls
var keyboard = {};
var player = { height:1.8, speed:0.2, turnSpeed:Math.PI*0.02, canShoot:0 };

// instantiate a loader
var loaderObj = new THREE.OBJLoader();
var mtlLoader = new THREE.MTLLoader();

var loadingScreen = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(90, 1280/720, 0.1, 100),
	box: new THREE.Mesh(
		new THREE.BoxGeometry(0.5,0.5,0.5),
		new THREE.MeshBasicMaterial({ color:0x4444ff })
	)
};
var loadingManager = null;
var RESOURCES_LOADED = false;
var selectShotgun = false;

// Models index
var models = {
	tree: {
		obj:"plane/tree/tree.obj",
		mtl:"plane/tree/tree.mtl",
		mesh: null
	},
	pistol: {
		obj:"plane/guns/untitled.obj",
		mtl:"plane/guns/untitled.mtl",
		mesh: null,
		castShadow:true
	},
	shotgun: {
		obj:"plane/guns/shotgun.obj",
		mtl:"plane/guns/shotgun.mtl",
		mesh: null
	}
};

// Meshes index
var meshes = {};

// Bullets array
var bullets = [];

init(function(){
	window.addEventListener('keydown', keyDown);
	window.addEventListener('keyup', keyUp);
	animate();
});

function init(callback){

	// info
	info = document.createElement( 'div' );
	info.style.position = 'absolute';
	info.style.top = '30px';
	info.style.width = '100%';
	info.style.textAlign = 'center';
	info.style.color = '#fff';
	info.style.fontWeight = 'bold';
	info.style.backgroundColor = 'transparent';
	info.style.zIndex = '1';
	info.style.fontFamily = 'Monospace';
	info.innerHTML = 'WASD move, left|right camera';
	document.body.appendChild( info );

	// scene
	scene = new THREE.Scene();

	loadingScreen.box.position.set(0,0,5);
	loadingScreen.camera.lookAt(loadingScreen.box.position);
	loadingScreen.scene.add(loadingScreen.box);
	
	loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = function(item, loaded, total){
		console.log(item, loaded, total);
	};
	loadingManager.onLoad = function(){
		console.log("loaded all resources");
		RESOURCES_LOADED = true;
		onResourcesLoaded();
	};

	// renderer
	render = new THREE.WebGLRenderer({ antialias: true });
	render.setSize(window.innerWidth, window.innerHeight);
	render.shadowMap.enabled = true;
	render.shadowMap.type = THREE.BasicShadowMap;

	// raycaster
	raycaster = new THREE.Raycaster();
	raycaster.far = 100;
	raycaster.near = 0.25;

	//camera
	camera = new THREE.PerspectiveCamera(90, 1280/720, 0.1, 300);
	camera.position.z = 5;
	
	//canvas
	canvas = render.domElement;
	document.body.appendChild(canvas);

	//ground
	var textureLoader = new THREE.TextureLoader();
	var floorTexture = textureLoader.load("plane/grass.jpg");
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
	floorTexture.repeat.set(10,10);
	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(80,80, 10,10),
		new THREE.MeshLambertMaterial({color:0xA3A3A3,map:floorTexture})
	);
	meshFloor.rotation.x -= Math.PI / 2;
	meshFloor.receiveShadow = true;
	meshFloor.castShadow = true;
	scene.add(meshFloor);

	//Cube
	meshCube = new THREE.Mesh(
		new THREE.BoxGeometry(1,1,1),
		new THREE.MeshPhongMaterial({color:0xff4444})
	);
	meshCube.position.y += 2;
	meshCube.receiveShadow = true;
	meshCube.castShadow = true;
	scene.add(meshCube);

	//Sphere
	cubeCamera = new THREE.CubeCamera(0.6,100,256);
	cubeCamera.position.set(-5,2,6);
	cubeCamera.renderTarget.texture.generateMipmaps = true;
	cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter;
	scene.add(cubeCamera);

	material = new THREE.MeshBasicMaterial({
		envMap: cubeCamera.renderTarget.texture
	});

	meshSphere = new THREE.Mesh(
		new THREE.SphereGeometry(0.5,100,100),
		material
	);
	//new THREE.MeshPhongMaterial({color:0xff4444})
	meshSphere.position.set(-5,2,6);
	meshSphere.receiveShadow = true;
	meshSphere.castShadow = true;
	scene.add(meshSphere);


	//Luz ambiente com média intensidade
	ambientLight = new THREE.AmbientLight(0x666666);
	scene.add(ambientLight);

	//Adicionamos um ponto de luz
	lightPoint = new THREE.PointLight(0x888888);
	lightPoint.position.set(20,20,20);
	lightPoint.intensity = 2;
	lightPoint.castShadow = true;
	lightPoint.decay = 2;
	scene.add(lightPoint);

	lightPoint.shadow.mapSize.width = 1024; // default is 512
	lightPoint.shadow.mapSize.height = 1024; // default is 512

	//Skybox
	var loaderBox = new THREE.CubeTextureLoader();
  	let textureBack = loaderBox.load([
    'background/ame_desert/desertsky_ft.png',
    'background/ame_desert/desertsky_bk.png',
    'background/ame_desert/desertsky_up.png',
    'background/ame_desert/desertsky_dn.png',
    'background/ame_desert/desertsky_rt.png',
    'background/ame_desert/desertsky_lf.png'
 	 ]);
  	scene.background = textureBack;

  	// Load models
	// REMEMBER: Loading in Javascript is asynchronous, so you need
	// to wrap the code in a function and pass it the index. If you
	// don't, then the index '_key' can change while the model is being
	// downloaded, and so the wrong model will be matched with the wrong
	// index key.
	for( var _key in models ){
		(function(key){
			
			var mtlLoader = new THREE.MTLLoader(loadingManager);
			mtlLoader.load(models[key].mtl, function(materials){
				materials.preload();
				
				var objLoader = new THREE.OBJLoader(loadingManager);
				
				objLoader.setMaterials(materials);
				objLoader.load(models[key].obj, function(mesh){
					
					mesh.traverse(function(node){
						if( node instanceof THREE.Mesh ){
							if('castShadow' in models[key])
								node.castShadow = models[key].castShadow;
							else
								node.castShadow = true;
							
							if('receiveShadow' in models[key])
								node.receiveShadow = models[key].receiveShadow;
							else
								node.receiveShadow = true;
						}
					});
					models[key].mesh = mesh;
					
				});
			});
			
		})(_key);
	}

	camera.position.set(0, player.height, -5);
	camera.lookAt(new THREE.Vector3(0,player.height,0));

	console.log(scene);

	callback();
}

function animate(){

	var time = Date.now() * 0.0005;

	// Play the loading screen until resources are loaded.
	if( RESOURCES_LOADED == false ){
		requestAnimationFrame(animate);
		
		loadingScreen.box.position.x -= 0.05;
		if( loadingScreen.box.position.x < -10 ) loadingScreen.box.position.x = 10;
		loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);
		
		render.render(loadingScreen.scene, loadingScreen.camera);
		return;
	}
    
	requestAnimationFrame( animate );

	meshCube.rotation.z += 0.002;
	meshCube.rotation.x += 0.005;
	meshCube.rotation.y += 0.001;

	// go through bullets array and update position
	// remove bullets when appropriate
	for(var index=0; index<bullets.length; index+=1){
		if( bullets[index] === undefined ) continue;
		if( bullets[index].alive == false ){
			bullets.splice(index,1);
			continue;
		}
		
		bullets[index].position.add(bullets[index].velocity);
	}

	if(keyboard[87]){ // W key
		camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
		camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[83]){ // S key
		camera.position.x += Math.sin(camera.rotation.y) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[65]){ // A key
		camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
	}
	if(keyboard[68]){ // D key
		camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
	}
	
	if(keyboard[37]){ // left arrow key
		camera.rotation.y -= player.turnSpeed;
	}
	if(keyboard[38]){ // up arrow key
		//camera.rotation.x -= camera.rotation.y*player.turnSpeed;
	}
	if(keyboard[39]){ // right arrow key
		camera.rotation.y += player.turnSpeed;
	}
	if(keyboard[40]){ // down arrow key
		//camera.rotation.x += camera.rotation.y*player.turnSpeed;
	}

	// shoot a bullet
	if(keyboard[32] && player.canShoot <= 0){ // spacebar key
		//raycaster
		raycaster.setFromCamera( new THREE.Vector2(), camera );  
		var intersecta = raycaster.intersectObjects( scene.children );
	    
	    var dist = Math.POSITIVE_INFINITY;
	    if (intersecta.length > 0) {
	    	setTimeout(function(){
			bullet.alive = false;
			scene.remove(bullet);
			scene.remove(intersecta[0].object);
			}, 40*intersecta[0].distance);        
	    }
		// creates a bullet as a Mesh object
		var bullet = new THREE.Mesh(
			new THREE.SphereGeometry(0.05,8,8),
			new THREE.MeshBasicMaterial({color:0xffffff})
		);
		// this is silly.
		//var bullet = models.tree.mesh.clone();
		
		// position the bullet to come from the player's weapon
		bullet.position.set(
			meshes["playerweapon"].position.x,
			meshes["playerweapon"].position.y + 0.15,
			meshes["playerweapon"].position.z
		);
		
		// set the velocity of the bullet
		bullet.velocity = new THREE.Vector3(
			-Math.sin(camera.rotation.y),
			0,
			Math.cos(camera.rotation.y)
		);
		
		// after 1000ms, set alive to false and remove from scene
		// setting alive to false flags our update code to remove
		// the bullet from the bullets array
		bullet.alive = true;
		setTimeout(function(){
			bullet.alive = false;
			scene.remove(bullet);
		}, 2000);
		
		// add to scene, array, and set the delay to 10 frames
		bullets.push(bullet);
		scene.add(bullet);
		player.canShoot = 10;
	}
	if(player.canShoot > 0) player.canShoot -= 1;

	// position the gun in front of the camera
	if(keyboard[16]){ // Shift key
		meshes["playerweapon"] = models.shotgun.mesh.clone();
		meshes["playerweapon"].scale.set(14,10,12);
		scene.add(meshes["playerweapon"]);
	}

	meshes["playerweapon"].position.set(
		camera.position.x - Math.sin(camera.rotation.y + Math.PI/6) * 0.75,
		camera.position.y - 0.5 + Math.sin(time*4 + camera.position.x + camera.position.z)*0.01,
		camera.position.z + Math.cos(camera.rotation.y + Math.PI/6) * 0.75
		);
		meshes["playerweapon"].rotation.set(
		camera.rotation.x,
		camera.rotation.y - Math.PI,
		camera.rotation.z
	);

	//meshSphere.visible = false;
	material.envMap = cubeCamera.renderTarget.texture;
	cubeCamera.update(render, scene);
	//meshSphere.visible = true;
    
	render.render( scene, camera );

}

function keyDown(event){
	keyboard[event.keyCode] = true;
}

function keyUp(event){
	keyboard[event.keyCode] = false;
}

// Runs when all resources are loaded
function onResourcesLoaded(){
	
	// Clone models into meshes.
	meshes["tree"] = models.tree.mesh.clone();

	// Reposition individual meshes, then add meshes to scene
	meshes["tree"].position.set(10, 0, 7);
	scene.add(meshes["tree"]);
	
	// player weapon
	meshes["playerweapon"] = models.pistol.mesh.clone();
	meshes["playerweapon"].position.set(0,2,0);
	meshes["playerweapon"].scale.set(14,10,12);
	scene.add(meshes["playerweapon"]);

	// shotgun on floor
	meshes["shotgun"] = models.shotgun.mesh.clone();
	meshes["shotgun"].position.set(5,0,-5);
	meshes["shotgun"].scale.set(14,10,12);
	meshes["shotgun"].rotation.z = Math.PI/2;
	scene.add(meshes["shotgun"]);
}

function loadObjFunction(mtl_path, obj_path){
	mtlLoader.load(mtl_path, function(materials){
		materials.preload();
					
		loaderObj.setMaterials(materials);

		loaderObj.load(obj_path,
			function ( object ) {
				mesh = object.clone();
				
				mesh.receiveShadow = true;
				mesh.traverse(function(child){child.castShadow = true;});

				mesh.position.set(10,0,5);
				scene.add( mesh );
			},
			function ( xhr ) {
				console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
			},
			function ( error ) {
				console.log( 'An error happened' );
			}
		);
	});
}
