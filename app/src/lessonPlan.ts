import 'beercss';
import 'material-dynamic-colors';
import '../static/css/printout-style.css';
import '../static/css/theme.css';
import { Creator, QRContent, QRMode, Renderer, ErrorCorrectionLevel, MaskPattern } from 'easy-qrcode';
import MathCurriculumManager from "./utils/mathCurriculumManager";
import BiologyCurriculumManager from "./utils/biologyCurriculumManager";
import ScienceCurriculumManager from "./utils/scienceCurriculumManager";
import SocialStudiesCurriculumManager from "./utils/socialStudiesCurriculumManager";
import { MathLearningOutcome } from './utils/mathLearningOutcome';
import { ScienceLearningOutcome } from './utils/scienceLearningOutcome';
import { BiologyLearningOutcome } from './utils/biologyLearningOutcome';
import { SocialStudiesLearningOutcome } from './utils/socialStudiesLearningOutcome';
import { distinctiveLearningOutcomesIconDictionary, generalLearningOutcomesIconDictionary, outcomeTypesIconDictionary, scienceClustersIconDictionary, skillsIconDictionary, skillTypesIconDictionary, socialStudiesClustersIconDictionary, unitIconDictionary } from './utils/icons';
import { SocialStudiesSkill } from './utils/socialStudiesSkill';
import { LessonPlanTemplate } from './utils/lessonPlan';
import { isTrustworthyResource } from './utils/trustworthyDomains';
import { getMetadata } from './utils/getMetadata';

class OutCome {
    id: string;
    specificLearningOutcome: string;
    generalLearningOutcomes: string[];
    icons: { title: string; name: string }[];
    constructor(specificLearningOutcome: string, id: string, generalLearningOutcomes: string[], icons?: { title: string; name: string }[]) {
        this.id = id;
        this.specificLearningOutcome = specificLearningOutcome;
        this.generalLearningOutcomes = generalLearningOutcomes;
        this.icons = icons || [];
    }
}

class LessonPlan {
    topicTitle: HTMLInputElement;
    lessonName: HTMLInputElement;
    gradeLevel: HTMLSelectElement;
    timeLength: HTMLInputElement;
    date: HTMLInputElement;
    authorName: HTMLInputElement;
    curricularOutcomes: HTMLElement;
    addCurricularOutcome: HTMLButtonElement;
    crossCurricularConnections: HTMLTextAreaElement;
    assessmentEvidence: HTMLTableSectionElement;
    addAssessmentEvidenceRow: HTMLButtonElement;
    materialsConsidered: HTMLTextAreaElement;
    resourceLinks: HTMLDivElement;
    addResourceLinkButton: HTMLButtonElement;
    studentSpecificPlanning: HTMLTextAreaElement;
    learningPlan: HTMLTableElement;
    activate: HTMLTextAreaElement;
    activateTimeLength: HTMLSelectElement;
    acquire: HTMLTextAreaElement;
    acquireTimeLength: HTMLSelectElement;
    apply: HTMLTextAreaElement;
    applyTimeLength: HTMLSelectElement;
    closure: HTMLTextAreaElement;
    closureTimeLength: HTMLSelectElement;
    reflections: HTMLTextAreaElement;
    mathCurriculumManager: MathCurriculumManager;
    scienceCurriculumManager: ScienceCurriculumManager;
    biologyCurriculumManager: BiologyCurriculumManager;
    socialStudiesCurriculumManager: SocialStudiesCurriculumManager;
    copyContentButton: HTMLButtonElement;
    saveButton: HTMLButtonElement;
    saveButtonBadge: HTMLElement;
    shareButton: HTMLButtonElement;
    publishButton: HTMLButtonElement;
    outcomes: OutCome[];
    allOutcomes: OutCome[];
    private db: IDBDatabase | null = null;
    private usesChromeStorage: boolean = false;

