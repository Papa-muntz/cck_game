export function calculateRound1Score(optimalTime: number, teamBestTime: number): number {
  if (teamBestTime === Infinity || teamBestTime === 0) return 0;
  return Math.round(1000 * optimalTime / teamBestTime);
}

export function calculateRound2IndividualScore(isComplete: boolean, fractionConnected: number, timeFractionLeft: number): number {
  if (isComplete) {
    return 100 + 50 * timeFractionLeft;
  } else {
    return 20 * fractionConnected;
  }
}

export function calculateRound2TeamScore(individualScores: number[]): number {
  if (individualScores.length === 0) return 0;
  const avg = individualScores.reduce((a, b) => a + b, 0) / individualScores.length;
  return Math.round(1000 * avg / 150);
}

export function calculateRound3Score(isSuccess: boolean, timeFractionLeft: number): number {
  if (!isSuccess) return 0;
  return Math.round(700 + 300 * timeFractionLeft);
}

export function calculateRound4IndividualScore(correctRatio: number, isComplete: boolean, timeFractionLeft: number): number {
  let score = 900 * correctRatio;
  if (isComplete) {
    score += 100 * timeFractionLeft * correctRatio;
  }
  return score;
}

export function calculateRound4TeamScore(individualScores: number[]): number {
  if (individualScores.length === 0) return 0;
  return Math.round(individualScores.reduce((a, b) => a + b, 0) / individualScores.length);
}

export function calculateRound5Score(actionCompletionRatio: number, isComplete: boolean, timeFractionLeft: number): number {
  let score = 700 * actionCompletionRatio;
  if (isComplete) {
    score += 300 * timeFractionLeft;
  }
  return Math.round(score);
}
