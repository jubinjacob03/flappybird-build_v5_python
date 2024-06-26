import styled, { keyframes } from "styled-components";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

const BIRD_HEIGHT = 50;
const BIRD_WIDTH = 160;
const WALL_HEIGHT = 600;
const WALL_WIDTH = 1400;
const OBJ_WIDTH = 52;
const INITIAL_OBJ_GAP = 80; // Initial gap between pipes
const MIN_OBJ_GAP = 80; // Minimum gap between pipes
const INITIAL_OBJ_POS = WALL_WIDTH;
const MIN_OBJ_POS = -OBJ_WIDTH; // Minimum pipe position
const BASE_OBJ_SPEED = 25; // Initial object speed
const MOVE_STEP = 10; // Step size for manual bird movement

const calculateNextGap = (score) => {
  const nextGap = INITIAL_OBJ_GAP - score * 5;
  return Math.max(MIN_OBJ_GAP, nextGap);
};

function App() {
  const [isStart, setIsStart] = useState(false);
  const [birdPos, setBirdPos] = useState(WALL_HEIGHT / 2 - BIRD_HEIGHT / 2); // Start bird in the middle
  const [objHeight, setObjHeight] = useState(0);
  const [objPos, setObjPos] = useState(INITIAL_OBJ_POS);
  const [score, setScore] = useState(0);
  const [highestScore, setHighestScore] = useState(0);
  const [moveUp, setMoveUp] = useState(false);
  const [moveDown, setMoveDown] = useState(false);
  const [cookies, setCookie] = useCookies(["highestScore"]);
  const [showWhiteScreen, setShowWhiteScreen] = useState(false); // State to control white screen
  const [videoUrl, setVideoUrl] = useState(null); // State to hold the URL of the random video

  const calculateObjectSpeed = (score) => BASE_OBJ_SPEED * 10; // Adjust object speed based on score

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "w") {
        setMoveUp(true);
      } else if (event.key === "s") {
        setMoveDown(true);
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === "w") {
        setMoveUp(false);
      } else if (event.key === "s") {
        setMoveDown(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (cookies.highestScore) {
      setHighestScore(cookies.highestScore);
    }
  }, [cookies.highestScore]);

  useEffect(() => {
    let intervalId;

    const moveObjects = () => {
      if (isStart) {
        intervalId = setInterval(() => {
          // Move object
          if (objPos >= MIN_OBJ_POS) {
            setObjPos((prevPos) => prevPos - calculateObjectSpeed(score) / 10); // Adjust object speed
            checkCollision();
          } else {
            const nextGap = calculateNextGap(score);
            setObjPos(WALL_WIDTH - 480);
            setObjHeight(Math.floor(Math.random() * (WALL_HEIGHT - nextGap)));
            setScore((prevScore) => prevScore + 1);
          }

          // Move bird manually
          if (moveUp && birdPos > 0) {
            setBirdPos((prevPos) => prevPos - MOVE_STEP);
          } else if (moveDown && birdPos < WALL_HEIGHT - BIRD_HEIGHT) {
            setBirdPos((prevPos) => prevPos + MOVE_STEP);
          }
        }, 24);
      }
    };

    moveObjects();

    return () => clearInterval(intervalId);
  }, [isStart, objPos, score, moveUp, moveDown]);

  const checkCollision = () => {
    const topObj = birdPos >= 0 && birdPos < objHeight;
    const bottomObj =
      birdPos <= WALL_HEIGHT &&
      birdPos >= WALL_HEIGHT - (WALL_HEIGHT - INITIAL_OBJ_GAP - objHeight) - BIRD_HEIGHT;

    if (
      (birdPos <= 0 || birdPos >= WALL_HEIGHT - BIRD_HEIGHT) ||
      ((objPos >= BIRD_WIDTH && objPos <= BIRD_WIDTH + 80) &&
        ((topObj && birdPos < objHeight) || (bottomObj && birdPos > WALL_HEIGHT - (WALL_HEIGHT - INITIAL_OBJ_GAP - objHeight) - BIRD_HEIGHT)))
    ) {
      setIsStart(false);
      if (score > highestScore) {
        setHighestScore(score);
        setCookie("highestScore", score, { path: "/" });
      }
      setBirdPos(WALL_HEIGHT / 2 - BIRD_HEIGHT / 2); // Reset bird position
      setScore(0);
      setShowWhiteScreen(true); // Activate white screen
      setTimeout(() => {
        setShowWhiteScreen(false); // Deactivate white screen after 3 seconds
      }, 3000);
    }
  };

  const handleClick = () => {
    if (!isStart) {
      setIsStart(true);
      setBirdPos(WALL_HEIGHT / 2 - BIRD_HEIGHT / 2);
      setScore(0);
      // Randomize initial position and height of pipes
      const nextGap = calculateNextGap(0); // Calculate next gap based on score
      const randomHeight = Math.floor(Math.random() * (WALL_HEIGHT - nextGap));
      const randomPos = Math.floor(Math.random() * (WALL_WIDTH - OBJ_WIDTH)); // Randomize position within the wall width
      setObjPos(randomPos);
      setObjHeight(randomHeight);
    }
  };

  useEffect(() => {
    if (showWhiteScreen) {
      // List of MP4 files in the "clips" folder
      const clips = ["911-clip (1).mp4", "911-clip (2).mp4", "911-clip (3).mp4"];
      const randomIndex = Math.floor(Math.random() * clips.length);
      const randomClip = clips[randomIndex];
      setVideoUrl(`/clips/${randomClip}`);
    }
  }, [showWhiteScreen]);

  return (
    <Home onClick={handleClick}>
      <MainTitle>Flappy 9/11</MainTitle>
      <ScoreContainer>
        <span>Score: {score}　　</span>
        <span>Highest: {highestScore}</span>
      </ScoreContainer>
      <Background height={WALL_HEIGHT} width={WALL_WIDTH}>
        {showWhiteScreen && <WhiteScreen />}
        {videoUrl && (
          <VideoPlayer autoPlay controls>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </VideoPlayer>
        )}
        {!isStart && <Startboard>Click To Start</Startboard>}
        <Obj height={objHeight} width={OBJ_WIDTH} left={objPos} top={0} deg={180} />
        <Bird height={BIRD_HEIGHT} width={BIRD_WIDTH} top={birdPos} left={100} />
        <Obj
          height={WALL_HEIGHT - INITIAL_OBJ_GAP - objHeight}
          width={OBJ_WIDTH}
          left={objPos}
          top={WALL_HEIGHT - (objHeight + (WALL_HEIGHT - INITIAL_OBJ_GAP - objHeight))}
          deg={0}
        />
      </Background>
    </Home>
  );
}

