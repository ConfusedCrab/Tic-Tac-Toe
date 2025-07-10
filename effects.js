// winning effect

// emoji effect 
function confettiEffect() {
    // calling victory sound 
    playWinSound();
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.left = '0';
    confetti.style.top = '0';
    confetti.style.width = '100vw';
    confetti.style.height = '100vh';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9999';

    const emojis = ['🎉', '✨', '🎊', '🥳', '⭐', '💫'];
    const count = 80;   // More confetti

    // Append 
    document.body.appendChild(confetti);

    // Spread confetti creation across time
    let created = 0;

    // calling victory sound 
    playWinSound();

    function addConfettiChunk() {
        const chunkSize = 10;
        for (let i = 0; i < chunkSize && created < count; i++) {
            const span = document.createElement('span');
            span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            span.style.position = 'absolute';
            span.style.left = Math.random() * 100 + 'vw';
            span.style.top = '-3em';
            span.style.fontSize = (Math.random() * 1.8 + 1.5) + 'em';
            span.style.opacity = 0.9;
            span.style.transition = 'transform 1.4s ease-out, opacity 2.5s';   // slightly faster
            span.style.transform = `translateY(0) rotate(0deg)`;
            confetti.appendChild(span);

            // Animate drop
            setTimeout(() => {
                const rotate = 180 + Math.random() * 360;
                const translateY = 85 + Math.random() * 25;
                const translateX = (Math.random() - 0.5) * 10;
                span.style.transform = `translate(${translateX}vw, ${translateY}vh) rotate(${rotate}deg)`;
                span.style.opacity = 0;
            }, 50);
        }


        created += chunkSize;
        if (created < count) {
            requestAnimationFrame(addConfettiChunk); // smooth batching
        }
    }

    // Victory label
    //   const label = document.createElement('div');
    //  label.textContent = `🎉 ${winner === 'X' ? playerXName : playerOName} Wins! 🎉`;
    //   label.style.position = 'fixed';
    //   label.style.top = '40%';
    //   label.style.left = '50%';
    //   label.style.transform = 'translate(-50%, -50%) scale(0.9)';
    //   label.style.fontSize = '3em';
    //   label.style.color = '#fff';
    //   label.style.background = 'rgba(0, 0, 0, 0.7)';
    //   label.style.padding = '0.5em 1.2em';
    //   label.style.borderRadius = '20px';
    //   label.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';
    //   label.style.zIndex = '10000';
    //   label.style.opacity = '0';
    //   label.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

    //   document.body.appendChild(label);

    //   setTimeout(() => {
    //       label.style.opacity = '1';
    //       label.style.transform = 'translate(-50%, -50%) scale(1)';
    //   }, 100);


    addConfettiChunk(); // start batching

    // Start fireworks after slight delay to decouple animations
    setTimeout(() => {
        fireworksEffect();
    }, 300); // small buffer to avoid same-frame spike


    // Remove everything after a bit
    setTimeout(() => {
        confetti.remove();
        // label.remove();
    }, 3500);
}


// fire crackers
let fireworksInterval = null;

function fireworksEffect() {
    const fireworks = document.createElement('div');
    fireworks.className = 'fireworks';

    fireworks.id = 'persistent-fireworks';  //  ID 

    // Append
    document.body.appendChild(fireworks);

    // firecrackers colour
    const vibrantColors = ['#ff0055', '#ffcc00', '#00ffd5', '#00ff44', '#ff00ff', '#00bfff'];

    function launchFirework() {
        //    for (let i = 0; i < 25; i++) {
        const dot = document.createElement('div');
        dot.className = 'firework-dot';
        dot.style.left = `${Math.random() * 100}vw`;
        dot.style.top = `${Math.random() * 100}vh`;
        const color = vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
        dot.style.backgroundColor = color;
        dot.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
        fireworks.appendChild(dot);

        //  spark live a bit, then fade
        setTimeout(() => {
            dot.style.opacity = 0;
            dot.style.transition = 'opacity 1s ease-out';
        }, 1000);

        // Remove after animation
        setTimeout(() => {
            dot.remove();
        }, 2000);   // Fade each dot after 2s

        // }
    }
    function burst() {
        const burstCount = Math.floor(Math.random() * 5) + 3;
        for (let i = 0; i < burstCount; i++) {
            setTimeout(() => {
                launchFirework();
            }, i * 200); // staggered spark
        }
    }

    //  FIRST BURST IMMEDIATELY!
    burst();

    //  Continuous bursts every 1.5 seconds
    if (!fireworksInterval) {
        fireworksInterval = setInterval(burst, 1500);
    }


}

// stops the fireworks
function stopFireworks() {
    const fireworks = document.getElementById('persistent-fireworks');
    if (fireworks) {
        fireworks.remove();
    }

    if (fireworksInterval) {
        clearInterval(fireworksInterval);
        fireworksInterval = null;
    }
}


// winning sound effect
function playWinSound() {
    if (!window.winAudio) return;

    try {
        window.winAudio.currentTime = 0; // reset if reused
        window.winAudio.play();

        setTimeout(() => {
            window.winAudio.pause();  // Stop playback
            window.winAudio.currentTime = 0;// Reset audio to start
        }, 4000);
    } catch (e) {
        console.warn('Win sound error:', e);
    }
}

// on draw
function drawEffect(boardEl, squareEls) {

    // playDrawSound();

    // Pick one random cell from each row to fall   (cell drop effect )
    const fallIndices = [
        Math.floor(Math.random() * 3), // row 1: 0,1,2
        3 + Math.floor(Math.random() * 3), // row 2: 3,4,5
        6 + Math.floor(Math.random() * 3)  // row 3: 6,7,8
    ];

    boardEl.classList.add('impact-shake');

    setTimeout(() => {
        boardEl.classList.remove('impact-shake');
        squareEls.forEach((square, i) => {
            if (fallIndices.includes(i)) {
                square.style.animationDelay = '0s';
                square.classList.add('pop-out');
            } else {
                square.style.animationDelay = '';
                square.classList.remove('pop-out');
            }
        });

        boardEl.classList.add('draw-pop');

        setTimeout(() => {
            boardEl.classList.remove('draw-pop');
            squareEls.forEach((square, i) => {
                if (fallIndices.includes(i)) {
                    square.textContent = '';
                    square.style.animationDelay = '';
                    square.style.visibility = 'hidden';
                    square.classList.remove('pop-out');
                } else {
                    square.style.visibility = '';
                }
            });

            gameActive = false;
        }, 1200);
    }, 300);
}

// // draw sound effect
// function playDrawSound() {
//     if (!window.drawSound) {
//         console.warn('drawSound not defined on window.');
//         return;
//     }

//     try {
//         window.drawSound.currentTime = 0; // rewind
//         window.drawSound.play();

//         setTimeout(() => {
//             window.drawSound.pause();    // Stop playback
//             window.drawSound.currentTime = 0;  // Reset audio to start
//         }, 4000); // stop after 4 sec
//     } catch (e) {
//         console.warn('Draw sound error:', e);
//     }
// }


// // lose sound effect
// function playloseSound() {
//     if (!window.loseSound) {
//         console.warn('loseSound not defined on window.');
//         return;
//     }

//     try {
//         window.loseSound.currentTime = 0; // rewind
//         window.loseSound.play();

//         setTimeout(() => {
//             window.loseSound.pause();    // Stop playback
//             window.loseSound.currentTime = 0;  // Reset audio to start
//         }, 4000); // stop after 4 sec
//     } catch (e) {
//         console.warn('lose sound error:', e);
//     }
// }


