import 'beercss';
import 'material-dynamic-colors';
import '../static/css/style.css';
import '../static/css/science-theme.css';
import BiologyCurriculumManager from "./utils/biologyCurriculumManager"
import CookieManager from './utils/cookieManager';
import { BiologyLearningOutcome } from "./utils/biologyLearningOutcome";
import { unitIconDictionary } from './utils/icons';
import { gradeNames } from './utils/grades';
import { createLessonPlan, generateLessonPlan, getAllLessonPlans, initDB, LessonPlanTemplate } from './utils/lessonPlan';

class FilterManager {
    container: HTMLDivElement;
    tabsNav: HTMLElement;
    searchInput: HTMLInputElement;
    alwaysOpenOutcomeCheckbox: HTMLInputElement;
    alwaysOpenSLOCheckbox: HTMLInputElement;
    alwaysOpenGLOCheckbox: HTMLInputElement;
    unitsContainer: HTMLDivElement;
    curriculumManager: BiologyCurriculumManager;
    allLessonPlans?: LessonPlanTemplate[];

    constructor() {
        this.container = document.querySelector(`#tabs-container`) as HTMLDivElement;
        this.tabsNav = this.container.querySelector('#tabs') as HTMLElement;
        this.searchInput = document.querySelector('#search') as HTMLInputElement;
        this.alwaysOpenOutcomeCheckbox = document.getElementById('always-open-outcome') as HTMLInputElement;
        this.alwaysOpenSLOCheckbox = document.getElementById('always-open-specific-learning-outcome') as HTMLInputElement;
        this.alwaysOpenGLOCheckbox = document.getElementById('always-open-general-learning-outcomes') as HTMLInputElement;
        this.unitsContainer = document.getElementById('units-container') as HTMLDivElement;
        this.curriculumManager = new BiologyCurriculumManager();
    }