export default App;


const Home = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Arial, sans-serif;
`;

const ScoreContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  color: white;
  font-size: 20px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const Background = styled.div`
  background-image: url("./images/new-york.jpg");
  background-repeat: no-repeat;
  background-size: ${(props) => props.width}px ${(props) => props.height}px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  position: relative;
  overflow: hidden;
  border: 2px solid black;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.3);
`;

const Bird = styled.div`
  position: absolute;
  background-image: url("./images/plane-bird.png");
  background-repeat: no-repeat;
  background-size: ${(props) => props.width}px ${(props) => props.height}px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  top: ${(props) => props.top}px;
  left: ${(props) => props.left}px;
  transition: transform 0.2s ease-in-out;
  &:hover {
    transform: scale(1.1);
  }
`;

const Obj = styled.div`
  position: relative;
  background-image: url("./images/twin-tower-pipe.png");
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  left: ${(props) => props.left}px;
  top: ${(props) => props.top}px;
  transition: transform 0.2s ease-in-out;
  &:hover {
    transform: scale(1.1);
  }
`;

const Startboard = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  color: white;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.3);
`;

const MainTitle = styled.h1`
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 48px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;
  
const punchAnimation = keyframes`
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-30px);
  }
  100% {
    transform: translateX(0);
  }
`;

const WhiteScreen = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 9999;
  animation: ${punchAnimation} 0.3s linear;
`;

const VideoPlayer = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;