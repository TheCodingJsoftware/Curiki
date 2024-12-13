import 'beercss';
import 'material-dynamic-colors';
import '../static/css/printout-style.css';
import '../static/css/theme.css';
import '@mdi/font/css/materialdesignicons.min.css';
import MathCurriculumManager from "./utils/mathCurriculumManager";
import BiologyCurriculumManager from "./utils/biologyCurriculumManager";
import ScienceCurriculumManager from "./utils/scienceCurriculumManager";
import SocialStudiesCurriculumManager from "./utils/socialStudiesCurriculumManager";
import { MathLearningOutcome } from './utils/mathLearningOutcome';
import { ScienceLearningOutcome } from './utils/scienceLearningOutcome';
import { BiologyLearningOutcome } from './utils/biologyLearningOutcome';
import { SocialStudiesLearningOutcome } from './utils/socialStudiesLearningOutcome';
import { scienceClustersIconDictionary, skillsIconDictionary } from './utils/icons';

const gradeNames: { [key: string]: string } = {
    'K': 'Kindergarten',
    '1': 'Grade 1',
    '2': 'Grade 2',
    '3': 'Grade 3',
    '4': 'Grade 4',
    '5': 'Grade 5',
    '6': 'Grade 6',
    '7': 'Grade 7',
    '8': 'Grade 8',
    '9': 'Grade 9',
    '10': 'Grade 10',
    '11': 'Grade 11',
    '12': 'Grade 12',
    'S1': 'S1',
    'S2': 'S2',
    '10E': '10 Essential',
    '10I': '10 Introduction to Applied and Pre-Calculus',
    '11A': '11 Applied',
    '11E': '11 Essential',
    '11P': '11 Pre-Calculus',
    '12A': '12 Applied',
    '12E': '12 Essential',
    '12P': '12 Pre-Calculus',
}

class OutCome {
    id: string;
    specificLearningOutcome: string;
    generalLearningOutcomes: string[];
    icons: string[];

    constructor(specificLearningOutcome: string, id: string, generalLearningOutcomes: string[], icons?: string[]) {
        this.id = id;
        this.specificLearningOutcome = specificLearningOutcome;
        this.generalLearningOutcomes = generalLearningOutcomes;
        this.icons = icons || [];
    }
}

class LessonPlan {
    topicTitle: HTMLInputElement;
    gradeLevel: HTMLSelectElement;
    timeLength: HTMLInputElement;
    date: HTMLInputElement;
    curricularOutcomes: HTMLElement;
    addCurricularOutcome: HTMLButtonElement;
    crossCurricularConnections: HTMLTextAreaElement;
    assessmentEvidence: HTMLTableElement;
    addAssessmentEvidenceRow: HTMLButtonElement;
    materialsConsidered: HTMLTextAreaElement;
    studentSpecificPlanning: HTMLTextAreaElement;
    learningPlan: HTMLTableElement;
    reflections: HTMLTextAreaElement;
    mathCurriculumManager: MathCurriculumManager;
    scienceCurriculumManager: ScienceCurriculumManager;
    biologyCurriculumManager: BiologyCurriculumManager;
    socialStudiesCurriculumManager: SocialStudiesCurriculumManager;
    outcomes: OutCome[];

