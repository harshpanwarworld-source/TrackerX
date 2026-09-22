import { GoogleGenAI } from '@google/genai';
import { Trade, TradeAnalysisResult } from '../../src/types/index.js';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

export async function generateTradeExplanation(
  trade: Trade,
  analysis: TradeAnalysisResult
): Promise<{
  summary: string;
  factorHighlights: string[];
  differedFromNormal: string;
  confidence: string;
  insufficientEvidence?: boolean;
}> {
  // If there are less than 3 trades or no factors, return deterministic insufficient evidence statement
  if (analysis.contributingFactors.length === 0 || analysis.historicalComparison.comparableTradesCount < 3) {
    return {
      summary: 'TRACKERX identified insufficient historical evidence to isolate statistically meaningful contributing factors for this execution.',
      factorHighlights: ['Baseline dataset contains fewer than 3 historical comparison points.'],
      differedFromNormal: 'Baseline dataset is currently forming.',
      confidence: 'LOW',
      insufficientEvidence: true,
    };
  }

  const ai = getAiClient();

  // If no Gemini API key configured, use deterministic evidence-backed template
  if (!ai) {
    const factorList = analysis.contributingFactors.map(
      f => `${f.factor}: Measured at ${f.measuredValue} (Baseline: ${f.traderBaseline}) — ${f.evidence}`
    );

    const mainDiff = analysis.contributingFactors[0]
      ? `${analysis.contributingFactors[0].factor} differed by ${analysis.contributingFactors[0].difference}.`
      : 'No significant deviation observed.';

    return {
      summary: `TRACKERX identified ${analysis.contributingFactors.length} measurable contributing factors associated with this ${analysis.outcome.toLowerCase()} trade.`,
      factorHighlights: factorList,
      differedFromNormal: mainDiff,
      confidence: analysis.contributingFactors.some(f => f.confidence === 'HIGH') ? 'HIGH' : 'MEDIUM',
      insufficientEvidence: false,
    };
  }

  // With Gemini API available, format prompt containing verified evidence ONLY
  try {
    const verifiedEvidencePrompt = `
You are the explanation layer of TRACKERX, an evidence-based trading analytics platform.
You MUST adhere strictly to the following non-causality and evidence guidelines:
1. NEVER claim you know the definitive single cause of a trade outcome. Markets are multivariant.
2. ALWAYS use the phrasing: "TRACKERX identified these measurable contributing factors..."
3. NEVER invent news, market events, indicators, macroeconomic data, broker commentary, or fake statistics.
4. Only synthesize the verified calculated numbers provided below.

VERIFIED CALCULATED EVIDENCE:
- Outcome: ${analysis.outcome}
- Net P&L: $${analysis.netPnl.toFixed(2)}
- Realized R-Multiple: ${trade.rMultiple !== undefined ? trade.rMultiple + 'R' : 'Unspecified'}
- Symbol: ${trade.symbol}
- Direction: ${trade.direction}
- Quantity: ${trade.quantity} lots
- Setup: ${trade.setup || 'Not specified'}
- Session: ${trade.session || 'Not specified'}
- Comparable Historical Trades: ${analysis.historicalComparison.comparableTradesCount}
- Historical Setup Expectancy: ${analysis.historicalComparison.setupExpectancy}R
- Historical Setup Win Rate: ${analysis.historicalComparison.setupWinRate}%
- Historical Average Win: $${analysis.historicalComparison.historicalAverageWin}
- Historical Average Loss: $${analysis.historicalComparison.historicalAverageLoss}
- Measured Factors:
${analysis.contributingFactors.map(f => `  * ${f.factor}: Measured ${f.measuredValue} vs baseline ${f.traderBaseline} (${f.difference}). Evidence: ${f.evidence}`).join('\n')}
${analysis.missingInformation ? `- Missing Context: ${analysis.missingInformation.join(', ')}` : ''}

Respond with a JSON object strictly matching this schema:
{
  "summary": "1-2 sentence evidence-based summary starting with 'TRACKERX identified these measurable contributing factors...'",
  "factorHighlights": ["array of 2-4 concise bullet strings summarizing the measured factors"],
  "differedFromNormal": "1 sentence describing what was most anomalous relative to the trader's historical baseline",
  "confidence": "HIGH" | "MEDIUM" | "LOW"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: verifiedEvidencePrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim();
    if (text) {
      const parsed = JSON.parse(text);
      return {
        summary: parsed.summary || 'TRACKERX identified these measurable contributing factors.',
        factorHighlights: parsed.factorHighlights || analysis.contributingFactors.map(f => f.evidence),
        differedFromNormal: parsed.differedFromNormal || 'Measurable deviations occurred against baseline.',
        confidence: parsed.confidence || 'MEDIUM',
        insufficientEvidence: false,
      };
    }
  } catch (err) {
    console.error('Error invoking Gemini for trade explanation, falling back to deterministic synthesis:', err);
  }

  // Graceful deterministic fallback
  return {
    summary: `TRACKERX identified ${analysis.contributingFactors.length} measurable contributing factors associated with this ${analysis.outcome.toLowerCase()} trade.`,
    factorHighlights: analysis.contributingFactors.map(f => `${f.factor}: ${f.evidence}`),
    differedFromNormal: analysis.contributingFactors[0]?.difference || 'Observed variance across execution parameters.',
    confidence: 'MEDIUM',
    insufficientEvidence: false,
  };
}
