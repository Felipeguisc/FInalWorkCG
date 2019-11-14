//Declaracao de variaveis
var scene,camera,render,canvas,controls,ambientLight,lightPoint,background,linha;
//var cockpit = new Cockpit('cockpit/cockpit5.png');
//texturas
var earthTexture = new THREE.TextureLoader().load( 'textures/8k_earth_daymap.jpg', THREE.SphericalRefractionMapping );
var earthBumpMap = new THREE.TextureLoader().load( 'textures/elev_bump_4k.jpg', THREE.SphericalRefractionMapping );
var earthSpecularMap = new THREE.TextureLoader().load( 'textures/water_4k.png', THREE.SphericalRefractionMapping );
var earthCloudsMap = new THREE.TextureLoader().load( 'textures/fair_clouds_4k.png',THREE.SphericalRefractionMapping );
var moonTexture = new THREE.TextureLoader().load( 'textures/moon.jpg', THREE.SphericalRefractionMapping );
var moonBumpMap = new THREE.TextureLoader().load( 'textures/moonbump4k.jpg', THREE.SphericalRefractionMapping );
var jupiterTexture = new THREE.TextureLoader().load( 'textures/8k_jupiter.jpg' , THREE.SphericalRefractionMapping );
var saturnTexture = new THREE.TextureLoader().load( 'textures/2k_saturn.jpg', THREE.SphericalRefractionMapping );
var sunTexture = new THREE.TextureLoader().load( 'textures/8k_sun.jpg', THREE.SphericalRefractionMapping );
var backgroundTexture = new THREE.TextureLoader().load( 'textures/8k_stars.jpg', THREE.SphericalRefractionMapping );
//variaveis cubo
var cubeGeometry,cubeMaterial,cube;
//variaveis terra
var earthGeometry,earthMaterial,earth,clouds;
var earthX = 50, earthY  = 5, earthZ = 10;
//variaveis sol
var sunGeometry,sunMaterial,sun;
//variaveis jupiter
var jupiterGeometry, jupiterMaterial, jupiter;
//variaveis saturno
var saturnGeometry, saturnMaterial, saturn, saturnRingGeometry1, saturnRingMaterial1, saturnRing1, saturnRingGeometry2, saturnRingMaterial2, saturnRing2;
var saturnX = 210,saturnY = 10,saturnZ = 10;
var AXIS = new THREE.Vector3( 0.25, 1, 0 ).normalize();

var loader = new THREE.GLTFLoader();
var mesh = [];

var p = 0;
var ang = 0;
var xreal = 0;
var yreal = 0;
var pa, pa1;

loadResource('3DModels/x-wing/scene.gltf',0, function() {
  loadResource('3DModels/star_destroyer/scene.gltf',1, function() {
    loadResource('3DModels/death_star_star_wars/scene.gltf',2, function() {
      //All three functions have completed, in order.
      //Ajeitando escalas
      mesh[0].scale.setScalar(0.01,0.01,0.01);
      mesh[1].scale.setScalar(1.5,1.5,1.5);
      mesh[2].scale.setScalar(0.01,0.01,0.01);

      //posicionamento
      mesh[0].position.x = -10;
      mesh[2].position.x = 10;
    });
  });
});
// loadResource('3DModels/x-wing/scene.gltf',0);
// loadResource('3DModels/star_destroyer/scene.gltf',1);
// loadResource('3DModels/death_star_star_wars/scene.gltf',2);

//inicializacao das funcoes
init(function(){
	animate();	
});