    constructor() {
        this.topicTitle = document.getElementById('topic-title') as HTMLInputElement;
        this.gradeLevel = document.getElementById('grade-level') as HTMLSelectElement;
        this.timeLength = document.getElementById('time-length') as HTMLInputElement;
        this.date = document.getElementById('date') as HTMLInputElement;
        this.curricularOutcomes = document.getElementById('curricular-outcomes') as HTMLElement;
        this.addCurricularOutcome = document.getElementById('add-curricular-outcome') as HTMLButtonElement;
        this.crossCurricularConnections = document.getElementById('cross-curricular-connections') as HTMLTextAreaElement;
        this.assessmentEvidence = document.getElementById('assessment-evidence') as HTMLTableElement;
        this.addAssessmentEvidenceRow = document.getElementById('add-row-button') as HTMLButtonElement;
        this.materialsConsidered = document.getElementById('materials-considered') as HTMLTextAreaElement;
        this.studentSpecificPlanning = document.getElementById('student-specific-planning') as HTMLTextAreaElement;
        this.learningPlan = document.getElementById('learning-plan') as HTMLTableElement;
        this.reflections = document.getElementById('reflections') as HTMLTextAreaElement;
        this.mathCurriculumManager = new MathCurriculumManager();
        this.scienceCurriculumManager = new ScienceCurriculumManager();
        this.biologyCurriculumManager = new BiologyCurriculumManager();
        this.socialStudiesCurriculumManager = new SocialStudiesCurriculumManager();
        this.outcomes = [];
    }
    init() {
        this.date.value = new Date().toISOString().split('T')[0];
        Promise.all([this.mathCurriculumManager.load(), this.scienceCurriculumManager.load()]).then(() => {
            const url = new URL(window.location.href);
            const outcomes = url.searchParams.get('outcome')?.split(',') || [];  // Split IDs by commas
            const curriculum = url.searchParams.get('curriculum') || "";

            this.topicTitle.value = curriculum;

            this.setGradeLevel(curriculum, outcomes[0]);

            if (outcomes.length > 0 && curriculum) {
                outcomes.forEach(outcome => {
                    this.outcomes.push(this.getOutcome(curriculum, outcome));
                });
            }

            this.loadLearningOutcomes();
        });
        this.addAssessmentEvidenceRow.addEventListener('click', () => {
            this.addAssessmentEvidenceRowFunction();
        });
        this.addCurricularOutcome.addEventListener('click', () => {
            this.addCurricularOutcomeFunction();
        });
        this.addAssessmentEvidenceRowFunction();
    }

    setGradeLevel(curriculum: string, outcomeId: string) {
        let selectedLearningOutcome: MathLearningOutcome | ScienceLearningOutcome | BiologyLearningOutcome | SocialStudiesLearningOutcome | undefined;
        if (curriculum === 'math') {
            selectedLearningOutcome = this.mathCurriculumManager.getLearningOutcomeByID(outcomeId) as MathLearningOutcome;
        } else if (curriculum === 'science') {
            selectedLearningOutcome = this.scienceCurriculumManager.getLearningOutcomeByID(outcomeId) as ScienceLearningOutcome;
        } else if (curriculum === 'biology') {
            selectedLearningOutcome = this.biologyCurriculumManager.getLearningOutcomeByID(outcomeId) as BiologyLearningOutcome;
        } else if (curriculum === 'socials_studies') {
            selectedLearningOutcome = this.socialStudiesCurriculumManager.getLearningOutcomeByID(outcomeId) as SocialStudiesLearningOutcome;
        }
        if (selectedLearningOutcome) {
            this.gradeLevel.value = gradeNames[selectedLearningOutcome.grade];
        }
    }

