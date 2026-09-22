# TRACKERX — Quantitative Analytics & Diagnostic Logic

## 1. Core Mathematical Metrics

### 1.1 Net Profit & Loss
$$\text{Net P\&L} = \sum (\text{Gross P\&L} - \text{Commission} - \text{Swap} - \text{Fees})$$

### 1.2 Win Rate ($W$)
$$W = \frac{\text{Count of Winning Trades (Net P\&L} > 0)}{\text{Total Closed Trades}} \times 100$$

### 1.3 Profit Factor ($PF$)
$$PF = \frac{\sum \text{Gross Profits}}{\left| \sum \text{Gross Losses} \right|}$$
*(Handled gracefully when Gross Losses = 0: capped or marked Infinite)*

### 1.4 Mathematical Expectancy ($E$)
$$E = (W \times \text{Avg Win}) - ((1 - W) \times \text{Avg Loss})$$
$$E_R = (W \times \text{Avg Win } R) - ((1 - W) \times \text{Avg Loss } R)$$

### 1.5 Maximum Drawdown ($MDD$)
Calculated from high-water mark of cumulative equity:
$$MDD_{\$} = \max_{t} (\text{Peak}_t - \text{Equity}_t)$$
$$MDD_{\%} = \max_{t} \left(\frac{\text{Peak}_t - \text{Equity}_t}{\text{Peak}_t}\right) \times 100$$

### 1.6 Risk Consistency Metric
Measures variance in position risk percentage across closed trades:
$$\sigma_{\text{risk}} = \sqrt{\frac{1}{N}\sum_{i=1}^N (r_i - \bar{r})^2}$$
Consistency score: $100 \times \max(0, 1 - 2 \cdot \sigma_{\text{risk}})$. A score $>80$ reflects disciplined risk control.

## 2. Individual Trade Contributing Factors Engine

Every analyzed trade is compared against the trader's empirical baseline.

| Factor | Calculation | Evaluation Rule |
| :--- | :--- | :--- |
| **Position Size Deviation** | $\Delta Q = \frac{Q_{\text{trade}} - \text{Median}(Q)}{\text{Median}(Q)}$ | Flag if $|\Delta Q| > 30\%$ |
| **Risk Amount Deviation** | $\Delta R = \frac{R_{\text{trade}} - \bar{R}}{\bar{R}}$ | Flag if trade risk exceeds $1.5\times$ historical mean |
| **Historical Setup Expectancy** | $E_{\text{setup}} = \text{Expectancy of same setup}$ | Flag if $E_{\text{setup}} < 0$ or $> 0.5R$ |
| **Holding Duration Deviation** | $\Delta T = \frac{T_{\text{trade}} - \text{Median}(T)}{\text{Median}(T)}$ | Compare against winning vs losing holding distribution |
| **Post-Loss Momentum Context** | $t_{\text{entry}} - t_{\text{prev\_loss\_exit}}$ | Detect trades entered $< 30$ mins after a realized loss |
| **Session Window** | Trade open time vs market hours | Assess session alignment (London/NY overlap vs off-hours) |

## 3. The Non-Fabrication Principle
Under no circumstance will TRACKERX emit definitive single-cause statements (e.g. "This loss was caused by your stop loss being too tight"). Every insight is phrased neutrally with empirical evidence:
> "TRACKERX identified these measurable contributing factors:
> 1. Position size was 42% above your historical median ($1.42$ lots vs $1.00$ lots).
> 2. Trade occurred 8 minutes following a -$240 loss, where historical expectancy is -0.45R."
