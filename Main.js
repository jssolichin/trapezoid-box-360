/**
 * Created with JetBrains WebStorm.
 * User: alxlu
 * Date: 10/15/13
 * Time: 11:40 PM
 */
(function () {

    var container, bricks, paddle, boundingBox, ball;
    var shared = {
        width: window.innerWidth,
        height: window.innerHeight,
        mouseX: 0,
        mouseY: 0,
        pressedKeys: [0, 0, 0, 0],
        parameters: {
            ballsize: 2,
            ballspeed: {
                x: (Math.random() - 0.5) * 0.5,
                y: (Math.random() + 0.5) * 0.5,
                z: (Math.random() - 0.5) * 0.5
            },
            bounding: {
                width: 50,
                height: 50,
                depth: 50,
                x: -2,
                y: 5,
                z: 0
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
                x: 0,
                y: 10,
                z: 0
            },

            paddlesize: {
                width: 10,
                height: 2,
                depth: 5
            },
            paddlespeed: 0.3
        },
        util: {
            combine: function (rule) {
                return rule.apply(this, [].slice.call(arguments, 1));
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
        });

        paddle = new Paddles(shared);

        ball = new Balls(shared);

        shared.scene.add(paddle.geometry);
        shared.scene.add(ball.geometry);

        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('keydown', handleKeyPresses, false);
        window.addEventListener('keyup', handleKeyPresses, false);

    }

    function anim() {
        requestAnimationFrame(anim);
        shared.camera.position.x = -shared.mouseX * 0.1 + 10;
        shared.camera.lookAt(shared.scene.position);

        computePaddle(paddle, shared.pressedKeys);
        ball.update(shared.parameters.bounding);


        shared.renderer.render(shared.scene, shared.camera);


    }

    function BoundingBox(shared) {
        this.width = shared.parameters.bounding.width;
        this.height = shared.parameters.bounding.height;
        this.depth = shared.parameters.bounding.depth;
        var geometry = new THREE.CubeGeometry(this.width, this.height, this.depth);
        var material = new THREE.MeshBasicMaterial({wireframe: true});
        var boundingBox = new THREE.Mesh(geometry, material);
        boundingBox.position = new THREE.Vector3(shared.parameters.bounding.x, shared.parameters.bounding.y,
            shared.parameters.bounding.z);
        this.geometry = boundingBox.clone();

    }

    function computePaddle(paddle, pressedKeys) {
        var movement = {x: pressedKeys[3] - pressedKeys[1], y: 0, z: pressedKeys[2] - pressedKeys[0]};
        paddle.incrementPos(movement);
    }

    function onMouseMove(event) {
        shared.mouseX = event.clientX;
        shared.mouseY = event.clientY;
    }

    function handleKeyPresses(event) {
        var key = String.fromCharCode(event.keyCode);
        if (key == 'W') {
            shared.pressedKeys[0] = shared.pressedKeys[0] == 0 ? 1 : 0;
        }
        if (key == 'A') {
            shared.pressedKeys[1] = shared.pressedKeys[1] == 0 ? 1 : 0;
        }
        if (key == 'S') {
            shared.pressedKeys[2] = shared.pressedKeys[2] == 0 ? 1 : 0;
        }
        if (key == 'D') {
            shared.pressedKeys[3] = shared.pressedKeys[3] == 0 ? 1 : 0;
        }

    }

}());