
/*

TO FIX: find a more elegant way to stop scrolling when text is not big enough






*/






import React, { useEffect, useState, useMemo } from "react";
import { DeskThing } from "@deskthing/client";
import { SocketData, AppSettings, DEVICE_CLIENT } from "@deskthing/types";
import { array } from "prop-types";

// =================== Types ===================
type Vec2 = {
  x: number;
  y: number;
};
type SnakeState = {
  body: Vec2[];
  direction: "up" | "down" | "left" | "right";
  food: number;
};
type GameState = {
  speed: number;
  width: number;
  height: number;
  snake: SnakeState;
  gameOver: boolean;
  foodLocation: Vec2[];
  bombLocation: Vec2[];
};

// =================== Main ScreenViewer Component ===================
const ScreenViewer: React.FC = () => {

  // =================== State & Refs ===================
  const [settings, setSettings] = useState<AppSettings>();


 // ------------------Key Input Management ------------------
 useEffect(() => {
    const handleKeyDown = (e) => {
         const key = e.key;
        setGame((g) => {
            let newDirection = g.snake.direction;
            if (key === "ArrowUp" && g.snake.direction !== "down") newDirection = "up";
            else if (key === "ArrowDown" && g.snake.direction !== "up") newDirection = "down";
            else if (key === "ArrowLeft" && g.snake.direction !== "right") newDirection = "left";
            else if (key === "ArrowRight" && g.snake.direction !== "left") newDirection = "right";
            return {
                ...g,
                snake: {
                    ...g.snake,
                    direction: newDirection,
                },
            };
        });
         
    };
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };

}, []);
  

// ------------------ Touch Input Management ------------------
let xDown = null;
let yDown = null;
function handleTouchStart(evt) {
    evt.preventDefault();
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
    evt.preventDefault();
    if (!xDown || !yDown) {
        return;
    }

    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;

    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            /* left swipe */ 
            game.snake.direction !== "right" && setGame(g => ({
                ...g,
                snake: {  

                    ...g.snake,
                    direction: "left",
                },
            }));
        } else {
            /* right swipe */
            game.snake.direction !== "left" && setGame(g => ({
                ...g,
                snake: {
                    ...g.snake,
                    direction: "right",
                },
            }));
        }  
    } else {
        if (yDiff > 0) {
            /* up swipe */ 
            game.snake.direction !== "down" && setGame(g => ({
                ...g,
                snake: {
                    ...g.snake,
                    direction: "up",
                },
            }));
        } else { 
            /* down swipe */
            game.snake.direction !== "up" && setGame(g => ({
                ...g,
                snake: {
                    ...g.snake,
                    direction: "down",
                },
            }));
        }  
    }

    xDown = null;
    yDown = null;  
}

function handleTouchEnd(evt : TouchEvent) {
    // Reset values or handle end of touch event
    console.log('Touch ended');
}
// !--------------------- END Touch Input Management ------------------!


  // ------------------ Settings Management ------------------
  useEffect(() => {
    const initializeSettings = async () => {
      const settings = await DeskThing.getSettings();
      if (settings) {
        setSettings(settings);
        setGame((g) => ({
          ...g,
          width: Number(settings.playWidth.value),
          height: Number(settings.playHeight.value),
          foodLocation: [spawnNewFoodLocation(g)],
          speed: Number(settings.gameSpeed.value),
        }));
      }
      DeskThing.send({ type: "get", request: "sampleData" });
    };

    initializeSettings();

    const removeSettingsListener = DeskThing.on(
      DEVICE_CLIENT.SETTINGS,
      (data) => {
        if (data.payload) {
          setSettings(data.payload);
        }

      }
    );
    return () => {
      removeSettingsListener();
    };
  }, []);
  // !------------------ End Settings Management ------------------!


