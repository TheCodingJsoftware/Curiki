import { LearningOutcome } from './learningOutcome';

export class ScienceLearningOutcome extends LearningOutcome {
    cluster: string;
    id: number;

    constructor(
        specificLearningOutcome: string,
        generalLearningOutcomes: string[],
        grade: string,
        id: number,
        cluster: string
    ) {
        super(specificLearningOutcome, generalLearningOutcomes, grade);
        this.cluster = cluster;
        this.id = id;
    }

    getID(): string{
        return `${this.grade}.${this.cluster}.${this.id}`;
    }
}
