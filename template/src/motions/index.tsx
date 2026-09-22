import { MP } from "./shared";
import { StatCount, NumberCards, EitherOr, Checklist, IconRow, KeywordTypo, SpeechBubble, QuoteCard } from "./Cards";
import { AgeTimeline, IncomeGapStack, StepFlow, Flowchart, GenerationTable } from "./Charts";
import { PhoneScene, Countdown } from "./Cta";
import { ColdOpen, KeywordChip, RecapCard, PromiseCard } from "./Develop";
export const MOTIONS: Record<string, React.FC<MP>> = {
  statCount: StatCount, numberCards: NumberCards, eitherOr: EitherOr, checklist: Checklist, iconRow: IconRow, keywordTypo: KeywordTypo, speechBubble: SpeechBubble, quoteCard: QuoteCard,
  ageTimeline: AgeTimeline, incomeGapStack: IncomeGapStack, stepFlow: StepFlow, flowchart: Flowchart, generationTable: GenerationTable,
  phoneScene: PhoneScene, countdown: Countdown,
  coldOpen: ColdOpen, keywordChip: KeywordChip, recapCard: RecapCard, promiseCard: PromiseCard,
};
