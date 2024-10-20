import { ScienceLearningOutcome } from './scienceLearningOutcome';
import { CurriculumManager } from './curriculumManager';

export default class ScienceCurriculumManager extends CurriculumManager {
    learningOutcomes: ScienceLearningOutcome[] = [];
    clusters: { [grade: string]: { [cluster: string]: string } } = {};

    constructor() {
        super();
        this.clusters = {};
        this.loadCurriculum();
    }

    private async loadCurriculum() {
        try {
            const response = await fetch('/static/data/science_curriculum.json');
            if (response.ok) {
                const data = await response.json();
                this.learningOutcomes = data['learning_outcomes'].map((learningOutcome: {
                    specific_learning_outcome: string,
                    general_learning_outcomes: string[],
                    grade: string,
                    id: number,
                    cluster: string
                }) =>
                    new ScienceLearningOutcome(learningOutcome.specific_learning_outcome,
                        learningOutcome.general_learning_outcomes,
                        learningOutcome.grade,
                        learningOutcome.id,
                        learningOutcome.cluster
                    )
                );
                this.generalOutcomes = data['general_learning_outcomes'];
                this.clusters = data['clusters']
            } else {
                console.error('Failed to load learning outcomes:', response.statusText);
            }
        } catch (error) {
            console.error('Error loading learning outcomes:', error);
        }
    }

    filterData({ grade, searchQuery, clusters, }: { grade?: string, searchQuery?: string, clusters: string[] }): ScienceLearningOutcome[] {
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
            const matchesClusters = clusters ? clusters.length > 0 ? clusters.includes(outcome.cluster) : true : true;

            return matchesGrade && matchesSearch && matchesClusters;
        });
    }

    public getLearningOutcomeByID(id: string): ScienceLearningOutcome | undefined {
        return this.learningOutcomes.find(outcome => outcome.getID() === id) || undefined;
    }

    public getGeneralOutcomeByCode(code: string): string {
        return this.generalOutcomes[code];
    }

    public getClusters(grade: string): string[] {
        grade = grade?.replace('grade_', '');
        grade = grade?.replace('#', '');
        grade = grade?.toUpperCase();

        return [...new Set(this.learningOutcomes.filter(outcome => outcome.grade === grade).map(outcome => outcome.cluster).flat())];
    }

    public async load(): Promise<void> {
        await this.loadCurriculum();
    }

    public getCurriculum(): ScienceLearningOutcome[] {
        return this.learningOutcomes;
    }

    public getAllGrades(): string[] {
        return this.learningOutcomes.map(learningOutcome => learningOutcome.grade);
    }
}
