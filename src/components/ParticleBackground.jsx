import React, { useEffect, useRef } from 'react'

const ParticleBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationId

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Particles array
    const particles = []
    const maxParticles = 50

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.radius = Math.random() * 2 + 1
        this.opacity = Math.random() * 0.5 + 0.2
        this.life = 1
        this.decay = Math.random() * 0.01 + 0.005
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.life -= this.decay
        this.opacity = this.life * 0.5

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width
        if (this.x > canvas.width) this.x = 0
        if (this.y < 0) this.y = canvas.height
        if (this.y > canvas.height) this.y = 0
      }

      draw() {
        ctx.save()
        ctx.globalAlpha = this.opacity
        ctx.beginPath()
        
        // Create gradient
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius
        )
        gradient.addColorStop(0, '#3b82f6')
        gradient.addColorStop(0.5, '#8b5cf6')
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle())
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i]
        particle.update()
        particle.draw()

        // Remove dead particles
        if (particle.life <= 0) {
          particles.splice(i, 1)
        }
      }

      // Add new particles
      while (particles.length < maxParticles) {
        particles.push(new Particle())
      }

      // Draw connections
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)'
      ctx.lineWidth = 1
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.globalAlpha = (100 - distance) / 100 * 0.2
            ctx.stroke()
          }
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  )
}

export default ParticleBackground
