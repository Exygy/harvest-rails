import PropTypes from 'prop-types'
import { connect } from 'react-refetch'
import { Panel, Table, Grid, Row, Col, Badge } from 'react-bootstrap'
import { getPeriodTitleAndStart, setPeriodData, configureMoment } from '../utils/dateUtils'
import StaffingTableHeader from './StaffingTableHeader'
import { ROLES } from '../utils/constants'

const buildProjectCard = (project) => {
  return (
    <div key={project.id}>
      <Panel>
        <Panel.Heading>
          <Panel.Title componentClass="h3"> <Row>{project.name}</Row></Panel.Title>
          <p><Badge className="margin-left">{project.is_fixed_fee ? 'Fixed Fee' : 'Time and Materials'}</Badge></p>
        </Panel.Heading>
        <Panel.Body>

        </Panel.Body>
      </Panel>
    </div>
  )
}

const Projects = (props, context) => {

  let { projectsFetch } = props
  let data = {}
  let date = props.match.params.date
  let period = props.match.params.period || 'week'
  let projects = []

  if (projectsFetch.fulfilled) {
    console.log(projectsFetch, 'projectsFetch')
    projects = projectsFetch.value.projects

    setPeriodData(projects, date, period)
    var { periodTitle, periodStart } = getPeriodTitleAndStart(date, period)

  // let { person } = props
  // // let percentage = parseFloat(person.total_hours / person.total_forecasted)
  // let timesheets = []
  // person.timesheets.forEach(timesheet => {
  //   let percentage = parseFloat(timesheet.total / timesheet.forecasted)
  //   if (percentage === Infinity) {
  //     percentage = 9.99
  //   }
  //   let pct = `${(percentage * 100).toFixed(2)}%`
  //   timesheets.push(
  //     <div key={timesheet.project_id}>
  //       <div>{timesheet.project} : {timesheet.total.toFixed(2)} billed / {timesheet.forecasted.toFixed(2)} forecasted</div>
  //       <ProgressBar now={percentage * 100} label={pct} />
  //     </div>
  //   )
  // })
  }
  return (
    <div>
      <Grid>
        <Row className="show-grid">
          <Col >
            <h1>Project View</h1>
            <StaffingTableHeader
              title={periodTitle}
              period={period}
              startDate={periodStart}
              router={context.router}
              path={'/projects/search'}
            />
            {projects.map((project) => { return buildProjectCard(project) })}
          </Col>
        </Row>
      </Grid>
    </div>
  )
}

// WeeklyTimesheet.propTypes = {
//   person: PropTypes.object
// }

export default connect(props => {
  let configuredMoment = configureMoment()
  let date = props.match.params.date || configuredMoment().format('YYYY-MM-DD')
  let period = props.match.params.period || 'week'
  return {
    projectsFetch: `/api/v1/projects/search.json?date=${date}&period=${period}`
  }
})(Projects)
