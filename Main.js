/**
 * Created with JetBrains WebStorm.
 * User: alxlu
 * Date: 10/15/13
 * Time: 11:40 PM
 */
(function() {

    var container, bricks, paddle;
    var shared = {
        width: window.innerWidth,
        height: window.innerHeight,
        mouseX: 0,
        mouseY: 0,
        parameters: {
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

        bricks = new Bricks(shared);

        bricks.update(function(b) {
            shared.scene.add(b.mesh);
        });

        paddle = new Paddles(shared);

        shared.scene.add(paddle.geometry);




        //window.addEventListener('mousemove', onMouseMove, false);

    }

    function anim() {
        requestAnimationFrame(anim);
        shared.camera.position.x = shared.mouseX;
        shared.camera.position.y = shared.mouseY;
        shared.camera.lookAt(shared.scene.position);

        shared.renderer.render(shared.scene, shared.camera);

        /*
        bricks.update(function(b) {
            b.mesh.position.y += 0.01;
        });
        */


    }

    function onMouseMove(event) {
        shared.mouseX = event.clientX;
        shared.mouseY = event.clientY;
    }

}());