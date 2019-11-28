//Declaracao de variaveis
var scene,camera,render,canvas,controls,ambientLight,lightPoint,background;
var linha, x=0, spaceShipSpeed = 1;
var meshWireframe;
//var cockpit = new Cockpit('cockpit/cockpit5.png');
//var backgroundTexture = new THREE.TextureLoader().load( 'textures/8k_stars.jpg', THREE.SphericalRefractionMapping );
//variaveis cubo
var cubeGeometry,cubeMaterial,cube;
//variaveis terra
var earthGeometry,earthMaterial,earth,clouds;
var earthX = -300, earthY  = 5, earthZ = 10;
//variaveis sol
var sunGeometry,sunMaterial,sun;
//variaveis jupiter
var jupiterGeometry, jupiterMaterial, jupiter;
//variaveis saturno
var saturnGeometry, saturnMaterial, saturn, saturnRingGeometry1, saturnRingMaterial1, saturnRing1, saturnRingGeometry2, saturnRingMaterial2, saturnRing2;
var saturnX = 0,saturnY = 10,saturnZ = 1600;
var AXIS = new THREE.Vector3( 0.25, 1, 0 ).normalize();

// Variaveis para curva
var p = 0;
var ang = 0;
var xreal = 0;
var yreal = 0;
var pa, pa1;

//Controls xSaucecode
var keyboard = {};

// instantiate a loader
var loaderObj = new THREE.OBJLoader();
var mtlLoader = new THREE.MTLLoader();
var loader = new THREE.GLTFLoader();
var loaderBox;
var loadingManager = null;

//Imports
// 0 -> x-wing
// 1 -> star-destroyer
// 2 -> Death Star
// 3 -> Millennium Falcon
var mesh = [];
var meshCockpit, meshDeathStar;

// Models Obj index
var models = {
	cockpit: {
		obj:"cockpit/CockpitPro/vrcockpit.obj",
		mtl:"cockpit/CockpitPro/vrcockpit.mtl",
		mesh: null,
		castShadow:false
	}
};

// Meshes index
var meshes = {};

// Carregamento dos modelos 3D no formato GLTF
loadResourceGltf('3DModels/x-wing/scene.gltf',0, function() {
  loadResourceGltf('3DModels/star_destroyer/scene.gltf',1, function() {
    loadResourceGltf('3DModels/death_star_star_wars/scene.gltf',2, function() {
    	loadResourceGltf('3DModels/millennium_falcon/scene.gltf',3, function(){
    		//All four functions have completed, in order.
		      //Ajeitando escalas
		      mesh[0].scale.setScalar(0.01,0.01,0.0);
		      mesh[1].scale.setScalar(1.5,1.5,1.5);
		      mesh[2].scale.setScalar(0.04,0.04,0.04);

		      //posicionamento
		      mesh[0].position.set(-10,0,0);
		      mesh[1].position.set(15,-10,5);
		      mesh[2].position.set(20,-30,-10);
		      mesh[3].position.set(20,30,10);
		      //controls = new THREE.FlyControls( mesh[3] );
		 
    	});
    });
  });
});

//inicializacao das funcoes
init(function(){
	window.addEventListener('keydown', keyDown);
	window.addEventListener('keyup', keyUp);
	//animate();
});

