/**
 * Created with JetBrains WebStorm.
 * User: alxlu
 * Date: 10/18/13
 * Time: 2:06 PM
 */
var Paddles = function (shared) {

    var geometry = new THREE.CubeGeometry(shared.parameters.paddlesize.width, shared.parameters.paddlesize.height,
        shared.parameters.paddlesize.depth);
    var material = new THREE.MeshBasicMaterial({wireframe: true});
    var paddle = new THREE.Mesh(geometry, material);

    paddle.position.y = -19;

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
    pos.x += increment.x || 0;
    pos.y += increment.y || 0;
    pos.z += increment.z || 0;
};

