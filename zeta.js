let zetaIndex = 0

function getFieldForce(t, x, y) {
  let scale = .002
  let theta = 20 * noise(x * scale * .5, y * scale * .5, t * .07)
  let strength = noise(x * scale, y * scale, t * .1 + 100)
  let r = 100 + 1900 * strength * strength
  return Vector.polar(r, theta)

}

function debugFieldForce(p, t) {

  // How many columns and rows of points do we want?
  let tileSize = 40
  let tileX = Math.floor(simulationWidth / tileSize)
  let tileY = Math.floor(simulationHeight / tileSize)

  let drawScale = .03
  for (var i = 0; i < tileX; i++) {
    for (var j = 0; j < tileY; j++) {

      // What point are we at?
      let x = tileSize * (i + .5)
      let y = tileSize * (j + .5)

      // Calculate the force here
      let force = getFieldForce(t, x, y)

      // Draw the current wind vector
      p.fill(240, 70, 50)
      p.noStroke()
      p.circle(x, y, 2)
      p.stroke(240, 70, 50, .3)
      p.line(x, y, x + drawScale * force[0], y + drawScale * force[1])
    }
  }
}

let Zeta = class {
  constructor() {
    this.id = zetaIndex++
    this.hue = 0
    this.position = (Vector.random([0, simulationWidth], [0, simulationHeight]))
    this.velocity = Vector.randomPolar(20)
    this.repelForce = new Vector(0, 0)
    this.totalForce = new Vector(0, 0)
  }

  draw(p) {
    p.noStroke(0)
    for (var i = 0; i < 6; i++) {
      p.fill(this.hue, 50, 50, 0.5)
      p.circle(...this.position, 8 + i * 2)
    }
  }

  drawDebug(p, t) {
    debugFieldForce(p, t)
    this.velocity.drawArrow({
      p: p,
      center: this.position,
      multiple: 1,
      arrowSize: 6,
      color: [360, 100, 100, .3]
    })
    this.repelForce.drawArrow({
      p: p,
      center: this.position,
      multiple: 4,
      arrowSize: 10,
      color: [100, 50, 50, .3]
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

    this.fieldForce = getFieldForce(t, ...this.position)

    // repels each other
    zetaParticles.forEach(pt => {
      let inRange = 30
      let dist = Vector.getDistance(pt.position, this.position)
      if (dist < inRange && this.id != pt.id) {
        let newForce = Vector.getDifference(pt.position, this.position).normalize()
        // the closer it is, larger the force
        this.repelForce.addMultiples(newForce, (inRange - dist) / inRange)
      }
    })

    this.totalForce.addMultiples(this.fieldForce, SLIDERS.zetaFieldForce.value(), this.repelForce, 1)
    this.position.addMultiples(this.velocity, dt)
    this.velocity.addMultiples(this.totalForce, dt)
    this.velocity.mult(.99)
  }

}