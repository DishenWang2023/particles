let deltaIndex = 0

let Delta = class {
  constructor() {
    // used for identifying itself
    this.id = deltaIndex++
    this.hue = 150
    this.size = 6
    this.triOffset = [0, -this.size]
    this.position = (Vector.random([0, simulationWidth], [0, simulationHeight]))
    this.velocity = Vector.randomPolar(20)
    this.limit = 120
    this.syncForce = new Vector(0, 0)
    // affected by gamma
    this.repelForce = new Vector(0, 0)
    this.totalForce = new Vector(0, 0)
  }

  draw(p) {
    let scale = Math.min(4, 2 * this.size * (this.velocity.magnitude / this.limit))

    p.push()
    p.noStroke(0)
    p.fill(this.hue, 60, 60)
    p.translate(this.position[0], this.position[1])
    p.rotate(Math.PI * 3 / 2 + this.velocity.angle)
    p.beginShape()
    // first triangle
    p.vertex(...this.trianglePositions(this.triOffset, this.size)[0])
    p.vertex(...this.trianglePositions(this.triOffset, this.size)[1])
    p.vertex(...this.trianglePositions(this.triOffset, this.size)[2])
    // second triangle
    p.beginContour()
    // the order is counter-clockwise for contour to work
    p.vertex(...this.trianglePositions(this.triOffset, scale)[2])
    p.vertex(...this.trianglePositions(this.triOffset, scale)[1])
    p.vertex(...this.trianglePositions(this.triOffset, scale)[0])
    p.endContour()
    p.endShape()
    p.pop()
  }

  drawDebug(p) {
    this.velocity.drawArrow({
      p: p,
      center: this.position,
      multiple: 1,
      arrowSize: 6,
      color: [360, 100, 100, .3]
    })

    this.syncForce.drawArrow({
      p: p,
      center: this.position,
      multiple: 4,
      arrowSize: 10,
      color: [160, 50, 50, .3]
    })

    this.repelForce.drawArrow({
      p: p,
      center: this.position,
      multiple: 4,
      arrowSize: 10,
      color: [100, 50, 50, .3]
    })

    p.fill(100, 70, 100)
    p.circle(...this.position, 1)
  }

  update(t, dt) {

    this.totalForce = new Vector(0, 0)

    this.position[0] %= simulationWidth
    this.position[1] %= simulationHeight
    if (this.position[0] < 0)
      this.position[0] += simulationWidth
    if (this.position[1] < 0)
      this.position[1] += simulationHeight

    deltaParticles.forEach(pt => {
      let inRange = SLIDERS.deltaSyncRange.value()
      let dist = Vector.getDistance(this.position, pt.position)
      if (dist < inRange && this.id != pt.id) {
        //using velocity instead of total force because of matching direction
        let newForce = Vector.average(this.velocity, pt.velocity)
        newForce.normalize()
        // the closer it is, larger the force
        this.syncForce.addMultiples(newForce, (inRange - dist) / inRange)
      }
    })

    gammaParticles.forEach(pt => {
      let inRange = 10
      let dist = Vector.getDistance(this.position, pt.position)
      if (dist < inRange) {
        // using velocity instead of total force because of matching direction
        let newForce = Vector.getDifference(pt.position, this.position).normalize()
        // the closer it is, larger the force
        this.repelForce.addMultiples(newForce, (inRange - dist) / inRange)
      }
    })

    zetaParticles.forEach(pt => {
      let inRange = 15
      let dist = Vector.getDistance(this.position, pt.position)
      if (dist < inRange) {
        // using velocity instead of total force because of matching direction
        let newForce = Vector.getDifference(pt.position, this.position).normalize()
        // the closer it is, larger the force
        this.repelForce.addMultiples(newForce, 10 * (inRange - dist) / inRange)
      }
    })

    this.totalForce.addMultiples(this.syncForce, 5, this.repelForce, 30)

    this.position.addMultiples(this.velocity, dt);
    this.velocity.addMultiples(this.totalForce, dt)
    this.syncForce.mult(.90)
    this.repelForce.mult(.95)
    // limit velocity to magnitude 100
    if (this.velocity.magnitude > this.limit) {
      this.velocity.normalize().mult(this.limit)
    }
    this.velocity.mult(.995)

  }

  // gives bottom center point, return 3 triangle points
  trianglePositions(pos, scale) {
    let points = []
    points.push(new Vector(pos[0], pos[1] + Math.sqrt(3) * scale))
    points.push(new Vector(pos[0] - scale, pos[1]))
    points.push(new Vector(pos[0] + scale, pos[1]))
    return points
  }

}