// ------------------ Game State Creation ------------------
 const [game, setGame] = useState<GameState>({
    speed: 2,
    width: 20,
    height: 20,
    snake: {
      body: [{ x: 0, y: 0 }],
      direction: "right",
      food: 0,
    },
    gameOver: false,
    foodLocation: [],
    bombLocation: [],
  });




  // ------------------ Grid Calculation ------------------
  const grid = useMemo(() => {
    const grid = Array.from({ length: game.height }, () =>
      Array(game.width).fill(0)
    );
    let i = 0;
    game.snake.body.forEach(({ x, y }) => {
      if (i == 0) {
        grid[y][x] = 3; // head
        i++;
      } else {
        
      grid[y][x] = 1;
      
      }

    });
    


   

    game.foodLocation.forEach(({ x, y }) => {
      i = 0; // resets head index after body loop
      grid[y][x] = 2;
    });

    return grid;
  }, [game]);

function spawnNewFoodLocation(game: GameState): Vec2 {
  let x = Math.floor(Math.random() * game.width);
  let y = Math.floor(Math.random() * game.height);

  return {
    x: x,
    y: y,
  };
}

// ------------------ Game Loop Logic ------------------
useEffect(() => {
  const tick = setInterval(() => {
    setGame(g => {
      const head = g.snake.body[0];
      let newHead = { ...head };

      switch (g.snake.direction) {
        case "right": newHead.x++; break;
        case "left": newHead.x--; break;
        case "up": newHead.y--; break;
        case "down": newHead.y++; break;
      }

      // wall collision
      if (
        newHead.x < 0 ||
        newHead.y < 0 ||
        newHead.x >= g.width ||
        newHead.y >= g.height
      ) {
        return { ...g, gameOver: true };
      }

      // food collision
      const foodIndex = g.foodLocation.findIndex(f => f.x === newHead.x && f.y === newHead.y);
      if (foodIndex !== -1) {
        const newFoodLocation = [...g.foodLocation];
        const newFood = spawnNewFoodLocation(g);
        newFoodLocation.push(newFood);
        newFoodLocation.splice(foodIndex, 1);
        return {
          ...g,
          snake: {
            ...g.snake,
            body: [newHead, ...g.snake.body],
            food: g.snake.food + 1,
          },
          foodLocation: newFoodLocation,
        };
      }

      // self collision
      for (let segment of g.snake.body) {
        if (segment.x === newHead.x && segment.y === newHead.y) {
          return { ...g, gameOver: true };
        }
      }

      return {
        ...g,
        snake: {
          ...g.snake,
          body: [newHead, ...g.snake.body.slice(0, -1)],
        },
      };
    });
  }, 500/Number(game.speed));

  return () => clearInterval(tick);
}, []);

// ------------------ Restart Game Handler ------------------
const handleRestart = () => {
  setGame(g => ({
    ...g,
    snake: {
      body: [{ x: 0, y: 0 }],
      direction: "right",
      food: 0,
    },
    gameOver: false,
    foodLocation: [spawnNewFoodLocation(g)],
  }));
}
// ------------------ Attach Touch Event Listeners ------------------
const touchArea = document.getElementById('play-area');
if (touchArea) {
    touchArea.addEventListener('touchstart', handleTouchStart, false);
    touchArea.addEventListener('touchmove', handleTouchMove, false);
    touchArea.addEventListener('touchend', handleTouchEnd, false);
}

  // ------------------ MAIN ------------------
  return (
    <div style={{ width: "800px", height: "480px", display: "flex", flexDirection: "column", margin: 0, padding: 0 }}>
      <h1>snakething is running!</h1>
      <button onClick={handleRestart}>Restart Game</button>
      {settings ? (
  game.gameOver ? (
    <h2>Game Over!</h2>
  ) : (
    <div id  ="play-area" style={{ display: "inline-block" }}>
      {grid.map((row, y) => (
        <div key={y} style={{ display: "flex"}}>
          {row.map((cell, x) => (
            <div
              key={x}
              style={{
                width: window.innerHeight / game.height - game.height/2,
                height: window.innerHeight / game.height - game.height/2,
                backgroundColor:
                  cell === 1 ? settings.snakeColor.value as string :
                  cell === 2 ? "#00ff00" :
                  cell === 3 ? "#e5ff00" :
                  "#616161",

                border: "1px solid #000",
                backgroundSize: "cover",
                backgroundImage: cell === 3 ? `url('./public/icons/snakeface.png')` : ``,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
) : (
  <p>Loading settings...</p>
)}

    </div>
  );
};

// !------------------ END MAIN ------------------!

export default ScreenViewer;

