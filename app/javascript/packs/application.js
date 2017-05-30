import { BrowserRouter } from 'react-router-dom'
import Layout from '../components/Layout'

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render((
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  ), document.getElementById('react-root'))
})
