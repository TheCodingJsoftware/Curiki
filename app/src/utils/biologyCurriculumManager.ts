import { BiologyLearningOutcome } from './biologyLearningOutcome';
import { CurriculumManager } from './curriculumManager';

export default class BiologyCurriculumManager extends CurriculumManager {
    learningOutcomes: BiologyLearningOutcome[] = [];
    units: { [grade: string]: { [unit: string]: string } } = {};

    constructor() {
        super();
        this.units = {};
        this.loadCurriculum();
    }

    private async loadCurriculum() {
        try {
            const response = await fetch('/static/data/biology_curriculum.json');
            if (response.ok) {
                const data = await response.json();
                this.learningOutcomes = data['learning_outcomes'].map((learningOutcome: {
                    specific_learning_outcome: string,
                    general_learning_outcomes: string[],
                    grade: string,
                    id: number,
                    unit: string
                }) =>
                    new BiologyLearningOutcome(
                        learningOutcome.specific_learning_outcome,
                        learningOutcome.general_learning_outcomes,
                        learningOutcome.grade,
                        learningOutcome.id,
                        learningOutcome.unit
                    )
                );
                this.generalOutcomes = data['general_learning_outcomes'];
                this.units = data['units']
            } else {
                console.error('Failed to load learning outcomes:', response.statusText);
            }
        } catch (error) {
            console.error('Error loading learning outcomes:', error);
        }
    }

    filterData({ grade, searchQuery, units, }: { grade?: string, searchQuery?: string, units: string[] }): BiologyLearningOutcome[] {
        return this.learningOutcomes.filter(outcome => {
            grade = grade?.replace('grade_', '');
            grade = grade?.replace('#', '');
            grade = grade?.toUpperCase();

            const matchesGrade = grade ? outcome.grade === grade : true;
            const matchesSearch = searchQuery ?
                outcome.specificLearningOutcome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                outcome.generalLearningOutcomes.some((gloCode: string) => {
                    const glo = this.generalOutcomes[gloCode];
                    return glo ? glo.toLowerCase().includes(searchQuery.toLowerCase()) : false;
                }) ||
                outcome.getID().toLowerCase().includes(searchQuery.toLowerCase())
                : true;
            const matchesunits = units ? units.length > 0 ? units.includes(outcome.unit) : true : true;

            return matchesGrade && matchesSearch && matchesunits;
        });
    }

    public getLearningOutcomeByID(id: string): BiologyLearningOutcome | undefined {
        return this.learningOutcomes.find(outcome => outcome.getID() === id) || undefined;
    }

    public getGeneralOutcomeByCode(code: string): string {
        return this.generalOutcomes[code];
    }

    public getUnits(grade: string): string[] {
        grade = grade?.replace('grade_', '');
        grade = grade?.replace('#', '');
        grade = grade?.toUpperCase();

        return [...new Set(this.learningOutcomes.filter(outcome => outcome.grade === grade).map(outcome => outcome.unit).flat())];
    }

    public async load(): Promise<void> {
        await this.loadCurriculum();
    }

    public getCurriculum(): BiologyLearningOutcome[] {
        return this.learningOutcomes;
    }

    public getAllGrades(): string[] {
        return this.learningOutcomes.map(learningOutcome => learningOutcome.grade);
    }
}
