export interface ExperienceConfig {
  baseExperiencePoints: number;
  streakMultiplier: number;
  maxLevelCap: number;
  levelExperienceBase: number;
  levelExperienceMultiplier: number;
  maxExpPerLevel: number;
}

export interface ExperienceCalculationResult {
  baseExperience: number;
  streakBonus: number;
  totalExperience: number;
  multiplier: number;
}

export interface LevelInfo {
  currentLevel: number;
  currentExperience: number;
  experienceToNextLevel: number;
  totalExperienceForNextLevel: number;
  progress: number;
}

export class ExperienceCalculator {
  private config: ExperienceConfig;

  constructor() {
    this.config = {
      baseExperiencePoints: Number(process.env.BASE_EXPERIENCE_POINTS) || 10,
      streakMultiplier: Number(process.env.STREAK_MULTIPLIER) || 0.1,
      maxLevelCap: Number(process.env.MAX_LEVEL_CAP) || 100,
      levelExperienceBase: Number(process.env.LEVEL_EXPERIENCE_BASE) || 10,
      levelExperienceMultiplier: Number(process.env.LEVEL_EXPERIENCE_MULTIPLIER) || 1.05,
      maxExpPerLevel: Number(process.env.MAX_EXP_PER_LEVEL) || 250,
    };
  }

  calculateExperienceGain(streakCount: number): ExperienceCalculationResult {
    const baseExperience = this.config.baseExperiencePoints;
    const multiplier = 1 + (this.config.streakMultiplier * streakCount);
    const totalExperience = Math.floor(baseExperience * multiplier);
    const streakBonus = totalExperience - baseExperience;

    return {
      baseExperience,
      streakBonus,
      totalExperience,
      multiplier,
    };
  }

  calculateLevelInfo(totalExperience: number): LevelInfo {
    let currentLevel = 1;
    let experienceNeededForCurrentLevel = 0;
    let experienceNeededForNextLevel = this.config.levelExperienceBase;

    while (
      totalExperience >= experienceNeededForNextLevel &&
      currentLevel < this.config.maxLevelCap
    ) {
      currentLevel++;
      experienceNeededForCurrentLevel = experienceNeededForNextLevel;
      
      const nextLevelRequirement = Math.min(
        Math.floor(
          this.config.levelExperienceBase * 
          Math.pow(this.config.levelExperienceMultiplier, currentLevel - 1)
        ),
        this.config.maxExpPerLevel
      );
      
      experienceNeededForNextLevel += nextLevelRequirement;
    }

    if (currentLevel >= this.config.maxLevelCap) {
      return {
        currentLevel: this.config.maxLevelCap,
        currentExperience: totalExperience,
        experienceToNextLevel: 0,
        totalExperienceForNextLevel: experienceNeededForCurrentLevel,
        progress: 1,
      };
    }

    const experienceInCurrentLevel = totalExperience - experienceNeededForCurrentLevel;
    const experienceNeededForThisLevel = experienceNeededForNextLevel - experienceNeededForCurrentLevel;
    const experienceToNextLevel = experienceNeededForNextLevel - totalExperience;
    
    let progress = 0;
    if (experienceNeededForThisLevel > 0) {
      progress = experienceInCurrentLevel / experienceNeededForThisLevel;
    }

    return {
      currentLevel,
      currentExperience: totalExperience,
      experienceToNextLevel: Math.max(0, experienceToNextLevel),
      totalExperienceForNextLevel: experienceNeededForNextLevel,
      progress: Math.min(1, Math.max(0, progress)),
    };
  }

  calculateUserLevel(categoryExperiences: { categoryId: string; totalExperience: number }[]): {
    totalLevel: number;
    categoryLevels: { categoryId: string; level: number; experience: number }[];
    totalExperience: number;
  } {
    let totalLevel = 0;
    let totalExperience = 0;
    const categoryLevels: { categoryId: string; level: number; experience: number }[] = [];

    for (const categoryExp of categoryExperiences) {
      const levelInfo = this.calculateLevelInfo(categoryExp.totalExperience);
      totalLevel += levelInfo.currentLevel;
      totalExperience += categoryExp.totalExperience;
      
      categoryLevels.push({
        categoryId: categoryExp.categoryId,
        level: levelInfo.currentLevel,
        experience: categoryExp.totalExperience,
      });
    }

    return {
      totalLevel,
      categoryLevels,
      totalExperience,
    };
  }

  getExperienceRequiredForLevel(level: number): number {
    if (level <= 1) return 0;
    
    let totalExperience = 0;
    
    for (let i = 1; i < level; i++) {
      const experienceForLevel = Math.min(
        Math.floor(
          this.config.levelExperienceBase * 
          Math.pow(this.config.levelExperienceMultiplier, i - 1)
        ),
        this.config.maxExpPerLevel
      );
      totalExperience += experienceForLevel;
    }
    
    return totalExperience;
  }

  validateLevel(level: number): boolean {
    return level >= 1 && level <= this.config.maxLevelCap;
  }

  getConfig(): ExperienceConfig {
    return { ...this.config };
  }
}