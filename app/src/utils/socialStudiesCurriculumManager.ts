import { SocialStudiesLearningOutcome } from './socialStudiesLearningOutcome';
import { SocialStudiesSkill } from './socialStudiesSkill';
import { CurriculumManager } from './curriculumManager';
import { LearningOutcome } from './learningOutcome';

export default class SocialStudiesCurriculumManager extends CurriculumManager {
    learningOutcomes: SocialStudiesLearningOutcome[];
    skills: SocialStudiesSkill[];
    clusters: { [gradeKey: string]: {[clusterKey: string]: string} };
    distinctiveLearningOutcomes: { [key: string]: string }
    outcomeTypes: { [key: string]: string }
    skillTypes: { [key: string]: string }

    constructor() {
        super();
        this.learningOutcomes = []
        this.clusters = {};
        this.skills = [];
        this.distinctiveLearningOutcomes = {}
        this.outcomeTypes = {}
        this.skillTypes = {}
        this.loadCurriculum();
    }

    async loadCurriculum() {
        try {
            const response = await fetch('/static/data/social_studies_curriculum.json');
            if (response.ok) {
                const data = await response.json();
                this.learningOutcomes = data["learning_outcomes"].map((learningOutcome: {
                    specific_learning_outcome: string,
                    general_learning_outcome: string,
                    skills: string[],
                    grade: string,
                    id: string,
                    strand: string,
                    outcome_type: string,
                    distinctive_learning_outcome: string,
                    cluster: string
                }) =>
                    new SocialStudiesLearningOutcome(
                        learningOutcome.specific_learning_outcome,
                        learningOutcome.general_learning_outcome,
                        learningOutcome.outcome_type,
                        learningOutcome.grade,
                        learningOutcome.id,
                        learningOutcome.distinctive_learning_outcome,
                        learningOutcome.cluster
                    )
                );
                this.skills = data["skills"].map((skill: {
                    specific_learning_outcome: string,
                    skill_type: string,
                    grades: string[],
                    id: string
                }) =>
                    new SocialStudiesSkill(
                        skill.specific_learning_outcome,
                        skill.skill_type,
                        skill.grades,
                        skill.id
                    )
                );
                this.generalOutcomes = data["general_learning_outcomes"]
                this.clusters = data["clusters"];
                this.outcomeTypes = data["outcome_types"];
                this.skillTypes = data["skill_types"];
                this.distinctiveLearningOutcomes = data["distinctive_learning_outcomes"];
            } else {
                console.error('Failed to load learning outcomes:', response.statusText);
            }
        } catch (error) {
            console.error('Error loading learning outcomes:', error);
        }
    }

    filterData(grade: string, searchQuery: string, clusters: string[], outComeTypes: string[], skillTypes: string[], distinctiveLearningOutcomes: string[], generalOutcomes: string[]): (SocialStudiesLearningOutcome | SocialStudiesSkill)[] {
        grade = grade?.replace('grade_', '');
        grade = grade?.replace('#', '');
        grade = grade?.toUpperCase();

        const skills = this.skills.filter(skill => {
            const matchesOutcomeType = outComeTypes ? outComeTypes.length > 0 ? outComeTypes.includes(skill.outcomeType) : true : true;
            const matchesSkillType = skillTypes ? skillTypes.length > 0 ? skillTypes.includes(skill.skillType) : true : true;
            const matchesGrade = grade ? skill.grades.includes(grade) : true;
            const matchesSearch = searchQuery ?
                skill.specificLearningOutcome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                skill.generalLearningOutcome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                skill.getID(grade).toLowerCase().includes(searchQuery.toLowerCase()) : true;
            return matchesOutcomeType && matchesGrade && matchesSearch && matchesSkillType;
        });

        const learningOutcomes =  this.learningOutcomes.filter(outcome => {
            const matchesGrade = grade ? outcome.grade === grade : true;
            const matchesSearch = searchQuery ?
                outcome.specificLearningOutcome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                outcome.generalLearningOutcome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                outcome.getID().toLowerCase().includes(searchQuery.toLowerCase()) : true;

            const matchesclusters = clusters ? clusters.length > 0 ? clusters.includes(outcome.cluster) : true : true;
            const matchesOutcomeType = outComeTypes ? outComeTypes.length > 0 ? outComeTypes.includes(outcome.outcomeType) : true : true;
            const matchesDistinctiveLearningOutcome = distinctiveLearningOutcomes ? distinctiveLearningOutcomes.length > 0 ? distinctiveLearningOutcomes.includes(outcome.distinctiveLearningOutcome) : true : true;
            const matchesGeneralOutcomes = generalOutcomes ? generalOutcomes.length > 0 ? generalOutcomes.includes(outcome.generalLearningOutcome) : true : true;

            return matchesGrade && matchesSearch && matchesclusters && matchesOutcomeType && matchesDistinctiveLearningOutcome && matchesGeneralOutcomes;
        });
        return [  ...skills, ...learningOutcomes]
    }

    public getOutcomesByGrade(grade: string): SocialStudiesLearningOutcome[] {
        grade = grade?.replace('#grade_', '');

        return this.learningOutcomes.filter(outcome => outcome.grade === grade);
    }

    public getLearningOutcomeByID(id: string): SocialStudiesLearningOutcome | undefined {
        return this.learningOutcomes.find(outcome => outcome.getID() === id) || undefined;
    }

    public getClusters(grade: string): string[] {
        grade = grade?.replace('#grade_', '');

        return [...new Set(this.learningOutcomes.filter(outcome => outcome.grade === grade).map(outcome => outcome.cluster))].filter(Boolean);
    }

    public getOutcomeTypes(grade: string): string[] {
        return ["S", "K", "V"];
    }

    public getSkillTypes(grade: string): string[] {
        grade = grade?.replace('#grade_', '');
        return [...new Set(this.skills.filter(outcome => outcome.grades.includes(grade)).map(outcome => outcome.skillType))].filter(Boolean);
    }

    public getGeneralOutcomes(grade: string): string[] {
        grade = grade?.replace('#grade_', '');

        return [...new Set(this.learningOutcomes.filter(outcome => outcome.grade === grade).map(outcome => outcome.generalLearningOutcome).flat())].filter(Boolean);
    }
    public getDistinctiveLearningOutcome(grade: string): string[] {
        grade = grade?.replace('#grade_', '');

        return [...new Set(this.learningOutcomes.filter(outcome => outcome.grade === grade).map(outcome => outcome.distinctiveLearningOutcome).flat())].filter(Boolean);
    }

    public async load(): Promise<void> {
        await this.loadCurriculum();
    }

    public getCurriculum(): SocialStudiesLearningOutcome[] {
        return this.learningOutcomes;
    }

    public getAllGrades(): string[] {
        return this.learningOutcomes.map(learningOutcome => learningOutcome.grade);
    }
}
