export class SocialStudiesSkill {
    specificLearningOutcome: string;
    generalLearningOutcome: string;
    cluster: string;
    skillType: string;
    outcomeType: string = "S";
    id: string;
    grades: string[];

    constructor(
        specificLearningOutcome: string,
        skillType: string,
        grades: string[],
        id: string
    ) {
        this.generalLearningOutcome = "";
        this.skillType = skillType;
        this.specificLearningOutcome = specificLearningOutcome;
        this.id = id;
        this.grades = grades;
        this.cluster = "";
    }

    getID(grade: string): string {
        return `${grade}-S-${this.id}`;
    }
}
