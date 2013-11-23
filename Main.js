/**
 * Created with JetBrains WebStorm.
 * User: alxlu
 * Date: 10/15/13
 * Time: 11:40 PM
 */
(function () {


    var container, bricks, paddle, boundingBox, ball, Signal = signals.Signal, views;
    var shared = {
        score: 0,
        numOfBricksDone: 0,
        numOfBalls: 3,
        theBalls: [],
        width: window.innerHeight-5,
        height: window.innerHeight-5,
        mouseX: 0,
        mouseY: 0,
        pressedKeys: [0, 0, 0, 0],
        pressedKeys2: [0, 0, 0, 0],
        pressedKeys3: [0, 0, 0, 0],
        pressedKeys4: [0, 0, 0, 0],
        collidableMeshList: [],
        parameters: {
            ballsize: 2,
            ballspeed: {
                x: (Math.random() - 0.5),
                y: (Math.random() + 0.5),
                z: (Math.random() - 0.5)
            },
            bounding: {
                width: 60,
                height: 60,
                depth: 60,
                x: 0,
                y: 5,
                z: 6,
                sx: 1,
                sy: 1,
                sz: 1
            },
            bricksize: {
                /*
                width: 20,
                height: 10,
                depth: 20
                */
                width: 60,
                height: 10,
                depth: 60
            },
            brickspacing: {
                x: 0,
                y: 0,
                z: 0
            },
            bricklayout: {
                /*
                x: 3,
                y: 1,
                z: 3
                */
                 x: 1,
                y: 1,
                z: 1
            },
            brickoffsets: {
                /*
                x: 10,
                y: 30,
                z: -14
                */
                x:30,
                y:30,
                z:5
            },
            paddlesize: {
                width: 20,
                height: 2,
                depth: 20
            },
            paddlespeed: 0.6
        },
        signals: {
            blockHit: new Signal()
        },
        killScreen: function(){
            console.log('killscreen', shared.score);

            d3.selectAll("#killScreens .eachKill")
                .style('background', '#ccc')
                .style('color', '#000')

            d3.selectAll("#killScreens .eachKill .textLocation")
                .style('font-size', '3em')
                .style('line-height', '4em')
                .style('z-index', '4')
                .style('position', 'relative')
                    
            d3.selectAll("#killScreens .eachKill .rainbow")
                .style('height', shared.score*100+"%")
                .style('width', '100%')
                .style('bottom', '0px')
                .style('z-index', '2')
                .style('position','absolute')

            setTimeout(function(){document.location.reload(true)}, 5000)
        },
        util: {
            combine: function (rule) {
                return rule.apply(this, [].slice.call(arguments, 1));
            },
            idToIdx: function (id) {
                return (id.x*100 +id.y*10+id.z);
            },
            brickbounce: (function () {
                var x, y, z;
                x = y = z = false;
                return function (c1, c2, c3) {
                    var result = void 0;
                    if (x && c1) {
                        result = "x";
                    } else if (y && c2) {
                        result = "y";
                    } else if (z && c3) {
                        result = "z";
                    }
                    if (result == void 0) {
                        z = c1 && c2 ? true : false;
                        y = c1 && c3 ? true : false;
                        x = c2 && c3 ? true : false;
                    } else {
                        x = y = z = false;
                    }
                    return result;
                };
            }()),
            maybe: function (fn) {
                return function () {
                    var i;
                    if (arguments.length == 0) {
                        return;
                    } else {
                        for (i = 0; i < arguments.length; i++) {
                            if (arguments[i] == null) return;
                        }
                        return fn.apply(this, arguments);
                    }
                };
            }
        }
    };

    init();
    anim();

    function init() {
        //create container and append to scene.
        container = document.createElement('div');
        container.id = "webgl";
        document.body.appendChild(container);

        //setup scene and camera
        shared.renderer = new THREE.WebGLRenderer();

        views = [
            {
                left: 1,
                bottom: 2,
                width: 0.5,
                height: 0.5,
                offsetX: 0,
                offsetY: 0,
                background: new THREE.Color().setRGB(0,0,0 ),
                //background: new THREE.Color().setRGB( 0.2, 0.5, 0.7 ),
                eye: [0, 5, -80 ],
                up: [ 0, 1, 0 ],
                fov: 60,
                updateCamera: function ( camera, scene, mouseX, mouseY ) {
                    camera.lookAt(new THREE.Vector3(0, this.eye[1], 0));
                }
            },
            {
                left: 0,
                bottom: 1,
                width: 0.5,
                height: 0.5,
                offsetX: 0,
                offsetY: 0,
                background: new THREE.Color().setRGB(0,0,0 ),
                //background: new THREE.Color().setRGB( 0.5, 0.5, 0.7 ),
                eye: [ 85, 5, 5.7 ],
                up: [ 0, 0, -1 ],
                fov: 60,
                updateCamera: function ( camera, scene, mouseX, mouseY ) {

                    camera.lookAt(new THREE.Vector3(0, this.eye[1], this.eye[2]));
                }
            },
            {
                left: 1,
                bottom: 0,
                width: 0.5,
                height: 0.5,
                offsetX: 0,
                offsetY: 0,
                background: new THREE.Color().setRGB(0,0,0 ),
                //background: new THREE.Color().setRGB( 0.7, 0.5, 0.5 ),
                eye: [ 0, 5, 90 ],
                up: [ 0, -1, 0 ],
                fov: 60,
                updateCamera: function ( camera, scene, mouseX, mouseY ) {
                    camera.lookAt(new THREE.Vector3(0, this.eye[1], this.eye[2]));
                }
            },
            {
                left: 2,
                bottom: 1,
                width: 0.5,
                height: 0.5,
                offsetX: 0,
                offsetY: 0,
                background: new THREE.Color().setRGB(0,0,0 ),
                //background: new THREE.Color().setRGB( 0.5, 0.7, 0.7 ),
                eye: [ -85, 5.3, 6.3 ],
                up: [ 0, 0, -1 ],
                fov: 60,
                updateCamera: function ( camera, scene, mouseX, mouseY ) {
                    camera.lookAt(new THREE.Vector3(0, this.eye[1], this.eye[2]));
                }
            }
        ];

        for (var ii =  0; ii < views.length; ++ii ) {

            var view = views[ii];
            var camera = new THREE.PerspectiveCamera( view.fov, 1, 0.1, 10000 );
            camera.position.x = view.eye[ 0 ];
            camera.position.y = view.eye[ 1 ];
            camera.position.z = view.eye[ 2 ];
            camera.up.x = view.up[ 0 ];
            camera.up.y = view.up[ 1 ];
            camera.up.z = view.up[ 2 ];
            view.camera = camera;
        }

        shared.camera = new THREE.PerspectiveCamera(45, shared.width / shared.height, 0.1, 1000);
        shared.scene = new THREE.Scene();
        shared.renderer.setClearColor(0x000000);
        shared.camera.position.z = 100;
        shared.scene.add(shared.camera);
        shared.renderer.setSize(shared.width, shared.height, void 0);

        container.appendChild(shared.renderer.domElement);

        boundingBox = new BoundingBox(shared);

        shared.scene.add(boundingBox.geometry);
        shared.scene.add(boundingBox.floorGeometry);
        shared.scene.add(boundingBox.bottomGeometry);
        shared.scene.add(boundingBox.ceilingGeometry);

        shared.collidableMeshList.push(boundingBox.floorGeometry);


        bricks = new Bricks(shared);

        bricks.update(function (b) {
            shared.scene.add(b.mesh);
            shared.collidableMeshList.push(b.mesh);
        });


        //console.log(bricks.brickList[3].getBounding());
        bricks.setSignal(shared.signals, shared.scene, shared);

        var black = new THREE.Color("rgb(124,124,124)");
        var red = new THREE.Color("rgb(255,0,0)");
        paddle = new Paddles(shared, 0x00ff00, [30,30]);
        paddle2 = new Paddles(shared, red, [30,-30]);
        paddle3 = new Paddles(shared, 0x0000ff, [-30,-30]);
        paddle4 = new Paddles(shared, black, [-30, 30]);

        Balls.prototype.bounce = shared.util.maybe(Balls.prototype.bounce);

        for(var i = 0; i<shared.numOfBalls; i++){
            shared.theBalls[i] = new Balls(shared);

            shared.scene.add(shared.theBalls[i].geometry);
            shared.scene.add(shared.theBalls[i].helperGeometry);
        }

        shared.scene.add(paddle.geometry);
        shared.scene.add(paddle2.geometry);
        shared.scene.add(paddle3.geometry);
        shared.scene.add(paddle4.geometry);

        

        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('click', onClick, false);
        window.addEventListener('keydown', handleKeyPresses(shared.parameters.paddlespeed), false);
        window.addEventListener('keyup', handleKeyPresses(0), false);

        var marginFromLeftEdge = window.innerWidth/2-window.innerHeight/2;

        d3.selectAll("#killScreens div")
        //    .style('display', 'none')

        for ( var ii = 0; ii < views.length; ++ii ) {

            var view = views[ii];

            var left   = Math.floor( window.innerHeight  /3 * view.left);
            var bottom = Math.floor( window.innerHeight / 3 * view.bottom );
            var width  = Math.floor( window.innerHeight / 3 );
            var height = Math.floor( window.innerHeight / 3 );

            d3.selectAll("#killScreens .eachKill")
                .style("width",width+"px")
                .style("height", height+"px")
                .style("color", "#eee")
                .style("position", "absolute")
                

            d3.selectAll("#screen"+(ii+1))
                .style('top', window.innerHeight-bottom-(window.innerHeight/3+4)+"px")
                .style('left', marginFromLeftEdge+left+"px")
                .style('-webkit-transform', function(){
                    return "rotate("+(ii*-1)*90+"deg)"
                })
        }


    }

    function anim() {
         stats.begin();
        requestAnimationFrame(anim);

        computePaddle(paddle, shared.pressedKeys);
        computePaddle(paddle2, shared.pressedKeys2);
        computePaddle(paddle3, shared.pressedKeys3);
        computePaddle(paddle4, shared.pressedKeys4);

        for(var i = 0; i<shared.theBalls.length; i++){
            var ball = shared.theBalls[i];
            ball.update(shared.parameters.bounding);
            var origin = ball.geometry.position.clone();
            for (var vtxIdx = 0; vtxIdx < ball.geometry.geometry.vertices.length ; vtxIdx++) {
                var lvtx = ball.geometry.geometry.vertices[vtxIdx].clone();
                var gvtx = lvtx.applyMatrix4(ball.geometry.matrix);
                var direction = gvtx.sub(ball.geometry.position);

                var ray = new THREE.Raycaster(origin, direction.clone().normalize());
                var results = ray.intersectObjects(shared.collidableMeshList);
                var paddleHit = ray.intersectObjects([paddle.geometry,paddle2.geometry,paddle3.geometry,paddle4.geometry]);
                if (results.length > 0 && results[0].distance < direction.length()) {
                    if(results[0].object.name == "floor"){
                        //shared.scene.remove(ball.geometry);
                        ball.geometry.material.wireframe = true;
                        ball.geometry.material.color = new THREE.Color({r: 255, g: 255, b: 255});
                        /*
                        setTimeout(function(){
                            var p = shared.parameters;
                            ball.geometry.position = new THREE.Vector3(0,0,0);
                            shared.scene.add(ball.geometry); 
                        }, 500)
    */
                    }
                    else{
                        ball.bounce(direction.clone().normalize().multiplyScalar(0.9));
                        var hit = results[0].object.idx;
                        shared.signals.blockHit.dispatch(hit, ball.geometry.material);
                    }
                   
                }
                if (paddleHit.length > 0 && paddleHit[0].distance < direction.length()) {
                    ball.geometry.material.wireframe = false;
                    ball.geometry.material.color = paddleHit[0].object.material.color;
                    ball.bounce(direction.clone ().normalize().multiplyScalar(0.9));
                }
            }
        }

        //shared.renderer.render(shared.scene, shared.camera);
        for ( var ii = 0; ii < views.length; ++ii ) {

            var view = views[ii];
            shared.camera = view.camera;

            view.updateCamera( shared.camera, shared.scene, shared.mouseX, shared.mouseY );

            var left   = Math.floor( window.innerHeight  /3 * view.left);
            var bottom = Math.floor( window.innerHeight / 3 * view.bottom );
            var width  = Math.floor( window.innerHeight / 3 );
            var height = Math.floor( window.innerHeight / 3 );
            shared.renderer.setViewport( left+view.offsetX, bottom+view.offsetY, width, height );
            shared.renderer.setScissor( left, bottom, width, height );
            shared.renderer.enableScissorTest ( true );
            shared.renderer.setClearColor( view.background );

            shared.camera.aspect =1;
            shared.camera.updateProjectionMatrix();

            shared.renderer.render( shared.scene, shared.camera );
        }

        shared.score = 0;
        var divideBy = 0;
        bricks.brickList.forEach(function(d){
            if(d.mesh !=null && d.mesh.material != null && d.mesh.material.opacity !=null){
                divideBy++;
                shared.score += d.mesh.material.opacity
            }
        })
        
        if(!isNaN(shared.score/ divideBy)){
            shared.score = shared.score/divideBy;

            if(shared.score <= 0){
                shared.killScreen();
            }
            else {
                d3.selectAll('#killScreens .textLocation')
                    .html(parseInt(shared.score*100)+"%")

                d3.selectAll('#killScreens #screen1 .textLocation')
                    .html((100-parseInt(shared.score*100))+"%")
            }
            
        }

        

         stats.end();
    }

    function BoundingBox(shared) {
        this.width = shared.parameters.bounding.width;
        this.height = shared.parameters.bounding.height;
        this.depth = shared.parameters.bounding.depth;
        var geometry = new THREE.CubeGeometry(this.width, this.height, this.depth,
            shared.parameters.bounding.sx, shared.parameters.bounding.sy, shared.parameters.bounding.sz);
        var material = new THREE.MeshBasicMaterial({wireframe: true, opacity: 0, transparency: true, color: 0x777777});
        var boundingBox = new THREE.Mesh(geometry, material);
        boundingBox.position = new THREE.Vector3(shared.parameters.bounding.x, shared.parameters.bounding.y,
            shared.parameters.bounding.z);
        this.geometry = boundingBox.clone();

        var floorGeometry = new THREE.PlaneGeometry(shared.parameters.bounding.width, shared.parameters.bounding.height);
        var floorMaterial = new THREE.MeshBasicMaterial({wireframe: true, color: 0x000000});
        var floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);

        floorMesh.rotation.x = Math.PI / 2;
        floorMesh.position.y = -23;
        floorMesh.position.z = 6.5;

        this.floorGeometry = floorMesh.clone();
        this.floorGeometry.name = "floor";

        var bottomGeometry = new THREE.PlaneGeometry(shared.parameters.bounding.width, shared.parameters.bounding.height,3,3);
        var bottomMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x777777});
        var bottomMesh = new THREE.Mesh(bottomGeometry, bottomMaterial);

        bottomMesh.rotation.x = Math.PI / 2;
        bottomMesh.position.y = -25;
        bottomMesh.position.z = 6.5;

        this.bottomGeometry = bottomMesh.clone();
        this.bottomGeometry.name = "bottomGeometry";

        var ceilingGeometry = new THREE.PlaneGeometry(shared.parameters.bounding.width, shared.parameters.bounding.height,3,3);
        var ceilingMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x777777});
        var ceilingMesh = new THREE.Mesh(bottomGeometry, bottomMaterial);

        ceilingMesh.rotation.x = Math.PI / 2;
        ceilingMesh.position.y = 24.6;
        ceilingMesh.position.z = 6.5;

        this.ceilingGeometry = ceilingMesh.clone();
        this.ceilingGeometry.name = "bottomGeometry";

    }

    function computePaddle(paddle, pressedKeys) {
        var movement = {x: pressedKeys[3] - pressedKeys[1], z: pressedKeys[2] - pressedKeys[0]};
        paddle.incrementPos(movement, shared.parameters.bounding);
    }

    function onMouseMove(event) {
        shared.mouseX = event.clientX;
        shared.mouseY = event.clientY;
    }

    function onClick(event) {
        console.log(shared.pressedKeys);
    }

    function handleKeyPresses(speed) {
        return function (event) {
            var key = String.fromCharCode(event.keyCode);
            if (key == 'W') {
                shared.pressedKeys[0] = speed;
                shared.pressedKeys[2] = 0;
            }
            if (key == 'A') {
                shared.pressedKeys[1] = speed;
                shared.pressedKeys[3] = 0;
            }
            if (key == 'S') {
                shared.pressedKeys[2] = speed;
                shared.pressedKeys[0] = 0;
            }
            if (key == 'D') {
                shared.pressedKeys[3] = speed;
                shared.pressedKeys[1] = 0;
            }
//
            if (key == '&') {
                shared.pressedKeys2[0] = speed;
                shared.pressedKeys2[2] = 0;
            }
            if (key == '%') {
                shared.pressedKeys2[1] = speed;
                shared.pressedKeys2[3] = 0;
            }
            if (key == '(') {
                shared.pressedKeys2[2] = speed;
                shared.pressedKeys2[0] = 0;
            }
            if (key == '\'') {
                shared.pressedKeys2[3] = speed;
                shared.pressedKeys2[1] = 0;
            }
            
            if (key == 'T') {
                shared.pressedKeys3[0] = speed;
                shared.pressedKeys3[2] = 0;
            }
            if (key == 'F') {
                shared.pressedKeys3[1] = speed;
                shared.pressedKeys3[3] = 0;
            }
            if (key == 'G') {
                shared.pressedKeys3[2] = speed;
                shared.pressedKeys3[0] = 0;
            }
            if (key == 'H') {
                shared.pressedKeys3[3] = speed;
                shared.pressedKeys3[1] = 0;
            }

            if (key == 'I') {
                shared.pressedKeys4[0] = speed;
                shared.pressedKeys4[2] = 0;
            }
            if (key == 'J') {
                shared.pressedKeys4[1] = speed;
                shared.pressedKeys4[3] = 0;
            }
            if (key == 'K') {
                shared.pressedKeys4[2] = speed;
                shared.pressedKeys4[0] = 0;
            }
            if (key == 'L') {
                shared.pressedKeys4[3] = speed;
                shared.pressedKeys4[1] = 0;
            }

            /*if (key == 'T') {
                shared.signals.blockHit.dispatch(2);
            }*/
        };
    }

}());