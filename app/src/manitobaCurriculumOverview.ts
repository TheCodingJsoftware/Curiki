import 'beercss';
import 'material-dynamic-colors';
import '../static/css/style.css';
import '../static/css/manitoba-theme.css';
import { combinedIconDictionary } from './utils/icons';


type OverviewSummaryData = {
    math: {
        strands: string[];
        processes: string[];
    };
    science: {
        scientific_literacy: string[];
        general_learning_outcomes: string[];
    }
    social_studies: {
        general_learning_outcomes: string[];
        skills_and_competencies: string[];
    };
    ela: {
        practices: string[];
        lenses: string[];
    };
};

type Curriculum = {
    overview_summary: OverviewSummaryData;
    overview_data: {[key: string]: string[]};
    grade_summary: { [key: string]: GradeData };
};

type GradeData = {
    math: {
        [category: string]: string[];
    };
    social_studies: {
        [category: string]: string[];
    };
    science: {
        [category: string]: string[];
    };
};

const resources: { [subject: string]: { [grade: string]: { [key: string]: string } } } = {
    "science": {
        "grade_one": {
            "Grade 1 Science at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr1science.pdf",
        },
        "grade_two": {
            "Grade 2 Science at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr2science.pdf",
        },
        "grade_three": {
            "Grade 3 Science at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr3science.pdf",
        },
        "grade_four": {
            "Grade 4 Science at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr4science.pdf",
        },
        "grade_five": {
            "Grade 5 Science at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr5science.pdf",
        },
        "grade_six": {
            "Grade 6 Science at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr6science.pdf",
        },
        "grade_seven": {
            "Grade 7 Science at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr7science.pdf",
        },
        "grade_eight": {
            "Grade 8 Science at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr8science.pdf",
        },
    },
    "mathematics": {
        "grade_one": {
            "Grade 1 Mathematics at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr1math.pdf",
        },
        "grade_two": {
            "Grade 2 Mathematics at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr2math.pdf",
        },
        "grade_three": {
            "Grade 3 Mathematics at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr3math.pdf",
        },
        "grade_four": {
            "Grade 4 Mathematics at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr4math.pdf",
        },
        "grade_five": {
            "Grade 5 Mathematics at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr5math.pdf",
        },
        "grade_six": {
            "Grade 6 Mathematics at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr6math.pdf",
        },
        "grade_seven": {
            "Grade 7 Mathematics at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr7math.pdf",
        },
        "grade_eight": {
            "Grade 8 Mathematics at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr8math.pdf",
        },
    },
    "social_studies": {
        "grade_one": {
            "Grade 1 Social Studies at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr1ss.pdf",
        },
        "grade_two": {
            "Grade 2 Social Studies at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr2ss.pdf",
        },
        "grade_three": {
            "Grade 3 Social Studies at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr3ss.pdf",
        },
        "grade_four": {
            "Grade 4 Social Studies at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr4ss.pdf",
        },
        "grade_five": {
            "Grade 5 Social Studies at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr5ss.pdf",
        },
        "grade_six": {
            "Grade 6 Social Studies at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr6ss.pdf",
        },
        "grade_seven": {
            "Grade 7 Social Studies at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr7ss.pdf",
        },
        "grade_eight": {
            "Grade 8 Social Studies at a Glance": "https://www.edu.gov.mb.ca/k12/cur/essentials/docs/gr8ss.pdf",
        },
    }
}
class CurriculumLoader {
    private data: Curriculum | null = null;

