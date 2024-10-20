import { LearningOutcome } from './learningOutcome';

export class BiologyLearningOutcome extends LearningOutcome {
    unit: string;
    id: number;

    constructor(
        specificLearningOutcome: string,
        generalLearningOutcomes: string[],
        grade: string,
        id: number,
        unit: string
    ) {
        super(specificLearningOutcome, generalLearningOutcomes, grade);
        this.unit = unit;
        this.id = id;
    }

    getID(): string{
        return `B${this.grade}.${this.unit}.${this.id}`;
    }
}
