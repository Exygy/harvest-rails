import PropTypes from 'prop-types'
import { connect } from 'react-refetch'
import { Panel, Table, Grid, Row, Col, Badge } from 'react-bootstrap'
import StaffingTableHeader from './StaffingTableHeader'
import { getPeriodTitleAndStart, setPeriodData, configureMoment } from '../utils/dateUtils'
import { ROLES } from '../utils/constants'
import { map } from 'lodash'

const buildEmployeeCard = (employee) => {
  return (
    <div>
      <Panel key={employee.name}>
        <Panel.Heading>
          <Panel.Title componentClass="h3"> <Row>{employee.name}</Row></Panel.Title>
          <p>Target:{employee.period_capacity}</p>
          {employee.roles.map((role) => {
            return <Badge className="margin-left">{role}</Badge>
          })}
        </Panel.Heading>
        <Panel.Body>
          <Table striped bordered condensed hover>
            <thead>
              <tr>
                <th></th>
                <th>Forecasted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {employee.timesheets.map((project)=> {
                return(
                  <tr>
                    <td key={project.project_id}>{project.project}</td>
                    <td>{project.forecasted} hours</td>
                    <td>{Math.floor((project.forecasted_to_date/project.forecasted)*100)}% forecast to actual</td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </Panel.Body>
      </Panel>
    </div>
  )
}

const People = (props, context) => {

  let { timesheetFetch } = props
  let data = {}
  let date = props.match.params.date
  let period = props.match.params.period || 'week'
  let timesheets = []
  let employees = []

  if (timesheetFetch.fulfilled) {
    console.log(timesheetFetch, 'timesheetFetch')
    employees = timesheetFetch.value.data


    data = timesheetFetch.value.data

    setPeriodData(data, date, period)

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
            <h1>Employee View</h1>
            <StaffingTableHeader
              title={periodTitle}
              period={period}
              startDate={periodStart}
              router={context.router}
            />
            {employees.map((employee) => { return buildEmployeeCard(employee) })}
          </Col>
        </Row>
      </Grid>
    </div>
  )
}

// WeeklyTimesheet.propTypes = {
//   person: PropTypes.object
// }

People.contextTypes = {
  router: PropTypes.object
}

export default connect(props => {
  let configuredMoment = configureMoment()
  let date = props.match.params.date || configuredMoment().format('YYYY-MM-DD')
  let period = props.match.params.period || 'week'
  return {
    timesheetFetch: `/api/v1/timesheets/search.json?date=${date}&period=${period}`
  }
})(People)
