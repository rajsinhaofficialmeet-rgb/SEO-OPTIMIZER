import React, { useRef, useEffect } from 'react';

export const VisualDivider: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[];
        const mouse = { x: null as number | null, y: null as number | null, radius: 150 };

        const isDarkMode = document.documentElement.classList.contains('dark');
        const particleColor = isDarkMode ? 'rgba(251, 191, 36, 0.7)' : 'rgba(245, 158, 11, 0.7)'; // amber-400 / amber-500
        const lineColor = isDarkMode ? 'rgba(251, 191, 36, 0.2)' : 'rgba(245, 158, 11, 0.2)';

        class Particle {
            x: number;
            y: number;
            directionX: number;
            directionY: number;
            size: number;

            constructor(x: number, y: number, directionX: number, directionY: number, size: number) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = particleColor;
                ctx.fill();
            }

            update() {
                if (this.x > canvas.width || this.x < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y > canvas.height || this.y < 0) {
                    this.directionY = -this.directionY;
                }

                // Mouse interaction
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                            this.x += 1;
                        }
                        if (mouse.x > this.x && this.x > this.size * 10) {
                            this.x -= 1;
                        }
                        if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                            this.y += 1;
                        }
                        if (mouse.y > this.y && this.y > this.size * 10) {
                            this.y -= 1;
                        }
                    }
                }

                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        function init() {
            particles = [];
            const numberOfParticles = (canvas.height * canvas.width) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                const size = (Math.random() * 2) + 1;
                const x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
                const y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
                const directionX = (Math.random() * .4) - .2;
                const directionY = (Math.random() * .4) - .2;
                particles.push(new Particle(x, y, directionX, directionY, size));
            }
        }

        function connect() {
            if (!ctx) return;
            let opacityValue = 1;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    const distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
                                 + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                    if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                        opacityValue = 1 - (distance / 20000);
                        ctx.strokeStyle = lineColor.replace(/[\d\.]+\)/, `${opacityValue})`);
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
            }
            connect();
        }

        const handleResize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            init();
        };

        const handleMouseMove = (event: MouseEvent) => {
            mouse.x = event.clientX - canvas.getBoundingClientRect().left;
            mouse.y = event.clientY - canvas.getBoundingClientRect().top;
        };

        const handleMouseOut = () => {
            mouse.x = null;
            mouse.y = null;
        };
        
        window.addEventListener('resize', handleResize);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseout', handleMouseOut);

        handleResize();
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseout', handleMouseOut);
        };
    }, []);

    return (
        <div className="w-full h-[200px] my-8 sm:my-12 px-4 sm:px-6 lg:px-8">
            <canvas ref={canvasRef} className="w-full h-full block rounded-xl" />
        </div>
    );
};
