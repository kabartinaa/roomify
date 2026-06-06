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
export const createProject = async ({item} : CreateProjectParams) :
Promise<DesignItem | null | undefined> => {
    const projectId = item.id;

    const hosting = await getOrCreateHostingConfig();  //Gets an existing hosting configuration or creates one if it doesn't exist.

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

    // Prefer a hosted URL if available, but keep the original image data if hosting failed.
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
        
    // send to puter
const payload = {
    ...rest,
    sourceImage: resolvedSource,
    renderedImage: resolvedRender,
}

try{
    // if all works , call puter Worker to store project in kv
    return payload;
}
catch(e){
    console.error("Failed to create project " , e);
    return null;
}


}