    async loadData(): Promise<void> {
        try {
            const response = await fetch('/static/data/overview.json');
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.statusText}`);
            }
            this.data = await response.json();
        } catch (error) {
            console.error("Error loading curriculum data:", error);
        }
    }

    getOverviewSummaryData(): OverviewSummaryData | null {
        return this.data?.overview_summary || null;
    }

    getOverviewData(): { [key: string]: string[] } {
        return this.data?.overview_data || {};
    }

    getGradeData(): { [key: string]: GradeData } {
        if (this.data?.grade_summary) {
            return this.data?.grade_summary;
        }
        return {};
    }
}

class Page {
    private curriculumLoader = new CurriculumLoader();
    private overviewSummaryData: OverviewSummaryData | null = null;
    private overviewData: { [key: string]: string[] } | null = null;
    private gradeData: { [key: string]: GradeData } | null = null;

    constructor() {
        this.init();
    }

    async init(): Promise<void> {
        await this.curriculumLoader.loadData();
        this.overviewSummaryData = this.curriculumLoader.getOverviewSummaryData();
        this.overviewData = this.curriculumLoader.getOverviewData();
        this.gradeData = this.curriculumLoader.getGradeData();
        this.loadOverview();
        for (const [grade, gradeData] of Object.entries(this.gradeData)) {
            this.loadGrade(grade, gradeData);
        }
    }

    createOverviewButton(title: string): HTMLButtonElement {
        const button = document.createElement("button");
        button.classList.add("s12", "m6", "l4", "transparent", "left-align", "link", "small-round", "border");
        const icon = document.createElement("i");
        icon.innerHTML = combinedIconDictionary[title];
        button.appendChild(icon);
        const span = document.createElement("span");
        span.innerHTML = title;
        button.appendChild(span);
        button.addEventListener("click", () => {
            this.openOverviewDataDialog(title);
        });
        return button;
    }

    createArticle(title: string, categories: { [key: string]: string[] }): HTMLElement {
        const article = document.createElement("article");
        article.classList.add("round");
        article.innerHTML = `
            <h4>${title}</h4>
            <hr>
            ${Object.entries(categories).map(([category, items]) => `
            <table>
                <thead>
                    <tr>
                        <th>
                            ${category.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="grid tiny-space" id="${category}">
                        </td>
                    </tr>
                </tbody>
            </table>`).join('')}
        `;
        Object.entries(categories).forEach(([category, items]) => {
            const categoryDiv = article.querySelector(`#${category}`) as HTMLDivElement;
            items.forEach(item => {
                categoryDiv.appendChild(this.createOverviewButton(item));
            });
        });
        return article;
    }

    loadOverview(): void {
        if (!this.overviewSummaryData) {
            console.warn("Overview data not available yet.");
            return;
        }
        const overviewDiv = document.getElementById('overview') as HTMLDivElement;
        const mathematicsArticle = this.createArticle("Mathematics", this.overviewSummaryData.math);
        const scienceArticle = this.createArticle("Science", this.overviewSummaryData.science);
        const socialStudiesArticle = this.createArticle("Social Studies", this.overviewSummaryData.social_studies);
        const elaArticle = this.createArticle("English Language Arts", this.overviewSummaryData.ela);

        overviewDiv.appendChild(mathematicsArticle);
        overviewDiv.appendChild(scienceArticle);
        overviewDiv.appendChild(socialStudiesArticle);
        overviewDiv.appendChild(elaArticle);
    }

    loadGrade(grade: string, gradeData: GradeData): void {
        const gradeDiv = document.getElementById(grade) as HTMLDivElement;
        gradeDiv.innerHTML = `
            <article class="round">
                <h4>Mathematics</h4>
                <hr>
                <div class="grid" id="math-${grade}"></div>
                <h6>Resources</h6>
                <hr>
                <div class="tiny-padding" id="math-resources-${grade}"></div>
            </article>
            <article class="round">
                <h4>Social Studies</h4>
                <hr>
                <div class="grid" id="social_studies-${grade}"></div>
                <h6>Resources</h6>
                <hr>
                <div class="tiny-padding" id="social_studies-resources-${grade}"></div>
            </article>
            <article class="round">
                <h4>Science</h4>
                <hr>
                <div class="grid" id="science-${grade}"></div>
                <h6>Resources</h6>
                <hr>
                <div class="tiny-padding" id="science-resources-${grade}"></div>
            </article>
        `;
        const mathematicsDiv = document.getElementById(`math-${grade}`) as HTMLDivElement;
        const socialStudiesDiv = document.getElementById(`social_studies-${grade}`) as HTMLDivElement;
        const scienceDiv = document.getElementById(`science-${grade}`) as HTMLDivElement;

        const mathResourcesDiv = document.getElementById(`math-resources-${grade}`) as HTMLDivElement;
        const socialStudiesResourcesDiv = document.getElementById(`social_studies-resources-${grade}`) as HTMLDivElement;
        const scienceResourcesDiv = document.getElementById(`science-resources-${grade}`) as HTMLDivElement;

        this.loadGradeData(gradeData.math, mathematicsDiv);
        this.loadGradeData(gradeData.social_studies, socialStudiesDiv);
        this.loadGradeData(gradeData.science, scienceDiv);

        this.loadResources(resources["mathematics"][grade], mathResourcesDiv);
        this.loadResources(resources["social_studies"][grade], socialStudiesResourcesDiv);
        this.loadResources(resources["science"][grade], scienceResourcesDiv);
    }

    loadGradeData(gradeData: { [key: string]: string[] }, div: HTMLDivElement): void {
        if (!this.gradeData) {
            console.warn("Grade data not available yet.");
            return;
        }
        for (const [category, strands] of Object.entries(gradeData)) {
            div.innerHTML += `
                <table class="s12 m6 l6">
                    <thead>
                        <tr><th>${category}</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <ol>
                                    ${strands.map(strand => `<li>${strand}</li>`).join('')}
                                </ol>
                            </td>
                        </tr>
                    </tbody>
                </table>
            `;
        }
    }

    loadResources(resourceData: { [key: string]: string }, div: HTMLDivElement): void {
        Object.entries(resourceData).forEach(([resourceName, resourceLink]) => {
            const resourceDiv = document.createElement("a");
            resourceDiv.classList.add('link', 'transparent', 'wave', 'small-round', 'small-padding', 'tiny-margin')
            resourceDiv.href = resourceLink
            resourceDiv.innerHTML = `
                <span class="tiny-padding underline no-line">${resourceName}</span>
                <i>open_in_new</i>
            `;
            div.appendChild(resourceDiv);
        });
    }

    openOverviewDataDialog(title: string): void {
        if (!this.overviewData) {
            console.warn("Overview data not available yet.");
            return;
        }
        const safeTitle = title.replace(/ /g, '_').toLowerCase().replace(/,/g, '').replace(/\(/g, '').replace(/\)/g, '');
        const dialog = document.createElement("dialog");
        dialog.classList.add("right", "medium-width");
        dialog.id = safeTitle;
        dialog.innerHTML = `
            <div class="row no-padding no-margin">
                <i>${combinedIconDictionary[title]}</i>
                <h5 class="max">${title}</h5>
            </div>
            <div id="dialog-content">
            </div>
            <div class="right-align">
                <button id="close-button" class="transparent link vertical extra">
                    <span>Close</span>
                </button>
            </div>
        `;
        const dialogContent = dialog.querySelector('#dialog-content') as HTMLDivElement;
        this.overviewData[title].forEach(item => {
            const p = document.createElement("p");
            p.innerHTML = item;
            dialogContent.appendChild(p);
        });
        const closeButton = dialog.querySelector('#close-button') as HTMLButtonElement;
        closeButton.addEventListener("click", () => {
            ui(`#${safeTitle}`);
            setTimeout(() => {
                dialog.remove();
            }, 250);
        });
        document.body.appendChild(dialog);
        ui(`#${safeTitle}`);
    }
}

function setTheme(theme: string): void {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);

    const themeIcon = document.getElementById("theme-icon") as HTMLElement;
    themeIcon.innerText = theme === "light" ? "dark_mode" : "light_mode";

    const icons = document.querySelectorAll('.icon') as NodeListOf<HTMLElement>;
    icons.forEach(icon => {
        icon.style.filter = theme === 'light' ? 'invert(1)' : 'invert(0)';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById("theme-toggle") as HTMLInputElement;
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.body.classList.contains("dark") ? "dark" : "light";
        setTheme(currentTheme === "dark" ? "light" : "dark");
    });

    themeToggle.checked = localStorage.getItem("theme") === "dark";
    setTheme(localStorage.getItem("theme") || "light");

    new Page(); // Automatically loads curriculum on page load
});
