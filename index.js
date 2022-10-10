const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height); //drawing out the game box dimensions

const gravity = 0.7; //setting gravity

//inserting and positioning the background
const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/background.png",
});

const foreground = new Sprite({
  position: {
    x: 0,
    y: 185,
  },
  imageSrc: "./img/foreground.png",
});

const buildings = new Sprite({
  position: {
    x: 0,
    y: 100,
  },
  imageSrc: "./img/buildings.png",
});

const farBuildings = new Sprite({
  position: {
    x: 100,
    y: 0,
  },
  imageSrc: "./img/far-buildings.png",
});

//inserting and positioning the player and their animations
const player = new Fighter({
  position: {
    x: 0,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/Blue/Idle.png",
  framesMax: 6,
  scale: 3,
  offset: {
    x: 10,
    y: 19,
  },
  sprites: {
    idle: {
      imageSrc: "./img/Blue/Idle.png",
      framesMax: 6,
    },
    run: {
      imageSrc: "./img/Blue/running.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/Blue/jumping.png",
      framesMax: 8,
    },
    fall: {
      imageSrc: "./img/Blue/fall.png",
      framesMax: 8,
    },
    attack1: {
      imageSrc: "./img/Blue/attack1.png",
      framesMax: 8,
      framesHold: 3,
    },
    takeHit: {
      imageSrc: "./img/Blue/hit.png",
      framesMax: 4,
    },
    death: {
      imageSrc: "./img/Blue/die.png",
      framesMax: 4,
    },
  },
  attackBox: {
    offset: {
      x: 100,
      y: 65,
    },
    width: 53,
    height: 50,
  },
});

//inserting and positioning the enemy and their animations
const enemy = new Fighter({
  position: {
    x: 400,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: -50,
    y: 0,
  },
  imageSrc: "./img/Red/Idle.png",
  framesMax: 6,
  scale: 3,
  offset: {
    x: 10,
    y: 19,
  },
  sprites: {
    idle: {
      imageSrc: "./img/Red/Idle.png",
      framesMax: 6,
    },
    run: {
      imageSrc: "./img/Red/running.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/Red/jumping.png",
      framesMax: 8,
    },
    fall: {
      imageSrc: "./img/Red/fall.png",
      framesMax: 8,
    },
    attack1: {
      imageSrc: "./img/Red/attack1.png",
      framesMax: 8,
      framesHold: 3,
    },
    takeHit: {
      imageSrc: "./img/Red/hit.png",
      framesMax: 4,
    },
    death: {
      imageSrc: "./img/Red/die.png",
      framesMax: 4,
    },
  },
  attackBox: {
    offset: {
      x: -50,
      y: 65,
    },
    width: 80,
    height: 50,
  },
});

enemy.draw();

//making the keys when pressed to equal false so we can implented them in a function later on
const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  w: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  ArrowUp: {
    pressed: false,
  },
};

decreaseTimer();

function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);

  background.update();
  farBuildings.update();
  buildings.update();
  foreground.update();
  c.fillStyle = "rgba(255, 255, 255, 0.05)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  //player movement

  if (keys.a.pressed && player.lastKey === "a") {
    player.velocity.x = -5;
    player.switchSprite("run");
  } else if (keys.d.pressed && player.lastKey === "d") {
    player.velocity.x = 5;
    player.switchSprite("run");
  } else {
    player.switchSprite("idle");
  }

  if (player.velocity.y < 0) {
    player.switchSprite("jump");
  } else if (player.velocity.y > 0) {
    player.switchSprite("fall");
  }

  //enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
    enemy.velocity.x = -5;
    enemy.switchSprite("run");
  } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
    enemy.velocity.x = 5;
    enemy.switchSprite("run");
  } else {
    enemy.switchSprite("idle");
  }

  if (enemy.velocity.y < 0) {
    enemy.switchSprite("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite("fall");
  }

  // detect for collision
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy,
    }) &&
    player.isAttacking &&
    player.framesCurrent === 3
  ) {
    enemy.takeHit();
    player.isAttacking = false;

    document.querySelector("#enemyHealth").style.width = enemy.health + "%";
  }

  // if player misses
  if (player.isAttacking && player.framesCurrent === 3) {
    player.isAttacking = false;
  }

  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player,
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 1
  ) {
    player.takeHit();
    enemy.isAttacking = false;

    document.querySelector("#playerHealth").style.width = player.health + "%";
  }

  // if enemy misses
  if (enemy.isAttacking && enemy.framesCurrent === 1) {
    enemy.isAttacking = false;
  }

  //end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

animate();

//event listener for when you press down on a key
window.addEventListener("keydown", (event) => {
  if (!player.dead) {
    switch (event.key) {
      case "d":
        keys.d.pressed = true;
        player.lastKey = "d";
        break;

      case "a":
        keys.a.pressed = true;
        player.lastKey = "a";
        break;

      case "w":
        player.velocity.y = -22;
        break;

      case " ":
        player.attack();
        break;
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case "ArrowRight":
        keys.ArrowRight.pressed = true;
        enemy.lastKey = "ArrowRight";
        break;

      case "ArrowLeft":
        keys.ArrowLeft.pressed = true;
        enemy.lastKey = "ArrowLeft";
        break;

      case "ArrowUp":
        keys.ArrowUp.pressed = true;
        enemy.velocity.y = -22;
        break;

      case "Shift":
        enemy.attack();
        break;
    }
  }
});

//event listener for when you press down up a key
window.addEventListener("keyup", (event) => {
  //the player
  switch (event.key) {
    case "d":
      keys.d.pressed = false;
      break;

    case "a":
      keys.a.pressed = false;
      break;
  }

  //the enemy
  switch (event.key) {
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;

    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
  }
});
