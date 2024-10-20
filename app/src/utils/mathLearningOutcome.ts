import { LearningOutcome } from './learningOutcome';

export class MathLearningOutcome extends LearningOutcome {
    skills: string[];
    strand: string;
    id: number;

    constructor(
        specificLearningOutcome: string,
        generalLearningOutcomes: string[],
        skills: string[],
        grade: string,
        id: number,
        strand: string
    ) {
        super(specificLearningOutcome, generalLearningOutcomes, grade);
        this.skills = skills;
        this.strand = strand;
        this.id = id;
    }

    getID(): string {
        return `${this.grade}.${this.strand}.${this.id}`;
    }
}
