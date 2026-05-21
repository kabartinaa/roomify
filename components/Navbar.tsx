import { Box } from "lucide-react"
import Button from "./ui/Button";
import { useOutletContext } from "react-router";


// apply the change to the navbar to show the auth state and buttons to sign in and sign out
export const Navbar = () => {
  const {isSignedIn, userName , signIn , signOut } = useOutletContext<AuthContext>();



  const handleAuthClick = async () => {
    if(isSignedIn){
      try{
          await signOut();
      }
      catch (e){
        console.error(`Puter sign out failed: ${e}`);
      }

      return ;
    }

    try{
        await signIn();
    }
    catch (e){
      console.error(`Puter sign in failed: ${e}`);
    }
    

  }


  return (
    <header className = "Navbar">
      <nav className = "inner">
        <div className = "left">
          <div className = "brand">
            <Box className = "logo"/>  
              <span className ="name"> Roomify</span>
          </div>
          <ul className = "links">
            <a href = "#">Product</a>
            <a href = "#">Pricing</a>
            <a href = "#">Community</a>
            <a href = "#">Enterprise</a>
          </ul>
        </div>
        <div className = "actions">
          {isSignedIn ? (
            <>
            <span className = "greeting ">
                {userName? `hi ${userName}`: 'Signed in'}
            </span>
            <Button  size="sm" onClick={handleAuthClick} className = "btn">
              Log Out
            </Button>
            </>
          ):
          (
            <>
            <Button   onClick={handleAuthClick} size="sm" variant = "ghost">
              Log In
            </Button>
            </>
          )}
          

          <a href = "#upload"className="cta">
            Get Started
          </a>

        </div>
      </nav>
    </header>
  )
}
