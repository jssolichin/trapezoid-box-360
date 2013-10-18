/**
 * Created with JetBrains WebStorm.
 * User: alxlu
 * Date: 10/18/13
 * Time: 2:06 PM
 */
var Paddles = function(shared) {

    var geometry = new THREE.CubeGeometry(shared.parameters.paddlesize.width, shared.parameters.paddlesize.height,
        shared.parameters.paddlesize.depth);
    var material = new THREE.MeshBasicMaterial({wireframe: true});
    var paddle = new THREE.Mesh(geometry, material);

    paddle.position.y = -10;

    this.geometry = paddle.clone();




};