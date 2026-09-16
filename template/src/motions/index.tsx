import { MP } from "./shared";
import { StatCount, NumberCards, EitherOr, Checklist, IconRow, KeywordTypo, SpeechBubble, QuoteCard } from "./Cards";
import { AgeTimeline, IncomeGapStack, StepFlow, Flowchart, GenerationTable } from "./Charts";
import { PhoneScene, Countdown } from "./Cta";
export const MOTIONS: Record<string, React.FC<MP>> = {
  statCount: StatCount, numberCards: NumberCards, eitherOr: EitherOr, checklist: Checklist, iconRow: IconRow, keywordTypo: KeywordTypo, speechBubble: SpeechBubble, quoteCard: QuoteCard,
  ageTimeline: AgeTimeline, incomeGapStack: IncomeGapStack, stepFlow: StepFlow, flowchart: Flowchart, generationTable: GenerationTable,
  phoneScene: PhoneScene, countdown: Countdown,
};
