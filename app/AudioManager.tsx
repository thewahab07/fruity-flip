import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAudioPlayer } from "expo-audio";

class AudioManager {
  private static instance: AudioManager;
  private backgroundMusicPlayer: ReturnType<typeof createAudioPlayer> | null =
    null;
  private flipSoundPlayer: ReturnType<typeof createAudioPlayer> | null = null;
  private isPlaying: boolean = false;
  private soundEffectsEnabled: boolean = true;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async initialize() {
    try {
      // Check if music and sound effects are enabled in settings
      const musicEnabled = await AsyncStorage.getItem("backgroundMusic");
      const soundEnabled = await AsyncStorage.getItem("soundEffects");

      if (soundEnabled !== null) {
        this.soundEffectsEnabled = soundEnabled === "true";
      }

      // Create flip sound player
      this.flipSoundPlayer = createAudioPlayer(
        require("../assets/music/flip.mp3"),
      );
      this.flipSoundPlayer.volume = 1.0;

      if (musicEnabled === "false") {
        return;
      }

      // Create background music player
      this.backgroundMusicPlayer = createAudioPlayer(
        require("../assets/music/background.mp3"),
      );

      // Set properties
      this.backgroundMusicPlayer.loop = true;
      this.backgroundMusicPlayer.volume = 0.3;
      await this.backgroundMusicPlayer.play();

      this.isPlaying = true;
    } catch (error) {
      //console.log("Error initializing audio:", error);
    }
  }

  async playFlipSound() {
    try {
      if (!this.soundEffectsEnabled) return;

      if (this.flipSoundPlayer) {
        // Reset to start and play
        await this.flipSoundPlayer.seekTo(0);
        await this.flipSoundPlayer.play();
      }
    } catch (error) {
      //console.log("Error playing flip sound:", error);
    }
  }

  async play() {
    try {
      if (!this.backgroundMusicPlayer) {
        await this.initialize();
        return;
      }

      if (!this.isPlaying) {
        await this.backgroundMusicPlayer.play();
        this.isPlaying = true;
      }
    } catch (error) {
      //console.log("Error playing audio:", error);
    }
  }

  async pause() {
    try {
      if (this.backgroundMusicPlayer && this.isPlaying) {
        await this.backgroundMusicPlayer.pause();
        this.isPlaying = false;
      }
    } catch (error) {
      //console.log("Error pausing audio:", error);
    }
  }

  async stop() {
    try {
      if (this.backgroundMusicPlayer) {
        await this.backgroundMusicPlayer.pause();
        this.backgroundMusicPlayer.remove();
        this.backgroundMusicPlayer = null;
        this.isPlaying = false;
      }
    } catch (error) {
      //console.log("Error stopping audio:", error);
    }
  }

  async toggleMusic(enabled: boolean) {
    if (enabled) {
      if (!this.backgroundMusicPlayer) {
        // Reload the music if it was stopped
        try {
          this.backgroundMusicPlayer = createAudioPlayer(
            require("../assets/music/background.mp3"),
          );
          this.backgroundMusicPlayer.loop = true;
          this.backgroundMusicPlayer.volume = 0.3;
          await this.backgroundMusicPlayer.play();
          this.isPlaying = true;
        } catch (error) {
          //console.log("Error reloading music:", error);
        }
      } else {
        await this.play();
      }
    } else {
      await this.stop();
    }
  }

  async toggleSoundEffects(enabled: boolean) {
    this.soundEffectsEnabled = enabled;
    await AsyncStorage.setItem("soundEffects", enabled.toString());
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  async cleanup() {
    try {
      if (this.backgroundMusicPlayer) {
        await this.backgroundMusicPlayer.pause();
        this.backgroundMusicPlayer.remove();
        this.backgroundMusicPlayer = null;
      }
      if (this.flipSoundPlayer) {
        await this.flipSoundPlayer.pause();
        this.flipSoundPlayer.remove();
        this.flipSoundPlayer = null;
      }
    } catch (error) {
      //console.log("Error cleaning up audio:", error);
    }
  }
}

export default AudioManager.getInstance();
