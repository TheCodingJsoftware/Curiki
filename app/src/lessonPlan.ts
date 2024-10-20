import 'beercss';
import 'material-dynamic-colors';
import '../static/css/printout-style.css';
import '../static/css/theme.css';
import '@mdi/font/css/materialdesignicons.min.css';
import MathCurriculumManager from "./utils/mathCurriculumManager";
import ScienceCurriculumManager from "./utils/scienceCurriculumManager";
import { MathLearningOutcome } from './utils/mathLearningOutcome';
import { ScienceLearningOutcome } from './utils/scienceLearningOutcome';
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
        this.outcomes = [];
    }
    init() {
        this.date.value = new Date().toISOString().split('T')[0];
        Promise.all([this.mathCurriculumManager.load(), this.scienceCurriculumManager.load()]).then(() => {
            const url = new URL(window.location.href);
            const outcomes = url.searchParams.get('outcome')?.split(',') || [];  // Split IDs by commas
            const curriculum = url.searchParams.get('curriculum') || "";

            this.topicTitle.value = curriculum;

            if (outcomes.length > 0 && curriculum) {
                outcomes.forEach(outcome => {
                    let selectedLearningOutcome: MathLearningOutcome | ScienceLearningOutcome | undefined;

                    if (curriculum === 'math') {
                        selectedLearningOutcome = this.mathCurriculumManager.getLearningOutcomeByID(outcome) as MathLearningOutcome;
                        if (selectedLearningOutcome) {
                            const outcome = new OutCome(
                                selectedLearningOutcome.specificLearningOutcome,
                                selectedLearningOutcome.getID(),
                                [selectedLearningOutcome.generalLearningOutcomes.join('\n')],
                                selectedLearningOutcome.skills.map(skill => skillsIconDictionary[skill])
                            );
                            this.outcomes.push(outcome);
                        }
                    } else if (curriculum === 'science') {
                        selectedLearningOutcome = this.scienceCurriculumManager.getLearningOutcomeByID(outcome) as ScienceLearningOutcome;
                        if (selectedLearningOutcome) {
                            const outcome = new OutCome(
                                selectedLearningOutcome.specificLearningOutcome,
                                selectedLearningOutcome.getID(),
                                selectedLearningOutcome.generalLearningOutcomes.map(outcome => this.scienceCurriculumManager.getGeneralOutcomeByCode(outcome))
                            );
                            this.outcomes.push(outcome);
                        }
                    }

                    if (selectedLearningOutcome) {
                        this.gradeLevel.value = gradeNames[selectedLearningOutcome.grade];
                    }
                });
            }

            this.loadLearningOutcomes();
        });
        this.addAssessmentEvidenceRow.addEventListener('click', () => {
            this.addAssessmentEvidenceRowFunction();
        });
        this.addAssessmentEvidenceRowFunction();
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

    loadLearningOutcomes() {
        this.curricularOutcomes.innerHTML = "";

        this.outcomes.forEach(outcome => {
            // Create <details> element and set it to be open by default
            const details = document.createElement('details');
            details.classList.add('no-padding', 'bottom-margin', 'border');
            details.setAttribute('open', '');

            // Create <summary> element
            const summary = document.createElement('summary');
            summary.classList.add('none');

            // Create <a> element for summary content
            const summaryContent = document.createElement('a');
            summaryContent.classList.add('row', 'padding', 'wave');

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
            summaryContent.appendChild(outcomeButton);
            summaryContent.appendChild(maxDiv);
            summaryContent.appendChild(label); // Append icons

            // Append summary content to summary element
            summary.appendChild(summaryContent);

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
            textarea.value = outcome.generalLearningOutcomes.join('\n');  // Join the general learning outcomes by line
            textareaDiv.appendChild(textarea);

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