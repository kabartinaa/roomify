import { useLocation, useNavigate, useParams } from "react-router";
import Button from "../../components/ui/Button";
import { Box, X , Download , Share2 , RefreshCcw} from "lucide-react"
import { useEffect, useRef, useState } from "react";
import { generate3DView } from "../../lib/ai.action";
//import { getProject } from "../../lib/puter.action"; // assuming this exists
const VisualizerId = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { initialImage, initialRendered, name } = (location.state || {}) as {
    initialImage?: string;
    initialRendered?: string | null;
    name?: string;
  };


const hasInitialGenerated = useRef(false);  // currently no project loaded once done set to true
const [isProcessing , setIsProcessing] = useState(false);
const [errorMessage, setErrorMessage] = useState<string | null>(null);
// use :
//Showing a loading spinner
//Disabling buttons while work is running
//Displaying "Uploading..." or "Generating..." messages

const[currentImage , setCurrentImage] = useState<string | null>(initialRendered || null);

const handleBack = () => {
  navigate("/"); // Navigate back to the home page
}

// process the initial image to generate the 3D view, only if we have an initial image and haven't already processed it
const runGeneration = async () => {
  if(!initialImage) return; // no image to process

  try{
    setErrorMessage(null);
    setIsProcessing(true);  // loading 
    const result = await generate3DView({ sourceImage : initialImage });

    if(result.renderedImage){
      setCurrentImage(result.renderedImage);
      hasInitialGenerated.current = true;
    }
  }
  catch(error){
    console.error("Error generating 3D view:", error);
    setErrorMessage(
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unable to generate 3D view. Please check your Puter account and try again."
    );
    hasInitialGenerated.current = false;
  }
  finally{
    setIsProcessing(false); // for next upload loading 
  }
}
  

// called first after component call
useEffect(()=>{

  // if img present    initial set to false 
  if(!initialImage || hasInitialGenerated.current) return;

  // if 3d already available 
  if(initialRendered) {
    setCurrentImage(initialRendered);
    hasInitialGenerated.current  = true;
    return;
  }

  runGeneration();
} , [initialImage , initialRendered]
);



  return (
    <div className = "visualizer">
      <nav className = "topbar">
        <div className = "brand">
          <Box className = "logo"/>
          <span className ="name"> Roomify</span>
        </div>
        <Button variant = "ghost" size="sm" onClick={handleBack} className = "exit">
          <X className = "icon"/> Exit Editor
        </Button>
      </nav>

      <section className = "content">
        <div className = "panel">
          <div className ="panel-header">
            <div className ="panel-meta">
              <p>Project</p>
              <h2>{'Untitled Project'}</h2>
              <p className ="note">Created By You</p>
            </div>
            <div className = "panel-actions">
              <Button
                size="sm" 
                onClick = {() => {}}
                className = "export"
                disabled = {!currentImage}
              >
                <Download className = "w-4 h-4 mr-2"/> Export

              </Button>

              <Button
                size="sm" 
                onClick = {() => {}}
                className = "share"
              >
                <Share2 className = "w-4 h-4 mr-2"/>Share

              </Button>
            </div>         
          </div>

          <div className = {`render-area ${isProcessing ? 'is-processing' : ''}`}> 
            {
              currentImage ? (
               
                <img src = {currentImage} alt = "AI Render" className = "render-img"/>
              )
              :
              (
                <div className = "render-placeholder">OI
                  {/* {initialImage && (
                   // <p>Initial image</p>
                    <img src = {initialImage} alt = "Original"
                    className = "render-feedback" />
                  )} */}

                </div>
              )}

              {
                isProcessing && (
                  <div className = "render-overlay">
                    <div className = "rendering-card">
                      <RefreshCcw className = "spinner"/>
                      <span className ="title" > Rendering..</span>
                      <span className ="subtitle" > Generating your 3D visualization..</span>
                    </div>
                  </div>
                )
              }
              {
                errorMessage && (
                  <div className="render-overlay">
                    <div className="rendering-card">
                      <span className="title">Render failed</span>
                      <span className="subtitle">{errorMessage}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={runGeneration}
                        className="mt-4"
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                )
              }

          </div>
          {/* if rendered image present display that else original image */}
        </div>
          
      </section>

    </div>
  );
};

export default VisualizerId;