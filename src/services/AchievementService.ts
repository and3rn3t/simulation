export class AchievementService {
  unlockAchievement(achievementId: string): void {
    console.log(`Achievement ${achievementId} unlocked`);
  }

  listAchievements(): string[] {
    return ['Achievement1', 'Achievement2'];
  }
}
