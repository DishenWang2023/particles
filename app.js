let SLIDERS = {

}

let FLAGS = {
  drawGammaDebug: false,
  drawDeltaDebug: false,
  drawZetaDebug: false
}

let paused = false
// Pause on spacebar
document.onkeyup = function(e) {
  if (e.keyCode == 32) {
    paused = !paused
  }
}

let mainP5 = undefined
let lightmap = undefined

let simulationWidth = 900
let simulationHeight = 500

// an array of particles
let gammaParticles = []
gammaCount = 50
let deltaParticles = []
deltaCount = 20
let zetaParticles = []
zetaCount = 5

let noise = function() {
  console.warn("Noise not yet initialized")
}

function createSlider({
  label,
  min,
  max,
  defaultValue,
  step = 1
}) {
  SLIDERS[label] = mainP5.createSlider(min, max, defaultValue, step)

  let controls = document.getElementById("controls")
  let holder = document.createElement("div");
  holder.className = "slider"
  holder.innerHTML = label

  // Add things to the DOM
  controls.append(holder)
  holder.append(SLIDERS[label].elt)
}

// Do setup
document.addEventListener("DOMContentLoaded", function() {
  console.log("Steering")

  mainP5 = new p5(
    function(p) {
      noise = p.noise

      p.setup = () => {
        p.createCanvas(simulationWidth, simulationHeight)
        p.colorMode(p.HSL)
        p.background(0)

        // TODO: initialize particles
        for (var i = 0; i < gammaCount; i++) {
          let pt = new Gamma()
          gammaParticles.push(pt)
        }

        for (var i = 0; i < deltaCount; i++) {
          let pt = new Delta()
          deltaParticles.push(pt)
        }

        for (var i = 0; i < zetaCount; i++) {
          let pt = new Zeta()
          zetaParticles.push(pt)
        }
        createSlider({
          label: "gammaOrbitalSize",
          min: 1,
          max: 40,
          defaultValue: 20,
          step: 1
        })
        createSlider({
          label: "deltaSyncRange",
          min: 1,
          max: 200,
          defaultValue: 50,
          step: 1
        })
        createSlider({
          label: "zetaFieldForce",
          min: .01,
          max: 0.4,
          defaultValue: .04,
          step: .01
        })
      }

      p.mouseClicked = () => {
        let t = p.millis() * .001

        // Processing likes to greedily respond to *all* mouse events,
        // even when outside the canvas
        // This code checks to see if we're *actually* in the P5 window before responding
        // Use this code if you implement dragging, too
        // From https://stackoverflow.com/questions/36767196/check-if-mouse-is-inside-div

        if (p.canvas.parentNode.querySelector(":hover") == p.canvas) {
          //Mouse is inside element
          let mousePos = new Vector(p.mouseX, p.mouseY)
          gammaParticles.push(new Gamma(mousePos))
          console.log("Click inside")

          // Make a new boid
          // boidFlock.addBoid([mouseX, mouseY])
        }
      }

      p.draw = () => {
        p.background(0)
        let t = p.millis() * .001
        // deltaTime increases when switching tabs
        let dt = Math.min(p.deltaTime * .001, .1)

        if (!paused) {
          // update particles
          gammaParticles.forEach(pt => pt.update(t, dt))
          deltaParticles.forEach(pt => pt.update(t, dt))
          zetaParticles.forEach(pt => pt.update(t, dt))
        }
        // draw after update
        // seperated zeta draw and debug draw for aesthetic reson
        if (FLAGS.drawZetaDebug)
          zetaParticles.forEach(pt => pt.drawDebug(p, t))

        gammaParticles.forEach(pt => pt.draw(p))
        if (FLAGS.drawGammaDebug)
          gammaParticles.forEach(pt => pt.drawDebug(p))

        deltaParticles.forEach(pt => pt.draw(p))
        if (FLAGS.drawDeltaDebug)
          deltaParticles.forEach(pt => pt.drawDebug(p))
        zetaParticles.forEach(pt => pt.draw(p))
      }


    }, document.getElementById("main"))
})