    getOutcome(curriculum: string, outcomeId: string): OutCome {
        let selectedLearningOutcome: MathLearningOutcome | ScienceLearningOutcome | BiologyLearningOutcome | SocialStudiesLearningOutcome | undefined;
        if (curriculum === 'math') {
            selectedLearningOutcome = this.mathCurriculumManager.getLearningOutcomeByID(outcomeId) as MathLearningOutcome;
            if (selectedLearningOutcome) {
                return new OutCome(
                    selectedLearningOutcome.specificLearningOutcome,
                    selectedLearningOutcome.getID(),
                    [selectedLearningOutcome.generalLearningOutcomes.join('\n')],
                    selectedLearningOutcome.skills.map(skill => skillsIconDictionary[skill])
                );
            }
        } else if (curriculum === 'science') {
            selectedLearningOutcome = this.scienceCurriculumManager.getLearningOutcomeByID(outcomeId) as ScienceLearningOutcome;
            if (selectedLearningOutcome) {
                return new OutCome(
                    selectedLearningOutcome.specificLearningOutcome,
                    selectedLearningOutcome.getID(),
                    selectedLearningOutcome.generalLearningOutcomes.map(outcome => this.scienceCurriculumManager.getGeneralOutcomeByCode(outcome))
                );
            }
        } else if (curriculum === 'biology') {
            selectedLearningOutcome = this.biologyCurriculumManager.getLearningOutcomeByID(outcomeId) as BiologyLearningOutcome;
            if (selectedLearningOutcome) {
                return new OutCome(
                    selectedLearningOutcome.specificLearningOutcome,
                    selectedLearningOutcome.getID(),
                    selectedLearningOutcome.generalLearningOutcomes.map(outcome => this.biologyCurriculumManager.getGeneralOutcomeByCode(outcome))
                );
            }
        } else if (curriculum === 'socials_studies') {
            selectedLearningOutcome = this.socialStudiesCurriculumManager.getLearningOutcomeByID(outcomeId) as SocialStudiesLearningOutcome;
            if (selectedLearningOutcome) {
                return new OutCome(
                    selectedLearningOutcome.specificLearningOutcome,
                    selectedLearningOutcome.getID(),
                    selectedLearningOutcome.generalLearningOutcomes.map(outcome => this.socialStudiesCurriculumManager.getGeneralOutcomeByCode(outcome))
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
        // Determine the selected curriculum from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const curriculum = urlParams.get('curriculum');

        if (!curriculum) {
            console.error("Curriculum not specified in the URL.");
            return;
        }

        // Fetch the first curricular outcome based on the curriculum
        let firstOutcomeId = this.getOutcomesIDByCurriculum(curriculum)[0];
        let firstOutcome = this.getOutcome(curriculum, firstOutcomeId);

        if (!firstOutcome) {
            console.error("No outcomes found for the selected curriculum.");
            return;
        }

        // Add the first outcome to the `this.outcomes` list
        this.outcomes.push(firstOutcome);

        // Update the URL to include the new outcome
        const existingOutcomes = this.outcomes.map(o => o.id);
        urlParams.set('outcome', existingOutcomes.join(','));
        const updatedUrl = `${window.location.pathname}?${urlParams.toString()}`;
        history.pushState(null, '', updatedUrl);

        // Reload the outcomes in the UI
        this.loadLearningOutcomes();
    }


    addAssessmentEvidenceRowFunction() {
        const newRow = document.createElement('tr') as HTMLTableRowElement;

        newRow.innerHTML = `
            <td>
                <div class="field border textarea extra">
                    <textarea></textarea>
                </div>
            </td>
            <td>
                <label class="checkbox">
                    <input type="checkbox">
                    <span></span>
                </label>
            </td>
            <td>
                <label class="checkbox">
                    <input type="checkbox">
                    <span></span>
                </label>
            </td>
            <td>
                <label class="checkbox">
                    <input type="checkbox">
                    <span></span>
                </label>
            </td>
            <td>
                <button class="square round delete-row-button"><i>delete</i></button>
            </td>
        `;

        const deleteButton = newRow.querySelector('.delete-row-button') as HTMLButtonElement;
        deleteButton.addEventListener('click', () => {
            // Remove the row when the delete button is clicked
            this.assessmentEvidence.removeChild(newRow);
        });
        // Append the new row to the table body
        this.assessmentEvidence.appendChild(newRow);
    }

    getOutcomesIDByCurriculum(curriculum: string): string[] {
        let outcomesList: string[] = [];

        if (curriculum === 'math') {
            outcomesList = this.mathCurriculumManager.learningOutcomes.map(outcome => outcome.getID());
        } else if (curriculum === 'science') {
            outcomesList = this.scienceCurriculumManager.learningOutcomes.map(outcome => outcome.getID());
        } else if (curriculum === 'biology') {
            outcomesList = this.biologyCurriculumManager.learningOutcomes.map(outcome => outcome.getID());
        } else if (curriculum === 'socials_studies') {
            outcomesList = this.socialStudiesCurriculumManager.learningOutcomes.map(outcome => outcome.getID());
        }
        return outcomesList;
    }

    loadLearningOutcomes() {
        this.curricularOutcomes.innerHTML = "";

        this.outcomes.forEach(outcome => {
            // Create <details> element and set it to be open by default
            const details = document.createElement('details');
            details.classList.add('no-padding', 'bottom-margin', 'border');
            details.setAttribute('open', '');

            // Create <summary> element
            const summary = document.createElement('summary');
            summary.classList.add('row', 'padding');

            // Create <button> for the learning outcome ID
            const outcomeButton = document.createElement('button');
            outcomeButton.classList.add('chip', 'small-round');
            outcomeButton.textContent = outcome.id;

            // Create <div> for the title (Specific Learning Outcome)
            const maxDiv = document.createElement('div');
            maxDiv.classList.add('max');
            const title = document.createElement('h6');
            title.classList.add('small');
            title.textContent = outcome.specificLearningOutcome;

            // Append title to max div
            maxDiv.appendChild(title);

            // Create <label> for the icons
            const label = document.createElement('label');
            outcome.icons.forEach(iconClass => {
                const iconElement = document.createElement('i');
                iconElement.innerText = iconClass;
                label.appendChild(iconElement);
            });

            // Append button, title, and icons to the summary content
            summary.appendChild(outcomeButton);
            summary.appendChild(maxDiv);
            summary.appendChild(label); // Append icons

            // Create <div> for content under the summary
            const contentDiv = document.createElement('div');
            contentDiv.classList.add('padding');

            // Create <p> for the description
            const description = document.createElement('p');
            description.classList.add('no-line');
            description.textContent = "The following set of indicators may be used to determine whether the students have met the corresponding specific outcome.";
            contentDiv.appendChild(description);

            // Create <div> for the textarea
            const textareaDiv = document.createElement('div');
            textareaDiv.classList.add('field', 'border', 'textarea', 'extra', 'no-margin');

            // Create <textarea> for general learning outcomes
            const textarea = document.createElement('textarea');
            textarea.id = 'general-learning-outcomes';
            textarea.value = outcome.generalLearningOutcomes.join('\n');
            textareaDiv.appendChild(textarea);

            outcomeButton.addEventListener('click', () => {
                const urlParams = new URLSearchParams(window.location.search);
                const curriculum = urlParams.get('curriculum') || "";
                let outcomesList: string[] = [];

                outcomesList = this.getOutcomesIDByCurriculum(curriculum);

                const modal = document.createElement('dialog');
                modal.classList.add('modal'); // Ensure you have corresponding CSS styles for the modal.
                modal.id = 'outcome-selector-modal';
                modal.innerHTML = `
                    <div>
                        <h3>Select a New Outcome</h3>
                        <select id="outcome-selector">
                            ${outcomesList.map(outcomeId => `<option value="${outcomeId}">${outcomeId}</option>`).join('')}
                        </select>
                        <div class="modal-actions">
                            <button id="confirm-outcome">Confirm</button>
                            <button id="cancel-outcome">Cancel</button>
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

                        // Remove the current outcome and add the new one
                        const currentIndex = this.outcomes.findIndex(o => o.id === outcome.id);
                        if (currentIndex !== -1) {
                            this.outcomes.splice(currentIndex, 1); // Remove the old outcome
                        }

                        let newOucome = this.getOutcome(curriculum, selectedOutcomeId);
                        this.outcomes.push(newOucome);

                        const existingOutcomes = this.outcomes.map(o => o.id);
                        urlParams.set('outcome', existingOutcomes.join(','));
                        const updatedUrl = `${window.location.pathname}?${urlParams.toString()}`;
                        history.pushState(null, '', updatedUrl);

                        // Reload the outcomes UI
                        this.loadLearningOutcomes();

                        // Close the modal
                        document.body.removeChild(modal);
                        modal.close();
                    }
                });

                cancelButton.addEventListener('click', () => {
                    document.body.removeChild(modal);
                    modal.close();
                });
            });

            // Append the textarea div to the content div
            contentDiv.appendChild(textareaDiv);

            // Append the summary and content to the details element
            details.appendChild(summary);
            details.appendChild(contentDiv);
            // Append the details element to the main container
            this.curricularOutcomes.appendChild(details);
        });
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