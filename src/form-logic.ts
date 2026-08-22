export const MIN_PARTICIPANTS = 2;
export const MAX_PARTICIPANTS = 20;

export type VillagePayload = {
  message: string[];
};

export function clampParticipantCount(
  value: number,
  min = MIN_PARTICIPANTS,
  max = MAX_PARTICIPANTS,
): number {
  if (value > max) {
    return max;
  }

  if (value < min) {
    return min;
  }

  return value;
}

export function participantLabel(count: number): string {
  return `参加者${count}`;
}

export function buildVillagePayload(messages: readonly string[]): VillagePayload {
  return {
    message: [...messages],
  };
}
