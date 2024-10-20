import 'beercss';
import 'material-dynamic-colors';
import '../static/css/style.css';
import '../static/css/social-studies-theme.css';
import '@mdi/font/css/materialdesignicons.min.css';
import SocialStudiesCurriculumManager from "./utils/socialStudiesCurriculumManager"
import CookieManager from './utils/cookieManager';
import { SocialStudiesLearningOutcome } from "./utils/socialStudiesLearningOutcome";
import { SocialStudiesSkill } from './utils/socialStudiesSkill';
import {
    socialStudiesClustersIconDictionary,
    generalLearningOutcomesIconDictionary,
    distinctiveLearningOutcomesIconDictionary,
    outcomeTypesIconDictionary,
    skillTypesIconDictionary
} from './utils/icons';


class FilterManager {
    container: HTMLDivElement;
    tabsNav: HTMLElement;
    searchInput: HTMLInputElement;
    alwaysOpenOutcomeCheckbox: HTMLInputElement;
    clustersContainer: HTMLDivElement;
    generalOutcomesContainer: HTMLDivElement;
    outcomeTypesContainer: HTMLDivElement;
    skillTypesContainier: HTMLDivElement;
    distinctiveLearningOutcomesContainer: HTMLDivElement;
    curriculumManager: SocialStudiesCurriculumManager;

    constructor() {
        this.container = document.querySelector(`#tabs-container`) as HTMLDivElement;
        this.tabsNav = this.container.querySelector('#tabs') as HTMLElement;
        this.searchInput = document.querySelector('#search') as HTMLInputElement;
        this.alwaysOpenOutcomeCheckbox = document.getElementById('always-open-outcome') as HTMLInputElement;
        this.generalOutcomesContainer = document.getElementById('general-outcomes-container') as HTMLDivElement;
        this.clustersContainer = document.getElementById('clusters-container') as HTMLDivElement;
        this.outcomeTypesContainer = document.getElementById('outcome-types-container') as HTMLDivElement;
        this.skillTypesContainier = document.getElementById('skill-types-container') as HTMLDivElement;
        this.distinctiveLearningOutcomesContainer = document.getElementById('distinctive-learning-container') as HTMLDivElement;
        this.curriculumManager = new SocialStudiesCurriculumManager();
    }

