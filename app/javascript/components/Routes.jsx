import { Route } from 'react-router-dom'
import StaffingDataTable from './StaffingDataTable'
import People from './People'
import Projects from './Projects'

const Routes = () => (
  <main>
    <Route exact path='/' component={StaffingDataTable} />
    <Route path='/search/:date/:period' component={StaffingDataTable} />
    <Route path='/people' component={People} />
    <Route path='/people/search/:date/:period' component={People} />
    <Route path='/projects' component={Projects} />
  </main>
)

export default Routes
