import BiologyCurriculumManager from "./biologyCurriculumManager";
import { BiologyLearningOutcome } from "./biologyLearningOutcome";
import { distinctiveLearningOutcomesIconDictionary, generalLearningOutcomesIconDictionary, outcomeTypesIconDictionary, scienceClustersIconDictionary, skillsIconDictionary, skillTypesIconDictionary, socialStudiesClustersIconDictionary, unitIconDictionary } from "./icons";
import MathCurriculumManager from "./mathCurriculumManager";
import { MathLearningOutcome } from "./mathLearningOutcome";
import ScienceCurriculumManager from "./scienceCurriculumManager";
import { ScienceLearningOutcome } from "./scienceLearningOutcome";
import SocialStudiesCurriculumManager from "./socialStudiesCurriculumManager";
import { SocialStudiesLearningOutcome } from "./socialStudiesLearningOutcome";
import { SocialStudiesSkill } from "./socialStudiesSkill";

class OutCome {
    id: string;
    grade: string;
    specificLearningOutcome: string;
    generalLearningOutcomes: string[];
    icons: { title: string; name: string }[];
    curriculum: string;

    constructor(
        grade: string,
        specificLearningOutcome: string,
        id: string,
        generalLearningOutcomes: string[],
        curriculum: string,
        icons?: { title: string; name: string }[]) {
        this.grade = grade;
        this.id = id;
        this.specificLearningOutcome = specificLearningOutcome;
        this.generalLearningOutcomes = generalLearningOutcomes;
        this.icons = icons || [];
        this.curriculum = curriculum;
    }
}

export default class OutComeManager {
    public allOutcomes: OutCome[] = [];
    public mathCurriculumManager: MathCurriculumManager;
    public scienceCurriculumManager: ScienceCurriculumManager;
    public biologyCurriculumManager: BiologyCurriculumManager;
    public socialStudiesCurriculumManager: SocialStudiesCurriculumManager;

    constructor() {
        this.mathCurriculumManager = new MathCurriculumManager();
        this.scienceCurriculumManager = new ScienceCurriculumManager();
        this.biologyCurriculumManager = new BiologyCurriculumManager();
        this.socialStudiesCurriculumManager = new SocialStudiesCurriculumManager();
        Promise.all([
            this.mathCurriculumManager.load(),
            this.scienceCurriculumManager.load(),
            this.biologyCurriculumManager.load(),
            this.socialStudiesCurriculumManager.load()
        ]).then(() => {
            this.loadAllOutcomes();
        })
    }

    async loadAllOutcomes(): Promise<void> {
        const mathOutcomesIDs = this.mathCurriculumManager.learningOutcomes.map(outcome => outcome.getID());
        const scienceOutcomesIDs = this.scienceCurriculumManager.learningOutcomes.map(outcome => outcome.getID());
        const biologyOutcomesIDs = this.biologyCurriculumManager.learningOutcomes.map(outcome => outcome.getID());
        const socialStudiesOutcomesIDs = this.socialStudiesCurriculumManager.learningOutcomes.map(outcome => outcome.getID());
        let socialStudiesSkillOutcomesIDs: string[] = [];
        const socialStudiesSkills = this.socialStudiesCurriculumManager.skills;
        socialStudiesSkills.forEach(skill => {
            skill.grades.forEach(grade => {
                socialStudiesSkillOutcomesIDs.push(skill.getID(grade));
            })
        });

        await Promise.all([
            ...mathOutcomesIDs.map(outcomeID => this.getOutcome('math', outcomeID)),
            ...scienceOutcomesIDs.map(outcomeID => this.getOutcome('science', outcomeID)),
            ...biologyOutcomesIDs.map(outcomeID => this.getOutcome('biology', outcomeID)),
            ...socialStudiesOutcomesIDs.map(outcomeID => this.getOutcome('social_studies', outcomeID)),
            ...socialStudiesSkillOutcomesIDs.map(skillID => this.getOutcome('social_studies', skillID))
        ]).then(outcomes => {
            this.allOutcomes.push(...outcomes);
        });
    }

