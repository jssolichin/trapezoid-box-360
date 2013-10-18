/**
 * Created by alxlu on 10/16/13.
 */
var Bricks = function(shared) {

    var material = new THREE.MeshBasicMaterial({wireframe:true});

    function setup(piecefn, wallfn, size, spacing, layout, offset) {

        var brick = piecefn(size.width, size.height, size.depth, material, spacing);
        var wallsize = {
            width: size.width * layout.x,
            height: size.height * layout.y,
            depth: size.depth * layout.z
        };
        return wallfn(brick, layout, wallsize, offset);

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

    function generateWall(fn, dim, csize, offset) {
        var Brick = fn;
        var bricks = [];
        (function() {
            for (var x = 0, y = 0, z = 0; x < dim.x; x++) {
                for ( y = 0; y < dim.y; y++){
                    for( z = 0; z < dim.z; z++) {
                        var brick = new Brick({x: x, y: y, z: z});
                        brick.mesh.position = new THREE.Vector3(x * brick.width - (csize.width / 2),
                            y * brick.height + offset.y, z * brick.depth);
                        brick.mesh = brick.mesh.clone();
                        bricks.push(brick);
                    }
                }
            }
        }());
        return bricks;
    }

    this.brickList = shared.util.combine(setup, generateBrick, generateWall, shared.parameters.bricksize,
        shared.parameters.brickspacing, shared.parameters.bricklayout, shared.parameters.brickoffsets);
};

Bricks.prototype.update = function(fn) {
    this.brickList.forEach(function(b) {
        fn(b);
    });
}