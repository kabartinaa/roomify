PROJECT_PREFIX = "roomify_the_unleashed_architect";

const jsonError = (status, message, extra = {}) => {
    return new Response(JSON.stringify({ error: message, ...extra }), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
};

const getUserId = async (userPuter) => {
    try {
        const user = await userPuter.auth.getUser();
        return user?.uuid || null;
    } catch  {
        return null;
        
    }
}


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

        const userId = await getUserId(userPuter);
        if(!userId) return jsonError(404 , "Authentication failed");


        const body = await request.json(); // request data 

        // 2. get project info
        const project = body?.project;

        if (!project?.id || !project?.sourceImage) {
            return jsonError(400, 'Project data is invalid');
        }

        const payload ={
            ...project , // stores full project properties
            updatedAt: new Date().toISOString(),
        }

        const key = `${PROJECT_PREFIX}${project.id}`; // db key
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

router.get('/api/projects/get', async ({ request, user }) => {
    try {
        const userPuter = user?.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(404, 'Authentication failed');

        const id = new URL(request.url).searchParams.get('id');
        if (!id) return jsonError(400, 'Project id is required');

        const key = `${PROJECT_PREFIX}${id}`;
        const project = await userPuter.kv.get(key);

        if (!project) return jsonError(404, 'Project not found');

        return { project };
    } catch (error) {
        return jsonError(500, 'Failed to get project', {
            message: error?.message || 'Unknown error',
        });
    }
});

