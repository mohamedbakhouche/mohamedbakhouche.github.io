$(document).ready(function()
    {
            $('#menu-icon').click(function()
            {
                $('#side-menu').toggleClass('visible');
            });
    });


var w = window.innerWidth;
var h = window.innerHeight;
var container, controls;
var camera, scene, renderer, mixer, envMap, light, dirLight;
var mesh, url;
var composer ,renderPass;

var mouse = new THREE.Vector2(), INTERSECTED;
var raycaster = new THREE.Raycaster();

// var scenes = {
//     model: {
//         name: 'model',
//         url: 'model/test2.gltf',
//         author: 'mohamed',
//         authorURL: 'https://mohamedbakhouche.githup.io',
//     },
//     modelTow: {
//         name: 'modelTow',
//         url: 'model/test3.gltf',
//         author: 'mohamed',
//         authorURL: 'https://mohamedbakhouche.githup.io',
//     }
// };

// var apprAnfo = document.getElementsByClassName('appr-info');
var apprAnfo = document.querySelector('.appr-info');
var apprfill = document.querySelector('.fillscreen');

// var state = {
// 	scene: Object.keys( scenes )[ 0 ],
// 	// extension: scenes[ Object.keys( scenes )[ 0 ] ].extensions[ 0 ],
// 	// playAnimation: true
// };
url = 'model/test2.gltf';
function onload() {
    
    window.addEventListener( 'resize', onWindowResize, false );
    initScene( url );
    animate();
}

function initScene( sceneInfo ) {

    container = document.getElementById( 'view3d' );

    scene = new THREE.Scene(); /////////

    ////////////////// camera //////////////////////
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 200 );
    camera.position.set( -50.0, 20.0, 30.0 );

    ////////////////// RENDERER /////////////////////
    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true,} );
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.gammaOutput = true;
    renderer.gammaInput = true;
    // renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild( container );

    ////////////////// orbit /////////////////////
    controls = new THREE.OrbitControls( camera , renderer.domElement);
    controls.enablePan = false;
    controls.target.set( 0, -0.0, -0.0 );
    controls.minDistance = 30;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2;
    controls.enableDamping = true; 
    controls.dampingFactor = 0.15;
    controls.rotateSpeed = 0.4;

    container.appendChild( renderer.domElement );

    var loader = new THREE.GLTFLoader();
    // url = sceneInfo;
        
    document.body.appendChild( container );
    
    loader.load( sceneInfo, function ( data ) {
        gltf = data;
        var object = gltf.scene ;

        if ( ! envMap ) envMap = getEnvMap();
            object.traverse( function( node ) {
                if ( node.material && ( node.material.isMeshStandardMaterial ||
                        ( node.material.isShaderMaterial && node.material.envMap !== undefined ) ) ) {
                    node.material.envMap = envMap;
                    node.material.needsUpdate = true;
                }
            } );
        scene.background = envMap;

        object.traverse( function ( node ) {
        if ( node.isMesh || node.isLight ) {
            node.castShadow = true;
            node.receiveShadow = true;
            }
        } );
        
        getBg();
        HLigth();
        DLigth();

        var rdc_A122 = object.getObjectByName("rdc_A122");
        var rdcChildren = rdc_A122.children;
        rdcChildren[0].material.visible = false;
        rdcChildren[1].material.visible = false;

        model(object);

    // window.addEventListener( 'resize', onWindowResize, true );
    
    container.addEventListener( "mousemove", onMouseOut, false );
    container.addEventListener( "click", onMouseClick, false );

    scene.add( object );
    
    postproce();

    onWindowResize();
});
}; 

/////////////////////////////////////////////////////////////////////////
/////////                 postprocessing            //////////////////////
///////////////////////////////////////////////////////////////////////

function postproce(){
    
    // postprocessing
    composer = new THREE.EffectComposer( renderer );
    renderPass = new THREE.RenderPass( scene, camera );

    var effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
    effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
    
    var bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 0.2, 0.2, 0.98, 512 ); //1.0, 9, 0.5, 512);

    var ColorCorrection = new THREE.ShaderPass( THREE.ColorCorrectionShader );
    ColorCorrection.uniforms[ 'powRGB' ].value = new THREE.Vector3( 1.2, 1.2, 1.2 ) ;
    ColorCorrection.uniforms[ 'mulRGB' ].value = new THREE.Vector3( 0.9, 0.9, 0.9) ;
    // ColorCorrection.uniforms[ 'addRGB' ].value = new THREE.Vector3(0.8, 0.8, 0.8 ) ;

    var BrightnessContrast = new THREE.ShaderPass( THREE.BrightnessContrastShader );
    BrightnessContrast.uniforms[ 'brightness' ].value = 0.08 ;
    BrightnessContrast.uniforms[ 'contrast' ].value = 0.05; 

    var HueSaturation = new THREE.ShaderPass( THREE.HueSaturationShader );
    HueSaturation.uniforms[ 'hue' ].value = 0 ;
    HueSaturation.uniforms[ 'saturation' ].value = -0.2 ;

    // var bokehPass = new THREE.BokehPass( scene, camera, {
    //     focus: 	    100,
    //     aperture:	0.01,
    //     maxblur:	9,
    //     nearClip:   0.5 ,
	// 	farClip:   100.0 ,

    //     width: w,
    //     height: h
    // } );

    var Vignette = new THREE.ShaderPass( THREE.VignetteShader );
    Vignette.uniforms[ 'offset' ].value = 0.8 ;
    Vignette.uniforms[ 'darkness' ].value = 0.8 ;
    
    
    

    composer.addPass( renderPass );
    composer.addPass( ColorCorrection );
    composer.addPass( BrightnessContrast );
    composer.addPass( HueSaturation );
    composer.addPass( effectFXAA );
    // composer.addPass( bloomPass );
    // composer.addPass( bokehPass );
    composer.addPass( Vignette );
    Vignette .renderToScreen = true;

}


