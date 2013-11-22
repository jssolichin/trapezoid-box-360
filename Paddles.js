/**
 * Created with JetBrains WebStorm.
 * User: alxlu
 * Date: 10/18/13
 * Time: 2:06 PM
 */
var Paddles = function (shared, color, pos) {

    var geometry = new THREE.CubeGeometry(shared.parameters.paddlesize.width, shared.parameters.paddlesize.height,
        shared.parameters.paddlesize.depth);

    var material = new THREE.MeshBasicMaterial({color: color});
    var paddle = new THREE.Mesh(geometry, material);

    paddle.position.x = pos[0];
    paddle.position.y = -20;
    paddle.position.z = pos[1];

    paddle.geometry.vertices.forEach(function (v, idx, arr) {
        if (v.y == shared.parameters.paddlesize.height / 2) {
            arr[idx].x = v.x * 0.7;
            arr[idx].z = v.z * 0.7;
        }
    });

    this.geometry = paddle.clone();
};

Paddles.prototype.updatePos = function (x, y, z) {
    this.geometry.position.x = x;
    this.geometry.position.y = y;
    this.geometry.position.z = z;
};

Paddles.prototype.getPos = function () {
    return {x: this.geometry.position.x, y: this.geometry.position.y, z: this.geometry.position.z};
};

Paddles.prototype.incrementPos = function (increment, bounding) {
    var pos = this.geometry.position;
    var geo = this.geometry.geometry;
    pos.x += increment.x || 0;
    pos.y += increment.y || 0;
    pos.z += increment.z || 0;
    if (pos.x + geo.width / 2 >= bounding.width / 2 + bounding.x) {
        pos.x = bounding.width / 2 + bounding.x - geo.width / 2;
    }
    if (pos.x - geo.width / 2 <= -bounding.width / 2 + bounding.x) {
        pos.x = -bounding.width / 2 + bounding.x + geo.width / 2;
    }
    if (pos.z + geo.depth / 2 >= bounding.depth / 2 + bounding.z) {
        pos.z = bounding.depth / 2 + bounding.z - geo.depth / 2;
    }
    if (pos.z - geo.depth / 2 <= -bounding.depth / 2 + bounding.z) {
        pos.z = -bounding.depth / 2 + bounding.z + geo.depth / 2;
    }
};