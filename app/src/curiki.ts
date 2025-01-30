import 'beercss';
import 'material-dynamic-colors';
import '../static/css/curiki-style.css';
import '../static/css/curiki-theme.css';
import { deleteLessonPlan, getAllLocalLessonPlans, getAllPublicLessonPlans, initDB, LessonPlanTemplate } from './utils/lessonPlan';

let db: IDBDatabase;
let usesChromeStorage: boolean = false;
let authorSelections: string[] = [];
let gradeSelections: string[] = [];
let outcomeSelections: string[] = [];


function filterLessonPlans() {
    const localLessonPlans = document.querySelectorAll('.local-lesson-plan') as NodeListOf<HTMLElement>;
    const serverLessonPlans = document.querySelectorAll('.server-lesson-plan') as NodeListOf<HTMLElement>;

    localLessonPlans.forEach(localLessonPlan => {
        const localLessonPlanId = localLessonPlan.getAttribute('data-id');
        const authorButton = localLessonPlan.querySelector(`#author`) as HTMLButtonElement;
        const gradeButton = localLessonPlan.querySelector(`#grade`) as HTMLButtonElement;
        const outcomeButtons = localLessonPlan.querySelectorAll(`#outcome`) as NodeListOf<HTMLButtonElement>;

        let authorName = authorButton.getAttribute('data-author') as string;
        let gradeLevel = gradeButton.getAttribute('data-grade') as string;
        let outcomes: string[] = [];
        let matchesAuthor = authorSelections.includes(authorName);
        let matchesGrade = gradeSelections.includes(gradeLevel);
        let matchesOutcomes = false;

        outcomeButtons.forEach(outcomeButton => {
            outcomes.push(outcomeButton.getAttribute('data-outcome') as string);
        });

        if (authorSelections.length > 0 && authorSelections.includes(authorName)){
            authorButton.classList.add('fill');
            authorButton.querySelectorAll('i')[1].innerText = "check_circle";
        } else {
            authorButton.classList.remove('fill');
            authorButton.querySelectorAll('i')[1].innerText = "circle";
        }

        if (gradeSelections.length > 0 && gradeSelections.includes(gradeLevel)){
            gradeButton.classList.add('fill');
            gradeButton.querySelectorAll('i')[1].innerText = "check_circle";
        } else {
            gradeButton.classList.remove('fill');
            gradeButton.querySelectorAll('i')[1].innerText = "circle";
        }

        outcomeButtons.forEach(outcomeButton => {
            const outcome = outcomeButton.getAttribute('data-outcome') as string;
            if (outcomeSelections.length > 0 && outcomeSelections.includes(outcome)) {
                outcomeButton.classList.add('fill');
                outcomeButton.querySelectorAll('i')[1].innerText = "check_circle";
                matchesOutcomes = true;
            } else {
                outcomeButton.classList.remove('fill');
                outcomeButton.querySelectorAll('i')[1].innerText = "circle";
            }
        });

        if (authorSelections.length > 0 && !matchesAuthor){
            localLessonPlan.classList.add('hidden');
            return;
        }
        if (gradeSelections.length > 0 && !matchesGrade){
            localLessonPlan.classList.add('hidden');
            return;
        }
        if (outcomeSelections.length > 0 && !matchesOutcomes){
            localLessonPlan.classList.add('hidden');
            return;
        }
        localLessonPlan.classList.remove('hidden');
    });
    serverLessonPlans.forEach(serverLessonPlan => {
        const serverLessonPlanId = serverLessonPlan.getAttribute('data-id');
        const authorButton = serverLessonPlan.querySelector(`#author`) as HTMLButtonElement;
        const gradeButton = serverLessonPlan.querySelector(`#grade`) as HTMLButtonElement;
        const outcomeButtons = serverLessonPlan.querySelectorAll(`#outcome`) as NodeListOf<HTMLButtonElement>;

        let authorName = authorButton.getAttribute('data-author') as string;
        let gradeLevel = gradeButton.getAttribute('data-grade') as string;
        let outcomes: string[] = [];
        let matchesAuthor = authorSelections.includes(authorName);
        let matchesGrade = gradeSelections.includes(gradeLevel);
        let matchesOutcomes = false;

        outcomeButtons.forEach(outcomeButton => {
            outcomes.push(outcomeButton.getAttribute('data-outcome') as string);
        });

        if (authorSelections.length > 0 && authorSelections.includes(authorName)){
            authorButton.classList.add('fill');
            authorButton.querySelectorAll('i')[1].innerText = "check_circle";
        } else {
            authorButton.classList.remove('fill');
            authorButton.querySelectorAll('i')[1].innerText = "circle";
        }

        if (gradeSelections.length > 0 && gradeSelections.includes(gradeLevel)){
            gradeButton.classList.add('fill');
            gradeButton.querySelectorAll('i')[1].innerText = "check_circle";
        } else {
            gradeButton.classList.remove('fill');
            gradeButton.querySelectorAll('i')[1].innerText = "circle";
        }

        outcomeButtons.forEach(outcomeButton => {
            const outcome = outcomeButton.getAttribute('data-outcome') as string;
            if (outcomeSelections.length > 0 && outcomeSelections.includes(outcome)) {
                outcomeButton.classList.add('fill');
                outcomeButton.querySelectorAll('i')[1].innerText = "check_circle";
                matchesOutcomes = true;
            } else {
                outcomeButton.classList.remove('fill');
                outcomeButton.querySelectorAll('i')[1].innerText = "circle";
            }
        });

        if (authorSelections.length > 0 && !matchesAuthor){
            serverLessonPlan.classList.add('hidden');
            return;
        }
        if (gradeSelections.length > 0 && !matchesGrade){
            serverLessonPlan.classList.add('hidden');
            return;
        }
        if (outcomeSelections.length > 0 && !matchesOutcomes){
            serverLessonPlan.classList.add('hidden');
            return;
        }
        serverLessonPlan.classList.remove('hidden');
    });
}

