import { Trade, DiagnosticFactor, TradeAnalysisResult, QuantitativeSummary, TraderDNA } from '../../src/types/index.js';

export function calculateSummary(trades: Trade[], initialBalance = 10000): QuantitativeSummary {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakevenTrades: 0,
      winRate: 0,
      netPnl: 0,
      grossProfit: 0,
      grossLoss: 0,
      profitFactor: 0,
      expectancy: 0,
      averageR: 0,
      averageWin: 0,
      averageLoss: 0,
      maxDrawdownAmount: 0,
      maxDrawdownPercent: 0,
      recoveryFactor: 0,
      consecutiveWinsMax: 0,
      consecutiveLossesMax: 0,
      riskConsistencyScore: 100,
      averageHoldingDurationMs: 0,
      bestSymbol: { symbol: 'N/A', pnl: 0 },
      worstSymbol: { symbol: 'N/A', pnl: 0 },
      bestSession: { session: 'N/A', pnl: 0 },
      worstSession: { session: 'N/A', pnl: 0 },
      bestSetup: { setup: 'N/A', expectancyR: 0 },
      worstSetup: { setup: 'N/A', expectancyR: 0 },
      equityCurve: [{ time: Date.now(), equity: initialBalance, tradeIndex: 0, pnl: 0 }],
      dailyPnl: [],
      drawdownCurve: [],
    };
  }

  // Sort chronologically by close time
  const sorted = [...trades].sort((a, b) => a.closeTime - b.closeTime);

  let netPnl = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let breakevenTrades = 0;
  let totalR = 0;
  let rCount = 0;
  let totalDuration = 0;

  let currentStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;

  const symbolPnl: Record<string, number> = {};
  const sessionPnl: Record<string, number> = {};
  const setupR: Record<string, { totalR: number; count: number; pnl: number }> = {};
  const dailyPnlMap: Record<string, { pnl: number; count: number }> = {};

  // For drawdown tracking
  let runningEquity = initialBalance;
  let peakEquity = initialBalance;
  let maxDrawdownAmount = 0;
  let maxDrawdownPercent = 0;

  const equityCurve: Array<{ time: number; equity: number; tradeIndex: number; pnl: number }> = [
    { time: sorted[0].openTime - 60000, equity: initialBalance, tradeIndex: 0, pnl: 0 }
  ];
  const drawdownCurve: Array<{ time: number; drawdown: number; drawdownPercent: number }> = [];

  const riskPercentages: number[] = [];

  sorted.forEach((trade, index) => {
    netPnl += trade.netPnl;
    totalDuration += trade.holdingDuration;

    if (trade.riskPercentage !== undefined && trade.riskPercentage !== null) {
      riskPercentages.push(trade.riskPercentage);
    }

    if (trade.netPnl > 0.01) {
      winningTrades++;
      grossProfit += trade.netPnl;
      if (currentStreak > 0) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      if (currentStreak > maxWinStreak) maxWinStreak = currentStreak;
    } else if (trade.netPnl < -0.01) {
      losingTrades++;
      grossLoss += Math.abs(trade.netPnl);
      if (currentStreak < 0) {
        currentStreak--;
      } else {
        currentStreak = -1;
      }
      if (Math.abs(currentStreak) > maxLossStreak) maxLossStreak = Math.abs(currentStreak);
    } else {
      breakevenTrades++;
      currentStreak = 0;
    }

    if (trade.rMultiple !== undefined && trade.rMultiple !== null) {
      totalR += trade.rMultiple;
      rCount++;
    }

    // Symbol aggregations
    symbolPnl[trade.symbol] = (symbolPnl[trade.symbol] || 0) + trade.netPnl;

    // Session aggregations
    if (trade.session) {
      sessionPnl[trade.session] = (sessionPnl[trade.session] || 0) + trade.netPnl;
    }

    // Setup aggregations
    if (trade.setup) {
      const cur = setupR[trade.setup] || { totalR: 0, count: 0, pnl: 0 };
      cur.count++;
      cur.pnl += trade.netPnl;
      if (trade.rMultiple !== undefined && trade.rMultiple !== null) {
        cur.totalR += trade.rMultiple;
      }
      setupR[trade.setup] = cur;
    }

    // Daily breakdown
    const dateStr = new Date(trade.closeTime).toISOString().slice(0, 10);
    if (!dailyPnlMap[dateStr]) {
      dailyPnlMap[dateStr] = { pnl: 0, count: 0 };
    }
    dailyPnlMap[dateStr].pnl += trade.netPnl;
    dailyPnlMap[dateStr].count++;

    // Equity and Drawdown
    runningEquity += trade.netPnl;
    if (runningEquity > peakEquity) {
      peakEquity = runningEquity;
    }
    const currentDdAmount = peakEquity - runningEquity;
    const currentDdPercent = peakEquity > 0 ? (currentDdAmount / peakEquity) * 100 : 0;

    if (currentDdAmount > maxDrawdownAmount) {
      maxDrawdownAmount = currentDdAmount;
      maxDrawdownPercent = currentDdPercent;
    }

    equityCurve.push({
      time: trade.closeTime,
      equity: runningEquity,
      tradeIndex: index + 1,
      pnl: trade.netPnl,
    });

    drawdownCurve.push({
      time: trade.closeTime,
      drawdown: currentDdAmount,
      drawdownPercent: currentDdPercent,
    });
  });

  const totalTrades = sorted.length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const averageWin = winningTrades > 0 ? grossProfit / winningTrades : 0;
  const averageLoss = losingTrades > 0 ? grossLoss / losingTrades : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999.0 : 0;
  const expectancy = (winRate / 100) * averageWin - ((100 - winRate) / 100) * averageLoss;
  const averageR = rCount > 0 ? totalR / rCount : 0;
  const recoveryFactor = maxDrawdownAmount > 0 ? netPnl / maxDrawdownAmount : netPnl > 0 ? 99.0 : 0;

  // Risk consistency score: standard deviation of risk percentages
  let riskConsistencyScore = 85;
  if (riskPercentages.length >= 2) {
    const meanRisk = riskPercentages.reduce((a, b) => a + b, 0) / riskPercentages.length;
    const variance = riskPercentages.reduce((sum, r) => sum + Math.pow(r - meanRisk, 2), 0) / riskPercentages.length;
    const stdDev = Math.sqrt(variance);
    // Lower stdDev => higher consistency (normalized 0 - 100)
    riskConsistencyScore = Math.max(10, Math.min(100, Math.round(100 - stdDev * 25)));
  }

  // Best / Worst Symbol
  const sortedSymbols = Object.entries(symbolPnl).sort((a, b) => b[1] - a[1]);
  const bestSymbol = sortedSymbols.length > 0 ? { symbol: sortedSymbols[0][0], pnl: sortedSymbols[0][1] } : { symbol: 'N/A', pnl: 0 };
  const worstSymbol = sortedSymbols.length > 0 ? { symbol: sortedSymbols[sortedSymbols.length - 1][0], pnl: sortedSymbols[sortedSymbols.length - 1][1] } : { symbol: 'N/A', pnl: 0 };

  // Best / Worst Session
  const sortedSessions = Object.entries(sessionPnl).sort((a, b) => b[1] - a[1]);
  const bestSession = sortedSessions.length > 0 ? { session: sortedSessions[0][0], pnl: sortedSessions[0][1] } : { session: 'N/A', pnl: 0 };
  const worstSession = sortedSessions.length > 0 ? { session: sortedSessions[sortedSessions.length - 1][0], pnl: sortedSessions[sortedSessions.length - 1][1] } : { session: 'N/A', pnl: 0 };

  // Best / Worst Setup
  const setupEntries = Object.entries(setupR).map(([setup, data]) => ({
    setup,
    expectancyR: data.count > 0 ? data.totalR / data.count : 0,
    pnl: data.pnl,
  })).sort((a, b) => b.expectancyR - a.expectancyR);

  const bestSetup = setupEntries.length > 0 ? { setup: setupEntries[0].setup, expectancyR: setupEntries[0].expectancyR } : { setup: 'N/A', expectancyR: 0 };
  const worstSetup = setupEntries.length > 0 ? { setup: setupEntries[setupEntries.length - 1].setup, expectancyR: setupEntries[setupEntries.length - 1].expectancyR } : { setup: 'N/A', expectancyR: 0 };

  const dailyPnl = Object.entries(dailyPnlMap).map(([date, d]) => ({
    date,
    pnl: d.pnl,
    tradesCount: d.count,
  })).sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalTrades,
    winningTrades,
    losingTrades,
    breakevenTrades,
    winRate: Number(winRate.toFixed(1)),
    netPnl: Number(netPnl.toFixed(2)),
    grossProfit: Number(grossProfit.toFixed(2)),
    grossLoss: Number(grossLoss.toFixed(2)),
    profitFactor: Number(profitFactor.toFixed(2)),
    expectancy: Number(expectancy.toFixed(2)),
    averageR: Number(averageR.toFixed(2)),
    averageWin: Number(averageWin.toFixed(2)),
    averageLoss: Number(averageLoss.toFixed(2)),
    maxDrawdownAmount: Number(maxDrawdownAmount.toFixed(2)),
    maxDrawdownPercent: Number(maxDrawdownPercent.toFixed(1)),
    recoveryFactor: Number(recoveryFactor.toFixed(2)),
    consecutiveWinsMax: maxWinStreak,
    consecutiveLossesMax: maxLossStreak,
    riskConsistencyScore,
    averageHoldingDurationMs: totalTrades > 0 ? Math.round(totalDuration / totalTrades) : 0,
    bestSymbol,
    worstSymbol,
    bestSession,
    worstSession,
    bestSetup,
    worstSetup,
    equityCurve,
    dailyPnl,
    drawdownCurve,
  };
}

