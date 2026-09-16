import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Settings as SettingsIcon,
  HelpCircle,
  Trophy,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Flame,
  Award,
  Sparkles,
  X,
  Eye,
} from "lucide-react";

class SoundFX {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.engineOsc = null;
    this.engineGain = null;
    this.musicInterval = null;
    this.musicStep = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch((error) => {
        console.warn("Audio resume failed:", error);
      });
    }
  }

  startEngine() {
    if (!this.soundEnabled || !this.ctx || this.engineOsc) return;
    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      this.engineOsc.type = "sawtooth";
      this.engineOsc.frequency.setValueAtTime(55, this.ctx.currentTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(280, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();
    } catch (error) {
      console.warn("Engine sound init error:", error);
    }
  }

  updateEngine(speedNormalized) {
    if (!this.engineOsc || !this.ctx) return;
    try {
      const baseFreq = 50 + speedNormalized * 90;
      this.engineOsc.frequency.setTargetAtTime(
        baseFreq,
        this.ctx.currentTime,
        0.05,
      );
    } catch (error) {
      console.warn("Engine update error:", error);
    }
  }

  stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch (error) {
        console.warn("Engine stop error:", error);
      }
      this.engineOsc = null;
      this.engineGain = null;
    }
  }

  playClick() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      880,
      this.ctx.currentTime + 0.05,
    );
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playCoin() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.3);
  }

  playNitro() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(
      1200,
      this.ctx.currentTime + 0.4,
    );
    filter.Q.setValueAtTime(3, this.ctx.currentTime);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playNearMiss() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.25);
  }

  playCrash() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(700, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(
      80,
      this.ctx.currentTime + 0.7,
    );
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  startMusic() {
    if (!this.musicEnabled || this.musicInterval) return;
    this.init();
    const notes = [110, 110, 130.81, 146.83, 164.81, 146.83, 130.81, 98.0];
    this.musicStep = 0;
    this.musicInterval = setInterval(() => {
      if (!this.musicEnabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(notes[this.musicStep % notes.length], now);
        this.musicStep++;

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(320, now);
        filter.frequency.exponentialRampToValueAtTime(140, now + 0.18);

        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
      } catch (error) {
        console.warn("Music note playback error:", error);
      }
    }, 220);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

const audio = new SoundFX();

const VEHICLE_TYPES = [
  {
    type: "sedan",
    width: 38,
    height: 72,
    color: "#00e5ff",
    roofColor: "#0099b8",
    speedMul: 0.85,
    name: "Sedan",
  },
  {
    type: "suv",
    width: 44,
    height: 86,
    color: "#ffb300",
    roofColor: "#cc8f00",
    speedMul: 0.72,
    name: "SUV",
  },
  {
    type: "sports",
    width: 38,
    height: 74,
    color: "#ff007f",
    roofColor: "#b8005c",
    speedMul: 1.05,
    name: "Racer",
  },
  {
    type: "truck",
    width: 48,
    height: 115,
    color: "#00e676",
    roofColor: "#00a352",
    speedMul: 0.6,
    name: "Hauler",
  },
];

function App() {
  const [gameState, setGameState] = useState("MENU");
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [coins, setCoins] = useState(0);
  const [nitro, setNitro] = useState(100);
  const [speedKmh, setSpeedKmh] = useState(120);
  const [level, setLevel] = useState(1);
  const [bestScore, setBestScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("neondrive_highscore") || "0", 10);
    } catch {
      return 0;
    }
  });
  const [isNewHigh, setIsNewHigh] = useState(false);
  const [nearMissNotification, setNearMissNotification] = useState(null);

  const [settings, setSettings] = useState({
    sound: true,
    music: true,
    quality: "High",
    controls: "Hybrid",
    reducedMotion: false,
  });

  const canvasRef = useRef(null);
  const menuCanvasRef = useRef(null);
  const touchControlsRef = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
    nitro: false,
  });
  const keysRef = useRef({});

  const engineRef = useRef({
    animId: null,
    lastTime: 0,
    roadOffset: 0,
    roadWidth: 380,
    laneCount: 4,
    speed: 7,
    targetSpeed: 7,
    baseSpeed: 7,
    maxSpeed: 16,
    nitroActive: false,
    nitroFuel: 100,
    player: {
      x: 0,
      y: 0,
      width: 40,
      height: 76,
      vx: 0,
      turnAngle: 0,
      trailTimer: 0,
    },
    traffic: [],
    coinsList: [],
    particles: [],
    floatingTexts: [],
    screenShake: 0,
    distanceTraveled: 0,
    currentScore: 0,
    coinsCollected: 0,
    currentLevel: 1,
    trafficSpawnTimer: 0,
    coinSpawnTimer: 0,
    maxSpeedStat: 120,
    isGameOver: false,
    environmentProps: [],
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.code] = true;

      if (e.code === "KeyP" || e.code === "Escape") {
        setGameState((prev) => {
          if (prev === "PLAYING") {
            audio.stopEngine();
            return "PAUSED";
          } else if (prev === "PAUSED") {
            audio.startEngine();
            return "PLAYING";
          }
          return prev;
        });
      }
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    audio.soundEnabled = settings.sound;
    audio.musicEnabled = settings.music;
    if (!settings.sound) audio.stopEngine();
    if (settings.music && gameState === "PLAYING") audio.startMusic();
    else if (!settings.music) audio.stopMusic();
  }, [settings.sound, settings.music, gameState]);

  const drawCar = (
    ctx,
    x,
    y,
    width,
    height,
    bodyColor,
    accentColor,
    isPlayer = false,
    turnAngle = 0,
    speed = 10,
  ) => {
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(turnAngle);

    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.beginPath();
    ctx.roundRect(-width / 2 + 2, -height / 2 + 4, width - 4, height, 8);
    ctx.fill();

    ctx.fillStyle = "#0a0a0d";
    const wheelW = width * 0.2;
    const wheelH = height * 0.22;
    ctx.fillRect(-width / 2 - 2, -height * 0.38, wheelW, wheelH);
    ctx.fillRect(width / 2 - wheelW + 2, -height * 0.38, wheelW, wheelH);
    ctx.fillRect(-width / 2 - 2, height * 0.16, wheelW, wheelH);
    ctx.fillRect(width / 2 - wheelW + 2, height * 0.16, wheelW, wheelH);

    ctx.fillStyle = bodyColor;
    if (isPlayer) {
      ctx.shadowColor = bodyColor;
      ctx.shadowBlur = 12;
    }
    ctx.beginPath();
    ctx.roundRect(-width / 2, -height / 2, width, height, [10, 10, 6, 6]);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#12151f";
    ctx.beginPath();
    ctx.roundRect(
      -width * 0.36,
      -height * 0.25,
      width * 0.72,
      height * 0.45,
      5,
    );
    ctx.fill();

    ctx.fillStyle = "rgba(0, 240, 255, 0.35)";
    ctx.beginPath();
    ctx.roundRect(
      -width * 0.32,
      -height * 0.22,
      width * 0.64,
      height * 0.14,
      3,
    );
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(-width * 0.3, height * 0.08, width * 0.6, height * 0.08, 2);
    ctx.fill();

    ctx.fillStyle = accentColor;
    ctx.fillRect(-width * 0.08, -height * 0.35, width * 0.16, height * 0.7);

    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 10;
    ctx.fillRect(-width * 0.42, -height / 2 - 1, width * 0.25, 4);
    ctx.fillRect(width * 0.17, -height / 2 - 1, width * 0.25, 4);

    if (isPlayer) {
      const beamGrad = ctx.createLinearGradient(
        0,
        -height / 2,
        0,
        -height / 2 - 140,
      );
      beamGrad.addColorStop(0, "rgba(255, 255, 255, 0.3)");
      beamGrad.addColorStop(1, "rgba(0, 240, 255, 0)");
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(-width * 0.4, -height / 2);
      ctx.lineTo(-width * 0.8, -height / 2 - 140);
      ctx.lineTo(width * 0.8, -height / 2 - 140);
      ctx.lineTo(width * 0.4, -height / 2);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = "#ff1744";
    ctx.shadowColor = "#ff1744";
    ctx.shadowBlur = 8;
    ctx.fillRect(-width * 0.42, height / 2 - 3, width * 0.26, 4);
    ctx.fillRect(width * 0.16, height / 2 - 3, width * 0.26, 4);

    if (isPlayer && speed > 10) {
      ctx.fillStyle = "#00f0ff";
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 15;
      const flameH = 10 + Math.random() * 15;
      ctx.fillRect(-width * 0.28, height / 2 + 1, width * 0.14, flameH);
      ctx.fillRect(width * 0.14, height / 2 + 1, width * 0.14, flameH);
    }

    ctx.restore();
  };

  useEffect(() => {
    if (gameState !== "MENU") return;
    const canvas = menuCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let offset = 0;

    const renderMenuBg = () => {
      const w = (canvas.width = canvas.parentElement.clientWidth || 800);
      const h = (canvas.height = canvas.parentElement.clientHeight || 600);
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, "#0a0b12");
      bgGrad.addColorStop(1, "#05060a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      offset = (offset + 4) % 60;
      ctx.strokeStyle = "rgba(0, 240, 255, 0.12)";
      ctx.lineWidth = 1.5;

      const roadW = Math.min(w * 0.65, 420);
      const roadX = (w - roadW) / 2;

      ctx.fillStyle = "#10121b";
      ctx.fillRect(roadX, 0, roadW, h);

      ctx.strokeStyle = "#00f0ff";
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(roadX, 0);
      ctx.lineTo(roadX, h);
      ctx.moveTo(roadX + roadW, 0);
      ctx.lineTo(roadX + roadW, h);
      ctx.stroke();
      ctx.shadowBlur = 0;

      const laneW = roadW / 4;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.setLineDash([25, 25]);
      ctx.lineDashOffset = -offset;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(roadX + i * laneW, 0);
        ctx.lineTo(roadX + i * laneW, h);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      const carX = roadX + laneW * 1.5 - 20;
      const carY = h * 0.65;
      drawCar(ctx, carX, carY, 40, 74, "#00f0ff", "#0099b8", true, 0, 0);

      animId = requestAnimationFrame(renderMenuBg);
    };

    renderMenuBg();
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  const drawCoin = (ctx, coin) => {
    ctx.save();
    ctx.translate(coin.x, coin.y);
    const scaleX = Math.cos(coin.rot);

    ctx.scale(scaleX, 1);
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 14;

    ctx.fillStyle = "#ffb700";
    ctx.beginPath();
    ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff7c2";
    ctx.beginPath();
    ctx.arc(0, 0, coin.radius * 0.65, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e69500";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("★", 0, 1);

    ctx.restore();
  };

  const initEnvironment = (w, h) => {
    const props = [];
    for (let i = 0; i < 14; i++) {
      props.push({
        y: (h / 14) * i,
        side: i % 2 === 0 ? -1 : 1,
        type: i % 3 === 0 ? "SIGN" : "POST",
        color: i % 2 === 0 ? "#ff007f" : "#00f0ff",
      });
    }
    return props;
  };

  const startGame = () => {
    audio.playClick();
    audio.init();
    audio.startEngine();
    if (settings.music) audio.startMusic();

    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 450;
    const h = canvas ? canvas.height : 750;

    const roadW = Math.min(w * 0.82, 380);
    const laneW = roadW / 4;

    engineRef.current = {
      animId: null,
      lastTime: performance.now(),
      roadOffset: 0,
      roadWidth: roadW,
      laneCount: 4,
      speed: 7,
      targetSpeed: 7,
      baseSpeed: 7,
      maxSpeed: 17,
      nitroActive: false,
      nitroFuel: 100,
      player: {
        x: (w - roadW) / 2 + laneW * 1.5 - 20,
        y: h - 130,
        width: 38,
        height: 74,
        vx: 0,
        turnAngle: 0,
        trailTimer: 0,
      },
      traffic: [],
      coinsList: [],
      particles: [],
      floatingTexts: [],
      screenShake: 0,
      distanceTraveled: 0,
      currentScore: 0,
      coinsCollected: 0,
      currentLevel: 1,
      trafficSpawnTimer: 0,
      coinSpawnTimer: 0,
      maxSpeedStat: 120,
      isGameOver: false,
      environmentProps: initEnvironment(w, h),
    };

    setScore(0);
    setDistance(0);
    setCoins(0);
    setNitro(100);
    setSpeedKmh(120);
    setLevel(1);
    setIsNewHigh(false);
    setGameState("PLAYING");
  };

  const triggerGameOver = useCallback(() => {
    const eng = engineRef.current;
    if (eng.isGameOver) return;
    eng.isGameOver = true;

    audio.stopEngine();
    audio.stopMusic();
    audio.playCrash();

    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      eng.particles.push({
        x: eng.player.x + eng.player.width / 2,
        y: eng.player.y + eng.player.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.025,
        color: ["#ff0055", "#ff5500", "#ffd700", "#ffffff"][
          Math.floor(Math.random() * 4)
        ],
        size: 3 + Math.random() * 6,
      });
    }

    eng.screenShake = 24;

    const finalScore = Math.floor(eng.currentScore);
    setScore(finalScore);

    if (finalScore > bestScore) {
      setBestScore(finalScore);
      setIsNewHigh(true);
      try {
        localStorage.setItem("neondrive_highscore", finalScore.toString());
      } catch (error) {
        console.warn("Unable to persist high score:", error);
      }
    }

    setTimeout(() => {
      setGameState("GAME_OVER");
    }, 900);
  }, [bestScore]);

  const spawnTrafficVehicle = (w, h, roadX, roadW, laneW, eng) => {
    const topZoneY = -120;
    const occupiedLanes = new Set();
    eng.traffic.forEach((t) => {
      if (t.y < 160) {
        const laneIdx = Math.floor((t.x - roadX) / laneW);
        occupiedLanes.add(laneIdx);
      }
    });

    const freeLanes = [0, 1, 2, 3].filter((idx) => !occupiedLanes.has(idx));
    if (freeLanes.length === 0) return;

    const laneIndex = freeLanes[Math.floor(Math.random() * freeLanes.length)];
    const vConfig =
      VEHICLE_TYPES[Math.floor(Math.random() * VEHICLE_TYPES.length)];

    const x = roadX + laneIndex * laneW + (laneW - vConfig.width) / 2;
    const y = topZoneY - Math.random() * 60;

    const trafficBaseSpeed = (3 + Math.random() * 2) * vConfig.speedMul;

    eng.traffic.push({
      x,
      y,
      width: vConfig.width,
      height: vConfig.height,
      color: vConfig.color,
      roofColor: vConfig.roofColor,
      speed: trafficBaseSpeed,
      lane: laneIndex,
      type: vConfig.type,
      nearMissCounted: false,
    });
  };

  const spawnCoinItem = (roadX, roadW, laneW, eng) => {
    const laneIndex = Math.floor(Math.random() * 4);
    const x = roadX + laneIndex * laneW + laneW / 2;
    const y = -60;
    eng.coinsList.push({
      x,
      y,
      radius: 11,
      rot: 0,
      collected: false,
    });
  };

  useEffect(() => {
    if (gameState !== "PLAYING") return;

    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const loop = (currentTime) => {
      const eng = engineRef.current;
      const dt = Math.min((currentTime - eng.lastTime) / 1000, 0.1);
      eng.lastTime = currentTime;

      const containerW = canvas.parentElement
        ? canvas.parentElement.clientWidth
        : 500;
      const containerH = canvas.parentElement
        ? canvas.parentElement.clientHeight
        : 800;

      if (canvas.width !== containerW || canvas.height !== containerH) {
        canvas.width = containerW;
        canvas.height = containerH;
        eng.roadWidth = Math.min(containerW * 0.86, 400);
      }

      const w = canvas.width;
      const h = canvas.height;
      const roadW = eng.roadWidth;
      const roadX = (w - roadW) / 2;
      const laneW = roadW / eng.laneCount;

      if (!eng.isGameOver) {
        const touch = touchControlsRef.current;
        const keys = keysRef.current;

        const isLeft = keys["ArrowLeft"] || keys["KeyA"] || touch.left;
        const isRight = keys["ArrowRight"] || keys["KeyD"] || touch.right;
        const isUp = keys["ArrowUp"] || keys["KeyW"] || touch.up;
        const isDown = keys["ArrowDown"] || keys["KeyS"] || touch.down;
        const isNitro = (keys["Space"] || touch.nitro) && eng.nitroFuel > 0;

        if (isNitro) {
          eng.nitroActive = true;
          eng.nitroFuel = Math.max(0, eng.nitroFuel - dt * 35);
          eng.targetSpeed = eng.baseSpeed + 6.5;
          if (Math.random() < 0.25) audio.playNitro();
        } else {
          eng.nitroActive = false;

          eng.nitroFuel = Math.min(100, eng.nitroFuel + dt * 10);
          if (isUp) {
            eng.targetSpeed = eng.baseSpeed + 3.2;
          } else if (isDown) {
            eng.targetSpeed = Math.max(3.5, eng.baseSpeed - 3.0);
          } else {
            eng.targetSpeed = eng.baseSpeed;
          }
        }

        eng.speed += (eng.targetSpeed - eng.speed) * 0.08;

        const steerSpeed = 380;
        const targetTurnAngle = isLeft ? -0.12 : isRight ? 0.12 : 0;

        if (isLeft) {
          eng.player.vx = -steerSpeed;
        } else if (isRight) {
          eng.player.vx = steerSpeed;
        } else {
          eng.player.vx *= 0.8;
        }

        eng.player.turnAngle += (targetTurnAngle - eng.player.turnAngle) * 0.15;
        eng.player.x += eng.player.vx * dt;

        const minX = roadX + 6;
        const maxX = roadX + roadW - eng.player.width - 6;
        if (eng.player.x < minX) {
          eng.player.x = minX;
          eng.player.vx = 0;
        }
        if (eng.player.x > maxX) {
          eng.player.x = maxX;
          eng.player.vx = 0;
        }

        eng.player.y = h - 135;

        const kmh = Math.round(eng.speed * 17.5);
        if (kmh > eng.maxSpeedStat) eng.maxSpeedStat = kmh;
        setSpeedKmh(kmh);
        audio.updateEngine(eng.speed / eng.maxSpeed);

        const distInc = eng.speed * dt * 0.03;
        eng.distanceTraveled += distInc;
        eng.currentScore +=
          (eng.speed * 1.5 + (eng.nitroActive ? 4 : 1)) * dt * 10;

        const calculatedLevel = 1 + Math.floor(eng.distanceTraveled / 1.5);
        if (calculatedLevel !== eng.currentLevel) {
          eng.currentLevel = calculatedLevel;
          eng.baseSpeed = 7 + (calculatedLevel - 1) * 0.8;
          eng.floatingTexts.push({
            text: `LEVEL ${calculatedLevel}! SPEED UP`,
            x: w / 2,
            y: h * 0.45,
            color: "#00f0ff",
            life: 1.5,
            scale: 1.4,
          });
        }

        setScore(Math.floor(eng.currentScore));
        setDistance(eng.distanceTraveled);
        setNitro(Math.floor(eng.nitroFuel));
        setLevel(eng.currentLevel);

        eng.trafficSpawnTimer += dt;
        const spawnInterval = Math.max(0.65, 1.8 - eng.currentLevel * 0.1);
        if (eng.trafficSpawnTimer > spawnInterval) {
          eng.trafficSpawnTimer = 0;
          spawnTrafficVehicle(w, h, roadX, roadW, laneW, eng);
        }

        eng.coinSpawnTimer += dt;
        if (eng.coinSpawnTimer > 1.4) {
          eng.coinSpawnTimer = 0;
          if (Math.random() < 0.75) {
            spawnCoinItem(roadX, roadW, laneW, eng);
          }
        }

        for (let i = eng.traffic.length - 1; i >= 0; i--) {
          const t = eng.traffic[i];

          const relativeSpeed = eng.speed - t.speed + 3;
          t.y += relativeSpeed * 35 * dt;

          if (
            !t.nearMissCounted &&
            t.y > eng.player.y - 20 &&
            t.y < eng.player.y + eng.player.height + 20
          ) {
            const dx = Math.abs(
              t.x + t.width / 2 - (eng.player.x + eng.player.width / 2),
            );
            const lateralGap = dx - (t.width + eng.player.width) / 2;

            if (lateralGap > 0 && lateralGap < 20) {
              t.nearMissCounted = true;
              eng.currentScore += 100;
              audio.playNearMiss();
              setNearMissNotification("NEAR MISS +100");
              setTimeout(() => setNearMissNotification(null), 900);

              eng.floatingTexts.push({
                text: "NEAR MISS +100!",
                x: eng.player.x + eng.player.width / 2,
                y: eng.player.y - 15,
                color: "#ff007f",
                life: 0.9,
                scale: 1.1,
              });
            }
          }

          if (t.y > h + 150) {
            eng.traffic.splice(i, 1);
            continue;
          }

          const pMarginX = 6;
          const pMarginY = 8;
          const pLeft = eng.player.x + pMarginX;
          const pRight = eng.player.x + eng.player.width - pMarginX;
          const pTop = eng.player.y + pMarginY;
          const pBottom = eng.player.y + eng.player.height - pMarginY;

          const tLeft = t.x + 4;
          const tRight = t.x + t.width - 4;
          const tTop = t.y + 4;
          const tBottom = t.y + t.height - 4;

          if (
            pRight > tLeft &&
            pLeft < tRight &&
            pBottom > tTop &&
            pTop < tBottom
          ) {
            triggerGameOver();
            break;
          }
        }

        for (let i = eng.coinsList.length - 1; i >= 0; i--) {
          const coin = eng.coinsList[i];
          coin.y += eng.speed * 35 * dt;
          coin.rot += 5 * dt;

          const pCenterX = eng.player.x + eng.player.width / 2;
          const pCenterY = eng.player.y + eng.player.height / 2;
          const distToPlayer = Math.hypot(pCenterX - coin.x, pCenterY - coin.y);

          if (distToPlayer < coin.radius + 28) {
            audio.playCoin();
            eng.coinsCollected += 1;
            eng.currentScore += 50;
            setCoins(eng.coinsCollected);

            for (let p = 0; p < 10; p++) {
              const ang = Math.random() * Math.PI * 2;
              eng.particles.push({
                x: coin.x,
                y: coin.y,
                vx: Math.cos(ang) * (2 + Math.random() * 4),
                vy: Math.sin(ang) * (2 + Math.random() * 4),
                life: 0.7,
                decay: 0.04,
                color: "#ffd700",
                size: 2.5 + Math.random() * 3,
              });
            }

            eng.floatingTexts.push({
              text: "+50",
              x: coin.x,
              y: coin.y,
              color: "#ffd700",
              life: 0.6,
              scale: 1.0,
            });

            eng.coinsList.splice(i, 1);
            continue;
          }

          if (coin.y > h + 50) {
            eng.coinsList.splice(i, 1);
          }
        }

        eng.player.trailTimer += dt;
        if (eng.player.trailTimer > 0.05) {
          eng.player.trailTimer = 0;

          eng.particles.push({
            x: eng.player.x + 8,
            y: eng.player.y + eng.player.height,
            vx: (Math.random() - 0.5) * 1.5,
            vy: eng.speed * 2,
            life: 0.4,
            decay: 0.05,
            color: eng.nitroActive ? "#00f0ff" : "rgba(255, 255, 255, 0.25)",
            size: eng.nitroActive ? 4 : 2,
          });
          eng.particles.push({
            x: eng.player.x + eng.player.width - 8,
            y: eng.player.y + eng.player.height,
            vx: (Math.random() - 0.5) * 1.5,
            vy: eng.speed * 2,
            life: 0.4,
            decay: 0.05,
            color: eng.nitroActive ? "#00f0ff" : "rgba(255, 255, 255, 0.25)",
            size: eng.nitroActive ? 4 : 2,
          });
        }
      }

      eng.roadOffset = (eng.roadOffset + eng.speed * 35 * dt) % 60;

      if (eng.screenShake > 0) {
        eng.screenShake = Math.max(0, eng.screenShake - dt * 35);
      }

      for (let i = eng.particles.length - 1; i >= 0; i--) {
        const p = eng.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) {
          eng.particles.splice(i, 1);
        }
      }

      for (let i = eng.floatingTexts.length - 1; i >= 0; i--) {
        const ft = eng.floatingTexts[i];
        ft.y -= 45 * dt;
        ft.life -= dt;
        if (ft.life <= 0) {
          eng.floatingTexts.splice(i, 1);
        }
      }

      eng.environmentProps.forEach((prop) => {
        prop.y += eng.speed * 32 * dt;
        if (prop.y > h + 50) {
          prop.y = -40;
          prop.color = Math.random() < 0.5 ? "#ff007f" : "#00f0ff";
        }
      });

      ctx.save();

      if (eng.screenShake > 0 && !settings.reducedMotion) {
        const shakeX = (Math.random() - 0.5) * eng.screenShake;
        const shakeY = (Math.random() - 0.5) * eng.screenShake;
        ctx.translate(shakeX, shakeY);
      }

      const groundGrad = ctx.createLinearGradient(0, 0, w, 0);
      groundGrad.addColorStop(0, "#0a0a10");
      groundGrad.addColorStop(0.3, "#07080d");
      groundGrad.addColorStop(0.7, "#07080d");
      groundGrad.addColorStop(1, "#0a0a10");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, 0, w, h);

      eng.environmentProps.forEach((prop) => {
        const posX =
          prop.side === -1
            ? roadX * 0.45
            : roadX + roadW + (w - (roadX + roadW)) * 0.55;
        ctx.fillStyle = prop.color;
        ctx.shadowColor = prop.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(posX, prop.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.beginPath();
        ctx.moveTo(posX, prop.y);
        ctx.lineTo(posX, prop.y + 24);
        ctx.stroke();
      });

      ctx.fillStyle = "#10121b";
      ctx.fillRect(roadX, 0, roadW, h);

      ctx.shadowColor = eng.nitroActive ? "#00f0ff" : "#00b4d8";
      ctx.shadowBlur = eng.nitroActive ? 16 : 8;
      ctx.strokeStyle = eng.nitroActive ? "#00f0ff" : "#00b4d8";
      ctx.lineWidth = 3.5;

      ctx.beginPath();
      ctx.moveTo(roadX, 0);
      ctx.lineTo(roadX, h);
      ctx.moveTo(roadX + roadW, 0);
      ctx.lineTo(roadX + roadW, h);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([32, 28]);
      ctx.lineDashOffset = -eng.roadOffset;

      for (let i = 1; i < eng.laneCount; i++) {
        const lx = roadX + i * laneW;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, h);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      eng.coinsList.forEach((c) => drawCoin(ctx, c));

      eng.traffic.forEach((t) => {
        drawCar(
          ctx,
          t.x,
          t.y,
          t.width,
          t.height,
          t.color,
          t.roofColor,
          false,
          0,
          t.speed,
        );
      });

      if (!eng.isGameOver) {
        drawCar(
          ctx,
          eng.player.x,
          eng.player.y,
          eng.player.width,
          eng.player.height,
          "#00f0ff",
          "#ff007f",
          true,
          eng.player.turnAngle,
          eng.speed,
        );
      }

      eng.particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      if (eng.nitroActive && !settings.reducedMotion) {
        ctx.strokeStyle = "rgba(0, 240, 255, 0.18)";
        ctx.lineWidth = 1.8;
        for (let i = 0; i < 7; i++) {
          const sx = roadX + Math.random() * roadW;
          const sy = Math.random() * h;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx, sy + 70 + Math.random() * 60);
          ctx.stroke();
        }
      }

      eng.floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.font = `bold ${Math.round(20 * ft.scale)}px sans-serif`;
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 12;
        ctx.textAlign = "center";
        ctx.globalAlpha = Math.min(1.0, ft.life * 1.5);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState, triggerGameOver, settings.reducedMotion]);

  const handleTouchStart = (dir) => {
    touchControlsRef.current[dir] = true;
  };
  const handleTouchEnd = (dir) => {
    touchControlsRef.current[dir] = false;
  };

  const renderHUD = () => (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none">
      <div className="flex items-start justify-between w-full">
        <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl px-4 py-2.5 shadow-[0_0_15px_rgba(0,240,255,0.15)] flex flex-col">
          <span className="text-[10px] sm:text-xs font-mono tracking-widest text-cyan-400 font-semibold uppercase">
            SCORE
          </span>
          <span className="text-xl sm:text-2xl font-black tracking-wider text-white font-mono">
            {score.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-slate-900/80 backdrop-blur-md border border-fuchsia-500/30 rounded-2xl px-4 py-1.5 shadow-[0_0_15px_rgba(255,0,127,0.15)] flex items-center space-x-2">
            <Award className="w-4 h-4 text-fuchsia-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-white tracking-wider">
              LVL {level.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-1 font-medium">
            {distance.toFixed(2)} KM
          </span>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="bg-slate-900/80 backdrop-blur-md border border-amber-500/30 rounded-2xl px-3.5 py-2 shadow-[0_0_15px_rgba(255,183,0,0.15)] flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-sm">
              <span className="text-[10px] font-black text-slate-950">★</span>
            </div>
            <span className="text-lg sm:text-xl font-black text-amber-300 font-mono">
              {coins}
            </span>
          </div>

          <button
            onClick={() => {
              audio.playClick();
              audio.stopEngine();
              setGameState("PAUSED");
            }}
            className="cursor-pointer pointer-events-auto p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white hover:border-cyan-400/50 active:scale-95 transition-all shadow-lg"
            title="Pause (P or ESC)"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {nearMissNotification && (
        <div className="self-center animate-bounce bg-fuchsia-600/90 text-white font-black px-4 py-1.5 rounded-full text-sm sm:text-base border border-fuchsia-400 shadow-[0_0_20px_rgba(255,0,127,0.6)]">
          {nearMissNotification}
        </div>
      )}

      <div className="w-full max-w-xl self-center flex flex-col space-y-2">
        <div className="flex items-end justify-between px-2">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tighter">
              {speedKmh}
            </span>
            <span className="text-[11px] font-bold text-cyan-400 font-mono tracking-wider">
              KM/H
            </span>
          </div>

          <div className="flex items-center space-x-1 text-cyan-400 font-mono text-xs font-semibold">
            <Flame
              className={`w-4 h-4 ${nitro > 20 ? "text-cyan-400" : "text-slate-500"}`}
            />
            <span>NITRO</span>
          </div>
        </div>

        <div className="w-full h-3 bg-slate-950/80 rounded-full border border-slate-800 p-0.5 overflow-hidden backdrop-blur-sm shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-cyan-500 via-blue-500 to-fuchsia-500 shadow-[0_0_12px_rgba(0,240,255,0.7)]"
            style={{ width: `${nitro}%` }}
          />
        </div>
      </div>
    </div>
  );

  const renderTouchControls = () => {
    return (
      <div className="sm:hidden absolute bottom-16 inset-x-0 px-5 flex justify-between items-center pointer-events-none select-none z-20">
        <div className="flex space-x-3 pointer-events-auto">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart("left");
            }}
            onTouchEnd={() => handleTouchEnd("left")}
            onMouseDown={() => handleTouchStart("left")}
            onMouseUp={() => handleTouchEnd("left")}
            className="cursor-pointer w-14 h-14 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 active:bg-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)] active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart("right");
            }}
            onTouchEnd={() => handleTouchEnd("right")}
            onMouseDown={() => handleTouchStart("right")}
            onMouseUp={() => handleTouchEnd("right")}
            className="cursor-pointer w-14 h-14 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 active:bg-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)] active:scale-90 transition-transform"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        <div className="flex items-center space-x-2.5 pointer-events-auto">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart("down");
            }}
            onTouchEnd={() => handleTouchEnd("down")}
            onMouseDown={() => handleTouchStart("down")}
            onMouseUp={() => handleTouchEnd("down")}
            className="cursor-pointer w-12 h-12 rounded-xl bg-slate-900/85 backdrop-blur-md border border-red-500/40 active:bg-red-500/30 flex items-center justify-center text-red-400 active:scale-90 transition-transform shadow-md"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart("up");
            }}
            onTouchEnd={() => handleTouchEnd("up")}
            onMouseDown={() => handleTouchStart("up")}
            onMouseUp={() => handleTouchEnd("up")}
            className="cursor-pointer w-13 h-13 p-3 rounded-xl bg-slate-900/85 backdrop-blur-md border border-emerald-500/40 active:bg-emerald-500/30 flex items-center justify-center text-emerald-400 active:scale-90 transition-transform shadow-md"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart("nitro");
            }}
            onTouchEnd={() => handleTouchEnd("nitro")}
            onMouseDown={() => handleTouchStart("nitro")}
            onMouseUp={() => handleTouchEnd("nitro")}
            className="cursor-pointer w-15 h-15 p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-fuchsia-600 border border-cyan-300 active:brightness-125 flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-90 transition-transform"
          >
            <Flame className="w-7 h-7" />
          </button>
        </div>
      </div>
    );
  };

  const renderMainMenu = () => (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-6 bg-white backdrop-blur-sm">
      <div className="w-full max-w-xl flex justify-between items-center pt-2">
        <div className="flex items-center space-x-2 bg-cyan-100 border border-slate-800/80 px-4 py-2 rounded-2xl shadow-md">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono text-slate-700">BEST:</span>
          <span className="text-sm font-bold font-mono text-amber-800">
            {bestScore.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              audio.playClick();
              setSettings((s) => ({ ...s, sound: !s.sound }));
            }}
            className="cursor-pointer p-2.5 rounded-2xl bg-cyan-400/10 backdrop-blur-md border border-slate-800 text-slate-700 hover:text-gray-600 hover:border-cyan-400/50 transition-all shadow-md"
          >
            {settings.sound ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5 text-red-400" />
            )}
          </button>
          <button
            onClick={() => {
              audio.playClick();
              setGameState("SETTINGS");
            }}
            className="cursor-pointer p-2.5 rounded-2xl bg-cyan-400/10 backdrop-blur-md border border-slate-800 text-slate-700 hover:text-gray-600 hover:border-cyan-400/50 transition-all shadow-md"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center text-center my-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CYBER HIGHWAY ARCADE</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-black via-cyan-200 to-cyan-400 drop-shadow-[0_0_35px_rgba(0,240,255,0.5)]">
          NEON DRIVE
        </h1>
        <p className="text-xs sm:text-sm font-mono tracking-[0.35em] text-fuchsia-400 font-bold uppercase mt-1">
          HIGHWAY SURVIVAL
        </p>

        <div className="mt-8 flex flex-col space-y-3 w-64">
          <button
            onClick={startGame}
            className="cursor-pointer group relative px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-slate-950 font-black text-lg tracking-wider flex items-center justify-center space-x-3 shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            <span>PLAY GAME</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              setGameState("HOW_TO_PLAY");
            }}
            className="cursor-pointer inline-flex justify-center space-x-2 px-4 py-3 rounded-2xl bg-cyan-400/10 backdrop-blur-md border border-slate-800 text-slate-700 hover:text-gray-600 hover:border-cyan-400/50 transition-all shadow-md"
          >
            <HelpCircle className="w-6 h-6 text-cyan-400" />
            <span>HOW TO PLAY</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPauseMenu = () => (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
      <div className="w-full max-w-sm bg-slate-900/95 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,240,255,0.2)] flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-inner">
          <Pause className="w-7 h-7" />
        </div>

        <h2 className="text-2xl font-black text-white tracking-wider">
          GAME PAUSED
        </h2>
        <p className="text-xs font-mono text-slate-400 mt-1 mb-6">
          Highway engines suspended
        </p>

        <div className="w-full space-y-3">
          <button
            onClick={() => {
              audio.playClick();
              audio.startEngine();
              if (settings.music) audio.startMusic();
              setGameState("PLAYING");
            }}
            className="cursor-pointer w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-black text-sm tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>RESUME</span>
          </button>

          <button
            onClick={startGame}
            className="cursor-pointer w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-sm tracking-wide flex items-center justify-center space-x-2 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>RESTART</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              audio.stopEngine();
              audio.stopMusic();
              setGameState("MENU");
            }}
            className="cursor-pointer w-full py-3 rounded-2xl bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-white text-sm font-semibold transition-all"
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );

  const renderGameOver = () => (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-6">
      <div className="w-full max-w-sm bg-slate-900/95 border border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(255,0,80,0.3)] flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-3 shadow-inner">
          <Flame className="w-8 h-8 animate-pulse" />
        </div>

        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-white tracking-wider">
          CRASHED!
        </h2>

        {isNewHigh && (
          <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold font-mono tracking-wider animate-bounce">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>NEW HIGH SCORE!</span>
          </div>
        )}

        <div className="w-full grid grid-cols-2 gap-2.5 my-6">
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3 flex flex-col">
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              FINAL SCORE
            </span>
            <span className="text-xl font-mono font-black text-cyan-400">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3 flex flex-col">
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              BEST SCORE
            </span>
            <span className="text-xl font-mono font-black text-amber-400">
              {bestScore.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3 flex flex-col">
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              DISTANCE
            </span>
            <span className="text-lg font-mono font-bold text-white">
              {distance.toFixed(2)} KM
            </span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3 flex flex-col">
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              COINS
            </span>
            <span className="text-lg font-mono font-bold text-amber-300">
              {coins}
            </span>
          </div>
        </div>

        <div className="w-full space-y-2.5">
          <button
            onClick={startGame}
            className="cursor-pointer w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-slate-950 font-black text-sm tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            <span>PLAY AGAIN</span>
          </button>
          <button
            onClick={() => {
              audio.playClick();
              setGameState("MENU");
            }}
            className="cursor-pointer w-full py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 active:scale-95 text-slate-300 font-semibold text-sm transition-all"
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
      <div className="w-full max-w-md bg-slate-900/95 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,240,255,0.2)] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2.5">
            <SettingsIcon className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              SETTINGS
            </h2>
          </div>
          <button
            onClick={() => {
              audio.playClick();
              setGameState("MENU");
            }}
            className="cursor-pointer p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Sound Effects
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Engine, crash & coin chimes
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                audio.playClick();
                setSettings((s) => ({ ...s, sound: !s.sound }));
              }}
              className={`cursor-pointer w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${settings.sound ? "bg-cyan-500 justify-end" : "bg-slate-700 justify-start"}`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center space-x-3">
              <Music className="w-5 h-5 text-fuchsia-400" />
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Synth Music
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Procedural 80s bassline
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                audio.playClick();
                setSettings((s) => ({ ...s, music: !s.music }));
              }}
              className={`cursor-pointer w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${settings.music ? "bg-fuchsia-500 justify-end" : "bg-slate-700 justify-start"}`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center space-x-3">
              <Eye className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Reduced Motion
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Disable camera shake & speed blur
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                audio.playClick();
                setSettings((s) => ({ ...s, reducedMotion: !s.reducedMotion }));
              }}
              className={`cursor-pointer w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${settings.reducedMotion ? "bg-cyan-500 justify-end" : "bg-slate-700 justify-start"}`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            audio.playClick();
            setGameState("MENU");
          }}
          className="cursor-pointer mt-6 w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wider transition-all"
        >
          DONE
        </button>
      </div>
    </div>
  );

  const renderHowToPlay = () => (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
      <div className="w-full max-w-md bg-slate-900/95 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,240,255,0.2)] flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center space-x-2.5">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              HOW TO PLAY
            </h2>
          </div>
          <button
            onClick={() => {
              audio.playClick();
              setGameState("MENU");
            }}
            className="cursor-pointer p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-slate-300">
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-slate-800 rounded font-mono font-bold text-cyan-400">
                ← / A
              </span>
              <span className="px-2 py-1 bg-slate-800 rounded font-mono font-bold text-cyan-400">
                → / D
              </span>
            </div>
            <span className="font-semibold text-slate-200">
              Steer Left / Right
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-slate-800 rounded font-mono font-bold text-emerald-400">
                ↑ / W
              </span>
              <span className="px-2 py-1 bg-slate-800 rounded font-mono font-bold text-red-400">
                ↓ / S
              </span>
            </div>
            <span className="font-semibold text-slate-200">
              Accelerate / Brake
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="px-3 py-1 bg-slate-800 rounded font-mono font-bold text-fuchsia-400">
              SPACEBAR
            </span>
            <span className="font-semibold text-slate-200">
              Turbo Nitro Boost
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="px-3 py-1 bg-slate-800 rounded font-mono font-bold text-slate-400">
              ESC / P
            </span>
            <span className="font-semibold text-slate-200">Pause Game</span>
          </div>

          <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-300">
            <p className="font-bold text-cyan-200 mb-1">PRO TIPS:</p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-cyan-300/80">
              <li>
                Pass vehicles closely without hitting to score +100 Near Miss
                bonus!
              </li>
              <li>
                Collect gold coins (+50 pts) to supercharge your high score.
              </li>
              <li>
                Nitro regenerates slowly when not engaged. Conserve it for tight
                dodges.
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => {
            audio.playClick();
            setGameState("MENU");
          }}
          className="cursor-pointer mt-6 w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wider transition-all"
        >
          GOT IT, LET'S RACE!
        </button>
      </div>
    </div>
  );

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-white font-sans select-none flex items-center justify-center">
      <canvas
        ref={menuCanvasRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${gameState === "PLAYING" ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      />

      <div className="relative w-full h-full max-w-2xl flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full block bg-white" />

        {gameState === "PLAYING" && renderHUD()}

        {gameState === "PLAYING" && renderTouchControls()}
      </div>

      {gameState === "MENU" && renderMainMenu()}
      {gameState === "PAUSED" && renderPauseMenu()}
      {gameState === "GAME_OVER" && renderGameOver()}
      {gameState === "SETTINGS" && renderSettings()}
      {gameState === "HOW_TO_PLAY" && renderHowToPlay()}
    </main>
  );
}

export default App;
