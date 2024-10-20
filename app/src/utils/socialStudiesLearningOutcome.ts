import { LearningOutcome } from './learningOutcome';

export class SocialStudiesLearningOutcome extends LearningOutcome {
    generalLearningOutcome: string;
    cluster: string;
    outcomeType: string;
    distinctiveLearningOutcome: string;
    id: string;

    constructor(
        specificLearningOutcome: string,
        generalLearningOutcome: string,
        outcomeType: string,
        grades: string,
        id: string,
        distinctiveLearningOutcome: string,
        cluster: string
    ) {
        super(specificLearningOutcome, [generalLearningOutcome], grades);
        this.generalLearningOutcome = generalLearningOutcome;
        this.outcomeType = outcomeType;
        this.distinctiveLearningOutcome = distinctiveLearningOutcome;
        this.cluster = cluster;
        this.id = id;
    }

    getID(_?: string): string {
        return `${this.grade}-${this.outcomeType}${this.generalLearningOutcome}-${this.id}${this.distinctiveLearningOutcome}`;
    }
}