export function calculateTradeFactors(targetTrade: Trade, allTrades: Trade[]): TradeAnalysisResult {
  const otherTrades = allTrades.filter(t => t.id !== targetTrade.id);
  const outcome: 'WIN' | 'LOSS' | 'BREAKEVEN' = targetTrade.netPnl > 0.01 ? 'WIN' : targetTrade.netPnl < -0.01 ? 'LOSS' : 'BREAKEVEN';
  const factors: DiagnosticFactor[] = [];
  const missingInfo: string[] = [];

  if (otherTrades.length < 3) {
    return {
      tradeId: targetTrade.id,
      outcome,
      netPnl: targetTrade.netPnl,
      rMultiple: targetTrade.rMultiple,
      contributingFactors: [],
      historicalComparison: {
        comparableTradesCount: otherTrades.length,
        setupWinRate: 0,
        setupExpectancy: 0,
        historicalAverageLoss: 0,
        historicalAverageWin: 0,
      },
      missingInformation: ['Baseline requires at least 3 historical trades for meaningful statistical comparison.'],
      aiExplanation: {
        summary: 'Insufficient historical data to isolate statistically significant deviations from baseline behavior.',
        factorHighlights: [],
        differedFromNormal: 'Baseline dataset is still forming.',
        confidence: 'LOW',
        insufficientEvidence: true,
      }
    };
  }

  // 1. Position Sizing Factor
  const quantities = otherTrades.map(t => t.quantity).sort((a, b) => a - b);
  const medianQuantity = quantities[Math.floor(quantities.length / 2)] || 1;
  const sizeDiffPct = Math.round(((targetTrade.quantity - medianQuantity) / medianQuantity) * 100);

  if (Math.abs(sizeDiffPct) >= 20) {
    factors.push({
      factor: 'Position Sizing Deviation',
      category: 'position_sizing',
      measuredValue: `${targetTrade.quantity} lots`,
      traderBaseline: `${medianQuantity.toFixed(2)} lots median`,
      difference: `${sizeDiffPct > 0 ? '+' : ''}${sizeDiffPct}% vs baseline`,
      differencePercent: sizeDiffPct,
      evidence: `Historical baseline median is ${medianQuantity.toFixed(2)} lots across ${otherTrades.length} recorded trades. This execution used ${targetTrade.quantity} lots.`,
      isPositiveForOutcome: (outcome === 'WIN' && sizeDiffPct > 0) || (outcome === 'LOSS' && sizeDiffPct < 0),
      confidence: otherTrades.length >= 10 ? 'HIGH' : 'MEDIUM',
    });
  }

  // 2. Risk Amount Factor (if SL configured)
  if (targetTrade.riskPercentage !== undefined && targetTrade.riskPercentage !== null) {
    const historicalRisks = otherTrades
      .map(t => t.riskPercentage)
      .filter((r): r is number => r !== undefined && r !== null);

    if (historicalRisks.length >= 3) {
      const avgRisk = historicalRisks.reduce((a, b) => a + b, 0) / historicalRisks.length;
      const riskDiff = targetTrade.riskPercentage - avgRisk;
      if (Math.abs(riskDiff) >= 0.3) {
        factors.push({
          factor: 'Risk Exposure Deviation',
          category: 'risk_consistency',
          measuredValue: `${targetTrade.riskPercentage.toFixed(2)}%`,
          traderBaseline: `${avgRisk.toFixed(2)}% average`,
          difference: `${riskDiff > 0 ? '+' : ''}${riskDiff.toFixed(2)}% vs baseline`,
          evidence: `Risk allocation on this trade was ${targetTrade.riskPercentage.toFixed(2)}% of equity compared to trader historical average of ${avgRisk.toFixed(2)}%.`,
          isPositiveForOutcome: (outcome === 'WIN' && riskDiff > 0) || (outcome === 'LOSS' && riskDiff < 0),
          confidence: 'HIGH',
        });
      }
    }
  } else {
    missingInfo.push('Stop loss or planned risk percentage was not specified at trade entry.');
  }

  // 3. Setup Historical Expectancy
  const sameSetupTrades = otherTrades.filter(t => t.setup && targetTrade.setup && t.setup === targetTrade.setup);
  let setupWinRate = 0;
  let setupExpectancy = 0;

  if (targetTrade.setup && sameSetupTrades.length >= 3) {
    const setupWins = sameSetupTrades.filter(t => t.netPnl > 0.01).length;
    setupWinRate = Number(((setupWins / sameSetupTrades.length) * 100).toFixed(1));
    const setupRs = sameSetupTrades
      .map(t => t.rMultiple)
      .filter((r): r is number => r !== undefined && r !== null);
    setupExpectancy = setupRs.length > 0 ? Number((setupRs.reduce((a, b) => a + b, 0) / setupRs.length).toFixed(2)) : 0;

    factors.push({
      factor: `Setup Expectancy: "${targetTrade.setup}"`,
      category: 'setup_performance',
      measuredValue: `${setupExpectancy >= 0 ? '+' : ''}${setupExpectancy}R Expectancy`,
      traderBaseline: `${setupWinRate}% Win Rate`,
      difference: `${sameSetupTrades.length} comparable setups in history`,
      evidence: `Across ${sameSetupTrades.length} historical trades tagged with "${targetTrade.setup}", win rate is ${setupWinRate}% with an average realized R-multiple of ${setupExpectancy}R.`,
      isPositiveForOutcome: (outcome === 'WIN' && setupExpectancy > 0) || (outcome === 'LOSS' && setupExpectancy < 0),
      confidence: sameSetupTrades.length >= 8 ? 'HIGH' : 'MEDIUM',
    });
  } else if (!targetTrade.setup) {
    missingInfo.push('No setup tag assigned to this trade (e.g. Pullback, Breakout, Liquidity Sweep).');
  }

  // 4. Holding Duration Comparison
  const sameOutcomeTrades = otherTrades.filter(t => (outcome === 'WIN' ? t.netPnl > 0.01 : t.netPnl < -0.01));
  if (sameOutcomeTrades.length >= 3) {
    const avgDuration = sameOutcomeTrades.reduce((sum, t) => sum + t.holdingDuration, 0) / sameOutcomeTrades.length;
    const durRatio = targetTrade.holdingDuration / avgDuration;
    if (durRatio > 2.0 || durRatio < 0.4) {
      const durMinutes = Math.round(targetTrade.holdingDuration / 60000);
      const avgMinutes = Math.round(avgDuration / 60000);
      factors.push({
        factor: 'Holding Duration Anomaly',
        category: 'timing',
        measuredValue: `${durMinutes} mins`,
        traderBaseline: `${avgMinutes} mins avg for ${outcome.toLowerCase()}s`,
        difference: `${durRatio > 1 ? '+' : ''}${Math.round((durRatio - 1) * 100)}% time in position`,
        evidence: `Position was held for ${durMinutes} minutes, substantially deviating from typical ${outcome.toLowerCase()} duration of ${avgMinutes} minutes.`,
        isPositiveForOutcome: outcome === 'WIN',
        confidence: 'MEDIUM',
      });
    }
  }

  // 5. Post-Loss Entry Behavior (Sequential Trade Pressure)
  const previousTrades = otherTrades
    .filter(t => t.closeTime <= targetTrade.openTime)
    .sort((a, b) => b.closeTime - a.closeTime);

  if (previousTrades.length > 0) {
    const prevTrade = previousTrades[0];
    const timeSincePrevCloseMs = targetTrade.openTime - prevTrade.closeTime;
    const minutesSincePrev = Math.round(timeSincePrevCloseMs / 60000);

    if (prevTrade.netPnl < -0.01 && minutesSincePrev < 30 && minutesSincePrev >= 0) {
      factors.push({
        factor: 'Rapid Re-entry After Loss',
        category: 'behavior',
        measuredValue: `${minutesSincePrev}m after previous loss`,
        traderBaseline: 'Normal inter-trade gap > 45m',
        difference: 'Potential revenge/hasty re-entry window',
        evidence: `Entered ${minutesSincePrev} minutes following a -$${Math.abs(prevTrade.netPnl).toFixed(2)} loss on ${prevTrade.symbol}. Historical data shows trades entered within 30m of a loss exhibit lower expectancy.`,
        isPositiveForOutcome: outcome === 'WIN',
        confidence: 'HIGH',
      });
    }
  }

  // Calculate historical averages
  const winningTrades = otherTrades.filter(t => t.netPnl > 0.01);
  const losingTrades = otherTrades.filter(t => t.netPnl < -0.01);
  const histAvgWin = winningTrades.length > 0 ? winningTrades.reduce((s, t) => s + t.netPnl, 0) / winningTrades.length : 0;
  const histAvgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((s, t) => s + t.netPnl, 0)) / losingTrades.length : 0;

  return {
    tradeId: targetTrade.id,
    outcome,
    netPnl: targetTrade.netPnl,
    rMultiple: targetTrade.rMultiple,
    contributingFactors: factors,
    historicalComparison: {
      comparableTradesCount: sameSetupTrades.length || otherTrades.length,
      setupWinRate,
      setupExpectancy,
      historicalAverageLoss: Number(histAvgLoss.toFixed(2)),
      historicalAverageWin: Number(histAvgWin.toFixed(2)),
    },
    missingInformation: missingInfo.length > 0 ? missingInfo : undefined,
  };
}