    init() {
        if (this.tabsNav) {
            this.tabsNav.addEventListener('click', this.handleClick.bind(this));
        }
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.handleSearch.bind(this));
        }
        this.alwaysOpenOutcomeCheckbox.addEventListener('change', this.handleCheckboxChange.bind(this));
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
    }

    handleClick(event: Event) {
        const target = event.target as HTMLElement;
        if (target.dataset.ui) {
            this.setActiveTab(target.dataset.ui);
        }
    }

    handleSearch() {
        CookieManager.setCookie('searchQuery', this.searchInput.value, '/manitobaSocialStudiesCurriculum.html');
        this.filterContent();
    }

    handleCheckboxChange() {
        this.saveCheckboxStates();
        this.filterContent();
    }

    async loadClusters(tabId: string) {
        const activeGrade = tabId.replace('grade_', '').replace('#', '').toUpperCase();
        const clusters = this.curriculumManager.getClusters(tabId);
        const activeClusters = this.getActiveClusters(); // Always get active strands
        this.clustersContainer.innerHTML = "";

        // Merge active strands to ensure they are always visible
        const mergedClusters = [...new Set([...clusters, ...activeClusters])];

        mergedClusters.forEach(cluster => {
            const button = document.createElement('button');
            const clusterName = this.curriculumManager.clusters[activeGrade][cluster];
            button.classList.add('tiny-margin', 'surface', 'border', 'round');

            const clusterIcon = document.createElement('i');
            clusterIcon.innerText = socialStudiesClustersIconDictionary[clusterName];
            button.appendChild(clusterIcon);

            const text = document.createElement('span');
            text.textContent = clusterName;
            button.appendChild(text);

            const icon = document.createElement('i');
            icon.classList.add('mdi', 'hidden'); // default icon
            button.appendChild(icon);

            // Check if this strand is active
            if (activeClusters.includes(cluster)) {
                button.classList.add('fill');
                icon.classList.replace('hidden', 'mdi-check-circle');
            }

            button.addEventListener('click', () => {
                this.toggleCluster(button, cluster);
            });

            this.clustersContainer.appendChild(button);
        });
    }

    async loadOutcomeTypes(tabId: string) {
        const outcomes = this.curriculumManager.getOutcomeTypes(tabId);
        const activeOutcomeTypes = this.getActiveOutcomeTypes(); // Always get active skills
        this.outcomeTypesContainer.innerHTML = "";

        // Merge active skills to ensure they are always visible
        const mergedOutcomes = [...new Set([...outcomes, ...activeOutcomeTypes])];

        mergedOutcomes.forEach(outcome => {
            const button = document.createElement('button');
            const outcomeName = this.curriculumManager.outcomeTypes[outcome];
            button.classList.add('tiny-margin', 'surface', 'border', 'round');

            const outcomeIcon = document.createElement('i');
            outcomeIcon.innerText = outcomeTypesIconDictionary[outcomeName];
            button.appendChild(outcomeIcon);

            const span = document.createElement('span');
            span.textContent = outcomeName;
            button.appendChild(span);

            const icon = document.createElement('i');
            icon.classList.add('mdi', 'hidden'); // default icon
            button.appendChild(icon);

            // Check if this skill is active
            if (activeOutcomeTypes.includes(outcome)) {
                button.classList.add('fill');
                icon.classList.replace('hidden', 'mdi-check-circle');
            }

            button.addEventListener('click', () => {
                this.toggleOutcomeType(button, outcome);
            });

            this.outcomeTypesContainer.appendChild(button);
        });
    }

    async loadSkillTypes(tabId: string) {
        const outcomes = this.curriculumManager.getSkillTypes(tabId);
        const activeSkillTypes = this.getActiveSkillTypes(); // Always get active skills
        this.skillTypesContainier.innerHTML = "";

        // Merge active skills to ensure they are always visible
        const mergedOutcomes = [...new Set([...outcomes, ...activeSkillTypes])];

        mergedOutcomes.forEach(outcome => {
            const button = document.createElement('button');
            const outcomeName = this.curriculumManager.skillTypes[outcome];
            button.classList.add('tiny-margin', 'surface', 'border', 'round');

            const outcomeIcon = document.createElement('i');
            outcomeIcon.innerText = skillTypesIconDictionary[outcomeName];
            button.appendChild(outcomeIcon);

            const span = document.createElement('span');
            span.textContent = outcomeName;
            button.appendChild(span);

            const icon = document.createElement('i');
            icon.classList.add('mdi', 'hidden'); // default icon
            button.appendChild(icon);

            // Check if this skill is active
            if (activeSkillTypes.includes(outcome)) {
                button.classList.add('fill');
                icon.classList.replace('hidden', 'mdi-check-circle');
            }

            button.addEventListener('click', () => {
                this.toggleSkillType(button, outcome);
            });

            this.skillTypesContainier.appendChild(button);
        });
    }

    async loadGeneralOutcomes(tabId: string){
        const outcomes = this.curriculumManager.getGeneralOutcomes(tabId);
        const activeGeneralOutcomes = this.getActiveGeneralOutcomes(); // Always get active skills
        this.generalOutcomesContainer.innerHTML = "";

        // Merge active skills to ensure they are always visible
        const mergedOutcomes = [...new Set([...outcomes, ...activeGeneralOutcomes])];

        mergedOutcomes.forEach(outcome => {
            const button = document.createElement('button');
            const outcomeName = this.curriculumManager.generalOutcomes[outcome];
            button.classList.add('tiny-margin', 'surface', 'border', 'round');

            const outcomeIcon = document.createElement('i');
            outcomeIcon.innerText = generalLearningOutcomesIconDictionary[outcomeName];
            button.appendChild(outcomeIcon);

            const span = document.createElement('span');
            span.textContent = outcomeName;
            button.appendChild(span);

            const icon = document.createElement('i');
            icon.classList.add('mdi', 'hidden'); // default icon
            button.appendChild(icon);

            // Check if this skill is active
            if (activeGeneralOutcomes.includes(outcome)) {
                button.classList.add('fill');
                icon.classList.replace('hidden', 'mdi-check-circle');
            }

            button.addEventListener('click', () => {
                this.toggleGeneralOutcome(button, outcome);
            });

            this.generalOutcomesContainer.appendChild(button);
        });
    }

    async loadDistinctiveLearningOutcomes(tabId: string) {
        const outcomes = this.curriculumManager.getDistinctiveLearningOutcome(tabId);
        const activeDistinctiveLearningOutcomes = this.getActiveDistinctiveLearningOutcomes(); // Always get active skills
        this.distinctiveLearningOutcomesContainer.innerHTML = "";

        // Merge active skills to ensure they are always visible
        const mergedOutcomes = [...new Set([...outcomes, ...activeDistinctiveLearningOutcomes])];

        mergedOutcomes.forEach(outcome => {
            const button = document.createElement('button');
            const outcomeName = this.curriculumManager.distinctiveLearningOutcomes[outcome];
            button.classList.add('tiny-margin', 'surface', 'border', 'round');

            const outcomeIcon = document.createElement('i');
            outcomeIcon.innerText = distinctiveLearningOutcomesIconDictionary[outcomeName];
            button.appendChild(outcomeIcon);

            const span = document.createElement('span');
            span.textContent = outcomeName;
            button.appendChild(span);

            const icon = document.createElement('i');
            icon.classList.add('mdi', 'hidden'); // default icon
            button.appendChild(icon);

            // Check if this skill is active
            if (activeDistinctiveLearningOutcomes.includes(outcome)) {
                button.classList.add('fill');
                icon.classList.replace('hidden', 'mdi-check-circle');
            }

            button.addEventListener('click', () => {
                this.toggleDistinctiveLearningOutcome(button, outcome);
            });

            this.distinctiveLearningOutcomesContainer.appendChild(button);
        });
    }

    toggleCluster(button: HTMLButtonElement, strand: string) {
        const icons = button.querySelectorAll('i');
        const icon = icons[1];
        if (button.classList.contains('fill')) {
            button.classList.remove('fill');
            icon?.classList.replace('mdi-check-circle', 'hidden');
            this.removeActiveCluster(strand);
        } else {
            button.classList.add('fill');
            icon?.classList.replace('hidden', 'mdi-check-circle');
            this.addActiveCluster(strand);
        }
        this.filterContent();
    }

    toggleOutcomeType(button: HTMLButtonElement, outcomeType: string) {
        const icons = button.querySelectorAll('i');
        const icon = icons[1]; // Get the second icon
        if (button.classList.contains('fill')) {
            button.classList.remove('fill');
            icon?.classList.replace('mdi-check-circle', 'hidden');
            this.removeOutcomeType(outcomeType);
        } else {
            button.classList.add('fill');
            icon?.classList.replace('hidden', 'mdi-check-circle');
            this.addOutcomeType(outcomeType);
        }
        this.filterContent();
    }

    toggleSkillType(button: HTMLButtonElement, skillType: string) {
        const icons = button.querySelectorAll('i');
        const icon = icons[1]; // Get the second icon
        if (button.classList.contains('fill')) {
            button.classList.remove('fill');
            icon?.classList.replace('mdi-check-circle', 'hidden');
            this.removeSkillType(skillType);
        } else {
            button.classList.add('fill');
            icon?.classList.replace('hidden', 'mdi-check-circle');
            this.addSkillType(skillType);
        }
        this.filterContent();
    }

    toggleGeneralOutcome(button: HTMLButtonElement, generalOutcome: string) {
        const icons = button.querySelectorAll('i');
        const icon = icons[1]; // Get the second icon
        if (button.classList.contains('fill')) {
            button.classList.remove('fill');
            icon?.classList.replace('mdi-check-circle', 'hidden');
            this.removeGeneralOutcome(generalOutcome);
        } else {
            button.classList.add('fill');
            icon?.classList.replace('hidden', 'mdi-check-circle');
            this.addGeneralOutcome(generalOutcome);
        }
        this.filterContent();
    }

    toggleDistinctiveLearningOutcome(button: HTMLButtonElement, distingLearningOutcome: string){
        const icons = button.querySelectorAll('i');
        const icon = icons[1]; // Get the second icon
        if (button.classList.contains('fill')) {
            button.classList.remove('fill');
            icon?.classList.replace('mdi-check-circle', 'hidden');
            this.removeDistinctiveLearningOutcome(distingLearningOutcome);
        } else {
            button.classList.add('fill');
            icon?.classList.replace('hidden', 'mdi-check-circle');
            this.addDistinctiveLearningOutcome(distingLearningOutcome);
        }
        this.filterContent();
    }

    addActiveCluster(cluster: string) {
        const activeClusters = this.getActiveClusters();
        if (!activeClusters.includes(cluster)) {
            activeClusters.push(cluster);
            CookieManager.setCookie('activeClusters', JSON.stringify(activeClusters), '/manitobaSocialStudiesCurriculum.html');
        }
    }

    removeActiveCluster(cluster: string) {
        const activeClusters = this.getActiveClusters();
        const updatedClusters = activeClusters.filter(s => s !== cluster);
        CookieManager.setCookie('activeClusters', JSON.stringify(updatedClusters), '/manitobaSocialStudiesCurriculum.html');
    }

    addGeneralOutcome(skill: string) {
        const activeGeneralOutcomes = this.getActiveGeneralOutcomes();
        if (!activeGeneralOutcomes.includes(skill)) {
            activeGeneralOutcomes.push(skill);
            CookieManager.setCookie('activeGeneralOutcomes', JSON.stringify(activeGeneralOutcomes), '/manitobaSocialStudiesCurriculum.html');
        }
    }

    removeGeneralOutcome(skill: string) {
        const activeGeneralOutcomes = this.getActiveGeneralOutcomes();
        const updateGeneralOutcomes = activeGeneralOutcomes.filter(s => s !== skill);
        CookieManager.setCookie('activeGeneralOutcomes', JSON.stringify(updateGeneralOutcomes), '/manitobaSocialStudiesCurriculum.html');
    }

    addOutcomeType(outcomeType: string) {
        const activeOutcomeTypes = this.getActiveOutcomeTypes();
        if (!activeOutcomeTypes.includes(outcomeType)) {
            activeOutcomeTypes.push(outcomeType);
            CookieManager.setCookie('activeOutcomeTypes', JSON.stringify(activeOutcomeTypes), '/manitobaSocialStudiesCurriculum.html');
        }
    }

    removeOutcomeType(outcomeType: string) {
        const activeOutcomeTypes = this.getActiveOutcomeTypes();
        const updateOutcomeTypes = activeOutcomeTypes.filter(s => s !== outcomeType);
        CookieManager.setCookie('activeOutcomeTypes', JSON.stringify(updateOutcomeTypes), '/manitobaSocialStudiesCurriculum.html');
    }

    addSkillType(skillType: string) {
        const activeSkillTypes = this.getActiveSkillTypes();
        if (!activeSkillTypes.includes(skillType)) {
            activeSkillTypes.push(skillType);
            CookieManager.setCookie('activeSkillTypes', JSON.stringify(activeSkillTypes), '/manitobaSocialStudiesCurriculum.html');
        }
    }

    removeSkillType(skillType: string) {
        const activeSkillTypes = this.getActiveSkillTypes();
        const updateSkillTypes = activeSkillTypes.filter(s => s !== skillType);
        CookieManager.setCookie('activeSkillTypes', JSON.stringify(updateSkillTypes), '/manitobaSocialStudiesCurriculum.html');
    }

    addDistinctiveLearningOutcome(skill: string) {
        const activeDistinctiveLearningOutcomes = this.getActiveDistinctiveLearningOutcomes();
        if (!activeDistinctiveLearningOutcomes.includes(skill)) {
            activeDistinctiveLearningOutcomes.push(skill);
            CookieManager.setCookie('activeDistinctiveLearningOutcomes', JSON.stringify(activeDistinctiveLearningOutcomes), '/manitobaSocialStudiesCurriculum.html');
        }
    }

    removeDistinctiveLearningOutcome(skill: string) {
        const activeDistinctiveLearningOutcomes = this.getActiveDistinctiveLearningOutcomes();
        const updateDistinctiveLearningOutcomes = activeDistinctiveLearningOutcomes.filter(s => s !== skill);
        CookieManager.setCookie('activeDistinctiveLearningOutcomes', JSON.stringify(updateDistinctiveLearningOutcomes), '/manitobaSocialStudiesCurriculum.html');
    }

    getActiveClusters(): string[] {
        const activeClusters = CookieManager.getCookie('activeClusters');
        return activeClusters ? JSON.parse(activeClusters) : [];
    }

    getActiveOutcomeTypes(): string[] {
        const activeOutcomeTypes = CookieManager.getCookie('activeOutcomeTypes');
        return activeOutcomeTypes ? JSON.parse(activeOutcomeTypes) : [];
    }

    getActiveSkillTypes(): string[] {
        const activeSkillTypes = CookieManager.getCookie('activeSkillTypes');
        return activeSkillTypes ? JSON.parse(activeSkillTypes) : [];
    }

    getActiveGeneralOutcomes(): string[] {
        const activeGeneralOutcomes = CookieManager.getCookie('activeGeneralOutcomes');
        return activeGeneralOutcomes ? JSON.parse(activeGeneralOutcomes) : [];
    }

    getActiveDistinctiveLearningOutcomes(): string[] {
        const activeDistinctLearningOutcomes = CookieManager.getCookie('activeDistinctiveLearningOutcomes');
        return activeDistinctLearningOutcomes ? JSON.parse(activeDistinctLearningOutcomes) : [];
    }

    saveCheckboxStates() {
        CookieManager.setCookie('alwaysOpenOutcome', String(this.alwaysOpenOutcomeCheckbox.checked), '/manitobaSocialStudiesCurriculum.html');
    }

    loadSettingsFromCookies() {
        // Load search query from cookie
        const searchQuery = CookieManager.getCookie('searchQuery');
        if (searchQuery) {
            this.searchInput.value = searchQuery;
        }
        Promise.all([
            this.loadClusters(this.tabsNav.dataset.ui || '#grade_0'),
            this.loadOutcomeTypes(this.tabsNav.dataset.ui || '#grade_0'),
            this.loadSkillTypes(this.tabsNav.dataset.ui || '#grade_0'),
            this.loadGeneralOutcomes(this.tabsNav.dataset.ui || '#grade_0'),
            this.loadDistinctiveLearningOutcomes(this.tabsNav.dataset.ui || '#grade_0'),
        ]).catch(console.error);

        // Load always open settings
        this.alwaysOpenOutcomeCheckbox.checked = CookieManager.getCookie('alwaysOpenOutcome') === 'true';
    }

    setActiveTab(tabId: string) {
        this.tabsNav.querySelectorAll('a').forEach(tab => tab.classList.remove('active'));

        const selectedTab = this.tabsNav.querySelector(`a[data-ui="${tabId}"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
            CookieManager.setCookie('lastSelectedTab', tabId, '/manitobaSocialStudiesCurriculum.html');
        }
        Promise.all([
            this.filterContent(),
            this.loadClusters(tabId),
            this.loadOutcomeTypes(tabId),
            this.loadSkillTypes(tabId),
            this.loadGeneralOutcomes(tabId),
            this.loadDistinctiveLearningOutcomes(tabId),
        ]).catch(console.error);
    }

    setActiveTabFromCookie() {
        const lastSelectedTab = CookieManager.getCookie('lastSelectedTab') || '#grade_0';
        if (lastSelectedTab) {
            this.setActiveTab(lastSelectedTab);
        }
    }

    async filterContent() {
        const activeGrade = this.tabsNav.querySelector('a.active') as HTMLElement;
        if (activeGrade.dataset.ui) {
            const searchQuery = this.searchInput.value.toLowerCase();
            const filteredOutcomes = this.curriculumManager.filterData(
                activeGrade.dataset.ui,
                searchQuery,
                this.getActiveClusters(),
                this.getActiveOutcomeTypes(),
                this.getActiveSkillTypes(),
                this.getActiveDistinctiveLearningOutcomes(),
                this.getActiveGeneralOutcomes()
            );

            this.renderContent(filteredOutcomes, activeGrade.dataset.ui, searchQuery);
        }
    }

    async renderContent(filteredOutcomes: (SocialStudiesLearningOutcome | SocialStudiesSkill)[], activeGrade: string, searchQuery: string) {
        const contentDiv = document.getElementById('content');
        if (contentDiv) {
            contentDiv.innerHTML = '';

            // Check settings checkboxes
            const alwaysOpenOutcome = this.alwaysOpenOutcomeCheckbox.checked;

            let contentAdded = false;
            filteredOutcomes.forEach(learningOutcome => {
                contentAdded = true;
                const details = document.createElement('details');
                details.classList.add('s12', 'm12', 'l12', 'learning-outcome');

                if (alwaysOpenOutcome || (searchQuery && (learningOutcome.specificLearningOutcome.toLowerCase().includes(searchQuery.toLowerCase())))) {
                    details.setAttribute('open', '');
                }

                const summary = document.createElement('summary');
                summary.classList.add('bold', 'row', 'no-space');
                const title = learningOutcome.getID(activeGrade.replace("#grade_", ""));

                const summaryText = document.createElement('span');
                summaryText.classList.add('max');
                summaryText.innerHTML = searchQuery ? title.replace(new RegExp(searchQuery, 'gi'), (match) => `<span class="highlight">${match}</span>`) : title;

                summary.appendChild(summaryText);

                const copyOutcomeButton = document.createElement('button');
                copyOutcomeButton.classList.add('small-round', 'chip', 'no-border');

                const icon = document.createElement('i');
                icon.classList.add('mdi', 'mdi-clipboard-outline');

                copyOutcomeButton.appendChild(icon);
                copyOutcomeButton.onclick = function () {
                    ui('#copy-outcome-snackbar', 2000);
                    navigator.clipboard.writeText(`${learningOutcome.getID(activeGrade.replace("#grade_", ""))} ${learningOutcome.specificLearningOutcome}`);
                }

                const shareButton = document.createElement('button');
                shareButton.classList.add('small-round', 'chip', 'no-border');

                const shareIcon = document.createElement('i');
                shareIcon.classList.add('mdi', 'mdi-share-variant');
                shareButton.appendChild(shareIcon);
                shareButton.onclick = function () {
                    if (navigator.share) {
                        navigator.share({
                            title: `Manitoba Social Studies Curriculum - Grade ${activeGrade.replace("#grade_", "")}`,
                            url: `/manitobaSocialStudiesCurriculum.html?grade=${activeGrade.replace("#grade_", "")}&outcome=${learningOutcome.getID(activeGrade.replace("#grade_", ""))}`
                        })
                            .then(() => console.log('Shared successfully'))
                            .catch(error => console.error('Error sharing:', error));
                    }
                }

                summary.appendChild(shareButton);
                summary.appendChild(copyOutcomeButton);

                details.appendChild(summary);

                const skillDiv = document.createElement('div');

                if ('cluster' in learningOutcome && learningOutcome.cluster){
                    const clusterButton = document.createElement('button');
                    const clusterName = this.curriculumManager.clusters[activeGrade.replace("#grade_", "")][learningOutcome.cluster]
                    clusterButton.classList.add('tiny-margin', 'chip');
                    if (this.getActiveClusters().includes(learningOutcome.cluster)) {
                        clusterButton.classList.add('fill');
                    }
                    // button.onclick = function () {
                    //     ui(`#${skill}-dialog`);
                    // }

                    const clusterIcon = document.createElement('i');
                    clusterIcon.classList.add('primary-text');
                    clusterIcon.textContent = socialStudiesClustersIconDictionary[clusterName];

                    const clusterSpan = document.createElement('span');
                    clusterSpan.textContent = clusterName;

                    clusterButton.appendChild(clusterIcon);
                    clusterButton.appendChild(clusterSpan);

                    skillDiv.appendChild(clusterButton);
                }

                const outcomeTypeButton = document.createElement('button');
                const outcomeTypeName = this.curriculumManager.outcomeTypes[learningOutcome.outcomeType]
                outcomeTypeButton.classList.add('tiny-margin', 'chip');
                if (this.getActiveOutcomeTypes().includes(learningOutcome.outcomeType)) {
                    outcomeTypeButton.classList.add('fill');
                }
                // button.onclick = function () {
                //     ui(`#${skill}-dialog`);
                // }

                const outcomeTypeIcon = document.createElement('i');
                outcomeTypeIcon.classList.add('primary-text');
                outcomeTypeIcon.textContent = outcomeTypesIconDictionary[outcomeTypeName];

                const outcomeTypeSpan = document.createElement('span');
                outcomeTypeSpan.textContent = outcomeTypeName;

                outcomeTypeButton.appendChild(outcomeTypeIcon);
                outcomeTypeButton.appendChild(outcomeTypeSpan);

                skillDiv.appendChild(outcomeTypeButton);

                if ('generalLearningOutcome' in learningOutcome && learningOutcome.generalLearningOutcome){
                    const generalLearningOutcomeButton = document.createElement('button');
                    const generalLearningOutcomeName = this.curriculumManager.generalOutcomes[learningOutcome.generalLearningOutcome]
                    generalLearningOutcomeButton.classList.add('tiny-margin', 'chip');
                    if (this.getActiveGeneralOutcomes().includes(learningOutcome.generalLearningOutcome)) {
                        generalLearningOutcomeButton.classList.add('fill');
                    }
                    // button.onclick = function () {
                    //     ui(`#${skill}-dialog`);
                    // }

                    const generalLearningOutcomeIcon = document.createElement('i');
                    generalLearningOutcomeIcon.classList.add('primary-text');
                    generalLearningOutcomeIcon.textContent = generalLearningOutcomesIconDictionary[generalLearningOutcomeName];

                    const generalLearningOutcomeSpan = document.createElement('span');
                    generalLearningOutcomeSpan.textContent = generalLearningOutcomeName;

                    generalLearningOutcomeButton.appendChild(generalLearningOutcomeIcon);
                    generalLearningOutcomeButton.appendChild(generalLearningOutcomeSpan);

                    skillDiv.appendChild(generalLearningOutcomeButton);
                }

                if ('distinctiveLearningOutcome' in learningOutcome && learningOutcome.distinctiveLearningOutcome){
                    const distinctLearningOutcomeButton = document.createElement('button');
                    const distinctiveLearningOutcomeName = this.curriculumManager.distinctiveLearningOutcomes[learningOutcome.distinctiveLearningOutcome];
                    distinctLearningOutcomeButton.classList.add('tiny-margin', 'chip');
                    if (this.getActiveDistinctiveLearningOutcomes().includes(learningOutcome.distinctiveLearningOutcome)) {
                        distinctLearningOutcomeButton.classList.add('fill');
                    }

                    // button.onclick = function () {
                    //     ui(`#${skill}-dialog`);
                    // }

                    const distinctLearningOutcomeIcon = document.createElement('i');
                    distinctLearningOutcomeIcon.classList.add('primary-text');
                    distinctLearningOutcomeIcon.textContent = distinctiveLearningOutcomesIconDictionary[distinctiveLearningOutcomeName];

                    const distinctLearningOutcomeSpan = document.createElement('span');
                    distinctLearningOutcomeSpan.textContent = distinctiveLearningOutcomeName;

                    distinctLearningOutcomeButton.appendChild(distinctLearningOutcomeIcon);
                    distinctLearningOutcomeButton.appendChild(distinctLearningOutcomeSpan);

                    skillDiv.appendChild(distinctLearningOutcomeButton);
                }

                if ('skillType' in learningOutcome && learningOutcome.skillType){
                    const skillTypeButton = document.createElement('button');
                    const skillTypeomeName = this.curriculumManager.skillTypes[learningOutcome.skillType];
                    skillTypeButton.classList.add('tiny-margin', 'chip');
                    if (this.getActiveSkillTypes().includes(learningOutcome.skillType)) {
                        skillTypeButton.classList.add('fill');
                    }

                    // button.onclick = function () {
                    //     ui(`#${skill}-dialog`);
                    // }

                    const skillTypeIcon = document.createElement('i');
                    skillTypeIcon.classList.add('primary-text');
                    skillTypeIcon.textContent = skillTypesIconDictionary[skillTypeomeName];

                    const skillTypeSpan = document.createElement('span');
                    skillTypeSpan.textContent = skillTypeomeName;

                    skillTypeButton.appendChild(skillTypeIcon);
                    skillTypeButton.appendChild(skillTypeSpan);

                    skillDiv.appendChild(skillTypeButton);
                }

                details.appendChild(skillDiv);

                const sloContent = searchQuery ? learningOutcome.specificLearningOutcome.replace(new RegExp(searchQuery, 'gi'), (match) => `<span class="highlight">${match}</span>`) : learningOutcome.specificLearningOutcome;

                const sloText = document.createElement('p');
                sloText.classList.add('no-line', 'bottom-margin');
                sloText.innerHTML = 'It is expected that students will: ' + sloContent;

                details.appendChild(sloText);

                const buttonRowDiv = document.createElement('div');
                buttonRowDiv.classList.add('row');
                const createLessonPlanButton = document.createElement('button');
                createLessonPlanButton.classList.add('small-round');
                createLessonPlanButton.textContent = 'Create Lesson Plan';
                createLessonPlanButton.onclick = function () {
                    window.open(`/lessonPlan.html?curriculum=math&outcome=${learningOutcome.getID(activeGrade.replace("#grade_", ""))}`, '_blank');
                }
                buttonRowDiv.appendChild(createLessonPlanButton);
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
