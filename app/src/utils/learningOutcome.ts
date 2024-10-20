export class LearningOutcome {
    specificLearningOutcome: string;
    generalLearningOutcomes: string[];
    grade: string;

    constructor(
        specificLearningOutcome: string,
        generalLearningOutcomes: string[],
        grade: string,
    ) {
        this.specificLearningOutcome = specificLearningOutcome;
        this.generalLearningOutcomes = generalLearningOutcomes;
        this.grade = grade;
    }
}
