export interface VotingConfig {
  isVotingClosed: boolean;
  votingDeadline: string; // ISO format or YYYY-MM-DDTHH:mm
}

export interface UserVoteRecord {
  studentId: string;
  studentName?: string;
  timestamp: number; // epoch ms when vote was cast
}

// Map categoryId -> UserVoteRecord
export type UserVotesMap = Record<string, UserVoteRecord>;

const CONFIG_KEY = 'gss_kubwa_voting_config';
const USER_VOTES_PREFIX = 'gss_kubwa_user_votes_';

export function getVotingConfig(): VotingConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn("Error reading voting config:", err);
  }
  return {
    isVotingClosed: false,
    votingDeadline: ''
  };
}

export function saveVotingConfig(config: VotingConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn("Error saving voting config:", err);
  }
}

export function isVotingActive(config: VotingConfig): { active: boolean; reason?: string } {
  if (config.isVotingClosed) {
    return { active: false, reason: 'Voting has been closed by administration.' };
  }
  if (config.votingDeadline) {
    const deadlineMs = new Date(config.votingDeadline).getTime();
    if (!isNaN(deadlineMs) && Date.now() > deadlineMs) {
      return { active: false, reason: 'Voting duration has ended.' };
    }
  }
  return { active: true };
}

export function getUserVotesMap(userId: string): UserVotesMap {
  try {
    const raw = localStorage.getItem(`${USER_VOTES_PREFIX}${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn("Error reading user votes:", err);
  }
  return {};
}

export function saveUserVotesMap(userId: string, votesMap: UserVotesMap): void {
  try {
    localStorage.setItem(`${USER_VOTES_PREFIX}${userId}`, JSON.stringify(votesMap));
  } catch (err) {
    console.warn("Error saving user votes map:", err);
  }
}

export function isWithin24Hours(timestamp: number): boolean {
  if (!timestamp) return false;
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  return (Date.now() - timestamp) <= ONE_DAY_MS;
}

export function getHoursRemainingIn24hWindow(timestamp: number): number {
  if (!timestamp) return 0;
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const elapsed = Date.now() - timestamp;
  const remainingMs = ONE_DAY_MS - elapsed;
  if (remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / (60 * 60 * 1000));
}