    private getOutcome(curriculum: string, outcomeId: string): OutCome {
        let selectedLearningOutcome: MathLearningOutcome | ScienceLearningOutcome | BiologyLearningOutcome | SocialStudiesLearningOutcome | SocialStudiesSkill | undefined;
        let icons: { title: string; name: string }[] = [];
        if (curriculum === 'math') {
            selectedLearningOutcome = this.mathCurriculumManager.getLearningOutcomeByID(outcomeId) as MathLearningOutcome;
            icons = selectedLearningOutcome.skills.map(skill => ({
                title: this.mathCurriculumManager.skills[skill],
                name: skillsIconDictionary[skill]
            }));
            if (selectedLearningOutcome) {
                return new OutCome(
                    selectedLearningOutcome.grade,
                    selectedLearningOutcome.specificLearningOutcome,
                    selectedLearningOutcome.getID(),
                    [selectedLearningOutcome.generalLearningOutcomes.join('\n')],
                    "math",
                    icons
                );
            }
        } else if (curriculum === 'science') {
            selectedLearningOutcome = this.scienceCurriculumManager.getLearningOutcomeByID(outcomeId) as ScienceLearningOutcome;
            icons.push({
                title: this.scienceCurriculumManager.clusters[selectedLearningOutcome.grade][selectedLearningOutcome.cluster],
                name: scienceClustersIconDictionary[this.scienceCurriculumManager.clusters[selectedLearningOutcome.grade][selectedLearningOutcome.cluster]]
            });
            if (selectedLearningOutcome) {
                return new OutCome(
                    selectedLearningOutcome.grade,
                    selectedLearningOutcome.specificLearningOutcome,
                    selectedLearningOutcome.getID(),
                    selectedLearningOutcome.generalLearningOutcomes.map(outcome => this.scienceCurriculumManager.getGeneralOutcomeByCode(outcome)),
                    "science",
                    icons
                );
            }
        } else if (curriculum === 'biology') {
            selectedLearningOutcome = this.biologyCurriculumManager.getLearningOutcomeByID(outcomeId) as BiologyLearningOutcome;
            icons.push({
                title: this.biologyCurriculumManager.units[selectedLearningOutcome.grade][selectedLearningOutcome.unit],
                name: unitIconDictionary[this.biologyCurriculumManager.units[selectedLearningOutcome.grade][selectedLearningOutcome.unit]]
            });
            if (selectedLearningOutcome) {
                return new OutCome(
                    selectedLearningOutcome.grade,
                    selectedLearningOutcome.specificLearningOutcome,
                    selectedLearningOutcome.getID(),
                    selectedLearningOutcome.generalLearningOutcomes.map(outcome => this.biologyCurriculumManager.getGeneralOutcomeByCode(outcome)),
                    "biology",
                    icons
                );
            }
        } else if (curriculum === 'social_studies') {
            selectedLearningOutcome = this.socialStudiesCurriculumManager.getLearningOutcomeByID(outcomeId) as SocialStudiesLearningOutcome;
            if (selectedLearningOutcome) {
                icons.push({ title: this.socialStudiesCurriculumManager.generalOutcomes[selectedLearningOutcome.generalLearningOutcome], name: generalLearningOutcomesIconDictionary[this.socialStudiesCurriculumManager.generalOutcomes[selectedLearningOutcome.generalLearningOutcome]] });
                icons.push({ title: this.socialStudiesCurriculumManager.clusters[selectedLearningOutcome.grade][selectedLearningOutcome.cluster], name: socialStudiesClustersIconDictionary[this.socialStudiesCurriculumManager.clusters[selectedLearningOutcome.grade][selectedLearningOutcome.cluster]] });
                icons.push({ title: this.socialStudiesCurriculumManager.outcomeTypes[selectedLearningOutcome.outcomeType], name: outcomeTypesIconDictionary[this.socialStudiesCurriculumManager.outcomeTypes[selectedLearningOutcome.outcomeType]] });
                if (selectedLearningOutcome.distinctiveLearningOutcome) {
                    icons.push({ title: this.socialStudiesCurriculumManager.distinctiveLearningOutcomes[selectedLearningOutcome.distinctiveLearningOutcome], name: distinctiveLearningOutcomesIconDictionary[this.socialStudiesCurriculumManager.distinctiveLearningOutcomes[selectedLearningOutcome.distinctiveLearningOutcome]] });
                }
                return new OutCome(
                    selectedLearningOutcome.grade,
                    selectedLearningOutcome.specificLearningOutcome,
                    selectedLearningOutcome.getID(),
                    selectedLearningOutcome.generalLearningOutcomes.map(outcome => this.socialStudiesCurriculumManager.getGeneralOutcomeByCode(outcome)),
                    "social_studies",
                    icons
                );
            }
            let selectedSkill = this.socialStudiesCurriculumManager.getSkillByID(outcomeId) as SocialStudiesSkill;
            if (selectedSkill) {
                icons.push({ title: this.socialStudiesCurriculumManager.skillTypes[selectedSkill.skillType], name: skillTypesIconDictionary[this.socialStudiesCurriculumManager.skillTypes[selectedSkill.skillType]] });
                icons.push({ title: this.socialStudiesCurriculumManager.outcomeTypes[selectedSkill.outcomeType], name: outcomeTypesIconDictionary[this.socialStudiesCurriculumManager.outcomeTypes[selectedSkill.outcomeType]] });
                return new OutCome(
                    selectedSkill.grades.join(', '),
                    selectedSkill.specificLearningOutcome,
                    outcomeId,
                    [selectedSkill.generalLearningOutcome],
                    "social_studies",
                    icons
                );
            }
        }

        return new OutCome(
            'N/A',
            outcomeId,
            outcomeId,
            [],
            "N/A"
        );
    }
}