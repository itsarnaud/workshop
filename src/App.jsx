import Button from './components/ui/button'
import { Link } from 'react-router-dom'

export default function App() {
  return (
    <div className="space-x-5 flex items-center justify-center">
      <Link to="/login">
        <Button className="cursor-pointer">Créer / continuer une partie</Button>
      </Link>
    </div>
  )
}

