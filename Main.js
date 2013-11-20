/**
 * Created with JetBrains WebStorm.
 * User: alxlu
 * Date: 10/15/13
 * Time: 11:40 PM
 */
(function () {

    var container, bricks, paddle, boundingBox, ball, Signal = signals.Signal, views;
    var shared = {
        width: window.innerHeight-5,
        height: window.innerHeight-5,
        mouseX: 0,
        mouseY: 0,
        pressedKeys: [0, 0, 0, 0],
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
                sx: 3,
                sy: 3,
                sz: 3
            },
            bricksize: {
                width: 20,
                height: 10,
                depth: 20
            },
            brickspacing: {
                x: 0,
                y: 0,
                z: 0
            },
            bricklayout: {
                x: 3,
                y: 1,
                z: 3
            },
            brickoffsets: {
                x: 10,
                y: 30,
                z: -14
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
        util: {
            combine: function (rule) {
                return rule.apply(this, [].slice.call(arguments, 1));
            },
            idToIdx: function (id) {
                return (id.z + id.y * shared.parameters.bricklayout.z +
                    id.x * shared.parameters.bricklayout.y * shared.parameters.bricklayout.x) + 1;
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

        console.log(shared.width, shared.height);
        views = [
            {
                left: 1,
                bottom: 2,
                width: 0.5,
                height: 0.5,
                offsetX: 0,
                offsetY: 0,
                background: new THREE.Color().setRGB( 0.2, 0.5, 0.7 ),
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
                background: new THREE.Color().setRGB( 0.5, 0.5, 0.7 ),
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
                background: new THREE.Color().setRGB( 0.7, 0.5, 0.5 ),
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
                background: new THREE.Color().setRGB( 0.5, 0.7, 0.7 ),
                eye: [ 85, 5.3, 6.3 ],
                up: [ 0, 0, 1 ],
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

        bricks = new Bricks(shared);

        bricks.update(function (b) {
            shared.scene.add(b.mesh);
            shared.collidableMeshList.push(b.mesh);
        });

        //console.log(bricks.brickList[3].getBounding());
        bricks.setSignal(shared.signals, shared.scene, shared);

        paddle = new Paddles(shared);

        Balls.prototype.bounce = shared.util.maybe(Balls.prototype.bounce);
        ball = new Balls(shared);

        shared.scene.add(paddle.geometry);
        shared.scene.add(ball.geometry);
        shared.scene.add(ball.helperGeometry);

        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('click', onClick, false);
        window.addEventListener('keydown', handleKeyPresses(shared.parameters.paddlespeed), false);
        window.addEventListener('keyup', handleKeyPresses(0), false);

    }

    function anim() {
        requestAnimationFrame(anim);
        //shared.camera.position.x = -shared.mouseX * 0.1 + 10;


        computePaddle(paddle, shared.pressedKeys);
        ball.update(shared.parameters.bounding);
        var origin = ball.geometry.position.clone();
        for (var vtxIdx = 0; vtxIdx < ball.geometry.geometry.vertices.length ; vtxIdx++) {
            var lvtx = ball.geometry.geometry.vertices[vtxIdx].clone();
            var gvtx = lvtx.applyMatrix4(ball.geometry.matrix);
            var direction = gvtx.sub(ball.geometry.position);

            var ray = new THREE.Raycaster(origin, direction.clone().normalize());
            var results = ray.intersectObjects(shared.collidableMeshList);
            var paddleHit = ray.intersectObjects([paddle.geometry]);
            if (results.length > 0 && results[0].distance < direction.length()) {
                ball.bounce(direction.clone().normalize().multiplyScalar(0.9));
                var hit = results[0].object.idx;
                var temp = shared.collidableMeshList[hit];
                shared.signals.blockHit.dispatch(hit);
                delete shared.collidableMeshList[hit];
                setTimeout(function(){shared.collidableMeshList[hit] = temp}, 1000)
            }
            if (paddleHit.length > 0 && paddleHit[0].distance < direction.length()) {
                ball.bounce(direction.clone ().normalize().multiplyScalar(0.9));

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
    }

    function BoundingBox(shared) {
        this.width = shared.parameters.bounding.width;
        this.height = shared.parameters.bounding.height;
        this.depth = shared.parameters.bounding.depth;
        var geometry = new THREE.CubeGeometry(this.width, this.height, this.depth,
            shared.parameters.bounding.sx, shared.parameters.bounding.sy, shared.parameters.bounding.sz);
        var material = new THREE.MeshBasicMaterial({wireframe: true});
        var boundingBox = new THREE.Mesh(geometry, material);
        boundingBox.position = new THREE.Vector3(shared.parameters.bounding.x, shared.parameters.bounding.y,
            shared.parameters.bounding.z);
        this.geometry = boundingBox.clone();

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

            if (key == 'T') {
                shared.signals.blockHit.dispatch(2);
            }
        };
    }

}());