//funcao init
function init(callback){

	//
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
	info.innerHTML = 'WASD move, R|F up | down, Q|E roll, up|down pitch, left|right yaw';
	document.body.appendChild( info );

	// renderer
	render = new THREE.WebGLRenderer({ antialias: true });
	render.setSize(window.innerWidth, window.innerHeight);
	render.shadowMap.enabled = true;
	render.shadowMap.type = THREE.BasicShadowMap;

	// scene
	scene = new THREE.Scene();
	scene.add( new THREE.AxisHelper( 50 ) );
	var grid = new THREE.GridHelper(1000, 100, 0x666666, 0x444444)
	grid.rotateY(Math.PI/2);
	scene.add(grid);

	// camera
	camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);

	//canvas
	canvas = render.domElement;
	document.body.appendChild(canvas);

	// controls
	controls = new THREE.OrbitControls( camera );
	// controls = new THREE.FlyControls( camera );
	// controls.rollSpeed = 0.05;
	// axes

	// parent
	parent = new THREE.Object3D();
	scene.add( parent );

	parentSaturn = new THREE.Object3D();
	scene.add( parentSaturn );

	// pivot
	pivot = new THREE.Object3D();
	parent.add( pivot );

	// geometry earth
	earthGeometry = new THREE.SphereGeometry( 3, 100, 100);
	//var sphereMaterial = new THREE.MeshPhongMaterial( {color: 0xffff00} );
	earthMaterial = new THREE.MeshLambertMaterial({ map: earthTexture });
	//earth = new THREE.Mesh( earthGeometry, earthMaterial );
	earth = new THREE.Mesh(
	  earthGeometry,
	  new THREE.MeshPhongMaterial({
	    map: earthTexture,
	    bumpMap: earthBumpMap,
	    bumpScale:   0.055,
	    specularMap: earthSpecularMap,
	    specular: new THREE.Color('grey')      })
	);
	earth.overdraw = true;
	earth.receiveShadow = true;
	earth.castShadow = true;
	earth.position.set(earthX,earthY,earthZ);
	earth.add( new THREE.AxisHelper( 5 ) );
	//scene.add( earth );

	clouds = new THREE.Mesh(
	new THREE.SphereGeometry(3.10, 100, 100),
	  new THREE.MeshPhongMaterial({
	    map: earthCloudsMap,
	    transparent: true
	  })
	);
	clouds.position.set(earthX,earthY,earthZ);
	scene.add(clouds);

	//moon geometry
	moon = new THREE.Mesh(
	new THREE.SphereGeometry(0.5, 100, 100),
	  new THREE.MeshPhongMaterial({
	    map: moonTexture,
	    bumpMap: moonBumpMap,
	    bumpScale: 0.033
	  })
	);
	moon.receiveShadow = true;
	moon.castShadow = true;
	moon.position.set(5,0,0);
	//scene.add(moon);

	// geometry cube
	// cubeGeometry = new THREE.BoxGeometry(1,1,1);
	// cubeMaterial = new THREE.MeshLambertMaterial({color: 0x59fd8b});
	// cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
	// cube.position.set(5,0,0);
	// cube.castShadow = true;
	//scene.add(cube); //Adicionamos cubo a cena

	// geometry sun
	sunGeometry = new THREE.SphereGeometry( 10, 100, 100);
	//var sphereMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });

	sun = new THREE.Mesh( sunGeometry, sunMaterial );
	sun.overdraw = true;
	//sphereSun.castShadow = true;
	sun.position.set(0,0,0);
	//scene.add( sun );

	// saturn geometry
	saturnGeometry = new THREE.SphereGeometry( 7, 100, 100);
	saturnMaterial = new THREE.MeshPhongMaterial( {map: saturnTexture} );
	saturn = new THREE.Mesh(saturnGeometry,saturnMaterial);
	saturn.receiveShadow = true;
	saturn.castShadow = true;
	saturn.position.set(saturnX,saturnY,saturnZ);
	//scene.add(saturn);

	saturnRingGeometry1 = new THREE.RingGeometry( 14, 9, 32 );
	saturnRingMaterial1 = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
	saturnRing1 = new THREE.Mesh( saturnRingGeometry1, saturnRingMaterial1 );
	saturnRing1.position.set(saturnX,saturnY,saturnZ);
	saturnRing1.rotation.x  = 4.5;
	saturnRing1.rotation.z  = 4.5;
	//scene.add( saturnRing1 );

	saturnRingGeometry2 = new THREE.RingGeometry( 16, 14.5, 32 );
	saturnRingMaterial2 = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
	saturnRing2 = new THREE.Mesh( saturnRingGeometry2, saturnRingMaterial2 );
	saturnRing2.position.set(saturnX,saturnY,saturnZ);
	saturnRing2.rotation.x  = 4.5;
	saturnRing2.rotation.z  = 4.5;
	//scene.add( saturnRing2 );

	// jupiter geometry
	jupiterGeometry = new THREE.SphereGeometry( 10, 100, 100);
	jupiterMaterial = new THREE.MeshPhongMaterial( {map: saturnTexture} );
	jupiter = new THREE.Mesh(jupiterGeometry,jupiterMaterial);
	jupiter.receiveShadow = true;
	jupiter.castShadow = true;
	jupiter.position.set(120,20,0);
	scene.add(jupiter);

	// Background
	background = new THREE.Mesh(
	  new THREE.SphereGeometry(400, 64, 64), 
	  new THREE.MeshBasicMaterial({
	    map: backgroundTexture, 
	    side: THREE.BackSide,
	  })
	);
	scene.add(background);

	parent.add( earth );
	parent.add( clouds );
	earth.add( moon );
	earth.add( pivot );
	pivot.add( moon );
	

	parentSaturn.add( saturn );
	parentSaturn.add( saturnRing1 );
	parentSaturn.add( saturnRing2 );

	// mesh


	// axes


	//Luz ambiente com média intensidade
	ambientLight = new THREE.AmbientLight(0x999999);
	scene.add(ambientLight);
	//Adicionamos um ponto de luz
	lightPoint = new THREE.PointLight(0x888888);
	lightPoint.position.set(20,20,20);
	lightPoint.intensity = 3;
	lightPoint.castShadow = true;
	lightPoint.decay = 2;
	scene.add(lightPoint);
	camera.position.y = 10;
	camera.position.z = 30;

	//caminho para nave
	curva = new THREE.SplineCurve( [ 
		new THREE.Vector3(-10,0,0),
		new THREE.Vector3(-5,5,10),
		new THREE.Vector3(0,0,-10),
		new THREE.Vector3(5,-5,0),
		new THREE.Vector3(10,0,0),
		new THREE.Vector3(15,5,20),
		new THREE.Vector3(20,0,0),
		new THREE.Vector3(20,-10,0),
		new THREE.Vector3(-10,-10,0),
		new THREE.Vector3(-10,0,0)
	]);

	var caminho = new THREE.Path( curva.getPoints( 1000 ) );
	var geometriaLinha = caminho.createPointsGeometry( 1000 );
	var materialLinha = new THREE.LineBasicMaterial({ color: 0xffffff});
	var materialPonto = new THREE.PointsMaterial( { size : 10, sizeAttenuation : false } );

	linha = new THREE.Line(geometriaLinha, materialLinha);
	scene.add(linha);

	callback();

}// fim funcao init

