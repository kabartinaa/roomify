import puter from "@heyputer/puter.js";
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


