import { Route } from 'react-router-dom'
import StaffingDataTable from './StaffingDataTable'

const Routes = () => (
  <main>
    <Route exact path='/' component={StaffingDataTable} />
    <Route path='/search/:date/:period' component={StaffingDataTable} />
  </main>
)

export default Routes
