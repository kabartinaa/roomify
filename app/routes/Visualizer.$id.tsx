import {  useNavigate, useParams ,useOutletContext } from "react-router";
import Button from "../../components/ui/Button";
import { Box, X , Download , Share2 , RefreshCcw} from "lucide-react"
import { useEffect, useRef, useState } from "react";
import { generate3DView } from "../../lib/ai.action";
import {createProject, getProjectById} from "../../lib/puter.action";
import {ReactCompareSlider, ReactCompareSliderImage} from "react-compare-slider";
//import { getProject } from "../../lib/puter.action"; // assuming this exists
const VisualizerId = () => {
  const{id} = useParams();
  const {userId} = useOutletContext<AuthContext>();
  const navigate = useNavigate();
  //const location = useLocation();
  const params = useParams();
  // const { initialImage, initialRendered, name } = (location.state || {}) as {
  //   initialImage?: string;
  //   initialRendered?: string | null;
  //   name?: string;
  // };


const hasInitialGenerated = useRef(false);  // currently no project loaded once done set to true

const [project, setproject] = useState<DesignItem | null>(null);
const [isProjectLoading, setisProjectLoading] = useState(true)
const [isProcessing , setIsProcessing] = useState(false);
const [errorMessage, setErrorMessage] = useState<string | null>(null);

const[currentImage , setCurrentImage] = useState<string | null> (null);   // get it from backed 

const handleBack = () => {
  navigate("/"); // Navigate back to the home page
}

const handleExport = () => {
  if (!currentImage) return;

  const link = document.createElement("a");
  link.href = currentImage;
  link.download = `roomify-render-${id || "project"}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// process the initial image to generate the 3D view, only if we have an initial image and haven't already processed it
//This function takes a project's source image, 
// generates a 3D-rendered version, 
// updates the project with the generated result, 
// saves it to the backend (worker/KV store), and refreshes the UI with the new image.
const runGeneration = async (item:DesignItem) => {
  if(!id || !item.sourceImage) return; // no image to process

  try{
    setErrorMessage(null);

    // use :
//Showing a loading spinner
//Disabling buttons while work is running
//Displaying "Uploading..." or "Generating..." messages
    setIsProcessing(true);  // loading 


    const result = await generate3DView({ sourceImage : item.sourceImage });

    if(result.renderedImage){
      setCurrentImage(result.renderedImage);   // displayes rendered image on the screen 


      //initial item
    //   item = {
    //     id: "101",
    //     sourceImage: "room.jpg"
    // }

    //updated item 
    // updatedItem = {
    //   id: "101",   sourceImage: "room.jpg",    renderedImage: "3d-room.jpg",   
    // 
    //renderedPath: "/renders/3d-room.jpg",    timestamp: 1749625000,   ownerId: "user123",    isPublic: false}
      
    
    // update the backend with rendered image
      const updatedItem ={
        ...item,
        renderedImage : result.renderedImage,
        renderedPath : result.renderedPath,
        timeStamp : Date.now(),
        ownerId : item.ownerId ?? userId ?? null,
        isPublic : item.isPublic ?? false,
      }

      // save it to create project
      const saved = await createProject ({item: updatedItem , visibility:"private"})
      if(saved)
      {
        setproject(saved);
        setCurrentImage(saved.renderedImage || result.renderedImage);

      }
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
useEffect(() => {
  let isMounted = true;

  const loadProject = async () => {
      if (!id) {
          setisProjectLoading(false);
          return;
      }

      setisProjectLoading(true);

      const fetchedProject = await getProjectById({ id });

      if (!isMounted) return;

      setproject(fetchedProject);
      setCurrentImage(fetchedProject?.renderedImage || null);
      setisProjectLoading(false);
      hasInitialGenerated.current = false;
  };

  loadProject();

  return () => {
      isMounted = false;
  };
}, [id]);

useEffect(() => {
  if (
      isProjectLoading ||
      hasInitialGenerated.current ||
      !project?.sourceImage
  )
      return;

  if (project.renderedImage) {
      setCurrentImage(project.renderedImage);
      hasInitialGenerated.current = true;
      return;
  }

  hasInitialGenerated.current = true;
  void runGeneration(project);
}, [project, isProjectLoading]);


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
              <h2>{project?.name || `Residence ${id}`}</h2>
              <p className ="note">Created By You</p>
            </div>
            <div className = "panel-actions">
              <Button
                size="sm"
                onClick={handleExport}
                className="export"
                disabled={!currentImage}
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
                   {project?.sourceImage && (
                   // <p>Initial image</p>
                    <img src = {project?.sourceImage} alt = "Original"
                    className = "render-feedback" />
                  )} 

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

                )}
              {/* {
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
              } */}

          </div>
          {/* if rendered image present display that else original image */}
        </div>


        <div className="panel compare">
                    <div className="panel-header">
                        <div className="panel-meta">
                            <p>Comparison</p>
                            <h3>Before and After</h3>
                        </div>
                        <div className="hint">Drag to compare</div>
                    </div>

                    <div className="compare-stage">
                        {project?.sourceImage && currentImage ? (
                            <ReactCompareSlider
                                defaultValue={50}
                                style={{ width: '100%', height: 'auto' }}
                                itemOne={
                                    <ReactCompareSliderImage src={project?.sourceImage} alt="before" className="compare-img" />
                                }
                                itemTwo={
                                    <ReactCompareSliderImage
                                        src={currentImage ?? project?.renderedImage ?? undefined}
                                        alt="after"
                                        className="compare-img"
                                    />
                                }
                            />
                        ) : (
                            <div className="compare-fallback">
                                {project?.sourceImage && (
                                    <img src={project.sourceImage} alt="Before" className="compare-img" />
                                )}
                            </div>
                        )}
                    </div>
                </div>
          
      </section>

    </div>
  );
};

export default VisualizerId;