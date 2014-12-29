var Balls = function (shared) {
    var p = shared.parameters;
    this.radius = p.ballsize;
    var geometry = new THREE.SphereGeometry(this.radius);
    var material = new THREE.MeshBasicMaterial({wireframe: true, color: 0xffffff});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = Math.random()*50-20;
    mesh.position.z = Math.random()*50-20;
    mesh.position.y = Math.random()*50-20;
    this.geometry = mesh.clone();

    var helperGeometry = new THREE.PlaneGeometry(p.bounding.width/ 3, p.bounding.depth / 3,
        p.bounding.sx, p.bounding.sz);

    var helperMaterial = new THREE.MeshBasicMaterial({wireframe: true, color: 0x13bee9});

    var helperMesh = new THREE.Mesh(helperGeometry, helperMaterial);

    helperMesh.rotation.x = Math.PI / 2;
    helperMesh.position.y = -24;
    //console.log(helperMesh);

    this.helperGeometry = helperMesh.clone();

    this.velocity = new THREE.Vector3(p.ballspeed.x, p.ballspeed.y,
        p.ballspeed.z);
};

Balls.prototype.update = function (bounding) {
    if (this.checkBounce(this.geometry.position.y, bounding.height, bounding.y)) {
        this.velocity.y = this.velocity.y * -1;
    }
    if (this.checkBounce(this.geometry.position.x, bounding.width, bounding.x)) {
        this.velocity.x = this.velocity.x * -1;
    }
    if (this.checkBounce(this.geometry.position.z, bounding.depth, bounding.z)) {
        this.velocity.z = this.velocity.z * -1;
    }
    this.geometry.position.add(this.velocity);

        this.helperGeometry.position.z = this.geometry.position.z;
        this.helperGeometry.position.x = this.geometry.position.x;
        this.helperGeometry.material.opacity = THREE.Math.mapLinear(this.geometry.position.y, -25, 25, 1,0);
        this.helperGeometry.material.transparent = true;

    
};

Balls.prototype.checkBounce = function (position, boundheight, boundoffset) {
    return (position + this.radius > boundheight / 2 + boundoffset ||
            position - this.radius < -boundheight / 2 + boundoffset);
};

Balls.prototype.getPosition = function () {
    return {x: this.geometry.position.x, y: this.geometry.position.y, z: this.geometry.position.z};
};

Balls.prototype.bounce = function (direction) {
    //this.geometry.position.y =0
    /*
    this.velocity[side] = this.velocity[side] * -1;
    this.geometry.position.add(this.velocity);
    */
    this.velocity.y = direction.y * -1;
    this.velocity.x = direction.x * -1;
    this.velocity.z = direction.z * -1;


};