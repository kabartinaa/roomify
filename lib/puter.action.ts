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

export const createProject = async ({ item, visibility = "private" }: CreateProjectParams):
Promise<DesignItem | null | undefined> => {
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

    const project: DesignItem = {
        ...rest,
        sourceImage: resolvedSource,
        renderedImage: resolvedRender,
        sourcePath: hostedSource?.path || item.sourcePath || null,
        renderedPath: hostedRender?.path || item.renderedPath || null,
        publicPath: hostedSource?.url || item.publicPath || null,
        visibility,
    };

    const persisted = await persistProject(project);
    if (!persisted) {
        return null;
    }

    return persisted;
};