//funcao init
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
	info.innerHTML = 'WASD move, R|F up | down, Q|E roll, up|down pitch, left|right yaw';
	document.body.appendChild( info );

	// info
	info = document.createElement( 'div' );
	info.style.position = 'absolute';
	info.style.top = '70%';
	info.style.width = '100%';
	info.style.left = '40%';
	//info.style.textAlign = 'left';
	info.style.color = '#57f542';
	info.style.fontWeight = 'bold';
	info.style.backgroundColor = 'transparent';
	info.style.zIndex = '1';
	info.style.fontFamily = 'Monospace';
	

	// renderer
	render = new THREE.WebGLRenderer({ antialias: true });
	render.setSize(window.innerWidth, window.innerHeight);
	render.shadowMap.enabled = true;
	render.shadowMap.type = THREE.BasicShadowMap;

	// scene
	scene = new THREE.Scene();
	scene.add( new THREE.AxesHelper( 50 ) );
	//var grid = new THREE.GridHelper(2000, 100, 0x666666, 0x444444)
	//grid.rotateY(Math.PI/2);
	//scene.add(grid);

	// Loading Manager
	loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = function(item, loaded, total){
		console.log(item, loaded, total);
	};
	loadingManager.onLoad = function(){
		console.log("loaded all resources");
		onResourcesLoaded();
	};

	// camera
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.001, 3000);

	//canvas
	canvas = render.domElement;
	document.body.appendChild(canvas);

	// controls
	controls = new THREE.FlyControls( camera );
	controls.rollSpeed = 0.1;
	controls.movementSpeed = 0;
	controls.dragToLook = true;
	
	// axes

	// parent
	parent = new THREE.Object3D();
	scene.add( parent );

	parentSaturn = new THREE.Object3D();
	scene.add( parentSaturn );

	// pivot
	pivot = new THREE.Object3D();
	parent.add( pivot );

	//Carregar Terra e a Lua
	loadEarthAndMoon();

	//Carregar Sol
	loadSun();

	//Carregar Saturno e os Aneis
	loadSaturnAndRings();

	//Carregar Jupiter
	loadJupiter();

	// Background
	loaderBox = new THREE.CubeTextureLoader();
  	let textureBack = loaderBox.load([
    'textures/background/ame_starfield/starfield_ft.png',
    'textures/background/ame_starfield/starfield_bk.png',
    'textures/background/ame_starfield/starfield_up.png',
    'textures/background/ame_starfield/starfield_dn.png',
    'textures/background/ame_starfield/starfield_rt.png',
    'textures/background/ame_starfield/starfield_lf.png'
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

	parent.add( earth );
	parent.add( clouds );
	earth.add( moon );
	earth.add( pivot );
	pivot.add( moon );

	parentSaturn.add( saturn );
	parentSaturn.add( saturnRing1 );
	//parentSaturn.add( saturnRing2 );

	//Luz ambiente com média intensidade
	ambientLight = new THREE.AmbientLight(0x333333);
	scene.add(ambientLight);

	//Adicionamos um ponto de luz
	lightPoint = new THREE.PointLight(0x777777);
	lightPoint.position.set(0,0,0);
	lightPoint.castShadow = true;
	lightPoint.intensity = 2;
	lightPoint.decay = 2;
	lightPoint.distance = 0;
	scene.add(lightPoint);

	camera.position.z = 30;

	//teste 0.01
	meshWireframe = new THREE.Mesh(
		new THREE.SphereGeometry(0.00015,10,10),
		new THREE.MeshBasicMaterial({color:0x42b6f5, wireframe:true, transparent:true, opacity: 0.2})
	);
	// meshWireframe.position.z -= 0.15; // Move the mesh
	// meshWireframe.position.x -= 0.1;
	// meshWireframe.position.y -= 0.01;
	meshWireframe.position.z -= 0.00125; // Move the mesh
	meshWireframe.position.x = 0;
	meshWireframe.position.y -= 0.0008;

	meshWireframe.add( new THREE.AxesHelper( 0.00007 ) );

	scene.add(camera);

	camera.add(meshWireframe);
	
	//camera.position.set(0, player.height, -5);
	//camera.lookAt(new THREE.Vector3(0,player.height,0));

	//MELHOR MODELO PARA CAMERA, ACOMPANHA OBJETO
	//camera.position.set( 0, 20, 5 );

	//caminho para nave
	curva = new THREE.SplineCurve( [ 
		new THREE.Vector3(-10,0,0),
		new THREE.Vector3(-5,5,0),
		new THREE.Vector3(0,0,0),
		new THREE.Vector3(5,-5,0),
		new THREE.Vector3(10,0,0),
		new THREE.Vector3(15,5,0),
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

	callback();

}// fim funcao init

//funcao animate
function animate(){
    
	requestAnimationFrame( animate );

	// SpaceShip Compass
	meshWireframe.lookAt(earth.getWorldPosition());

	//Movimento da x-wing
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

	//Movimento star destroyer
	mesh[1].position.z -= 0.01;
	//Fim movimento
	
	// Movimento dos planetas
	pivot.rotation.y += 0.0015;

	earth.rotation.y += 0.001;
	clouds.rotation.y += 0.0015;
	parent.rotation.y += 0.0001;

	sun.rotation.y += 0.0001;
	sun.rotation.x += 0.0001;

	saturn.rotation.y += 0.001;
	parentSaturn.rotation.y += 0.00001;

	jupiter.rotation.y += 0.0001;
	// Fim movimento dos planetas
	
	// Acelerando e freiando a nave do player
	if(keyboard[16]){ // Shift key
		if(controls.movementSpeed<50){
			controls.movementSpeed += 0.1;
			if(camera.fov < 100){
				camera.fov += controls.movementSpeed*0.05;
				camera.updateProjectionMatrix();
			}
		}
		controls.autoForward = true;
	}

	if(keyboard[32]){ // Space key
		if(controls.movementSpeed>0.1){
			controls.movementSpeed -= controls.movementSpeed*0.05;
			camera.fov -= controls.movementSpeed*0.05;
			camera.updateProjectionMatrix();
		} else {
			controls.movementSpeed = 0;
			controls.autoForward = false;
			camera.fov = 70;
			camera.updateProjectionMatrix();
		}
	}

	controls.update( 0.1 );

	info.innerHTML = 'km/s ' + controls.movementSpeed;;
	document.body.appendChild( info );

	//Mover para cima para sensacao de movimento no cockpit
	meshes["cockpit"].position.set(
		camera.position.x,
		camera.position.y,
		camera.position.z
	);
	meshes["cockpit"].rotation.set(
		camera.rotation.x,
		camera.rotation.y,
		camera.rotation.z
	);

	render.render( scene, camera );
}

// Runs when all resources are loaded
function onResourcesLoaded(){
	
	// Clone models into meshes.
	meshes["cockpit"] = models.cockpit.mesh.clone();

	// Reposition individual meshes, then add meshes to scene
	
	// cockpit
	meshes["cockpit"].scale.set(0.001,0.001,0.001);
	scene.add(meshes["cockpit"]);

	animate();
}

//funcao para carregamento de modelos 3D,
//recebe o caminho para o Modelo3D e o obj que ira receber o modelo
function loadResourceGltf(resource_url,cont, callback){
	loader.load(
	// resource URL
	resource_url,
	// called when the resource is loaded
	function ( gltf ) {

		mesh[cont] = gltf.scene.children[0];
		scene.add( mesh[cont] );
		callback();
	},
	// called while loading is progressing
	function ( xhr ) {console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );},
	// called when loading has errors
	function ( error ) {console.log( 'An error happened' );}
);
}


	//Funcoes para caregar os planetas
	function loadSun(){
	let sunTexture = new THREE.TextureLoader().load( 'textures/8k_sun.jpg', THREE.SphericalRefractionMapping );
		// geometry sun
		sunGeometry = new THREE.SphereGeometry( 150, 100, 100);
		//var sphereMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
		sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });

		sun = new THREE.Mesh( sunGeometry, sunMaterial );
		sun.overdraw = true;
		//sphereSun.castShadow = true;
		sun.position.set(0,0,0);
		scene.add( sun );
	}
	function loadEarthAndMoon(){
	let earthTexture = new THREE.TextureLoader().load( 'textures/8k_earth_daymap.jpg', THREE.SphericalRefractionMapping );
	let earthBumpMap = new THREE.TextureLoader().load( 'textures/elev_bump_4k.jpg', THREE.SphericalRefractionMapping );
	let earthSpecularMap = new THREE.TextureLoader().load( 'textures/water_4k.png', THREE.SphericalRefractionMapping );
	let earthCloudsMap = new THREE.TextureLoader().load( 'textures/fair_clouds_4k.png',THREE.SphericalRefractionMapping );
	let moonTexture = new THREE.TextureLoader().load( 'textures/moon.jpg', THREE.SphericalRefractionMapping );
	let moonBumpMap = new THREE.TextureLoader().load( 'textures/moonbump4k.jpg', THREE.SphericalRefractionMapping );
		// geometry earth
		earthGeometry = new THREE.SphereGeometry( 20, 100, 100);
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
		new THREE.SphereGeometry(20.50, 100, 100),
		  new THREE.MeshPhongMaterial({
		    map: earthCloudsMap,
		    transparent: true
		  })
		);
		clouds.position.set(earthX,earthY,earthZ);
		scene.add(clouds);

		//moon geometry
		moon = new THREE.Mesh(
		new THREE.SphereGeometry(3, 100, 100),
		  new THREE.MeshPhongMaterial({
		    map: moonTexture,
		    bumpMap: moonBumpMap,
		    bumpScale: 0.033
		  })
		);
		moon.receiveShadow = true;
		moon.castShadow = true;
		moon.position.set(30,0,0);
		//scene.add(moon);
	}
	function loadSaturnAndRings(){
	let saturnTexture = new THREE.TextureLoader().load( 'textures/2k_saturn.jpg', THREE.SphericalRefractionMapping );
	let saturnRingTexture = new THREE.TextureLoader().load('textures/saturn-rings-top.png');
	let saturnSpecularMap = new THREE.TextureLoader().load('textures/2k_saturn_normal_map.png', THREE.SphericalRefractionMapping);
		// saturn geometry
		saturnGeometry = new THREE.SphereGeometry( 70, 100, 100);
		saturnMaterial = new THREE.MeshPhongMaterial( {	map: saturnTexture} );
		saturn = new THREE.Mesh(saturnGeometry,saturnMaterial);
		//saturn.receiveShadow = true;
		saturn.castShadow = true;
		saturn.position.set(saturnX,saturnY,saturnZ);
		//scene.add(saturn);

		saturnRingGeometry1 = new THREE.RingGeometry( 95, 170, 32 , 5, 0, Math.PI * 2);
		
		let material = new THREE.ShaderMaterial({
		    uniforms: {
		      texture: { value: saturnRingTexture },
		      innerRadius: { value: 95 },
		      outerRadius: { value: 170 }
		    },
		    vertexShader: `
		      varying vec3 vPos;
		      
		      void main() {
		        vPos = position;
		        vec3 viewPosition = (modelViewMatrix * vec4(position, 1.)).xyz;
		        gl_Position = projectionMatrix * vec4(viewPosition, 1.);
		      }
		    `,
		    fragmentShader: `
		      uniform sampler2D texture;
		      uniform float innerRadius;
		      uniform float outerRadius;

		      varying vec3 vPos;

		      vec4 color() {
		        vec2 uv = vec2(0);
		        uv.x = (length(vPos) - innerRadius) / (outerRadius - innerRadius);
		        if (uv.x < 0.0 || uv.x > 1.0) {
		          discard;
		        }
		        
		        vec4 pixel = texture2D(texture, uv);
		        return pixel;
		      }

		      void main() {
		        gl_FragColor = color();
		      }
		    `,
		    transparent: true,
		    side: THREE.DoubleSide
		});

		//saturnRingMaterial1 = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
		//saturnRingMaterial1 = new THREE.MeshBasicMaterial( { map: saturnRingTexture, transparent: true, side: THREE.DoubleSide } );
		saturnRing1 = new THREE.Mesh( saturnRingGeometry1, material );
		saturnRing1.position.set(saturnX,saturnY,saturnZ);
		saturnRing1.receiveShadow = true;
		saturnRing1.rotation.x  = 4.5;
		saturnRing1.rotation.z  = 4.5;
		//scene.add( saturnRing1 );
		console.log('Saturn loaded');
		// saturnRingGeometry2 = new THREE.RingGeometry( 90, 85, 32 );
		// saturnRingMaterial2 = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
		// saturnRing2 = new THREE.Mesh( saturnRingGeometry2, saturnRingMaterial2 );
		// saturnRing2.position.set(saturnX,saturnY,saturnZ);
		// saturnRing2.rotation.x  = 4.5;
		// saturnRing2.rotation.z  = 4.5;
		//scene.add( saturnRing2 );
	}
	function loadJupiter(){
	let jupiterTexture = new THREE.TextureLoader().load( 'textures/8k_jupiter.jpg' , THREE.SphericalRefractionMapping );
		// jupiter geometry
		jupiterGeometry = new THREE.SphereGeometry( 100, 100, 100);
		jupiterMaterial = new THREE.MeshPhongMaterial( {map: jupiterTexture} );
		jupiter = new THREE.Mesh(jupiterGeometry,jupiterMaterial);
		//jupiter.receiveShadow = true;
		jupiter.castShadow = true;
		jupiter.position.set(1500,20,0);
		scene.add(jupiter);
	}

	function onMouseMove( e ) {
                var x = e.pageX - (window.innerWidth/2),
                    y = e.pageY - (window.innerHeight/2),
                    threshold = 10;

                if( (x > 0 && x < threshold) || (x < 0 && x > -threshold) ) {
                    x = 0;
                }

                if( (y > 0 && y < threshold) || (y < 0 && y > -threshold) ) {
                    y = 0;
                }

                mousePos.set( x, y );
            }

            function onKeyDown( e ) {
                var key = e.keyCode;

                // W
                if( key === 87 ) {
                    controls.setForward( true );
                }

                // S
                else if( key === 83 ) {
                    controls.setBackward( true );
                }

                // Q
                else if( key === 81 ) {
                    controls.setRollLeft( true );
                }

                // E
                else if( key === 69 ) {
                    controls.setRollRight( true );
                }

                // A
                else if( key === 65 ) {
                    controls.setLeft( true );
                }

                // D
                else if( key === 68 ) {
                    controls.setRight( true );
                }

                // R
                else if( key === 82 ) {
                    controls.setUp( true );
                }

                // F
                else if( key === 70 ) {
                    controls.setDown( true );
                }
            }

            function onKeyUp( e ) {
                var key = e.keyCode;

                // W
                if( key === 87 ) {
                    controls.setForward( false );
                }

                // S
                else if( key === 83 ) {
                    controls.setBackward( false );
                }

                // Q
                else if( key === 81 ) {
                    controls.setRollLeft( false );
                }

                // E
                else if( key === 69 ) {
                    controls.setRollRight( false );
                }

                // A
                else if( key === 65 ) {
                    controls.setLeft( false );
                }

                // D
                else if( key === 68 ) {
                    controls.setRight( false );
                }

                // R
                else if( key === 82 ) {
                    controls.setUp( false );
                }

                // F
                else if( key === 70 ) {
                    controls.setDown( false );
                }
            }

function keyDown(event){
	keyboard[event.keyCode] = true;
}

function keyUp(event){
	keyboard[event.keyCode] = false;
}
