import { ExperienceCalculator } from './ExperienceCalculator';

const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    BASE_EXPERIENCE_POINTS: '10',
    STREAK_MULTIPLIER: '0.1',
    MAX_LEVEL_CAP: '100',
    LEVEL_EXPERIENCE_BASE: '10',
    LEVEL_EXPERIENCE_MULTIPLIER: '1.05',
    MAX_EXP_PER_LEVEL: '250',
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('ExperienceCalculator', () => {
  let calculator: ExperienceCalculator;

  beforeEach(() => {
    calculator = new ExperienceCalculator();
  });

  describe('calculateExperienceGain', () => {
    it('should calculate base experience with no streak', () => {
      const result = calculator.calculateExperienceGain(0);
      
      expect(result.baseExperience).toBe(10);
      expect(result.streakBonus).toBe(0);
      expect(result.totalExperience).toBe(10);
      expect(result.multiplier).toBe(1);
    });

    it('should calculate experience with streak bonus', () => {
      const result = calculator.calculateExperienceGain(5);
      
      expect(result.baseExperience).toBe(10);
      expect(result.multiplier).toBe(1.5);
      expect(result.totalExperience).toBe(15);
      expect(result.streakBonus).toBe(5);
    });

    it('should calculate experience with large streak', () => {
      const result = calculator.calculateExperienceGain(20);
      
      expect(result.baseExperience).toBe(10);
      expect(result.multiplier).toBe(3);
      expect(result.totalExperience).toBe(30);
      expect(result.streakBonus).toBe(20);
    });

    it('should floor the total experience', () => {
      const result = calculator.calculateExperienceGain(3);
      
      expect(result.totalExperience).toBe(13);
    });
  });

  describe('calculateLevelInfo', () => {
    it('should return level 1 for zero experience', () => {
      const result = calculator.calculateLevelInfo(0);
      
      expect(result.currentLevel).toBe(1);
      expect(result.currentExperience).toBe(0);
      expect(result.experienceToNextLevel).toBe(10);
      expect(result.totalExperienceForNextLevel).toBe(10);
      expect(result.progress).toBe(0);
    });

    it('should return level 1 for experience less than first level requirement', () => {
      const result = calculator.calculateLevelInfo(5);
      
      expect(result.currentLevel).toBe(1);
      expect(result.currentExperience).toBe(5);
      expect(result.experienceToNextLevel).toBe(5);
      expect(result.progress).toBe(0.5);
    });

    it('should return level 2 for experience meeting second level requirement', () => {
      const result = calculator.calculateLevelInfo(10);
      
      expect(result.currentLevel).toBe(2);
      expect(result.currentExperience).toBe(10);
      expect(result.experienceToNextLevel).toBe(10);
    });

    it('should return level 3 for higher experience', () => {
      const result = calculator.calculateLevelInfo(21);
      
      expect(result.currentLevel).toBe(3);
      expect(result.currentExperience).toBe(21);
    });

    it('should cap at max level', () => {
      const maxLevelExperience = calculator.getExperienceRequiredForLevel(100);
      const result = calculator.calculateLevelInfo(maxLevelExperience + 1000000);
      
      expect(result.currentLevel).toBe(100);
      expect(result.progress).toBe(1);
      expect(result.experienceToNextLevel).toBe(0);
    });
  });

  describe('calculateUserLevel', () => {
    it('should calculate total level from multiple categories', () => {
      const categoryExperiences = [
        { categoryId: 'cat1', totalExperience: 15 },
        { categoryId: 'cat2', totalExperience: 25 },
        { categoryId: 'cat3', totalExperience: 5 },
      ];

      const result = calculator.calculateUserLevel(categoryExperiences);
      
      expect(result.totalLevel).toBe(6);
      expect(result.totalExperience).toBe(45);
      expect(result.categoryLevels).toHaveLength(3);
      expect(result.categoryLevels[0].level).toBe(2);
      expect(result.categoryLevels[1].level).toBe(3);
      expect(result.categoryLevels[2].level).toBe(1);
    });

    it('should handle empty categories', () => {
      const result = calculator.calculateUserLevel([]);
      
      expect(result.totalLevel).toBe(0);
      expect(result.totalExperience).toBe(0);
      expect(result.categoryLevels).toHaveLength(0);
    });
  });

  describe('getExperienceRequiredForLevel', () => {
    it('should return 0 for level 1', () => {
      expect(calculator.getExperienceRequiredForLevel(1)).toBe(0);
    });

    it('should return correct experience for level 2', () => {
      expect(calculator.getExperienceRequiredForLevel(2)).toBe(10);
    });

    it('should return correct experience for level 3', () => {
      expect(calculator.getExperienceRequiredForLevel(3)).toBe(20);
    });

    it('should return correct experience for level 4', () => {
      expect(calculator.getExperienceRequiredForLevel(4)).toBe(31);
    });

    it('should cap experience per level at MAX_EXP_PER_LEVEL', () => {
      expect(calculator.getExperienceRequiredForLevel(5)).toBe(42);
    });
  });

  describe('validateLevel', () => {
    it('should validate levels within range', () => {
      expect(calculator.validateLevel(1)).toBe(true);
      expect(calculator.validateLevel(50)).toBe(true);
      expect(calculator.validateLevel(100)).toBe(true);
    });

    it('should reject invalid levels', () => {
      expect(calculator.validateLevel(0)).toBe(false);
      expect(calculator.validateLevel(-1)).toBe(false);
      expect(calculator.validateLevel(101)).toBe(false);
    });
  });

  describe('getConfig', () => {
    it('should return current configuration', () => {
      const config = calculator.getConfig();
      
      expect(config.baseExperiencePoints).toBe(10);
      expect(config.streakMultiplier).toBe(0.1);
      expect(config.maxLevelCap).toBe(100);
      expect(config.levelExperienceBase).toBe(10);
      expect(config.levelExperienceMultiplier).toBe(1.05);
      expect(config.maxExpPerLevel).toBe(250);
    });

    it('should return a copy of config', () => {
      const config1 = calculator.getConfig();
      const config2 = calculator.getConfig();
      
      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2);
    });
  });

  describe('custom environment variables', () => {
    it('should use custom environment variables', () => {
      process.env = {
        ...originalEnv,
        BASE_EXPERIENCE_POINTS: '20',
        STREAK_MULTIPLIER: '0.2',
        MAX_LEVEL_CAP: '50',
        LEVEL_EXPERIENCE_BASE: '200',
        LEVEL_EXPERIENCE_MULTIPLIER: '2.0',
        MAX_EXP_PER_LEVEL: '500',
      };

      const customCalculator = new ExperienceCalculator();
      const config = customCalculator.getConfig();
      
      expect(config.baseExperiencePoints).toBe(20);
      expect(config.streakMultiplier).toBe(0.2);
      expect(config.maxLevelCap).toBe(50);
      expect(config.levelExperienceBase).toBe(200);
      expect(config.levelExperienceMultiplier).toBe(2.0);
      expect(config.maxExpPerLevel).toBe(500);
    });

    it('should use default values when env vars are not set', () => {
      process.env = { ...originalEnv };
      delete process.env.BASE_EXPERIENCE_POINTS;
      delete process.env.STREAK_MULTIPLIER;
      delete process.env.MAX_LEVEL_CAP;
      delete process.env.LEVEL_EXPERIENCE_BASE;
      delete process.env.LEVEL_EXPERIENCE_MULTIPLIER;
      delete process.env.MAX_EXP_PER_LEVEL;

      const defaultCalculator = new ExperienceCalculator();
      const config = defaultCalculator.getConfig();
      
      expect(config.baseExperiencePoints).toBe(10);
      expect(config.streakMultiplier).toBe(0.1);
      expect(config.maxLevelCap).toBe(100);
      expect(config.levelExperienceBase).toBe(10);
      expect(config.levelExperienceMultiplier).toBe(1.05);
      expect(config.maxExpPerLevel).toBe(250);
    });
  });
});