/**
 * Created by alxlu on 10/18/13.
 */
var Balls = function (shared) {
    var geometry = new THREE.SphereGeometry(shared.parameters.ballsize);
    var material = new THREE.MeshBasicMaterial({wireframe: true});
    var mesh = new THREE.Mesh(geometry, material);
    this.geometry = mesh.clone();

    this.velocity = new THREE.Vector3(shared.parameters.ballspeed.x, shared.parameters.ballspeed.y,
        shared.parameters.ballspeed.z);
};

Balls.prototype.update = function (bounding) {
    if (this.checkBounce(this.geometry.position.y, bounding.height, bounding.y)) {
        console.log(this.geometry.position.y);
        this.velocity.y = this.velocity.y * -1;
    }
    if (this.checkBounce(this.geometry.position.x, bounding.width, bounding.x)) {
        this.velocity.x = this.velocity.x * -1;
    }
    if (this.checkBounce(this.geometry.position.z, bounding.depth, bounding.z)) {
        this.velocity.z = this.velocity.z * -1;
    }
    this.geometry.position.add(this.velocity);
}

Balls.prototype.checkBounce = function(position, boundheight, boundoffset) {
    return (position > boundheight / 2 + boundoffset || position < -boundheight / 2 + boundoffset);
}