function generateLessonPlanArticle(lessonPlan: LessonPlanTemplate, source: string): HTMLElement {
    const authorName = localStorage.getItem('authorName') || "";
    let isAuthor = false;
    if (authorName === "") {
        isAuthor = false;
    } else {
        isAuthor = lessonPlan.authorName.includes(authorName) || lessonPlan.source === 'local';
    }

    const modifiedDate = new Date(lessonPlan.modifiedDate);
    const now = new Date();
    const timeDiff = Math.abs(now.getTime() - modifiedDate.getTime());
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let modifiedDateString: string;
    if (seconds < 60) {
        modifiedDateString = `${seconds} seconds ago`;
    } else if (minutes < 60) {
        modifiedDateString = `${minutes} minutes ago`;
    } else if (hours < 24) {
        modifiedDateString = `${hours} hours ago`;
    } else if (days === 1) {
        modifiedDateString = `yesterday`;
    } else {
        modifiedDateString = `${days} days ago`;
    }
    const outcomesChips = Object.keys(lessonPlan.outcomes)
        .map(
            (outcome: string) =>
                `<button class="chip tiny-margin" id="outcome" data-outcome="${outcome}">
                    <i>license</i>
                    <span>${outcome}</span>
                    <i>circle</i>
                </button>`
        )
        .join('');
    const html = `
        <article class="s12 m6 l6 grid round ${source}-lesson-plan" data-id="${lessonPlan.id}">
            <div class="s12">
                <h6 class="bold">${lessonPlan.topicTitle}</h6>
            </div>
            <div class="s12 small-round">
                <button class="chip tiny-margin" id="author" data-author="${lessonPlan.authorName}">
                    <i>group</i>
                    <span>${lessonPlan.authorName}</span>
                    <i>circle</i>
                </button>
                <button class="chip tiny-margin">
                    <i>update</i>
                    <span>${modifiedDateString}</span>
                    <div class="tooltip bottom">
                        <span>${modifiedDate.toLocaleString()}</span>
                    </div>
                </button>
                <button class="chip tiny-margin" id="grade" data-grade="${lessonPlan.gradeLevel}">
                    <i>school</i>
                    <span>${lessonPlan.gradeLevel}</span>
                    <i>circle</i>
                </button>
                ${outcomesChips}
            </div>
            <nav class="s12 right-align">
                <button class="round" onclick='window.location.href="/lessonPlan.html#${lessonPlan.id}"'>
                    <i>open_in_new</i>
                    <span>Open</span>
                </button>
                ${
                    isAuthor
                        ? `<button class="transparent border circle" id="delete">
                            <i>delete</i>
                        </button>`
                        : ''
                }
            </nav>
        </article>
    `;

    const div = document.createElement('div');
    div.innerHTML = html;

    if (isAuthor) {
        const deleteButton = div.querySelector(`#delete`) as HTMLButtonElement;
        deleteButton.addEventListener('click', async () => {
            if (!isAuthor) {
                return;
            }
            const confirmDeletion = await confirm('Are you sure you want to delete this lesson plan?');
            if (!confirmDeletion) {
                return;
            }
            if (source === 'local') {
                deleteLessonPlan(lessonPlan.id).then((success) => {
                    if (success) {
                        ui('#snackbar-deleted-lesson-plan', 2000);
                    };
                });
            } else if (source === 'server') {
                fetch(`https://pinecone.synology.me/curiki?id=${lessonPlan.id}`, {
                    method: 'DELETE',
                }).then((response) => {
                    if (response.ok) {
                        ui('#snackbar-deleted-lesson-plan', 2000);
                    } else {
                        console.error('Error deleting from server:', response.statusText);
                    }
                })
                .catch((error) => {
                    console.error('Network error:', error);
                });
            }
            setTimeout(async () => {
                await loadAllLessonPlans();
            }, 3000);

        });
    }
    const authorButton = div.querySelector(`#author`) as HTMLButtonElement;
    authorButton.addEventListener('click', () => {
        if (!authorButton.classList.contains('fill')) {
            authorButton.classList.add('fill');
            authorButton.querySelectorAll('i')[1].innerText = "check_circle";
            authorSelections.push(lessonPlan.authorName);
        } else {
            authorButton.classList.remove('fill');
            authorButton.querySelectorAll('i')[1].innerText = "circle";
            authorSelections.splice(authorSelections.indexOf(lessonPlan.authorName), 1);
        }
        filterLessonPlans();
    });
    const gradeButton = div.querySelector(`#grade`) as HTMLButtonElement;
    gradeButton.addEventListener('click', () => {
        if (!gradeButton.classList.contains('fill')) {
            gradeButton.classList.add('fill');
            gradeButton.querySelectorAll('i')[1].innerText = "check_circle";
            gradeSelections.push(lessonPlan.gradeLevel);
        } else {
            gradeButton.classList.remove('fill');
            gradeButton.querySelectorAll('i')[1].innerText = "circle";
            gradeSelections.splice(gradeSelections.indexOf(lessonPlan.gradeLevel), 1);
        }
        filterLessonPlans();
    });

    const outcomeButtons = div.querySelectorAll(`#outcome`) as NodeListOf<HTMLButtonElement>;
    outcomeButtons.forEach(outcomeButton => {
        outcomeButton.addEventListener('click', () => {
            if (!outcomeButton.classList.contains('fill')) {
                outcomeButton.classList.add('fill');
                outcomeButton.querySelectorAll('i')[1].innerText = "check_circle";
                outcomeSelections.push(outcomeButton.getAttribute('data-outcome') as string);
            } else {
                outcomeButton.classList.remove('fill');
                outcomeButton.querySelectorAll('i')[1].innerText = "circle";
                outcomeSelections.splice(outcomeSelections.indexOf(outcomeButton.getAttribute('data-outcome') as string), 1);
            }
            filterLessonPlans();
        });
    });

    return div.firstElementChild as HTMLElement;
}

