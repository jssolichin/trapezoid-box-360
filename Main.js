/**
 * Created with JetBrains WebStorm.
 * User: alxlu
 * Date: 10/15/13
 * Time: 11:40 PM
 */
(function() {

    var camera, renderer, scene, container, bricks = [];
    var mouseX = 0, mouseY = 0;

    var WIDTH = window.innerWidth, HEIGHT = window.innerHeight;

    init();
    anim();

    function init() {

        var parameters = {
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
            }
        };

        container = document.createElement('div');
        container.id = "webgl";
        document.body.appendChild(container);

        renderer = new THREE.WebGLRenderer();
        camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1000 );
        scene = new THREE.Scene();

        renderer.setClearColor(0x000000);
        camera.position.z = 100;
        scene.add(camera);
        renderer.setSize( WIDTH, HEIGHT, void 0 );

        container.appendChild(renderer.domElement);

        var material = new THREE.MeshBasicMaterial({wireframe:true});

        function setup(piece, chunk, size, spacing, layout) {

            var brick = piece(size.width, size.height, size.depth, material, spacing);
            var chunksize = {
                width: size.width * layout.x,
                height: size.height * layout.y,
                depth: size.depth * layout.z
            };
            return chunk(brick, layout, chunksize);

        }

        bricks = combine(setup, generateBrick, generateWall, parameters.bricksize, parameters.brickspacing, parameters.bricklayout);

        bricks.forEach(function(b) {
            scene.add(b.mesh);
            //console.log(b.mesh.position);
        });

        //window.addEventListener('mousemove', onMouseMove, false);

    }

    function anim() {
        requestAnimationFrame(anim);
        camera.position.x = mouseX;
        camera.position.y = mouseY;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);

    }

    function generateBrick(width, height, depth, material, separation) {
        var geometry = new THREE.CubeGeometry(width, height, depth);
        var material = material || new THREE.MeshBasicMaterial({wireframe: true});
        var brick = new THREE.Mesh(geometry, material);
        return function (id) {
            this.mesh = brick;
            this.id = id;
            this.width = separation ? separation.x + this.mesh.geometry.width : this.mesh.geometry.width;
            this.height = separation ? separation.y + this.mesh.geometry.height : this.mesh.geometry.height;
            this.depth = separation ? separation.z + this.mesh.geometry.depth : this.mesh.geometry.depth;
        }
    }

    function generateWall(fn, dim, csize) {
        var Brick = fn;
        var meshid = 5;
        var bricks = [];
        (function() {
            for (var x = 0, y = 0, z = 0; x < dim.x; x++) {
                for ( y = 0; y < dim.y; y++){
                    for( z = 0; z < dim.z; z++) {
                        var brick = new Brick({x: x, y: y, z: z});
                        brick.mesh.position = new THREE.Vector3(x * brick.width - (csize.width / 2), y * brick.height, z * brick.depth);
                        brick.mesh = brick.mesh.clone();
                        bricks.push(brick);
                    }
                }
            }
        }());
        return bricks;
    }

    function combine(rule) {
        return rule.apply(this, [].slice.call(arguments, 1));
    }

    function onMouseMove(event) {
        mouseX = event.clientX;
        mouseY = event.clientY;
    }

}());