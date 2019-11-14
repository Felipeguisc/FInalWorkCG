//Objeto cena é quem gerencia tudo que deve existir em uma cena
var scene = new THREE.Scene();
//Camera é uma configuração sobre comom e de que posição iremos observar a cena
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//Renderizador utilizará a cena e a câmera para exibir a imagem
var render = new THREE.WebGLRenderer();
render.setSize(window.innerWidth, window.innerHeight);
//O canvas será construído pelo renderizador
var canvas = render.domElement;
document.body.appendChild(canvas);

//controls
var controls = new THREE.OrbitControls( camera );

//Todo objeto é composto de geometria e de materiais
var cubeGeometry = new THREE.BoxGeometry(1,1,1);
var cubeMaterial = new THREE.MeshLambertMaterial({color: 0x59fd8b});
var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.x = -6;
cube.castShadow = true;
scene.add(cube); //Adicionamos cubo a cena
// Segundo Objeto
var sphereGeometry = new THREE.SphereGeometry( 3, 100, 100);
//var sphereMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
var sphereMaterial = new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('images/earth4k.jpg',THREE.SphericalRefractionMapping) });

var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
sphere.overdraw = true;
sphere.castShadow = true;
sphere.position.set(-10,0,0);
scene.add( sphere );
//

// Terceiro Objeto
var sphereSunGeometry = new THREE.SphereGeometry( 5, 100, 100);
//var sphereMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
var sphereSunMaterial = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/sun.jpg',THREE.SphericalRefractionMapping) });

var sphereSun = new THREE.Mesh( sphereSunGeometry, sphereSunMaterial );
sphereSun.overdraw = true;
//sphereSun.castShadow = true;
sphereSun.position.set(10,0,0);
scene.add( sphereSun );
//
//Globo gigante
var background = new THREE.Mesh(
  new THREE.SphereGeometry(90, 64, 64), 
  new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('images/stars4k2.png'), 
    side: THREE.BackSide
  })
);
scene.add(background);

var loader = new THREE.FontLoader();

loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

	var geometry = new THREE.TextGeometry( 'Hello three.js!', {
		font: font,
		size: 80,
		height: 5,
		curveSegments: 12,
		bevelEnabled: true,
		bevelThickness: 10,
		bevelSize: 8,
		bevelOffset: 0,
		bevelSegments: 5
	} );
} );

//Luz ambiente com média intensidade
var ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);
//Adicionamos um ponto de luz
var lightPoint = new THREE.PointLight(0x888888);
lightPoint.position.set(10,0,0);
lightPoint.intensity = 3;
scene.add(lightPoint);
camera.position.z = 10;

function draw(){
	render.render(scene, camera);
	requestAnimationFrame(draw);
	cube.rotation.x += 0.01;
	//cube.rotation.y += 0.01;
	//cube.rotation.z += 0.01;

	sphere.rotation.y += 0.01;
}
requestAnimationFrame(draw);
/*
//Variáveis para avaliar o deslocamento do mouse
var xi;
var yi;

canvas.addEventListener("mousedown", function(e){
	xi = e.offsetX;
	yi = e.offsetY;
}, false);

canvas.addEventListener("mousemove",function(e){
	if(e.buttons > 0){
		camera.position.x = 8*(xi - e.offsetX) / canvas.width;
		camera.position.y = 8*(e.offsetY - yi) / canvas.height;
	}
}, false);
///////////////////////////////////////////////////////
var pivot, parent, renderer, scene, camera, controls;
var mesh1, mesh2;

var AXIS = new THREE.Vector3( 0.25, 1, 0 ).normalize();

init();
animate();

function init() {

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
	info.innerHTML = 'Drag mouse to rotate camera';
	document.body.appendChild( info );

	// renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// scene
	scene = new THREE.Scene();
	
	// camera
	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 100 );
	camera.position.set( 15, 15, 15 );

	// controls
	controls = new THREE.OrbitControls( camera );
	
	// axes
	scene.add( new THREE.AxisHelper( 20 ) );

	// geometry
	var geometry = new THREE.SphereGeometry( 2, 16, 8 );
	
	// material
	var material1 = new THREE.MeshBasicMaterial( { color: 0xffff00, wireframe: true } );
	var material2 = new THREE.MeshBasicMaterial( { color: 0x00aa00, wireframe: true } );

	// parent
	parent = new THREE.Object3D();
	scene.add( parent );

    // pivot
	pivot = new THREE.Object3D();
	parent.add( pivot );
    
	// mesh
	mesh1 = new THREE.Mesh( geometry, material1 );
	mesh2 = new THREE.Mesh( geometry, material2 );
	mesh2.position.x = 7;
    mesh2.scale.multiplyScalar( 0.5 );
	parent.add( mesh1 );
	pivot.add( mesh2 );
	
    // axes
    mesh2.add( new THREE.AxisHelper( 2.5 ) );

}

function animate() {

	requestAnimationFrame( animate );

    mesh1.rotation.y += 0.005;
    pivot.rotation.y += 0.01;
	mesh2.rotateOnAxis( AXIS, 0.01 );

	renderer.render( scene, camera );

}*/