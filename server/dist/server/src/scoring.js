"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRound1Score = calculateRound1Score;
exports.calculateRound2IndividualScore = calculateRound2IndividualScore;
exports.calculateRound2TeamScore = calculateRound2TeamScore;
exports.calculateRound3Score = calculateRound3Score;
exports.calculateRound4IndividualScore = calculateRound4IndividualScore;
exports.calculateRound4TeamScore = calculateRound4TeamScore;
exports.calculateRound5Score = calculateRound5Score;
function calculateRound1Score(optimalTime, teamBestTime) {
    if (teamBestTime === Infinity || teamBestTime === 0)
        return 0;
    return Math.round(1000 * optimalTime / teamBestTime);
}
function calculateRound2IndividualScore(isComplete, fractionConnected, timeFractionLeft) {
    if (isComplete) {
        return 100 + 50 * timeFractionLeft;
    }
    else {
        return 20 * fractionConnected;
    }
}
function calculateRound2TeamScore(individualScores) {
    if (individualScores.length === 0)
        return 0;
    const avg = individualScores.reduce((a, b) => a + b, 0) / individualScores.length;
    return Math.round(1000 * avg / 150);
}
function calculateRound3Score(isSuccess, timeFractionLeft) {
    if (!isSuccess)
        return 0;
    return Math.round(700 + 300 * timeFractionLeft);
}
function calculateRound4IndividualScore(correctRatio, isComplete, timeFractionLeft) {
    let score = 900 * correctRatio;
    if (isComplete) {
        score += 100 * timeFractionLeft * correctRatio;
    }
    return score;
}
function calculateRound4TeamScore(individualScores) {
    if (individualScores.length === 0)
        return 0;
    return Math.round(individualScores.reduce((a, b) => a + b, 0) / individualScores.length);
}
function calculateRound5Score(actionCompletionRatio, isComplete, timeFractionLeft) {
    let score = 700 * actionCompletionRatio;
    if (isComplete) {
        score += 300 * timeFractionLeft;
    }
    return Math.round(score);
}