////////////////// models //////////////////////
function model(object){
    var RDC = object.getObjectByName("RDC");
    var oneEr = object.getObjectByName("1er");
    var towEme = object.getObjectByName("2eme");
    var threEme = object.getObjectByName("3eme");
    var toit = object.getObjectByName("toit");
    var inWallRdc = object.getObjectByName("rdc_in_wall");
    var inWallOne = object.getObjectByName("1er_in_wall");
    var inWallTow = object.getObjectByName("2eme_in_wall");

    $('#rdc-btn').click( function(){
    var rdc = $(this).attr('alt');
    if(rdc){
        oneEr.visible = false;
        towEme.visible = false;
        threEme.visible = false;
        toit.visible = false;
        inWallOne.visible = false;
        inWallTow.visible = false;
        inWallRdc.visible = true;
        }
    });
    $('#one-btn').click( function(){
        var ONE = $(this).attr('alt');
        if(ONE){
            towEme.visible = false;
            threEme.visible = false;
            toit.visible = false;
            inWallTow.visible = false;
            inWallRdc.visible = false;

            RDC.visible = true;
            oneEr.visible = true;
            inWallOne.visible = true;
            }
        });
    $('#tow-btn').click( function(){
    var TOW = $(this).attr('alt');
    if(TOW){
        threEme.visible = false;
        toit.visible = false;

        RDC.visible = true;
        oneEr.visible = true;
        towEme.visible = true;
        inWallTow.visible = true;
        }
    });
    $('#three-btn').click( function(){
    var THREE = $(this).attr('alt');
    if(THREE){
        RDC.visible = true;
        oneEr.visible = true;
        towEme.visible = true;
        threEme.visible = true;
        toit.visible = false;
        }
    });
    $('#roof-btn').click( function(){
    var THREE = $(this).attr('alt');
    if(THREE){
        RDC.visible = true;
        oneEr.visible = true;
        towEme.visible = true;
        threEme.visible = true;
        toit.visible = true;
        }
    }); 
}

////////////////// background //////////////////////
function getBg(){
    var bgLoader = new THREE.TextureLoader();
    var BG = bgLoader.load( 'icon/bg02.jpg' );
    scene.background = BG;
}

function HLigth(){
    var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set( 0, 50, 0 );
    scene.add( hemiLight );
}

function DLigth(){
    dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( -60, 40, 26 );
    scene.add( dirLight );
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024*2;
    dirLight.shadow.mapSize.height = 1024*2;
    var d = 20;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.far = 350;
    dirLight.shadow.bias = 0.00;
    // dirLight.position.multiplyScalar( 30 );
    // var dirLightHeper = new THREE.DirectionalLightHelper( dirLight, 10 );
    // scene.add( dirLightHeper );

    var changeSun = document.getElementById('sun-slid');
        changeSun.addEventListener('input', function(){
            dirLight.position.set( -60 , 40, this.value );
            
        },false);
}

function getEnvMap() {
    var path = 'Bridge2/';
    var format = '.jpg';
    var envMap = new THREE.CubeTextureLoader().load( [
    path + 'front' + format, path + 'back' + format,
    path + 'top' + format, path + 'down' + format,
    path + 'left' + format, path + 'right' + format
    ] );
    // envMap.generateMipmaps = true;
    return envMap;

}

function onWindowResize() {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );
}
/////////////////////////////////////////////////////////////////////////
/////////                 onMouseOut             //////////////////////
///////////////////////////////////////////////////////////////////////
function onMouseOut( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    
    var rdc_A122 = scene.getObjectByName("rdc_A122"); 
    var rdcChildren = rdc_A122.children;

    var intersects = raycaster.intersectObjects(rdcChildren);
    
    if ( intersects.length > 0 ) {
        if ( INTERSECTED != intersects[ 0 ].object ) {
            if ( INTERSECTED ) INTERSECTED.material.visible = false;
            INTERSECTED = intersects[ 0 ].object;
            INTERSECTED.currentHex = INTERSECTED.material.visible = false;
            INTERSECTED.material.visible = true;
        }
    } else {
        if ( INTERSECTED ) INTERSECTED.material.visible = false;
        INTERSECTED = null;
    }
}

/////////////////////////////////////////////////////////////////////////
/////////                 onMouseClick             //////////////////////
///////////////////////////////////////////////////////////////////////
function onMouseClick( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    
    var rdc_A122 = scene.getObjectByName("rdc_A122"); 
    var rdcChildren = rdc_A122.children;

    var intersects = raycaster.intersectObjects(rdcChildren);
    
    if ( intersects.length > 0 ) {
        console.log(apprAnfo);
        apprAnfo.classList.add('isactive');
        apprfill.classList.add('isactive');
    } 
}

var closeBtn = document.getElementById('close-icon');
    closeBtn.addEventListener('click', function(){
            apprAnfo.classList.remove('isactive');
            apprfill.classList.remove('isactive');
            
        },false);


function mrender() {
    composer.render();

    // renderer.render( scene, camera );
}

function animate() {
    requestAnimationFrame( animate );
    mrender();
    controls.update();
}

// function reload() {
//     if ( container && renderer ) {
//         container.removeChild( renderer.domElement );
//     }
//     if ( loader && mixer ) mixer.stopAllAction();

//     initScene( url );
// }

onload();