async function loadAllLessonPlans(): Promise<void> {
    const savedLessonPlansContainer = document.getElementById('saved-lesson-plans-container') as HTMLDivElement;
    const publicLessonPlansContainer = document.getElementById('public-lesson-plans-container') as HTMLDivElement;

    Promise.all([
        getAllLocalLessonPlans(),
        getAllPublicLessonPlans()
    ]).then(([savedLessonPlans, publicLessonPlans]) => {
        savedLessonPlansContainer.innerHTML = '';
        publicLessonPlansContainer.innerHTML = '';

        const savedLessonPlansFragment = document.createDocumentFragment();
        const publicLessonPlansFragment = document.createDocumentFragment();

        savedLessonPlans.forEach((lessonPlan) => {
            const article = generateLessonPlanArticle(lessonPlan, "local");
            savedLessonPlansFragment.appendChild(article);
        });

        publicLessonPlans.forEach((lessonPlan) => {
            const article = generateLessonPlanArticle(lessonPlan, "server");
            publicLessonPlansFragment.appendChild(article);
        });

        savedLessonPlansContainer.appendChild(savedLessonPlansFragment);
        publicLessonPlansContainer.appendChild(publicLessonPlansFragment);
    });
}

function firstTimeSetup() {
    const acceptedTermsOfService = localStorage.getItem('acceptedTermsOfServiceAndPrivacyPolicy') === 'true';
    if (acceptedTermsOfService) {
        return;
    }
    const modal = document.createElement('dialog');
    modal.classList.add('modal'); // Ensure you have corresponding CSS styles for the modal.
    modal.id = 'start-up-modal';
    modal.innerHTML = `
        <div>
            <h5>Welcome to Curiki</h5>
            <p class="no-line">Curiki is a communitiy driven tool to help you learn and understand the Manitoba Curriculum. It is designed to be a simple and easy-to-use tool that can be used by anyone, anywhere.</p>
            <p class="no-line">Before you start using Curiki, please read the <a class="link underline" href="/termsOfService.html">Terms of Service</a> and <a class="link underline" href="/policy.html">Privacy Policy</a>.</p>
            <label class="checkbox">
                <input type="checkbox" id="accepted-terms-of-service">
                <span>I have read and agree to the Terms of Service and Privacy Policy</span>
            </label>
            <div class="grid">
                <button class="s6" id="confirm-outcome">Accept</button>
                <button class="s6" id="cancel-outcome">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.showModal();

    const confirmButton = modal.querySelector('#confirm-outcome') as HTMLButtonElement;
    const cancelButton = modal.querySelector('#cancel-outcome') as HTMLButtonElement;
    const acceptedTermsOfServiceCheckbox = modal.querySelector('#accepted-terms-of-service') as HTMLInputElement;
    confirmButton.disabled = !acceptedTermsOfServiceCheckbox.checked;
    acceptedTermsOfServiceCheckbox.addEventListener('change', () => {
        confirmButton.disabled = !acceptedTermsOfServiceCheckbox.checked;
    });

    confirmButton.addEventListener('click', () => {
        localStorage.setItem('acceptedTermsOfServiceAndPrivacyPolicy', acceptedTermsOfServiceCheckbox.checked.toString());
        document.body.removeChild(modal);
        modal.close();
    });

    cancelButton.addEventListener('click', () => {
        document.body.removeChild(modal);
        modal.close();
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    initDB().then(() => {
        return loadAllLessonPlans();
    }).then(() => {
        console.log('Database and lesson plans loaded successfully');
    }).catch((error) => {
        console.error('Error loading database or lesson plans:', error);
    });
});

document.addEventListener('DOMContentLoaded', function () {
    firstTimeSetup();

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
    if (
        HTMLScriptElement.supports &&
        HTMLScriptElement.supports("speculationrules")
    ) {
        const specScript = document.createElement("script");
        specScript.type = "speculationrules";
        const specRules = {
            prefetch: [
                {
                    source: "list",
                    urls: [
                        "/manitobaCurriculumOverview.html",
                        "/manitobaBiologyCurriculum.html",
                        "/manitobaMathematicsCurriculum.html",
                        "/manitobaScienceCurriculum.html",
                        "/manitobaSocialStudiesCurriculum.html"
                    ]
                },
            ],
        };
        specScript.textContent = JSON.stringify(specRules);
        document.body.append(specScript);
    } else {
        const linkElem = document.createElement("link");
        linkElem.rel = "prefetch";
        linkElem.href = "/next.html";
        document.head.append(linkElem);
    }

    const tabs = document.querySelectorAll('.tabs a');
    const pages = document.querySelectorAll('.page');

    function setActiveTab(tabElement: HTMLElement) {
        tabs.forEach((tab) => tab.classList.remove('active'));
        pages.forEach((page) => page.classList.remove('active'));

        tabElement.classList.add('active');
        const targetPageId = tabElement.getAttribute('data-ui');
        if (targetPageId) {
            const targetPage = document.querySelector(targetPageId) as HTMLElement;
            if (targetPage) {
                targetPage.classList.add('active');
            }
        }

        localStorage.setItem('activeTab', tabElement.getAttribute('data-ui') || '');
    }

    tabs.forEach((tab) => {
        tab.addEventListener('click', (event) => {
            event.preventDefault();
            setActiveTab(tab as HTMLElement);
        });
    });

    const lastActiveTab = localStorage.getItem('activeTab');
    if (lastActiveTab) {
        const lastTabElement = document.querySelector(`.tabs a[data-ui="${lastActiveTab}"]`) as HTMLElement;
        if (lastTabElement) {
            setActiveTab(lastTabElement);
        }
    } else {
        setActiveTab(tabs[0] as HTMLElement);
    }
});
