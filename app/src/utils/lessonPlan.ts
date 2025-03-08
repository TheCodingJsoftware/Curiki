import natsort from "natsort";

export type LessonPlanTemplate = {
    id: string;
    authorName: string;
    topicTitle: string;
    lessonName: string;
    gradeLevel: string;
    timeLength: string;
    date: string;
    outcomes: { [key: string]: string };
    activate: string;
    activateTime: string;
    acquire: string;
    acquireTime: string;
    apply: string;
    applyTime: string;
    closure: string;
    closureTime: string;
    assessmentEvidence: any[];
    materialsConsidered: string;
    studentSpecificPlanning: string;
    reflections: string;
    crossCurricularConnections: string;
    modifiedDate: string;
    resourceLinks: string[];
    source?: 'local' | 'public';
};

let usesChromeStorage: boolean = false;
let db: IDBDatabase;

export async function initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('LessonPlansDB', 1);

        request.onerror = (event) => {
            console.error('Error opening IndexedDB:', event);
            reject(event); // Reject the promise on error
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('lessonPlans')) {
                db.createObjectStore('lessonPlans', { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(); // Resolve the promise on success
        };
    });
}

export function generateLessonPlan(topicTitle: string, lessonName: string, gradeLevel: string, outcomes: { [key: string]: string }, date: string): LessonPlanTemplate {
    return {
        id: "",
        authorName: localStorage.getItem('authorName') || '',
        lessonName: lessonName,
        topicTitle: topicTitle,
        gradeLevel: gradeLevel,
        timeLength: "~ 60 minutes",
        date: date,
        outcomes: outcomes,
        activate: "",
        activateTime: "~ 5 minutes",
        acquire: "",
        acquireTime: "~ 15 minutes",
        apply: "",
        applyTime: "~ 30 minutes",
        closure: "",
        closureTime: "~ 10 minutes",
        assessmentEvidence: [],
        materialsConsidered: "",
        studentSpecificPlanning: "",
        reflections: "",
        crossCurricularConnections: "",
        modifiedDate: new Date().toString(),
        resourceLinks: []
    };
}

export async function getAllLocalLessonPlans(): Promise<LessonPlanTemplate[]> {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('Database not initialized');
            return;
        }
        const transaction = db.transaction(['lessonPlans'], 'readonly');
        const store = transaction.objectStore('lessonPlans');
        const request = store.getAll();
        request.onsuccess = () => {
            const lessonPlans = request.result as LessonPlanTemplate[];
            lessonPlans.forEach(plan => plan.source = 'local');
            resolve(lessonPlans);
        };
        request.onerror = () => {
            reject('Error fetching lesson plans');
        };
    });
}

export async function getAllPublicLessonPlans(): Promise<LessonPlanTemplate[]> {
    try {
        const response = await fetch('https://pinecone.synology.me/curiki');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 'success') {
            return result.data.map((item: any) => ({ ...item.data, source: 'public' } as LessonPlanTemplate));
    } else {
            console.error('Failed to load public lesson plans:', result.message || 'Unknown error');
            return [];
        }
    } catch (error) {
        console.error('Error fetching public lesson plans:', error);
        return [];
    }
}

export async function createLessonPlan(
    topicTitle: string,
    lessonName: string,
    gradeLevel: string,
    outcomes: { [key: string]: string },
    date: string,
    hashtag: string
    ): Promise<any> {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return new Promise((resolve, reject) => {
        const lessonPlan = generateLessonPlan(topicTitle, lessonName, gradeLevel, outcomes, date);
        lessonPlan.id = hashtag;

        const transaction = db.transaction(['lessonPlans'], 'readwrite');
        const store = transaction.objectStore('lessonPlans');
        const request = store.add(lessonPlan);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = (event) => {
            reject(false);
        };
    });
}

export async function deleteLessonPlan(id: string): Promise<boolean> {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['lessonPlans'], 'readwrite');
        const store = transaction.objectStore('lessonPlans');
        const request = store.delete(id);
        request.onsuccess = () => {
            resolve(true);
        };
        request.onerror = (event) => {
            reject(false);
        };
    });
}

export async function getAllLessonPlans(): Promise<LessonPlanTemplate[]> {
    let localLessonPlans: LessonPlanTemplate[] = [];
    let publicLessonPlans: LessonPlanTemplate[] = [];
    try {
        localLessonPlans = await getAllLocalLessonPlans();
        publicLessonPlans = await getAllPublicLessonPlans();
    } catch (error) {
        console.error('Error fetching lesson plans:', error);
    }

    return [...localLessonPlans, ...publicLessonPlans];
}

export async function getSortedLessonPlans(): Promise<LessonPlanTemplate[]> {
    let lessonPlans = await getAllLessonPlans();

    const sorter = natsort(); // Natural sorting

    lessonPlans.sort((a, b) => {
        const topicComparison = sorter(a.topicTitle, b.topicTitle);
        if (topicComparison !== 0) return topicComparison;

        const lessonComparison = sorter(a.lessonName, b.lessonName);
        if (lessonComparison !== 0) return lessonComparison;

        return sorter(a.authorName, b.authorName);
    });

    return lessonPlans;
}

export async function getAllResourceLinks(lessonPlan: LessonPlanTemplate): Promise<string[]> {
    return lessonPlan.resourceLinks;
}

// Immediately invoked function to initialize the database on startup
(async () => {
    try {
        await initDB();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
})();