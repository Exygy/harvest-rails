import { Route } from 'react-router-dom'
import WeekView from './WeekView'

const Routes = () => (
  <main>
    <Route exact path='/' component={WeekView} />
    <Route path='/search/:week' component={WeekView} />
  </main>
)

export default Routes
