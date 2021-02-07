let gammaIndex = 0

let Gamma = class {
  constructor(pos = Vector.random([0, simulationWidth], [0, simulationHeight])) {
    // used for identifying itself
    this.id = gammaIndex++
    this.color = [360, 100, 100]
    this.lineWeight = 1
    this.position = pos
    this.orbitTarget = -1
    this.velocity = Vector.randomPolar(10)
    this.orbitVelocity = new Vector(0, 0)
    this.followVelocity = new Vector(0, 0)
    this.attractForce = new Vector(0, 0)
    this.totalForce = new Vector(0, 0)
  }
  draw(p) {
    p.push()
    p.strokeWeight(this.lineWeight)
    p.stroke(200, 60, 60, 0.5)
    // didn't choose track close particles instead because of rendering glitches
    gammaParticles.forEach(pt => {
      let inRange = 40
      let dist = Vector.getDistance(this.position, pt.position)
      if (dist < inRange && this.id != pt.id && pt.orbitTarget == -1) {
        p.line(...this.position, ...pt.position)
      }
    })
    p.pop()
    p.noStroke(0)
    p.fill(...this.color)
    p.circle(...this.position, 5)

  }

  drawDebug(p) {
    this.velocity.drawArrow({
      p: p,
      center: this.position,
      multiple: 1,
      arrowSize: 6,
      color: [360, 100, 100, .3]
    })
    this.attractForce.drawArrow({
      p: p,
      center: this.position,
      multiple: 4,
      arrowSize: 10,
      color: [160, 50, 50, .3]
    })
    this.totalForce.drawArrow({
      p: p,
      center: this.position,
      multiple: 4,
      arrowSize: 10,
      color: [300, 50, 50, .5]
    })
  }

  update(t, dt) {

    this.totalForce = new Vector(0, 0)

    this.position[0] %= simulationWidth
    this.position[1] %= simulationHeight
    if (this.position[0] < 0)
      this.position[0] += simulationWidth
    if (this.position[1] < 0)
      this.position[1] += simulationHeight

    // calculate attraction forces
    gammaParticles.forEach(pt => {
      let inRange = 40
      let dist = Vector.getDistance(this.position, pt.position)
      //console.log(dist)
      if (dist < inRange && this.id != pt.id && pt.orbitTarget == -1) {
        let newForce = Vector.getDifference(this.position, pt.position).normalize()
        // the closer it is, larger the force
        this.attractForce.addMultiples(newForce, (inRange - dist) / inRange)
      }
    })
    zetaParticles.forEach(pt => {
      let inRange = SLIDERS.gammaOrbitalSize.value()
      let outerRange = 20 + SLIDERS.gammaOrbitalSize.value()
      let dist = Vector.getDistance(this.position, pt.position)

      if ((dist < inRange) || (pt.id == this.orbitTarget && (dist < outerRange))) {
        this.orbitTarget = pt.id
        let centripetal = Vector.getDifference(pt.position, this.position).normalize()
        this.orbitVelocity = new Vector(-centripetal[1], centripetal[0])
        this.followVelocity = pt.velocity
        this.color = [40, 70, 70]
        this.lineWeight = 0
        this.attractForce.mult(.5)
      } else if ((pt.id == this.orbitTarget) && dist >= outerRange) {
        this.orbitTarget = -1
      }
    })

    if (this.orbitVelocity.magnitude < .5) {
      this.color = [360, 100, 100]
      this.lineWeight = 1
    }

    this.totalForce.addMultiples(this.attractForce, .3)

    this.position.addMultiples(this.velocity, dt)
    this.position.addMultiples(this.followVelocity, dt)
    this.position.addMultiples(this.orbitVelocity, 1)
    this.velocity.addMultiples(this.totalForce, dt)
    this.attractForce.mult(.99)
    this.orbitVelocity.mult(.8)
    this.followVelocity.mult(.99)
    this.velocity.mult(.999)
  }
}