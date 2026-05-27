import { useLocation, useNavigate, useParams } from 'react-router';

export default function Visualizer() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const projectId = params.id ?? '';
  const storedProject = typeof window !== 'undefined'
    ? window.localStorage.getItem(`roomify-project-${projectId}`)
    : null;
  const base64Data = (location.state as { base64Data?: string } | undefined)?.base64Data ?? storedProject;

  if (!/^\d+$/.test(projectId)) {
    return (
      <main className="visualizer">
        <section className="panel" style={{ maxWidth: 520, padding: 24 }}>
          <h2>Invalid project link</h2>
          <p className="note">This visualizer page needs a valid project id to load your upload.</p>
          <button onClick={() => navigate('/')} style={{ marginTop: 12 }}>Back to home</button>
        </section>
      </main>
    );
  }

  if (!base64Data) {
    return (
      <main className="visualizer">
        <section className="panel" style={{ maxWidth: 520, padding: 24 }}>
          <h2>Project data is unavailable</h2>
          <p className="note">The uploaded floor plan could not be found for this project. Please upload again.</p>
          <button onClick={() => navigate('/')} style={{ marginTop: 12 }}>Back to home</button>
        </section>
      </main>
    );
  }

  return (
    <main className="visualizer">
      <header className="topbar">
        <div className="brand">
          <span className="name">Roomify</span>
        </div>
        <button onClick={() => navigate('/')} type="button">Back to home</button>
      </header>

      <section className="panel" style={{ width: '100%', maxWidth: 1080 }}>
        <div className="panel-header">
          <div className="panel-meta">
            <h2>Project preview</h2>
            <p>Project ID: {projectId}</p>
          </div>
          <p className="note">Loaded from the uploaded floor plan for this route.</p>
        </div>

        <div className="render-area" style={{ padding: 24 }}>
          <img
            src={base64Data}
            alt="Uploaded floor plan preview"
            style={{ width: '100%', maxHeight: 420, objectFit: 'contain', borderRadius: 16 }}
          />
        </div>
      </section>
    </main>
  );
}
