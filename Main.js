/**
 * Created with JetBrains WebStorm.
 * User: alxlu
 * Date: 10/15/13
 * Time: 11:40 PM
 */
(function () {

    var container, bricks, paddle, boundingBox, ball, Signal = signals.Signal;
    var shared = {
        width: window.innerWidth,
        height: window.innerHeight,
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
                width: 50,
                height: 50,
                depth: 35,
                x: 0,
                y: 5,
                z: 6,
                sx: 5,
                sy: 5,
                sz: 5
            },
            bricksize: {
                width: 10,
                height: 5,
                depth: 5
            },
            brickspacing: {
                x: 2,
                y: 2,
                z: 2
            },
            bricklayout: {
                x: 3,
                y: 3,
                z: 3
            },
            brickoffsets: {
                x: 2,
                y: 10,
                z: 0
            },
            paddlesize: {
                width: 10,
                height: 2,
                depth: 5
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

        console.log(bricks.brickList[3].getBounding());
        bricks.setSignal(shared.signals, shared.scene);

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

        shared.camera.position.x = 100 * Math.cos((shared.mouseX / shared.width + 3) * 0.5);
        shared.camera.position.z = 100 * Math.sin((shared.mouseX / shared.width + 3) * 0.5);
        shared.camera.lookAt(shared.scene.position);


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
                shared.signals.blockHit.dispatch(hit);
                delete shared.collidableMeshList[hit];
            }
            if (paddleHit.length > 0 && paddleHit[0].distance < direction.length()) {
                ball.bounce(direction.clone ().normalize().multiplyScalar(0.9));

            }
        }

        shared.renderer.render(shared.scene, shared.camera);
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