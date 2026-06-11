import {PUTER_WORKER_URL} from "./constants";

import puter from "@heyputer/puter.js";
import { getOrCreateHostingConfig, uploadImageToHosting } from "./puter.hosting";
import { isHostedUrl } from "./utils";
export const signIn = async () => await puter.auth.signIn();
export const signOut =  () =>  puter.auth.signOut();



// Check whether user already logged in

// This is VERY important.

// Because when page refreshes:

// React state disappears
export const getCurrentUser = async () => {
    try{
//         can fail if:

// user not logged in
// token expired
// internet issue
        return await puter.auth.getUser();

        // so instead 
    }
    catch{
        //safe fallback.
        return null;
    }
}

// about storing the details of project section in website
//This function creates a project and ensures that the project's 
// images are uploaded to the application's hosting storage.
const persistProject = async (project: DesignItem): Promise<DesignItem | null> => {
    try {
        const success = await puter.kv.set(`roomify_project_${project.id}`, project);
        if (!success) {
            console.error("Failed to persist project to KV", project.id);
            return null;
        }
        return project;
    } catch (error) {
        console.error("Failed to persist project to KV", error);
        return null;
    }
};


// item gets the input from visualizer one the source image is updated and redendred image is generated 
export const createProject = async ({ item, visibility = "private" }: CreateProjectParams):
Promise<DesignItem | null | undefined> => {

    // check if backend working or not 
    if(!PUTER_WORKER_URL)
    {
        console.warn("Missing puter_worker_url");
        return null;
    }
    const projectId = item.id;

    const hosting = await getOrCreateHostingConfig();

    const hostedSource = projectId
        ? await uploadImageToHosting({
              hosting,
              url: item.sourceImage,
              projectId,
              label: "source",
          })
        : null;

    const hostedRender = projectId && item.renderedImage
        ? await uploadImageToHosting({
              hosting,
              url: item.renderedImage,
              projectId,
              label: "rendered",
          })
        : null;

    const resolvedSource = hostedSource?.url || item.sourceImage;
    if (!resolvedSource) {
        console.error("Failed to resolve source image for project", item.id);
        return null;
    }
    const resolvedRender = hostedRender?.url || item.renderedImage || undefined;

    const {
        sourcePath: _sourcePath,
        renderedPath: _renderedPath,
        publicPath: _publicPath,
        ...rest
    } = item;

    // const project: DesignItem = {
    //     ...rest,
    //     sourceImage: resolvedSource,
    //     renderedImage: resolvedRender,
    //     sourcePath: hostedSource?.path || item.sourcePath || null,
    //     renderedPath: hostedRender?.path || item.renderedPath || null,
    //     publicPath: hostedSource?.url || item.publicPath || null,
    //     visibility,
    // };

    // const persisted = await persistProject(project);
    // if (!persisted) {
    //     return null;
    // }

    // return persisted;

    const payload ={
        ...rest,
        sourceImage: resolvedSource,
        renderedImage: resolvedRender,
    }

    try {

        // call puter_worker_url to store the project in kv
        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/save`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                project: payload,
                visibility,
            }),
        });

        if(!response.ok)
        {
            console.error("failed to save the project" , await response.text());
            return null;
        }

        // if got saved correct , etract the data from it
        const data = (await response.json()) as {project?:DesignItem | null};

        return data?.project ?? null;

        
    } catch (e) {
        console.log("failed to save the project" , e);
        return null;
    }

};

// to list the projects
export const getProjects = async () => {
    if(!PUTER_WORKER_URL)
    {
        console.warn("Missing VITE PUTER URL");
        return [];
    }
    // if have
    try {
        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/list` , {method:"GET"});
        if(!response.ok){
            console.error("feiled to list the histroy" , await response.text())
            return [];
        } 
        const data = (await response.json()) as {projects?:DesignItem[] | null};
        return Array.isArray(data?.projects) ? data?.projects:[];
    } catch (e) {
        console.error("failed to fetch the project" , e);
    }
}

export const getProjectById = async ({ id }: { id: string }) => {
    if (!PUTER_WORKER_URL) {
        console.warn("Missing VITE_PUTER_WORKER_URL; skipping project fetch.");
        return null;
    }

    console.log("Fetching project with ID:", id);

    try {
        const response = await puter.workers.exec(
            `${PUTER_WORKER_URL}/api/projects/get?id=${encodeURIComponent(id)}`,
            { method: "GET" },
        );

        console.log("Fetch project response:", response);

        if (!response.ok) {
            console.error("Failed to fetch project:", await response.text());
            return null;
        }

        const data = (await response.json()) as {
            project?: DesignItem | null;
        };

        console.log("Fetched project data:", data);

        return data?.project ?? null;
    } catch (error) {
        console.error("Failed to fetch project:", error);
        return null;
    }
};

// call everything in visualizer 



