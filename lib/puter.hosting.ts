//handles uploading and downloading of files to the server

import { createHostingSlug, fetchBlobFromUrl, getHostedUrl, getImageExtension, HOSTING_CONFIG_KEY , imageUrlToPngBlob, isHostedUrl } from "./utils";

import puter from "@heyputer/puter.js";



export const getOrCreateHostingConfig = async (): Promise<HostingConfig | null> => {
    const existing = (await puter.kv.get(HOSTING_CONFIG_KEY)) as HostingConfig | null;

    if (existing?.subdomain) {
        return { subdomain: existing.subdomain };
    }

    const subdomain = createHostingSlug();

    const requestManageSubdomains = async () => {
        const perms = puter.perms as any;
        if (typeof perms?.requestManageSubdomains === 'function') {
            return await perms.requestManageSubdomains();
        }
        return true;
    };

    try {
        const created = await puter.hosting.create(subdomain, '.');
        if (created?.subdomain) {
            await puter.kv.set(HOSTING_CONFIG_KEY, { subdomain: created.subdomain });
            return { subdomain: created.subdomain };
        }
        return null;
    } catch (e) {
        console.error('Error creating hosting config', e);
    }

    const granted = await requestManageSubdomains();
    if (!granted) {
        console.warn('Subdomain management permission denied. Hosting will remain unavailable.');
        return null;
    }

    try {
        const created = await puter.hosting.create(subdomain, '.');
        if (created?.subdomain) {
            await puter.kv.set(HOSTING_CONFIG_KEY, { subdomain: created.subdomain });
            return { subdomain: created.subdomain };
        }
        return null;
    } catch (e) {
        console.error('Error creating hosting config after permission request', e);
        return null;
    }
};
export const uploadImageToHosting = async ({hosting , url , projectId , label} :
    StoreHostedImageParams ) : Promise<HostedAsset | null> => 
        {
            if(!hosting || !url) return null;
            if(isHostedUrl(url)) return {url};
            try{
                const resolved = label === "rendered"  
                ? await imageUrlToPngBlob(url).
                then(
                    (blob) => blob ? {blob , contentType: "image/png"} : null
                )
                : await fetchBlobFromUrl(url);  // blog - binary format of the image data fetched from the url. contentType - mime type of the image.

                if(!resolved) return null;

                const contentType = resolved.contentType || resolved.blob.type || '';

                const ext = getImageExtension(contentType , url);
                //image/png → .png
                //image/jpeg → .jpg


                // image is stored 
                const dir = `projects/${projectId}`;
                const filePath = `${dir}/${label}.${ext}`;
                // projects/101/rendered.png

                const uploadFile = new File([resolved.blob], `${label}.${ext}` , {type: contentType});

                // await puter.fs.mkdir(dir , {createMissingParents: true});   // projects/101
                // await puter.fs.write(filePath , uploadFile);   // Stores the image in hosting storage.

                await puter.fs.write(filePath , uploadFile, {
                    createMissingParents: true,
                });   // Stores the image in hosting storage.
                const hostedUrl = getHostedUrl({subdomain: hosting.subdomain}, filePath);
                return hostedUrl ? { url: hostedUrl, path: filePath } : null;

            }
            catch(e){
                console.error(`Failed to store hosted image ${e}`);
                return null; 
            }
    }
