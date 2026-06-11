PROJECT_PREFIX = "roomify_the_unleashed_architect";
PUBLIC_PROJECT_PREFIX = "roomify_public_the_unleashed_architect";

const jsonError = (status, message, extra = {}) => {
    return new Response(JSON.stringify({ error: message, ...extra }), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
};

const getCurrentUser = async (userPuter) => {
    try {
        const user = await userPuter.auth.getUser();
        return {
            userId: user?.uuid || null,
            username: user?.username || user?.name || null,
        };
    } catch {
        return { userId: null, username: null };
    }
};

const privateKey = (id) => `${PROJECT_PREFIX}${id}`;
const publicKey = (id) => `${PUBLIC_PROJECT_PREFIX}${id}`;


//This code defines an API endpoint that saves a project 
// into a key-value (KV) database 
// after validating the user and project data.
router.post('/api/projects/save' , async ({request , user }) => {
    // user rpost request has info abbout 
    //{
    //     "project": {
    //       "id": "123",
    //       "name": "My Project",
    //       "sourceImage": "image.png"
    //     }
    //   }
    try{
        //1.  Get User Storage Object and user auth check
        const userPuter = user.puter;   // Get User Storage Object
        if(!userPuter) return jsonError(401, "Authentication failed");

        const { userId } = await getCurrentUser(userPuter);
        if(!userId) return jsonError(404 , "Authentication failed");


        const body = await request.json(); // request data 

        // 2. get project info
        const project = body?.project;

        if (!project?.id || !project?.sourceImage) {
            return jsonError(400, 'Project data is invalid');
        }

        const payload = {
            ...project,
            isPublic: Boolean(body?.visibility === 'public' || project?.isPublic),
            updatedAt: new Date().toISOString(),
        };

        const key = privateKey(project.id);
        await userPuter.kv.set(key , payload);    
        // savesin kv 

        return {saved:true , id:project.id , project:payload}

    }
    catch(e)
    {
        return jsonError(500 , 'Failed to save project ' , {message:e.message || 'Unkown Error'});
    }
    
})


//list all keys starting with a PROJECT_PREFIX from the KV store and 
// returns an object containing an array of those values
router.get('/api/projects/list', async ({ user }) => {
    try {
        const userPuter = user?.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(404, 'Authentication failed');

        const entries = await userPuter.kv.list(`${PROJECT_PREFIX}*`, true);
        const projects = entries
            .map((entry) => entry?.value ?? entry)
            .filter((entry) => entry !== undefined && entry !== null);

        return { projects };
    } catch (error) {
        return jsonError(500, 'Failed to list projects', {
            message: error?.message || 'Unknown error',
        });
    }
});

router.post('/api/projects/share', async ({ request, user }) => {
    try {
        const userPuter = user?.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const { userId, username } = await getCurrentUser(userPuter);
        if (!userId) return jsonError(404, 'Authentication failed');

        const { id } = await request.json();
        if (!id) return jsonError(400, 'Project id is required');

        const privateProject = await userPuter.kv.get(privateKey(id));
        if (!privateProject) return jsonError(404, 'Project not found');

        await userPuter.kv.del(privateKey(id));

        const sharedProject = {
            ...privateProject,
            isPublic: true,
            ownerId: privateProject.ownerId || userId,
            sharedBy: username || privateProject.sharedBy || null,
            sharedAt: new Date().toISOString(),
            userId,
            username,
            originalOwner: privateProject.ownerId || userId,
        };

        await userPuter.kv.set(publicKey(id), sharedProject);

        return { project: sharedProject, shared: true };
    } catch (error) {
        return jsonError(500, 'Failed to share project', {
            message: error?.message || 'Unknown error',
        });
    }
});

router.post('/api/projects/unshare', async ({ request, user }) => {
    try {
        const userPuter = user?.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const { userId } = await getCurrentUser(userPuter);
        if (!userId) return jsonError(404, 'Authentication failed');

        const { id } = await request.json();
        if (!id) return jsonError(400, 'Project id is required');

        const publicProject = await userPuter.kv.get(publicKey(id));
        if (!publicProject) return jsonError(404, 'Project not found');

        await userPuter.kv.del(publicKey(id));

        const restoredProject = {
            ...publicProject,
            isPublic: false,
            ownerId: publicProject.originalOwner || publicProject.ownerId || userId,
            sharedBy: null,
            sharedAt: null,
            userId: undefined,
            username: undefined,
            originalOwner: undefined,
        };

        await userPuter.kv.set(privateKey(id), restoredProject);

        return { project: restoredProject, shared: false };
    } catch (error) {
        return jsonError(500, 'Failed to unshare project', {
            message: error?.message || 'Unknown error',
        });
    }
});

router.get('/api/projects/get', async ({ request, user }) => {
    try {
        const userPuter = user?.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(404, 'Authentication failed');

        const id = new URL(request.url).searchParams.get('id');
        if (!id) return jsonError(400, 'Project id is required');

        const key = privateKey(id);
        const project = await userPuter.kv.get(key);

        if (!project) return jsonError(404, 'Project not found');

        return { project };
    } catch (error) {
        return jsonError(500, 'Failed to get project', {
            message: error?.message || 'Unknown error',
        });
    }
});

//POST /api/projects/share
//POST /api/projects/unshare

router.post('/api/projects/share', async ({request, user}) => {

    try {

        const userPuter = user.puter;

        if(!userPuter)
            return jsonError(401,"Unauthorized");


        const body = await request.json();

        const projectId = body.id;


        const key = `${PROJECT_PREFIX}${projectId}`;


        // 1. Get from private storage
        const project = await userPuter.kv.get(key);


        if(!project)
            return jsonError(404,"Project not found");



        const userId = await getUserId(userPuter);


        // 2. Add metadata
        const publicProject = {
            ...project,

            metadata:{
                userId,
                username:user.username,
                sharedAt:new Date().toISOString(),
                originalOwner:userId
            }
        };



        // 3. Save to public KV
        await publicKV.set(key, publicProject);



        // 4. Remove private copy
        await userPuter.kv.delete(key);



        return {
            shared:true,
            project:publicProject
        };


    } catch(e){

        return jsonError(
            500,
            "Failed to share project"
        );

    }

});

router.post('/api/projects/unshare', async ({request,user})=>{

    try{
    
    
    const userPuter=user.puter;
    
    if(!userPuter)
        return jsonError(401,"Unauthorized");
    
    
    const body=await request.json();
    
    const id=body.id;
    
    
    const key=`${PROJECT_PREFIX}${id}`;
    
    
    
    // 1. Get public project
    
    const publicProject =
        await publicKV.get(key);
    
    
    
    if(!publicProject)
        return jsonError(
            404,
            "Public project not found"
        );
    
    
    
    // 2. Remove metadata
    
    const {
        metadata,
        ...originalProject
    }=publicProject;
    
    
    
    // 3. Restore private project
    
    await userPuter.kv.set(
        key,
        originalProject
    );
    
    
    
    // 4. Delete public copy
    
    await publicKV.delete(key);
    
    
    
    return {
        shared:false,
        project:originalProject
    };
    
    
    
    }
    catch(e){
    
    return jsonError(
    500,
    "Failed to unshare project"
    );
    
    }
    
    
    });
