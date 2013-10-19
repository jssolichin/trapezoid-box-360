/**
 * Created by alxlu on 10/18/13.
 */
var Balls = function (shared) {
    var geometry = new THREE.SphereGeometry(shared.parameters.ballsize);
    var material = new THREE.MeshBasicMaterial({wireframe: true});
    var mesh = new THREE.Mesh(geometry, material);
    this.geometry = mesh.clone();

};