    init() {
        if (this.tabsNav) {
            this.tabsNav.addEventListener('click', this.handleClick.bind(this));
        }
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.handleSearch.bind(this));
        }
        this.alwaysOpenOutcomeCheckbox.addEventListener('change', this.handleCheckboxChange.bind(this));
        this.alwaysOpenSLOCheckbox.addEventListener('change', this.handleCheckboxChange.bind(this));
        this.alwaysOpenGLOCheckbox.addEventListener('change', this.handleCheckboxChange.bind(this));

        initDB().then(async () => {
            this.allLessonPlans = await getAllLessonPlans();
            const url = new URL(window.location.href);
            const grade = url.searchParams.get('grade');
            const outcome = url.searchParams.get('outcome');
            this.curriculumManager.load().then(() => {
                this.loadSettingsFromCookies();
                this.setActiveTabFromCookie();

                if (grade) {
                    this.setActiveTab(`#grade_${grade}`);
                }
                if (outcome) {
                    this.searchInput.value = `${outcome}`;
                }
                this.filterContent();
            });
        })
    }

    handleClick(event: Event) {
        const target = event.target as HTMLElement;
        if (target.dataset.ui) {
            this.setActiveTab(target.dataset.ui);
        }
    }

    handleSearch() {
        CookieManager.setCookie('searchQuery', this.searchInput.value, '/manitobaBiologyCurriculum.html');
        this.filterContent();
    }

    handleCheckboxChange() {
        this.saveCheckboxStates();
        this.filterContent();
    }

    saveCheckboxStates() {
        CookieManager.setCookie('alwaysOpenOutcome', String(this.alwaysOpenOutcomeCheckbox.checked), '/manitobaBiologyCurriculum.html');
        CookieManager.setCookie('alwaysOpenSLO', String(this.alwaysOpenSLOCheckbox.checked), '/manitobaBiologyCurriculum.html');
        CookieManager.setCookie('alwaysOpenGLO', String(this.alwaysOpenGLOCheckbox.checked), '/manitobaBiologyCurriculum.html');
    }

    loadSettingsFromCookies() {
        // Load search query from cookie
        const searchQuery = CookieManager.getCookie('searchQuery');
        if (searchQuery) {
            this.searchInput.value = searchQuery;
        }

        this.loadUnits(this.tabsNav.dataset.ui || '#grade_11');

        // Load always open settings
        this.alwaysOpenOutcomeCheckbox.checked = CookieManager.getCookie('alwaysOpenOutcome') === 'true';
        this.alwaysOpenSLOCheckbox.checked = CookieManager.getCookie('alwaysOpenSLO') === 'true';
        this.alwaysOpenGLOCheckbox.checked = CookieManager.getCookie('alwaysOpenGLO') === 'true';
    }

    setActiveTab(tabId: string) {
        this.tabsNav.querySelectorAll('a').forEach(tab => tab.classList.remove('active'));

        const selectedTab = this.tabsNav.querySelector(`a[data-ui="${tabId}"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
            CookieManager.setCookie('lastSelectedTab', tabId, '/manitobaBiologyCurriculum.html');
        }
        this.loadUnits(tabId);
        this.filterContent();
    }

    loadUnits(tabId: string) {
        const grade = tabId.replace('#grade_', '').toUpperCase();
        const activeUnits = this.getActiveUnits();
        const units = this.curriculumManager.units[grade];

        this.unitsContainer.innerHTML = "";
        Object.keys(units).forEach(unitKey => {
            const button = document.createElement('button');
            button.classList.add('tiny-margin', 'surface', 'border', 'round');

            const strandIcon = document.createElement('i');
            strandIcon.innerHTML = unitIconDictionary[units[unitKey]];
            button.appendChild(strandIcon);

            const text = document.createElement('span');
            text.textContent = units[unitKey];
            button.appendChild(text);

            const icon = document.createElement('i');
            icon.innerText = 'circle'
            button.appendChild(icon);

            if (activeUnits.includes(unitKey)) {
                button.classList.add('fill');
                icon.innerText = 'check_circle'
            }

            button.addEventListener('click', () => {
                this.toggleUnits(button, unitKey);
            });

            this.unitsContainer.appendChild(button);
        });
    }

    toggleUnits(button: HTMLButtonElement, unit: string) {
        const icons = button.querySelectorAll('i');
        const icon = icons[1];
        if (button.classList.contains('fill')) {
            button.classList.remove('fill');
            icon.innerText = 'circle';
            this.removeActiveCluster(unit);
        } else {
            button.classList.add('fill');
            icon.innerText = 'check_circle';
            this.addActiveUnit(unit);
        }
        this.filterContent();
    }

    addActiveUnit(unit: string) {
        const activeUnits = this.getActiveUnits();
        if (!activeUnits.includes(unit)) {
            activeUnits.push(unit);  // Add the unit to the active units list
            CookieManager.setCookie('activeClusters', JSON.stringify(activeUnits), '/manitobaBiologyCurriculum.html');
        }
    }

    removeActiveCluster(unit: string) {
        const activeUnits = this.getActiveUnits();
        const updatedUnits = activeUnits.filter(s => s !== unit);  // Remove the unit from the active units
        CookieManager.setCookie('activeClusters', JSON.stringify(updatedUnits), '/manitobaBiologyCurriculum.html');
    }

    getActiveUnits(): string[] {
        const activeClusters = CookieManager.getCookie('activeClusters');
        return activeClusters ? JSON.parse(activeClusters) : [];
    }

    setActiveTabFromCookie() {
        const lastSelectedTab = CookieManager.getCookie('lastSelectedTab') || '#grade_11';
        if (lastSelectedTab) {
            this.setActiveTab(lastSelectedTab);
        }
    }

    filterContent() {
        const activeGradeElement = this.tabsNav.querySelector('a.active') as HTMLElement;
        let activeGrade = '#grade_11';

        if (activeGradeElement.dataset.ui) {
            activeGrade = activeGradeElement.dataset.ui;
        }

        const searchQuery = this.searchInput.value.toLowerCase();
        const filteredData = this.curriculumManager.filterData({
            grade: activeGrade,
            searchQuery: searchQuery,
            units: this.getActiveUnits(),
        });

        this.renderContent(filteredData, activeGrade, searchQuery, this.getActiveUnits());
    }

    renderContent(learningOutcomes: BiologyLearningOutcome[], activeGrade: string, searchQuery: string, selectedUnits: string[]) {
        const contentDiv = document.getElementById('content');
        if (contentDiv) {
            contentDiv.innerHTML = ''; // Clear previous content

            // Check settings checkboxes
            const alwaysOpenOutcome = this.alwaysOpenOutcomeCheckbox.checked;
            const alwaysOpenSLO = this.alwaysOpenSLOCheckbox.checked;
            const alwaysOpenGLO = this.alwaysOpenGLOCheckbox.checked;

            let contentAdded = false;

            learningOutcomes.forEach(learningOutcome => {
                contentAdded = true;
                const details = document.createElement('details');
                details.classList.add('s12', 'm6', 'l6', 'learning-outcome');

                if (alwaysOpenOutcome || (searchQuery && (learningOutcome.specificLearningOutcome.toLowerCase().includes(searchQuery.toLowerCase()) || alwaysOpenGLO || (searchQuery && learningOutcome.generalLearningOutcomes.some(glo => glo.toLowerCase().includes(searchQuery.toLowerCase())))))) {
                    details.setAttribute('open', '');
                }

                const summary = document.createElement('summary');
                summary.classList.add('bold', 'row', 'no-space');
                const title = learningOutcome.getID();

                const summaryText = document.createElement('span');
                summaryText.classList.add('max');
                summaryText.innerHTML = searchQuery ? title.replace(new RegExp(searchQuery, 'gi'), (match) => `<span class="highlight">${match}</span>`) : title;

                const summeryIcon = document.createElement('i');
                summeryIcon.innerText = 'license';

                summary.appendChild(summeryIcon);
                summary.appendChild(summaryText);

                const copyOutcomeButton = document.createElement('button');
                copyOutcomeButton.classList.add('chip', 'no-border');

                const icon = document.createElement('i');
                icon.innerText = 'content_copy'

                copyOutcomeButton.appendChild(icon);
                copyOutcomeButton.onclick = function () {
                    ui('#copy-outcome-snackbar', 2000);
                    navigator.clipboard.writeText(`${learningOutcome.getID()} ${learningOutcome.specificLearningOutcome} [${learningOutcome.generalLearningOutcomes.join(', ')}]`);
                }

                const shareButton = document.createElement('button');
                shareButton.classList.add('chip', 'no-border');

                const shareIcon = document.createElement('i');
                shareIcon.innerText = 'share'
                shareButton.appendChild(shareIcon);
                shareButton.onclick = function () {
                    if (navigator.share) {
                        navigator.share({
                            title: `Manitoba Science Curriculum - Grade ${activeGrade.replace("#grade_", "")}`,
                            url: `/manitobaBiologyCurriculum.html?grade=${activeGrade.replace("#grade_", "")}&outcome=${learningOutcome.getID()}`
                        })
                            .then(() => console.log('Shared successfully'))
                            .catch(error => console.error('Error sharing:', error));
                    }
                }

                summary.appendChild(shareButton);
                summary.appendChild(copyOutcomeButton);

                details.appendChild(summary);

                const skillDiv = document.createElement('div');

                const strandButton = document.createElement('button');
                strandButton.classList.add('tiny-margin', 'chip');
                const strandIcon = document.createElement('i');
                strandIcon.classList.add('primary-text');
                const clusterText = document.createElement('span');
                clusterText.textContent = this.curriculumManager.units[activeGrade.replace('#grade_', '').toUpperCase()][learningOutcome.unit];
                strandIcon.innerText = unitIconDictionary[this.curriculumManager.units[activeGrade.replace('#grade_', '').toUpperCase()][learningOutcome.unit]];
                strandButton.appendChild(strandIcon);
                strandButton.appendChild(clusterText);

                if (selectedUnits.includes(learningOutcome.unit)) {
                    strandButton.classList.add('fill');
                }

                skillDiv.appendChild(strandButton);

                details.appendChild(skillDiv);

                const sloDetails = document.createElement('details');
                sloDetails.classList.add('specific-learning-outcome');
                sloDetails.id = `slo-${learningOutcome.getID()}`;
                if (alwaysOpenSLO || (searchQuery && learningOutcome.specificLearningOutcome.toLowerCase().includes(searchQuery.toLowerCase()))) {
                    sloDetails.setAttribute('open', '');
                }

                const sloSummary = document.createElement('summary');
                sloSummary.textContent = 'Specific Learning Outcome';
                sloDetails.appendChild(sloSummary);

                const sloContent = searchQuery ? learningOutcome.specificLearningOutcome.replace(new RegExp(searchQuery, 'gi'), (match) => `<span class="highlight">${match}</span>`) : learningOutcome.specificLearningOutcome;

                const sloText = document.createElement('p');
                sloText.classList.add('no-line', 'bottom-margin');
                sloText.innerHTML = 'It is expected that students will: ' + sloContent;

                sloDetails.appendChild(sloText);

                details.appendChild(sloDetails);

                const gloDetails = document.createElement('details');
                gloDetails.classList.add('general-learning-outcomes');
                gloDetails.id = `glo-${learningOutcome.getID()}`;
                if (alwaysOpenGLO || (searchQuery && learningOutcome.generalLearningOutcomes.some(gloCode => this.curriculumManager.generalOutcomes[gloCode].toLowerCase().includes(searchQuery.toLowerCase())))) {
                    gloDetails.setAttribute('open', '');
                }

                const gloSummary = document.createElement('summary');
                gloSummary.textContent = 'General Learning Outcomes';
                gloDetails.appendChild(gloSummary);

                const gloDescription = document.createElement('p');
                gloDescription.classList.add('no-line', 'bottom-margin');
                gloDescription.innerHTML = 'The following set of indicators <b>may</b> be used to determine whether the students have met the corresponding specific outcome.';
                gloDetails.appendChild(gloDescription);

                const gloList = document.createElement('ul');
                learningOutcome.generalLearningOutcomes.forEach(gloCode => {
                    const gloListItem = document.createElement('li');
                    const glo = gloCode + ": " + this.curriculumManager.generalOutcomes[gloCode];
                    gloListItem.innerHTML = searchQuery ? glo.replace(new RegExp(searchQuery, 'gi'), (match) => `<span class="highlight">${match}</span>`) : glo;
                    gloList.appendChild(gloListItem);
                });

                gloDetails.appendChild(gloList);
                details.appendChild(gloDetails);
                const buttonRowDiv = document.createElement('div');
                buttonRowDiv.classList.add('row');
                const createLessonPlanButton = document.createElement('button');
                createLessonPlanButton.classList.add();
                createLessonPlanButton.textContent = 'Create Lesson Plan';
                createLessonPlanButton.onclick = function () {
                    const hashtag = new Date().getTime().toString();
                    const learningOutcomeDict: { [key: string]: string } = {};
                    learningOutcomeDict[learningOutcome.getID()] = learningOutcome.generalLearningOutcomes.join('\n');
                    createLessonPlan(
                        "Biology",
                        gradeNames[activeGrade.replace('#grade_', '')],
                        learningOutcomeDict,
                        new Date().toISOString().split('T')[0],
                        hashtag
                    ).then(() => {
                        const newUrl = `/lessonPlan.html#${hashtag}`;
                        window.open(newUrl, '_blank');
                    });
                }
                buttonRowDiv.appendChild(createLessonPlanButton);

                const resourcesDetails = document.createElement('details');
                resourcesDetails.classList.add('resources');

                const resourcesSummary = document.createElement('summary');
                resourcesSummary.classList.add('row');
                const resourcesSpan = document.createElement('span');
                resourcesSpan.textContent = 'Resources';
                resourcesSpan.classList.add('max');
                resourcesSummary.appendChild(resourcesSpan);
                resourcesDetails.appendChild(resourcesSummary);
                const resourceCountBadge = document.createElement('span');
                resourceCountBadge.classList.add('badge', 'none');
                resourcesSummary.appendChild(resourceCountBadge);

                let hasExistingLessonPlans = false
                let hasExistingResourceLinks = false
                let lessonPlanCount = 0;

                if (this.allLessonPlans) {
                    const lessonPlanDiv = document.createElement('fieldset');
                    const legend = document.createElement('legend');
                    legend.textContent = 'Lesson Plans';
                    lessonPlanDiv.appendChild(legend);

                    const resourceLinksDiv = document.createElement('div');
                    resourceLinksDiv.classList.add('small-padding');
                    this.allLessonPlans.forEach(lessonPlan => {
                        if (Object.keys(lessonPlan.outcomes).includes(learningOutcome.getID())) {
                            hasExistingLessonPlans = true;
                            lessonPlanCount++;
                            const resourceLinksList = document.createElement('ol');
                            resourceLinksList.classList.add('left-padding');

                            lessonPlan.resourceLinks.forEach(resourceLink => {
                                lessonPlanCount++;
                                hasExistingResourceLinks = true;
                                const resourceLinkItem = document.createElement('li');
                                const resourceLinkButton = document.createElement('a');
                                resourceLinkButton.classList.add('link', 'underline', 'wave', 'small-round', 'tiny-padding');
                                const span = document.createElement('span');
                                span.textContent = resourceLink;
                                resourceLinkButton.appendChild(span);
                                const icon = document.createElement('i');
                                icon.innerText = 'open_in_new';
                                resourceLinkButton.appendChild(icon);
                                resourceLinkButton.href = resourceLink;
                                resourceLinkButton.target = '_blank';
                                resourceLinkItem.appendChild(resourceLinkButton);
                                resourceLinksList.appendChild(resourceLinkItem);
                            });
                            resourceLinksDiv.appendChild(resourceLinksList);

                            const lessonPlanButton = document.createElement('a');
                            lessonPlanButton.classList.add('tiny-margin', 'chip');
                            const sourceIcon = document.createElement('i');
                            if (lessonPlan.source === "public"){
                                sourceIcon.innerText = 'public';
                            } else if (lessonPlan.source === "local"){
                                sourceIcon.innerText = 'storage';
                            }
                            const openIcon = document.createElement('i');
                            openIcon.innerText = 'open_in_new';
                            lessonPlanButton.appendChild(sourceIcon);
                            const span = document.createElement('span');
                            span.textContent = `${lessonPlan.topicTitle} by ${lessonPlan.authorName}`;
                            lessonPlanButton.appendChild(span);
                            lessonPlanButton.href = `/lessonPlan.html#${lessonPlan.id}`;
                            lessonPlanButton.target = '_blank';
                            lessonPlanButton.appendChild(openIcon);
                            lessonPlanDiv.appendChild(lessonPlanButton);
                            resourceCountBadge.textContent = lessonPlanCount.toString();
                        }
                    });
                    if (hasExistingLessonPlans) {
                        resourcesDetails.appendChild(lessonPlanDiv);
                    }
                    if (hasExistingResourceLinks) {
                        resourcesDetails.appendChild(resourceLinksDiv);
                    }
                }

                if (hasExistingLessonPlans || hasExistingResourceLinks){
                    details.appendChild(resourcesDetails);
                }

                details.appendChild(buttonRowDiv);

                contentDiv.appendChild(details);
            });
            if (!contentAdded) {
                const noResultsMessage = document.createElement('p');
                noResultsMessage.classList.add('s12', 'm12', 'l12', 'center-align', 'medium-width');
                noResultsMessage.textContent = 'No results found with the filter settings applied.';
                contentDiv.appendChild(noResultsMessage);
            }
        }
    }
}
document.addEventListener('DOMContentLoaded', function () {
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

    const tabManager = new FilterManager();
    tabManager.init();
});