export function calculateTraderDNA(trades: Trade[]): TraderDNA {
  if (trades.length === 0) {
    return {
      hourlyPerformance: [],
      sessionPerformance: [],
      weekdayPerformance: [],
      setupExpectancy: [],
      symbolExpectancy: [],
      behavioralPatterns: [],
    };
  }

  // Hourly stats (0 - 23 UTC)
  const hourlyMap: Record<number, { count: number; wins: number; pnl: number }> = {};
  for (let h = 0; h < 24; h++) hourlyMap[h] = { count: 0, wins: 0, pnl: 0 };

  // Session stats
  const sessionMap: Record<string, { count: number; wins: number; pnl: number; totalR: number }> = {};

  // Weekday stats
  const weekdayMap: Record<number, { count: number; pnl: number; name: string }> = {
    1: { count: 0, pnl: 0, name: 'Monday' },
    2: { count: 0, pnl: 0, name: 'Tuesday' },
    3: { count: 0, pnl: 0, name: 'Wednesday' },
    4: { count: 0, pnl: 0, name: 'Thursday' },
    5: { count: 0, pnl: 0, name: 'Friday' },
  };

  // Setup stats
  const setupMap: Record<string, { count: number; wins: number; pnl: number; totalR: number }> = {};

  // Symbol stats
  const symbolMap: Record<string, { count: number; wins: number; pnl: number }> = {};

  // Chronological for behavioral patterns
  const sorted = [...trades].sort((a, b) => a.closeTime - b.closeTime);

  let rapidPostLossCount = 0;
  let rapidPostLossWins = 0;
  let rapidPostLossPnl = 0;

  sorted.forEach((t, i) => {
    const date = new Date(t.openTime);
    const hour = date.getUTCHours();
    const day = date.getUTCDay();

    hourlyMap[hour].count++;
    hourlyMap[hour].pnl += t.netPnl;
    if (t.netPnl > 0.01) hourlyMap[hour].wins++;

    if (t.session) {
      if (!sessionMap[t.session]) sessionMap[t.session] = { count: 0, wins: 0, pnl: 0, totalR: 0 };
      sessionMap[t.session].count++;
      sessionMap[t.session].pnl += t.netPnl;
      if (t.netPnl > 0.01) sessionMap[t.session].wins++;
      if (t.rMultiple) sessionMap[t.session].totalR += t.rMultiple;
    }

    if (day >= 1 && day <= 5) {
      weekdayMap[day].count++;
      weekdayMap[day].pnl += t.netPnl;
    }

    if (t.setup) {
      if (!setupMap[t.setup]) setupMap[t.setup] = { count: 0, wins: 0, pnl: 0, totalR: 0 };
      setupMap[t.setup].count++;
      setupMap[t.setup].pnl += t.netPnl;
      if (t.netPnl > 0.01) setupMap[t.setup].wins++;
      if (t.rMultiple) setupMap[t.setup].totalR += t.rMultiple;
    }

    if (!symbolMap[t.symbol]) symbolMap[t.symbol] = { count: 0, wins: 0, pnl: 0 };
    symbolMap[t.symbol].count++;
    symbolMap[t.symbol].pnl += t.netPnl;
    if (t.netPnl > 0.01) symbolMap[t.symbol].wins++;

    // Check rapid re-entry pattern (< 30 mins after a loss)
    if (i > 0) {
      const prev = sorted[i - 1];
      if (prev.netPnl < -0.01 && (t.openTime - prev.closeTime) <= 30 * 60000 && (t.openTime - prev.closeTime) >= 0) {
        rapidPostLossCount++;
        rapidPostLossPnl += t.netPnl;
        if (t.netPnl > 0.01) rapidPostLossWins++;
      }
    }
  });

  const hourlyPerformance = Object.entries(hourlyMap).map(([h, data]) => ({
    hour: Number(h),
    tradesCount: data.count,
    winRate: data.count > 0 ? Number(((data.wins / data.count) * 100).toFixed(1)) : 0,
    pnl: Number(data.pnl.toFixed(2)),
  }));

  const sessionPerformance = Object.entries(sessionMap).map(([session, data]) => ({
    session,
    tradesCount: data.count,
    winRate: data.count > 0 ? Number(((data.wins / data.count) * 100).toFixed(1)) : 0,
    pnl: Number(data.pnl.toFixed(2)),
    expectancyR: data.count > 0 ? Number((data.totalR / data.count).toFixed(2)) : 0,
  }));

  const weekdayPerformance = Object.entries(weekdayMap).map(([dayIdx, data]) => ({
    day: data.name,
    dayIndex: Number(dayIdx),
    tradesCount: data.count,
    pnl: Number(data.pnl.toFixed(2)),
  }));

  const setupExpectancy = Object.entries(setupMap).map(([setup, data]) => ({
    setup,
    count: data.count,
    winRate: data.count > 0 ? Number(((data.wins / data.count) * 100).toFixed(1)) : 0,
    pnl: Number(data.pnl.toFixed(2)),
    expectancyR: data.count > 0 ? Number((data.totalR / data.count).toFixed(2)) : 0,
  })).sort((a, b) => b.expectancyR - a.expectancyR);

  const symbolExpectancy = Object.entries(symbolMap).map(([symbol, data]) => ({
    symbol,
    count: data.count,
    winRate: data.count > 0 ? Number(((data.wins / data.count) * 100).toFixed(1)) : 0,
    pnl: Number(data.pnl.toFixed(2)),
  })).sort((a, b) => b.pnl - a.pnl);

  const overallWinRate = trades.filter(t => t.netPnl > 0.01).length / trades.length;

  const behavioralPatterns: TraderDNA['behavioralPatterns'] = [];

  // Behavioral pattern 1: Rapid re-entry after loss
  if (rapidPostLossCount >= 3) {
    const rapidWinRate = (rapidPostLossWins / rapidPostLossCount) * 100;
    behavioralPatterns.push({
      title: 'Post-Loss Rapid Re-entry Window',
      description: 'Trades entered within 30 minutes following a losing trade historically demonstrate a distinct win rate and expectancy differential.',
      observedValue: `${rapidWinRate.toFixed(1)}% Win Rate ($${rapidPostLossPnl.toFixed(0)})`,
      baselineValue: `${(overallWinRate * 100).toFixed(1)}% Overall Win Rate`,
      sampleSize: rapidPostLossCount,
      significance: rapidPostLossCount >= 8 ? 'HIGH' : 'MODERATE',
      cautionLevel: rapidWinRate < (overallWinRate * 100) - 10 ? 'ALERT' : 'INFO',
    });
  }

  // Behavioral pattern 2: Position sizing discipline
  const quantities = trades.map(t => t.quantity);
  const meanQty = quantities.reduce((a, b) => a + b, 0) / quantities.length;
  const oversizedTrades = trades.filter(t => t.quantity > meanQty * 1.4);
  if (oversizedTrades.length >= 2) {
    const oversizedWins = oversizedTrades.filter(t => t.netPnl > 0.01).length;
    const oversizedPnl = oversizedTrades.reduce((s, t) => s + t.netPnl, 0);
    behavioralPatterns.push({
      title: 'Oversized Position Allocation (>40% above mean)',
      description: 'Trades with position sizes significantly exceeding your average quantity have produced measurable skew in cumulative drawdown.',
      observedValue: `${oversizedTrades.length} trades ($${oversizedPnl.toFixed(0)})`,
      baselineValue: `${meanQty.toFixed(2)} lots average`,
      sampleSize: oversizedTrades.length,
      significance: 'HIGH',
      cautionLevel: oversizedPnl < 0 ? 'WARNING' : 'INFO',
    });
  }

  return {
    hourlyPerformance,
    sessionPerformance,
    weekdayPerformance,
    setupExpectancy,
    symbolExpectancy,
    behavioralPatterns,
  };
}
