import { useLocation, useParams } from "react-router";
const VisualizerId = () => {
  const location = useLocation();
  const params = useParams();
  const { initialImage, name } = (location.state || {}) as {
    initialImage?: string;
    name?: string;
  };

  return (
    <section>
      <h1>{name || `Project ${params.id ?? ""}`}</h1>
      <div className="visualizer">
        {initialImage ? (
          <div className="image-container">
            <h2>Source Image</h2>
            <img src={initialImage} alt="Source" />
          </div>
        ) : (
          <div className="no-image">
            <p>No source image was provided. Upload a floor plan from the home page to open the visualizer.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default VisualizerId;