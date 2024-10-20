import { MathLearningOutcome } from './mathLearningOutcome';
import { CurriculumManager } from './curriculumManager';

export default class MathCurriculumManager extends CurriculumManager {
    learningOutcomes: MathLearningOutcome[] = [];
    strands: { [key: string]: string } = {};
    skills: { [key: string]: string } = {}

    constructor() {
        super();
        this.strands = {};
        this.skills = {};
        this.loadCurriculum();
    }

    async loadCurriculum() {
        try {
            const response = await fetch('/static/data/mathematics_curriculum.json');
            if (response.ok) {
                const data = await response.json();
                this.learningOutcomes = data["learning_outcomes"].map((learningOutcome: {
                    specific_learning_outcome: string,
                    general_learning_outcomes: string[],
                    skills: string[],
                    grade: string,
                    id: number,
                    strand: string
                }) =>
                    new MathLearningOutcome(
                        learningOutcome.specific_learning_outcome,
                        learningOutcome.general_learning_outcomes,
                        learningOutcome.skills,
                        learningOutcome.grade,
                        learningOutcome.id,
                        learningOutcome.strand
                    )
                );
                this.strands = data["strands"];
                this.skills = data["skills"];
            } else {
                console.error('Failed to load learning outcomes:', response.statusText);
            }
        } catch (error) {
            console.error('Error loading learning outcomes:', error);
        }
    }

    filterData({ grade, searchQuery, strands, skills }: { grade?: string, searchQuery?: string, strands?: string[], skills?: string[] }): MathLearningOutcome[] {
        return this.learningOutcomes.filter(outcome => {
            grade = grade?.replace('grade_', '');
            grade = grade?.replace('#', '');
            grade = grade?.toUpperCase();

            const matchesGrade = grade ? outcome.grade === grade : true;
            const matchesSearch = searchQuery ?
                outcome.specificLearningOutcome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                outcome.generalLearningOutcomes.some(glo => glo.toLowerCase().includes(searchQuery.toLowerCase())) ||
                outcome.getID().toLowerCase().includes(searchQuery.toLowerCase())
                : true;
            const matchesStrands = strands ? strands.length > 0 ? strands.includes(outcome.strand) : true : true;
            const matchesSkills = skills ? skills.length > 0 ? skills.every(skill => outcome.skills.includes(skill)) : true : true;

            return matchesGrade && matchesSearch && matchesStrands && matchesSkills;
        });
    }

    public getOutcomesByGrade(grade: string): MathLearningOutcome[] {
        grade = grade?.replace('grade_', '');
        grade = grade?.replace('#', '');
        grade = grade?.toUpperCase();
        return this.learningOutcomes.filter(outcome => outcome.grade === grade);
    }

    public getLearningOutcomeByID(id: string): MathLearningOutcome | undefined {
        return this.learningOutcomes.find(outcome => outcome.getID() === id) || undefined;
    }

    public getStrands(grade: string): string[] {
        grade = grade?.replace('grade_', '');
        grade = grade?.replace('#', '');
        grade = grade?.toUpperCase();
        return [...new Set(this.learningOutcomes.filter(outcome => outcome.grade === grade).map(outcome => outcome.strand))];
    }

    public getSkills(grade: string): string[] {
        grade = grade?.replace('grade_', '');
        grade = grade?.replace('#', '');
        grade = grade?.toUpperCase();

        return [...new Set(this.learningOutcomes.filter(outcome => outcome.grade === grade).map(outcome => outcome.skills).flat())];
    }

    public async load(): Promise<void> {
        await this.loadCurriculum();
    }

    public getCurriculum(): MathLearningOutcome[] {
        return this.learningOutcomes;
    }

    public getAllGrades(): string[] {
        return this.learningOutcomes.map(learningOutcome => learningOutcome.grade);
    }
}