//funcao animate
function animate(){
	requestAnimationFrame( animate );

	pa = linha.geometry.vertices[p];
	pa1 = linha.geometry.vertices[p + 1];
	mesh[0].position.x = pa.x;
	mesh[0].position.y = pa.y;

	p += 1;
	if(p == 1000){
		p=0;
	}
	xreal = pa1.y - pa.y;
	yreal = pa1.x - pa.x;
	ang = Math.atan2(yreal, xreal);
	mesh[0].rotation.z = -ang-3.1;

	mesh[0].position.y += 0.1;
	// cube.rotation.x += 0.01;
	// cube.rotation.y += 0.01;
	// cube.rotation.z += 0.01;
	pivot.rotation.y += 0.0015;

	earth.rotation.y += 0.001;
	clouds.rotation.y += 0.0015;
	parent.rotation.y += 0.001;

	sun.rotation.y += 0.0001;
	sun.rotation.x += 0.0001;

	saturn.rotation.y += 0.001;
	parentSaturn.rotation.y += 0.0001;

	controls.update( 0.1 );
	render.render( scene, camera );
}

//funcao para carregamento de modelos 3D,
//recebe o caminho para o Modelo3D e o obj que ira receber o modelo
function loadResource(resource_url,cont, callback){
	loader.load(
	// resource URL
	resource_url,
	// called when the resource is loaded
	function ( gltf ) {

		mesh[cont] = gltf.scene.children[0];
		scene.add( mesh[cont] );
		callback();

		/*
		gltf.animations; // Array<THREE.AnimationClip>
		gltf.scene; // THREE.Scene
		gltf.scenes; // Array<THREE.Scene>
		gltf.cameras; // Array<THREE.Camera>
		gltf.asset; // Object
		*/
	},
	// called while loading is progressing
	function ( xhr ) {console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );},
	// called when loading has errors
	function ( error ) {console.log( 'An error happened' );}
);
}