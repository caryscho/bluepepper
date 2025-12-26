import './App.css'
import Scene3D from './components/Scene3D'

function App() {
  return (
    <div className="app">
      <header style={{ padding: '1rem', background: '#1a1a1a', color: 'white' }}>
        <h1>3D Warehouse IoT Visualization</h1>
      </header>
      <Scene3D />
    </div>
  )
}

export default App

