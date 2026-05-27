import { ArrowRight, ArrowUpRight, Clock, Layers } from "lucide-react";
import { Navbar } from "../../components/Navbar";
import type { Route } from "./+types/home";
import Button from "../../components/ui/Button";
//import { Welcome } from "../welcome/welcome";
import { Upload } from "../../components/Upload";
import { useNavigate } from "react-router";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  // tailwind set up 
  const naviagte = useNavigate();
  const handleUploadComplete = (base64Data: string) => {
    const newId = Date.now().toString();
    localStorage.setItem(`roomify-project-${newId}`, base64Data);
    naviagte(`/Visualizer/${newId}`, { state: { base64Data } });
  }
  return (
    <div className="home">
      <Navbar />
      
      <section className="hero">

        <div className = "announce">
          <div className = "dot">
            <div className = "pulse"></div>
          </div>

          <p>Introducing Roomify 2.0</p>
        </div>

        <h1>Build beautiful spaces at the speed of thought with Roomify_</h1>
        <p className = "subtitle">ROOMIFY IS AN AI-FIRST DESIGN ENVIRONMENT THAT HELPS YOU VISUALIZE , RENDER, AND SHIP ARCHITECTURAL PROJECTS FASTER THAN EVER.</p>
        <div className = "actions">
          <a href ="#upload" className = "cta">
            Start Building <ArrowRight className="icon" />
          </a>
          <Button variant="outline" className = "demo">  Watch Demo</Button>
        </div>
        <div id = "upload" className = "upload-shell">
        <div className="grid-overlay"/>


        <div className = "upload-card">
          <div className ="upload-head">
            <div className = "upload-icon">
              <Layers className="icon"/>
            </div>

            <h3>Upload your floor plan</h3>
            <p>Supports JPG , PNG , formats up to 10MB</p>

          </div>

          <Upload onComplete = {handleUploadComplete}
          />
        </div>
        </div>
      
        <section className = "projects">
          <div className = "section-inner">
            <div className = "section-head">
              <div className = "copy">
              <h2>Projects</h2>
              <p>Your latest work , and shared community projects all in one workspace </p>
              </div>
            </div>

            <div className = "projects-grid">
            <div className = "project-card group" >
              <div className ="preview">
                <img src="https://styluxconstruction.com/wp-content/uploads/2023/06/architectural_blueprint_of_a_luxurious_house_plan_featu_33be3418-7f14-4378-a232-a9b1f1ae0043.jpg"
                 />

                 <div className = "badge">
                  <span>Community</span>
                 </div>
              </div>

              <div className ="card-body">
                <div>
                 <h3>Modern Family Home</h3>
                 <div className ="meta">
                    <Clock size={16} />
                    <span>
                      {new Date('05/01/2023').toLocaleDateString()}
                    </span>
                    <span> By Kab </span>

                 </div>
                </div>

                <div className ="arrow">
                  <ArrowUpRight size={20} /> 
                </div>
              </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  )
}
