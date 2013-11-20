/**
 * Created by alxlu on 10/16/13.
 */
var Bricks = function (shared) {

    var material = new THREE.MeshBasicMaterial({wireframe: true});

    //function to combine brick generating function with wall function.
    function setup(piecefn, wallfn, size, spacing, layout, offset) {

        var brick = piecefn(size.width, size.height, size.depth, material, spacing);
        var wallsize = {
            width: size.width * layout.x,
            height: size.height * layout.y,
            depth: size.depth * layout.z
        };
        return wallfn(brick, layout, wallsize, offset);

    }
    //function to generate individual brick
    function generateBrick(width, height, depth, material, separation) {
        var geometry = new THREE.CubeGeometry(width, height, depth);
        var material = new THREE.MeshPhongMaterial( { color: 0x000000,  emissive: 0x000000, ambient: 0x000000, shading: THREE.SmoothShading, opacity: 0.8, transparent: true } ) 
        var brick = new THREE.Mesh(geometry, material);
        return function (id, idx) {
            this.mesh = brick;
            this.id = id;
            this.idx = idx;
            this.width = separation ? separation.x + this.mesh.geometry.width : this.mesh.geometry.width;
            this.height = separation ? separation.y + this.mesh.geometry.height : this.mesh.geometry.height;
            this.depth = separation ? separation.z + this.mesh.geometry.depth : this.mesh.geometry.depth;
        };
    }
    //function to generate entire wall
    function generateWall(fn, dim, csize, offset) {
        var Brick = fn;
        var bricks = [];
        (function () {
            Brick.prototype.getBounding = function () {
                var x = {min: this.mesh.position.x - this.mesh.geometry.width / 2,
                    max: this.mesh.position.x + this.mesh.geometry.width / 2};
                var y = {min: this.mesh.position.y - this.mesh.geometry.height / 2,
                    max: this.mesh.position.y + this.mesh.geometry.height / 2};
                var z = {min: this.mesh.position.z - this.mesh.geometry.depth / 2,
                    max: this.mesh.position.z + this.mesh.geometry.depth / 2};
                return {x: x, y: y, z: z};
            };
            for (var x = 0, y = 0, z = 0, i = 0; x < dim.x; x++) for (y = 0; y < dim.y; y++) for (z = 0; z < dim.z; z++) {
                var brick = new Brick({x: x, y: y, z: z}, i++);
                brick.mesh.position = new THREE.Vector3(x * brick.width - (csize.width / 2) + offset.x,
                    y * brick.height + offset.y, z * brick.depth + offset.z);
                brick.mesh = brick.mesh.clone();
                brick.mesh.idx = i - 1;
                bricks.push(brick);
            }
        }());
        return bricks;
    }

    this.brickList = shared.util.combine(setup, generateBrick, generateWall, shared.parameters.bricksize,
        shared.parameters.brickspacing, shared.parameters.bricklayout, shared.parameters.brickoffsets);

    this.brickLayout = shared.parameters.bricklayout;
};

//function to update all the bricks
Bricks.prototype.update = function(fn) {
    this.brickList.forEach(function(b) {
        fn(b);
    });
};

Bricks.prototype.setSignal = function (signals, scene, shared) {
    var self = this;
   signals.blockHit.add(function(idx) {
        if (self.brickList[idx] != undefined) {
            //console.log(self.brickList[idx]);

            var theColor = self.brickList[idx].mesh.material.emissive.clone();

            if(theColor.r == 0)
                theColor.r =1;
            else if(theColor.g == 0)
                theColor.g =1;
            else if(theColor.b == 0)
                theColor.b =1;
            else {
                //var newBrick = self.brickList[idx].clone();
                var newBrick = {
                    mesh: self.brickList[idx].mesh.clone(),
                    id: {x: self.brickList[idx].x, y: self.brickList[idx].id.y*2, z: self.brickList[idx].id.z},
                    depth: self.brickList[idx].depth,
                    height: self.brickList[idx].height,
                    width: self.brickList[idx].width,
                    idx: shared.util.idToIdx({x: self.brickList[idx].x, y: self.brickList[idx].id.y+1, z: self.brickList[idx].id.z})
                }
                newBrick.mesh.position.y = self.brickList[idx].mesh.position.y-10;
                newBrick.mesh.material = new THREE.MeshPhongMaterial( { color: 0x000000,  emissive: 0x000000, ambient: 0x000000, shading: THREE.SmoothShading, opacity: 0.8, transparent: true } )
                newBrick.prototype = Bricks.prototype;
                //console.log(newBrick.prototype);
                self.brickList[newBrick.idx] = newBrick;
                shared.scene.add(newBrick.mesh);
                shared.collidableMeshList.push(newBrick.mesh);
            }

            var newMaterial =  new THREE.MeshPhongMaterial( { color: 0x000000,  emissive: theColor, ambient: 0x000000, shading: THREE.SmoothShading, opacity: 0.8, transparent: true, needsUpdate:true } );
            
            self.brickList[idx].mesh.material = newMaterial;
        }
    });
};