    constructor() {
        this.topicTitle = document.getElementById('topic-title') as HTMLInputElement;
        this.lessonName = document.getElementById('lesson-name') as HTMLInputElement;
        this.gradeLevel = document.getElementById('grade-level') as HTMLSelectElement;
        this.timeLength = document.getElementById('time-length') as HTMLInputElement;
        this.date = document.getElementById('date') as HTMLInputElement;
        this.authorName = document.getElementById('author-name') as HTMLInputElement;
        this.curricularOutcomes = document.getElementById('curricular-outcomes') as HTMLElement;
        this.addCurricularOutcome = document.getElementById('add-curricular-outcome') as HTMLButtonElement;
        this.crossCurricularConnections = document.getElementById('cross-curricular-connections') as HTMLTextAreaElement;
        this.assessmentEvidence = document.querySelector('#assessment-evidence tbody') as HTMLTableSectionElement;
        this.addAssessmentEvidenceRow = document.getElementById('add-row-button') as HTMLButtonElement;
        this.materialsConsidered = document.getElementById('materials-considered') as HTMLTextAreaElement;
        this.resourceLinks = document.getElementById('resource-links') as HTMLDivElement;
        this.addResourceLinkButton = document.getElementById('add-resource-link') as HTMLButtonElement;
        this.studentSpecificPlanning = document.getElementById('student-specific-planning') as HTMLTextAreaElement;
        this.learningPlan = document.getElementById('learning-plan') as HTMLTableElement;
        this.activate = document.getElementById('activate') as HTMLTextAreaElement;
        this.activateTimeLength = document.getElementById('activate-time-length') as HTMLSelectElement;
        this.acquire = document.getElementById('acquire') as HTMLTextAreaElement;
        this.acquireTimeLength = document.getElementById('acquire-time-length') as HTMLSelectElement;
        this.apply = document.getElementById('apply') as HTMLTextAreaElement;
        this.applyTimeLength = document.getElementById('apply-time-length') as HTMLSelectElement;
        this.closure = document.getElementById('closure') as HTMLTextAreaElement;
        this.closureTimeLength = document.getElementById('closure-time-length') as HTMLSelectElement;
        this.reflections = document.getElementById('reflections') as HTMLTextAreaElement;
        this.copyContentButton = document.getElementById('copy-content-button') as HTMLButtonElement;
        this.saveButton = document.getElementById('save-button') as HTMLButtonElement;
        this.saveButtonBadge = document.getElementById('save-button-badge') as HTMLElement;
        this.shareButton = document.getElementById('share-button') as HTMLButtonElement;
        this.publishButton = document.getElementById('publish-button') as HTMLButtonElement;
        this.mathCurriculumManager = new MathCurriculumManager();
        this.scienceCurriculumManager = new ScienceCurriculumManager();
        this.biologyCurriculumManager = new BiologyCurriculumManager();
        this.socialStudiesCurriculumManager = new SocialStudiesCurriculumManager();
        this.outcomes = [];
        this.allOutcomes = [];
    }

