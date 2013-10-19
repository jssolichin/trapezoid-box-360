/**
 * Created with JetBrains WebStorm.
 * User: alxlu
 * Date: 10/15/13
 * Time: 11:40 PM
 */
(function() {

    var container, bricks, paddle, boundingBox;
    var shared = {
        width: window.innerWidth,
        height: window.innerHeight,
        mouseX: 0,
        mouseY: 0,
        key: '',
        parameters: {
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
            }
        },
        util: {
            combine: function(rule) {
                return rule.apply(this, [].slice.call(arguments, 1));
            }
        }
    }

    init();
    anim();

    function init() {

        container = document.createElement('div');
        container.id = "webgl";
        document.body.appendChild(container);

        shared.renderer = new THREE.WebGLRenderer();
        shared.camera = new THREE.PerspectiveCamera(45, shared.width / shared.height, 0.1, 1000 );
        shared.scene = new THREE.Scene();

        shared.renderer.setClearColor(0x000000);
        shared.camera.position.z = 100;
        shared.scene.add(shared.camera);
        shared.renderer.setSize( shared.width, shared.height, void 0 );

        container.appendChild(shared.renderer.domElement);

        boundingBox = new BoundingBox(shared);

        shared.scene.add(boundingBox.geometry);

        bricks = new Bricks(shared);

        bricks.update(function(b) {
            shared.scene.add(b.mesh);
        });

        paddle = new Paddles(shared);

        shared.scene.add(paddle.geometry);

        //window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('keypress', onKeyPress, false);
        window.addEventListener('keyup', function() { shared.key = ''}, false);

    }

    function anim() {
        requestAnimationFrame(anim);
        shared.camera.position.x = shared.mouseX;
        shared.camera.position.y = shared.mouseY;
        shared.camera.lookAt(shared.scene.position);

        if (shared.key == 'w') {
            paddle.incrementPos({z: 0.1});
        }
        //console.log(shared.key);

        shared.renderer.render(shared.scene, shared.camera);

        /*
        bricks.update(function(b) {
            b.mesh.position.y += 0.01;
        });
        */

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

    function onMouseMove(event) {
        shared.mouseX = event.clientX;
        shared.mouseY = event.clientY;
    }

    function onKeyPress(event){
        shared.key = String.fromCharCode(event.keyCode);
    }

}());