    init() {
        this.date.value = new Date().toISOString().split('T')[0];
        Promise.all([
            this.mathCurriculumManager.load(),
            this.scienceCurriculumManager.load(),
            this.biologyCurriculumManager.load(),
            this.socialStudiesCurriculumManager.load()
        ]).then(() => {
            this.loadAllOutcomes().then(() => {
                const hash = window.location.hash.replace('#', '');
                if (hash) {
                    this.loadLessonPlanByHash(hash);
                }
            });
        });
        this.gradeLevel.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
        });
        this.timeLength.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
        });
        this.date.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
        });
        this.addAssessmentEvidenceRow.addEventListener('click', () => {
            this.addNewAssessmentEvidenceRowFunction();
            this.saveButtonBadge.classList.remove('hidden')
        });
        this.addCurricularOutcome.addEventListener('click', () => {
            this.addCurricularOutcomeFunction();
            this.saveButtonBadge.classList.remove('hidden')
        });
        this.copyContentButton.addEventListener('click', () => {
            this.copyPageContent();
        });
        this.saveButton.addEventListener('click', () => {
            this.saveLessonPlan();
            ui('#snackbar-saved', 2000);
        });
        this.shareButton.addEventListener('click', () => {
            this.shareLessonPlan();
        });
        this.publishButton.addEventListener('click', () => {
            this.publishLessonPlan();
            ui('#snackbar-published', 2000);
        });
        this.authorName.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
            if (!this.authorName.value) {
                this.authorName.parentElement?.classList.add('invalid');
            } else {
                this.authorName.parentElement?.classList.remove('invalid');
            }
            localStorage.setItem('authorName', this.authorName.value);
            document.title = `${this.topicTitle.value} by ${this.authorName.value}`;
        });
        this.addResourceLinkButton.addEventListener('click', () => {
            this.saveButtonBadge.classList.remove('hidden')
            this.addNewResourceLink();
        });
        this.materialsConsidered.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
        });
        this.crossCurricularConnections.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
        });
        this.studentSpecificPlanning.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
        });
        this.reflections.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
        });
        this.activate.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
        });
        this.acquire.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
        });
        this.apply.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
        });
        this.closure.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
        });
        this.lessonName.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
            // document.title = `${this.topicTitle.value} by ${this.authorName.value}`;
        });
        this.topicTitle.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
            document.title = `${this.topicTitle.value} by ${this.authorName.value}`;
        });
        this.authorName.value = localStorage.getItem('authorName') || '';
        const request = indexedDB.open('LessonPlansDB', 1);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('lessonPlans')) {
                db.createObjectStore('lessonPlans', { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            this.db = (event.target as IDBOpenDBRequest).result;
        };
        this.generateQRCode();
    }

    generateQRCode(){
        const qrCreator = new Creator({
            version: 4,
            enableECI: false,
            errorCorrectionLevel: ErrorCorrectionLevel.M,
            maskPattern: MaskPattern.PATTERN000,
        });
        const pageUrl = window.location.href;
        qrCreator.add(pageUrl);
        qrCreator.create();
        const matrix = qrCreator.getMatrix();
        const qrRenderer = new Renderer();
        const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
        const qrSize = matrix.length * 6;
        canvas.width = qrSize;
        canvas.height = qrSize;
        qrRenderer.drawCanvas(matrix, canvas);
    }

    copyPageContent() {
        let content = '';
        content += 'Topic Title: ' + this.topicTitle.value + '\n';
        content += 'Lesson Name: ' + this.lessonName.value + '\n';
        content += 'Grade Level: ' + this.gradeLevel.value + '\n';
        content += 'Time Length: ' + this.timeLength.value + '\n';
        content += 'Date: ' + this.date.value + '\n';
        content += 'Author Name: ' + this.authorName.value + '\n';
        content += 'Cross Curricular Connections: ' + this.crossCurricularConnections.value + '\n';
        content += 'Materials Considered: ' + this.materialsConsidered.value + '\n';
        content += 'Student Specific Planning: ' + this.studentSpecificPlanning.value + '\n';
        this.outcomes.forEach(outcome => {
            content += `Learning Outcome: ${outcome.id}. ${outcome.specificLearningOutcome}\n`;
            outcome.generalLearningOutcomes.forEach(generalLearningOutcome => {
                content += `    General Learning Outcome: ${generalLearningOutcome}\n`;
            });
        });
        content += 'Assessment Evidence: \n';
        this.assessmentEvidence.querySelectorAll('tr').forEach(row => {
            const description = row.querySelector('#description') as HTMLInputElement;
            const forLearning = row.querySelector('#for-learning') as HTMLInputElement;
            const asLearning = row.querySelector('#as-learning') as HTMLInputElement;
            const ofLearning = row.querySelector('#of-learning') as HTMLInputElement;
            content += '    ' + description.value + '\n';
            content += '    For Learning: true/false\n';
            content += '    As Learning: true/false\n';
            content += '    Of Learning: true/false\n';
        });
        content += 'Learning Plan: \n';
        content += '    Activate: ' + this.activate.value + '\n';
        content += '    Activate Time: ' + this.activateTimeLength.value + '\n';
        content += '    Acquire: ' + this.acquire.value + '\n';
        content += '    Acquire Time: ' + this.acquireTimeLength.value + '\n';
        content += '    Apply: ' + this.apply.value + '\n';
        content += '    Apply Time: ' + this.applyTimeLength.value + '\n';
        content += '    Closure: ' + this.closure.value + '\n';
        content += '    Closure Time: ' + this.closureTimeLength.value + '\n';
        content += 'Reflections: ' + this.reflections.value + '\n';

        navigator.clipboard.writeText(content);
        ui('#snackbar-share', 2000)
    }

    async saveLessonPlan(): Promise<LessonPlanTemplate> {
        this.saveButtonBadge.classList.add('hidden')
        const hashtag = window.location.hash.replace('#', '');
        let assessmentEvidence: { description: string, forLearning: boolean, asLearning: boolean, ofLearning: boolean }[] = [];
        let outcomes = this.outcomes.map(outcome => outcome.id);
        let outcomesDict: { [key: string]: string } = {};
        const generalLearningOutcomes = document.querySelectorAll('#general-learning-outcomes') as NodeListOf<HTMLTextAreaElement>;
        outcomes.forEach(outcome => {
            generalLearningOutcomes.forEach(generalLearningOutcome => {
                const outcomeId = generalLearningOutcome.dataset.outcome;
                if (outcomeId === outcome) {
                    outcomesDict[outcome] = generalLearningOutcome.value;
                }
            });
        });
        this.assessmentEvidence.querySelectorAll('tr').forEach(row => {
            const description = row.querySelector('#description') as HTMLInputElement;
            const forLearning = row.querySelector('#for-learning') as HTMLInputElement;
            const asLearning = row.querySelector('#as-learning') as HTMLInputElement;
            const ofLearning = row.querySelector('#of-learning') as HTMLInputElement;
            assessmentEvidence.push({
                description: description.value,
                forLearning: forLearning.checked,
                asLearning: asLearning.checked,
                ofLearning: ofLearning.checked
            });
        });
        let resourceLinks: string[] = [];
        const resourceLinksInput = this.resourceLinks.querySelectorAll('#resource-link') as NodeListOf<HTMLInputElement>;
        resourceLinksInput.forEach(resourceLink => {
            if (isTrustworthyResource(resourceLink.value)) {
                resourceLinks.push(resourceLink.value);
            }
        });

        // Create lesson plan object
        const lessonPlan: LessonPlanTemplate = {
            id: hashtag,
            authorName: this.authorName.value,
            topicTitle: this.topicTitle.value,
            lessonName: this.lessonName.value,
            gradeLevel: this.gradeLevel.value,
            timeLength: this.timeLength.value,
            date: this.date.value,
            outcomes: outcomesDict,
            crossCurricularConnections: this.crossCurricularConnections.value,
            materialsConsidered: this.materialsConsidered.value,
            studentSpecificPlanning: this.studentSpecificPlanning.value,
            reflections: this.reflections.value,
            activate: this.activate.value,
            activateTime: this.activateTimeLength.value,
            acquire: this.acquire.value,
            acquireTime: this.acquireTimeLength.value,
            apply: this.apply.value,
            applyTime: this.applyTimeLength.value,
            closure: this.closure.value,
            closureTime: this.closureTimeLength.value,
            assessmentEvidence: assessmentEvidence,
            modifiedDate: new Date().toString(),
            resourceLinks: resourceLinks
        };

        // Save to local storage (IndexedDB or Chrome Storage)
        if (this.usesChromeStorage) {
            chrome.storage.sync.set({ [hashtag]: lessonPlan }, () => {
                console.log(`Lesson plan saved locally with ID: ${hashtag}`);
            });
        } else {
            if (!this.db) {
                console.error('Database not initialized');
                return lessonPlan;
            }

            const transaction = this.db.transaction(['lessonPlans'], 'readwrite');
            const store = transaction.objectStore('lessonPlans');
            const request = store.put(lessonPlan);

            request.onsuccess = () => {
                console.log(`Lesson plan saved locally with ID: ${hashtag}`);
            };

            request.onerror = (event) => {
                console.error('Error saving lesson plan locally:', event);
            };
        }
        return lessonPlan;
    }

    async shareLessonPlan() {
        const hashtag = window.location.hash.replace('#', '');
        const shareLink = `${window.location.origin}${window.location.pathname}#${hashtag}`;
        await this.publishLessonPlan();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Lesson Plan',
                    text: 'Check out this lesson plan by ' + this.authorName.value,
                    url: shareLink
                });
            } catch (error) {
                console.error('Error sharing content:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareLink);
                ui('#snackbar-share', 2000);
            } catch (error) {
                console.error('Failed to copy link to clipboard:', error);
            }
        }
    }

    async uploadLessonPlan(lessonPlan: LessonPlanTemplate): Promise<boolean> {
        try {
            const response = await fetch('https://pinecone.synology.me/curiki', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(lessonPlan)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.status === 'success') {
                return true;
            } else {
                throw new Error(result.message || 'Failed to upload lesson plan');
            }
        } catch (error) {
            console.error('Error uploading lesson plan:', error);
            ui('#snackbar-failed-upload', 2000);
            return false;
        }
    }

    async publishLessonPlan() {
        this.saveLessonPlan().then(lessonPlan => {
            this.uploadLessonPlan(lessonPlan);
            lessonPlan.resourceLinks.forEach(async (resourceLink) => {
                await getMetadata(resourceLink);
            });
        });
    }

    async loadLessonPlanByHash(hashtag: string) {
        try {
            let onlinePlan: any = null;
            let localPlan: any = null;

            // Fetch the online lesson plan
            const response = await fetch(`https://pinecone.synology.me/curiki?id=${hashtag}`);
            if (response.ok) {
                const result = await response.json();
                if (result.status === 'success' && result.data) {
                    onlinePlan = result.data;
                }
            } else {
                console.error(`HTTP error! status: ${response.status}`);
            }

            if (this.usesChromeStorage) {
                localPlan = await new Promise((resolve) => {
                    chrome.storage.sync.get([hashtag], (result) => {
                        resolve(result[hashtag] || null);
                    });
                });
            } else if (this.db) {
                localPlan = await new Promise((resolve, reject) => {
                    if (!this.db) {
                        console.error('Database not initialized');
                        return;
                    }
                    const transaction = this.db.transaction(['lessonPlans'], 'readonly');
                    const store = transaction.objectStore('lessonPlans');
                    const request = store.get(hashtag);

                    request.onsuccess = () => resolve(request.result || null);
                    request.onerror = () => reject('Error fetching from IndexedDB');
                });
            }

            // Compare modified dates and populate the most recent plan
            let selectedPlan = null;

            if (onlinePlan && localPlan) {
                const onlineDate = new Date(onlinePlan.modifiedDate).getTime();
                const localDate = new Date(localPlan.modifiedDate).getTime();
                selectedPlan = onlineDate > localDate ? onlinePlan : localPlan;
            } else if (onlinePlan) {
                selectedPlan = onlinePlan;
            } else if (localPlan) {
                selectedPlan = localPlan;
            }

            if (selectedPlan) {
                this.populateLessonPlan(selectedPlan);

                // Additional logic for author name
                this.authorName.value = selectedPlan.authorName;
                const savedAuthorName = localStorage.getItem('authorName') || "";
                if (!selectedPlan.authorName.includes(savedAuthorName)) {
                    this.authorName.disabled = true;
                    this.shareButton.classList.add('hidden');
                    this.publishButton.classList.add('hidden');
                    this.saveButton.classList.add('hidden');
                }

                // Snackbar notifications
                if (selectedPlan === onlinePlan) {
                    ui('#snackbar-loaded-from-server', 2000);
                } else {
                    ui('#snackbar-loaded-from-local-storage', 2000);
                }
            } else {
                console.error('No lesson plan found locally or online.');
            }
        } catch (error) {
            console.error('Error loading lesson plan:', error);
        }
    }

    private populateLessonPlan(lessonPlan: LessonPlanTemplate) {
        this.topicTitle.value = lessonPlan.topicTitle;
        this.lessonName.value = lessonPlan.lessonName;
        this.gradeLevel.value = lessonPlan.gradeLevel;
        this.timeLength.value = lessonPlan.timeLength;
        this.date.value = lessonPlan.date;
        this.crossCurricularConnections.value = lessonPlan.crossCurricularConnections;
        this.materialsConsidered.value = lessonPlan.materialsConsidered;
        this.studentSpecificPlanning.value = lessonPlan.studentSpecificPlanning;
        this.activate.value = lessonPlan.activate;
        this.activateTimeLength.value = lessonPlan.activateTime;
        this.acquire.value = lessonPlan.acquire;
        this.acquireTimeLength.value = lessonPlan.acquireTime;
        this.apply.value = lessonPlan.apply;
        this.applyTimeLength.value = lessonPlan.applyTime;
        this.closure.value = lessonPlan.closure;
        this.closureTimeLength.value = lessonPlan.closureTime;
        this.reflections.value = lessonPlan.reflections;
        this.outcomes = this.allOutcomes.filter(outcome => Object.keys(lessonPlan.outcomes).includes(outcome.id));
        document.title = `${lessonPlan.topicTitle} by ${lessonPlan.authorName}`;

        this.loadLearningOutcomes();

        if (lessonPlan.assessmentEvidence.length === 0) {
            this.addNewAssessmentEvidenceRowFunction();
        } else {
            lessonPlan.assessmentEvidence.forEach((evidence: { description: string, forLearning: boolean, asLearning: boolean, ofLearning: boolean }) => {
                this.addAssessmentEvidenceRowFunction(evidence.description, evidence.forLearning, evidence.asLearning, evidence.ofLearning);
            });
        }

        if (lessonPlan.resourceLinks.length === 0) {
            this.addNewResourceLink();
        } else {
            lessonPlan.resourceLinks.forEach(resourceLink => {
                this.addResourceLink(resourceLink);
            });
        }
        const generalLearningOutcomes = document.querySelectorAll('#general-learning-outcomes') as NodeListOf<HTMLTextAreaElement>;
        this.outcomes.forEach(outcome => {
            generalLearningOutcomes.forEach(generalLearningOutcome => {
                const outcomeId = generalLearningOutcome.dataset.outcome;
                if (outcomeId === outcome.id && lessonPlan.outcomes[outcomeId]) {
                    generalLearningOutcome.value = lessonPlan.outcomes[outcomeId];
                }
            });
        });
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
                    selectedLearningOutcome.specificLearningOutcome,
                    selectedLearningOutcome.getID(),
                    [selectedLearningOutcome.generalLearningOutcomes.join('\n')],
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
                    selectedLearningOutcome.specificLearningOutcome,
                    selectedLearningOutcome.getID(),
                    selectedLearningOutcome.generalLearningOutcomes.map(outcome => this.scienceCurriculumManager.getGeneralOutcomeByCode(outcome)),
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
                    selectedLearningOutcome.specificLearningOutcome,
                    selectedLearningOutcome.getID(),
                    selectedLearningOutcome.generalLearningOutcomes.map(outcome => this.biologyCurriculumManager.getGeneralOutcomeByCode(outcome)),
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
                    selectedLearningOutcome.specificLearningOutcome,
                    selectedLearningOutcome.getID(),
                    selectedLearningOutcome.generalLearningOutcomes.map(outcome => this.socialStudiesCurriculumManager.getGeneralOutcomeByCode(outcome)),
                    icons
                );
            }
            let selectedSkill = this.socialStudiesCurriculumManager.getSkillByID(outcomeId) as SocialStudiesSkill;
            if (selectedSkill) {
                icons.push({ title: this.socialStudiesCurriculumManager.skillTypes[selectedSkill.skillType], name: skillTypesIconDictionary[this.socialStudiesCurriculumManager.skillTypes[selectedSkill.skillType]] });
                icons.push({ title: this.socialStudiesCurriculumManager.outcomeTypes[selectedSkill.outcomeType], name: outcomeTypesIconDictionary[this.socialStudiesCurriculumManager.outcomeTypes[selectedSkill.outcomeType]] });
                return new OutCome(
                    selectedSkill.specificLearningOutcome,
                    outcomeId,
                    [selectedSkill.generalLearningOutcome],
                    icons
                );
            }
        }

        return new OutCome(
            outcomeId,
            outcomeId,
            []
        );
    }

    addCurricularOutcomeFunction() {
        this.saveButtonBadge.classList.remove('hidden')
        let firstOutcome = this.allOutcomes[0];
        let generalOutcome = firstOutcome.generalLearningOutcomes.join('\n');

        if (!firstOutcome) {
            console.error("No outcomes found for the selected curriculum.");
            return;
        }

        this.outcomes.push(firstOutcome);

        this.curricularOutcomes.appendChild(this.getLearningOutcomeElement(firstOutcome, generalOutcome));
    }

    addNewAssessmentEvidenceRowFunction() {
        const newRow = document.createElement('tr') as HTMLTableRowElement;

        newRow.innerHTML = `
            <td>
                <div class="field border textarea extra min">
                    <textarea class="small-padding" id="description"></textarea>
                </div>
            </td>
            <td>
                <label class="checkbox">
                    <input id="for-learning" type="checkbox">
                    <span></span>
                </label>
            </td>
            <td>
                <label class="checkbox">
                    <input id="as-learning" type="checkbox">
                    <span></span>
                </label>
            </td>
            <td>
                <label class="checkbox">
                    <input id="of-learning" type="checkbox">
                    <span></span>
                </label>
            </td>
            <td class="delete-row-button">
                <button class="circle delete-row-button"><i>delete</i></button>
            </td>
        `;

        const deleteButton = newRow.querySelector('.delete-row-button') as HTMLButtonElement;
        deleteButton.addEventListener('click', () => {
            // Remove the row when the delete button is clicked
            this.saveButtonBadge.classList.remove('hidden')
            this.assessmentEvidence.removeChild(newRow);
        });
        // Append the new row to the table body
        this.assessmentEvidence.appendChild(newRow);
    }

    addAssessmentEvidenceRowFunction(description: string, forLearning: boolean, asLearning: boolean, ofLearning: boolean) {
        this.addNewAssessmentEvidenceRowFunction();
        const newRow = this.assessmentEvidence.querySelector('tr:last-child') as HTMLTableRowElement;
        const descriptionInput = newRow.querySelector('#description') as HTMLInputElement;
        const forLearningInput = newRow.querySelector('#for-learning') as HTMLInputElement;
        const asLearningInput = newRow.querySelector('#as-learning') as HTMLInputElement;
        const ofLearningInput = newRow.querySelector('#of-learning') as HTMLInputElement;
        descriptionInput.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
        });
        forLearningInput.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
        });
        asLearningInput.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
        });
        ofLearningInput.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
        });
        descriptionInput.value = description;
        forLearningInput.checked = forLearning;
        asLearningInput.checked = asLearning;
        ofLearningInput.checked = ofLearning;
    }

    addNewResourceLink() {
        const newRow = document.createElement('div');
        newRow.classList.add('row', 'bottom-margin');
        newRow.innerHTML = `
            <div class="field prefix border suffix label max bottom-margin">
                <i>link</i>
                <input id="resource-link">
                <label>Link</label>
                <a class="small-round wave link transparent" id="open-resource-link">
                    <i>open_in_new</i>
                </a>
                <span class="error hidden" id="resource-link-error"></span>
            </div>
            <button class="circle delete-row-button bottom-margin" id="delete-resource-link">
                <i>delete</i>
            </button>`

        const openButton = newRow.querySelector('#open-resource-link') as HTMLAnchorElement;
        openButton.target = '_blank';

        const resourceLinkInput = newRow.querySelector('#resource-link') as HTMLInputElement;
        resourceLinkInput.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
            const isTrustworthy = isTrustworthyResource(resourceLinkInput.value);
            openButton.href = resourceLinkInput.value;
            if (resourceLinkInput.parentElement) {
                resourceLinkInput.parentElement.classList.toggle('invalid', !isTrustworthy);
            }
            const resourceLinkError = newRow.querySelector('#resource-link-error') as HTMLSpanElement;
            resourceLinkError.textContent = isTrustworthy ? '' : 'This url is not secure.';
            resourceLinkError.classList.toggle('hidden', isTrustworthy);
        });

        const deleteButton = newRow.querySelector('#delete-resource-link') as HTMLButtonElement;
        deleteButton.addEventListener('click', () => {
            this.saveButtonBadge.classList.remove('hidden')
            this.resourceLinks.removeChild(newRow);
        });
        this.resourceLinks.appendChild(newRow);
    }

    addResourceLink(resourceLink: string) {
        this.addNewResourceLink();
        const newRow = this.resourceLinks.querySelector('div:last-child') as HTMLDivElement;
        const resourceLinkInput = newRow.querySelector('#resource-link') as HTMLInputElement;
        const openButton = newRow.querySelector('#open-resource-link') as HTMLAnchorElement;
        openButton.href = resourceLink;
        resourceLinkInput.value = resourceLink;
    }

    getLearningOutcomeElement(outcome: OutCome, generalLearningOutcome?: string): HTMLDetailsElement {
        const details = document.createElement('details');
        details.classList.add('no-padding', 'bottom-margin', 'border', 'page-break-inside');
        details.setAttribute('open', '');

        // Create <summary> element
        const summary = document.createElement('summary');
        summary.classList.add('row', 'padding');

        // Create <button> for the learning outcome ID
        const outcomeButton = document.createElement('button');
        outcomeButton.classList.add('chip');
        outcomeButton.textContent = outcome.id;

        // Create <div> for the title (Specific Learning Outcome)
        const maxDiv = document.createElement('div');
        maxDiv.classList.add('max');
        const title = document.createElement('h6');
        title.classList.add('small');
        title.textContent = outcome.specificLearningOutcome;

        // Append title to max div
        maxDiv.appendChild(title);

        // Create <div> for the icons
        const iconContainer = document.createElement('div');
        outcome.icons.forEach(icon => {
            const chip = document.createElement('button');
            chip.classList.add('chip', 'tiny-margin');
            const iconElement = document.createElement('i');
            const chipText = document.createElement('span');
            chipText.textContent = icon.title;
            iconElement.innerText = icon.name;
            chip.appendChild(iconElement);
            chip.appendChild(chipText);
            iconContainer.appendChild(chip);
        });

        const deleteButton = document.createElement('button');
        const deleteButtonIcon = document.createElement('i');
        deleteButtonIcon.innerText = "delete"
        deleteButton.classList.add('circle', 'delete-row-button')
        deleteButton.appendChild(deleteButtonIcon);
        deleteButton.addEventListener('click', () => {
            this.saveButtonBadge.classList.remove('hidden')
            const index = this.outcomes.findIndex(out => out.id === outcome.id);
            if (index > -1) {
                this.outcomes.splice(index, 1);
                this.curricularOutcomes.removeChild(details);
            }
        })

        // Append button, title, and icons to the summary content
        summary.appendChild(outcomeButton);
        summary.appendChild(maxDiv);
        summary.appendChild(deleteButton)

        // Create <div> for content under the summary
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('padding');

        contentDiv.appendChild(iconContainer)

        // Create <p> for the description
        const description = document.createElement('p');
        description.classList.add('no-line');
        description.textContent = "The following set of indicators may be used to determine whether the students have met the corresponding specific outcome.";
        contentDiv.appendChild(description);

        // Create <div> for the textarea
        const textareaDiv = document.createElement('div');
        textareaDiv.classList.add('field', 'border', 'textarea', 'extra', 'min', 'no-margin');

        const textarea = document.createElement('textarea');
        textarea.classList.add('small-padding');
        textarea.id = 'general-learning-outcomes';
        textarea.dataset.outcome = outcome.id;
        if (generalLearningOutcome) {
            textarea.value = generalLearningOutcome;
        }else{
            textarea.value = outcome.generalLearningOutcomes.join('\n');
        }
        textarea.addEventListener('input', () => {
            this.saveButtonBadge.classList.remove('hidden')
        });
        textareaDiv.appendChild(textarea);

        outcomeButton.addEventListener('click', () => {
            const modal = document.createElement('dialog');
            modal.classList.add('modal'); // Ensure you have corresponding CSS styles for the modal.
            modal.id = 'outcome-selector-modal';
            modal.innerHTML = `
                <div>
                    <h5>Select a New Outcome</h5>

                    <div class="field border label">
                        <select id="outcome-selector">
                            ${this.allOutcomes.map(outcomeId => `<option value="${outcomeId.id}">${outcomeId.id}</option>`).join('')}
                        </select>
                        <label>Select an outcome</label>
                    </div>
                    <div class="grid">
                        <button class="s6" id="confirm-outcome">Confirm</button>
                        <button class="s6" id="cancel-outcome">Cancel</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.showModal();

            const confirmButton = modal.querySelector('#confirm-outcome') as HTMLButtonElement;
            const cancelButton = modal.querySelector('#cancel-outcome') as HTMLButtonElement;
            const outcomeSelector = modal.querySelector('#outcome-selector') as HTMLSelectElement;

            confirmButton.addEventListener('click', () => {
                const selectedOutcomeId = outcomeSelector.value;
                if (selectedOutcomeId) {
                    this.saveButtonBadge.classList.remove('hidden')
                    const currentIndex = this.outcomes.findIndex(o => o.id === outcome.id);
                    if (currentIndex !== -1) {
                        this.outcomes.splice(currentIndex, 1); // Remove the old outcome
                    }

                    let newOutcome = this.allOutcomes.find(o => o.id === selectedOutcomeId);

                    if (!newOutcome) {
                        return;
                    }
                    this.outcomes.push(newOutcome);
                    outcomeButton.textContent = newOutcome.id;
                    textarea.value = newOutcome.generalLearningOutcomes.join('\n');
                    textarea.dataset.outcome = newOutcome.id;
                    // this.loadLearningOutcomes();
                    document.body.removeChild(modal);
                    modal.close();
                }
            });

            cancelButton.addEventListener('click', () => {
                document.body.removeChild(modal);
                modal.close();
            });
        });
        contentDiv.appendChild(textareaDiv);
        details.appendChild(summary);
        details.appendChild(contentDiv);
        return details
    }

    loadLearningOutcomes() {
        this.curricularOutcomes.innerHTML = "";
        this.outcomes.forEach(outcome => {
            this.curricularOutcomes.appendChild(this.getLearningOutcomeElement(outcome));
        });
    }

    async getAllLessonPlans(): Promise<any[]> {
        if (this.usesChromeStorage) {
            return new Promise((resolve, reject) => {
                chrome.storage.sync.get(null, (items) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(Object.values(items));
                    }
                });
            });
        } else {
            // Existing IndexedDB implementation
            return new Promise((resolve, reject) => {
                if (!this.db) {
                    reject('Database not initialized');
                    return;
                }

                const transaction = this.db.transaction(['lessonPlans'], 'readonly');
                const store = transaction.objectStore('lessonPlans');
                const request = store.getAll();

                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = () => {
                    reject('Error fetching lesson plans');
                };
            });
        }
    }
}

function setTheme(theme: string) {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);

    const themeIcon = document.getElementById("theme-icon") as HTMLElement;
    themeIcon.innerText = theme === "light" ? "dark_mode" : "light_mode";

    const icons = document.querySelectorAll('.icon') as NodeListOf<HTMLElement>;

    if (theme === 'light') {
        icons.forEach(icon => {
            icon.style.filter = 'invert(1)';
        });
    } else {
        icons.forEach(icon => {
            icon.style.filter = 'invert(0)';
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const themeToggle = document.getElementById("theme-toggle") as HTMLInputElement;
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.body.classList.contains("dark") ?
            "dark" :
            "light";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        setTheme(newTheme);
    });

    themeToggle.checked = localStorage.getItem("theme") === "dark";

    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    const lessonPlan = new LessonPlan()
    lessonPlan.init();
});

window.onbeforeprint = function () {
    document.body.classList.remove("light", "dark");
    document.body.classList.add("light");
};

window.onafterprint = function () {
    setTheme(localStorage.getItem("theme") || "light");
};